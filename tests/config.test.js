'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { normalisePublicUrl, config } = require('../src/config');
const db = require('../src/db');

test('the public address is normalised however it arrives', () => {
  // Render's blueprint supplies a bare hostname.
  assert.equal(normalisePublicUrl('instrument-platform.onrender.com'),
    'https://instrument-platform.onrender.com');
  // A hand-typed value often carries a trailing slash.
  assert.equal(normalisePublicUrl('https://example.com/'), 'https://example.com');
  assert.equal(normalisePublicUrl('  https://example.com//  '), 'https://example.com');
  // Local work stays on http.
  assert.equal(normalisePublicUrl('http://127.0.0.1:3000'), 'http://127.0.0.1:3000');
  // Unset stays unset: the admin page then says so instead of drawing a QR
  // code that leads nowhere.
  assert.equal(normalisePublicUrl(''), '');
  assert.equal(normalisePublicUrl(undefined), '');
});

test('a certificate that cannot be read is explained, not left as an error code', () => {
  const ssl = config.databaseSsl;
  const cert = config.databaseCaCert;
  try {
    config.databaseSsl = 'ca';

    config.databaseCaCert = '';
    assert.throws(() => db.sslConfig(), /DATABASE_CA_CERT is empty/);

    config.databaseCaCert = '/etc/secrets/not-here.crt';
    assert.throws(() => db.sslConfig(), (err) =>
      err.message.includes('/etc/secrets/not-here.crt') &&
      err.message.includes('ENOENT') &&
      err.message.includes('paste the certificate text'));

    config.databaseCaCert = '-----BEGIN CERTIFICATE-----\nabc\n-----END CERTIFICATE-----';
    assert.equal(db.sslConfig().rejectUnauthorized, true);
  } finally {
    config.databaseSsl = ssl;
    config.databaseCaCert = cert;
  }
});

test('verification is never silently switched off', () => {
  const ssl = config.databaseSsl;
  try {
    config.databaseSsl = 'verify';
    assert.deepEqual(db.sslConfig(), { rejectUnauthorized: true });
    config.databaseSsl = 'ca';
    config.databaseCaCert = '-----BEGIN CERTIFICATE-----\nabc\n-----END CERTIFICATE-----';
    assert.equal(db.sslConfig().rejectUnauthorized, true);
  } finally {
    config.databaseSsl = ssl;
  }
});

test('the cohort label is validated at load, like the programme length', () => {
  // The label reaches the database on every row and the delete confirmation
  // phrase is built from it, so it is checked at load rather than discovered
  // when someone cannot type the phrase.
  const load = (value) => {
    const previous = process.env.COHORT;
    delete require.cache[require.resolve('../src/config')];
    if (value === undefined) delete process.env.COHORT;
    else process.env.COHORT = value;
    try {
      return require('../src/config').config.cohort;
    } finally {
      if (previous === undefined) delete process.env.COHORT;
      else process.env.COHORT = previous;
      delete require.cache[require.resolve('../src/config')];
      require('../src/config');
    }
  };

  assert.equal(load('elm'), 'elm');
  assert.equal(load('nupco1'), 'nupco1');
  assert.equal(load('  nupco2  '), 'nupco2');
  // Unset falls back for local work only; production refuses it below.
  assert.equal(load(undefined), 'cohort-1');

  for (const bad of ['ELM', 'nupco 1', 'a', 'nupco_1', 'x'.repeat(41), '-elm']) {
    assert.throws(() => load(bad), /COHORT must be/, 'accepted a bad label: ' + bad);
  }
});

test('production refuses to start without an explicit cohort label', () => {
  // One service per cohort, and a new service is made by copying an existing
  // one. Forgetting this label writes a whole cohort's rows under the other
  // cohort's name, and nothing afterwards can separate them.
  const saved = {
    COHORT: process.env.COHORT,
    DATABASE_URL: process.env.DATABASE_URL,
    ADMIN_SECRET: process.env.ADMIN_SECRET,
    EXPORT_SECRET: process.env.EXPORT_SECRET
  };
  delete require.cache[require.resolve('../src/config')];
  try {
    process.env.DATABASE_URL = 'postgres://example';
    process.env.ADMIN_SECRET = 'a';
    process.env.EXPORT_SECRET = 'b';

    delete process.env.COHORT;
    let mod = require('../src/config');
    assert.throws(() => mod.requireProductionConfig(), /COHORT/);

    process.env.COHORT = '   ';
    delete require.cache[require.resolve('../src/config')];
    mod = require('../src/config');
    assert.throws(() => mod.requireProductionConfig(), /COHORT/);

    process.env.COHORT = 'nupco1';
    delete require.cache[require.resolve('../src/config')];
    mod = require('../src/config');
    assert.doesNotThrow(() => mod.requireProductionConfig());
  } finally {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
    delete require.cache[require.resolve('../src/config')];
    require('../src/config');
  }
});

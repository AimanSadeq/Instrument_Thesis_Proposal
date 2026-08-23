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

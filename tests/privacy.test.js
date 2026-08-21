'use strict';

/**
 * The checks behind the claims in docs/VERIFICATION.md. They look at the
 * schema and at the stored rows, not only at the code, because that is what
 * the build brief asks for.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { db, migrate, truncate, listen, form } = require('./helpers');

let base;
let server;

test.before(async () => {
  await migrate();
  await truncate();
  ({ server, base } = await listen());
});

test.after(async () => {
  server.close();
  await db.close();
});

async function rows(sql) {
  return (await db.query(sql)).rows;
}

test('no column in the schema can hold a time component', async () => {
  const found = await rows(fs.readFileSync(path.join(__dirname, '..', 'db', 'checks', 'no_time_columns.sql'), 'utf8'));
  assert.deepEqual(found, []);
});

test('no column defaults to a clock reading', async () => {
  const found = await rows(fs.readFileSync(path.join(__dirname, '..', 'db', 'checks', 'no_defaults_with_now.sql'), 'utf8'));
  assert.deepEqual(found, []);
});

test('no column is named for an identity, a device, an address or a link', async () => {
  const found = await rows(fs.readFileSync(path.join(__dirname, '..', 'db', 'checks', 'no_identifier_columns.sql'), 'utf8'));
  assert.deepEqual(found, []);
});

test('no foreign key exists at all, so no instrument can be joined to another', async () => {
  const found = await rows(`select conname, conrelid::regclass::text as table_name
    from pg_constraint
    where contype = 'f' and connamespace = 'research'::regnamespace`);
  assert.deepEqual(found, []);
});

test('no table outside the research schema is touched, and none is named for FinPlay', async () => {
  const tables = await rows(`select table_schema, table_name from information_schema.tables
     where table_name ilike '%finplay%'`);
  assert.deepEqual(tables, []);

  const source = readSource();
  for (const [file, text] of source) {
    // The consent text names FinPlay in prose, and the schema checks name the
    // forbidden column patterns in order to search for them.
    if (file.startsWith('src/content/') || file.startsWith('db/checks/')) continue;
    assert.ok(!/finplay/i.test(text), 'FinPlay referenced in ' + file);
  }
});

test('the stored rows contain no time anywhere', async () => {
  await truncate();
  await fetch(base + '/?lang=en', form({ choice: 'agree', lang: 'en' }));
  await fetch(base + '/pre?lang=en', form({ lang: 'en', a1: 'manager', d1: 'Budgeting' }));
  await fetch(base + '/daily?lang=en', form({ lang: 'en', training_day: '4', r1: 'a', r4: 'b' }));
  await fetch(base + '/eval?lang=en', form({ lang: 'en', a1: '5', d1: 'Good' }));

  for (const table of ['consent_responses', 'pre_training_responses', 'daily_reflections', 'post_training_evaluations']) {
    const stored = await rows('select * from research.' + table);
    assert.ok(stored.length > 0, table);
    const asText = JSON.stringify(stored);
    assert.ok(!/\d{2}:\d{2}/.test(asText), 'a time appears in ' + table + ': ' + asText);
    assert.ok(!/T\d{2}/.test(asText), 'an ISO timestamp appears in ' + table);
    for (const row of stored) {
      assert.match(String(row.submission_date), /^\d{4}-\d{2}-\d{2}$/);
    }
  }
});

test('the export files carry no time either', async () => {
  const response = await fetch(base + '/admin/export',
    form({ secret: process.env.EXPORT_SECRET, format: 'json' }));
  const text = await response.text();
  assert.ok(!/\d{2}:\d{2}:\d{2}/.test(text), 'a time appears in the JSON export');
});

function readSource() {
  // What is served to a participant, plus the schema. The tools under
  // scripts/ name the forbidden APIs on purpose, to prove they are unused.
  const roots = ['src', 'public', 'db'];
  const out = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(js|css|sql)$/.test(entry.name)) out.push([full, fs.readFileSync(full, 'utf8')]);
    }
  };
  for (const root of roots) walk(path.join(__dirname, '..', root));
  return out.map(([file, text]) => [path.relative(path.join(__dirname, '..'), file), text]);
}

test('the codebase contains no login, no web storage and no client fingerprinting', async () => {
  // Patterns that would each, on their own, break a commitment in the protocol.
  const forbidden = [
    /localStorage/,
    /sessionStorage/,
    /indexedDB/i,
    /document\.cookie/,
    /res\.cookie|cookie-parser|express-session|set-cookie/i,
    /req\.ip\b/,
    /x-forwarded-for/i,
    /user-agent|useragent|navigator\.userAgent/i,
    /referer|req\.get\(['"]referrer/i,
    /canvas\.toDataURL|AudioContext|screen\.width|navigator\.plugins/,
    /passport|bcrypt|jsonwebtoken|\bsignup\b|\bregister\(/i,
    /google-analytics|gtag\(|googletagmanager|plausible|posthog|mixpanel|sentry/i,
    /morgan|pino-http|express-winston/i
  ];

  for (const [file, text] of readSource()) {
    if (file.startsWith('db/checks/')) continue; // these files name the patterns in order to forbid them
    for (const pattern of forbidden) {
      assert.ok(!pattern.test(text), `${pattern} matched in ${file}`);
    }
  }
});

test('no dependency is a tracker, an auth library or a logger', async () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  assert.deepEqual(Object.keys(pkg.dependencies).sort(), ['express', 'pg', 'qrcode']);
});

test('the response never carries a cookie, an ETag or a client hint request', async () => {
  for (const path of ['/', '/pre', '/daily', '/eval', '/done', '/admin', '/healthz']) {
    const response = await fetch(base + path);
    assert.equal(response.headers.get('set-cookie'), null, path);
    assert.equal(response.headers.get('etag'), null, path);
    assert.equal(response.headers.get('accept-ch'), null, path);
    assert.equal(response.headers.get('referrer-policy'), 'no-referrer', path);
  }
});

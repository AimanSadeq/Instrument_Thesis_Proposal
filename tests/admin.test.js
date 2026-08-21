'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { db, migrate, truncate, listen, form } = require('./helpers');

let base;
let server;

const COUNTS_SECRET = 'counts-only-secret';
const EXPORT_SECRET = 'export-and-delete-secret';

const SECRET_CONTENT = {
  r1: 'A sentence only the researcher may read',
  d1: 'جملة لا يقرأها إلا الباحث'
};

test.before(async () => {
  await migrate();
  await truncate();
  ({ server, base } = await listen());
  await fetch(base + '/?lang=en', form({ choice: 'agree', lang: 'en' }));
  await fetch(base + '/?lang=en', form({ choice: 'decline', lang: 'en' }));
  await fetch(base + '/daily?lang=en', form({ lang: 'en', training_day: '1', r1: SECRET_CONTENT.r1 }));
  await fetch(base + '/pre?lang=ar', form({ lang: 'ar', a1: 'manager', d1: SECRET_CONTENT.d1 }));
  await fetch(base + '/eval?lang=en', form({ lang: 'en', a1: '5', d1: 'Fine' }));
});

test.after(async () => {
  server.close();
  await db.close();
});

test('the admin route is closed without the secret', async () => {
  const page = await fetch(base + '/admin');
  const html = await page.text();
  assert.equal(page.status, 200);
  assert.ok(!html.includes('Totals'));

  const wrong = await fetch(base + '/admin', form({ secret: 'guess' }));
  assert.equal(wrong.status, 401);
});

test('the facilitator secret shows counts and nothing else', async () => {
  const page = await fetch(base + '/admin', form({ secret: COUNTS_SECRET }));
  assert.equal(page.status, 200);
  const html = await page.text();

  assert.match(html, /Consent, agreed<\/td><td>1/);
  assert.match(html, /Consent, declined<\/td><td>1/);
  assert.match(html, /Participation rate<\/td><td>50%/);

  // Contents are unreachable: not on the page, and no control leads to them.
  assert.ok(!html.includes(SECRET_CONTENT.r1));
  assert.ok(!html.includes(SECRET_CONTENT.d1));
  assert.ok(!html.includes('/admin/export'));
  assert.ok(!html.includes('/admin/delete'));
  assert.equal(page.headers.get('cache-control'), 'no-store, max-age=0');
});

test('the facilitator secret cannot export or delete', async () => {
  const exported = await fetch(base + '/admin/export', form({ secret: COUNTS_SECRET, format: 'json' }));
  assert.equal(exported.status, 403);
  assert.ok(!(await exported.text()).includes(SECRET_CONTENT.r1));

  const deleted = await fetch(base + '/admin/delete',
    form({ secret: COUNTS_SECRET, confirm: 'DELETE ALL RESEARCH DATA' }));
  assert.equal(deleted.status, 403);
  assert.equal((await db.query('select count(*)::int as n from research.daily_reflections')).rows[0].n, 1);
});

test('the researcher secret exports complete JSON with row counts', async () => {
  const response = await fetch(base + '/admin/export', form({ secret: EXPORT_SECRET, format: 'json' }));
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-disposition'), /attachment; filename="test-cohort_all_instruments_\d{4}-\d{2}-\d{2}\.json"/);

  const payload = JSON.parse(await response.text());
  assert.deepEqual(payload.export.rowCounts, {
    consent_responses: 2,
    pre_training_responses: 1,
    daily_reflections: 1,
    post_training_evaluations: 1
  });
  // The counts inside the export match the counts the admin view shows, which
  // is how completeness is checked before deletion.
  assert.equal(payload.export.adminCounts.consent, 2);
  assert.equal(payload.tables.daily_reflections[0].r1, SECRET_CONTENT.r1);
  assert.equal(payload.tables.pre_training_responses[0].d1, SECRET_CONTENT.d1);
});

test('CSV export is complete, quoted correctly and readable as Arabic', async () => {
  const response = await fetch(base + '/admin/export',
    form({ secret: EXPORT_SECRET, format: 'csv', table: 'pre_training_responses' }));
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-disposition'), /_1rows\.csv"$/);

  // fetch() strips a leading byte order mark when it decodes, so check the bytes.
  const bytes = new Uint8Array(await response.arrayBuffer());
  assert.deepEqual(Array.from(bytes.slice(0, 3)), [0xEF, 0xBB, 0xBF],
    'a byte order mark, so Excel reads the Arabic');
  const text = new TextDecoder('utf-8').decode(bytes).replace(/^\ufeff/, '');
  const lines = text.trim().split('\r\n');
  assert.equal(lines.length, 2);
  assert.equal(lines[0], 'id,cohort,submission_date,a1,a2,b1,b2,b3,c1,c2,d1');
  assert.ok(lines[1].includes(SECRET_CONTENT.d1));
});

test('a CSV field containing a comma, a quote or a newline survives the round trip', async () => {
  await fetch(base + '/daily?lang=en', form({
    lang: 'en', training_day: '2', r1: 'He said "ratios, margins"\nand then left'
  }));
  const response = await fetch(base + '/admin/export',
    form({ secret: EXPORT_SECRET, format: 'csv', table: 'daily_reflections' }));
  const text = await response.text();
  assert.ok(text.includes('"He said ""ratios, margins""\nand then left"'));
  await db.query("delete from research.daily_reflections where training_day = 2");
});

test('deletion needs the exact confirmation phrase', async () => {
  const response = await fetch(base + '/admin/delete', form({ secret: EXPORT_SECRET, confirm: 'delete' }));
  assert.equal(response.status, 200);
  assert.match(await response.text(), /Nothing was deleted/);
  assert.equal((await db.query('select count(*)::int as n from research.consent_responses')).rows[0].n, 2);
});

test('deletion empties every table and reports the counts before and after', async () => {
  const response = await fetch(base + '/admin/delete',
    form({ secret: EXPORT_SECRET, confirm: 'DELETE ALL RESEARCH DATA' }));
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Deletion complete/);

  for (const table of ['consent_responses', 'pre_training_responses', 'daily_reflections', 'post_training_evaluations']) {
    const n = (await db.query('select count(*)::int as n from research.' + table)).rows[0].n;
    assert.equal(n, 0, table + ' still holds rows');
  }
});

test('repeated wrong secrets lock the admin route rather than allowing a guessing run', async () => {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    await fetch(base + '/admin', form({ secret: 'attempt-' + attempt }));
  }
  const locked = await fetch(base + '/admin', form({ secret: COUNTS_SECRET }));
  assert.equal(locked.status, 429);
  assert.match(await locked.text(), /Too many failed attempts/);
});

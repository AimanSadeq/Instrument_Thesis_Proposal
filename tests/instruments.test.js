'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
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

test('every screen renders in both languages, right to left in Arabic', async () => {
  for (const path of ['/', '/pre', '/daily', '/eval', '/done?i=eval']) {
    const en = await fetch(base + path + (path.includes('?') ? '&' : '?') + 'lang=en');
    const ar = await fetch(base + path + (path.includes('?') ? '&' : '?') + 'lang=ar');
    assert.equal(en.status, 200, path);
    assert.equal(ar.status, 200, path);

    const enHtml = await en.text();
    const arHtml = await ar.text();
    assert.match(enHtml, /<html lang="en" dir="ltr">/, path);
    assert.match(arHtml, /<html lang="ar" dir="rtl">/, path);
    // The toggle is on every screen, and points the other way.
    assert.match(enHtml, /class="lang-toggle" href="[^"]*lang=ar"/, path);
    assert.match(arHtml, /class="lang-toggle" href="[^"]*lang=en"/, path);
  }
});

test('no cookie, no web storage, no device identifier reaches the browser', async () => {
  for (const path of ['/', '/pre', '/daily', '/eval', '/styles.css', '/app.js']) {
    const response = await fetch(base + path);
    assert.equal(response.headers.get('set-cookie'), null, 'Set-Cookie on ' + path);
    assert.equal(response.headers.get('etag'), null, 'ETag on ' + path);
    const body = await response.text();
    for (const forbidden of ['localStorage', 'sessionStorage', 'document.cookie', 'indexedDB', 'navigator.userAgent']) {
      assert.ok(!body.includes(forbidden), forbidden + ' present in ' + path);
    }
  }
});

test('consent: two options, neither pre-selected, both submitting to the same place', async () => {
  const html = await (await fetch(base + '/?lang=en')).text();
  const buttons = html.match(/<button type="submit" class="btn choice" name="choice" value="[a-z]+">/g);
  assert.equal(buttons.length, 2);
  // Identical class list, so identical size, weight and colour.
  assert.equal(buttons[0].replace(/value="[a-z]+"/, ''), buttons[1].replace(/value="[a-z]+"/, ''));
  assert.ok(!html.includes('checked'), 'nothing is pre-selected');
  assert.ok(!/class="btn choice primary/.test(html), 'neither option is styled as primary');
});

test('consent: agreeing and declining are indistinguishable to an observer', async () => {
  const agree = await fetch(base + '/?lang=en', form({ choice: 'agree', lang: 'en' }));
  const decline = await fetch(base + '/?lang=en', form({ choice: 'decline', lang: 'en' }));
  assert.equal(agree.status, 303);
  assert.equal(decline.status, 303);
  assert.equal(agree.headers.get('location'), decline.headers.get('location'));

  const confirmation = await (await fetch(base + agree.headers.get('location'))).text();
  const other = await (await fetch(base + decline.headers.get('location'))).text();
  assert.equal(confirmation, other, 'the confirmation screen must be byte identical');
  assert.ok(!/agree|decline/i.test(confirmation), 'the confirmation screen must not name the choice');

  const rows = await db.query('select choice from research.consent_responses order by choice');
  assert.deepEqual(rows.rows.map((r) => r.choice), ['agree', 'decline']);
});

test('a decline is stored as a bare count, with the same shape as an agreement', async () => {
  const rows = await db.query('select * from research.consent_responses');
  for (const row of rows.rows) {
    assert.deepEqual(Object.keys(row).sort(), ['choice', 'cohort', 'id', 'submission_date']);
  }
});

test('two submissions from one device are indistinguishable from two devices', async () => {
  await truncate();
  const payload = { lang: 'en', training_day: '1', r1: 'same', r2: 'same', r3: 'same' };
  // Same connection, same headers, twice.
  await fetch(base + '/daily?lang=en', form(payload));
  await fetch(base + '/daily?lang=en', form(payload));
  // A different "device": a different user agent and language.
  const third = form(payload);
  third.headers['User-Agent'] = 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36';
  third.headers['Accept-Language'] = 'ar-SA,ar;q=0.9';
  await fetch(base + '/daily?lang=en', third);

  const rows = (await db.query('select * from research.daily_reflections')).rows;
  assert.equal(rows.length, 3);
  const withoutId = rows.map((r) => JSON.stringify({ ...r, id: null }));
  assert.equal(new Set(withoutId).size, 1, 'rows differ only by their random primary key');
  const ids = new Set(rows.map((r) => r.id));
  assert.equal(ids.size, 3, 'primary keys are unique and random');
});

test('pre-training questionnaire stores option codes, not the localised label', async () => {
  await truncate();
  await fetch(base + '/pre?lang=ar', form({
    lang: 'ar', a1: 'manager', a2: '11_to_20', b1: 'moderate', b2: 'yes',
    b3: 'دورة محاسبة قصيرة', c1: 'no', c2: 'comfortable', d1: 'فهم القوائم المالية'
  }));
  const row = (await db.query('select * from research.pre_training_responses')).rows[0];
  assert.equal(row.a1, 'manager');
  assert.equal(row.b3, 'دورة محاسبة قصيرة');
  assert.ok(!Object.keys(row).includes('language'), 'the language used is not recorded');
});

test('R4 is stored on day 4 and dropped on every other day', async () => {
  await truncate();
  await fetch(base + '/daily?lang=en', form({ lang: 'en', training_day: '2', r1: 'a', r4: 'should not be stored' }));
  await fetch(base + '/daily?lang=en', form({ lang: 'en', training_day: '4', r1: 'b', r4: 'stored' }));
  const rows = (await db.query('select training_day, r4 from research.daily_reflections order by training_day')).rows;
  assert.deepEqual(rows, [{ training_day: 2, r4: null }, { training_day: 4, r4: 'stored' }]);
});

test('the day is taken from the participant, never from the date', async () => {
  await truncate();
  await fetch(base + '/daily?lang=en', form({ lang: 'en', training_day: '3', r1: 'x' }));
  const row = (await db.query('select training_day, submission_date from research.daily_reflections')).rows[0];
  assert.equal(row.training_day, 3);
  assert.equal(row.submission_date, db.todayInZone());
});

test('a submission with no day is refused, clearly', async () => {
  const response = await fetch(base + '/daily?lang=ar', form({ lang: 'ar', r1: 'x' }));
  assert.equal(response.status, 400);
  const html = await response.text();
  assert.match(html, /يرجى اختيار اليوم/);
  assert.match(html, /لم يتم إرسال إجاباتك/);
  // The answers already typed are still on the page.
  assert.match(html, />x<\/textarea>/);
});

test('a value that is not one of the offered options is refused, not stored', async () => {
  await truncate();
  const response = await fetch(base + '/pre?lang=en', form({ lang: 'en', a1: 'chief_financial_officer' }));
  assert.equal(response.status, 400);
  assert.equal((await db.query('select count(*)::int as n from research.pre_training_responses')).rows[0].n, 0);
});

test('an unexpected extra field cannot become a hidden identifier', async () => {
  await truncate();
  await fetch(base + '/daily?lang=en', form({
    lang: 'en', training_day: '1', r1: 'ok', employee_number: '44812', device_id: 'abc-123'
  }));
  const row = (await db.query('select * from research.daily_reflections')).rows[0];
  assert.deepEqual(Object.keys(row).sort(),
    ['cohort', 'id', 'r1', 'r2', 'r3', 'r4', 'submission_date', 'training_day']);
  assert.ok(!JSON.stringify(row).includes('44812'));
});

test('the post-training evaluation stores the Likert scale as numbers 1 to 5', async () => {
  await truncate();
  const answers = { lang: 'ar' };
  for (const id of ['a1', 'a2', 'a3', 'a4', 'a5', 'b1', 'b2', 'b3', 'b4', 'b5', 'c1', 'c2', 'c3', 'c4']) {
    answers[id] = '4';
  }
  answers.d1 = 'المحاكاة';
  await fetch(base + '/eval?lang=ar', form(answers));
  const row = (await db.query('select * from research.post_training_evaluations')).rows[0];
  assert.equal(row.a1, 4);
  assert.equal(row.c4, 4);
  assert.equal(row.d1, 'المحاكاة');
  assert.equal(row.d4, null);
});

test('an over-long answer is refused with a message, not truncated silently', async () => {
  await truncate();
  const response = await fetch(base + '/daily?lang=en',
    form({ lang: 'en', training_day: '1', r1: 'x'.repeat(5001) }));
  assert.equal(response.status, 400);
  assert.equal((await db.query('select count(*)::int as n from research.daily_reflections')).rows[0].n, 0);
});

test('an asynchronous submission reports success and failure explicitly', async () => {
  await truncate();
  const ok = await fetch(base + '/daily?lang=en', {
    ...form({ lang: 'en', training_day: '1', r1: 'x' }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'X-Instrument-Async': '1'
    }
  });
  assert.deepEqual(await ok.json(), { ok: true, redirect: '/done?i=daily&lang=en' });

  const bad = await fetch(base + '/daily?lang=en', {
    ...form({ lang: 'en', r1: 'x' }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'X-Instrument-Async': '1'
    }
  });
  assert.equal(bad.status, 400);
  const payload = await bad.json();
  assert.equal(payload.ok, false);
  assert.ok(payload.message.length > 0);
  assert.ok(payload.errors.training_day.length > 0);
});

test('the confirmation page after the evaluation carries the closing line', async () => {
  const html = await (await fetch(base + '/done?i=eval&lang=en')).text();
  assert.match(html, /Thank you for your time and your thoughtful responses\./);
});

test('a failure at our end does not masquerade as a mistyped address', async () => {
  const { serverErrorPage, notFoundPage } = require('../src/render/pages');
  for (const lang of ['en', 'ar']) {
    const failure = serverErrorPage({ lang });
    const missing = notFoundPage({ lang });
    assert.notEqual(failure, missing);
    assert.ok(!failure.includes('Page not found'));
    assert.ok(!failure.includes('الصفحة غير موجودة'));
    // It says nothing about why, because the reason belongs in the log.
    assert.ok(!/database|postgres|supabase|ECONN/i.test(failure));
  }
  assert.match(serverErrorPage({ lang: 'en' }), /nothing was recorded/);
  assert.match(serverErrorPage({ lang: 'ar' }), /لم يتم تسجيل أي شيء/);
});

test('an unknown page is a plain not-found, in the chosen language', async () => {
  const response = await fetch(base + '/finplay?lang=ar');
  assert.equal(response.status, 404);
  assert.match(await response.text(), /الصفحة غير موجودة/);
});

'use strict';

/**
 * The programme is not always four days.
 *
 * Research Instruments v2.0 is written for four days, and until this was
 * fixed the four was hard-coded: in the wording, in the day selector, in the
 * rule that decides where the cross-programme question R4 belongs, and in the
 * database. A three-day room could not answer R4 at all, because the schema
 * would have rejected the row.
 *
 * These tests run the whole application at three days. The day count is set
 * before ./helpers is required, because configuration is read once, at load.
 */

process.env.PROGRAMME_DAYS = '3';

const test = require('node:test');
const assert = require('node:assert/strict');
const { db, migrate, truncate, listen, form } = require('./helpers');
const content = require('../src/content/instruments');

const DAYS = 3;
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

// --- The wording ---------------------------------------------------------------

test('a shorter programme differs from the canonical wording only in the day words', () => {
  const canonical = content.withProgrammeDays(content.CANONICAL_DAYS);
  const short = content.withProgrammeDays(DAYS);

  // Every string, paired by its position in the tree.
  const flatten = (value, path, into) => {
    if (typeof value === 'string') into.set(path, value);
    else if (Array.isArray(value)) value.forEach((v, i) => flatten(v, `${path}[${i}]`, into));
    else if (value && typeof value === 'object') {
      for (const key of Object.keys(value)) flatten(value[key], `${path}.${key}`, into);
    }
    return into;
  };

  const a = flatten(canonical, '', new Map());
  const b = flatten(short, '', new Map());

  // The day selector loses its fourth option, and that is the only structural
  // difference the two trees are allowed to have.
  const onlyInCanonical = [...a.keys()].filter((k) => !b.has(k));
  assert.deepEqual(onlyInCanonical.sort(), [
    '.DAILY_REFLECTION.daySelector.options[3].ar',
    '.DAILY_REFLECTION.daySelector.options[3].en',
    '.DAILY_REFLECTION.daySelector.options[3].value'
  ]);
  assert.deepEqual([...b.keys()].filter((k) => !a.has(k)), []);

  // Everything else is either identical, or differs only by substituting a
  // day word. Nothing else in the participant's text may move.
  const dayWords = [
    ['four-day', 'three-day'], ['Day 4', 'Day 3'], ['Days 1 to 4', 'Days 1 to 3'],
    ['أربعة أيام', 'ثلاثة أيام'], ['الرابع', 'الثالث'], ['إلى ٤', 'إلى ٣']
  ];
  const changed = [];
  for (const [path, before] of a) {
    if (!b.has(path)) continue;                 // the dropped fourth option
    const after = b.get(path);
    if (after === before) continue;
    let rebuilt = before;
    for (const [from, to] of dayWords) rebuilt = rebuilt.split(from).join(to);
    assert.equal(after, rebuilt, `${path} changed by something other than the day words`);
    changed.push(path);
  }

  // And the substitution must actually have happened somewhere in both
  // languages, or this test would pass on a build that changed nothing.
  assert.ok(changed.some((p) => p.endsWith('.en')), 'no English string changed');
  assert.ok(changed.some((p) => p.endsWith('.ar')), 'no Arabic string changed');
});

test('the number of instruments is not the number of days', () => {
  const short = content.withProgrammeDays(DAYS);
  const asked = short.CONSENT.blocks.find((b) => typeof b.en === 'string' && b.en.includes('-day programme'));
  // "four short activities" counts the instruments, and there are still four.
  assert.match(asked.en, /four short activities/);
  assert.match(asked.en, /During this three-day programme/);
  assert.match(asked.ar, /أربعة أنشطة قصيرة/);
  assert.match(asked.ar, /ثلاثة أيام/);
});

test('an unsupported programme length is refused rather than guessed at', () => {
  assert.throws(() => content.withProgrammeDays(9), /unsupported day count/);
});

// --- The screens ---------------------------------------------------------------

test('the daily reflection offers one option per training day and no more', async () => {
  const html = await (await fetch(base + '/daily?lang=en')).text();
  for (const day of [1, 2, 3]) {
    assert.match(html, new RegExp(`value="${day}"`), `Day ${day} missing`);
  }
  assert.doesNotMatch(html, /value="4"/, 'a fourth day is offered in a three-day programme');
  assert.match(html, /Day 3 only:/);
  assert.doesNotMatch(html, /Day 4 only:/);
  assert.match(html, /data-final-day="3"/);
});

test('the Arabic screens name the third day, not the fourth', async () => {
  const daily = await (await fetch(base + '/daily?lang=ar')).text();
  assert.match(daily, /اليوم الثالث فقط/);
  assert.doesNotMatch(daily, /اليوم الرابع/);
});

// The timing notes are instructions to whoever administers the instrument, so
// they are deliberately not rendered on screen (see the note at the head of
// src/render/pages.js). They still have to name the right day: they are what
// the run sheet and the printed pack are written from.
test('the administrative timing note names the last day of this programme', () => {
  const short = content.withProgrammeDays(DAYS);
  assert.equal(short.POST_TRAINING.note.en, 'End of Day 3, after all training activities. About ten minutes.');
  assert.match(short.POST_TRAINING.note.ar, /نهاية اليوم الثالث/);
});

// --- What is stored --------------------------------------------------------------

test('the cross-programme question is stored on the last day, not on day four', async () => {
  await truncate();
  await fetch(base + '/daily?lang=en', form({ lang: 'en', training_day: '2', r1: 'a', r4: 'too early' }));
  await fetch(base + '/daily?lang=en', form({ lang: 'en', training_day: '3', r1: 'b', r4: 'stored' }));

  const rows = (await db.query(
    'select training_day, programme_days, r4 from research.daily_reflections order by training_day'
  )).rows;
  assert.deepEqual(rows, [
    { training_day: 2, programme_days: 3, r4: null },
    { training_day: 3, programme_days: 3, r4: 'stored' }
  ]);
});

test('a fourth day is refused outright in a three-day programme', async () => {
  await truncate();
  const response = await fetch(base + '/daily?lang=en', form({ lang: 'en', training_day: '4', r1: 'a' }));
  assert.equal(response.status, 400);
  assert.equal((await db.query('select count(*)::int as n from research.daily_reflections')).rows[0].n, 0);
});

test('the schema refuses R4 on any day but the last, whatever the application does', async () => {
  await truncate();
  await assert.rejects(
    db.query(`insert into research.daily_reflections (cohort, submission_date, programme_days, training_day, r4)
              values ('test-cohort', current_date, 3, 2, 'should not be possible')`),
    /r4_is_final_day_only/
  );
  await assert.rejects(
    db.query(`insert into research.daily_reflections (cohort, submission_date, programme_days, training_day)
              values ('test-cohort', current_date, 3, 4)`),
    /training_day_within_programme/
  );
});

test('the day count reaches the export, because a count cannot be read without it', async () => {
  await truncate();
  await fetch(base + '/daily?lang=en', form({ lang: 'en', training_day: '1', r1: 'a' }));
  const rows = await db.exportTable('daily_reflections');
  assert.ok(Object.prototype.hasOwnProperty.call(rows.rows[0], 'programme_days'));
  assert.equal(rows.rows[0].programme_days, 3);
});

'use strict';

/**
 * One database, more than one cohort.
 *
 * The September cohorts overlap: a four-day programme and a three-day
 * programme start on the same morning, each served by its own instance. The
 * October cohort follows on the same infrastructure. So rows belonging to
 * different cohorts sit in the same four tables, and every read and every
 * delete a service performs has to be scoped to its own.
 *
 * The delete is the one that matters. It is irreversible, it is what the
 * protocol requires once an export is verified, and unscoped it would destroy
 * another cohort's source records. There is no second chance at a day of
 * collection.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { db, migrate, truncate, listen, form } = require('./helpers');

const MINE = 'test-cohort';      // what helpers.js configures this service as
const THEIRS = 'other-cohort';   // a cohort running at the same time

let base;
let server;

/** Plant one row per table for a cohort this service does not serve. */
async function plantOtherCohort() {
  await db.query(
    `insert into research.consent_responses (cohort, submission_date, choice)
     values ($1, current_date, 'agree')`, [THEIRS]);
  await db.query(
    `insert into research.pre_training_responses (cohort, submission_date, d1)
     values ($1, current_date, 'theirs')`, [THEIRS]);
  await db.query(
    `insert into research.daily_reflections (cohort, submission_date, programme_days, training_day, r1)
     values ($1, current_date, 4, 1, 'theirs')`, [THEIRS]);
  await db.query(
    `insert into research.post_training_evaluations (cohort, submission_date, d1)
     values ($1, current_date, 'theirs')`, [THEIRS]);
}

const countIn = async (table, cohort) => (await db.query(
  `select count(*)::int as n from research.${table} where cohort = $1`, [cohort])).rows[0].n;

test.before(async () => {
  await migrate();
  await truncate();
  ({ server, base } = await listen());
});

test.after(async () => {
  server.close();
  await db.close();
});

test('every export query is scoped to a cohort, in its text and not only by habit', () => {
  for (const [name, sql] of Object.entries(db.EXPORT_QUERIES)) {
    assert.match(sql, /where cohort = \$1/, `${name} is not scoped to a cohort`);
  }
});

test('the counts a facilitator sees are their own room, not the one next door', async () => {
  await truncate();
  await plantOtherCohort();
  await fetch(base + '/?lang=en', form({ lang: 'en', choice: 'agree' }));

  const counts = await db.counts();
  assert.equal(counts.cohort, MINE);
  assert.equal(counts.totals.consent, 1, 'the other cohort leaked into the consent count');
  assert.equal(counts.totals.pre, 0);
  assert.equal(counts.totals.daily, 0);
  assert.equal(counts.totals.eval, 0);

  // And through the admin page the facilitator actually uses.
  const page = await (await fetch(base + '/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'secret=counts-only-secret'
  })).text();
  assert.doesNotMatch(page, /other-cohort/);
});

test('an export carries this cohort and no other', async () => {
  await truncate();
  await plantOtherCohort();
  await fetch(base + '/daily?lang=en', form({ lang: 'en', training_day: '1', r1: 'mine' }));

  const daily = await db.exportTable('daily_reflections');
  assert.equal(daily.rowCount, 1);
  assert.equal(daily.rows[0].cohort, MINE);
  assert.equal(daily.rows[0].r1, 'mine');

  const all = await db.exportAll();
  for (const [name, table] of Object.entries(all)) {
    for (const row of table.rows) {
      assert.equal(row.cohort, MINE, `${name} exported a row belonging to ${row.cohort}`);
    }
  }
});

test('deleting after an export destroys this cohort only, and leaves the other intact', async () => {
  await truncate();
  await plantOtherCohort();
  await fetch(base + '/?lang=en', form({ lang: 'en', choice: 'agree' }));
  await fetch(base + '/daily?lang=en', form({ lang: 'en', training_day: '1', r1: 'mine' }));

  const result = await db.deleteAll();
  assert.equal(result.cohort, MINE);
  assert.equal(result.before.consent_responses, 1);
  assert.equal(result.after.consent_responses, 0);

  for (const table of ['consent_responses', 'pre_training_responses',
    'daily_reflections', 'post_training_evaluations']) {
    assert.equal(await countIn(table, MINE), 0, `${table}: this cohort was not deleted`);
    assert.equal(await countIn(table, THEIRS), 1,
      `${table}: the other cohort's source records were destroyed`);
  }
});

test('the researcher endpoint deletes no more than the library function does', async () => {
  await truncate();
  await plantOtherCohort();
  await fetch(base + '/?lang=en', form({ lang: 'en', choice: 'decline' }));

  const response = await fetch(base + '/admin/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'secret=export-and-delete-secret&confirm=' + encodeURIComponent('DELETE ' + MINE)
  });
  assert.equal(response.status, 200);

  assert.equal(await countIn('consent_responses', MINE), 0);
  assert.equal(await countIn('consent_responses', THEIRS), 1,
    'the delete endpoint reached another cohort');
});

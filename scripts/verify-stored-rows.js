'use strict';

/**
 * Print what is actually stored, so that the anonymity claims can be checked
 * against rows rather than against code. Run this against the live database
 * after the first day of collection.
 *
 * Usage: DATABASE_URL=... node scripts/verify-stored-rows.js [rows-per-table]
 */

const db = require('../src/db');

const TABLES = [
  'consent_responses',
  'pre_training_responses',
  'daily_reflections',
  'post_training_evaluations'
];

const EXPECTED_COLUMNS = {
  consent_responses: ['choice', 'cohort', 'id', 'submission_date'],
  pre_training_responses: ['a1', 'a2', 'b1', 'b2', 'b3', 'c1', 'c2', 'cohort', 'd1', 'id', 'submission_date'],
  daily_reflections: ['cohort', 'id', 'programme_days', 'r1', 'r2', 'r3', 'r4', 'submission_date', 'training_day'],
  post_training_evaluations: [
    'a1', 'a2', 'a3', 'a4', 'a5', 'b1', 'b2', 'b3', 'b4', 'b5',
    'c1', 'c2', 'c3', 'c4', 'cohort', 'd1', 'd2', 'd3', 'd4', 'id', 'submission_date'
  ]
};

let failures = 0;

function check(ok, label) {
  if (!ok) failures += 1;
  console.log(`${ok ? 'pass' : 'FAIL'}  ${label}`);
}

async function main() {
  const limit = Number(process.argv[2] || 3);

  for (const table of TABLES) {
    const result = await db.query(`select * from research.${table} order by id limit ${limit}`);
    const total = await db.query(`select count(*)::int as n from research.${table}`);
    console.log(`\n=== research.${table} (${total.rows[0].n} rows, showing ${result.rowCount})`);
    console.log(JSON.stringify(result.rows, null, 2));

    if (result.rowCount === 0) {
      console.log('(no rows yet, nothing to inspect)');
      continue;
    }

    const columns = Object.keys(result.rows[0]).sort();
    check(JSON.stringify(columns) === JSON.stringify(EXPECTED_COLUMNS[table]),
      `${table}: columns are exactly ${EXPECTED_COLUMNS[table].join(', ')}`);

    const asText = JSON.stringify(result.rows);
    check(!/\d{2}:\d{2}/.test(asText), `${table}: no time of day in any value`);
    check(!/T\d{2}/.test(asText), `${table}: no ISO timestamp in any value`);
    check(result.rows.every((r) => /^\d{4}-\d{2}-\d{2}$/.test(String(r.submission_date))),
      `${table}: submission_date is a plain calendar date`);
    check(!/\b\d{1,3}(\.\d{1,3}){3}\b/.test(asText), `${table}: no IP address in any value`);
    check(!/Mozilla|AppleWebKit|Android|iPhone OS/i.test(asText), `${table}: no user agent in any value`);
  }

  console.log(`\n${failures === 0 ? 'All row checks passed.' : failures + ' row check(s) FAILED.'}`);
  await db.close();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (err) => {
  console.error('inspection could not run:', err.message);
  await db.close().catch(() => {});
  process.exit(2);
});

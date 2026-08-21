'use strict';

const fs = require('fs');
const { Pool, types } = require('pg');
const { config } = require('./config');

// Return DATE columns as the plain 'YYYY-MM-DD' string they are. The driver
// would otherwise build a JavaScript Date, which carries a time and a zone
// offset and would put both into the export files.
types.setTypeParser(1082, (value) => value);

/**
 * Database access. Every statement here is schema-qualified against
 * `research`, and every insert is a single independent row.
 *
 * There is no participant key, no upsert, no join between instruments and no
 * clock reading. `submission_date` is passed in from the application as a
 * calendar date computed in the collection timezone; the database is never
 * asked for now().
 */

function sslConfig() {
  if (config.databaseSsl === 'disable') return false;
  if (config.databaseSsl === 'ca') {
    const ca = config.databaseCaCert.startsWith('-----BEGIN')
      ? config.databaseCaCert
      : fs.readFileSync(config.databaseCaCert, 'utf8');
    return { ca, rejectUnauthorized: true };
  }
  return { rejectUnauthorized: true };
}

let pool = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: sslConfig(),
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 8000,
      statement_timeout: 10000,
      // Postgres records the application name in its own logs. A fixed
      // string is used so that nothing about the client ever reaches them.
      application_name: 'instrument-platform'
    });
    // Never log the query text or its parameters: parameters are response
    // contents, and the facilitator must not be able to read them (brief s6).
    pool.on('error', (err) => {
      console.error('[db] idle client error:', err.code || err.name || 'error');
    });
  }
  return pool;
}

async function query(text, params) {
  return getPool().query(text, params);
}

/**
 * The calendar date in the collection timezone. Date only: no hour, no
 * minute, no second, and never the client's clock.
 */
function todayInZone(timezone = config.timezone, now = new Date()) {
  // 'en-CA' formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now);
}

const INSERTS = {
  consent: {
    table: 'research.consent_responses',
    columns: ['choice']
  },
  pre: {
    table: 'research.pre_training_responses',
    columns: ['a1', 'a2', 'b1', 'b2', 'b3', 'c1', 'c2', 'd1']
  },
  daily: {
    table: 'research.daily_reflections',
    columns: ['training_day', 'r1', 'r2', 'r3', 'r4']
  },
  eval: {
    table: 'research.post_training_evaluations',
    columns: [
      'a1', 'a2', 'a3', 'a4', 'a5',
      'b1', 'b2', 'b3', 'b4', 'b5',
      'c1', 'c2', 'c3', 'c4',
      'd1', 'd2', 'd3', 'd4'
    ]
  }
};

/**
 * Insert one submission. Returns nothing: there is no receipt, no reference
 * number and no row id handed back to the device, because any of those could
 * be written down and used to link a person to a row.
 */
async function insertSubmission(instrument, values) {
  const spec = INSERTS[instrument];
  if (!spec) throw new Error('Unknown instrument: ' + instrument);

  const columns = ['cohort', 'submission_date', ...spec.columns];
  const params = [config.cohort, todayInZone(), ...spec.columns.map((c) => (values[c] === undefined ? null : values[c]))];
  const placeholders = columns.map((_, i) => '$' + (i + 1)).join(', ');

  await query(
    `insert into ${spec.table} (${columns.join(', ')}) values (${placeholders})`,
    params
  );
}

/**
 * Counts only. This is everything the admin view is allowed to see while the
 * programme is running.
 */
async function counts() {
  const [consent, pre, daily, evaluation] = await Promise.all([
    query(`select choice, submission_date, count(*)::int as n
             from research.consent_responses group by 1, 2 order by 2, 1`),
    query(`select submission_date, count(*)::int as n
             from research.pre_training_responses group by 1 order by 1`),
    query(`select training_day, submission_date, count(*)::int as n
             from research.daily_reflections group by 1, 2 order by 2, 1`),
    query(`select submission_date, count(*)::int as n
             from research.post_training_evaluations group by 1 order by 1`)
  ]);

  const sum = (rows) => rows.reduce((t, r) => t + r.n, 0);
  const agreed = consent.rows.filter((r) => r.choice === 'agree');
  const declined = consent.rows.filter((r) => r.choice === 'decline');

  return {
    cohort: config.cohort,
    generatedForDate: todayInZone(),
    totals: {
      consent: sum(consent.rows),
      consent_agree: sum(agreed),
      consent_decline: sum(declined),
      pre: sum(pre.rows),
      daily: sum(daily.rows),
      eval: sum(evaluation.rows)
    },
    consentByDate: consent.rows,
    preByDate: pre.rows,
    dailyByDay: daily.rows,
    evalByDate: evaluation.rows
  };
}

const EXPORT_QUERIES = {
  consent_responses: `select id, cohort, submission_date, choice
                        from research.consent_responses order by id`,
  pre_training_responses: `select id, cohort, submission_date, a1, a2, b1, b2, b3, c1, c2, d1
                        from research.pre_training_responses order by id`,
  daily_reflections: `select id, cohort, submission_date, training_day, r1, r2, r3, r4
                        from research.daily_reflections order by id`,
  post_training_evaluations: `select id, cohort, submission_date,
                          a1, a2, a3, a4, a5, b1, b2, b3, b4, b5, c1, c2, c3, c4,
                          d1, d2, d3, d4
                        from research.post_training_evaluations order by id`
};

/**
 * Export. Ordered by the random primary key, never by insertion order, so
 * that the export file itself does not reveal who submitted before whom.
 */
async function exportTable(table) {
  const sql = EXPORT_QUERIES[table];
  if (!sql) throw new Error('Unknown table: ' + table);
  const result = await query(sql);
  return { table, rowCount: result.rowCount, fields: result.fields.map((f) => f.name), rows: result.rows };
}

async function exportAll() {
  const tables = {};
  for (const name of Object.keys(EXPORT_QUERIES)) {
    tables[name] = await exportTable(name);
  }
  return tables;
}

/**
 * Delete every source record. Run only after an export has been taken and
 * its row counts checked against the admin counts view.
 */
async function deleteAll() {
  const before = {};
  const after = {};
  for (const table of Object.keys(EXPORT_QUERIES)) {
    const name = table;
    const qualified = 'research.' + name;
    const b = await query(`select count(*)::int as n from ${qualified}`);
    before[name] = b.rows[0].n;
    await query(`delete from ${qualified}`);
    const a = await query(`select count(*)::int as n from ${qualified}`);
    after[name] = a.rows[0].n;
  }
  return { before, after };
}

async function close() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = {
  getPool, query, todayInZone, insertSubmission, counts,
  exportTable, exportAll, deleteAll, close, EXPORT_QUERIES
};

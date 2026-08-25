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
    if (!config.databaseCaCert) {
      throw new Error(
        'DATABASE_SSL is "ca" but DATABASE_CA_CERT is empty. Set it to the ' +
        'certificate text, or to a path such as /etc/secrets/prod-ca-2021.crt.'
      );
    }
    if (config.databaseCaCert.startsWith('-----BEGIN')) {
      return { ca: config.databaseCaCert, rejectUnauthorized: true };
    }
    let ca;
    try {
      ca = fs.readFileSync(config.databaseCaCert, 'utf8');
    } catch (err) {
      // ENOENT here used to surface on the first database query as a bare
      // error code, which reads like a database fault and is not one.
      throw new Error(
        `DATABASE_CA_CERT points at "${config.databaseCaCert}", which cannot be ` +
        `read (${err.code || err.message}). Check the file name against the ` +
        'secret files on the host, or paste the certificate text into ' +
        'DATABASE_CA_CERT instead of a path.'
      );
    }
    if (!ca.includes('-----BEGIN')) {
      throw new Error(
        `The file at "${config.databaseCaCert}" is not a certificate: it has no ` +
        'BEGIN line. Download it again from the database dashboard.'
      );
    }
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
    columns: ['training_day', 'r1', 'r2', 'r3', 'r4'],
    // Stamped from configuration, not from the submitted body, in the same way
    // the cohort is. A reflection count cannot be read correctly without
    // knowing how many days the programme ran.
    stamps: { programme_days: () => config.programmeDays }
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

  const stamps = spec.stamps || {};
  const stamped = Object.keys(stamps);
  const columns = ['cohort', 'submission_date', ...stamped, ...spec.columns];
  const params = [
    config.cohort,
    todayInZone(),
    ...stamped.map((name) => stamps[name]()),
    ...spec.columns.map((c) => (values[c] === undefined ? null : values[c]))
  ];
  const placeholders = columns.map((_, i) => '$' + (i + 1)).join(', ');

  await query(
    `insert into ${spec.table} (${columns.join(', ')}) values (${placeholders})`,
    params
  );
}

/**
 * Counts only. This is everything the admin view is allowed to see while the
 * programme is running.
 *
 * Scoped to this service's cohort. Two cohorts can run at the same time on one
 * database, each served by its own instance, and neither facilitator should see
 * the other's room. See the note above EXPORT_QUERIES.
 */
async function counts() {
  const only = [config.cohort];
  const [consent, pre, daily, evaluation] = await Promise.all([
    query(`select choice, submission_date, count(*)::int as n
             from research.consent_responses where cohort = $1 group by 1, 2 order by 2, 1`, only),
    query(`select submission_date, count(*)::int as n
             from research.pre_training_responses where cohort = $1 group by 1 order by 1`, only),
    query(`select training_day, submission_date, count(*)::int as n
             from research.daily_reflections where cohort = $1 group by 1, 2 order by 2, 1`, only),
    query(`select submission_date, count(*)::int as n
             from research.post_training_evaluations where cohort = $1 group by 1 order by 1`, only)
  ]);

  // The oldest date this cohort already carries. Two cohorts run on one service
  // a week apart, and COHORT is read once at start-up. If it is not changed
  // between them, the second cohort's rows land under the first cohort's label
  // and nothing can separate them afterwards: no identifier, no linkage. This
  // is the value the admin page uses to say so loudly on the morning it matters.
  const earliest = await query(
    `select min(d)::text as d from (
       select min(submission_date) as d from research.consent_responses where cohort = $1
       union all select min(submission_date) from research.pre_training_responses where cohort = $1
       union all select min(submission_date) from research.daily_reflections where cohort = $1
       union all select min(submission_date) from research.post_training_evaluations where cohort = $1
     ) all_dates`, only);

  const sum = (rows) => rows.reduce((t, r) => t + r.n, 0);
  const agreed = consent.rows.filter((r) => r.choice === 'agree');
  const declined = consent.rows.filter((r) => r.choice === 'decline');

  return {
    cohort: config.cohort,
    generatedForDate: todayInZone(),
    earliestDate: earliest.rows[0].d,
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

/**
 * Export and deletion, both scoped to this service's cohort by `where cohort =
 * $1`.
 *
 * The scoping is the whole safety property here. Cohorts can share a database:
 * the September cohorts overlap and are served by two instances, and the
 * October cohort follows on the same infrastructure. Unscoped, one researcher
 * verifying an export and pressing delete would destroy another cohort's
 * source records, and there is no second chance at a day of collection.
 *
 * Every query in this object must carry the cohort predicate. A test asserts
 * it, on the text of the queries as well as on their behaviour.
 */
const EXPORT_QUERIES = {
  consent_responses: `select id, cohort, submission_date, choice
                        from research.consent_responses where cohort = $1 order by id`,
  pre_training_responses: `select id, cohort, submission_date, a1, a2, b1, b2, b3, c1, c2, d1
                        from research.pre_training_responses where cohort = $1 order by id`,
  daily_reflections: `select id, cohort, submission_date, programme_days, training_day, r1, r2, r3, r4
                        from research.daily_reflections where cohort = $1 order by id`,
  post_training_evaluations: `select id, cohort, submission_date,
                          a1, a2, a3, a4, a5, b1, b2, b3, b4, b5, c1, c2, c3, c4,
                          d1, d2, d3, d4
                        from research.post_training_evaluations where cohort = $1 order by id`
};

/**
 * Export. Ordered by the random primary key, never by insertion order, so
 * that the export file itself does not reveal who submitted before whom.
 */
async function exportTable(table) {
  const sql = EXPORT_QUERIES[table];
  if (!sql) throw new Error('Unknown table: ' + table);
  const result = await query(sql, [config.cohort]);
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
 * Delete this cohort's source records. Run only after an export has been taken
 * and its row counts checked against the admin counts view.
 *
 * Scoped to this service's cohort, and deliberately so: another cohort's rows
 * may be in the same tables, either because it is running in the same week or
 * because it has not been exported yet. A researcher deleting their own data
 * must not be able to delete anybody else's.
 */
async function deleteAll() {
  const before = {};
  const after = {};
  const only = [config.cohort];
  for (const table of Object.keys(EXPORT_QUERIES)) {
    const name = table;
    const qualified = 'research.' + name;
    const b = await query(`select count(*)::int as n from ${qualified} where cohort = $1`, only);
    before[name] = b.rows[0].n;
    await query(`delete from ${qualified} where cohort = $1`, only);
    const a = await query(`select count(*)::int as n from ${qualified} where cohort = $1`, only);
    after[name] = a.rows[0].n;
  }
  return { cohort: config.cohort, before, after };
}

async function close() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = {
  getPool, sslConfig, query, todayInZone, insertSubmission, counts,
  exportTable, exportAll, deleteAll, close, EXPORT_QUERIES
};

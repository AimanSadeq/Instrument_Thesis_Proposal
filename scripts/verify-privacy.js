'use strict';

/**
 * Run the anonymity checks against whichever database DATABASE_URL points at,
 * including the live Supabase one after deployment. Prints a line per check
 * and exits non-zero if any of them fails.
 *
 * Usage: DATABASE_URL=... node scripts/verify-privacy.js
 */

const fs = require('fs');
const path = require('path');
const db = require('../src/db');

const CHECK_DIR = path.join(__dirname, '..', 'db', 'checks');

// Only what is actually served: the application and the two static assets the
// browser downloads. The tools under scripts/ name these APIs on purpose, in
// order to check that the browser holds nothing.
const SOURCE_ROOTS = ['src', 'public'];

const FORBIDDEN = [
  [/localStorage|sessionStorage|indexedDB/i, 'web storage'],
  [/document\.cookie|res\.cookie|cookie-parser|express-session/i, 'cookies'],
  [/req\.ip\b|x-forwarded-for/i, 'client address'],
  [/user-agent|navigator\.userAgent/i, 'user agent'],
  [/canvas\.toDataURL|AudioContext|navigator\.plugins/i, 'fingerprinting'],
  [/passport|bcrypt|jsonwebtoken/i, 'authentication of participants'],
  [/google-analytics|gtag\(|googletagmanager|plausible|posthog|mixpanel/i, 'analytics'],
  [/morgan|pino-http|express-winston/i, 'request logging']
];

let failures = 0;

function report(ok, label, detail) {
  if (!ok) failures += 1;
  console.log(`${ok ? 'pass' : 'FAIL'}  ${label}${detail ? ' :: ' + detail : ''}`);
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(js|css)$/.test(entry.name)) out.push(full);
  }
  return out;
}

async function main() {
  console.log('Source scan');
  const files = SOURCE_ROOTS.flatMap((root) => walk(path.join(__dirname, '..', root)));
  for (const [pattern, label] of FORBIDDEN) {
    const hits = files.filter((file) => pattern.test(fs.readFileSync(file, 'utf8')));
    report(hits.length === 0, 'no ' + label, hits.map((f) => path.relative(process.cwd(), f)).join(', '));
  }

  console.log('\nSchema checks against ' + (process.env.DATABASE_URL || '').replace(/:[^:@/]*@/, ':***@'));
  // Two kinds of file live in db/checks, and they report the opposite way round.
  //
  // A VIOLATION query looks for something that must not exist, so any row it
  // returns is a finding and no rows means clean.
  //
  // A REPORT query - post_deploy_check.sql - returns one row per check with a
  // `result` column. It always returns rows, so judging it by row count marked
  // it failed even when all nine checks said pass, which is how a gate becomes
  // something people learn to ignore. Judge it by its own verdicts instead.
  for (const file of fs.readdirSync(CHECK_DIR).filter((f) => f.endsWith('.sql')).sort()) {
    const sql = fs.readFileSync(path.join(CHECK_DIR, file), 'utf8');
    const result = await db.query(sql);
    const isReport = result.fields.some((f) => f.name === 'result');

    if (!isReport) {
      report(result.rowCount === 0, file, result.rowCount ? JSON.stringify(result.rows) : '');
      continue;
    }

    // A report with no rows at all ran but checked nothing, which is not a pass.
    if (result.rowCount === 0) {
      report(false, file, 'the report returned no checks at all');
      continue;
    }
    const failed = result.rows.filter((row) => String(row.result).toLowerCase() !== 'pass');
    report(
      failed.length === 0,
      `${file} (${result.rowCount} checks)`,
      failed.length ? JSON.stringify(failed) : ''
    );
  }

  const keys = await db.query(`select conname from pg_constraint
    where contype = 'f' and connamespace = 'research'::regnamespace`);
  report(keys.rowCount === 0, 'no foreign key between instruments',
    keys.rows.map((r) => r.conname).join(', '));

  const finplay = await db.query(`select table_schema, table_name from information_schema.tables
    where table_name ilike '%finplay%'`);
  report(finplay.rowCount === 0, 'no table named for FinPlay');

  console.log(`\n${failures === 0 ? 'All checks passed.' : failures + ' check(s) FAILED.'}`);
  await db.close();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (err) => {
  console.error('verification could not run:', err.message);
  await db.close().catch(() => {});
  process.exit(2);
});

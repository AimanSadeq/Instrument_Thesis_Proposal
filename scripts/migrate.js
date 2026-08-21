'use strict';

/**
 * Apply db/migrations/*.sql in order. Idempotent: every statement in the
 * migration is guarded with `if not exists`.
 *
 * Usage: DATABASE_URL=... npm run migrate
 */

const fs = require('fs');
const path = require('path');
const db = require('../src/db');

async function main() {
  const dir = path.join(__dirname, '..', 'db', 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    process.stdout.write('applying ' + file + ' ... ');
    await db.query(sql);
    process.stdout.write('ok\n');
  }
  await db.close();
}

main().catch(async (err) => {
  console.error('migration failed:', err.message);
  await db.close().catch(() => {});
  process.exit(1);
});

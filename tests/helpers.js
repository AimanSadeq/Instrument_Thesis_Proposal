'use strict';

const fs = require('fs');
const path = require('path');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
  || 'postgresql://postgres@127.0.0.1:55432/instrument_test';
process.env.DATABASE_SSL = 'disable';
process.env.COHORT = 'test-cohort';
process.env.COLLECTION_TIMEZONE = 'Asia/Riyadh';
process.env.ADMIN_SECRET = 'counts-only-secret';
process.env.EXPORT_SECRET = 'export-and-delete-secret';
process.env.PUBLIC_URL = 'https://example.test';

const db = require('../src/db');
const { createApp } = require('../src/server');

async function migrate() {
  const dir = path.join(__dirname, '..', 'db', 'migrations');
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) {
    await db.query(fs.readFileSync(path.join(dir, file), 'utf8'));
  }
}

async function truncate() {
  await db.query(`truncate research.consent_responses, research.pre_training_responses,
                          research.daily_reflections, research.post_training_evaluations`);
}

function listen() {
  return new Promise((resolve) => {
    const server = createApp().listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, base: `http://127.0.0.1:${port}` });
    });
  });
}

function form(fields) {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(fields)) body.append(key, value);
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: body.toString(),
    redirect: 'manual'
  };
}

module.exports = { db, migrate, truncate, listen, form };

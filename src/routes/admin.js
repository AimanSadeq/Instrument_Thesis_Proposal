'use strict';

const express = require('express');
const crypto = require('crypto');
const QRCode = require('qrcode');
const { config } = require('../config');
const db = require('../db');
const view = require('../render/admin');

const router = express.Router();

const CONFIRM_PHRASE = 'DELETE ALL RESEARCH DATA';

// A shared secret protects an administrative route. It is not a participant
// identity and nothing about it is stored: no cookie, no session, no record of
// who used it. The secret is re-sent with each action instead.
function matches(given, expected) {
  if (!expected) return false;
  const a = crypto.createHash('sha256').update(String(given || '')).digest();
  const b = crypto.createHash('sha256').update(String(expected)).digest();
  return crypto.timingSafeEqual(a, b);
}

// Crude global throttle so that the secret cannot be guessed quickly. It
// counts failures, not clients: counting clients would need an address.
const throttle = { failures: 0, lockedUntil: 0 };

function locked() {
  return Date.now() < throttle.lockedUntil;
}

function noteFailure() {
  throttle.failures += 1;
  if (throttle.failures >= 10) {
    throttle.lockedUntil = Date.now() + 10 * 60 * 1000;
    throttle.failures = 0;
  }
}

function authorise(secret) {
  if (locked()) return { level: null, locked: true };
  if (matches(secret, config.exportSecret)) {
    throttle.failures = 0;
    return { level: 'export' };
  }
  if (matches(secret, config.adminSecret)) {
    throttle.failures = 0;
    return { level: 'counts' };
  }
  noteFailure();
  return { level: null };
}

function noStore(res) {
  res.set('Cache-Control', 'no-store, max-age=0');
  return res;
}

async function qrCodes() {
  const targets = [
    { label: 'Consent and briefing', path: '/' },
    { label: 'Pre-training questionnaire', path: '/pre' },
    { label: 'Daily reflection', path: '/daily' },
    { label: 'Post-training evaluation', path: '/eval' }
  ];
  const out = [];
  for (const target of targets) {
    const url = config.publicUrl ? config.publicUrl + target.path : '(set PUBLIC_URL)' + target.path;
    let svg = null;
    if (config.publicUrl) {
      svg = await QRCode.toString(url, { type: 'svg', margin: 1, width: 220, errorCorrectionLevel: 'M' });
    }
    out.push({ label: target.label, url, svg });
  }
  return out;
}

async function showCounts(res, auth, secret, extra = {}) {
  const counts = await db.counts();
  const codes = await qrCodes();
  return noStore(res).type('html').send(view.countsPage({
    counts,
    canExport: auth.level === 'export',
    secret,
    qrCodes: codes,
    ...extra
  }));
}

router.get('/admin', (req, res) => {
  noStore(res).type('html').send(view.loginPage(null));
});

router.post('/admin', async (req, res, next) => {
  try {
    const secret = req.body.secret || '';
    const auth = authorise(secret);
    if (!auth.level) {
      return noStore(res).status(auth.locked ? 429 : 401).type('html')
        .send(view.loginPage(auth.locked ? 'Too many failed attempts. Try again in ten minutes.' : 'Wrong secret.'));
    }
    return await showCounts(res, auth, secret);
  } catch (err) {
    return next(err);
  }
});

function csvCell(value) {
  if (value === null || value === undefined) return '';
  const s = String(value);
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function toCsv(fields, rows) {
  const lines = [fields.map(csvCell).join(',')];
  for (const row of rows) {
    lines.push(fields.map((f) => csvCell(row[f])).join(','));
  }
  // Byte order mark so that Excel opens the Arabic responses correctly.
  return '﻿' + lines.join('\r\n') + '\r\n';
}

router.post('/admin/export', async (req, res, next) => {
  try {
    const secret = req.body.secret || '';
    const auth = authorise(secret);
    if (auth.level !== 'export') {
      return noStore(res).status(auth.locked ? 429 : 403).type('html')
        .send(view.loginPage(auth.locked
          ? 'Too many failed attempts. Try again in ten minutes.'
          : 'Export needs the researcher export secret.'));
    }

    const stamp = db.todayInZone();
    if (req.body.format === 'csv') {
      const tableName = req.body.table;
      if (!Object.keys(db.EXPORT_QUERIES).includes(tableName)) {
        return noStore(res).status(400).type('text').send('Unknown table');
      }
      const data = await db.exportTable(tableName);
      const filename = `${config.cohort}_${tableName}_${stamp}_${data.rowCount}rows.csv`;
      return noStore(res)
        .set('Content-Disposition', `attachment; filename="${filename}"`)
        .type('text/csv; charset=utf-8')
        .send(toCsv(data.fields, data.rows));
    }

    const all = await db.exportAll();
    const counts = await db.counts();
    const payload = {
      export: {
        cohort: config.cohort,
        exportDate: stamp,
        timezone: config.timezone,
        note: 'Anonymous research instrument data. No identifier, no linkage between instruments, no time component.',
        rowCounts: Object.fromEntries(Object.entries(all).map(([k, v]) => [k, v.rowCount])),
        adminCounts: counts.totals
      },
      tables: Object.fromEntries(Object.entries(all).map(([k, v]) => [k, v.rows]))
    };
    const filename = `${config.cohort}_all_instruments_${stamp}.json`;
    return noStore(res)
      .set('Content-Disposition', `attachment; filename="${filename}"`)
      .type('application/json; charset=utf-8')
      .send(JSON.stringify(payload, null, 2));
  } catch (err) {
    return next(err);
  }
});

router.post('/admin/delete', async (req, res, next) => {
  try {
    const secret = req.body.secret || '';
    const auth = authorise(secret);
    if (auth.level !== 'export') {
      return noStore(res).status(auth.locked ? 429 : 403).type('html')
        .send(view.loginPage(auth.locked
          ? 'Too many failed attempts. Try again in ten minutes.'
          : 'Deletion needs the researcher export secret.'));
    }
    if ((req.body.confirm || '').trim() !== CONFIRM_PHRASE) {
      return await showCounts(res, auth, secret, {
        message: `Nothing was deleted. Type ${CONFIRM_PHRASE} exactly to confirm.`
      });
    }
    const deleteResult = await db.deleteAll();
    return await showCounts(res, auth, secret, { deleteResult });
  } catch (err) {
    return next(err);
  }
});

module.exports = { router, CONFIRM_PHRASE };

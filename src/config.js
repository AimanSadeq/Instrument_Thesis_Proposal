'use strict';

/**
 * Configuration. Everything that varies between environments lives here.
 *
 * Nothing in this file, and nothing anywhere else in the application, reads
 * or derives a participant identity. See docs/VERIFICATION.md.
 */

function bool(value, fallback) {
  if (value === undefined || value === '') return fallback;
  return String(value).toLowerCase() === 'true';
}

/**
 * The public address, used only to draw links and QR codes on the admin page.
 * Render's blueprint supplies a bare hostname, and a hand-typed value often
 * carries a trailing slash, so both are normalised here rather than producing
 * a QR code that sends a room full of people to a broken address.
 */
function normalisePublicUrl(raw) {
  const trimmed = String(raw || '').trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : 'https://' + trimmed;
}

const config = {
  port: Number(process.env.PORT || 3000),
  env: process.env.NODE_ENV || 'development',

  // Postgres (Supabase in production). A direct Postgres connection is used
  // rather than the Supabase JS client so that no anon key, no PostgREST
  // surface and no auth schema exist in this project at all.
  databaseUrl: process.env.DATABASE_URL || '',
  // 'verify' (default, system CAs), 'ca' (use DATABASE_CA_CERT), 'disable'.
  databaseSsl: process.env.DATABASE_SSL || 'verify',
  databaseCaCert: process.env.DATABASE_CA_CERT || '',

  // Calendar date is computed in this zone. Never a time, only a date.
  timezone: process.env.COLLECTION_TIMEZONE || 'Asia/Riyadh',

  // Stamped on every row so the cohorts can be exported separately.
  // A cohort label is shared by ~25 people and is not an identifier.
  //
  // The fallback is for local work only. In production COHORT must be set
  // explicitly (see requireProductionConfig): a second service that inherited
  // a default would write its cohort's rows under another cohort's label, and
  // no identifier or linkage exists to separate them afterwards.
  cohort: (process.env.COHORT || '').trim() || 'cohort-1',

  // How many training days this cohort runs. The programme is not always four
  // days: two of the September cohorts run three. Everything
  // that used to say "Day 4" now says "the final day" and derives it from
  // here, including which day carries the cross-programme question R4.
  // Stamped on every daily reflection row, because a reflection count cannot
  // be read correctly without knowing how many days the programme had.
  programmeDays: Number(process.env.PROGRAMME_DAYS || 4),

  // Facilitator secret: counts only.
  adminSecret: process.env.ADMIN_SECRET || '',
  // Researcher secret: export and delete. Deliberately a different secret,
  // so that the facilitator cannot reach response contents (brief s6).
  exportSecret: process.env.EXPORT_SECRET || '',

  // Operational kill switch. When false the instruments refuse submissions
  // and say so plainly. Used outside the collection window.
  instrumentsOpen: bool(process.env.INSTRUMENTS_OPEN, true),

  // Used only to render links and QR codes on the admin page.
  publicUrl: normalisePublicUrl(process.env.PUBLIC_URL),

  maxTextLength: Number(process.env.MAX_TEXT_LENGTH || 5000)
};

// Checked at load, not only in production: a bad value would otherwise render
// a day selector with no options and be discovered in the room.
if (!Number.isInteger(config.programmeDays) || config.programmeDays < 2 || config.programmeDays > 6) {
  throw new Error('PROGRAMME_DAYS must be a whole number from 2 to 6, got: ' + String(process.env.PROGRAMME_DAYS));
}

// Same reasoning for the cohort label. It reaches the database on every row and
// the delete confirmation phrase is built from it, so a label with spaces or
// punctuation is a phrase nobody can type correctly under pressure.
if (!/^[a-z0-9][a-z0-9-]{1,39}$/.test(config.cohort)) {
  throw new Error(
    'COHORT must be 2 to 40 characters of lowercase letters, digits and hyphens, got: ' +
      String(process.env.COHORT)
  );
}

function requireProductionConfig() {
  const missing = [];
  if (!config.databaseUrl) missing.push('DATABASE_URL');
  if (!config.adminSecret) missing.push('ADMIN_SECRET');
  if (!config.exportSecret) missing.push('EXPORT_SECRET');
  // Read the variable, not config.cohort, which carries the local-work fallback.
  // One service per cohort means a new service is created by copying an existing
  // one, and the single most damaging thing to forget is this label: the rows
  // land under the other cohort and cannot be told apart later.
  if (!(process.env.COHORT || '').trim()) missing.push('COHORT');
  if (missing.length) {
    throw new Error('Missing required environment variables: ' + missing.join(', '));
  }
  if (config.adminSecret === config.exportSecret) {
    throw new Error('ADMIN_SECRET and EXPORT_SECRET must differ: the facilitator must not hold the export secret.');
  }
}

module.exports = { config, requireProductionConfig, normalisePublicUrl };

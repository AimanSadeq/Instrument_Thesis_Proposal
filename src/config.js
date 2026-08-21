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

  // Stamped on every row so the two cohorts can be exported separately.
  // A cohort label is shared by ~25 people and is not an identifier.
  cohort: process.env.COHORT || 'cohort-1',

  // Facilitator secret: counts only.
  adminSecret: process.env.ADMIN_SECRET || '',
  // Researcher secret: export and delete. Deliberately a different secret,
  // so that the facilitator cannot reach response contents (brief s6).
  exportSecret: process.env.EXPORT_SECRET || '',

  // Operational kill switch. When false the instruments refuse submissions
  // and say so plainly. Used outside the collection window.
  instrumentsOpen: bool(process.env.INSTRUMENTS_OPEN, true),

  // Used only to render links and QR codes on the admin page.
  publicUrl: (process.env.PUBLIC_URL || '').replace(/\/+$/, ''),

  maxTextLength: Number(process.env.MAX_TEXT_LENGTH || 5000)
};

function requireProductionConfig() {
  const missing = [];
  if (!config.databaseUrl) missing.push('DATABASE_URL');
  if (!config.adminSecret) missing.push('ADMIN_SECRET');
  if (!config.exportSecret) missing.push('EXPORT_SECRET');
  if (missing.length) {
    throw new Error('Missing required environment variables: ' + missing.join(', '));
  }
  if (config.adminSecret === config.exportSecret) {
    throw new Error('ADMIN_SECRET and EXPORT_SECRET must differ: the facilitator must not hold the export secret.');
  }
}

module.exports = { config, requireProductionConfig };

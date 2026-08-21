'use strict';

/** Minimal HTML helpers. No template engine, no client framework. */

function esc(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Pick the string for the active language from a { en, ar } pair. */
function t(pair, lang) {
  if (pair === null || pair === undefined) return '';
  if (typeof pair === 'string') return pair;
  return pair[lang] !== undefined ? pair[lang] : pair.en;
}

module.exports = { esc, t };

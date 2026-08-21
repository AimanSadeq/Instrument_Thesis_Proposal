'use strict';

const { esc, t } = require('./html');
const { UI } = require('../content/ui');

const ASSET_VERSION = '2';

const OTHER = { en: 'ar', ar: 'en' };

/**
 * The page shell.
 *
 * Arabic sets dir="rtl" on <html>, so every element inside, including the
 * language toggle, tables, radio buttons and open-text fields, is laid out
 * right to left by the browser rather than by ad hoc styling.
 *
 * No external resource of any kind is referenced: no font, no script, no
 * analytics. The corporate network only ever has to reach this origin.
 */
function page({ lang, title, main, path = '/', footerNote = true }) {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const other = OTHER[lang];
  const toggleHref = path + '?lang=' + other;

  return `<!doctype html>
<html lang="${esc(lang)}" dir="${dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="referrer" content="no-referrer">
<meta name="robots" content="noindex, nofollow, noarchive">
<meta name="color-scheme" content="light dark">
<title>${esc(t(title, lang))}</title>
<link rel="stylesheet" href="/styles.css?v=${ASSET_VERSION}">
<link rel="icon" href="data:,">
</head>
<body>
<a class="skip-link" href="#main">${esc(t(UI.skipToContent, lang))}</a>
<header class="topbar">
  <span class="topbar-mark" aria-hidden="true"></span>
  <a class="lang-toggle" href="${esc(toggleHref)}" lang="${esc(other)}" hreflang="${esc(other)}"
     aria-label="${esc(t(UI.languageToggleAria, lang))}">${esc(t(UI.languageToggle, lang))}</a>
</header>
<main id="main">
${main}
</main>
${footerNote ? `<footer class="footnote">${esc(t(UI.anonymousFooter, lang))}</footer>` : ''}
<script src="/app.js?v=${ASSET_VERSION}" defer></script>
</body>
</html>`;
}

module.exports = { page, ASSET_VERSION };

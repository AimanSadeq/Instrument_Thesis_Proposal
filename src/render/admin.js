'use strict';

const { esc } = require('./html');
const { config } = require('../config');

/**
 * The admin view. English only, and deliberately poor: it shows counts and
 * nothing else. Response contents are not rendered here at any point, on any
 * route, for any secret. They leave the system only through the export files.
 */

function shell(title, body) {
  return `<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="referrer" content="no-referrer">
<meta name="robots" content="noindex, nofollow, noarchive">
<title>${esc(title)}</title>
<link rel="stylesheet" href="/styles.css?v=2">
</head>
<body class="admin">
<main id="main">
${body}
</main>
</body>
</html>`;
}

function loginPage(message) {
  return shell('Admin', `<h1>Admin</h1>
${message ? `<div class="banner banner-error" role="alert"><p>${esc(message)}</p></div>` : ''}
<form method="post" action="/admin" class="instrument">
<div class="field">
<label class="field-label" for="secret">Secret</label>
<input type="password" id="secret" name="secret" autocomplete="off" autocapitalize="off" spellcheck="false">
</div>
<div class="actions"><button type="submit" class="btn">Show counts</button></div>
</form>
<p class="hint">Counts only. Response contents are not available here.</p>`);
}

function table(caption, headers, rows) {
  const head = headers.map((h) => `<th scope="col">${esc(h)}</th>`).join('');
  const body = rows.length
    ? rows.map((r) => `<tr>${r.map((cell) => `<td>${esc(cell)}</td>`).join('')}</tr>`).join('\n')
    : `<tr><td colspan="${headers.length}">No submissions yet</td></tr>`;
  return `<table class="counts">
<caption>${esc(caption)}</caption>
<thead><tr>${head}</tr></thead>
<tbody>${body}</tbody>
</table>`;
}

function countsPage({ counts, canExport, secret, qrCodes, deleteResult, message }) {
  const totals = counts.totals;
  const participation = totals.consent
    ? Math.round((totals.consent_agree / totals.consent) * 100) + '%'
    : 'n/a';

  const links = qrCodes.map((q) => `<figure class="qr">
<figcaption><strong>${esc(q.label)}</strong><br><code>${esc(q.url)}</code></figcaption>
${q.svg || '<p class="hint">Set PUBLIC_URL to render a QR code.</p>'}
</figure>`).join('\n');

  const exportForms = canExport ? `<section class="section">
<h2>Export</h2>
<p class="hint">Check each row count below against the counts above before deleting anything.
The JSON export carries the same counts inside the file.</p>
<form method="post" action="/admin/export" class="inline-form">
<input type="hidden" name="secret" value="${esc(secret)}">
<input type="hidden" name="format" value="json">
<button type="submit" class="btn">Download JSON, all instruments</button>
</form>
${['consent_responses', 'pre_training_responses', 'daily_reflections', 'post_training_evaluations']
    .map((tableName) => `<form method="post" action="/admin/export" class="inline-form">
<input type="hidden" name="secret" value="${esc(secret)}">
<input type="hidden" name="format" value="csv">
<input type="hidden" name="table" value="${esc(tableName)}">
<button type="submit" class="btn btn-quiet">Download CSV: ${esc(tableName)}</button>
</form>`).join('\n')}
</section>

<section class="section danger">
<h2>Delete all source records</h2>
<p>Irreversible. Run only after an export has been downloaded and its row counts checked.</p>
<form method="post" action="/admin/delete" class="instrument">
<input type="hidden" name="secret" value="${esc(secret)}">
<div class="field">
<label class="field-label" for="confirm">Type <code>DELETE ALL RESEARCH DATA</code> to confirm</label>
<input type="text" id="confirm" name="confirm" autocomplete="off" spellcheck="false">
</div>
<div class="actions"><button type="submit" class="btn btn-danger">Delete all records</button></div>
</form>
</section>` : `<section class="section">
<h2>Export</h2>
<p class="hint">This secret shows counts only. Export and deletion need the researcher's export secret.</p>
</section>`;

  const deleteBlock = deleteResult ? `<div class="banner banner-ok" role="alert">
<h2 class="banner-title">Deletion complete</h2>
<table class="counts">
<thead><tr><th scope="col">Table</th><th scope="col">Rows before</th><th scope="col">Rows after</th></tr></thead>
<tbody>${Object.keys(deleteResult.before).map((k) => `<tr><td>${esc(k)}</td><td>${esc(deleteResult.before[k])}</td><td>${esc(deleteResult.after[k])}</td></tr>`).join('')}</tbody>
</table>
</div>` : '';

  const body = `<h1>Admin: counts</h1>
${message ? `<div class="banner banner-error" role="alert"><p>${esc(message)}</p></div>` : ''}
${deleteBlock}
<p class="hint">Cohort <strong>${esc(counts.cohort)}</strong> · programme <strong>${esc(config.programmeDays)} days</strong>, so R4 appears on Day ${esc(config.programmeDays)} · date today in ${esc(config.timezone)}: <strong>${esc(counts.generatedForDate)}</strong> · instruments ${config.instrumentsOpen ? 'open' : '<strong>closed</strong>'}</p>

${table('Totals', ['Instrument', 'Submissions'], [
    ['Consent, total', totals.consent],
    ['Consent, agreed', totals.consent_agree],
    ['Consent, declined', totals.consent_decline],
    ['Participation rate', participation],
    ['Pre-training questionnaire', totals.pre],
    ['Daily reflections', totals.daily],
    ['Post-training evaluation', totals.eval]
  ])}

${table('Consent by date', ['Date', 'Choice', 'Count'], counts.consentByDate.map((r) => [r.submission_date, r.choice, r.n]))}
${table('Pre-training questionnaire by date', ['Date', 'Count'], counts.preByDate.map((r) => [r.submission_date, r.n]))}
${table('Daily reflections by training day', ['Date', 'Training day', 'Count'], counts.dailyByDay.map((r) => [r.submission_date, r.training_day, r.n]))}
${table('Post-training evaluation by date', ['Date', 'Count'], counts.evalByDate.map((r) => [r.submission_date, r.n]))}

<section class="section">
<h2>Links and QR codes to display in the room</h2>
${links}
</section>

${exportForms}

<form method="post" action="/admin" class="inline-form">
<input type="hidden" name="secret" value="${esc(secret)}">
<button type="submit" class="btn btn-quiet">Refresh counts</button>
</form>`;

  return shell('Admin: counts', body);
}

module.exports = { loginPage, countsPage, shell };

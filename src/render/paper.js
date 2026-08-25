'use strict';

const { esc, t } = require('./html');
const { CONSENT, PRE_TRAINING, DAILY_REFLECTION, POST_TRAINING } = require('../content/instruments');

/**
 * The paper fallback.
 *
 * The run sheet in Research Instruments v2.1 part 3 says printed copies of
 * every instrument travel to each session, for use when the network fails or
 * the client's wi-fi blocks the site. These sheets are generated from the same
 * content module as the screens, so the printed wording cannot drift from the
 * wording on the phone: `npm run verify:wording` checks both at once.
 *
 * Two things are on the paper that are not on the screen, and both are
 * administration rather than instrument content:
 *
 *   1. a line asking the participant not to write anything identifying on the
 *      sheet, which the online version does not need because it cannot happen
 *   2. the collection instruction from the run sheet
 *
 * Nothing else is added, and nothing is reworded, reordered or dropped. There
 * is no name field, no date field and no signature field: v2.0 removed them
 * on purpose, and a paper form is exactly where they would creep back in.
 */

const STYLE = `<style>
@page { size: A4; margin: 16mm 15mm 14mm; }
* { box-sizing: border-box; }
body {
  margin: 0;
  color: #000;
  background: #fff;
  font-family: "Noto Sans", "Noto Sans Arabic", -apple-system, "Segoe UI", Arial, sans-serif;
  font-size: 10.5pt;
  line-height: 1.5;
}
html[lang="ar"] body { line-height: 1.85; }
.sheet { break-after: page; }
.sheet:last-child { break-after: auto; }
.sheet-head { border-block-end: 1.5pt solid #000; padding-block-end: 4mm; margin-block-end: 5mm; }
h1 { font-size: 15pt; margin: 0 0 2mm; }
h2 { font-size: 11.5pt; margin: 6mm 0 2mm; }
p { margin: 0 0 2.5mm; }
hr { border: none; border-block-start: 0.75pt solid #000; margin: 5mm 0; }
.anon { font-weight: 700; margin: 0; }
.lead { font-size: 11pt; }
.muted { font-weight: 400; font-size: 9.5pt; }
.reminder { font-style: italic; }
.closing { font-weight: 700; margin-block-start: 5mm; }
.prose-list { margin: 0 0 3mm; padding-inline-start: 6mm; }
.prose-list li { margin-block-end: 1.5mm; }
.q { break-inside: avoid; margin-block-end: 5mm; }
.q-text { font-weight: 700; margin-block-end: 2mm; }
ul.ticks { list-style: none; margin: 0 0 2mm; padding: 0; }
ul.ticks li { display: flex; align-items: center; gap: 2.5mm; margin-block-end: 2mm; break-inside: avoid; }
ul.ticks.inline { display: flex; flex-wrap: wrap; gap: 8mm; }
ul.ticks.inline li { margin-block-end: 0; }
ul.ticks.choices li { border: 0.75pt solid #000; padding: 3mm; }
.tick {
  display: inline-block;
  inline-size: 5mm; block-size: 5mm;
  border: 1pt solid #000;
  flex: none;
}
.tick-label { flex: 1; }
.write { margin-block-start: 2mm; }
.write-line { border-block-end: 0.5pt solid #666; block-size: 8mm; }
table.likert { inline-size: 100%; border-collapse: collapse; margin-block-end: 4mm; break-inside: avoid; }
table.likert th, table.likert td { border: 0.75pt solid #000; padding: 2mm; text-align: center; vertical-align: middle; }
table.likert th[scope="row"], table.likert th.statement { text-align: start; font-weight: 400; }
table.likert thead th { font-weight: 700; }
table.likert td { inline-size: 11mm; }
table.likert td .tick { inline-size: 4.5mm; block-size: 4.5mm; }
.item-code { font-weight: 700; }
.final-day-head { border-block-start: 0.75pt solid #000; padding-block-start: 3mm; }
.sheet-foot { margin-block-start: 6mm; padding-block-start: 3mm; border-block-start: 0.5pt solid #000; font-size: 9.5pt; }
</style>`;

const PAPER = {
  anonymousNote: {
    en: 'This form is anonymous. Please do not write your name, your employee number, or anything else that would identify you.',
    ar: 'هذا النموذج مجهول الهوية. يرجى عدم كتابة اسمك أو رقمك الوظيفي أو أي شيء آخر يمكن أن يدل عليك.'
  },
  collection: {
    en: 'When you have finished, place the sheet in the collection box unfolded and unmarked.',
    ar: 'عند الانتهاء، ضع الورقة في صندوق الجمع دون طيّها ودون أي علامة عليها.'
  },
  tickOne: { en: 'Tick one', ar: 'ضع علامة على خيار واحد' },
  keepThisPage: {
    en: 'This page is yours to keep. Nothing is collected from it.',
    ar: 'هذه الصفحة لك، احتفظ بها. ولا يُجمع منها أي شيء.'
  },
  informationTitle: {
    en: 'Participant information sheet',
    ar: 'صفحة معلومات المشارك'
  },
  tickOnePerRow: { en: 'Tick one box in each row', ar: 'ضع علامة في مربع واحد في كل صف' },
  packTitle: { en: 'Paper fallback: research instruments', ar: 'النسخة الورقية البديلة: أدوات البحث' }
};

// How many writing lines each open question gets. Presentation only.
const LINES = {
  b3: 3, d1: 5,
  r1: 5, r2: 5, r3: 6, r4: 7,
  eval_d1: 5, eval_d2: 5, eval_d3: 5, eval_d4: 4
};

function lines(count) {
  return `<div class="write">${'<div class="write-line"></div>'.repeat(count)}</div>`;
}

function tickOptions(item, lang) {
  const options = item.options
    .map((option) => `<li><span class="tick"></span><span class="tick-label">${esc(t(option, lang))}</span></li>`)
    .join('\n');
  return `<ul class="ticks">\n${options}\n</ul>`;
}

function paperItem(item, lang) {
  if (item.type === 'radio') {
    return `<div class="q">
<p class="q-text">${esc(t(item.label, lang))}</p>
${tickOptions(item, lang)}
</div>`;
  }
  const count = LINES[item.id] || 4;
  return `<div class="q">
<p class="q-text">${esc(t(item.label, lang))}</p>
${lines(count)}
</div>`;
}

function sheet(title, lang, body, { note = true } = {}) {
  return `<section class="sheet">
<header class="sheet-head">
<h1>${esc(t(title, lang))}</h1>
${note ? `<p class="anon">${esc(t(PAPER.anonymousNote, lang))}</p>` : ''}
</header>
${body}
<footer class="sheet-foot">${esc(t(PAPER.collection, lang))}</footer>
</section>`;
}

function consentSheet(lang) {
  const prose = CONSENT.blocks.map((block) => {
    if (block.type === 'h2') return `<h2>${esc(t(block, lang))}</h2>`;
    if (block.type === 'strong') return `<p class="lead"><strong>${esc(t(block, lang))}</strong></p>`;
    if (block.type === 'ul') {
      return `<ul class="prose-list">${(block[lang] || block.en).map((line) => `<li>${esc(line)}</li>`).join('')}</ul>`;
    }
    return `<p>${esc(t(block, lang))}</p>`;
  }).join('\n');

  const choices = CONSENT.choices
    .map((choice) => `<li><span class="tick"></span><span class="tick-label">${esc(t(choice, lang))}</span></li>`)
    .join('\n');

  return sheet(CONSENT.title, lang, `${prose}
<hr>
<p class="q-text">${esc(t(CONSENT.prompt, lang))} <span class="muted">(${esc(t(PAPER.tickOne, lang))})</span></p>
<ul class="ticks choices">
${choices}
</ul>`);
}

function preSheet(lang) {
  const body = `<p class="reminder">${esc(t(PRE_TRAINING.reminder, lang))}</p>
`
+ PRE_TRAINING.sections.map((section) => `<h2>${esc(t(section.title, lang))}</h2>
${section.items.map((item) => paperItem(item, lang)).join('\n')}`).join('\n');
  return sheet(PRE_TRAINING.title, lang, body);
}

function dailySheet(lang) {
  const days = DAILY_REFLECTION.daySelector.options
    .map((option) => `<li><span class="tick"></span><span class="tick-label">${esc(t(option, lang))}</span></li>`)
    .join('');

  const body = `<p class="reminder">${esc(t(DAILY_REFLECTION.reminder, lang))}</p>
<div class="q">
<p class="q-text">${esc(t(DAILY_REFLECTION.daySelector.label, lang))}</p>
<ul class="ticks inline">${days}</ul>
</div>
${DAILY_REFLECTION.items.map((item) => paperItem(item, lang)).join('\n')}
<h2 class="final-day-head">${esc(t(DAILY_REFLECTION.finalDayHeading, lang))}</h2>
${paperItem(DAILY_REFLECTION.finalDayItem, lang)}`;

  return sheet(DAILY_REFLECTION.title, lang, body);
}

function evalSheet(lang) {
  const head = POST_TRAINING.scale.map((s) => `<th>${esc(t(s, lang))}</th>`).join('');

  const tables = POST_TRAINING.likertSections.map((section) => {
    const rows = section.items.map((item) => `<tr>
<th scope="row"><span class="item-code">${esc(t(item.code, lang))}</span> ${esc(t(item.label, lang))}</th>
${POST_TRAINING.scale.map(() => '<td><span class="tick"></span></td>').join('')}
</tr>`).join('\n');

    return `<h2>${esc(t(section.title, lang))}</h2>
<table class="likert">
<thead><tr><th class="statement">${esc(t(POST_TRAINING.statementHeader, lang))}</th>${head}</tr></thead>
<tbody>
${rows}
</tbody>
</table>`;
  }).join('\n');

  const open = POST_TRAINING.openSection.items
    .map((item) => paperItem({ ...item, id: 'eval_' + item.id }, lang))
    .join('\n');

  const body = `<p class="reminder">${esc(t(POST_TRAINING.reminder, lang))}</p>
<p class="lead">${esc(t(POST_TRAINING.likertIntro, lang))} <span class="muted">(${esc(t(PAPER.tickOnePerRow, lang))})</span></p>
${tables}
<h2>${esc(t(POST_TRAINING.openSection.title, lang))}</h2>
${open}
<p class="closing">${esc(t(POST_TRAINING.closing, lang))}</p>`;

  return sheet(POST_TRAINING.title, lang, body);
}

/**
 * The take-away information page required by Research Protocol v1.3 section 5:
 * "Participants receive a printed information page to keep. This page is given
 * to participants and nothing is collected from it."
 *
 * It is the briefing text and nothing else. No options to choose, no tick
 * boxes, and no collection instruction, because nothing comes back. Choosing
 * happens on the screen, where both options look identical.
 */
function informationSheet(lang) {
  const prose = CONSENT.blocks.map((block) => {
    if (block.type === 'h2') return `<h2>${esc(t(block, lang))}</h2>`;
    if (block.type === 'strong') return `<p class="lead"><strong>${esc(t(block, lang))}</strong></p>`;
    if (block.type === 'ul') {
      return `<ul class="prose-list">${(block[lang] || block.en).map((line) => `<li>${esc(line)}</li>`).join('')}</ul>`;
    }
    return `<p>${esc(t(block, lang))}</p>`;
  }).join('\n');

  return `<section class="sheet">
<header class="sheet-head">
<h1>${esc(t(CONSENT.title, lang))}</h1>
<p class="anon">${esc(t(PAPER.keepThisPage, lang))}</p>
</header>
${prose}
</section>`;
}

/** English and Arabic on one sheet, printed double sided, one per participant. */
function informationPack() {
  return `<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<title>${esc(t(PAPER.informationTitle, 'en'))}</title>
${STYLE}
</head>
<body>
<div dir="ltr" lang="en">${informationSheet('en')}</div>
<div dir="rtl" lang="ar">${informationSheet('ar')}</div>
</body>
</html>`;
}

/** One printable document per language, four instruments, one per sheet. */
function paperPack(lang) {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  return `<!doctype html>
<html lang="${esc(lang)}" dir="${dir}">
<head>
<meta charset="utf-8">
<title>${esc(t(PAPER.packTitle, lang))}</title>
${STYLE}
</head>
<body>
${consentSheet(lang)}
${preSheet(lang)}
${dailySheet(lang)}
${evalSheet(lang)}
</body>
</html>`;
}

module.exports = { paperPack, informationPack, informationSheet, PAPER, LINES };

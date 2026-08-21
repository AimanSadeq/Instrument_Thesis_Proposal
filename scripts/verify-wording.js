'use strict';

/**
 * Check that every word a participant reads appears verbatim in
 * docs/source/Research_Instruments_v2.0.md.
 *
 * The build brief says: implement it verbatim, do not reword, reorder, add or
 * drop items. This is that instruction as a check rather than an intention.
 * Interface chrome in src/content/ui.js is not covered, because it is not part
 * of the instrument.
 *
 * Usage: node scripts/verify-wording.js
 */

const fs = require('fs');
const path = require('path');
const instruments = require('../src/content/instruments');

const DOC = path.join(__dirname, '..', 'docs', 'source', 'Research_Instruments_v2.0.md');

/** Strip the markdown scaffolding, keep the words. */
function normalise(text) {
  return text
    .replace(/\(\s*\)/g, ' ')        // radio markers: ( )
    .replace(/[*#`|]/g, ' ')         // emphasis, headings, code, table pipes
    .replace(/^\s*-\s+/gm, ' ')      // list bullets
    .replace(/\s+/g, ' ')
    .trim();
}

const document = normalise(fs.readFileSync(DOC, 'utf8'));

const strings = [];

function collectPair(pair, where) {
  if (!pair) return;
  for (const lang of ['en', 'ar']) {
    const value = pair[lang];
    if (typeof value === 'string' && value.trim().length > 1) {
      strings.push({ text: value, lang, where });
    } else if (Array.isArray(value)) {
      value.forEach((line, i) => strings.push({ text: line, lang, where: `${where}[${i}]` }));
    }
  }
}

function collectItem(item, where) {
  collectPair(item.label, where + '.label');
  collectPair(item.hint, where + '.hint');
  collectPair(item.code, where + '.code');
  (item.options || []).forEach((option, i) => collectPair(option, `${where}.option[${i}]`));
}

const { CONSENT, PRE_TRAINING, DAILY_REFLECTION, POST_TRAINING } = instruments;

collectPair(CONSENT.title, 'consent.title');
CONSENT.blocks.forEach((block, i) => collectPair(block, `consent.block[${i}]`));
collectPair(CONSENT.prompt, 'consent.prompt');
CONSENT.choices.forEach((choice, i) => collectPair(choice, `consent.choice[${i}]`));

for (const instrument of [PRE_TRAINING, DAILY_REFLECTION, POST_TRAINING]) {
  const id = instrument.id;
  collectPair(instrument.title, `${id}.title`);
  collectPair(instrument.note, `${id}.note`);
  collectPair(instrument.intro, `${id}.intro`);
  collectPair(instrument.reminder, `${id}.reminder`);
  collectPair(instrument.likertIntro, `${id}.likertIntro`);
  collectPair(instrument.statementHeader, `${id}.statementHeader`);
  collectPair(instrument.day4Heading, `${id}.day4Heading`);
  collectPair(instrument.closing, `${id}.closing`);
  if (instrument.daySelector) collectItem(instrument.daySelector, `${id}.daySelector`);
  if (instrument.day4Item) collectItem(instrument.day4Item, `${id}.r4`);
  (instrument.items || []).forEach((item) => collectItem(item, `${id}.${item.id}`));
  (instrument.sections || []).forEach((section, i) => {
    collectPair(section.title, `${id}.section[${i}].title`);
    section.items.forEach((item) => collectItem(item, `${id}.${item.id}`));
  });
  (instrument.likertSections || []).forEach((section, i) => {
    collectPair(section.title, `${id}.likertSection[${i}].title`);
    section.items.forEach((item) => collectItem(item, `${id}.${item.id}`));
  });
  if (instrument.openSection) {
    collectPair(instrument.openSection.title, `${id}.openSection.title`);
    instrument.openSection.items.forEach((item) => collectItem(item, `${id}.${item.id}`));
  }
}

// Nothing dropped either: the item counts the brief lists in section 4.
const counts = {
  'pre-training items': PRE_TRAINING.sections.reduce((n, s) => n + s.items.length, 0),
  'daily reflection items, R4 included': DAILY_REFLECTION.items.length + 1,
  'daily reflection day options': DAILY_REFLECTION.daySelector.options.length,
  'evaluation Likert items': POST_TRAINING.likertSections.reduce((n, s) => n + s.items.length, 0),
  'evaluation open items': POST_TRAINING.openSection.items.length,
  'consent options': CONSENT.choices.length
};
const expected = {
  'pre-training items': 8,
  'daily reflection items, R4 included': 4,
  'daily reflection day options': 4,
  'evaluation Likert items': 14,
  'evaluation open items': 4,
  'consent options': 2
};
let wrongCount = 0;
for (const [label, value] of Object.entries(counts)) {
  const ok = value === expected[label];
  if (!ok) wrongCount += 1;
  console.log(`${ok ? 'pass' : 'FAIL'}  ${label}: ${value}${ok ? '' : ', expected ' + expected[label]}`);
}
console.log('');

let missing = 0;
for (const entry of strings) {
  const needle = normalise(entry.text);
  if (!document.includes(needle)) {
    missing += 1;
    console.log(`MISSING  ${entry.where} (${entry.lang}): ${entry.text}`);
  }
}

console.log(`\n${strings.length} strings checked against Research Instruments v2.0.`);
console.log(missing === 0
  ? 'Every one appears verbatim in the source document.'
  : `${missing} string(s) NOT found in the source document.`);
process.exit(missing === 0 && wrongCount === 0 ? 0 : 1);

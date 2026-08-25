'use strict';

/**
 * Build the printable paper fallback, English and Arabic, from the same
 * content module the screens use.
 *
 * Writes HTML and PDF into docs/paper/. Print single sided, and print one
 * copy of the daily reflection per participant per training day.
 *
 * The canonical four-day pack is written to docs/paper/ itself. A shorter
 * programme is written to docs/paper/<n>-day/, so that a three-day cohort and
 * a four-day cohort running in the same week cannot be handed each other's
 * sheets. The sheets say which they are: the daily reflection is titled
 * "Days 1 to 3" or "Days 1 to 4".
 *
 * Usage: node scripts/build-paper-forms.js
 *        PROGRAMME_DAYS=3 node scripts/build-paper-forms.js
 *        CHROMIUM_PATH=/path/to/chrome to use an already installed browser.
 */

const fs = require('fs');
const path = require('path');
const { paperPack, informationPack } = require('../src/render/paper');
const { config } = require('../src/config');
const { CANONICAL_DAYS } = require('../src/content/instruments');

const PAPER = path.join(__dirname, '..', 'docs', 'paper');
const OUT = config.programmeDays === CANONICAL_DAYS
  ? PAPER
  : path.join(PAPER, `${config.programmeDays}-day`);
const EXECUTABLE = process.env.CHROMIUM_PATH || undefined;

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  const written = [];
  for (const lang of ['en', 'ar']) {
    const file = path.join(OUT, `instruments-${lang}.html`);
    fs.writeFileSync(file, paperPack(lang), 'utf8');
    written.push(file);
  }

  // The take-away information page, both languages on one sheet: print double
  // sided, one per participant. Research Protocol v1.3 section 5.
  const info = path.join(OUT, 'information-sheet.html');
  fs.writeFileSync(info, informationPack(), 'utf8');
  written.push(info);

  let chromium;
  try {
    ({ chromium } = require('playwright'));
  } catch (err) {
    console.log('HTML written. Playwright is not installed, so no PDF was produced.');
    console.log(written.map((f) => ' ' + path.relative(process.cwd(), f)).join('\n'));
    return;
  }

  const browser = await chromium.launch(EXECUTABLE ? { executablePath: EXECUTABLE } : {});
  const page = await browser.newPage();

  for (const name of ['instruments-en', 'instruments-ar', 'information-sheet']) {
    const source = path.join(OUT, `${name}.html`);
    const pdf = path.join(OUT, `${name}.pdf`);
    await page.goto('file://' + source, { waitUntil: 'networkidle' });
    await page.pdf({ path: pdf, format: 'A4', printBackground: true, preferCSSPageSize: true });
    written.push(pdf);
  }

  await browser.close();
  console.log('Paper fallback written:');
  console.log(written.map((f) => ' ' + path.relative(process.cwd(), f)).join('\n'));
}

main().catch((err) => {
  console.error('could not build the paper forms:', err.message);
  process.exit(1);
});

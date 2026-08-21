'use strict';

/**
 * Build the printable paper fallback, English and Arabic, from the same
 * content module the screens use.
 *
 * Writes HTML and PDF into docs/paper/. Print single sided, and print four
 * copies of the daily reflection per participant: one for each day.
 *
 * Usage: node scripts/build-paper-forms.js
 *        CHROMIUM_PATH=/path/to/chrome to use an already installed browser.
 */

const fs = require('fs');
const path = require('path');
const { paperPack } = require('../src/render/paper');

const OUT = path.join(__dirname, '..', 'docs', 'paper');
const EXECUTABLE = process.env.CHROMIUM_PATH || undefined;

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  const written = [];
  for (const lang of ['en', 'ar']) {
    const file = path.join(OUT, `instruments-${lang}.html`);
    fs.writeFileSync(file, paperPack(lang), 'utf8');
    written.push(file);
  }

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

  for (const lang of ['en', 'ar']) {
    const source = path.join(OUT, `instruments-${lang}.html`);
    const pdf = path.join(OUT, `instruments-${lang}.pdf`);
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

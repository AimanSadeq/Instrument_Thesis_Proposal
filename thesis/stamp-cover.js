// Stamps the cover page of a built TP: the exact word count, and a draft build marker.
//
// Run after build-skeleton.js:
//     node build-skeleton.js TP_Working_Draft_Sadeq.docx && node stamp-cover.js TP_Working_Draft_Sadeq.docx
//
// The stamped file is renamed to carry its build number, so the command above
// leaves TP_Working_Draft_Sadeq_build27.docx rather than overwriting a name
// that means something different every time.
//
// The count follows the DBA guidelines, cover page section: "the exact word-count (including
// list of references; excluding tables, figures, appendices, and other relevant documents)".
// So it runs from the Introduction to the end of the List of References, and excludes:
//   * everything from the Appendices heading onward
//   * anything inside a table
//   * the amber reserved-passage notes, which are instructions to the author, not thesis prose
//   * the cover page itself, the AI statement and the table of contents, as front matter
//
// It also reports the separate length check the guidelines impose on the body, 8,000 to 11,000
// words excluding references and appendices, and fails loudly if the draft falls outside it.
'use strict';

const fs = require('fs');
const path = require('path');
const AdmZip = (() => {
  try { return require('adm-zip'); } catch { return null; }
})();

const file = process.argv[2] || 'TP_Working_Draft_Sadeq.docx';

function readDocumentXml(zipPath) {
  const { execFileSync } = require('child_process');
  return execFileSync('unzip', ['-p', zipPath, 'word/document.xml'], {
    maxBuffer: 64 * 1024 * 1024,
  }).toString('utf8');
}

function analyse(xml) {
  const body = xml.slice(xml.indexOf('<w:body>'));
  const blocks = body.match(/<w:tbl>[\s\S]*?<\/w:tbl>|<w:p[ >][\s\S]*?<\/w:p>/g) || [];

  const text = (b) => (b.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g) || [])
    .map((m) => m.replace(/<[^>]+>/g, ''))
    .join('');
  const isTable = (b) => b.startsWith('<w:tbl>');
  // G() in build-skeleton.js renders reserved passages in amber italic.
  const isReservedNote = (b) => b.includes('w:color w:val="8A6A1F"');
  const styleOf = (b) => (b.match(/<w:pStyle w:val="([^"]+)"/) || [])[1] || '';
  const words = (t) => (t.trim() ? t.trim().split(/\s+/).length : 0);

  let intro = null, refs = null, apx = null;
  blocks.forEach((b, i) => {
    if (styleOf(b) !== 'Heading1') return;
    const t = text(b).trim();
    if (t.startsWith('1. Introduction') && intro === null) intro = i;
    else if (t === 'List of References') refs = i;
    else if (t === 'Appendices') apx = i;
  });
  if (intro === null || refs === null || apx === null) {
    throw new Error(`could not locate section boundaries (intro=${intro} refs=${refs} apx=${apx})`);
  }

  const tally = (lo, hi) => blocks.slice(lo, hi).reduce((acc, b) => {
    const w = words(text(b));
    if (isTable(b)) acc.tables += w;
    else if (isReservedNote(b)) acc.reserved += w;
    else acc.prose += w;
    return acc;
  }, { prose: 0, tables: 0, reserved: 0 });

  const bodyT = tally(intro, refs);
  const refsT = tally(refs, apx);
  return {
    body: bodyT.prose,
    bodyTables: bodyT.tables,
    bodyReserved: bodyT.reserved,
    references: refsT.prose,
    total: bodyT.prose + refsT.prose,
  };
}

const xml = readDocumentXml(file);
const n = analyse(xml);

const line = `Word count: ${n.total.toLocaleString('en-US')} (including list of references; excluding tables, figures and appendices)`;

// Replace the cover-page placeholder, or a previously stamped line, in place.
const PLACEHOLDER = /Word count: [^<]*/;
if (!PLACEHOLDER.test(xml)) throw new Error('no "Word count:" line found on the cover page');
const updated = xml.replace(PLACEHOLDER, line.replace(/&/g, '&amp;').replace(/</g, '&lt;'));

// Build marker. The counter continues the candidate's own save numbering, which stood at 13
// when this was introduced, so the numbers in conversation and on the page agree. Remove the
// marker before final submission: the guidelines prescribe the cover page contents.
const COUNTER = path.join(__dirname, '.build-number');
const next = (fs.existsSync(COUNTER) ? parseInt(fs.readFileSync(COUNTER, 'utf8').trim(), 10) : 13) + 1;
fs.writeFileSync(COUNTER, String(next));
const stamped = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
const buildLine = `Draft of ${stamped}, build ${next}`;

const BUILD_PLACEHOLDER = /\[BUILD STAMP\]|Draft of [^<]*, build \d+/;
if (!BUILD_PLACEHOLDER.test(updated)) throw new Error('no build-stamp line found on the cover page');
const updated2 = updated.replace(BUILD_PLACEHOLDER, buildLine);

// Rewrite the single entry inside the archive, leaving everything else untouched.
const { execFileSync } = require('child_process');
const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'tpwc-'));
fs.mkdirSync(path.join(tmp, 'word'));
fs.writeFileSync(path.join(tmp, 'word', 'document.xml'), updated2, 'utf8');
execFileSync('zip', ['-q', path.resolve(file), 'word/document.xml'], { cwd: tmp });
fs.rmSync(tmp, { recursive: true, force: true });

// Well-formedness gate. A docx-js IIFE that returns an array without a spread serialises the
// array indices as element names (<0/>), which produces a file Word refuses to open and which a
// CRC check still calls healthy. That shipped once. It does not ship again: this parses the
// rewritten document.xml and refuses to leave a broken file in place.
(() => {
  const check = `
import sys, zipfile, xml.etree.ElementTree as ET
x = zipfile.ZipFile(sys.argv[1]).read('word/document.xml')
try:
    ET.fromstring(x)
except ET.ParseError as e:
    print('PARSE ERROR: %s' % e); sys.exit(1)
print('well-formed')
`;
  try {
    const out = execFileSync('python3', ['-c', check, path.resolve(file)]).toString().trim();
    console.log(`  xml check: ${out}`);
  } catch (err) {
    const detail = (err.stdout || '').toString().trim() || err.message;
    console.error(`\n  REFUSING TO SHIP: word/document.xml is not well-formed.\n  ${detail}`);
    console.error('  Look for an IIFE in build-skeleton.js that returns an array without a spread.');
    process.exit(1);
  }
})();

console.log(`stamped: ${line}`);
console.log(`stamped: ${buildLine}`);
console.log(`  body, sections 1 to 5      ${String(n.body).padStart(6)}`);
console.log(`  list of references         ${String(n.references).padStart(6)}`);
console.log(`  excluded from body: tables ${n.bodyTables}, reserved notes ${n.bodyReserved}`);

// The build number goes in the file name, not only on the cover. Every build
// that leaves this directory must be distinguishable from every other one in a
// downloads folder, without opening it. Shipping two different documents under
// one name is how a corrupt build and its repair both came to be called
// "build 14", and it cost a round trip to sort out.
const versioned = file.replace(/(?:_build\d+)?\.docx$/i, `_build${next}.docx`);
if (path.resolve(versioned) !== path.resolve(file)) {
  fs.renameSync(file, versioned);
}
console.log(`  written as ${path.basename(versioned)}`);

const LOW = 8000, HIGH = 11000;
if (n.body < LOW || n.body > HIGH) {
  console.error(`\n  WARNING: body is ${n.body} words, outside the guideline band of ${LOW} to ${HIGH}.`);
  process.exitCode = 1;
} else {
  console.log(`  length check: body ${n.body} is inside the ${LOW} to ${HIGH} band`);
}

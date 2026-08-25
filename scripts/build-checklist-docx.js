'use strict';

/**
 * Build the printable Word version of a pre-course checklist.
 *
 * The markdown IS the source. This script used to carry its own copy of the
 * checklist text as a list of tick() calls, which meant two documents saying
 * almost the same thing and drifting apart. It now reads the markdown, so the
 * printed copy and the repository copy cannot disagree.
 *
 *   node scripts/build-checklist-docx.js docs/PRE_COURSE_CHECKLIST_4day.md
 *   node scripts/build-checklist-docx.js docs/PRE_COURSE_CHECKLIST_3day.md
 *
 * Output name is derived from the input unless a second argument gives one.
 */

const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  BorderStyle, TabStopType, Header, Footer, PageNumber
} = require('docx');

const INK = '14181F';
const SOFT = '4B5563';

function title(text) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, bold: true, size: 40, color: INK })]
  });
}

function meta(label, value) {
  return new Paragraph({
    spacing: { after: 40 },
    children: [
      new TextRun({ text: label + '  ', bold: true, size: 19, color: SOFT }),
      new TextRun({ text: value, size: 19, color: SOFT })
    ]
  });
}

function intro(text) {
  return new Paragraph({
    spacing: { before: 200, after: 240 },
    border: { top: { style: BorderStyle.SINGLE, size: 6, color: 'C9CFD8', space: 8 } },
    children: [new TextRun({ text, size: 20, italics: true, color: SOFT })]
  });
}

function section(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 140 },
    keepNext: true,
    children: [new TextRun({ text, bold: true, size: 26, color: INK })]
  });
}

/** A tickable line: an empty box, a tab, then the item. */
function item(runs) {
  return new Paragraph({
    spacing: { after: 120 },
    indent: { left: 400, hanging: 400 },
    tabStops: [{ type: TabStopType.LEFT, position: 400 }],
    children: [
      new TextRun({ text: '☐', size: 26, color: INK }),
      new TextRun({ text: '\t', size: 22 }),
      ...runs
    ]
  });
}

/** Plain text with **bold** segments. */
function rich(text, size = 21) {
  return text.split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((part) =>
    part.startsWith('**')
      ? new TextRun({ text: part.slice(2, -2), bold: true, size, color: INK })
      : new TextRun({ text: part, size, color: INK }));
}

function tick(text) {
  return item(rich(text));
}

/** An explanatory line under an item, not itself tickable. */
function note(text) {
  return new Paragraph({
    spacing: { after: 160 },
    indent: { left: 400 },
    children: [new TextRun({ text, size: 19, italics: true, color: SOFT })]
  });
}

function body(text) {
  return new Paragraph({
    spacing: { after: 140 },
    children: rich(text, 21)
  });
}

const SRC = process.argv[2];
if (!SRC || !/\.md$/.test(SRC)) {
  console.error('usage: node scripts/build-checklist-docx.js docs/PRE_COURSE_CHECKLIST_4day.md [out.docx]');
  process.exit(1);
}
const OUT = process.argv[3] || SRC.replace(/\.md$/, '.docx').replace(/PRE_COURSE_CHECKLIST/, 'Pre_course_checklist');

const lines = fs.readFileSync(SRC, 'utf8').split('\n');
const children = [];
let pending = [];   // consecutive '- [ ]' lines belong to one item each

for (let i = 0; i < lines.length; i += 1) {
  const raw = lines[i];
  const t = raw.trim();

  if (/^-{3,}$/.test(t)) continue;

  if (t.startsWith('# ')) { children.push(title(t.slice(2))); continue; }
  if (t.startsWith('## ')) { children.push(section(t.slice(3))); continue; }

  // A checklist item, possibly continued on following indented lines.
  if (/^- \[ \]\s+/.test(t)) {
    let text = t.replace(/^- \[ \]\s+/, '');
    while (i + 1 < lines.length && /^\s{4,}\S/.test(lines[i + 1]) && !/^\s*- \[ \]/.test(lines[i + 1])) {
      text += ' ' + lines[i + 1].trim();
      i += 1;
    }
    children.push(tick(text));
    continue;
  }

  if (!t) continue;

  // A bold key/value line at the head of the file is metadata.
  const kv = t.match(/^\*\*([^*]+):\*\*\s+(.+)$/);
  if (kv && children.length < 12) { children.push(meta(kv[1], kv[2])); continue; }

  // Everything else is prose. Join wrapped lines into one paragraph.
  let text = t;
  while (i + 1 < lines.length && lines[i + 1].trim() && !/^[-#*]/.test(lines[i + 1].trim())
         && !/^\*\*[^*]+:\*\*/.test(lines[i + 1].trim())) {
    text += ' ' + lines[i + 1].trim();
    i += 1;
  }
  children.push(text.startsWith('**') && text.endsWith('**') ? note(text.slice(2, -2)) : body(text));
}

const doc = new Document({
  creator: 'Aiman S. Sadeq',
  title: (lines.find((l) => l.startsWith('# ')) || '# Pre-course checklist').slice(2),
  styles: { default: { document: { run: { font: 'Calibri', size: 21, color: INK } } } },
  sections: [{
    properties: { page: { margin: { top: 900, right: 900, bottom: 900, left: 900 } } },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: SOFT })],
        })],
      }),
    },
    children,
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(OUT, buffer);
  const { execFileSync } = require('child_process');
  const xml = execFileSync('unzip', ['-p', OUT, 'word/document.xml'], { maxBuffer: 64 * 1024 * 1024 }).toString('utf8');
  if (/<\/?\d/.test(xml)) throw new Error('numeric element name in document.xml: an array was not spread');
  console.log('written', OUT, fs.statSync(OUT).size, 'bytes,', children.length, 'blocks');
});

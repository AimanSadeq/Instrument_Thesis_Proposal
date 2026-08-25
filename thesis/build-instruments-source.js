// Renders the current Research Instruments document to .docx.
//
// The Markdown in ../docs/source is the governing document. This script
// only formats it: it does not reword, reorder, add or drop anything. If the
// instruments need to change, change the Markdown, rerun `npm run verify:wording`
// in the instrument repository, and rerun this.
//
//     node build-instruments-source.js
//
// The version is read from the file name, so a new version needs no edit here.
'use strict';

const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle,
} = require('docx');

const SOURCE_DIR = path.join(__dirname, '..', 'docs', 'source');
const found = fs.readdirSync(SOURCE_DIR)
  .filter((f) => /^Research_Instruments_v[\d.]+\.md$/.test(f))
  .sort();
if (found.length !== 1) {
  throw new Error(`expected exactly one instruments document, found: ${found.join(', ') || 'none'}`);
}
const SRC = path.join(SOURCE_DIR, found[0]);
const VERSION = found[0].match(/v([\d.]+)\.md$/)[1];
const OUT = process.argv[2] || `Research_Instruments_v${VERSION}_Sadeq.docx`;

const TNR = 'Times New Roman';
const ARABIC = /[؀-ۿݐ-ݿ]/;

const clean = (s) => s.replace(/\\(['"])/g, '$1');
const isRtl = (s) => {
  const arabic = (s.match(/[؀-ۿ]/g) || []).length;
  const latin = (s.match(/[A-Za-z]/g) || []).length;
  return arabic > latin;
};

/** Inline **bold** and *italic*; ** first so it is never read as two singles. */
function runs(text, base = {}) {
  const out = [];
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(new TextRun({ text: clean(text.slice(last, m.index)), ...base }));
    out.push(new TextRun(m[1]
      ? { text: clean(m[1]), bold: true, ...base }
      : { text: clean(m[2]), italics: true, ...base }));
    last = re.lastIndex;
  }
  if (last < text.length) out.push(new TextRun({ text: clean(text.slice(last)), ...base }));
  return out.length ? out : [new TextRun({ text: '', ...base })];
}

function para(text, opts = {}) {
  const rtl = isRtl(text);
  return new Paragraph({
    bidirectional: rtl,
    alignment: rtl ? AlignmentType.RIGHT : (opts.align || undefined),
    spacing: { line: 300, after: 100, ...(opts.spacing || {}) },
    indent: opts.indent,
    children: runs(text, { rightToLeft: rtl, ...(opts.run || {}) }),
  });
}

const BORDER = { style: BorderStyle.SINGLE, size: 4, color: 'AAAAAA' };
function table(rows) {
  const cols = Math.max(...rows.map((r) => r.length));
  const rtl = isRtl(rows.map((r) => r.join(' ')).join(' '));
  return new Table({
    width: { size: 9070, type: WidthType.DXA },
    visuallyRightToLeft: rtl,
    rows: rows.map((cells, i) => new TableRow({
      tableHeader: i === 0,
      children: Array.from({ length: cols }, (_, c) => new TableCell({
        borders: { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER },
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        children: [para(cells[c] || '', { run: i === 0 ? { bold: true } : {}, spacing: { after: 0 } })],
      })),
    })),
  });
}

const lines = fs.readFileSync(SRC, 'utf8').split('\n');
const children = [];
let i = 0;

while (i < lines.length) {
  const raw = lines[i];
  const t = raw.trim();

  if (!t || /^-{3,}$/.test(t)) { i += 1; continue; }

  // Markdown table: a run of lines beginning with a pipe.
  if (t.startsWith('|')) {
    const rows = [];
    while (i < lines.length && lines[i].trim().startsWith('|')) {
      const cells = lines[i].trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      if (!cells.every((c) => /^:?-{2,}:?$/.test(c) || c === '')) rows.push(cells);
      i += 1;
    }
    if (rows.length) children.push(table(rows), new Paragraph({ spacing: { after: 120 }, children: [] }));
    continue;
  }

  if (t.startsWith('### ')) {
    children.push(para(t.slice(4), { run: { bold: true, size: 24 }, spacing: { before: 180, after: 80 } }));
  } else if (t.startsWith('## ')) {
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_2, spacing: { before: 220, after: 100 },
      bidirectional: isRtl(t), alignment: isRtl(t) ? AlignmentType.RIGHT : undefined,
      children: [new TextRun({ text: clean(t.slice(3)), rightToLeft: isRtl(t) })],
    }));
  } else if (t.startsWith('# ')) {
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_1, spacing: { before: 300, after: 140 },
      bidirectional: isRtl(t), alignment: isRtl(t) ? AlignmentType.RIGHT : undefined,
      children: [new TextRun({ text: clean(t.slice(2)), rightToLeft: isRtl(t) })],
    }));
  } else if (/^-\s+/.test(t)) {
    // "( )" is a response option on a form, so it is drawn as an empty box
    // rather than as a bullet, exactly as the printed instrument shows it.
    const body = t.replace(/^-\s+/, '');
    const option = body.startsWith('( )');
    children.push(para(option ? body.replace(/\(\s?\)/g, '☐') : '• ' + body,
      { indent: { left: 340, hanging: 170 }, spacing: { after: 60 } }));
  } else {
    children.push(para(t));
  }
  i += 1;
}

const doc = new Document({
  creator: 'Aiman S. Sadeq',
  title: `Research Instruments v${VERSION}`,
  styles: {
    default: { document: { run: { font: TNR, size: 22 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal',
        run: { font: TNR, size: 28, bold: true, color: '1F3864' },
        paragraph: { spacing: { before: 300, after: 140 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal',
        run: { font: TNR, size: 25, bold: true, color: '000000' },
        paragraph: { spacing: { before: 220, after: 100 }, outlineLevel: 1 } },
    ],
  },
  sections: [{ properties: {}, children }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUT, buf);
  const { execFileSync } = require('child_process');
  const xml = execFileSync('unzip', ['-p', OUT, 'word/document.xml'], { maxBuffer: 64 * 1024 * 1024 }).toString('utf8');
  if (/<\/?\d/.test(xml)) throw new Error('numeric element name in document.xml: an array was not spread');
  console.log('written', OUT, (buf.length / 1024).toFixed(1) + 'KB');
});

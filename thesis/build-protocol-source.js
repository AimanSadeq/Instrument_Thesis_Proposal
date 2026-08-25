// Renders the current Research Protocol and Data Management Plan to .docx.
//
// The Markdown in ../docs/source is the governing document and the single
// source of truth. This script only formats it: it does not rewrite, summarise or
// reorder anything. If the protocol needs to change, change the Markdown and rerun.
//
//     node build-protocol-source.js Research_Protocol_DMP_v1.2_Sadeq.docx
//
// The version is read from the file name rather than hard-coded, so a new version needs
// no edit here. It replaces build-protocol.js, which hard-coded v1.0 (paper instruments,
// sealed-envelope returns) and was deleted once v1.1 superseded it.
'use strict';

const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');

const SOURCE_DIR = path.join(__dirname, '..', 'docs', 'source');
const found = fs.readdirSync(SOURCE_DIR)
  .filter((f) => /^Research_Protocol_DMP_v[\d.]+\.md$/.test(f))
  .sort();
if (found.length !== 1) {
  throw new Error(`expected exactly one protocol in ${SOURCE_DIR}, found: ${found.join(', ') || 'none'}`);
}
const SRC = path.join(SOURCE_DIR, found[0]);
const VERSION = found[0].match(/v([\d.]+)\.md$/)[1];
const OUT = process.argv[2] || `Research_Protocol_DMP_v${VERSION}_Sadeq.docx`;
const TNR = 'Times New Roman';

// The Markdown carries pandoc's backslash escapes before apostrophes. Strip them, and
// normalise the apostrophe itself so the document does not mix straight and curly forms.
const clean = (s) => s.replace(/\\(['"])/g, '$1').replace(/'/g, '’');

// Inline **bold** and *italic*, in that order so that ** is never read as two singles.
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

const raw = fs.readFileSync(SRC, 'utf8');
const lines = raw.split('\n');

// The first five non-empty lines are the title block: title, subtitle, byline, version,
// supersession note. Everything after them is body.
const head = [];
let i = 0;
for (; i < lines.length && head.length < 5; i++) {
  if (lines[i].trim()) head.push(lines[i].trim());
}

const children = [
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 },
    children: runs(head[0], { bold: true, size: 30 }) }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120, line: 320 },
    children: runs(head[1]) }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60, line: 300 },
    children: runs(head[2], { size: 20 }) }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60, line: 300 },
    children: runs(head[3], { size: 20 }) }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 260, line: 300 },
    children: runs(head[4], { size: 20, italics: true }) }),
];

// A body line that is entirely bold and starts with a section number is a heading.
const HEADING = /^\*\*(\d+\.\s+[^*]+)\*\*$/;

for (; i < lines.length; i++) {
  const line = lines[i];
  const t = line.trim();
  if (!t) continue;

  const h = t.match(HEADING);
  if (h) {
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 260, after: 120 },
      children: [new TextRun(clean(h[1]))],
    }));
    continue;
  }

  if (/^-\s{2,}/.test(t)) {
    children.push(new Paragraph({
      spacing: { line: 320, after: 80 },
      indent: { left: 340, hanging: 170 },
      children: [new TextRun('• '), ...runs(t.replace(/^-\s+/, ''))],
    }));
    continue;
  }

  children.push(new Paragraph({
    spacing: { line: 320, after: 120 },
    children: runs(t),
  }));
}

const doc = new Document({
  creator: 'Aiman S. Sadeq',
  title: `Research Protocol and Data Management Plan v${VERSION}`,
  styles: {
    default: { document: { run: { font: TNR, size: 23 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal',
        run: { font: TNR, size: 27, bold: true, color: '1F3864' },
        paragraph: { spacing: { before: 260, after: 120 }, outlineLevel: 0 } },
    ],
  },
  sections: [{ properties: {}, children }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUT, buf);
  // The bug that shipped a corrupt file once: verify the XML actually parses, not just
  // that the zip's CRCs are intact.
  const { execFileSync } = require('child_process');
  const xml = execFileSync('unzip', ['-p', OUT, 'word/document.xml'], { maxBuffer: 64 * 1024 * 1024 }).toString('utf8');
  if (/<\/?\d/.test(xml)) throw new Error('numeric element name in document.xml: an array was not spread');
  console.log('written', OUT, (buf.length / 1024).toFixed(1) + 'KB');
});

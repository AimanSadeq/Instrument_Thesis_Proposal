'use strict';

/**
 * Build the paper documents in Word: the fallback instruments, one file per
 * language, and the take-away information page with both languages in one
 * file for double-sided printing.
 *
 * The wording comes from src/content/instruments.js, the same module the
 * screens and the PDFs use, so `npm run verify:wording` covers these too and
 * the printed forms cannot drift from the ones on the phone.
 *
 * `docx` is not a dependency of the application and deliberately is not in
 * package.json: install it where you run this.
 *
 *   npm install docx
 *   node scripts/build-paper-docx.js docs/paper
 */

const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle,
  Table, TableRow, TableCell, WidthType, ShadingType, VerticalAlign, PageBreak
} = require('docx');

const { PAPER, LINES } = require('../src/render/paper');
const { CONSENT, PRE_TRAINING, DAILY_REFLECTION, POST_TRAINING } = require('../src/content/instruments');
const { CANONICAL_DAYS } = require('../src/content/instruments');
const { config } = require('../src/config');

const INK = '000000';
const RULE = '000000';
const LINE = '808080';

// A4 is 11906 DXA wide; margins below leave 9906 for content.
const CONTENT_WIDTH = 9900;
const SCALE_COL = 1000;
const STATEMENT_COL = CONTENT_WIDTH - SCALE_COL * 5;

const t = (pair, lang) => (pair && pair[lang] !== undefined ? pair[lang] : (pair && pair.en) || '');

function isRtl(lang) {
  return lang === 'ar';
}

function font(lang) {
  // Arial carries Arabic on Windows and macOS; Calibri does not, reliably.
  return isRtl(lang) ? 'Arial' : 'Calibri';
}

function run(text, lang, opts = {}) {
  return new TextRun({
    text,
    font: font(lang),
    size: opts.size || 21,
    bold: opts.bold || false,
    italics: opts.italics || false,
    color: opts.color || INK,
    rightToLeft: isRtl(lang)
  });
}

function para(text, lang, opts = {}) {
  return new Paragraph({
    bidirectional: isRtl(lang),
    alignment: opts.alignment || (isRtl(lang) ? AlignmentType.RIGHT : AlignmentType.LEFT),
    spacing: { after: opts.after === undefined ? 120 : opts.after, before: opts.before || 0 },
    keepNext: opts.keepNext || false,
    border: opts.border,
    children: [run(text, lang, opts)]
  });
}

function heading(text, lang) {
  return para(text, lang, { bold: true, size: 30, after: 80, keepNext: true });
}

function sectionHeading(text, lang) {
  return para(text, lang, { bold: true, size: 24, before: 260, after: 100, keepNext: true });
}

function question(text, lang) {
  return para(text, lang, { bold: true, after: 80, keepNext: true });
}

function hint(text, lang) {
  return para(text, lang, { size: 18, color: '666666', after: 60 });
}

function rule() {
  return new Paragraph({
    spacing: { before: 120, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: RULE, space: 4 } },
    children: []
  });
}

/** Ruled lines to write on: empty paragraphs with a bottom border. */
function writingLines(count) {
  const lines = [];
  for (let i = 0; i < count; i += 1) {
    lines.push(new Paragraph({
      spacing: { before: 200, after: 0 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LINE, space: 2 } },
      children: []
    }));
  }
  lines.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
  return lines;
}

/** An option to tick. The box sits on the reading side of the label. */
function option(label, lang) {
  const box = new TextRun({ text: '☐', font: 'Segoe UI Symbol', size: 28, color: INK });
  const text = run('  ' + label, lang);
  return new Paragraph({
    bidirectional: isRtl(lang),
    alignment: isRtl(lang) ? AlignmentType.RIGHT : AlignmentType.LEFT,
    spacing: { after: 100 },
    children: isRtl(lang) ? [text, box] : [box, text]
  });
}

function radioItem(item, lang) {
  return [
    question(t(item.label, lang), lang),
    ...item.options.map((o) => option(t(o, lang), lang))
  ];
}

function textItem(item, lang, key) {
  const out = [question(t(item.label, lang), lang)];
  if (item.hint) out.push(hint(t(item.hint, lang), lang));
  out.push(...writingLines(LINES[key || item.id] || 4));
  return out;
}

function cell(children, width, opts = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    shading: opts.shaded ? { type: ShadingType.CLEAR, fill: 'F2F2F2' } : undefined,
    children
  });
}

function likertTable(section, lang) {
  const scaleHead = POST_TRAINING.scale.map((s) => cell([
    new Paragraph({ alignment: AlignmentType.CENTER, children: [run(t(s, lang), lang, { bold: true })] })
  ], SCALE_COL, { shaded: true }));

  const statementHead = cell([
    para(t(POST_TRAINING.statementHeader, lang), lang, { bold: true, after: 0 })
  ], STATEMENT_COL, { shaded: true });

  const headCells = isRtl(lang)
    ? [...scaleHead].reverse().concat(statementHead)
    : [statementHead, ...scaleHead];

  const rows = [new TableRow({ tableHeader: true, children: headCells })];

  for (const item of section.items) {
    const statement = cell([
      new Paragraph({
        bidirectional: isRtl(lang),
        alignment: isRtl(lang) ? AlignmentType.RIGHT : AlignmentType.LEFT,
        spacing: { after: 0 },
        children: [
          run(t(item.code, lang) + '  ', lang, { bold: true }),
          run(t(item.label, lang), lang)
        ]
      })
    ], STATEMENT_COL);

    const boxes = POST_TRAINING.scale.map(() => cell([
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 0 },
        children: [new TextRun({ text: '☐', font: 'Segoe UI Symbol', size: 26, color: INK })]
      })
    ], SCALE_COL));

    rows.push(new TableRow({
      // Reversing puts the statement on the right and the scale running from
      // 1 beside it outwards, which is how the Arabic screen reads.
      children: isRtl(lang) ? [...boxes].reverse().concat(statement) : [statement, ...boxes]
    }));
  }

  return new Table({
    columnWidths: isRtl(lang)
      ? [SCALE_COL, SCALE_COL, SCALE_COL, SCALE_COL, SCALE_COL, STATEMENT_COL]
      : [STATEMENT_COL, SCALE_COL, SCALE_COL, SCALE_COL, SCALE_COL, SCALE_COL],
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    rows
  });
}

function sheetHead(titlePair, lang) {
  return [
    heading(t(titlePair, lang), lang),
    para(t(PAPER.anonymousNote, lang), lang, { bold: true, after: 0 }),
    rule()
  ];
}

function sheetFoot(lang, isLast) {
  const out = [
    new Paragraph({
      bidirectional: isRtl(lang),
      alignment: isRtl(lang) ? AlignmentType.RIGHT : AlignmentType.LEFT,
      spacing: { before: 240 },
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: RULE, space: 6 } },
      children: [run(t(PAPER.collection, lang), lang, { size: 18, color: '444444' })]
    })
  ];
  if (!isLast) out.push(new Paragraph({ children: [new PageBreak()] }));
  return out;
}

function consentSheet(lang) {
  const prose = [];
  for (const block of CONSENT.blocks) {
    if (block.type === 'h2') prose.push(sectionHeading(t(block, lang), lang));
    else if (block.type === 'strong') prose.push(para(t(block, lang), lang, { bold: true }));
    else if (block.type === 'ul') {
      for (const line of (block[lang] || block.en)) {
        prose.push(new Paragraph({
          bidirectional: isRtl(lang),
          alignment: isRtl(lang) ? AlignmentType.RIGHT : AlignmentType.LEFT,
          spacing: { after: 80 },
          indent: { left: isRtl(lang) ? 0 : 340, right: isRtl(lang) ? 340 : 0 },
          children: [run('— ' + line, lang)]
        }));
      }
    } else prose.push(para(t(block, lang), lang));
  }

  return [
    ...sheetHead(CONSENT.title, lang),
    ...prose,
    rule(),
    question(t(CONSENT.prompt, lang) + '  (' + t(PAPER.tickOne, lang) + ')', lang),
    ...CONSENT.choices.map((choice) => option(t(choice, lang), lang)),
    ...sheetFoot(lang, false)
  ];
}

function preSheet(lang) {
  const body = [para(t(PRE_TRAINING.reminder, lang), lang, { italics: true })];
  for (const section of PRE_TRAINING.sections) {
    body.push(sectionHeading(t(section.title, lang), lang));
    for (const item of section.items) {
      body.push(...(item.type === 'radio' ? radioItem(item, lang) : textItem(item, lang)));
    }
  }
  return [...sheetHead(PRE_TRAINING.title, lang), ...body, ...sheetFoot(lang, false)];
}

function dailySheet(lang) {
  const body = [
    para(t(DAILY_REFLECTION.reminder, lang), lang, { italics: true }),
    question(t(DAILY_REFLECTION.daySelector.label, lang), lang),
    ...DAILY_REFLECTION.daySelector.options.map((o) => option(t(o, lang), lang))
  ];
  for (const item of DAILY_REFLECTION.items) body.push(...textItem(item, lang));
  body.push(sectionHeading(t(DAILY_REFLECTION.finalDayHeading, lang), lang));
  body.push(...textItem(DAILY_REFLECTION.finalDayItem, lang));
  return [...sheetHead(DAILY_REFLECTION.title, lang), ...body, ...sheetFoot(lang, false)];
}

function evalSheet(lang) {
  const body = [
    para(t(POST_TRAINING.reminder, lang), lang, { italics: true }),
    para(t(POST_TRAINING.likertIntro, lang) + '  (' + t(PAPER.tickOnePerRow, lang) + ')', lang)
  ];

  for (const section of POST_TRAINING.likertSections) {
    body.push(sectionHeading(t(section.title, lang), lang));
    body.push(likertTable(section, lang));
    body.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
  }

  body.push(sectionHeading(t(POST_TRAINING.openSection.title, lang), lang));
  for (const item of POST_TRAINING.openSection.items) {
    body.push(...textItem(item, lang, 'eval_' + item.id));
  }
  body.push(para(t(POST_TRAINING.closing, lang), lang, { bold: true }));

  return [...sheetHead(POST_TRAINING.title, lang), ...body, ...sheetFoot(lang, true)];
}

/**
 * The take-away information page required by Research Protocol v1.1 section 5.
 * Briefing text only: nothing to choose, nothing to fill in, nothing to return.
 */
function informationSheet(lang) {
  const prose = [];
  for (const block of CONSENT.blocks) {
    if (block.type === 'h2') prose.push(sectionHeading(t(block, lang), lang));
    else if (block.type === 'strong') prose.push(para(t(block, lang), lang, { bold: true }));
    else if (block.type === 'ul') {
      for (const line of (block[lang] || block.en)) {
        prose.push(new Paragraph({
          bidirectional: isRtl(lang),
          alignment: isRtl(lang) ? AlignmentType.RIGHT : AlignmentType.LEFT,
          spacing: { after: 80 },
          indent: { left: isRtl(lang) ? 0 : 340, right: isRtl(lang) ? 340 : 0 },
          children: [run('— ' + line, lang)]
        }));
      }
    } else prose.push(para(t(block, lang), lang));
  }

  return [
    heading(t(CONSENT.title, lang), lang),
    para(t(PAPER.keepThisPage, lang), lang, { bold: true, after: 0 }),
    rule(),
    ...prose
  ];
}

/** One file, English then Arabic, for printing double sided. */
function buildInformation() {
  return new Document({
    creator: 'Instrument platform',
    title: t(PAPER.informationTitle, 'en'),
    description: 'Participant information sheet, given out and not collected',
    styles: { default: { document: { run: { font: 'Calibri', size: 21, color: INK } } } },
    sections: [{
      properties: { page: { margin: { top: 900, bottom: 800, left: 1000, right: 1000 } } },
      children: [
        ...informationSheet('en'),
        new Paragraph({ children: [new PageBreak()] }),
        ...informationSheet('ar')
      ]
    }]
  });
}

function build(lang) {
  return new Document({
    creator: 'Instrument platform',
    title: t(PAPER.packTitle, lang),
    description: 'Paper fallback for the research instruments',
    styles: { default: { document: { run: { font: font(lang), size: 21, color: INK } } } },
    sections: [{
      properties: {
        page: { margin: { top: 900, bottom: 800, left: 1000, right: 1000 } },
        bidi: isRtl(lang)
      },
      children: [
        ...consentSheet(lang),
        ...preSheet(lang),
        ...dailySheet(lang),
        ...evalSheet(lang)
      ]
    }]
  });
}

async function main() {
  // Same rule as build-paper-forms.js: the canonical four-day pack sits in
  // docs/paper, a shorter programme in docs/paper/<n>-day.
  const paperDir = path.join(__dirname, '..', 'docs', 'paper');
  const outDir = process.argv[2] || (config.programmeDays === CANONICAL_DAYS
    ? paperDir
    : path.join(paperDir, `${config.programmeDays}-day`));
  fs.mkdirSync(outDir, { recursive: true });
  for (const lang of ['en', 'ar']) {
    const file = path.join(outDir, `instruments-${lang}.docx`);
    fs.writeFileSync(file, await Packer.toBuffer(build(lang)));
    console.log('written', path.relative(process.cwd(), file), fs.statSync(file).size, 'bytes');
  }

  const info = path.join(outDir, 'information-sheet.docx');
  fs.writeFileSync(info, await Packer.toBuffer(buildInformation()));
  console.log('written', path.relative(process.cwd(), info), fs.statSync(info).size, 'bytes');
}

main().catch((err) => {
  console.error('could not build the Word forms:', err.message);
  process.exit(1);
});

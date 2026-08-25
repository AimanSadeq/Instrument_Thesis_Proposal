// Builds the SDA Bocconi TP skeleton document per §3.4 formatting guidelines:
// A4, Times New Roman 12pt, double spacing, 2.5cm margins, Roman front matter, Arabic body.
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  TableOfContents, PageNumber, NumberFormat, Footer, PageBreak, ImageRun,
  Table, TableRow, TableCell, WidthType, ShadingType, VerticalAlign,
} = require('docx');
const fs = require('fs');

// --- Appendix G: data-to-RQ alignment matrix ---
// ● primary evidence source, ○ secondary/corroborating, '' none.
const MATRIX = [
  // [source, cycle, RQ1..RQ5, analysis]
  ['Semi-structured interviews (trainers/SMEs; L&D managers)', '1–2', '●','','●','●','○', 'Reflexive Thematic Analysis; Framework Method charting by participant group'],
  ['Focus groups (learners)', '2', '○','●','','●','', 'Reflexive Thematic Analysis'],
  ['Non-participant observation (workshops)', '1–2', '○','●','','○','', 'Field notes coded with RTA against the observation protocol (Appendix C)'],
  ['Artifact analysis: 7 AI-designed component types', '1–2', '●','○','','','', 'Framework matrices against theory rubrics (Appendix D): Mayer/Clark & Mayer; Gagné; SDT/MDA'],
  ['AI prompt/output logs (versioned design history)', '1–2', '●','','','','●', 'Framework Method; audit-trail analysis of AI–human design decisions'],
  ['Pre-training questionnaire (baseline)', '1–2', '','○','','○','', 'Descriptive statistics; baseline context for RTA'],
  ['Daily reflection cards / digital reflections', '1–2', '○','●','','●','', 'RTA of open-ended text'],
  ['Post-training evaluation (Kirkpatrick L1–L2)', '1–2', '○','●','○','●','', 'Descriptive statistics; RTA of open-ended items'],
  ['Pre/post knowledge assessment (platform-embedded)', '2', '','','','●','', 'Descriptive statistics (means, distributions); no inferential claims'],
  ['Behavioral telemetry (decision logs, module progression)', '2', '','○','','○','', 'Descriptive statistics; corroboration of self-report'],
];

const CW = [2470, 780, 520, 520, 520, 520, 520, 3220]; // sums to 9070 twips = 16cm usable A4 width

function mCell(text, { header = false, center = false, width } = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: header ? { type: ShadingType.CLEAR, fill: '1F3864' } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: [new Paragraph({
      alignment: center || header ? AlignmentType.CENTER : AlignmentType.LEFT,
      spacing: { line: 240 },
      children: [new TextRun({ text, bold: header, color: header ? 'FFFFFF' : undefined, size: header ? 18 : 19 })],
    })],
  });
}

function alignmentMatrixTable() {
  const headers = ['Data source', 'Cycle', 'RQ1', 'RQ2', 'RQ3', 'RQ4', 'RQ5', 'Primary analysis'];
  const rows = [
    new TableRow({ tableHeader: true, children: headers.map((h, i) => mCell(h, { header: true, width: CW[i] })) }),
    ...MATRIX.map((r) => new TableRow({
      children: [
        mCell(r[0], { width: CW[0] }),
        mCell(r[1], { center: true, width: CW[1] }),
        mCell(r[2], { center: true, width: CW[2] }),
        mCell(r[3], { center: true, width: CW[3] }),
        mCell(r[4], { center: true, width: CW[4] }),
        mCell(r[5], { center: true, width: CW[5] }),
        mCell(r[6], { center: true, width: CW[6] }),
        mCell(r[7], { width: CW[7] }),
      ],
    })),
  ];
  return new Table({ columnWidths: CW, width: { size: 9070, type: WidthType.DXA }, rows });
}

const CM25 = 1417; // 2.5 cm in twips
const TNR = 'Times New Roman';

const P = (text, opts = {}) => new Paragraph({
  children: [new TextRun({ text, ...opts.run })],
  alignment: opts.align,
  spacing: { line: 480, ...(opts.spacing || {}) },
  ...(opts.para || {}),
});

// Drafting guidance for the candidate, never for the reader.
//
// These are notes to self. "STATUS: drafted, your rewrite pass pending" tells a
// supervisor that the candidate has not read their own work, which is not the
// message. So by default they are collected and printed to the terminal at
// build time, and do not enter the document at all. Set NOTES=1 to render them
// inline when you want to see them in context.
//
// The default is off rather than on deliberately: the version you send by
// accident should be the clean one.
const SHOW_NOTES = process.env.NOTES === '1';
const NOTES = [];
const G = (text) => {
  NOTES.push(text);
  return SHOW_NOTES
    ? new Paragraph({ children: [new TextRun({ text: `[${text}]`, italics: true, color: '8A6A1F' })], spacing: { line: 480 } })
    : new Paragraph({ children: [] });
};

const H1 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)], spacing: { before: 240, after: 120, line: 480 } });
const H2 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)], spacing: { before: 200, after: 80, line: 480 } });

const centered = (text, opts = {}) => P(text, { align: AlignmentType.CENTER, ...opts });

const footerWith = () => new Footer({
  children: [new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ children: [PageNumber.CURRENT] })],
  })],
});

const margins = { top: CM25, bottom: CM25, left: CM25, right: CM25 };

const doc = new Document({
  creator: 'Aiman S. Sadeq',
  title: 'Thesis Proposal - Leveraging Artificial Intelligence for Financial Competence Development',
  styles: {
    default: {
      document: { run: { font: TNR, size: 24 } },
    },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: TNR, size: 32, bold: true, color: '000000' },
        paragraph: { spacing: { before: 240, after: 120, line: 480 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: TNR, size: 26, bold: true, color: '000000' },
        paragraph: { spacing: { before: 200, after: 80, line: 480 }, outlineLevel: 1 } },
    ],
  },
  features: { updateFields: true },
  sections: [
    // ----- Section 1: Cover page (no page number; excluded from numeration) -----
    {
      properties: { page: { margin: margins } },
      children: [
        centered('UNIVERSITÀ COMMERCIALE LUIGI BOCCONI', { run: { bold: true, size: 26 } }),
        centered('SDA BOCCONI SCHOOL OF MANAGEMENT', { run: { bold: true, size: 26 } }),
        centered(''),
        centered('Doctorate in Business Administration', { run: { size: 26 } }),
        centered('Year: 2025–2026'),
        centered(''),
        centered('THESIS PROPOSAL', { run: { bold: true } }),
        centered(''),
        centered('Leveraging Artificial Intelligence for Financial Competence Development:', { run: { bold: true, size: 28 } }),
        centered('A Design-Based Research Study of AI-Assisted Training Design, Gamification, and Organizational Outcomes', { run: { bold: true, size: 28 } }),
        centered(''),
        centered('Advisor: Professor Emanuele Borgonovo'),
        centered(''),
        centered('Thesis Proposal by'),
        centered('Aiman S. Sadeq'),
        centered('ID number: [ID NUMBER]'),
        centered(''),
        centered(`Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`),
        centered('Word count: [EXACT COUNT - includes list of references; excludes tables, figures, appendices]'),
        // Draft marker, filled by stamp-cover.js. Remove before final submission: the
        // guidelines prescribe what the cover page carries, and a build number is not on the list.
        centered('[BUILD STAMP]'),
        centered(''),
        centered('Year 2026'),
      ],
    },
    // ----- Section 2: Front matter (lower-case Roman numerals) -----
    {
      properties: {
        page: { margin: margins, pageNumbers: { start: 1, formatType: NumberFormat.LOWER_ROMAN } },
      },
      footers: { default: footerWith() },
      children: [
        H1('Table of Contents'),
        new TableOfContents('Table of Contents', { hyperlink: true, headingStyleRange: '1-2' }),
        new Paragraph({ children: [new PageBreak()] }),
        H1('Statement Regarding the Use of AI'),
        P('Generative artificial intelligence enters this work at two distinct levels, and they are reported separately below because they carry different obligations.'),
        P('First, as assistance in producing this document. The author used Claude (Anthropic), through claude.ai including Projects, through Claude Code and through Claude Cowork, from August 2026 to the date of submission, to structure drafts from the author’s own outlines and notes, to assemble and format the list of references, to check internal consistency across sections, and to copy-edit. Grammarly was used for spelling and grammar checking throughout the same period. Every research question, the study design, the analytical choices, the interpretations and the conclusions are the author’s own. No text was accepted without review, and no source was cited that the author had not verified.'),
        G('CONFIRM the August 2026 start date for drafting assistance. October 2025 is when the intervention began to be built, which is the second level below, not this one. If any other assistant was used in drafting, add it here.'),
        P('Second, as the object of study. The training artifacts this research examines were themselves designed with generative AI, using Claude (Anthropic) through the same set of tools, beginning in October 2025 with the construction of the FinPlay platform and continuing through the design of the artifacts examined here. That is the intervention under investigation rather than an aid to writing about it. Its division of labour between AI and human experts is the substance of RQ1, the artifacts pass the human-in-the-loop review and subject-matter fact-checking described in Section 4.8, and the model versions and dates applying to each artifact are recorded in the prompt and output logs described in Section 4.5.'),
        G('The proposal promises those prompt and output logs in Sections 4.5 and 4.8 but no appendix currently holds them. Either add one, or reword both sections to say the logs are retained in the research audit trail rather than reproduced in the proposal.'),
        P('The author reviewed all content and asserts that the content within this document is factually accurate and free of plagiarism. The author takes full responsibility for the submitted document.'),
        G('FINALIZE against the AI-ethics guidance document before submission, and check the wording the School requires. The two levels must stay separated: AI as production assistance for this document, and AI as the research object.'),
      ],
    },
    // ----- Section 3: Body (Arabic numerals, restart at 1) -----
    {
      properties: {
        page: { margin: margins, pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL } },
      },
      footers: { default: footerWith() },
      children: [
        // 1. INTRODUCTION - drafted prose (AI-drafted; awaiting candidate rewrite pass)
        H1('1. Introduction of the Research Project'),
        G('STATUS: drafted. Your rewrite-and-judge pass pending. Opens by echoing your Year 1 LR positioning passage and names the literacy→competence refinement explicitly.'),
        ...Object.entries(require('./section1-introduction')).flatMap(([h2, paras]) => [
          H2(h2),
          ...paras.map((t) => new Paragraph({
            children: [new TextRun(t)],
            spacing: { line: 480 },
            indent: { firstLine: 425 },
          })),
        ]),

        // 2. LITERATURE REVIEW - drafted prose (AI-drafted; awaiting candidate rewrite pass)
        H1('2. Literature Review and Research Questions'),
        G('STATUS: drafted against the executed Scopus log of 17 Aug 2026. Your rewrite-and-judge pass pending. Finance-first order (D3). Near-miss studies cited in 2.4/2.6/2.8 come from your own Scopus top-10s.'),
        ...Object.entries(require('./section2-literature-review')).flatMap(([h2, paras]) => [
          H2(h2),
          ...paras.map((t) => new Paragraph({
            children: [new TextRun(t)],
            spacing: { line: 480 },
            indent: { firstLine: 425 },
          })),
        ]),

        // 3. EMPIRICAL SETTING - drafted prose except 3.4 (candidate's reserved passage)
        H1('3. Empirical Setting'),
        G('STATUS: drafted. Your rewrite-and-judge pass pending. 3.4 is yours to write. Confirm whether the training institute is named or described generically, and whether the ministry stays anonymous (draft keeps both unnamed).'),
        ...(() => {
          const s3 = require('./section3-empirical-setting');
          const para = (t) => new Paragraph({ children: [new TextRun(t)], spacing: { line: 480 }, indent: { firstLine: 425 } });
          return [
            H2('3.1 Industry and organizational context'), ...s3['3.1 Industry and organizational context'].map(para),
            H2('3.2 Research sites and access'), ...s3['3.2 Research sites and access'].map(para),
            H2('3.3 Participants'), ...s3['3.3 Participants'].map(para),
            H2('3.4 Candidate positionality and familiarity with the setting'),
            G('READ THIS ONE ALOUD BEFORE SUBMITTING. Positionality is the passage a reader expects in the candidate’s own voice, and this is still my sentences carrying your facts. The facts are now yours: twenty-three years, the partnership since 2016, and the split between the cohort you deliver and the two you do not. Change the wording until it sounds like you.'),
            para('I occupy three roles in this study, though not all three in every cohort. I designed the intervention, working with generative AI to produce its materials. I facilitate the programme, in one of the September cohorts but not in the other two, which a colleague delivers. And I am the researcher who interprets what all of them produce. Behind this sits twenty-three years of delivering finance training to non-finance professionals across the Gulf, and a training partnership with one of the participating organizations that has run since 2016.'),
            para('The position gives me what an external researcher could not obtain. I know why each artifact took the shape it did, because I made those decisions and can still reconstruct them. I work in both languages the training runs in. I have sustained access to delivery, to participants, and to the full design history of the materials under study.'),
            para('It also creates risks, and I would rather name them than leave a reader to infer them. I am disposed to read my own materials generously. Participants may soften their criticism of a programme in front of the person who built it and is standing in front of them. In analysis, I may find the themes my design predicts.'),
            para('The second of those risks is not evenly distributed, and Cycle 1 turns that into something useful rather than merely acknowledging it. In the cohorts a colleague delivers, I am not in the room and the participants do not meet me. The same materials and the same instruments are therefore administered both by the person who designed them and by a person who did not, inside a single cycle. Where the reflections from those cohorts differ from the one I deliver, facilitator effect becomes a reading I can examine rather than a caveat I can only declare.'),
            para('Acknowledging these does not dissolve them. Sections 4.6 and 4.7 set out what is done instead: instruments that are self-administered and returned without identifiers, a reflexivity journal kept across both cycles, participant validation of emerging interpretations, an audit trail opened to supervision at agreed milestones, and, in Cycle 2, delivery and interviewing by trainers other than me.'),
            H2('3.5 Rationale for site and participant selection'), ...s3['3.5 Rationale for site and participant selection'].map(para),
          ];
        })(),

        // 4. METHODOLOGY - drafted prose (AI-drafted per authorship protocol; awaiting candidate rewrite pass)
        H1('4. Methodology'),
        G('STATUS: drafted from the approved design. Your rewrite-and-judge pass pending. Insert the DBR cycle diagram in 4.2 and cross-reference the alignment matrix (Appendix G) in 4.4.'),
        ...Object.entries(require('./section4-methodology')).flatMap(([h2, paras]) => [
          H2(h2),
          ...paras.map((t) => new Paragraph({
            children: [new TextRun(t)],
            spacing: { line: 480 },
            indent: { firstLine: 425 },
          })),
        ]),

        // 5. PRELIMINARY FINDINGS - status-only form (D7/D4); AI-drafted, rewrite pass pending
        H1('5. Preliminary Empirical Findings'),
        G('STATUS: drafted in the status-only form. Draft 1 never depends on incoming data. If Cohort 1 returns are processed by ~17 Sep, early descriptive results are added to 5.2 for Draft 2, labeled preliminary; interpretation there is yours (reserved).'),
        ...Object.entries(require('./section5-findings')).flatMap(([h2, paras]) => [
          H2(h2),
          ...paras.map((t) => new Paragraph({
            children: [new TextRun(t)],
            spacing: { line: 480 },
            indent: { firstLine: 425 },
          })),
        ]),

        H1('List of References'),
        G('APA 7th, alphabetical, 75 entries. Every in-text citation resolved. Entries with [verify …] brackets need author lists/titles completed from database exports in the W4 APA pass; DOIs are added then. Excluded from the 8,000–11,000 band; INCLUDED in the cover-page word count.'),
        ...require('./references').map((r) => new Paragraph({
          children: [new TextRun(r)],
          spacing: { line: 480 },
          indent: { left: 720, hanging: 720 },
        })),
        H1('Appendices'),
        ...(() => {
          const { A, B, C, D_INTRO, D1, D2, D3 } = require('./appendices-a-d');
          const para = (t) => new Paragraph({ children: [new TextRun(t)], spacing: { line: 480 } });
          const item = (t) => new Paragraph({ children: [new TextRun(t)], spacing: { line: 480 }, indent: { left: 284 } });
          const sub = (t) => new Paragraph({ children: [new TextRun({ text: t, bold: true })], spacing: { before: 160, after: 60, line: 480 } });
          const guide = (g) => [
            ...g.intro.map(para),
            ...g.sections.flatMap(([h, items]) => [sub(h), ...items.map(item)]),
          ];
          const RW = [1900, 6070, 550, 550];
          const rubricTable = (r) => [
            sub(r.title),
            new Table({
              columnWidths: RW,
              width: { size: 9070, type: WidthType.DXA },
              rows: [
                new TableRow({ tableHeader: true, children: ['Dimension', 'What exemplary (4) looks like', 'Rating', 'Evidence'].map((h, i) => mCell(h, { header: true, width: RW[i] })) }),
                ...r.rows.map(([dim, desc]) => new TableRow({ children: [
                  mCell(dim, { width: RW[0] }),
                  mCell(desc, { width: RW[1] }),
                  mCell('', { center: true, width: RW[2] }),
                  mCell('', { width: RW[3] }),
                ] })),
              ],
            }),
          ];
          return [
            H2('Appendix A. Interview guide (trainers/SMEs, L&D managers)'),
            ...guide(A),
            H2('Appendix B. Focus group guide (learners)'),
            ...guide(B),
            H2('Appendix C. Observation protocol (workshops)'),
            ...C.intro.map(para),
            H2('Appendix D. Artifact audit rubrics (Mayer; Gagné; SDT/MDA)'),
            ...D_INTRO.map(para),
            ...rubricTable(D1),
            ...rubricTable(D2),
            ...rubricTable(D3),
          ];
        })(),
        H2('Appendix E. Conceptual framework diagram'),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 60 },
          children: [new ImageRun({
            type: 'png',
            data: fs.readFileSync(__dirname + '/conceptual-framework.png'),
            transformation: { width: 600, height: 372 },
          })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { line: 480 },
          children: [new TextRun({ text: 'Figure E.1. Conceptual framework: AI-assisted training design as the intervention, gamification and simulation as the engagement mechanism, financial competence development as the outcome, with organizational adoption and responsible-AI governance as enabling conditions, iterated across two Design-Based Research cycles. Each element is mapped to its research question (RQ1–RQ5).', italics: true, size: 22 })],
        }),
        H2('Appendix F. DBR cycle diagram'),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 60 },
          children: [new ImageRun({
            type: 'png',
            data: fs.readFileSync(__dirname + '/dbr-cycle.png'),
            transformation: { width: 600, height: 336 },
          })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { line: 480 },
          children: [new TextRun({ text: 'Figure F.1. The two-cycle Design-Based Research structure. Each cycle iterates analysis, design, implementation, and reflection; the systematic-redesign bridge carries Cycle 1 reflection outputs into Cycle 2 analysis and design; each reflection phase produces the study’s dual output, a refined intervention and an updated statement of design principles.', italics: true, size: 22 })],
        }),
        H2('Appendix G. Data-collection-to-RQ alignment matrix'),
        alignmentMatrixTable(),
        new Paragraph({
          spacing: { before: 80, line: 480 },
          children: [new TextRun({ text: 'Table G.1. Alignment of data sources to research questions across the two Design-Based Research cycles. ● = primary evidence source for the research question; ○ = secondary/corroborating source. In Cycle 1 the learner instruments are self-administered on a standalone anonymous web platform separate from FinPlay, with printed packs held as a recorded fallback; in Cycle 2 they are embedded in FinPlay itself. Interviews are marked for both cycles because two are conducted in Cycle 1, one with the colleague who delivers the three-day cohorts and one with a client training contact, so that the reflection phase can evidence the division of design labour and the adoption question, neither of which the learner instruments reach. Every research question is served by at least two independent sources, and every source is analyzed as specified in Section 4.5.', italics: true, size: 22 })],
        }),
        H2('Appendix H. Ethics and consent documentation'),
        ...(() => {
          const para = (t) => new Paragraph({ children: [new TextRun(t)], spacing: { line: 480 }, indent: { firstLine: 425 } });
          return [
            para('The study’s ethics arrangements are consolidated in a standalone Research Protocol and Data Management Plan (v1.3, August 2026), reviewed with the supervisor ahead of Cohort 1 and maintained under version control so that supervisory revisions form part of the audit trail. Its core commitments are summarized here; the full document accompanies this proposal.'),
            para('Participation and consent. Attendance at the training is arranged by the employer; participation in the research is individually voluntary and governed by a bilingual consent and briefing sheet (the first instrument of the suite) administered on Day 1 before any teaching content. Declining is procedurally invisible: agreeing and declining are presented as two options of equal prominence, submitted by the same action and returning the same closing screen, so every person in the room performs the same visible sequence and neither the facilitator nor the employer can identify who declined. A decline is held as an anonymous count carrying no identifier. No employment consequence attaches to the decision. Consent covers all four days’ instruments; withdrawal is exercised by not submitting a subsequent instrument.'),
            para('Anonymity and the facilitator-researcher dual role. All instruments are self-administered and anonymous at source: no names, employee numbers, or identifiers are collected anywhere, demographic items use coarse categorical bands to prevent deductive identification in a small cohort, and responses are submitted directly to the collection platform, which retains no IP address, user agent, cookie or time of day, records the training day and calendar date only, and gives the facilitator a route to submission counts but none to response contents. The researcher maintains a reflexivity journal and a deviations log, both reviewed in supervision.'),
            para('Data handling. Instrument returns are exported within 48 hours of the final training day and verified against the platform’s own row counts, stored encrypted with access restricted to the researcher, and the source records are deleted once the export is verified complete. Where a printed pack is substituted for a screen, the paper originals are locked, digitized on the same 48-hour clock, and destroyed after thesis acceptance, as the protocol requires. No participant responses are entered into generative AI systems. Institutional ethics review, including the Consent Form process of the Bocconi ethics portal, is completed before Cycle 2 fieldwork; participant questions are directed to the researcher and to the institutional ethics contact (ethics@unibocconi.it).'),
          ];
        })(),
        H2('Appendix I. PDPL compliance summary'),
        new Paragraph({ children: [new TextRun('The study operates under the Kingdom of Saudi Arabia’s Personal Data Protection Law and its Implementing Regulations (2023); where participants or data flows touch the United Arab Emirates, Federal Decree-Law No. 45 of 2021 applies with equivalent core principles. Table I.1 maps each statutory principle to its implementation in the research design. The controlling design fact is that the study’s instruments are anonymous at source: no personal data as defined by the law is collected from participants, which satisfies the minimization principle structurally rather than procedurally.')], spacing: { line: 480 }, indent: { firstLine: 425 } }),
        (() => {
          const IW = [2600, 6470];
          const rows = [
            ['Lawful basis and consent', 'Informed consent via the bilingual consent and briefing sheet, administered before any data collection; voluntariness stated and procedurally protected.'],
            ['Notice and transparency', 'Day-1 briefing identifies the research, the institution, the supervisor, the purposes of collection, and participants’ rights; participants retain the information page.'],
            ['Data minimization', 'Anonymous-at-source design: no names or identifiers collected; demographic items limited to coarse categorical bands (role band, experience band).'],
            ['Purpose limitation', 'Data used solely for the doctoral research and program improvement, as stated in the briefing; no secondary use, no marketing, no sharing with the employer at individual level.'],
            ['Security of processing', 'Submission direct to the collection platform over TLS, hosted in the United States, with no IP address, user agent or time of day retained; export within 48 hours, verified against platform row counts; encrypted storage with access restricted to the researcher; source records deleted once the export is verified.'],
            ['Retention and destruction', 'Source records deleted once the export is verified complete; any substituted paper originals locked and destroyed after thesis acceptance; anonymized digital data retained per SDA Bocconi requirements, then deleted.'],
            ['Cross-border transfer', 'No personal data is collected, so no cross-border transfer of personal data occurs; anonymized research data handled under the institution’s procedures.'],
            ['Data subject rights', 'Withdrawal available at any time by not submitting a subsequent instrument; because responses carry no identifier and no linkage, participants are informed that a submitted anonymous response cannot afterwards be located or retrieved.'],
          ];
          return new Table({
            columnWidths: IW,
            width: { size: 9070, type: WidthType.DXA },
            rows: [
              new TableRow({ tableHeader: true, children: ['PDPL principle', 'Implementation in this study'].map((h, i) => mCell(h, { header: true, width: IW[i] })) }),
              ...rows.map((r) => new TableRow({ children: [mCell(r[0], { width: IW[0] }), mCell(r[1], { width: IW[1] })] })),
            ],
          });
        })(),
        new Paragraph({ children: [new TextRun({ text: 'Table I.1. Mapping of KSA PDPL principles to the study’s data-handling design. The same mapping satisfies the corresponding provisions of UAE Federal Decree-Law No. 45 of 2021.', italics: true, size: 22 })], spacing: { before: 80, line: 480 } }),
        H2('Appendix J. Systematic search log (Scopus, 17 August 2026)'),
        new Paragraph({ children: [new TextRun('All searches were executed in Scopus Advanced Search on 17 August 2026 under institutional access, using the verbatim query strings of the study search protocol, with results restricted to the Documents tab (preprints excluded) and sorted by relevance. Counts reflect database state on the search date. Raw counts for queries containing broad terms (e.g., \u201csimulation,\u201d \u201cAI\u201d) bound the adjacent literatures rather than measure topical relevance; relevance screening of ranked results identified the near-miss studies discussed in Sections 2.4, 2.6, and 2.8. The full log - query strings, top-ranked records, subject-area distributions, and methodological caveats - is retained in the research audit trail.')], spacing: { line: 480 }, indent: { firstLine: 425 } }),
        (() => {
          const JW = [700, 3970, 2200, 2200];
          const rows = [
            ['1', 'AI in instructional design', '17 Aug 2026', '4,609'],
            ['2', 'eLearning design science', '17 Aug 2026', '203'],
            ['3', 'Gamification (articles and reviews)', '17 Aug 2026', '11,860'],
            ['3b', 'Finance-specific gamification', '17 Aug 2026', '8,530'],
            ['4', 'Financial education for adults', '17 Aug 2026', '777'],
            ['5', 'Training evaluation', '17 Aug 2026', '2,380'],
            ['6', 'Technology adoption (AI in education)', '17 Aug 2026', '2,765'],
            ['7', 'Design-Based Research (professional settings)', '17 Aug 2026', '371'],
          ];
          return new Table({
            columnWidths: JW,
            width: { size: 9070, type: WidthType.DXA },
            rows: [
              new TableRow({ tableHeader: true, children: ['#', 'Query theme', 'Date run', 'Total results'].map((h, i) => mCell(h, { header: true, width: JW[i] })) }),
              ...rows.map((r) => new TableRow({ children: r.map((c, i) => mCell(c, { center: i !== 1, width: JW[i] })) })),
            ],
          });
        })(),
        G('Appendices are EXCLUDED from the 8,000–11,000 band (official guidelines). Instruments can be included in full. Bilingual instruments: include English versions; note Arabic versions available.'),
        H2('Appendix K. AI prompt and output log: fields and specimen entry'),
        ...(() => {
          const para = (t) => new Paragraph({ children: [new TextRun(t)], spacing: { line: 480 }, indent: { firstLine: 425 } });
          return [
            para('Sections 4.5, 4.6 and 4.8 rely on a versioned record of how each training artifact was produced with generative AI. That record is the primary evidence for the division of design labour between AI and human experts (RQ1), and it is what makes the governance claims in RQ5 auditable rather than asserted. The full log covers the design history of all seven component types across both cycles and is retained in the research audit trail. What follows is its structure, so that a reader can see what is captured and what is not, and a single specimen entry.'),
            para('Two features of the log matter for the argument. First, it records the disposition of every AI output, not only the ones that were used, so the rejected and heavily edited outputs are as visible as the accepted ones. Second, it records the model and version against each artifact, which is what anchors the findings to a documented technological state as Section 4.7 requires.'),
          ];
        })(),
        (() => {
          const KW = [2400, 6670];
          const rows = [
            ['Entry ID and date', 'Sequential identifier and the date of the generation, so that entries order against the versioned artifact history.'],
            ['Component type', 'Which of the seven types the output belongs to: facilitator presentation, instructor manual, delegates’ materials, case study, workshop, assessment and exercises, or eLearning module.'],
            ['Model and version', 'The generative model and its version string as reported at the time of use, with the interface through which it was used.'],
            ['Prompt', 'The instruction as issued, verbatim, including any system or role framing and any supplied source material.'],
            ['Output disposition', 'Accepted as generated, accepted with edits, substantially rewritten, or rejected. This is the field that carries the division-of-labour finding for RQ1.'],
            ['Human intervention', 'What the human changed and why, in the researcher’s words, for every entry not accepted as generated.'],
            ['Subject-matter review', 'The reviewer, the date, and the outcome of the fact-check required by Section 4.8 before any artifact is deployed.'],
            ['Errors and bias noted', 'Factual errors, hallucinated sources, and cultural or linguistic issues identified in the output, whether or not the output was used.'],
            ['Linked artifact version', 'The version of the deployed artifact this entry produced, so the log joins to the artifact audit in Appendix D.'],
          ];
          return new Table({
            columnWidths: KW,
            width: { size: 9070, type: WidthType.DXA },
            rows: [
              new TableRow({ tableHeader: true, children: ['Field', 'What it records'].map((h, i) => mCell(h, { header: true, width: KW[i] })) }),
              ...rows.map((r) => new TableRow({ children: [mCell(r[0], { width: KW[0] }), mCell(r[1], { width: KW[1] })] })),
            ],
          });
        })(),
        new Paragraph({
          spacing: { before: 80, line: 480 },
          children: [new TextRun({ text: 'Table K.1. Fields carried by the AI prompt and output log. The log is maintained across both Design-Based Research cycles and retained in the research audit trail; Section 4.6 lists it among the materials open to supervisory review.', italics: true, size: 22 })],
        }),
        new Paragraph({ children: [new TextRun('The form of the record, stated precisely. The artifacts examined here were produced between October 2025 and the date of this proposal, and the primary record of their production is the set of dated interaction transcripts held by the candidate. Those transcripts are contemporaneous: they were written as the work was done rather than reconstructed afterwards. The structured log described above is compiled from them, and the compilation is in progress rather than complete at the date of this proposal. The thesis will reproduce the compiled log with worked specimen entries; this appendix sets out the fields it carries so that the reader can see now what will be evidenced then.')], spacing: { line: 480 }, indent: { firstLine: 425 } }),
        new Paragraph({ children: [new TextRun('One consequence is worth stating rather than leaving to be discovered. Because the record of the design process is the transcript set, its preservation is a research-data question and not only a convenience. The transcripts are backed up independently of the machine on which they were produced, and the backup is listed in the data management plan alongside the instrument data.')], spacing: { line: 480 }, indent: { firstLine: 425 } }),
        G('OPTIONAL, AND BETTER LATER THAN RUSHED. A worked specimen entry would strengthen this appendix, particularly one where AI output was rejected or substantially rewritten. It is not required for a proposal, and the specimen will be stronger chosen from the complete transcript set than from whichever exchange is quickest to find now. What IS required before this claim can stand: that the transcripts are actually backed up. Do that this week; it costs an afternoon and the thesis depends on it.'),

      ],
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  require('fs').writeFileSync(process.argv[2] || 'TP_Skeleton_Sadeq.docx', buf);
  console.log('written', (buf.length / 1024).toFixed(1) + 'KB');
  if (NOTES.length && !SHOW_NOTES) {
    console.log(`\n${NOTES.length} drafting notes, kept OUT of the document (NOTES=1 to render them inline):`);
    NOTES.forEach((n, i) => console.log(`  ${String(i + 1).padStart(2)}. ${n.replace(/\s+/g, ' ').slice(0, 150)}`));
  }
});

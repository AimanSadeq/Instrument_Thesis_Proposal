'use strict';

/**
 * Build the printable Word version of docs/PRE_COURSE_CHECKLIST.md.
 *
 * The markdown is the source of truth; this produces the copy the researcher
 * carries. `docx` is not a dependency of the application and deliberately is
 * not in package.json: install it where you run this.
 *
 *   npm install docx
 *   node scripts/build-checklist-docx.js docs/Pre_course_checklist_Cohort_1.docx
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

const doc = new Document({
  creator: 'Instrument platform',
  title: 'Pre-course checklist, Cohort 1',
  description: 'Checklist for running Cohort 1 of the finance-for-non-finance programme',
  styles: {
    default: { document: { run: { font: 'Calibri', size: 21, color: INK } } }
  },
  sections: [{
    properties: { page: { margin: { top: 900, bottom: 900, left: 1000, right: 1000 } } },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: 'Pre-course checklist · Cohort 1 · 6 to 9 September 2026', size: 16, color: SOFT })]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ children: ['Page ', PageNumber.CURRENT, ' of ', PageNumber.TOTAL_PAGES], size: 16, color: SOFT })]
        })]
      })
    },
    children: [
      title('Pre-course checklist, Cohort 1'),
      meta('Programme', '6 to 9 September 2026, hotel venue, approximately 25 participants'),
      meta('Service', 'https://instrument-platform.onrender.com'),
      meta('Export deadline', '11 September 2026 (Protocol v1.1 section 7, within 48 hours)'),
      intro('Print this. Tick as you go. Anything not ticked by 5 September is a decision to make rather than a task to forget.'),

      section('A. This week'),
      tick('**Send the client coordinator the authorisation note.** Protocol section 7 requires their confirmation that completing externally hosted research forms is permitted, recorded in the audit trail.'),
      tick('**File their reply.** A friendly "yes, fine" in writing is what section 7 asks for. Without it there is nothing in the file.'),
      tick('**Set INSTRUMENTS_OPEN to false** in Render, Environment. Nothing should be collected before the cohort.'),
      note('Setting it back to true is on the Day 1 list below, because forgetting is the obvious failure.'),
      tick('**Note Render’s log retention** while you are in the dashboard. This is outstanding item O2, and it decides the wording in section 7 of the protocol.'),
      tick('**Supervisor review** of the protocol and consent materials, per section 9.'),

      section('B. Protocol decisions'),
      body('The five open flags in PROTOCOL_CONFORMANCE.md. Each needs a decision, not code.'),
      tick('**The voluntariness reminder.** The protocol says every subsequent instrument opens with one; the pre-training questionnaire has none. Either add the line, as instruments v2.1, or amend the protocol.'),
      tick('**"Connection metadata is not logged, not retained."** Narrow this to what the study can evidence, or confirm it against Render’s answer.'),
      tick('**Response IDs** are generated when a row is written, not at export. The substance holds; decide whether the wording changes or the code does.'),
      tick('**No responses into generative AI systems.** This applies to handling the export, including pasting it into an assistant.'),
      tick('**The paper procedure**, described one way in the protocol and another in the run sheet. Make them agree.'),

      section('C. Printing, by 3 September'),
      tick('**Information sheet**, one double-sided page per participant, plus spares. English one side, Arabic the other. Handed out on Day 1 to everyone, whether they take part or not.'),
      tick('**Paper fallback, English.**'),
      tick('**Paper fallback, Arabic.**'),
      tick('**Four copies of the daily reflection per participant**, one for each day.'),
      tick('**Collection box**, something to seal it with, and spare pens.'),
      tick('**The link and QR code for each instrument**, ready to project. They are on the admin page; screenshot them into your slides so you are not logging in during a session.'),

      section('D. Testing, by 3 September'),
      tick('**The Day 4 path on the live service.** Open /daily, choose Day 4, confirm the R4 question appears, submit.'),
      note('This is the only route in the application never exercised against the deployment, and it only matters on the last day, when there is no second chance.'),
      tick('**Three real devices**, at least one Android and at least one iPhone. Check that Arabic reads right to left throughout, that the page does not zoom when you tap a text box, and that the Likert grid is usable one-handed.'),
      tick('**Delete anything those tests created.** The admin page with the export secret, then DELETE ALL RESEARCH DATA.'),
      tick('**Confirm the tables are empty.** Run post_deploy_check.sql in the Supabase SQL editor: nine rows, all pass.'),

      section('E. At the venue, 5 September'),
      tick('**Open all four URLs on the hotel wi-fi**, on a device that is not yours.'),
      tick('**Find the captive portal.** Hotel wi-fi usually makes you accept terms first. A participant who scans the QR code before clearing it gets the hotel’s page and concludes the link is broken. Know what it looks like.'),
      tick('**Scan a projected QR code** from where the back row will sit.'),

      section('F. Morning of Day 1, 6 September'),
      tick('**Set INSTRUMENTS_OPEN to true.** Render, Environment, save. It takes two or three minutes to redeploy. Do it before the room arrives, never mid-session.'),
      tick('**Check the admin page**: counts all zero, header reads "instruments open", cohort cohort-1, date correct.'),
      tick('**Confirm the facilitator holds ADMIN_SECRET** and the URL. Not the export secret. That separation is the control protocol section 6 relies on.'),
      tick('**Get the room onto the wi-fi and through the portal** before any link goes up.'),
      tick('**Read the briefing** from the run sheet, English and Arabic.'),
      tick('**Display the consent link.** Everyone opens it, whether taking part or not. Allow three minutes.'),
      tick('**Display the pre-training questionnaire link.** Five minutes. Do not check who is completing it.'),

      section('G. Each day'),
      tick('Display the daily reflection link before people leave. Five minutes.'),
      tick('After the session, **counts only** in the admin view, never contents.'),
      tick('Record anything unusual in the **deviations log**: technical failures, fallback to paper, interruptions, anything said in the room that might have influenced responses.'),
      tick('Write the **reflexivity journal** entry the same evening.'),

      section('H. Day 4'),
      tick('Daily reflection link as usual. R4 appears when Day 4 is chosen.'),
      tick('Then the post-training evaluation link. Ten minutes.'),
      tick('Once everyone has finished, **set INSTRUMENTS_OPEN to false.**'),

      section('I. Export and deletion, by 11 September'),
      tick('The admin page with the **export secret**.'),
      tick('**Note the counts** per instrument.'),
      tick('**Download the JSON**, all instruments.'),
      tick('**Download each CSV**, four files. Row counts are in the filenames.'),
      tick('**Check the row counts** in the files against the counts on screen. This is what "verifiable as complete" means in section 7.'),
      tick('**Store the exports encrypted**, access restricted to you.'),
      tick('**Delete all source records**: type DELETE ALL RESEARCH DATA. Keep the before-and-after table for the audit trail.'),
      tick('**Re-run post_deploy_check.sql.** Nine pass, tables empty.'),

      section('J. Before Cohort 2, October'),
      tick('Cohort 1 exported, verified and deleted first.'),
      tick('Set COHORT to cohort-2 in Render.'),
      tick('Set INSTRUMENTS_OPEN to true on the morning of Day 1.'),
      tick('New client, new authorisation confirmation.'),
      tick('Reprint everything.'),

      section('K. After Cohort 2'),
      tick('Final export, counts verified.'),
      tick('Delete all source records.'),
      tick('**Delete the Supabase project and the Render service.** Section 7 commits to no research data remaining on third-party infrastructure beyond the collection period, and an empty table in a live project is not the same as no project.'),

      section('If something fails on the day'),
      body('**A participant says it would not send.** They will have seen a message saying nothing was recorded, with their answers still on screen. Ask them to press Submit again. If it fails twice, give them the paper copy and record the substitution.'),
      body('**The site will not load for anyone.** Check INSTRUMENTS_OPEN and that the Render service is running. If the network is the problem, go to paper for that instrument.'),
      body('**Paper is used at all.** Completed sheets go in the collection box unfolded and unmarked, the box is sealed in the room, and the substitution goes in the deviations log.'),
      new Paragraph({
        spacing: { before: 200 },
        border: { top: { style: BorderStyle.SINGLE, size: 6, color: 'C9CFD8', space: 8 } },
        children: rich('**Never**, on any day: read response contents, look at anyone’s screen, or help anyone complete an instrument. Answer what an item means, never what to write.')
      })
    ]
  }]
});

Packer.toBuffer(doc).then((buffer) => {
  const out = process.argv[2];
  fs.writeFileSync(out, buffer);
  console.log('written', out, fs.statSync(out).size, 'bytes');
});

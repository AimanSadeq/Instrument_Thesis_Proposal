# Verification report

**Build:** anonymous research instrument platform
**Against:** *Build brief: anonymous research instrument platform*, section 7, and the hard requirements in section 3
**Governing document:** Research Protocol and Data Management Plan v1.1. The section-by-section check against it, and the six items that need the candidate's decision, are in `PROTOCOL_CONFORMANCE.md`
**Instrument content:** Research Instruments v2.0, English and Arabic
**Date of this report:** 21 August 2026

Every line of the section 7 checklist is answered below, with what was
checked and how. Three things could not be verified from a build environment
and are listed as **outstanding** with the exact steps to close them. One
requirement cannot be met as literally written; it is reported first, not
worked around.

---

## 1. Requirement that cannot be met as written

### Section 3.5: "Those who decline see no further instrument prompts on their device"

**Status: cannot be met as written. Reported rather than resolved in code.**

To suppress later prompts on a particular device, the application would have
to recognise that device on a later visit. Recognising a device means a
cookie, a storage entry, a token in the URL or a fingerprint. Section 3.1
forbids all four, and section 3.2 forbids "not even a random one persisted on
the device". The two requirements cannot both hold.

The requirement is also in tension with the sentence directly above it in the
same section: both consent options must land on an **identical** confirmation
screen. A confirmation screen that offers an onward link after agreeing, and
does not after declining, is not identical, and an observer in the room could
read the difference from across the table.

**What was built instead, and why it satisfies the intent.** The application
never prompts anyone, at any point, for any instrument.

- The confirmation screen is terminal. It carries no onward link, no "next
  step", and no reference to any other instrument, for either choice. The
  two screens are byte for byte identical, verified by hash.
- No screen anywhere links to another instrument. There is no menu, no index
  and no navigation.
- Each instrument has its own short URL and its own QR code. The facilitator
  displays the right one at the right moment, exactly as the run sheet in
  Research Instruments v2.0 part 3 already describes. A participant who
  declined simply does not open it, and nothing on their screen ever suggests
  that they should.

A participant who declines is therefore never prompted again by this
software. What the software cannot do is *stop* that participant from opening
a link displayed to the whole room, and it cannot do so without breaking
anonymity. If the protocol requires stronger suppression than this, the
protocol needs a different mechanism, not a different implementation.

---

## 2. Section 7 checklist

### Identity and linkage

| Line | Result |
|---|---|
| No login, registration or email capture exists anywhere in the codebase | **Pass.** There is no auth code, no user table, no email field and no dependency capable of authenticating a participant. `npm run verify:privacy` scans everything served for `passport`, `bcrypt`, `jsonwebtoken`, sign-up and registration patterns and reports clean. The only dependencies are `express`, `pg` and `qrcode`, asserted by test *no dependency is a tracker, an auth library or a logger*. |
| No cookie, localStorage, sessionStorage or device identifier is set. Verified in browser dev tools on a real device | **Pass in a real browser engine; the real-device half is outstanding.** `scripts/screenshots.js` drives Chromium through every screen in both languages on two emulated phone profiles and then reads `document.cookie`, `localStorage.length`, `sessionStorage.length` and the browser's cookie jar. All four are empty on every run, and the script fails loudly if any is not. Responses were also checked for `Set-Cookie` and `ETag` headers on every route, including the static files: none present (test *the response never carries a cookie, an ETag or a client hint request*). ETag is switched off explicitly rather than left in place. See outstanding item **O1**. |
| Two submissions from the same device are indistinguishable from two submissions from different devices, in the database | **Pass.** Test *two submissions from one device are indistinguishable from two devices* submits identical answers twice from one client and once from a client presenting a different user agent and a different `Accept-Language`. The three stored rows are identical in every column except the random primary key. |
| No table, column or foreign key connects to FinPlay | **Pass.** Separate project, separate database schema (`research`), separate deployment. `pg_constraint` holds no foreign key of any kind in the schema, so no instrument can be joined to another, let alone to another system. No table anywhere in the database matches `%finplay%`. The word appears in exactly one place in this repository: the consent text, where it tells participants that these forms are separate from it. |

### Metadata

| Line | Result |
|---|---|
| No IP address in any table. Verified by inspecting stored rows, not by reading the code | **Pass.** `npm run verify:rows` prints the stored rows and asserts that no value matches an IPv4 pattern; the column list of each table is asserted against an explicit expected list, so a new column cannot appear unnoticed. The application never reads a client address: `trust proxy` is off and the request's address property is not referenced anywhere in the served code. |
| No user-agent or referrer stored | **Pass.** Same row inspection asserts no value matches `Mozilla`, `AppleWebKit`, `Android` or `iPhone OS`. `Referrer-Policy: no-referrer` is sent on every response, and the source scan reports no reference to either header. |
| Supabase and Render request logging reviewed and IP capture disabled or confirmed non-retained | **Partly outstanding.** What is settled: participants never connect to Supabase. Only the Render service holds a database connection, so any address a Postgres log could record is the server's, never a participant's. The application itself has no request logger, deliberately — that is where the address, the user agent and the exact submission time would otherwise be written. What remains is the platform edge, which this build cannot inspect. See outstanding item **O2**. |
| No column stores a time component. Verified by inspecting stored rows | **Pass.** `db/checks/no_time_columns.sql` returns no rows: no `timestamp`, `timestamptz`, `time`, `timetz` or `interval` column exists. `db/checks/no_defaults_with_now.sql` returns no rows: nothing defaults to `now()`, `current_timestamp`, `current_date` or a clock reading. The rows themselves were inspected: every `submission_date` matches `^\d{4}-\d{2}-\d{2}$`, and no stored value anywhere contains `HH:MM` or an ISO `T` timestamp. The Postgres driver is configured to hand back `DATE` columns as plain strings, because it would otherwise build a JavaScript `Date` and put a time and a zone offset into the export files. The date is computed by the application in `Asia/Riyadh`, never by the database. |

### Consent

| Line | Result |
|---|---|
| Both options identical in size, weight, colour, position. Screenshot both states | **Pass.** The two options are submit buttons sharing one CSS rule; there is no `:first-child`, `:last-child` or "primary" variant anywhere in that block. Computed styles were measured in the browser on both phone profiles in both languages: width, height, font size, font weight, colour, background, border and text alignment are identical, and the screenshot script fails if they ever differ. Evidence: `docs/screenshots/*-consent-choices.png` and `*-consent.png`. |
| Both land on the same confirmation screen. Screenshot | **Pass.** Both submit to the same URL and are redirected to the same URL, `/done?i=consent&lang=…`, which does not vary with the choice. The rendered page is byte for byte identical, asserted in test *consent: agreeing and declining are indistinguishable to an observer*, and the two screenshots are identical files: `iphone-ar-confirmation-after-agree.png` and `iphone-ar-confirmation-after-decline.png` share the SHA-256 hash `5637205058422c953f339dca5be6df03d4f6f50f83cac1ef94f0a3e0fe780f6d`. The confirmation text does not name the choice. |
| Neither is pre-selected | **Pass.** Nothing on the consent screen can hold a selected state: a button carries no state, and the rendered HTML contains no `checked` attribute at all. One tap submits, so nothing sits on screen afterwards for an observer to read. |

### Bilingual

| Line | Result |
|---|---|
| Full right-to-left rendering in Arabic, including tables, radio buttons and the toggle | **Pass.** `dir="rtl"` is set on the root element, so direction is inherited by everything inside it, and every rule in the stylesheet uses logical properties (`inline-start`, `margin-block`, `padding-inline`) rather than left and right. Verified visually on the captured screens: headings, radio options, open-text fields, the Likert grid and the language toggle itself all run right to left, and the Arabic-Indic numerals ١–٥ and ١–٤ appear as supplied in the instrument document. Test *every screen renders in both languages* asserts the direction attribute and the presence of the toggle on all five screens. |
| Tested on at least three real devices, including at least one Android and one iPhone | **Outstanding.** See **O1**. |
| Screenshots of every Arabic screen on a phone, including a failed submission | **Pass, on emulated phones.** `docs/screenshots/` holds every Arabic screen at two phone sizes: consent, consent options close up, confirmation after each choice, pre-training questionnaire, daily reflection, daily reflection with the last day selected, and the post-training evaluation. These are Chromium at phone viewports, which is not the same as Safari on a physical iPhone; **O1** covers that. |

### Operational

| Line | Result |
|---|---|
| Tested on a restricted network, or the limitation flagged if unavailable | **Flagged, and the payload was minimised for it.** No corporate network was available here. The page reaches exactly one origin, its own: no font service, no CDN, no analytics, no external script or stylesheet. A Content-Security-Policy of `default-src 'none'` with `'self'` for scripts, styles, images and form actions means a page that tried to reach anywhere else would fail visibly rather than silently. Total download for the heaviest screen, the post-training evaluation, is a 21 KB HTML document plus a 10 KB stylesheet and a 7 KB script, uncompressed and cached after the first screen. See **O3**. |
| Submission failure produces a clear, visible error, not a silent loss | **Pass.** Three failure paths were exercised. A validation failure re-renders the form with the answers still in place and a message at the top, in the participant's language (test *a submission with no day is refused, clearly*). A database failure returns the same form, the same answers and a message that says nothing was recorded and to try again, and to tell the facilitator, who holds paper copies. A connection failure is caught in the browser: the answers stay on screen and a message says the connection failed and nothing was recorded. With JavaScript switched off, every form is an ordinary POST and the server renders the same messages; every test in the suite exercises exactly that path, because none of them runs JavaScript. The connection failure was also reproduced in a real browser with the network switched off, in `npm run verify:browser`: the message appears in the participant's language, the answers stay in the fields, the page does not navigate away, and pressing Submit again once the connection returns completes the submission. Evidence: `docs/screenshots/iphone-ar-submission-failed.png`. Nothing is ever truncated silently: an over-long answer is refused with a message rather than shortened (test *an over-long answer is refused with a message, not truncated silently*). |
| Export produces complete CSV and JSON with row counts | **Pass.** JSON export carries every table, its row count, and the counts the admin view shows, inside the file, so completeness can be checked without trusting the screen. CSV export is one file per instrument, named with the cohort, the date and the row count, and begins with a byte order mark so that Excel opens the Arabic correctly. Quoting was tested against a response containing a comma, a double quote and a newline. Tests *the researcher secret exports complete JSON with row counts*, *CSV export is complete, quoted correctly and readable as Arabic*, *a CSV field containing a comma, a quote or a newline survives the round trip*. |
| Admin view exposes counts only, and response contents are unreachable through it | **Pass, and tightened.** The counts page renders counts and nothing else: tests assert that the text of stored responses does not appear anywhere in the page, in either language. Beyond the brief, the export and delete functions are behind a **second** secret. The facilitator holds `ADMIN_SECRET`, which shows counts and cannot export or delete (both refused with 403, asserted in test *the facilitator secret cannot export or delete*). The researcher holds `EXPORT_SECRET`. The two must differ or the application refuses to start in production. |

### Instrument content, from section 4

| Line | Result |
|---|---|
| Implemented verbatim: nothing reworded, reordered, added or dropped | **Pass.** `npm run verify:wording` takes all 248 participant-facing strings out of `src/content/instruments.js`, English and Arabic, and checks each one appears verbatim in `docs/source/Research_Instruments_v2.0.md`, which is committed alongside the code. All 248 are found. It also counts items against section 4 of the brief: 8 pre-training items, 4 daily reflection items including R4, 4 day options (the wording check always reads the canonical four-day content, whatever `PROGRAMME_DAYS` is set to), 14 Likert items, 4 open evaluation items, 2 consent options. Run it after any edit to the instrument content. |
| R4 appears only when the last day is selected | **Pass.** In the browser, R4 is hidden until a day is chosen, stays hidden on every earlier day, and appears on the last one, whichever it is for this cohort (`npm run verify:browser` reads the day from the page rather than assuming four). Without JavaScript it stays visible under its "Day N only" heading, as on paper. The server stores it only when the last day was chosen, and the database refuses the combination independently through a check constraint (tests *R4 is stored on day 4 and dropped on every other day* and *the schema refuses R4 on any day but the last, whatever the application does*). |
| The programme is not always four days | **Pass.** `PROGRAMME_DAYS` sets the length, from 2 to 6, and a value outside that range stops the service at start-up rather than serving a day selector with no options. The four-day text of Research Instruments v2.0 stays canonical in `src/content/instruments.js` and `verify:wording` still checks it word for word; a shorter programme is derived from it by substituting named day phrases, each of which the code asserts is present before replacing it. `tests/programme-length.test.js` runs the whole application at three days and requires that the shorter wording differs from the canonical wording in the day words and nothing else, in both languages. Each reflection row records `programme_days`, and the schema ties R4 to the last of them, so a Day 4 row in a three-day programme is now rejected where before it would have been accepted. |
| Paper fallback carries the same wording | **Pass.** `npm run build:paper` renders `docs/paper/instruments-{en,ar}.pdf` from `src/content/instruments.js`, the same module the screens use, so printed and on-screen wording cannot diverge and `verify:wording` covers both at once. A shorter programme is rendered to `docs/paper/<n>-day/` and names its own length on the sheet, so two cohorts running in the same week cannot be handed each other's packs. The printed sheets carry no name, date or signature field, asserted in test *the printed fallback carries no name, date or signature field*; v2.0 removed those on purpose and a paper form is where they would creep back. Two lines appear on paper that are not on screen, both administration rather than instrument content: a request not to write anything identifying, and the collection instruction from the run sheet. |
| The day is chosen by the participant, not derived from the date | **Pass.** Test *the day is taken from the participant, never from the date*: a reflection submitted with Day 3 selected stores training day 3 and today's calendar date, whatever they are relative to each other. |

### Deletion, from section 3.7

| Line | Result |
|---|---|
| Export verifiable as complete before deletion | **Pass.** Counts per instrument on the admin page, the same counts inside the export file, and the row count in each CSV filename. |
| Delete-all for source records | **Pass.** Behind the researcher secret, and behind typing `DELETE ALL RESEARCH DATA` exactly. It reports rows before and rows after for each of the four tables. Test *deletion empties every table and reports the counts before and after*. |

---

## 2a. Verified against the live system, 23 August 2026

Everything in section 2 was originally checked against a Postgres in a build
container. It has now been repeated against the deployment that will collect
the data: Render service `srv-da588crm8hqs73bpp49g`, region Oregon, commit
`3b8c178`, against the Supabase project holding the `research` schema.

| Checked | Result |
|---|---|
| Schema, on the live database | Nine of nine assertions in `db/checks/post_deploy_check.sql` pass: four tables present, no column able to hold a time, nothing defaulting to a clock reading, no column named for an identity or an address, no foreign key, row level security on, nothing in `public`, nothing named for FinPlay, tables empty |
| Write path | One submission to each of the four instruments, made from a telephone, English and Arabic. Before this the application had only ever read from this database |
| Stored rows | `db/checks/inspect_rows.sql` returned `pass` for every row. Each row held a random id, the cohort, a plain calendar date, the training day where it applies, and the answers. No time, no address, no user agent, nothing else |
| Option codes, not labels | An Arabic response stored `manager`, `5_to_10`, `moderate`, `somewhat`. The row does not record which language was used |
| Arabic text | Stored and returned intact, including free-text answers |
| Likert scale | Stored as numbers 1 to 5 |
| Consent | Stored as four columns and nothing else: random id, cohort, date, choice |
| Day selector | A reflection submitted with Day 1 chosen stored `training_day` 1 and left R4 null |
| Admin view, facilitator secret | Counts, participation rate, and the four QR codes. No response text anywhere on the page, and no control leading to any. The page states that export and deletion need the researcher's secret |
| Admin view, researcher secret | Export and deletion sections appear |
| Export | JSON downloaded and opened: row counts present and matching the counts on screen, answers present |
| Deletion | `DELETE ALL RESEARCH DATA` accepted, before and after counts reported, tables emptied |
| QR codes | Scanned from the admin page with a telephone camera; opens the consent screen |

Two things this does **not** yet cover, and they are the same two as before:
the last-day path, where R4 appears and is stored, has been exercised in testing
and in a browser but not yet on the live service; and the real-device coverage
below remains one telephone rather than three.

---

## 3. Outstanding items

**O1. Real-device testing.** *Partly closed.* On 23 August the four instruments
were completed on one real telephone against the live service, in Arabic and
English, and a projected QR code was scanned successfully. What remains is
breadth: three physical devices including at least one Android and at least one
iPhone, on the phones people will actually bring. What to check: the Arabic screens render right to left end to end;
Safari on iOS does not zoom the page when a text field is focused (all inputs
are set to 16px or larger, which is what prevents it); the Likert grid is
usable one-handed; the language toggle is reachable; and after using the
forms, Safari and Chrome dev tools show no cookie and no storage entry for
the origin. Emulated Chromium profiles at iPhone 13 and Pixel 7 sizes pass
today, and the storage check is automated, but WebKit is not Chromium and an
emulator is not a phone.

**O2. Platform logging.** Two dashboards to review before 3 September.
*Render:* confirm what its edge retains for inbound requests, and for how
long; the application logs nothing itself. *Supabase:* confirm `log_connections`
and `log_statement` settings and log retention. Note when writing this up
that participants never connect to Supabase at all, so no participant address
can appear in a Postgres log; only the Render service connects. Whatever the
answers are, they belong in the data management plan as a disclosure, not in
this codebase as a workaround.

**O3. Network test at the venue.** *Scope reduced.* The programme runs at a
hotel on hotel wi-fi, not on the client's corporate network, so there is no
firewall to negotiate and no IT exception to request. What remains is a test at
the venue: open all four URLs on the hotel wi-fi, on a device that is not the
researcher's, ideally the day before.

Hotel wi-fi brings its own failure: the captive portal. A participant who scans
the QR code before accepting the hotel's terms gets the hotel's page, not the
instrument, and will reasonably conclude the link is broken. Everyone should
connect and clear that portal during the Day 1 briefing, before the first link
is displayed.

---

## 4. Residual risks worth stating in the protocol

**Submission order is visible inside the database, though nothing else is.**
The rows carry no time, but a database holds its own internals: transaction
identifiers and physical row order reveal which row was inserted before which.
In a cohort of 25 completing at the same moment, order plus a role band and an
experience band is the same class of risk that section 3.4 names about precise
times. Three things reduce it. The primary key is random rather than
sequential, so nothing in the visible data reveals order. Exports are ordered
by that random key, so the export file does not carry order either. And the
facilitator, the person in the room who could pair an order with a face, has
no database access and no export secret. It disappears entirely when the
source records are deleted after export, which the protocol already commits to.

**Nothing prevents a second submission.** Without an identity, one person can
submit the same instrument twice, and this cannot be detected or prevented.
That is inherent to anonymity at source, not a defect of the build. Analysis
should treat submission counts as counts of submissions, not of people.

**Switching language mid-form clears the answers.** Language is carried in the
URL, and there is nowhere to keep a half-finished form without storing
something on the device. The browser warns before leaving a form with answers
in it. Worth one sentence from the facilitator: choose your language on the
first screen.

---

## 5. Decisions taken, and why

1. **Language is not stored.** No column records whether a response was written
   in English or Arabic. In a cohort of about 25 it is another coarse attribute
   that could join a role band to an experience band, and the analytic value is
   small: the text of the response is in whichever language was used.
2. **Consent is two submit buttons, not two radio buttons and a submit.** The
   brief says both options must submit. Two buttons make a pre-selected state
   impossible, mean one tap rather than two, and leave nothing on screen
   afterwards for an observer to see. The wording of both options is exactly as
   supplied.
3. **Every substantive item is optional.** Only the day selector on the daily
   reflection is required, because a reflection that cannot be placed in the
   programme cannot be analysed. Participation is voluntary item by item as
   well as instrument by instrument, and a form that refuses to submit until
   every question is answered is a form that pressures people.
4. **Two secrets rather than one.** Section 6 asks for a shared secret; the same
   section says the facilitator must not be able to read responses. Splitting
   counts from export makes that structural rather than a matter of care.
5. **The italic lines in the instrument document are treated as administration
   notes, not participant text.** "Day 1, before training content begins. About
   five minutes." is an instruction to whoever runs the instrument. The
   voluntariness reminder is participant-facing, per part 4 change 9, and is
   shown at the head of each later instrument.
6. **Option codes, not labels, are stored.** `manager`, `11_to_20`, `moderate`.
   An English response and an Arabic response to the same item are therefore
   the same value, and the stored row does not reveal which language was used.
7. **US hosting is kept deliberately.** `render.yaml` pins a United States
   region, because the protocol discloses United States hosting. Moving the
   service would make that disclosure wrong.

---

## 6. How to re-run every check

```bash
npm test                  # 40 tests: instruments, privacy, admin, export, deletion
npm run verify:wording    # all 248 instrument strings against Research Instruments v2.0
npm run verify:privacy    # source scan and schema checks, against any database
npm run verify:rows       # prints stored rows and asserts what is absent from them
npm run verify:browser    # real browser: the final-day rule, an offline submission, both consent options
npm run screenshots       # captures the evidence in docs/screenshots and re-checks browser storage
```

`verify:privacy` and `verify:rows` take `DATABASE_URL`, so both should be run
against the live Supabase database after the first day of collection, not only
against a test database.

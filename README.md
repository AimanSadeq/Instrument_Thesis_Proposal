# Anonymous research instrument platform

Four research instruments, English and Arabic, served to training participants
on their own phones. Built for the doctoral study *Leveraging Artificial
Intelligence for Financial Competence Development*, SDA Bocconi School of
Management.

**The anonymity properties of this application are commitments made in writing
to a university, not preferences.** Before changing anything, read
`docs/VERIFICATION.md`. It records what was checked, how, and what is still
outstanding.

## The rules this code exists to keep

- No login, no account, no email, no name, no employee number.
- No cookie, no web storage, no device identifier, no fingerprint.
- No link between one submission and another, ever, including between a
  participant's first-day and last-day responses.
- No IP address, no user agent, no referrer.
- No time component anywhere. Training day and calendar date only.
- No connection of any kind to the FinPlay training platform.

If a change would break one of these, it is the wrong change. A workaround
here is a false statement in a doctoral thesis.

## What it serves

| Instrument | Path | Content |
|---|---|---|
| Consent and briefing | `/` | Information text, then two options that both submit |
| Pre-training questionnaire | `/pre` | A1, A2, B1–B3, C1, C2, D1 |
| Daily reflection | `/daily` | Day selector, R1–R3, and R4 on the last day only |
| Post-training evaluation | `/eval` | A1–A5, B1–B5, C1–C4 on a 1–5 scale, D1–D4 |
| Admin | `/admin` | Counts only for the facilitator; export and deletion for the researcher |

Item wording is transcribed verbatim from Research Instruments v2.0 into
`src/content/instruments.js`. Do not reword, reorder, add or drop items there
without changing that document. `npm run verify:wording` checks every string
against `docs/source/Research_Instruments_v2.0.md`, which is committed here.

## Stack

Node and Express, server-rendered HTML, Postgres on Supabase, hosted on Render.
Three dependencies: `express`, `pg`, `qrcode`. No client framework, no build
step, no web font, no external request of any kind. Every form works with
JavaScript switched off; JavaScript only improves what happens when a
submission fails.

## Running it locally

```bash
npm install
cp .env.example .env          # fill in DATABASE_URL and the two secrets
npm run migrate               # creates the research schema
npm start                     # http://localhost:3000
```

## Checking it

```bash
npm test                  # 40 tests across instruments, privacy, admin, export, deletion
npm run verify:wording    # every instrument string against docs/source/Research_Instruments_v2.0.md
npm run verify:privacy    # source scan and schema checks against any database
npm run verify:rows       # prints stored rows and asserts what is absent from them
npm run verify:browser    # real browser: the final-day rule, an offline submission, both consent options
npm run screenshots       # captures docs/screenshots and re-checks that the browser holds nothing
npm run build:paper       # rebuilds the printed fallback in docs/paper, English and Arabic
npm run build:paper:docx  # the same pack as Word documents

Both honour `PROGRAMME_DAYS`. The four-day pack is written to `docs/paper`;
a shorter programme goes to `docs/paper/<n>-day`, so that two cohorts running
in the same week cannot be handed each other's sheets.

## Programme length

`PROGRAMME_DAYS` sets how many training days this cohort runs. It defaults to
four, which is what Research Instruments v2.0 is written for; the September
cohorts at the second client are three. It decides the day selector, the day
named in the wording, and which day carries the cross-programme question R4.
Two concurrent cohorts of different lengths need two services, because this is
read once at start-up, in the same way `COHORT` is.
```

The tests need a Postgres database; set `TEST_DATABASE_URL` if it is not
`postgresql://postgres@127.0.0.1:55432/instrument_test`.

## Layout

```
src/content/instruments.js   verbatim instrument text, English and Arabic
src/content/ui.js            everything else a participant can read
src/render/                  HTML shell, form components, pages, admin views
src/routes/                  the four instruments, and the admin routes
src/validate.js              submitted body to storable columns, and nothing else
src/db.js                    one independent row per submission, no clock reading
db/migrations/               the schema
db/checks/                   SQL that must return zero rows, forever
docs/VERIFICATION.md         the report against the build brief checklist
docs/PROTOCOL_CONFORMANCE.md the check against Research Protocol and DMP v1.1
docs/DEPLOYMENT.md           Supabase and Render, and how to take it down again
docs/OPERATIONS.md           what the facilitator and the researcher do on the day
docs/source/                 Research Instruments v2.0, the content this must match
docs/paper/                  printed fallback and the take-away information page
docs/APPENDIX_instrument_platform.md   draft methods appendix for the thesis
docs/screenshots/            evidence, every screen, both languages, two phone sizes
```

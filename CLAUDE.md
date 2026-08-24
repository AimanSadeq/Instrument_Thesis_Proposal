# Working on this repository

This serves four research instruments to training participants for a doctoral
study at SDA Bocconi. Read `docs/VERIFICATION.md` before changing anything.

## The rules are not preferences

The anonymity properties below are commitments made in writing to a
university, and a supervisor and an examining board will read a protocol that
asserts them. Working around one of them is a false statement in a doctoral
thesis, not a shortcut.

Never add, and never accept a change that adds:

- a login, an account, a registration, an email field, or any free-text field
  that invites a name or an employee number
- a cookie, `localStorage`, `sessionStorage`, a session token, a device
  identifier or a fingerprint, **including a random one**
- a participant key, a draft-recovery key, a resume feature, or anything else
  that links one submission to another or one day to another
- an IP address, a user-agent string, a referrer, or a request logger that
  would capture any of them
- a column with a time component, or a default of `now()`, `current_date` or
  any other clock reading. Training day and calendar date only
- a foreign key inside the schema, or any connection to the FinPlay platform
- an analytics package, an external font, a CDN reference, or any request that
  leaves this origin

If a requested change needs one of these, stop and say so rather than finding
a way. That is the expected answer, not a failure.

## Where things are

- `src/content/instruments.js` — instrument text, English and Arabic,
  transcribed verbatim from `docs/source/Research_Instruments_v2.1.md`. Do not
  reword, reorder, add or drop items. `npm run verify:wording` enforces this
  for the screens and the printed forms at once.
- `src/content/ui.js` — everything else a participant can read.
- `src/validate.js` — submitted body to storable columns. Anything not named
  by the instrument definition is discarded here rather than stored.
- `src/db.js` — one independent row per submission. The date is computed by
  the application; the database is never asked for the time.
- `db/checks/*.sql` — must return zero rows, forever. They are run in the test
  suite and against the live database.
- `docs/VERIFICATION.md` — the report against the build brief, including the
  one requirement that cannot be met as written and the items still open.
- `docs/PROTOCOL_CONFORMANCE.md` — the check against Research Protocol and DMP
  v1.1, which is the governing document. Where it and the build brief
  disagree, the protocol wins and the conflict is flagged rather than resolved
  in code.

## Before you finish

```bash
npm test                  # 40 tests
npm run verify:wording    # instrument text against the source document
npm run verify:privacy    # source scan and schema checks
```

If you touched the instrument content, rebuild the printed forms with
`npm run build:paper`. If you touched anything a participant sees, re-run
`npm run screenshots` so the evidence in `docs/screenshots/` matches the build.

Tests need Postgres. `TEST_DATABASE_URL` defaults to
`postgresql://postgres@127.0.0.1:55432/instrument_test`.

## Style

Server-rendered HTML, three dependencies, no build step, no client framework.
Every form must keep working with JavaScript disabled; JavaScript exists only
to make a failed submission visible without losing the answers. Keep it that
way: participants are on their own phones on a restrictive corporate network,
and a submission that fails silently is data that cannot be recovered, because
there is no identity with which to chase it.

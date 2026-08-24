# Running it on the day

This follows the facilitator run sheet in Research Instruments v2.0, part 3.
It says only what the software adds to it.

## The four links

Each instrument has its own address, and there is no navigation between them.
That is deliberate: nothing on a participant's screen ever prompts them
towards an instrument they have not chosen to open, whether or not they
consented.

| Moment | Link |
|---|---|
| Day 1, before any content | `/` |
| Day 1, after the briefing | `/pre` |
| End of Days 1, 2, 3 and 4 | `/daily` |
| End of the last day, after the reflection | `/eval` |

QR codes for all four are on the admin page, ready to project. Display the one
for the moment you are in, as the run sheet describes.

## Language

Every screen opens in English with an obvious control at the top for Arabic,
and the control is on every screen including the confirmation. Worth saying
once when the link goes up: **choose your language on the first screen**.
Switching later clears anything already typed, because there is nowhere to
keep a half-finished form without storing something on the device. The browser
warns before it happens.

## The day selector

The daily reflection asks the participant which day it is. It is not derived
from the date, because a session can run late and a participant can complete
on the way home. The cross-programme question appears only when the last day
is chosen, and which day that is comes from `PROGRAMME_DAYS`. Check the admin
page header before the programme starts: it says how many days this service is
configured for and which day will carry R4.

## The admin page

`/admin`, with the facilitator secret. It shows:

- submissions per instrument, and per training day for the reflections
- how many agreed and how many declined, and the participation rate
- the four links and their QR codes

It cannot show what anyone wrote. That is not a setting; the facilitator
secret has no route to response contents, and it cannot export or delete.

**Counts only, never contents, during the programme.** Read the counts after
each session, record them, and note anything unusual in the deviations log.

## If something goes wrong

**A participant says the form would not send.** They will have seen a message
saying nothing was recorded, with their answers still on the screen. Ask them
to press Submit again. If it fails a second time, give them the paper copy and
record the substitution in the deviations log.

**The network blocks the site.** Paper for the affected instrument, as the run
sheet describes: completed unaided, placed in the collection box unfolded and
unmarked, box sealed in the room. Record it.

Separately from the fallback, print `docs/paper/information-sheet.pdf` — one
double-sided sheet per participant, English on one side and Arabic on the
other. It is the briefing text with nothing to fill in and nothing to return,
handed out on Day 1 for people to keep. Research Protocol v1.1 section 5
requires it.

The printed forms are `docs/paper/instruments-en.pdf` and
`docs/paper/instruments-ar.pdf`, with Word versions of both alongside them
(`instruments-en.docx`, `instruments-ar.docx`) if you would rather adjust the
layout before printing. All four are generated from the same content as the
screens, so the printed and on-screen wording cannot drift apart. Print both
languages, single sided, and print **four copies of the daily reflection per
participant**, one for each day. The sheets carry no name, date or signature
field; they do carry a line asking the participant not to write anything
identifying, and the collection instruction from the run sheet. Rebuild them
with `npm run build:paper` if the instrument content ever changes.

**Nobody can reach the site at all.** `INSTRUMENTS_OPEN` may have been left at
`false`; a form that is closed says so plainly. Otherwise check the Render
service is running.

## After the programme

The researcher, with the export secret:

1. `/admin`, note the counts per instrument.
2. Download the JSON export and each CSV. The row counts are inside the JSON
   file and in every CSV filename. Check them against the counts on screen.
3. Store the files where the data management plan says.
4. Delete all source records with the delete-all form, which asks for the
   phrase `DELETE ALL RESEARCH DATA` and then reports rows before and after.

Between the two cohorts, do all four steps before changing `COHORT` to
`cohort-2`, so the September data is exported and removed before the October
programme adds to it.

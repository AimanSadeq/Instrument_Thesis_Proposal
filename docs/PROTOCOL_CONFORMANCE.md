# The platform against Research Protocol and DMP v1.1

The build brief names this protocol as the governing document and says that
where the two disagree, the protocol wins and the conflict is to be flagged.
This is that check, section by section.

Most of it is satisfied. Seven things need a decision from the candidate, and
they are collected at the end. One of them is a sentence in the protocol that
the software cannot make true as written; the rest are small.

---

## Section 4: Instruments and mode of collection

| Protocol says | Status |
|---|---|
| Four instruments, bilingual English and Arabic | Built, wording verified verbatim against Research Instruments v2.1 |
| Daily Reflection Cards, Days 1 to 4 | Built, but the programme is no longer always four days. See **Flag 7** |
| Delivered as web forms, own or provided devices | Built, mobile first |
| Access by short URL and QR code displayed in the room | Built. Each instrument has its own address and its own QR code on the admin page |
| No login, no account, no invitation by email or name, so no participant list or contact record is created at any stage | Satisfied. No authentication code and no contact field exists anywhere |
| Deliberately separate from FinPlay: not connected, no identity, session or telemetry associated | Satisfied. Separate project, separate database, no foreign key of any kind |
| Paper versions printed and carried to each session | Built: `docs/paper/instruments-{en,ar}.pdf`, generated from the same content as the screens |
| All instruments anonymous by design: no names, employee numbers or other identifiers | Satisfied on screen and on paper |

**Flag 6** below concerns the sentence "the collection and anonymity
procedures of version 1.0 apply" for the paper fallback.

## Section 5: Consent procedure

| Protocol says | Status |
|---|---|
| Two options with equal prominence | Satisfied. One CSS rule renders both; computed size, weight, colour and border measured identical |
| Both options submitted in the same way, both return the same closing screen | Satisfied. Same URL, byte-identical page, verified by hash |
| Every person performs the same visible sequence of actions | Satisfied. One tap either way, and nothing remains on screen afterwards |
| Participants receive a printed information page to keep, and nothing is collected from it | **Now built.** It was missing until this check: `docs/paper/information-sheet.pdf`, English and Arabic on one sheet, briefing text only, no options, no tick boxes, nothing to return |
| Those who decline receive no further instrument prompts | See **Flag 1** |
| Each subsequent instrument opens with a one-line reminder that participation remains voluntary | See **Flag 2** |
| Withdrawal by not submitting a subsequent instrument | Satisfied by design; stated in the consent text |
| A decline is recorded as an anonymous count, not attributable, no identifiers, IP addresses or session data | Satisfied. A decline row holds a random key, the cohort, the date and the word `decline` |

## Section 6: Anonymity and the dual role

| Protocol says | Status |
|---|---|
| No login, user account, session token or cookie | Satisfied, and checked in a real browser after use: no cookie, no storage entry |
| Each submission written independently, no linkage between instruments, days, or to FinPlay | Satisfied. No foreign key exists in the schema |
| No IP address and no user-agent string retained | Satisfied in the application and the database. See **Flag 3** for the hosting layer |
| Submission times at day-level granularity only | Satisfied, and enforced by the schema: no column can hold a time, nothing defaults to a clock reading |
| Demographic items categorical and coarse | Satisfied: role band and experience band, both with "prefer not to say" |
| Self-administered; facilitator does not assist, observe or circulate | Procedural. The admin view supports it by exposing counts only |
| The facilitator cannot know who wrote what | Satisfied structurally: the facilitator's secret has no route to response contents, and cannot export or delete |

## Section 7: Data management

| Protocol says | Status |
|---|---|
| Submission counts logged per instrument per day | Built |
| Hosted in the United States (Render and Supabase) | The blueprint pins a United States region so the disclosure stays true |
| Connection metadata not logged, not retained, not associated with any response | Not associated: satisfied. Not logged, not retained: see **Flag 3** |
| Export within 48 hours of the final training day | Supported: JSON and CSV, with row counts for verification |
| Source records deleted once the export is verified complete | Built, behind the researcher's secret and a typed confirmation, reporting rows before and after |
| Analysis records reference response IDs only, generated at export, carrying no meaning outside the dataset | See **Flag 4** |
| No participant responses entered into generative AI systems | See **Flag 5**. The platform sends nothing anywhere; the risk is in handling the export |

## Section 8: Risks and mitigations

| Protocol says | Status |
|---|---|
| No employer access to individual responses, and none exist | Satisfied |
| Deductive identification: coarse categories, day-level timestamps | Satisfied. One residual is documented in `VERIFICATION.md`: insertion order remains inferable inside the database until the source records are deleted |
| Network failure or client restrictions: revert to paper, record the substitution | Paper built; the deviations log is procedural |
| Unequal device access: devices made available | Nothing in the build depends on a personal device |
| Arabic right-to-left tested across the device types and browsers expected in the room, before the session | Outstanding, and it is a commitment in the protocol rather than only in the brief. See `VERIFICATION.md` item O1 |
| Data loss: export within 48 hours, verification before deletion | Supported |

---

## What needs a decision

### Flag 1. "Those who decline receive no further instrument prompts" (section 5)

The strict reading, that a declining participant's device suppresses later
instruments, cannot be implemented: it needs to recognise that device on a
later visit, which means a cookie, a stored value, a URL token or a
fingerprint, all forbidden by section 6 of this same protocol.

The build satisfies the sentence in the sense that matters: **the application
prompts nobody.** The confirmation screen is terminal and identical for both
choices, no screen links to any other instrument, and each instrument is
reached only by the link the facilitator displays to the whole room. A person
who declines is never prompted again by this software. What the software
cannot do is prevent them opening a link that is on the wall.

**Suggested amendment**, so that the sentence cannot be read as a technical
control that does not exist:

> Those who decline are not prompted again: the confirmation screen is
> terminal and identical for both choices, and no instrument links to another.
> Each instrument is opened only from the link displayed in the room at the
> relevant moment, which a declining participant simply does not open.

### Flag 2. The voluntariness reminder on the pre-training questionnaire

Protocol section 5 says **each** subsequent instrument opens with a one-line
reminder that participation remains voluntary. Research Instruments v2.0 puts
that reminder at the head of the daily reflection and the post-training
evaluation, but **not** the pre-training questionnaire, whose opening line is
about anonymity instead. Part 4 of the instruments document describes the
change as adding the reminder to "each later instrument", which is where the
gap comes from.

The build follows the instruments document, verbatim, as instructed. So the
two documents disagree, and the protocol is the one that wins.

Two ways to close it, and it is your call because it changes instrument text:

1. Add the reminder line to the pre-training questionnaire, which means
   Research Instruments v2.1 and a one-line change here.
2. Amend the protocol to say the reminder appears at the head of each
   instrument completed after Day 1's briefing.

Option 1 is the stronger position ethically: the questionnaire is the first
thing a participant completes after consenting, and it is the moment the
reminder is most useful.

### Flag 3. "Connection metadata is not logged, not retained" (section 7)

This is the claim in the protocol that is most exposed, because it is a
statement about infrastructure neither of us controls.

What is certainly true, and can be asserted without qualification: the
application runs no request logger, stores no address, user agent or referrer,
and associates no connection metadata with any response. Also true, and worth
stating because it is stronger than the protocol currently claims:
**participants never connect to Supabase at all** — only the Render service
holds a database connection, so no participant address can appear in a
database log.

What is not yet established is what Render's edge retains, and for how long.
Until you have checked that in the dashboard, "not logged, not retained" is a
claim about a third party that the study cannot evidence.

**Suggested amendment** if Render turns out to retain edge logs, which is
common:

> Connection metadata, principally IP addresses, is processed transiently at
> the network layer by the hosting infrastructure, as it is for any online
> instrument. It is not logged by the application, not stored in the database,
> and not associated with any response. Any edge logging performed by the
> hosting provider is outside the study's control, is not accessible to the
> researcher, and forms no part of the dataset.

That is defensible whatever the dashboard says. The current wording is only
defensible if Render retains nothing.

### Flag 4. Response IDs "generated at export" (section 7)

Each row carries a random UUID, generated when the row is written, not at
export. It carries no meaning outside the dataset, which is the property the
protocol is protecting, and it is deliberately random rather than sequential
so that it reveals nothing about submission order.

So the substance holds and the mechanism differs. If you would rather the
exports match the protocol exactly, exports can carry a second, short,
export-time identifier — `consent-001`, `daily-014` — assigned in random-key
order, which would also be easier to quote in analysis memos than a UUID. Say
the word and it is a small change.

### Flag 5. "No participant responses are entered into generative AI systems" (section 7)

Nothing in the platform sends anything anywhere: no analytics, no external
request of any kind, and the Content-Security-Policy would block one.

The exposure is entirely in what happens after export, and it is worth being
blunt about one case: **pasting an export, or any participant response, into
an AI assistant would breach this commitment — including into this one.** If
help with coding or thematic analysis is wanted later, that has to be done
without the raw responses passing through a generative system, or the protocol
needs amending first and the supervisor consulted.

### Flag 6. Which paper procedure applies (section 4)

Section 4 says that if the paper fallback is used, "the collection and
anonymity procedures of version 1.0 apply". Version 1.0 used a sealed-envelope
return. The run sheet in Research Instruments v2.0 describes something
slightly different: completed sheets go into a collection box unfolded and
unmarked, and the box is sealed in the room.

The printed forms follow the run sheet, since that is the operational
document. The two sentences should be made to agree; the run sheet's version
is the better procedure, because an envelope per participant reintroduces a
per-person object.

### Flag 7. The protocol says four days, and two cohorts are three

Section 4 lists "Daily Reflection Cards, Days 1 to 4", and section 2 describes
Cycle 1 as two cohorts. Both are now out of date. The September cohorts at the
third client run three days each, delivered by a colleague rather than by the
candidate, which makes four cohorts in Cycle 1 and two different programme
lengths inside it.

The build no longer assumes four. `PROGRAMME_DAYS` sets the length, the day
selector offers exactly that many days, the wording names the right day in
both languages, and the cross-programme question R4 attaches to the last day
rather than to Day 4. Each stored reflection records how many days its
programme had, and the schema ties R4 to the last of them, so the guarantee is
stronger than it was: a Day 4 row in a three-day programme is now refused,
where version 001 of the schema would have accepted it.

Two things follow, and both are the candidate's call.

1. **The protocol needs a version 1.2.** Section 2 for the cohort count and
   who delivers each one, section 4 for the day count, section 6 because the
   facilitator-researcher dual role does not apply where the candidate neither
   delivers nor observes, and section 9 for the timeline.
2. **Research Instruments v2.0 is written for four days.** The four-day text
   remains canonical in the code and is still checked word for word. A shorter
   programme is derived from it by substituting named day phrases and nothing
   else, which the tests enforce in both languages. That substitution should be
   recorded in the instruments document, as an appendix rather than a reissue,
   so that what a three-day room reads is documented rather than inferred.

One operational point that is not a decision: **two cohorts of different
lengths cannot share one service.** The length is read once at start-up, in the
same way the cohort label is. The 6 to 8 September cohort and the 6 to 9
September cohort overlap, so they need two services with their own `COHORT` and
`PROGRAMME_DAYS`, or the rows land under one label with the wrong length.

They may share the database. Everything a service reads or deletes is now
scoped to its own cohort: the admin counts, both export formats and the delete.
Before this, none of the three was. Unscoped, a researcher exporting one cohort
and then deleting would have destroyed the other cohort's source records, which
is not recoverable and would have ended that cohort's contribution to the
study. It would also have shown each facilitator the other's participation
counts. `tests/cohort-isolation.test.js` covers each path. The delete
confirmation phrase now names the cohort rather than reading
"DELETE ALL RESEARCH DATA" identically on every service.

---

## Operational prerequisites this build does not cover

- **Client authorisation** (section 7). The coordinator's confirmation that
  completing externally hosted forms is permitted must be recorded in the
  audit trail before the cohort. This is a hard prerequisite, not a formality:
  without it the platform cannot be used on the client's network.
- **Supervisor review** of the protocol and consent materials before
  6 September (section 9).
- **Reflexivity journal and deviations log** (section 6), including any use of
  the paper fallback.
- **The three verification items in `VERIFICATION.md`**: real devices, the
  hosting dashboards, and the client's network. The first and second are
  commitments in this protocol as well as in the brief.

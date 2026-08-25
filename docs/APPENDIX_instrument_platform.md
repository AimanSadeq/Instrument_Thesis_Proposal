# Appendix: the instrument delivery platform and its anonymity properties

*Draft for the methods chapter. It describes the platform as built and
verified on 21 August 2026. Three verification steps could only be completed
on the client's premises and equipment; they are marked **[to confirm]** and
should be resolved before submission. The engineering record behind every
claim here is in the repository at `docs/VERIFICATION.md`.*

---

## A.1 Purpose

The four research instruments described in Chapter [x] were delivered through
a purpose-built web application rather than through a commercial survey
service. Two considerations drove that decision. First, the anonymity
commitments in the Research Protocol and Data Management Plan v1.3 are
specific enough that they had to be properties of the software, not settings
within it: a claim that no identifier exists is only true if the system is
incapable of creating one. Commercial survey platforms routinely record
respondent IP addresses, browser fingerprints and precise submission times by
default, and several do so in ways the customer cannot disable. Second, the
cohorts are bilingual, and Arabic delivery had to be right-to-left throughout
rather than a translation layer over a left-to-right form.

The application was written for this study, deployed separately from the
FinPlay training platform, and is scheduled for destruction with the data at
the end of the collection period.

## A.2 Design principle: anonymity at source

The platform does not anonymise data after collection. It is constructed so
that identifying data is never created. There is no participant record to
pseudonymise, no key to destroy, and no re-identification procedure that
could be compelled, because the information that would be needed for one is
never brought into existence.

Practically, this meant accepting four losses. Responses cannot be linked
across days, so no within-person change can be measured; that is a deliberate
constraint of Cycle 1 and is discussed in Chapter [x]. Responses cannot be
withdrawn after submission, because a submitted response cannot be found
again; participants are told this in the consent text. Partly completed forms
cannot be resumed, because resuming requires recognising a device. And a
second submission from the same person cannot be detected or prevented, so
submission counts are counts of submissions rather than of people.

## A.3 What is recorded

Each submission is stored as one independent row. The complete set of stored
fields is:

| Field | Values | Purpose |
|---|---|---|
| Random identifier | UUID, generated at insertion | Row key only. Not sequential, so it carries no order information |
| Cohort | `elm`, `nupco1`, `nupco2` | Shared by approximately 25 people; separates the cohorts. Matches the training platform's cohort subdomain so one name means one group |
| Calendar date | `YYYY-MM-DD` | Date only, computed in the collection timezone |
| Training day | 1 to 4, daily reflection only | Chosen by the participant, not derived from the date |
| Responses | The item values themselves | Closed items as stable codes, open items as written |

Closed-item answers are stored as language-neutral codes (`manager`,
`11_to_20`, `moderate`) rather than as the words shown on screen, so that an
English response and an Arabic response to the same item are the same value,
and so that the stored row does not reveal which language the participant
used. The language of an open-text answer is evident from the text itself and
is not recorded as a field.

## A.4 What is not recorded, and how that is enforced

The platform has no login, no account, no registration and no email capture.
It sets no cookie, writes nothing to browser storage, and creates no device
identifier of any kind, including a random one. It does not store IP
addresses, user-agent strings or referrer data, and it runs no request logger
of the kind that would ordinarily capture them. It contains no analytics
package; any such package would breach these properties on installation.

Three enforcement mechanisms sit behind those statements rather than
programmer intention alone.

**The schema cannot hold what is forbidden.** No column of a time type exists
in any table, no column defaults to a clock reading, and no foreign key exists
anywhere in the schema, so no submission can be joined to another. Three SQL
checks assert these conditions and must return zero rows; they are run against
the live database as well as in testing.

**Precise submission times are not merely omitted; they cannot be stored.**
In a cohort of about twenty-five people completing a form at the same moment,
a precise time combined with a role band and an experience band could identify
an individual. The date is therefore computed by the application as a calendar
date in the collection timezone and inserted as such. The database is never
asked for the current time, and the database driver is configured to return
date columns as plain strings, because it would otherwise construct a
timestamp object and carry a time and a timezone offset into the exported
files.

**Submitted fields are matched against the instrument definition.** A
submission is reduced to exactly the values the instrument defines; anything
else is discarded rather than stored. A field that is not part of the
instrument cannot become a hidden identifier, and a closed-item value that is
not one of the offered options is refused rather than recorded.

## A.5 Consent as a screen behaviour

Consent is given by choosing one of two options on a screen. The two options
are rendered by a single style rule, so they are identical in size, weight,
colour and border; neither can be pre-selected, because each is a button
rather than a selectable control; both submit; and both navigate to the same
confirmation page at the same address, whose text does not vary with the
choice. The two resulting screens are byte-identical, which was verified by
comparing their cryptographic hashes. An observer watching a participant's
screen from across the room therefore cannot tell which option was chosen,
and because a single tap submits, no chosen state remains visible on the
screen afterwards.

A decline is recorded as an anonymous count with no identifier attached,
which yields a participation rate without recording who declined.

No screen in the application links to any other instrument, and the
confirmation screen offers no onward step. Each instrument has its own address
and QR code, which the facilitator displays at the appropriate moment. A
participant who declines is therefore never prompted again by the software.
The protocol's stronger formulation, that a declining participant's device
should suppress later instruments, cannot be implemented without the device
identifier that the same protocol forbids; this is recorded as a known
limitation rather than resolved in software.

## A.6 Bilingual delivery

Every screen exists in English and Arabic, with a language control on every
screen including the confirmation. Arabic renders right-to-left throughout:
text, radio controls, labels, the Likert grid and the language control itself.
Direction is set once on the document and inherited, and all layout rules are
written in logical rather than physical directions, so the Arabic layout is
the mirror of the English one rather than a separately maintained design.
Arabic-Indic numerals are used in the Arabic instruments as they appear in the
instrument document.

The instruments were designed for participants' own telephones on a corporate
network. The application requests no external resource of any kind: no web
font, no content delivery network, no third-party script. Each screen is a
single document with one small stylesheet and one small script, and every form
functions with JavaScript disabled. **[to confirm]** Testing on at least three
physical devices, including an Android telephone and an iPhone, and on the
client's own network.

## A.7 Administrative access, export and destruction

Administrative access is separated by function. The facilitator holds a secret
that displays submission counts per instrument and per training day, the
proportion who agreed and declined, and the links and QR codes for display in
the room. It provides no route of any kind to the content of responses. This
enforces structurally the protocol's commitment that the person in the room
does not know who wrote what.

The researcher holds a second, different secret that permits export and
deletion; the application refuses to start if the two secrets are the same.
Export produces JSON covering all instruments and CSV per instrument, each
carrying its row count so that completeness can be checked against the
displayed counts before anything is deleted. Exports are ordered by the random
row key rather than by insertion order, so the export file does not disclose
the sequence in which participants submitted. Deletion of all source records
requires the researcher's secret and a typed confirmation, and reports the row
counts before and after.

## A.8 Verification

The platform's properties were verified by inspecting stored rows and
observed behaviour, not by reading the source code. The verification comprises
an automated test suite of forty tests covering the instruments, the
privacy properties, the administrative separation, export and deletion; SQL
checks asserting the absence of time columns, clock defaults, identifier-like
columns and foreign keys; an inspection script that prints stored rows and
asserts the absence of times, addresses and user-agent strings; a check that
all 248 participant-facing strings appear verbatim in Research Instruments
v2.0; browser-driven checks confirming that no cookie or storage entry exists
after use, that a failed submission is reported visibly with the answers
retained, and that both consent options are identical and land identically;
and screenshots of every screen in both languages at two telephone sizes.

## A.9 Limitations and residual risks

**Order of submission is visible within the database.** Although no time is
stored, a relational database retains internal transaction identifiers and a
physical row order from which insertion sequence can be inferred. The risk is
mitigated by a random row key, by exports ordered on that key, and by the
facilitator, who alone could pair an order with a face, holding no database
access; it ends when the source records are deleted after export.

**Hosting is in the United States.** This is disclosed in the data management
plan. The service was deliberately deployed to a United States region so that
the disclosure remains accurate.

**Platform-level logging is outside the application's control.** The
application logs nothing about requests. Participants never connect to the
database service; only the application server does, so no participant address
can appear in a database log. The hosting provider terminates participants'
connections and may retain edge logs. **[to confirm]** The provider's log
retention, recorded as a disclosure in the data management plan.

**Duplicate submissions cannot be excluded**, as noted in A.2.

## A.10 Paper fallback

Printed copies of all four instruments in both languages accompany every
session, for use if the network fails or the client's network blocks access.
They are generated from the same content as the screens, so the printed and
on-screen wording cannot diverge. The printed forms carry no name, date or
signature field. Completed sheets are placed unfolded and unmarked in a
collection box sealed in the room. Any use of paper is recorded in the
deviations log.

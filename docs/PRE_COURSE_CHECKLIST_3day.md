# Pre-course checklist: the October cohorts

**Cohorts 1A and 1B, three days each, facilitated by the candidate.**

**Program:** three days, twice. 20 to 22 and 25 to 27 October 2026, approximately 20 to 25 participants each, at a large public-sector procurement organization
**Service:** the three-day service, `PROGRAMME_DAYS=3`
**Cohort labels:** `nupco1` for Cohort 1A, **`nupco2` for Cohort 1B**. See section J; this is the one that cannot be fixed afterwards.
**Printed pack:** `docs/paper/3-day/` (not `docs/paper/`, which is the four-day set)
**Export deadlines:** 24 October for 1A, 29 October for 1B. Within 48 hours of each cohort's final day, per Protocol v2.0 section 7.
**Governing documents:** Research Protocol and DMP v2.0, Research Instruments v2.4

Print this. Tick as you go.

---

## A. Two gates. Nothing runs until both are open.

Neither is a formality and neither is yours to hurry. If either is still open on the
morning of 20 October, the program is delivered as training with the instrument layer
switched off, exactly as September was. That is a normal outcome, not a failure, and it
is the only correct one.

- [ ] **Amendment EA001257.01 determined.** The committee approved an application in
      which the candidate delivered none of Cycle 1. You delivering these cohorts
      restores the facilitator-researcher dual role, which is a material change to an
      approved application. It was filed on 10 September 2026 and awaits determination.
      **No cohort contributes data under the changed arrangement before it is
      determined** (Protocol v2.0 sections 6 and 9).
- [ ] **Client authorization confirmed in writing and filed.** Section 7 requires the
      procurement organization's confirmation that completing externally hosted research
      forms is permitted. As of v2.0 it is requested and not yet confirmed.
- [ ] **Supervisor review** of the protocol and consent materials before the first
      October session. Two changes from the version the committee approved are drawn to
      his attention rather than left to be found: the September delivery leaving the
      study, and delivery returning to you.
- [ ] **`INSTRUMENTS_OPEN=false`** until the morning of each cohort's Day 1.

## B. The script, and the dual role

You designed the materials, you are delivering them, and you are the researcher. The
protocol does not pretend otherwise, and neither should the room.

- [ ] **Read the script as written**, English and Arabic, from part 3 of Research
      Instruments v2.4. It says "my doctoral research" and "I will never know who wrote
      what", and with you at the front both are true as written. The colleague
      substitution in the run sheet is for colleague-delivered cohorts; it does not
      apply here.
- [ ] **Read the Arabic as written**, not translated on the spot.
- [ ] **Rehearse it aloud once** before 11 October. Saying it once is different from
      having read it.
- [ ] **Nothing evaluative about the materials before the consent screen.** Not
      advanced, not ahead of the market, however true. The room is about to judge
      materials you built, and telling them the answer first spoils the data. Say all of
      that in your training opening, after the consent screen closes.
- [ ] **During completion: do not assist, do not look at screens, do not circulate.**
      Section 6 leans on this. The controls carry the mitigation because they are
      properties of the instruments rather than of who is standing at the front — but
      only if the person at the front behaves as though a stranger were.
- [ ] **Answer what an item means, never what to write.**

## C. Printing, by 16 October

Everything from `docs/paper/3-day/`. The daily reflection sheet says "Days 1 to 3" on
the front, which is how you tell it apart from the four-day set in a stack.

- [ ] **Information sheet**, one double-sided page per participant plus spares, both
      cohorts. Handed out on Day 1 to everyone, whether they take part or not.
- [ ] **Paper fallback, English and Arabic.**
- [ ] **Three copies of the daily reflection per participant**, one per day. Not four.
- [ ] **Collection box**, something to seal it with, spare pens.
- [ ] **The link and QR code for each instrument**, screenshotted into your slides so
      you are not logging into the admin page during a session.

## D. Testing and rehearsal on the delivery devices, before 11 October

Protocol section 9 sets this date, and it sits before Cohort 1C's window rather than
before 1A's, so it holds whether or not 1C is confirmed.

- [ ] **The admin header says three days** and the right cohort label. If it says four,
      you are on the wrong service.
- [ ] **The day selector offers exactly three days.** Open `/daily` and count.
- [ ] **The last-day path.** Choose Day 3, confirm the cross-program question appears,
      submit. This route is never exercised until the day it matters.
- [ ] **Three real devices**, at least one Android and one iPhone, including the tablets
      you will hand out. Arabic reads right to left throughout, the page does not zoom
      when you tap a text box, the rating grid is usable one-handed.
- [ ] **Delete anything those tests created**, with the export secret, and confirm the
      tables are empty with `db/checks/post_deploy_check.sql`.

## E. At the venue, the day before each cohort

- [ ] **Open all four URLs on the venue wi-fi**, on a device that is not yours.
- [ ] **Find the captive portal.** Venue wi-fi usually makes you accept terms first. A
      participant who scans the QR code before clearing it gets the venue's page and
      concludes the link is broken. Know what it looks like.
- [ ] **Scan a projected QR code** from where the back row will sit.

## F. Morning of Day 1, each cohort

- [ ] **`INSTRUMENTS_OPEN=true`.** Two or three minutes to redeploy. Before the room
      arrives, never mid-session.
- [ ] **Admin page:** counts at zero, "instruments open", the right cohort label, three
      days.
- [ ] **Get the room onto the wi-fi and through the portal** before any link goes up.
- [ ] **Read the briefing** from the run sheet, English and Arabic.
- [ ] **Display the consent link.** Everyone opens it, whether taking part or not.
      Three minutes.
- [ ] **Display the pre-training questionnaire link.** Five minutes. Do not check who is
      completing it.

## G. Each day

- [ ] Daily reflection link before people leave. Five minutes.
- [ ] After the session: **counts only** in the admin view. You cannot see contents and
      that is deliberate.
- [ ] **Deviations log**: technical failures, fallback to paper, interruptions, anything
      said in the room that might have influenced responses.
- [ ] **Reflexivity journal**, the same evening. Section 6 requires it, and with you
      delivering your own materials it is doing more work than it was asked to do in the
      approved design: what you adapted on the spot, what the room resisted, and where
      you wanted them to like something.

## H. Day 3

- [ ] Daily reflection as usual. The cross-program question appears when Day 3 is
      chosen.
- [ ] Then the post-training evaluation. Ten minutes.
- [ ] Once everyone has finished: **`INSTRUMENTS_OPEN=false`.**

## I. Export and deletion, within 48 hours of each final day

1A by 24 October, 1B by 29 October.

- [ ] Admin page with the **export secret**. Note the counts per instrument.
- [ ] **Download the JSON**, all instruments, and **each CSV**. Row counts are in the
      filenames.
- [ ] **Check the row counts** in the files against the counts on screen. This is what
      "verifiable as complete" means in section 7.
- [ ] **Store the exports encrypted**, access restricted to you.
- [ ] **Delete all source records**: type `DELETE ALL RESEARCH DATA`. Keep the
      before-and-after table for the audit trail.
- [ ] **Re-run `post_deploy_check.sql`.** Nine passes, tables empty.

## J. Between the two cohorts, 22 to 25 October

**This is the step that cannot be repaired afterwards.**

Both cohorts run on the same service. `COHORT` is read once when the service starts. If
it still says `nupco1` on 25 October, Cohort 1B's rows land under 1A's label, and there
is nothing to separate them by afterwards: no identifiers, no linkage, nothing. The two
datasets become one and stay one.

- [ ] Cohort 1A exported, verified and deleted.
- [ ] **Change `COHORT` to `nupco2` in Render, and redeploy.**
- [ ] **Confirm on the admin page** that the header now reads `nupco2` and the counts
      are zero. If it shows 1A's counts, the change did not take.
- [ ] Reprint the packs for the second group.

## K. If Cohort 1C is confirmed

Five days, 11 to 15 October 2026, at a further organization. Under discussion and not
contracted; treated as a possible addition, not a dependency. If it is confirmed:

- [ ] **Its own instance, its own cohort label, `PROGRAMME_DAYS=5`.** Never the
      three-day service with the number changed: one service, one cohort, one label.
- [ ] **Its own client authorization**, from that organization. Section A's second gate
      is per organization.
- [ ] **Everything in C, D and E, a week earlier**, and the supervisor review moves to
      before 11 October.
- [ ] **Export and delete within 48 hours of 15 October**, before the October cohorts
      begin.
- [ ] Both gates in section A apply to it in full.

## If something fails on the day

**A participant says it would not send.** They will have seen a message saying nothing
was recorded, with their answers still on screen. Ask them to press Submit again. If it
fails twice, give them the paper copy and record the substitution.

**The site will not load for anyone.** Check `INSTRUMENTS_OPEN` and that the service is
running. If the network is the problem, go to paper for that instrument.

**Paper is used at all.** Completed sheets go in the collection box unfolded and
unmarked, the box is sealed in the room before it leaves, and the substitution goes in
the deviations log.

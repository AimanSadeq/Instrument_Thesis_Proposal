# Pre-course checklist: the three-day cohorts

**For the facilitator delivering them, who is not the candidate.** The candidate has a
separate list for the four-day cohort. They are different documents on purpose:
different dates, a different service, a different admin secret and a different printed
pack. Working from the wrong one puts the wrong day count in front of a room.

**Programme:** three days, twice. 6 to 8 September and 13 to 15 September 2026, approximately 25 participants each
**Service:** the three-day service, `PROGRAMME_DAYS=3`
**Cohort labels:** `nupco-1` for the first group, **`nupco-2` for the second**. See section J; this is the one that cannot be fixed afterwards.
**Printed pack:** `docs/paper/3-day/` (not `docs/paper/`, which is the four-day set)
**Export deadlines:** 10 September for the first group, 17 September for the second

Print this. Tick as you go.

---

## A. Before anything

- [ ] **Client authorisation is in writing and filed.** Protocol section 7 requires the
      client's confirmation that completing externally hosted research forms is
      permitted. Without it, nothing is collected. This is the candidate's to obtain,
      but do not open a link until you know it exists.
- [ ] **Read the facilitator run sheet**, part 3 of Research Instruments v2.3. It is
      short. The Day 1 script is written out in English and Arabic.
- [ ] **`INSTRUMENTS_OPEN=false`** until the morning of Day 1.

## B. The script

- [ ] **You are not the researcher, and the script must say so.** Where it reads "my
      doctoral research", say "the doctoral research of my colleague Aiman Sadeq".
      Where it reads "I will never know who wrote what", say "the researcher will never
      know". The substitution is printed beside the script in both languages.
- [ ] **Read the Arabic as written**, not translated on the spot. Two facilitators
      improvising a consent briefing are not running the same study.
- [ ] **Rehearse it aloud once**, with the candidate, before 3 September. Saying it once
      is different from having read it.
- [ ] **Nothing evaluative about the materials before the consent screen.** Not
      advanced, not ahead of the market, however true. The room is about to judge those
      materials and telling them the answer first spoils the data. Say all of that in
      your training opening, after the consent screen closes.

## C. Printing, by 3 September

Everything from `docs/paper/3-day/`. The daily reflection sheet says "Days 1 to 3" on
the front, which is how you tell it apart from the four-day set in a stack.

- [ ] **Information sheet**, one double-sided page per participant plus spares, both
      cohorts. Handed out on Day 1 to everyone, whether they take part or not.
- [ ] **Paper fallback, English and Arabic.**
- [ ] **Three copies of the daily reflection per participant**, one per day. Not four.
- [ ] **Collection box**, something to seal it with, spare pens.
- [ ] **The link and QR code for each instrument**, screenshotted into your slides so
      you are not logging in during a session. They come from **your** service's admin
      page, not the other one's.

## D. Testing, by 3 September

- [ ] **The admin header says three days.** It states the cohort and the programme
      length. If it says four, you are on the wrong service.
- [ ] **The day selector offers exactly three days.** Open `/daily` and count.
- [ ] **The last-day path.** Choose Day 3, confirm the cross-programme question
      appears, submit. This route is never exercised until the day it matters.
- [ ] **Three real devices**, at least one Android and one iPhone. Arabic reads right to
      left throughout, the page does not zoom when you tap a text box, the rating grid
      is usable one-handed.
- [ ] **Delete anything those tests created.** The candidate does this; it needs the
      export secret, which you do not hold.

## E. At the venue, 5 September

Nobody else can do this for you. The candidate is at another client that week.

- [ ] **Open all four URLs on the venue wi-fi**, on a device that is not yours.
- [ ] **Find the captive portal.** Venue wi-fi usually makes you accept terms first. A
      participant who scans the QR code before clearing it gets the venue's page and
      concludes the link is broken. Know what it looks like.
- [ ] **Scan a projected QR code** from where the back row will sit.

## F. Morning of Day 1

- [ ] **`INSTRUMENTS_OPEN=true`.** Two or three minutes to redeploy. Before the room
      arrives, never mid-session.
- [ ] **Admin page:** counts at zero, "instruments open", the right cohort label, three
      days.
- [ ] **Get the room onto the wi-fi and through the portal** before any link goes up.
- [ ] **Read the briefing** from the run sheet, English and Arabic, with the
      substitution.
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
- [ ] **Your notes on the materials**: what you kept, what you adapted on the spot, what
      you abandoned, and why. A line each, written the same day. This is the single most
      useful thing you produce for the research and it cannot be reconstructed later.

## H. Day 3

- [ ] Daily reflection as usual. The cross-programme question appears when Day 3 is
      chosen.
- [ ] Then the post-training evaluation. Ten minutes.
- [ ] Once everyone has finished: **`INSTRUMENTS_OPEN=false`.**

## I. After each cohort

- [ ] Tell the candidate the counts. Export and deletion are his, and need the export
      secret.
- [ ] Send him your deviations log and your notes on the materials.

## J. Between the two cohorts, 8 to 13 September

**This is the step that cannot be repaired afterwards.**

Both cohorts run on the same service. `COHORT` is read once when the service starts. If
it still says `nupco-1` on 13 September, the second cohort's rows land under the first
cohort's label, and there is nothing to separate them by afterwards: no identifiers, no
linkage, nothing. The two datasets become one and stay one.

- [ ] First cohort exported and verified by the candidate.
- [ ] **Change `COHORT` to `nupco-2` in Render, and redeploy.**
- [ ] **Confirm on the admin page** that the header now reads `nupco-2` and the counts
      are zero. If it shows the first cohort's counts, the change did not take.
- [ ] Reprint the packs for the second group.

## If something fails on the day

**A participant says it would not send.** They will have seen a message saying nothing
was recorded, with their answers still on screen. Ask them to press Submit again. If it
fails twice, give them the paper copy and record the substitution.

**The site will not load for anyone.** Check `INSTRUMENTS_OPEN` and that the service is
running. If the network is the problem, go to paper for that instrument.

**Paper is used at all.** Completed sheets go in the collection box unfolded and
unmarked, the box is sealed in the room before it leaves, and the substitution goes in
the deviations log.

**A manager tells the room to complete the forms.** Stop it, politely, there and then.
Participation has to be each person's own decision. A room that was instructed has not
consented, and the candidate cannot use any of that cohort's data.

**Never**, on any day: read response contents, look at anyone's screen, or help anyone
complete an instrument. Answer what an item *means*, never what to write.

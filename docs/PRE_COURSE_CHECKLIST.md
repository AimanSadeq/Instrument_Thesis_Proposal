# Pre-course checklist, Cohort 1

**Programme:** 6 to 9 September 2026, hotel venue, approximately 25 participants
**Service:** https://instrument-platform.onrender.com
**Export deadline:** 11 September 2026 (Protocol v1.1 section 7, within 48 hours)

Print this. Tick as you go. Anything not ticked by 5 September is a decision to
make rather than a task to forget.

---

## A. This week

- [ ] **Send the client coordinator the authorisation note.** Protocol section 7
      requires their confirmation that completing externally hosted research
      forms is permitted, recorded in the audit trail.
- [ ] **File their reply.** A friendly "yes, fine" in writing is what section 7
      asks for. Without it there is nothing in the file.
- [ ] **Set `INSTRUMENTS_OPEN=false`** in Render → Environment. Nothing should
      be collected before the cohort. *Put setting it back to `true` on the
      Day 1 list below, because forgetting is the obvious failure.*
- [ ] **Note Render's log retention** while you are in the dashboard. This is
      outstanding item O2, and it decides the wording in section 7 of the
      protocol.
- [ ] **Supervisor review** of the protocol and consent materials, per
      section 9.

## B. Protocol decisions

The five open flags in `docs/PROTOCOL_CONFORMANCE.md`. Each needs a decision,
not code.

- [ ] **The voluntariness reminder.** Protocol says every subsequent instrument
      opens with one; the pre-training questionnaire has none. Either add the
      line (instruments v2.1) or amend the protocol.
- [ ] **"Connection metadata is not logged, not retained."** Narrow this to
      what the study can evidence, or confirm it against Render's answer.
- [ ] **Response IDs** are generated when a row is written, not at export.
      Substance holds; decide whether the wording changes or the code does.
- [ ] **No responses into generative AI systems.** Applies to handling the
      export, including pasting it into an assistant.
- [ ] **The paper procedure**, described one way in the protocol and another in
      the run sheet. Make them agree.

## C. Printing, by 3 September

- [ ] **Information sheet**, one double-sided page per participant, plus spares.
      `docs/paper/information-sheet.pdf`. English one side, Arabic the other.
      Handed out on Day 1 to everyone, whether they take part or not.
- [ ] **Paper fallback, English**: `docs/paper/instruments-en.pdf`
- [ ] **Paper fallback, Arabic**: `docs/paper/instruments-ar.pdf`
- [ ] **Four copies of the daily reflection per participant**, one for each day.
- [ ] **Collection box**, plus something to seal it with, and spare pens.
- [ ] **The link and QR code for each instrument**, ready to project. They are
      on the admin page; screenshot them into your slides so you are not
      logging in during a session.

## D. Testing, by 3 September

- [ ] **`PROGRAMME_DAYS` matches this cohort.** Three for a three-day
      programme, four for a four-day one. The admin page header states it, and
      the day selector should offer exactly that many days and no more.
- [ ] **The last-day path on the live service.** Open `/daily`, choose the last day,
      confirm the R4 question appears, submit. This is the only route in the
      application never exercised against the deployment, and it only matters
      on the last day, when there is no second chance.
- [ ] **Three real devices**, at least one Android and at least one iPhone.
      Check: Arabic reads right to left throughout; the page does not zoom when
      you tap a text box; the Likert grid is usable one-handed.
- [ ] **Delete anything those tests created.** `/admin` with the export secret,
      `DELETE ` followed by this service's cohort label.
- [ ] **If a second cohort runs the same week**, confirm you are looking at the
      right service: the admin header names the cohort and the programme
      length, the QR codes come from that service's own admin page, and the
      admin secret is that service's own. Do not reuse the other's.
- [ ] **Confirm this cohort has no rows yet**: run `db/checks/post_deploy_check.sql` in
      the Supabase SQL editor. Nine rows, all `pass`.

## E. At the venue, 5 September

- [ ] **Open all four URLs on the hotel wi-fi**, on a device that is not yours.
- [ ] **Find the captive portal.** Hotel wi-fi usually makes you accept terms
      first. A participant who scans the QR code before clearing it gets the
      hotel's page and concludes the link is broken. Know what it looks like.
- [ ] **Scan a projected QR code** from where the back row will sit.

## F. Morning of Day 1, 6 September

- [ ] **Set `INSTRUMENTS_OPEN=true`.** Render → Environment → save. Takes two
      or three minutes to redeploy. Do it before the room arrives, never
      mid-session.
- [ ] **Check the admin page**: counts all zero, header reads "instruments
      open", cohort `cohort-1`, date correct.
- [ ] **Confirm the facilitator holds `ADMIN_SECRET`** and the URL. Not the
      export secret. That separation is the control protocol section 6 relies
      on.
- [ ] **Get the room onto the wi-fi and through the portal** before any link
      goes up.
- [ ] **Read the briefing** from the run sheet, English and Arabic.
- [ ] **Display the consent link.** Everyone opens it, whether taking part or
      not. Allow three minutes.
- [ ] **Display the pre-training questionnaire link.** Five minutes. Do not
      check who is completing it.

## G. Each day

- [ ] Display the daily reflection link before people leave. Five minutes.
- [ ] After the session: **counts only** in the admin view, never contents.
- [ ] Record anything unusual in the **deviations log**: technical failures,
      fallback to paper, interruptions, anything said in the room that might
      have influenced responses.
- [ ] Write the **reflexivity journal** entry the same evening.

## H. The last day

- [ ] Daily reflection link as usual. R4 appears when the last day is chosen.
- [ ] Then the post-training evaluation link. Ten minutes.
- [ ] Once everyone has finished: **set `INSTRUMENTS_OPEN=false`.**

## I. Export and deletion, by 11 September

- [ ] `/admin` with the **export secret**.
- [ ] **Note the counts** per instrument.
- [ ] **Download the JSON**, all instruments.
- [ ] **Download each CSV**, four files. Row counts are in the filenames.
- [ ] **Check the row counts** in the files against the counts on screen. This
      is what "verifiable as complete" means in section 7.
- [ ] **Store the exports encrypted**, access restricted to you.
- [ ] **Delete this cohort's source records**: type `DELETE ` and the cohort label. Keep the
      before-and-after table for the audit trail.
- [ ] **Re-run `post_deploy_check.sql`.** Nine `pass`. Check 9's detail lists every cohort still holding rows; yours should not be among them.

## J. Before Cohort 2, October

- [ ] Cohort 1 exported, verified and deleted first.
- [ ] Set `COHORT=cohort-2` in Render.
- [ ] Set `INSTRUMENTS_OPEN=true` on the morning of Day 1.
- [ ] New client, new authorisation confirmation.
- [ ] Reprint everything.

## K. After Cohort 2

- [ ] Final export, counts verified.
- [ ] Delete all source records.
- [ ] **Delete the Supabase project and the Render service.** Section 7 commits
      to no research data remaining on third-party infrastructure beyond the
      collection period, and an empty table in a live project is not the same
      as no project.

---

## If something fails on the day

**A participant says it would not send.** They will have seen a message saying
nothing was recorded, with their answers still on screen. Ask them to press
Submit again. If it fails twice, give them the paper copy and record the
substitution.

**The site will not load for anyone.** Check `INSTRUMENTS_OPEN` and that the
Render service is running. If the network is the problem, go to paper for that
instrument.

**Paper is used at all.** Completed sheets go in the collection box unfolded and
unmarked, the box is sealed in the room, and the substitution goes in the
deviations log.

**Never**, on any day: read response contents, look at anyone's screen, or help
anyone complete an instrument. Answer what an item *means*, never what to write.

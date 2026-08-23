**RESEARCH PROTOCOL AND DATA MANAGEMENT PLAN**

*Leveraging Artificial Intelligence for Financial Competence Development: A Design-Based Research Study of AI-Assisted Training Design, Gamification, and Organizational Outcomes*

Candidate: Aiman S. Sadeq · Supervisor: Professor Emanuele Borgonovo · Doctorate in Business Administration, SDA Bocconi School of Management

Version 1.1 · August 2026 · Status: draft for supervisor review ahead of Cohort 1 (6 to 9 September 2026)

*Supersedes version 1.0. Changes are summarised in Section 10.*

**1. Purpose and research questions**

The study investigates how generative AI can be leveraged to develop financial competence in organizations, and what design principles govern effective AI-assisted finance training. Five research questions address: (RQ1) the role of AI in producing training artifacts and the effect of AI-human collaboration on their quality; (RQ2) how AI-designed gamification and simulation mechanics influence professionals\' engagement with financial decision-making; (RQ3) the organizational and individual factors that enable or constrain adoption; (RQ4) the extent to which AI-assisted training contributes to perceived financial competence; and (RQ5) the governance principles that should guide responsible use of AI in training design for regulated environments.

**2. Design summary**

Two-cycle Design-Based Research (DBR); qualitative core (Reflexive Thematic Analysis; Framework Method) with bounded descriptive statistics.

Cycle 1 comprises two cohorts of the same finance-for-non-finance programme. Cohort 1 is approximately 25 adult professionals at a large Saudi technology company, in a four-day programme on 6 to 9 September 2026, facilitated by the candidate. Cohort 2 follows in October 2026 at a further client organization. The two-cohort structure gives Cycle 1 an internal iteration: what Cohort 1 reveals about the instruments and the training materials can be acted upon and re-tested inside the cycle rather than deferred to Cycle 2.

Cycle 2 (2026 to 2027) deploys systematically refined materials across multiple organizations with interviews, focus groups, and observation. Full institutional ethics review via the Bocconi ethics portal will be completed before Cycle 2 fieldwork begins.

**3. Participants and recruitment**

Population: adult professionals (non-finance backgrounds) attending a finance-for-non-finance corporate training programme arranged by their employer.

The employer arranges attendance at the TRAINING; participation in the RESEARCH (completing instruments) is individually voluntary. Declining carries no employment consequence, and the consent materials state this explicitly.

No vulnerable groups; no minors.

**4. Instruments and mode of collection**

Four instruments, bilingual in English and Arabic:

-   Consent and Briefing Sheet: research context, supervisor, voluntariness, anonymity, right to withdraw.

-   Pre-Training Questionnaire: demographics, prior finance knowledge, expectations (Day 1, before content).

-   Daily Reflection Cards, Days 1 to 4: three open questions per day; Day 4 adds one cross-programme question.

-   Post-Training Evaluation: Kirkpatrick Levels 1 and 2, design-quality perceptions, gamification experience (Day 4).

Mode of collection. Instruments are delivered as web forms and completed by participants on their own or on provided devices. Access is by a short URL and QR code displayed in the room at the relevant point in the programme. There is no login, no account, and no invitation by email or name, so no participant list or contact record is created at any stage.

The instrument layer is deliberately separate from the FinPlay training platform. Participants log in to FinPlay to take part in the training; they do not log in to complete research instruments. The two systems are not connected, and no FinPlay identity, session, or telemetry is associated with any instrument response.

Paper versions of every instrument are printed and carried to each session as an operational fallback (Section 8). If the fallback is used, the collection and anonymity procedures of version 1.0 apply for that instrument, and the substitution is recorded in the deviations log.

All instruments are anonymous by design: no names, employee numbers, or other identifiers are collected anywhere.

**5. Consent procedure**

On Day 1, before any teaching content, the facilitator reads a standardized briefing identifying the doctoral research, the university and supervisor, the voluntary character of participation, and the anonymity guarantee. Participants receive a printed information page to keep. This page is given to participants and nothing is collected from it.

Participants then open the consent screen. It presents two options with equal prominence: to take part, or not to take part. Both options are submitted in the same way, and both return the same closing screen, so that every person in the room performs the same visible sequence of actions on their device. Those who decline receive no further instrument prompts.

Consent covers all instruments across all four days. Each subsequent instrument opens with a one-line reminder that participation remains voluntary. Withdrawal is exercised simply by not submitting a subsequent instrument.

**One honest difference from version 1.0.** Under the paper procedure a declining participant returned a blank form that was physically indistinguishable from a completed one, so no record of declining existed at all. Under the online procedure a decline is recorded as an anonymous count. It cannot be attributed to any individual, because no identifiers, IP addresses, or session data are held. The practical effect is that declining remains invisible to the facilitator and to the employer, while the study gains an accurate participation rate. This is judged an acceptable and arguably favourable exchange, but it is a change and is recorded as one.

**6. Anonymity and the facilitator-researcher dual role**

The candidate both delivers the programme and conducts the research, a standard configuration in Design-Based Research that this protocol manages explicitly rather than assumes away.

Anonymity is established at source by the following technical and procedural controls:

-   No login, no user account, no session token, and no cookie is used by the instrument layer.

-   Each submission is written independently. No linkage exists between instruments, between days, or between any instrument and the FinPlay platform.

-   No IP address and no user-agent string is retained.

-   Submission times are recorded at day-level granularity only. Finer timestamps are not stored, because in a cohort of about 25 completing at the same moment a precise submission time could become deductively identifying when combined with demographic bands.

-   Demographic items are categorical and coarse (role band, experience band) for the same reason.

-   Instruments are self-administered. The facilitator does not assist with completion, does not observe individual screens, and does not circulate during completion.

The consequence is that the facilitator cannot know who wrote what, and no response can be linked to an individual. The data are anonymous at source, not anonymized afterwards.

The same design necessarily forecloses two things within Cycle 1: responses cannot be joined across the four days for any individual, and no longitudinal follow-up of individuals is possible. Both were accepted deliberately in favour of the anonymity guarantee.

The candidate maintains a reflexivity journal and a deviations log as part of the audit trail, reviewed in supervision.

**7. Data management plan**

Collection. Responses are submitted through the web forms described in Section 4 and written to a hosted database. Submission counts are logged per instrument per day.

**Hosting and jurisdiction.** The application and database are hosted in the United States (Render and Supabase). This is stated plainly rather than smoothed over. No personal data enters the dataset, so the research data itself involves no cross-border transfer of personal data within the meaning of the KSA Personal Data Protection Law. Connection metadata, principally IP addresses, is processed transiently at the network layer by the hosting infrastructure, as it is for any online instrument, including the widely used hosted survey platforms. Such metadata is not logged, not retained, and not associated with any response. The protocol therefore claims no more than the design supports: the dataset contains no personal data, and no personal data is stored outside the Kingdom.

Client authorisation. Before each cohort, the client organization\'s coordinator confirms that completion of externally hosted research forms on the client network or on personal devices is permitted under the organization\'s own data policy. Confirmation is recorded in the audit trail.

Export and storage. Responses are exported within 48 hours of the final training day (target 11 September 2026 for Cohort 1). Exports are stored encrypted with access restricted to the candidate. Once an export is verified complete, the source records are deleted from the hosted database, so that no research data remains on third-party infrastructure beyond the period required to collect it.

Analysis records (codes, matrices, memos) reference response IDs only. Response IDs are generated at export and carry no meaning outside the dataset.

KSA Personal Data Protection Law alignment: data minimization (anonymous by design), purpose limitation (research and programme improvement only, stated in the briefing), security of processing, and the position on cross-border transfer set out above.

No participant responses are entered into generative AI systems. AI tools are used in the research only as documented in the study\'s AI-use disclosure, and never with raw participant data.

Retention: for the duration of the doctoral research; anonymized digital data retained per SDA Bocconi requirements, then deleted. Any paper originals arising from use of the fallback are locked and destroyed after thesis acceptance.

**8. Risks and mitigations**

-   Perceived workplace pressure to participate. Explicit voluntariness script; equal prominence of both consent options; no employer access to individual responses, and none exist.

-   Facilitator influence on responses. Self-administration; no facilitator observation of screens; no identifiers; no linkage.

-   Perception that responses are tracked because collection is digital. The briefing states explicitly that the instruments are separate from FinPlay, require no login, and record no IP address or identity. The absence of a login screen is itself visible evidence of this to participants.

-   Deductive identification in a small cohort. Coarse demographic categories; day-level timestamps only; reporting at theme level, never at individual-response level with identifying detail.

-   Network failure, device shortage, or client network restrictions. Printed copies of every instrument are carried to each session. The facilitator reverts to the paper procedure of version 1.0 for the affected instrument, and records the substitution in the deviations log.

-   Unequal device access among participants. Devices are made available so that participation does not depend on owning a suitable personal device.

-   Bilingual rendering. Arabic right-to-left presentation is tested across the device types and browsers expected in the room before the session, and the paper fallback covers any failure.

-   Data loss. Export within 48 hours; encrypted redundant storage; verification of export completeness before any source deletion.

**9. Oversight and timeline**

Supervisor: Professor Emanuele Borgonovo reviews this protocol and the consent materials before the Cohort 1 session (target: before 6 September 2026). The review and any resulting revisions form part of the audit trail.

Institutional ethics: SDA Bocconi procedures via ecr.unibocconi.it, with the full Consent Form process completed ahead of Cycle 2 fieldwork (2026 to 2027).

Indicative sequence: instrument layer built and tested, with client authorisation confirmed, before 6 September 2026; Cohort 1 delivered 6 to 9 September 2026; export and verification by 11 September 2026; instrument and material refinements applied ahead of Cohort 2 in October 2026; Cycle 2 fieldwork from late 2026, following institutional ethics approval.

Contact for participant questions: the candidate, and ethics@unibocconi.it as the institutional contact.

**10. Summary of changes from version 1.0**

-   Section 2: Cycle 1 now comprises two cohorts (September and October 2026) rather than a single pilot cohort.

-   Section 4: instruments move from paper to online web forms, with no login and no connection to the FinPlay platform. A printed fallback set is retained for operational failure.

-   Section 5: the sealed-envelope return channel is replaced by online submission with two equally prominent consent options. The change to how declining is recorded is stated explicitly rather than left implicit.

-   Section 6: anonymity controls are restated in technical terms appropriate to online collection, and the resulting loss of within-cohort linkage and longitudinal follow-up is acknowledged.

-   Section 7: adds hosting jurisdiction, the treatment of connection metadata, client authorisation, export and source deletion. The cross-border transfer statement is narrowed to what the design supports.

-   Section 8: adds risks arising from digital collection, namely perceived tracking, network and device failure, unequal device access, and bilingual rendering.

-   Section 9: timeline extended to cover the October cohort and the build and testing of the instrument layer.

// Appendices A–D: Cycle 2 research instruments, drafted from the candidate's component–method
// mapping (presentation slide 21) and example questions (slide 23). American spelling (D6).
// Status: AI-drafted per authorship protocol - awaiting candidate rewrite-and-judge pass.

const A = {
  intro: [
    'Semi-structured interview guide for trainers, subject-matter experts, and learning-and-development managers. Two interviews use this guide in Cycle 1, as Section 4.3 explains, and the remainder in Cycle 2. Duration 45–60 minutes. The interviewer opens by restating the study’s purpose, confirming informed consent and audio-recording permission, and reminding the participant that responses are anonymized and withdrawal is possible at any time. Probes in parentheses are used flexibly; the guide is a scaffold, not a script.',
  ],
  sections: [
    ['Opening (all participants)', [
      '1. Please describe your role and your experience with finance training in your organization.',
      '2. How were you involved with this program, as a deliverer, adapter, or decision-maker?',
    ]],
    ['AI-designed artifacts and the design partnership - trainers and SMEs (RQ1)', [
      '3. Walk me through how you used the AI-designed materials in your delivery. What did you keep exactly as designed, what did you adapt, and what did you overrule entirely? What made an AI suggestion trustworthy, or not?',
      '4. Component by component - presentations, instructor manual, case studies, workshops, assessments - where did the materials help you most, and where did they hinder you? What did you change after your first delivery, and why?',
      '5. Compared with materials you have built yourself, or received from human designers, how do these differ in quality, coherence, and relevance to your learners?',
      '6. Tell me about one classroom moment where an AI-designed element clearly worked, and one where it clearly failed. What happened?',
    ]],
    ['Adoption and governance - L&D managers (RQ3, RQ5)', [
      '7. What would it take for your organization to adopt AI-designed training at scale? (Probe: perceived usefulness, ease of integration, management support, budget, existing vendor arrangements.)',
      '8. Who would need to approve such adoption, and what concerns would they raise? (Probe: quality assurance, accountability for errors, data protection and PDPL, organizational reputation.)',
      '9. What disclosure do you expect about AI’s role in producing training your staff receive, and who should be accountable for the content? (RQ5)',
    ]],
    ['Perceived outcomes and closing (all participants; RQ4)', [
      '10. What changes - in knowledge, confidence, or workplace behavior - have you observed in participants after the program? What evidence would convince you that it builds financial competence?',
      '11. If you could change one thing about the program, or about how AI is used in designing it, what would it be?',
      '12. Is there anything important we have not talked about?',
    ]],
  ],
};

const B = {
  intro: [
    'Focus group guide for learners (Cycle 2). Duration 60–90 minutes, four to eight participants per group, conducted after program completion. The moderator opens with introductions, ground rules (one voice at a time; no right answers; confidentiality within the group), and a reminder of informed consent and recording. Probes in parentheses.',
  ],
  sections: [
    ['Warm-up and overall experience', [
      '1. Thinking back over the program, what stands out most for you? (Open; let contrasts emerge.)',
      '2. How did this program compare with other finance or corporate training you have attended? (Probe: clarity, pace, difficulty, usefulness of materials, English/Arabic experience.)',
    ]],
    ['Gamification and simulation (RQ2 - Self-Determination Theory probes)', [
      '3. The program ran as a team competition - three rounds, decisions, a leaderboard. How did that affect your effort and attention? Did the competition help your learning or get in its way? (Probe autonomy: did you feel you had real choices? Probe competence: did the feedback make you feel more capable round by round? Probe relatedness: what did working in a team add or cost?)',
      '4. Describe one decision your team made in the simulation - financing, investment, or operating - and how you reached it. What did the results that came back teach you?',
    ]],
    ['AI-designed materials (RQ1, RQ5)', [
      '5. The learning materials in this program were designed with generative AI. Does knowing that change how much you trust the content? What would you want to be checked or guaranteed?',
      '6. Was there any point where the materials felt confusing, generic, or wrong? What happened?',
    ]],
    ['Competence and transfer (RQ4)', [
      '7. Since the program, have you used anything from it at work - reading a report differently, asking a different question, making a case with numbers? Tell us about it.',
      '8. What should be changed before the next group goes through the program?',
    ]],
  ],
};

const C = {
  intro: [
    'Non-participant observation protocol for workshop sessions (both cycles). The observer does not intervene in delivery. Observation is structured by workshop segment; descriptive notes are kept strictly separate from the observer’s interpretive and reflexive notes. No participant names are recorded. Only role codes are used (e.g., L3 = third learner to speak). Field notes are written up within 24 hours of the session.',
    'For each segment, the observer records: (1) time and the module or AI-designed component in use; (2) facilitator actions, including every deviation from the AI-designed plan and its apparent trigger; (3) learner behavior and engagement markers - questions asked, peer discussion, platform use, signs of confusion or disengagement; (4) critical incidents where an AI-designed element visibly catalyzed discussion, caused confusion, or was challenged on factual grounds; and (5) a separately-flagged reflexive note capturing the observer’s own reactions and assumptions.',
    'After each session the observer completes a one-page summary: the three strongest learning moments; the three sharpest friction points; a log of all deviations from the designed materials with apparent reasons; and a mapping of observed evidence to Kirkpatrick Levels 1–3 (reaction, learning, behavioral intention). These summaries feed the Framework Method matrices described in Section 4.5.',
  ],
  sections: [],
};

const D_INTRO = [
  'Artifact audit rubrics for the seven AI-designed component types (both cycles). Each artifact is rated dimension by dimension on a four-point scale - 1 = absent or violated; 2 = partially present; 3 = adequately implemented; 4 = exemplary - and every rating must cite concrete evidence from the artifact (slide number, manual section, game mechanic). Ratings are recorded in the Framework Method matrices so that artifact quality can be compared across component types and across cycles.',
];

// [dimension, what exemplary looks like]
const D1 = {
  title: 'D.1 Presentations, delegates’ materials, and eLearning modules - multimedia learning principles (Mayer, 2021; Clark & Mayer, 2023)',
  rows: [
    ['Coherence', 'No extraneous text, imagery, or decoration; every element serves the learning objective.'],
    ['Signaling', 'Essential material is visually cued - headings, highlighting, stepwise builds guide attention.'],
    ['Redundancy', 'Narration and on-screen text are complementary, not verbatim duplicates.'],
    ['Contiguity', 'Words are placed next to the graphics they describe, and appear at the same time.'],
    ['Segmenting', 'Content is chunked into learner-paced units rather than continuous blocks.'],
    ['Multimedia & modality', 'Concepts are carried by words plus purposeful graphics, not text alone.'],
    ['Personalization', 'Conversational register and direct address rather than formal monologue.'],
    ['Generative activity', 'Worked examples, practice opportunities, and retrieval moments are built in.'],
  ],
};
const D2 = {
  title: 'D.2 Instructor manual and session plans - events of instruction (Gagné, 1985)',
  rows: [
    ['Objectives', 'Each session states observable learning objectives up front.'],
    ['Attention & activation', 'Openings gain attention and connect to learners’ prior knowledge.'],
    ['Content clarity', 'Presentation sequence is logical; terminology is defined and consistent.'],
    ['Guidance', 'The manual anticipates misconceptions and equips the facilitator to address them.'],
    ['Elicited performance', 'Every objective is exercised through an activity, case, or simulation round.'],
    ['Feedback', 'The design specifies when and how learners receive feedback on performance.'],
    ['Assessment alignment', 'Assessments trace to stated objectives - no orphan questions, no untested objectives.'],
    ['Transfer support', 'Closing elements connect learning to participants’ actual workplace decisions.'],
  ],
};
const D3 = {
  title: 'D.3 Gamification and simulation - Self-Determination Theory (Ryan & Deci, 2000) and the MDA framework (Hunicke et al., 2004)',
  rows: [
    ['Mechanics inventory', 'All mechanics are identified and documented: teams, roles, rounds, decisions, points, leaderboard, market events.'],
    ['Mechanics → dynamics', 'Each mechanic demonstrably produces its intended dynamic (competition, collaboration, risk management).'],
    ['Dynamics → aesthetics', 'The dynamics generate the intended experience: challenge, fellowship, discovery.'],
    ['Autonomy support', 'Teams make meaningful, consequential choices rather than following a fixed path.'],
    ['Competence support', 'Round-by-round feedback is informative and difficulty is calibrated so effort visibly pays off.'],
    ['Relatedness support', 'Team structures create genuine interdependence and shared outcomes.'],
    ['Learning–mechanic fit', 'Game elements carry the finance content rather than decorating it; winning requires financial reasoning.'],
  ],
};

module.exports = { A, B, C, D_INTRO, D1, D2, D3 };

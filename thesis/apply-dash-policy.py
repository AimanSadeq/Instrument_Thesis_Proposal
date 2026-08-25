# One-time sweep: remove em dashes (U+2014) from all thesis sources, replacing each
# contextually with a period, comma, or plain dash per the candidate's style decision (D9).
# En dashes (U+2013) in ranges (6-9 September, pages, Levels 1-2, human-AI) are untouched.
import io, re, sys, os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

EM = '—'

# (file, old, new) — each old must occur exactly once unless count is given as 4th element.
R = []
def add(f, old, new, n=1): R.append((f, old, new, n))

S1 = 'section1-introduction.js'
add(S1, 'investment advice — real gains, conditional on validation, implementability, and governance.',
        'investment advice. The gains are real, conditional on validation, implementability, and governance.')
add(S1, 'to financial competence development — the applied, workplace-oriented construct codified by the OECD/INFE frameworks — and the question became concrete',
        'to financial competence development, the applied, workplace-oriented construct codified by the OECD/INFE frameworks, and the question became concrete')
add(S1, 'seven component types — facilitator presentations',
        'seven component types - facilitator presentations')
add(S1, 'assessments and exercises, and eLearning modules — organized around FinPlay',
        'assessments and exercises, and eLearning modules - organized around FinPlay')
add(S1, 'has changed remarkably little — instructor-led sessions',
        'has changed remarkably little - instructor-led sessions')
add(S1, 'Generative AI changes the production economics of training design — materials that took design teams weeks can now be drafted in days — but production capability is not design knowledge.',
        'Generative AI changes the production economics of training design. Materials that took design teams weeks can now be drafted in days, but production capability is not design knowledge.')
add(S1, 'in authentic professional settings — and to derive from that process',
        'in authentic professional settings, and to derive from that process')
add(S1, 'the human–AI collaboration question — identified in my Year 1 review as one of the most promising configurations in finance — from financial markets',
        'the human–AI collaboration question, identified in my Year 1 review as one of the most promising configurations in finance, from financial markets')
add(S1, 'architecture that organizations — in the Gulf region and beyond — can apply directly',
        'architecture that organizations, in the Gulf region and beyond, can apply directly')
add(S1, 'as architected by the G20/OECD INFE frameworks — applied here to professionals',
        'as architected by the G20/OECD INFE frameworks, applied here to professionals')
add(S1, 'producing novel content — text, structured documents, software — from natural-language instruction',
        'producing novel content - text, structured documents, software - from natural-language instruction')
add(S1, 'Section 4 presents the methodology — a two-cycle Design-Based Research design',
        'Section 4 presents the methodology - a two-cycle Design-Based Research design')

S2 = 'section2-literature-review.js'
add(S2, 'these gains are real but conditional — on rigorous out-of-sample validation, on implementability once market frictions are considered, and on governance frameworks capable of managing opacity and bias — and that hybrid arrangements',
        'these gains are real but conditional - on rigorous out-of-sample validation, on implementability once market frictions are considered, and on governance frameworks capable of managing opacity and bias - and that hybrid arrangements')
add(S2, 'acquire financial competence — and under what conditions is such AI-designed training effective',
        'acquire financial competence, and under what conditions is such AI-designed training effective')
add(S2, 'dozens of use cases — content generation among the most promising — while noting',
        'dozens of use cases, content generation among the most promising, while noting')
add(S2, 'four content areas — money and transactions, planning and managing finances, risk and reward, and the financial landscape — each expressed',
        'four content areas - money and transactions, planning and managing finances, risk and reward, and the financial landscape - each expressed')
add(S2, 'with effect sizes several times larger than earlier estimates — and, critically for this thesis, finds that intensity and instructional design moderate those effects.',
        'with effect sizes several times larger than earlier estimates. Critically for this thesis, it also finds that intensity and instructional design moderate those effects.')
add(S2, 'a standardized measurement infrastructure — though one aimed at national populations',
        'a standardized measurement infrastructure, though one aimed at national populations')
add(S2, 'a purpose-built adult-learning environment — provided its design actually delivers',
        'a purpose-built adult-learning environment, provided its design actually delivers')
add(S2, 'consumer-facing information displays — loan comparisons — rather than professional training',
        'consumer-facing information displays, loan comparisons, rather than professional training')
add(S2, 'Gamification — the use of game design elements in non-game contexts (Deterding, Dixon, Khaled & Nacke, 2011) — and its full-fledged sibling',
        'Gamification, the use of game design elements in non-game contexts (Deterding, Dixon, Khaled & Nacke, 2011), and its full-fledged sibling')
add(S2, 'the mapping is specific — badges, leaderboards',
        'the mapping is specific - badges, leaderboards')
add(S2, 'matched to specific needs — which is precisely',
        'matched to specific needs, which is precisely')
add(S2, '(Soobhany, 2026) — a single, early-stage exception',
        '(Soobhany, 2026), a single, early-stage exception')
add(S2, 'anchored by the Technology Acceptance Model — perceived usefulness and perceived ease of use as the drivers of intention (Davis, 1989) — and its successors',
        'anchored by the Technology Acceptance Model - perceived usefulness and perceived ease of use as the drivers of intention (Davis, 1989) - and its successors')
add(S2, 'feed back into adoption as facilitating — or blocking — conditions',
        'feed back into adoption as facilitating or blocking conditions')
add(S2, 'That adoption context — organizational, procurement-like, and consequential — is essentially unstudied',
        'That adoption context - organizational, procurement-like, and consequential - is essentially unstudied')
add(S2, 'anchored by the Kirkpatrick framework — reaction, learning, behavior, results — in its contemporary New World form',
        'anchored by the Kirkpatrick framework - reaction, learning, behavior, results - in its contemporary New World form')
add(S2, 'the systematic search surfaced tooling — a prototype generative-AI-based training-evaluation management system (Xing, 2023) — but no evaluation study',
        'the systematic search surfaced tooling, a prototype generative-AI-based training-evaluation management system (Xing, 2023), but no evaluation study')
add(S2, 'rather than claimed statistically — an evaluation posture matched',
        'rather than claimed statistically, an evaluation posture matched')
add(S2, 'Financial competence development — defined through the OECD/INFE architecture and evaluated through Kirkpatrick Levels 1–2 — is the outcome (RQ4).',
        'Financial competence development, defined through the OECD/INFE architecture and evaluated through Kirkpatrick Levels 1–2, is the outcome (RQ4).')
add(S2, 'responsible-AI governance — UNESCO’s guidance, the OECD AI Principles, and the Saudi and Emirati data-protection regimes — determines',
        'responsible-AI governance - UNESCO’s guidance, the OECD AI Principles, and the Saudi and Emirati data-protection regimes - determines')
add(S2, 'Kirkpatrick as the outcome vocabulary — a theory-informed qualitative design rather than a hypothesis-testing one.',
        'Kirkpatrick as the outcome vocabulary. The result is a theory-informed qualitative design rather than a hypothesis-testing one.')
add(S2, 'anchored three times over — to a theoretical lens in this framework, to designated data sources in the alignment matrix (Appendix G), and to an analysis strategy in Section 4.5 — which is the traceability',
        'anchored three times over - to a theoretical lens in this framework, to designated data sources in the alignment matrix (Appendix G), and to an analysis strategy in Section 4.5 - which is the traceability')
add(S2, 'substantial on its own — thousands of records',
        'substantial on its own - thousands of records')

S3 = 'section3-empirical-setting.js'
add(S3, 'backgrounds lie outside finance — engineers moving into management',
        'backgrounds lie outside finance - engineers moving into management')
add(S3, 'practice deliveries — in person, over three days per group, co-facilitated by the researcher and a professional colleague — which predate',
        'practice deliveries - in person, over three days per group, co-facilitated by the researcher and a professional colleague - which predate')
add(S3, 'to multiple organizations — private and government — in the Kingdom, delivering',
        'to multiple organizations, private and government, in the Kingdom, delivering')
add(S3, 'reflecting organizational seniority — 21 senior executives and 16 supervisors and managers — predominantly',
        'reflecting organizational seniority - 21 senior executives and 16 supervisors and managers - predominantly')
add(S3, 'approximately 25 professionals at a second client organization — a large Saudi technology company — in a four-day program',
        'approximately 25 professionals at a second client organization, a large Saudi technology company, in a four-day program')
add(S3, 'participation in the research — completing instruments, being observed for research purposes — is voluntary',
        'participation in the research - completing instruments, being observed for research purposes - is voluntary')
add(S3, 'real organizational stakes — not laboratory approximations',
        'real organizational stakes, not laboratory approximations')
add(S3, 'the full design history of the artifacts — access an external researcher could not obtain — while',
        'the full design history of the artifacts - access an external researcher could not obtain - while')
add(S3, 'makes governance requirements — the subject of RQ5 — a live, observable feature',
        'makes governance requirements, the subject of RQ5, a live, observable feature')

S4 = 'section4-methodology.js'
add(S4, 'The phenomena under investigation — how professionals engage with AI-designed training materials, how facilitators exercise judgment over AI-generated content, and how organizations come to trust or resist AI-assisted training — are socially constructed',
        'The phenomena under investigation - how professionals engage with AI-designed training materials, how facilitators exercise judgment over AI-generated content, and how organizations come to trust or resist AI-assisted training - are socially constructed')
add(S4, 'canonical four-phase structure — analysis of the problem',
        'canonical four-phase structure - analysis of the problem')
add(S4, 'Cohort 1 — the study’s first data-collection cohort, approximately 25 professionals at a second client organization — runs as a four-day program',
        'Cohort 1 - the study’s first data-collection cohort, approximately 25 professionals at a second client organization - runs as a four-day program')
add(S4, 'across multiple organizations — private and government — in the Kingdom, with formal data collection',
        'across multiple organizations, private and government, in the Kingdom, with formal data collection')
add(S4, 'between code saturation — the point at which no new codes emerge — and meaning saturation',
        'between code saturation, the point at which no new codes emerge, and meaning saturation')
add(S4, 'perform in live delivery — where they catalyze discussion',
        'perform in live delivery - where they catalyze discussion')
add(S4, 'AI prompt/output logs — the versioned record of instructions given to, and artifacts produced by, the generative AI during design — provide direct evidence',
        'AI prompt/output logs - the versioned record of instructions given to, and artifacts produced by, the generative AI during design - provide direct evidence')
add(S4, 'behavioral telemetry — decision logs, module progression, and team recommendation records — collected under versioned informed consent',
        'behavioral telemetry - decision logs, module progression, and team recommendation records - collected under versioned informed consent')
add(S4, '(2006) — familiarization, coding, generating initial themes, developing and reviewing themes, refining and naming themes, and writing up — in its contemporary reflexive formulation',
        '(2006) - familiarization, coding, generating initial themes, developing and reviewing themes, refining and naming themes, and writing up - in its contemporary reflexive formulation')
add(S4, 'Cycle 1 material — the structured instrument returns and observation records from Cohort 1 — is analyzed first',
        'Cycle 1 material, the structured instrument returns and observation records from Cohort 1, is analyzed first')
add(S4, 'Descriptive statistics — means and distributions of pre/post assessment scores and engagement indicators — are reported',
        'Descriptive statistics, means and distributions of pre/post assessment scores and engagement indicators, are reported')
add(S4, 'the AI prompt/output logs — the same transparency discipline applied to the research object is applied to the research process.',
        'the AI prompt/output logs. The same transparency discipline applied to the research object is applied to the research process.')
add(S4, 'carry direct ecological validity — a property laboratory studies',
        'carry direct ecological validity, a property laboratory studies')
add(S4, 'provides depth of access — to a ministry client, to delivery colleagues, and to the full design history of the artifacts — that an external researcher could not replicate.',
        'provides depth of access - to a ministry client, to delivery colleagues, and to the full design history of the artifacts - that an external researcher could not replicate.')
add(S4, 'which the researcher delivers personally — a configuration that is common',
        'which the researcher delivers personally, a configuration that is common')

S5 = 'section5-findings.js'
add(S5, 'The complete program — the seven AI-designed component types and the FinPlay platform with its ten-module learning journey and three-round financial simulation — is operational',
        'The complete program, the seven AI-designed component types and the FinPlay platform with its ten-module learning journey and three-round financial simulation, is operational')
add(S5, 'instrument suite is prepared — the consent and briefing sheet, the pre-training questionnaire, daily reflection cards for each of the four days, and the post-training evaluation — together with',
        'instrument suite is prepared - the consent and briefing sheet, the pre-training questionnaire, daily reflection cards for each of the four days, and the post-training evaluation - together with')
add(S5, 'described in Section 4.4 — the versioned pre/post knowledge assessment, structured digital reflections, post-program evaluation, and behavioral telemetry under versioned consent — is built',
        'described in Section 4.4 - the versioned pre/post knowledge assessment, structured digital reflections, post-program evaluation, and behavioral telemetry under versioned consent - is built')
add(S5, 'executable ahead of participant data — rating each component type against the multimedia, instructional design, and gamification rubrics — and those audits',
        'executable ahead of participant data - rating each component type against the multimedia, instructional design, and gamification rubrics - and those audits')
add(S5, 'early descriptive results — participation and completion counts, and headline reaction-level patterns — will be added',
        'early descriptive results - participation and completion counts, and headline reaction-level patterns - will be added')
add(S5, 'feeds the systematic redesign — the hinge of the Design-Based Research logic — through which',
        'feeds the systematic redesign, the hinge of the Design-Based Research logic, through which')
add(S5, 'reports the two-cycle arc — from AI-designed prototype through evidenced redesign to scaled delivery — together with',
        'reports the two-cycle arc, from AI-designed prototype through evidenced redesign to scaled delivery, together with')

# References: the two em dashes sit inside published article titles; the sources themselves
# use an en dash, so restore fidelity with an en dash rather than rewording a title.
RF = 'references.js'
add(RF, 'accounting education — which dimensions', 'accounting education – which dimensions')
add(RF, 'higher education — where are the educators?', 'higher education – where are the educators?')

AP = 'appendices-a-d.js'
add(AP, 'with this program — as a deliverer, adapter, or decision-maker?',
        'with this program, as a deliverer, adapter, or decision-maker?')
add(AP, 'the design partnership — trainers and SMEs (RQ1)',
        'the design partnership - trainers and SMEs (RQ1)')
add(AP, 'an AI suggestion trustworthy — or not?',
        'an AI suggestion trustworthy, or not?')
add(AP, 'Component by component — presentations, instructor manual, case studies, workshops, assessments — where did',
        'Component by component - presentations, instructor manual, case studies, workshops, assessments - where did')
add(AP, 'clearly worked — and one where it clearly failed',
        'clearly worked, and one where it clearly failed')
add(AP, 'Adoption and governance — L&D managers (RQ3, RQ5)',
        'Adoption and governance - L&D managers (RQ3, RQ5)')
add(AP, 'training your staff receive — and who should be accountable',
        'training your staff receive, and who should be accountable')
add(AP, 'What changes — in knowledge, confidence, or workplace behavior — have you observed',
        'What changes - in knowledge, confidence, or workplace behavior - have you observed')
add(AP, '(RQ2 — Self-Determination Theory probes)',
        '(RQ2 - Self-Determination Theory probes)')
add(AP, 'a team competition — three rounds, decisions, a leaderboard.',
        'a team competition - three rounds, decisions, a leaderboard.')
add(AP, 'made in the simulation — financing, investment, or operating — and how you reached it',
        'made in the simulation - financing, investment, or operating - and how you reached it')
add(AP, 'anything from it at work — reading a report differently',
        'anything from it at work - reading a report differently')
add(AP, 'No participant names are recorded — role codes only (e.g., L3 = third learner to speak).',
        'No participant names are recorded. Only role codes are used (e.g., L3 = third learner to speak).')
add(AP, 'engagement markers — questions asked, peer discussion, platform use, signs of confusion or disengagement;',
        'engagement markers - questions asked, peer discussion, platform use, signs of confusion or disengagement;')
add(AP, 'a four-point scale — 1 = absent or violated; 2 = partially present; 3 = adequately implemented; 4 = exemplary — and every rating',
        'a four-point scale - 1 = absent or violated; 2 = partially present; 3 = adequately implemented; 4 = exemplary - and every rating')
add(AP, 'eLearning modules — multimedia learning principles',
        'eLearning modules - multimedia learning principles')
add(AP, 'visually cued — headings, highlighting',
        'visually cued - headings, highlighting')
add(AP, 'session plans — events of instruction',
        'session plans - events of instruction')
add(AP, 'trace to stated objectives — no orphan questions',
        'trace to stated objectives - no orphan questions')
add(AP, 'simulation — Self-Determination Theory (Ryan & Deci, 2000)',
        'simulation - Self-Determination Theory (Ryan & Deci, 2000)')

BS = 'build-skeleton.js'
add(BS, 'Thesis Proposal — Leveraging', 'Thesis Proposal - Leveraging')
add(BS, '[EXACT COUNT — includes list of references;', '[EXACT COUNT - includes list of references;')
add(BS, 'keep the two levels separated — AI as production assistance',
        'keep the two levels separated - AI as production assistance')
add(BS, 'STATUS: drafted — your rewrite-and-judge pass pending. Opens',
        'STATUS: drafted. Your rewrite-and-judge pass pending. Opens')
add(BS, 'Scopus log of 17 Aug 2026 — your rewrite-and-judge pass pending.',
        'Scopus log of 17 Aug 2026. Your rewrite-and-judge pass pending.')
add(BS, 'STATUS: drafted — your rewrite-and-judge pass pending. 3.4 is yours',
        'STATUS: drafted. Your rewrite-and-judge pass pending. 3.4 is yours')
add(BS, 'RESERVED — you write this', 'RESERVED - you write this')
add(BS, 'the bias risks it creates — naming them yourself',
        'the bias risks it creates, naming them yourself')
add(BS, 'drafted from the approved design — your rewrite-and-judge pass pending.',
        'drafted from the approved design. Your rewrite-and-judge pass pending.')
add(BS, 'drafted in the status-only form — Draft 1 never depends',
        'drafted in the status-only form. Draft 1 never depends')
add(BS, 'alphabetical, 75 entries — every in-text citation resolved.',
        'alphabetical, 75 entries. Every in-text citation resolved.')
add(BS, 'the study’s dual output — a refined intervention and an updated statement of design principles.',
        'the study’s dual output, a refined intervention and an updated statement of design principles.')
add(BS, 'sealed envelopes carried by a third party — never handed to the facilitator.',
        'sealed envelopes carried by a third party, never handed to the facilitator.')
add(BS, 'The full log — query strings, top-ranked records, subject-area distributions, and methodological caveats — is retained',
        'The full log - query strings, top-ranked records, subject-area distributions, and methodological caveats - is retained')
add(BS, '(official guidelines) — instruments can be included in full.',
        '(official guidelines). Instruments can be included in full.')

BE = 'build-elm-materials.js'
add(BE, 'ELM Session Materials — Facilitator', 'ELM Session Materials - Facilitator')
add(BE, 'Facilitator Run-Sheet — Research Instruments', 'Facilitator Run-Sheet - Research Instruments')
add(BE, '(Days 1–4 — four separate stacks)', '(Days 1–4, four separate stacks)')
add(BE, 'during collection moments — participants should not hand forms to you.',
        'during collection moments. Participants should not hand forms to you.')
add(BE, 'Day 1 — opening (before any content)', 'Day 1 - opening (before any content)')
add(BE, 'Everything you write is anonymous — do not write your name on any form.',
        'Everything you write is anonymous. Do not write your name on any form.')
add(BE, 'returns a blank slip — no visible difference.',
        'returns a blank slip - no visible difference.')
add(BE, 'No names — straight into the envelope when you finish.',
        'No names. Straight into the envelope when you finish.')
add(BE, 'end of Day 1 — Reflection Card', 'end of Day 1 - Reflection Card')
add(BE, 'help improve the program — critical answers are the most useful ones.',
        'help improve the program. Critical answers are the most useful ones.')
add(BE, 'Days 2 and 3 — closing each day', 'Days 2 and 3 - closing each day')
add(BE, 'Keep the five minutes protected — do not let the day overrun into the card time.',
        'Keep the five minutes protected. Do not let the day overrun into the card time.')
add(BE, 'Day 4 — closing sequence (allow 25 minutes)', 'Day 4 - closing sequence (allow 25 minutes)')
add(BE, 'Day 4 (5 min) — same routine;', 'Day 4 (5 min) - same routine;')
add(BE, 'covers the whole program — the content, the materials',
        'covers the whole program - the content, the materials')
add(BE, 'within 24 hours of each day — your observations are data, but keep them',
        'within 24 hours of each day. Your observations are data, but keep them')
add(BE, 'with the reason — deviations are audit-trail material, not failures.',
        'with the reason. Deviations are audit-trail material, not failures.')
add(BE, 'Daily Reflection Card — Day 4', 'Daily Reflection Card - Day 4')
add(BE, 'بطاقة التأمل اليومية — اليوم الرابع',
        'بطاقة التأمل اليومية - اليوم الرابع')

BP = 'build-protocol.js'
add(BP, 'Version 1.0 — August 2026', 'Version 1.0 - August 2026')
add(BP, 'so no one — including the facilitator and the employer — can tell who declined.',
        'so no one, including the facilitator and the employer, can tell who declined.')
add(BP, 'Consent & Briefing Sheet — research context', 'Consent & Briefing Sheet - research context')
add(BP, 'Pre-Training Questionnaire — demographics', 'Pre-Training Questionnaire - demographics')
add(BP, 'Days 1–4 — three open questions per day', 'Days 1–4 - three open questions per day')
add(BP, 'Post-Training Evaluation — Kirkpatrick Levels 1–2', 'Post-Training Evaluation - Kirkpatrick Levels 1–2')
add(BP, 'conducts the research — a standard configuration', 'conducts the research, a standard configuration')
add(BP, 'linked to an individual — the data are anonymous at source, not merely anonymized afterwards.',
        'linked to an individual. The data are anonymous at source, not merely anonymized afterwards.')
add(BP, '(none exist — data are anonymous)', '(none exist because the data are anonymous)')

SVG = 'dbr-cycle.svg'
add(SVG, 'CYCLE 1 — Structured Pilot', 'CYCLE 1 - Structured Pilot')
add(SVG, 'CYCLE 2 — Scaled Delivery', 'CYCLE 2 - Scaled Delivery')

errors = 0
touched = {}
for f, old, new, n in R:
    text = touched.get(f)
    if text is None:
        with io.open(f, encoding='utf-8') as fh:
            text = fh.read()
    c = text.count(old)
    if c != n:
        print(f'MISMATCH [{f}] count={c} expected={n}: {old[:70]}...')
        errors += 1
        continue
    touched[f] = text.replace(old, new)

# Second pass over every touched + remaining file: em dashes in // comments and in
# decorative separator runs become plain dashes (never rendered into the documents).
ALL = ['section1-introduction.js','section2-literature-review.js','section3-empirical-setting.js',
       'section4-methodology.js','section5-findings.js','references.js','appendices-a-d.js',
       'build-skeleton.js','build-elm-materials.js','build-protocol.js','dbr-cycle.svg']
for f in ALL:
    text = touched.get(f)
    if text is None:
        with io.open(f, encoding='utf-8') as fh:
            text = fh.read()
    text = re.sub(EM + '{2,}', lambda m: '-' * len(m.group(0)), text)  # decorative runs
    text = re.sub(r'^(\s*//.*)$', lambda m: m.group(1).replace(EM, '-'), text, flags=re.M)
    touched[f] = text

if errors:
    print(f'{errors} mismatches - NOTHING written.')
    sys.exit(1)

for f, text in touched.items():
    with io.open(f, 'w', encoding='utf-8') as fh:
        fh.write(text)
    left = text.count(EM)
    print(f'{f}: written, {left} em dashes remaining')

'use strict';

const { config } = require('../config');

/**
 * Instrument content, English and Arabic, transcribed verbatim from
 * "Research Instruments, version 2.1" (August 2026).
 *
 * Nothing here may be reworded, reordered, added to or dropped without a
 * corresponding change to that document.
 *
 * One thing does vary: version 2.0 is written for a four-day programme, and
 * not every cohort runs four days. `withProgrammeDays` at the foot of this file
 * changes the day count and nothing else, by substituting named phrases whose
 * presence it asserts. Everything below stays the canonical four-day text, so
 * `npm run verify:wording` still checks it word for word against the source
 * document, and `npm test` checks that a shorter programme differs from it
 * only in those day words. Option `value` codes are stored in
 * the database instead of the localised label, so that an English response
 * and an Arabic response to the same item are comparable and so that the
 * stored row does not record which language the participant used.
 */

const CONSENT = {
  id: 'consent',
  path: '/',
  title: {
    en: 'Research Participation: Information and Consent',
    ar: 'نموذج المعلومات والموافقة على المشاركة في البحث'
  },
  blocks: [
    { type: 'strong', en: 'Doctoral research study, SDA Bocconi School of Management',
      ar: 'دراسة بحثية لنيل درجة الدكتوراه، كلية SDA Bocconi لإدارة الأعمال' },
    { type: 'p', en: 'Thank you for taking part in this training programme.',
      ar: 'شكراً لمشاركتك في هذا البرنامج التدريبي.' },
    { type: 'p',
      en: 'The training materials used in this programme were designed with the assistance of artificial intelligence, as part of a doctoral research project at SDA Bocconi School of Management, supervised by Professor Emanuele Borgonovo.',
      ar: 'تم تصميم المواد التدريبية المستخدمة في هذا البرنامج بمساعدة الذكاء الاصطناعي، وذلك ضمن مشروع بحثي لنيل درجة الدكتوراه في كلية SDA Bocconi لإدارة الأعمال، بإشراف البروفيسور إيمانويلي بورغونوفو.' },
    { type: 'h2', en: 'About the research', ar: 'حول البحث' },
    { type: 'p',
      en: 'This study examines how AI-assisted design affects the quality of finance training for working professionals, how people experience gamified simulation, and what makes such training effective and trustworthy.',
      ar: 'تدرس هذه الدراسة كيف يؤثر التصميم بمساعدة الذكاء الاصطناعي على جودة التدريب المالي للمهنيين، وكيف يختبر المشاركون المحاكاة القائمة على التلعيب، وما الذي يجعل هذا التدريب فعالاً وجديراً بالثقة.' },
    { type: 'h2', en: 'What you are being asked to do', ar: 'ما المطلوب منك' },
    { type: 'p',
      en: 'During this four-day programme you may complete four short activities: a brief questionnaire at the start of Day 1, a short reflection at the end of each day (about five minutes), and a final evaluation at the end of Day 4 (about ten minutes).',
      ar: 'خلال هذا البرنامج الذي يمتد أربعة أيام، يمكنك إكمال أربعة أنشطة قصيرة: استبيان موجز في بداية اليوم الأول، وتأمل قصير في نهاية كل يوم (نحو خمس دقائق)، وتقييم نهائي في نهاية اليوم الرابع (نحو عشر دقائق).' },
    { type: 'h2', en: 'Your responses are anonymous', ar: 'استجاباتك مجهولة الهوية' },
    { type: 'ul',
      en: [
        'No name, employee number, email address, or any other identifying information is collected at any point',
        'You do not log in, and these forms are completely separate from the FinPlay training platform',
        'Your responses cannot be linked to you, to each other, or to anything you do in the training',
        'Your employer will never see individual responses, because no individual responses exist to see'
      ],
      ar: [
        'لا يُجمع أي اسم أو رقم وظيفي أو بريد إلكتروني أو أي معلومة تعريفية أخرى في أي مرحلة',
        'لا تحتاج إلى تسجيل الدخول، وهذه النماذج منفصلة تماماً عن منصة FinPlay التدريبية',
        'لا يمكن ربط استجاباتك بك، ولا ربطها ببعضها البعض، ولا بأي نشاط تقوم به في التدريب',
        'لن يطّلع صاحب العمل على أي استجابة فردية، لأنه لا توجد استجابات فردية يمكن الاطلاع عليها'
      ] },
    { type: 'h2', en: 'Your choice is free', ar: 'اختيارك حر' },
    { type: 'p',
      en: 'Taking part in the research is entirely voluntary and separate from your attendance at the training, which your employer arranged. Choosing not to take part has no effect whatsoever on your training experience and no employment consequence of any kind.',
      ar: 'المشاركة في البحث طوعية تماماً ومنفصلة عن حضورك للتدريب الذي رتبه صاحب العمل. اختيارك عدم المشاركة لا يؤثر إطلاقاً على تجربتك التدريبية ولا تترتب عليه أي نتيجة وظيفية.' },
    { type: 'p',
      en: 'You may stop at any time simply by not completing a later activity. Because responses carry no identifiers, a submitted response cannot afterwards be found and withdrawn.',
      ar: 'يمكنك التوقف في أي وقت بعدم إكمال نشاط لاحق. ولأن الاستجابات لا تحمل أي معرّف، لا يمكن العثور على استجابة أُرسلت مسبقاً لسحبها.' },
    { type: 'h2', en: 'Questions', ar: 'للاستفسار' },
    { type: 'p',
      en: 'Contact the researcher, Aiman S. Sadeq, or the institutional ethics contact at ethics@unibocconi.it.',
      ar: 'يمكنك التواصل مع الباحث أيمن صادق، أو مع جهة الأخلاقيات المؤسسية على ethics@unibocconi.it' }
  ],
  prompt: { en: 'Please choose one:', ar: 'يرجى اختيار واحد مما يلي:' },
  choices: [
    { value: 'agree', en: 'I agree to take part in the research', ar: 'أوافق على المشاركة في البحث' },
    { value: 'decline', en: 'I prefer not to take part', ar: 'أفضّل عدم المشاركة' }
  ]
};

const PRE_TRAINING = {
  id: 'pre',
  path: '/pre',
  title: { en: 'Pre-Training Questionnaire', ar: 'استبيان ما قبل التدريب' },
  note: {
    en: 'Day 1, before training content begins. About five minutes.',
    ar: 'اليوم الأول، قبل بدء المحتوى التدريبي. نحو خمس دقائق.'
  },
  // Protocol section 5 requires this on each instrument that follows the Day 1
  // briefing. Version 2.0 of the instruments omitted it here; 2.1 adds it.
  reminder: {
    en: 'A reminder: taking part remains voluntary, and your responses are anonymous.',
    ar: 'تذكير: المشاركة تبقى طوعية، واستجاباتك مجهولة الهوية.'
  },
  intro: {
    en: 'Your responses are anonymous. This helps the researcher understand the range of backgrounds and expectations in the group.',
    ar: 'استجاباتك مجهولة الهوية. تساعد هذه المعلومات الباحث على فهم تنوع الخلفيات والتوقعات في المجموعة.'
  },
  sections: [
    {
      title: { en: 'Section A: Background', ar: 'القسم أ: الخلفية' },
      items: [
        {
          id: 'a1', type: 'radio',
          label: { en: 'A1. Which best describes your current role?', ar: 'أ١. أي مما يلي يصف دورك الحالي بشكل أفضل؟' },
          options: [
            { value: 'individual_contributor', en: 'Individual contributor or specialist', ar: 'مساهم فردي أو أخصائي' },
            { value: 'supervisor', en: 'Supervisor or team leader', ar: 'مشرف أو قائد فريق' },
            { value: 'manager', en: 'Manager', ar: 'مدير' },
            { value: 'senior_manager', en: 'Senior manager, director or above', ar: 'مدير أول أو مدير تنفيذي فما فوق' },
            { value: 'prefer_not_to_say', en: 'Prefer not to say', ar: 'أفضّل عدم الإفصاح' }
          ]
        },
        {
          id: 'a2', type: 'radio',
          label: { en: 'A2. How many years of professional experience do you have?', ar: 'أ٢. كم عدد سنوات خبرتك المهنية؟' },
          options: [
            { value: 'under_5', en: 'Under 5 years', ar: 'أقل من ٥ سنوات' },
            { value: '5_to_10', en: '5 to 10 years', ar: 'من ٥ إلى ١٠ سنوات' },
            { value: '11_to_20', en: '11 to 20 years', ar: 'من ١١ إلى ٢٠ سنة' },
            { value: 'over_20', en: 'Over 20 years', ar: 'أكثر من ٢٠ سنة' },
            { value: 'prefer_not_to_say', en: 'Prefer not to say', ar: 'أفضّل عدم الإفصاح' }
          ]
        }
      ]
    },
    {
      title: { en: 'Section B: Prior knowledge', ar: 'القسم ب: المعرفة السابقة' },
      items: [
        {
          id: 'b1', type: 'radio',
          label: {
            en: 'B1. How would you rate your current understanding of financial concepts such as financial statements, budgeting and financial analysis?',
            ar: 'ب١. كيف تقيّم فهمك الحالي للمفاهيم المالية مثل القوائم المالية والموازنات والتحليل المالي؟'
          },
          options: [
            { value: 'none', en: 'No prior knowledge', ar: 'لا توجد معرفة سابقة' },
            { value: 'basic', en: 'Basic understanding', ar: 'فهم أساسي' },
            { value: 'moderate', en: 'Moderate understanding', ar: 'فهم متوسط' },
            { value: 'strong', en: 'Strong understanding', ar: 'فهم قوي' },
            { value: 'expert', en: 'Expert level', ar: 'مستوى خبير' }
          ]
        },
        {
          id: 'b2', type: 'radio',
          label: { en: 'B2. Have you previously attended finance-related training?', ar: 'ب٢. هل سبق لك حضور تدريب متعلق بالمالية؟' },
          options: [
            { value: 'yes', en: 'Yes', ar: 'نعم' },
            { value: 'no', en: 'No', ar: 'لا' }
          ]
        },
        {
          id: 'b3', type: 'text',
          label: { en: 'B3. If yes, please describe it briefly.', ar: 'ب٣. إذا كانت الإجابة نعم، يرجى وصفه بإيجاز.' },
          hint: { en: '[Open text, optional]', ar: '[نص مفتوح، اختياري]' }
        }
      ]
    },
    {
      title: { en: 'Section C: Prior experience with gamified learning', ar: 'القسم ج: الخبرة السابقة بالتعلم القائم على التلعيب' },
      items: [
        {
          id: 'c1', type: 'radio',
          label: {
            en: 'C1. Have you taken part in training that included games, simulations or competition as part of the learning?',
            ar: 'ج١. هل شاركت في تدريب تضمّن ألعاباً أو محاكاة أو منافسة كجزء من التعلم؟'
          },
          options: [
            { value: 'yes', en: 'Yes', ar: 'نعم' },
            { value: 'no', en: 'No', ar: 'لا' }
          ]
        },
        {
          id: 'c2', type: 'radio',
          label: {
            en: 'C2. How comfortable are you with technology-based learning tools such as online portals and interactive simulations?',
            ar: 'ج٢. ما مدى ارتياحك لاستخدام أدوات التعلم التقنية مثل المنصات الإلكترونية والمحاكاة التفاعلية؟'
          },
          options: [
            { value: 'not_at_all', en: 'Not comfortable at all', ar: 'غير مرتاح إطلاقاً' },
            { value: 'somewhat', en: 'Somewhat comfortable', ar: 'مرتاح إلى حد ما' },
            { value: 'comfortable', en: 'Comfortable', ar: 'مرتاح' },
            { value: 'very', en: 'Very comfortable', ar: 'مرتاح جداً' }
          ]
        }
      ]
    },
    {
      title: { en: 'Section D: Expectations', ar: 'القسم د: التوقعات' },
      items: [
        {
          id: 'd1', type: 'text',
          label: { en: 'D1. What do you most hope to gain from this training programme?', ar: 'د١. ما الذي تأمل أكثر من غيره أن تكتسبه من هذا البرنامج التدريبي؟' },
          hint: { en: '[Open text]', ar: '[نص مفتوح]' }
        }
      ]
    }
  ]
};

const DAILY_REFLECTION = {
  id: 'daily',
  path: '/daily',
  title: { en: 'Daily Reflection, Days 1 to 4', ar: 'بطاقة التأمل اليومية، الأيام من ١ إلى ٤' },
  note: { en: 'End of each training day. About five minutes.', ar: 'نهاية كل يوم تدريبي. نحو خمس دقائق.' },
  reminder: {
    en: 'A reminder: taking part remains voluntary, and your responses are anonymous.',
    ar: 'تذكير: المشاركة تبقى طوعية، واستجاباتك مجهولة الهوية.'
  },
  daySelector: {
    id: 'training_day', type: 'radio', required: true,
    label: { en: 'Which day is this?', ar: 'أي يوم هذا؟' },
    options: [
      { value: '1', en: 'Day 1', ar: 'اليوم ١' },
      { value: '2', en: 'Day 2', ar: 'اليوم ٢' },
      { value: '3', en: 'Day 3', ar: 'اليوم ٣' },
      { value: '4', en: 'Day 4', ar: 'اليوم ٤' }
    ]
  },
  items: [
    {
      id: 'r1', type: 'text',
      label: { en: 'R1. What was the most useful or valuable thing you learned or experienced today?', ar: 'ت١. ما أكثر شيء مفيد أو قيّم تعلمته أو اختبرته اليوم؟' },
      hint: { en: '[Open text]', ar: '[نص مفتوح]' }
    },
    {
      id: 'r2', type: 'text',
      label: { en: 'R2. Was there anything today that you found confusing, unclear or difficult? If so, what?', ar: 'ت٢. هل كان هناك أي شيء اليوم وجدته غامضاً أو غير واضح أو صعباً؟ وما هو؟' },
      hint: { en: '[Open text]', ar: '[نص مفتوح]' }
    },
    {
      id: 'r3', type: 'text',
      label: {
        en: 'R3. How did you find the game elements today, for example the simulation rounds, the team competition, or the scoring? What worked well, and what did not?',
        ar: 'ت٣. كيف وجدت عناصر اللعب اليوم، مثل جولات المحاكاة أو منافسة الفرق أو نظام النقاط؟ ما الذي نجح وما الذي لم ينجح؟'
      },
      hint: { en: '[Open text]', ar: '[نص مفتوح]' }
    }
  ],
  finalDayHeading: { en: 'Day 4 only:', ar: 'اليوم الرابع فقط:' },
  finalDayItem: {
    id: 'r4', type: 'text',
    label: {
      en: 'R4. Looking back across the whole programme, what stands out most, and what would you change before the next group goes through it?',
      ar: 'ت٤. بالنظر إلى البرنامج بأكمله، ما الذي يبرز أكثر من غيره، وما الذي تودّ تغييره قبل أن تخوضه المجموعة التالية؟'
    },
    hint: { en: '[Open text]', ar: '[نص مفتوح]' }
  }
};

const POST_TRAINING = {
  id: 'eval',
  path: '/eval',
  title: { en: 'Post-Training Evaluation', ar: 'تقييم ما بعد التدريب' },
  note: {
    en: 'End of Day 4, after all training activities. About ten minutes.',
    ar: 'نهاية اليوم الرابع، بعد انتهاء جميع الأنشطة التدريبية. نحو عشر دقائق.'
  },
  reminder: {
    en: 'A reminder: taking part remains voluntary, and your responses are anonymous.',
    ar: 'تذكير: المشاركة تبقى طوعية، واستجاباتك مجهولة الهوية.'
  },
  likertIntro: {
    en: 'Please rate each statement from 1 (strongly disagree) to 5 (strongly agree).',
    ar: 'يرجى تقييم كل عبارة من ١ (لا أوافق بشدة) إلى ٥ (أوافق بشدة).'
  },
  scale: [
    { value: '1', en: '1', ar: '١' },
    { value: '2', en: '2', ar: '٢' },
    { value: '3', en: '3', ar: '٣' },
    { value: '4', en: '4', ar: '٤' },
    { value: '5', en: '5', ar: '٥' }
  ],
  statementHeader: { en: 'Statement', ar: 'العبارة' },
  likertSections: [
    {
      title: { en: 'Section A: Content and design quality', ar: 'القسم أ: المحتوى وجودة التصميم' },
      items: [
        { id: 'a1', code: { en: 'A1', ar: 'أ١' }, label: { en: 'The training content was relevant to my work', ar: 'كان محتوى التدريب وثيق الصلة بعملي' } },
        { id: 'a2', code: { en: 'A2', ar: 'أ٢' }, label: { en: 'The presentations were clear and well structured', ar: 'كانت العروض التقديمية واضحة وجيدة التنظيم' } },
        { id: 'a3', code: { en: 'A3', ar: 'أ٣' }, label: { en: 'The exercises and case studies helped me understand the concepts', ar: 'ساعدتني التمارين ودراسات الحالة على فهم المفاهيم' } },
        { id: 'a4', code: { en: 'A4', ar: 'أ٤' }, label: { en: 'The training materials were professional and easy to follow', ar: 'كانت المواد التدريبية مهنية وسهلة المتابعة' } },
        { id: 'a5', code: { en: 'A5', ar: 'أ٥' }, label: { en: 'The level of difficulty was appropriate for my background', ar: 'كان مستوى الصعوبة مناسباً لخلفيتي' } }
      ]
    },
    {
      title: { en: 'Section B: Gamification and simulation experience', ar: 'القسم ب: تجربة التلعيب والمحاكاة' },
      items: [
        { id: 'b1', code: { en: 'B1', ar: 'ب١' }, label: { en: 'The financial simulation made learning more engaging', ar: 'جعلت المحاكاة المالية التعلم أكثر تشويقاً' } },
        { id: 'b2', code: { en: 'B2', ar: 'ب٢' }, label: { en: 'The team competition motivated me to take part actively', ar: 'حفزتني منافسة الفرق على المشاركة بفاعلية' } },
        { id: 'b3', code: { en: 'B3', ar: 'ب٣' }, label: { en: 'The simulation helped me understand the impact of financial decisions', ar: 'ساعدتني المحاكاة على فهم أثر القرارات المالية' } },
        { id: 'b4', code: { en: 'B4', ar: 'ب٤' }, label: { en: 'The three-round structure allowed me to learn from previous decisions', ar: 'أتاح لي هيكل الجولات الثلاث التعلم من القرارات السابقة' } },
        { id: 'b5', code: { en: 'B5', ar: 'ب٥' }, label: { en: 'I would recommend this type of gamified learning to colleagues', ar: 'أوصي زملائي بهذا النوع من التعلم القائم على التلعيب' } }
      ]
    },
    {
      title: { en: 'Section C: Overall effectiveness', ar: 'القسم ج: الفاعلية الإجمالية' },
      items: [
        { id: 'c1', code: { en: 'C1', ar: 'ج١' }, label: { en: 'I feel more confident about financial concepts after this training', ar: 'أشعر بثقة أكبر في المفاهيم المالية بعد هذا التدريب' } },
        { id: 'c2', code: { en: 'C2', ar: 'ج٢' }, label: { en: 'I can apply what I learned to my daily work', ar: 'أستطيع تطبيق ما تعلمته في عملي اليومي' } },
        { id: 'c3', code: { en: 'C3', ar: 'ج٣' }, label: { en: 'This training was more effective than other training I have attended', ar: 'كان هذا التدريب أكثر فاعلية من تدريبات أخرى حضرتها' } },
        { id: 'c4', code: { en: 'C4', ar: 'ج٤' }, label: { en: 'The overall quality of this training programme was high', ar: 'كانت الجودة الإجمالية لهذا البرنامج التدريبي عالية' } }
      ]
    }
  ],
  openSection: {
    title: { en: 'Section D: In your own words', ar: 'القسم د: بكلماتك' },
    items: [
      { id: 'd1', type: 'text', label: { en: 'D1. What was the most valuable aspect of this programme for you?', ar: 'د١. ما أكثر جانب قيّم في هذا البرنامج بالنسبة لك؟' }, hint: { en: '[Open text]', ar: '[نص مفتوح]' } },
      { id: 'd2', type: 'text', label: { en: 'D2. What would you change or improve?', ar: 'د٢. ما الذي تودّ تغييره أو تحسينه؟' }, hint: { en: '[Open text]', ar: '[نص مفتوح]' } },
      { id: 'd3', type: 'text', label: { en: 'D3. How likely are you to use what you learned in your role? Please explain.', ar: 'د٣. ما مدى احتمال استخدامك لما تعلمته في دورك الوظيفي؟ يرجى التوضيح.' }, hint: { en: '[Open text]', ar: '[نص مفتوح]' } },
      { id: 'd4', type: 'text', label: { en: 'D4. Any other comments?', ar: 'د٤. أي ملاحظات أخرى؟' }, hint: { en: '[Open text]', ar: '[نص مفتوح]' } }
    ]
  },
  closing: {
    en: 'Thank you for your time and your thoughtful responses.',
    ar: 'شكراً لوقتك ولاستجاباتك المدروسة.'
  }
};

// --- Programme length ---------------------------------------------------------
//
// Version 2.0 of the instruments is written for four days, and not every
// cohort is four days. Rather than keep a second copy of the wording, the
// four-day text above is treated as canonical and the day count is
// substituted here.
//
// Every substitution asserts that its phrase is present. If the wording of the
// source document changes in a way that moves one of these phrases, the
// application refuses to start rather than quietly serving a form that says
// Day 4 to a room on its last day of three.

const CANONICAL_DAYS = 4;

// Arabic needs the cardinal ("four days"), the ordinal ("the fourth"), and the
// Arabic-Indic digit, and they are not derivable from each other.
const DAY_WORDS = {
  2: { enCardinal: 'two',   arCardinal: 'يومين',      arOrdinal: 'الثاني', arDigit: '٢' },
  3: { enCardinal: 'three', arCardinal: 'ثلاثة أيام', arOrdinal: 'الثالث', arDigit: '٣' },
  4: { enCardinal: 'four',  arCardinal: 'أربعة أيام', arOrdinal: 'الرابع', arDigit: '٤' },
  5: { enCardinal: 'five',  arCardinal: 'خمسة أيام',  arOrdinal: 'الخامس', arDigit: '٥' },
  6: { enCardinal: 'six',   arCardinal: 'ستة أيام',   arOrdinal: 'السادس', arDigit: '٦' }
};

const clone = (value) => JSON.parse(JSON.stringify(value));

/** Replace `from` with `to` exactly once, or throw naming the field. */
function substitute(target, lang, where, from, to) {
  const before = target[lang];
  if (typeof before !== 'string' || before.indexOf(from) === -1) {
    throw new Error(`programme length: ${where}.${lang} no longer contains ${JSON.stringify(from)}`);
  }
  target[lang] = before.replace(from, to);
}

/**
 * The canonical four-day content, with the day count changed to `days`.
 * Returns a fresh object; the canonical constants are never mutated.
 */
function withProgrammeDays(days) {
  const words = DAY_WORDS[days];
  if (!words) throw new Error('programme length: unsupported day count ' + days);

  const content = clone({ CONSENT, PRE_TRAINING, DAILY_REFLECTION, POST_TRAINING });
  const canonical = DAY_WORDS[CANONICAL_DAYS];

  // 1. Consent, "What you are being asked to do". "four short activities" is
  //    the number of instruments, not days, and is deliberately left alone.
  const asked = content.CONSENT.blocks.find(
    (block) => typeof block.en === 'string' && block.en.indexOf('-day programme you may complete') !== -1
  );
  if (!asked) throw new Error('programme length: consent no longer describes the programme length');
  substitute(asked, 'en', 'consent.asked', `${canonical.enCardinal}-day`, `${words.enCardinal}-day`);
  substitute(asked, 'en', 'consent.asked', `Day ${CANONICAL_DAYS}`, `Day ${days}`);
  substitute(asked, 'ar', 'consent.asked', canonical.arCardinal, words.arCardinal);
  substitute(asked, 'ar', 'consent.asked', `اليوم ${canonical.arOrdinal}`, `اليوم ${words.arOrdinal}`);

  // 2. Daily reflection title.
  substitute(content.DAILY_REFLECTION.title, 'en', 'daily.title', `Days 1 to ${CANONICAL_DAYS}`, `Days 1 to ${days}`);
  substitute(content.DAILY_REFLECTION.title, 'ar', 'daily.title', `إلى ${canonical.arDigit}`, `إلى ${words.arDigit}`);

  // 3. The day selector: one option per training day.
  content.DAILY_REFLECTION.daySelector.options = Array.from({ length: days }, (_, i) => ({
    value: String(i + 1),
    en: `Day ${i + 1}`,
    ar: `اليوم ${DAY_WORDS[i + 1] ? DAY_WORDS[i + 1].arDigit : '١'}`
  }));
  // Day 1 has no entry in DAY_WORDS, because a one-day programme has no
  // "each day" to reflect on, but it still needs its digit in the selector.
  content.DAILY_REFLECTION.daySelector.options[0].ar = 'اليوم ١';

  // 4. The cross-programme question belongs to the last day.
  substitute(content.DAILY_REFLECTION.finalDayHeading, 'en', 'daily.finalDayHeading', `Day ${CANONICAL_DAYS}`, `Day ${days}`);
  substitute(content.DAILY_REFLECTION.finalDayHeading, 'ar', 'daily.finalDayHeading', canonical.arOrdinal, words.arOrdinal);

  // 5. The post-training evaluation happens at the end of the last day.
  substitute(content.POST_TRAINING.note, 'en', 'eval.note', `Day ${CANONICAL_DAYS}`, `Day ${days}`);
  substitute(content.POST_TRAINING.note, 'ar', 'eval.note', canonical.arOrdinal, words.arOrdinal);

  content.programmeDays = days;
  return content;
}

module.exports = withProgrammeDays(config.programmeDays);
// The canonical text and the builder, for the wording check and the tests.
module.exports.withProgrammeDays = withProgrammeDays;
module.exports.CANONICAL_DAYS = CANONICAL_DAYS;

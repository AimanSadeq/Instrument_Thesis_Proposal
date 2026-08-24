'use strict';

/**
 * Interface chrome. Anything a participant can read that is not itself part
 * of an instrument. Kept separate so that instruments.js stays a verbatim
 * transcription of Research Instruments v2.1.
 */

const UI = {
  languageToggle: { en: 'العربية', ar: 'English' },
  languageToggleAria: { en: 'Switch to Arabic', ar: 'التبديل إلى الإنجليزية' },
  skipToContent: { en: 'Skip to content', ar: 'تخطي إلى المحتوى' },

  submit: { en: 'Submit', ar: 'إرسال' },
  submitting: { en: 'Submitting…', ar: 'جارٍ الإرسال…' },
  optional: { en: 'Optional', ar: 'اختياري' },

  // Shown when a submission cannot be recorded. Never silent.
  errorHeading: { en: 'Your answers were not sent', ar: 'لم يتم إرسال إجاباتك' },
  errorNetwork: {
    en: 'The connection failed, so nothing was recorded. Your answers are still on this page. Check the connection and press Submit again.',
    ar: 'فشل الاتصال، ولم يتم تسجيل أي شيء. إجاباتك لا تزال موجودة على هذه الصفحة. تحقق من الاتصال ثم اضغط إرسال مرة أخرى.'
  },
  errorServer: {
    en: 'Something went wrong at our end, so nothing was recorded. Your answers are still on this page. Please press Submit again. If it fails a second time, tell the facilitator, who has paper copies.',
    ar: 'حدث خطأ لدينا، ولم يتم تسجيل أي شيء. إجاباتك لا تزال موجودة على هذه الصفحة. يرجى الضغط على إرسال مرة أخرى. وإذا تكرر الفشل، أبلغ الميسّر الذي لديه نسخ ورقية.'
  },
  errorValidation: {
    en: 'Please check the item marked below, then press Submit again.',
    ar: 'يرجى مراجعة العنصر المحدد أدناه، ثم الضغط على إرسال مرة أخرى.'
  },
  errorDayRequired: { en: 'Please choose which day this is.', ar: 'يرجى اختيار اليوم.' },
  errorChoiceRequired: { en: 'Please choose one of the two options.', ar: 'يرجى اختيار أحد الخيارين.' },
  errorTooLong: {
    en: 'One answer is longer than this form accepts. Please shorten it and press Submit again.',
    ar: 'إحدى الإجابات أطول مما يقبله هذا النموذج. يرجى اختصارها ثم الضغط على إرسال مرة أخرى.'
  },

  // Identical for both consent options, and reused after every instrument
  // except the post-training evaluation, which has its own closing line.
  doneHeading: { en: 'Thank you', ar: 'شكراً لك' },
  doneBody: { en: 'Your response has been recorded.', ar: 'تم تسجيل استجابتك.' },
  doneCloseHint: {
    en: 'You can close this page now.',
    ar: 'يمكنك إغلاق هذه الصفحة الآن.'
  },

  leaveWarning: {
    en: 'Your answers have not been sent yet. If you leave this page they will be lost.',
    ar: 'لم تُرسل إجاباتك بعد. إذا غادرت هذه الصفحة ستفقدها.'
  },

  closedHeading: { en: 'This form is closed', ar: 'هذا النموذج مغلق' },
  closedBody: {
    en: 'This form is not accepting responses at the moment. Please tell the facilitator.',
    ar: 'هذا النموذج لا يستقبل استجابات في الوقت الحالي. يرجى إبلاغ الميسّر.'
  },

  serverErrorHeading: { en: 'Something went wrong', ar: 'حدث خطأ ما' },
  serverErrorBody: {
    en: 'The page could not be loaded, and nothing was recorded. Please try again, and tell the facilitator if it happens twice.',
    ar: 'تعذّر تحميل الصفحة، ولم يتم تسجيل أي شيء. يرجى المحاولة مرة أخرى، وأبلغ الميسّر إذا تكرر ذلك.'
  },

  notFoundHeading: { en: 'Page not found', ar: 'الصفحة غير موجودة' },
  notFoundBody: {
    en: 'Please check the link or the QR code shown in the room.',
    ar: 'يرجى التحقق من الرابط أو رمز الاستجابة السريعة المعروض في القاعة.'
  },

  anonymousFooter: {
    en: 'Anonymous. No login, no name, no employee number. Separate from FinPlay.',
    ar: 'مجهول الهوية. لا تسجيل دخول، ولا اسم، ولا رقم وظيفي. منفصل عن FinPlay.'
  }
};

module.exports = { UI };

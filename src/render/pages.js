'use strict';

const { esc, t } = require('./html');
const { UI } = require('../content/ui');
const { page } = require('./layout');
const { config } = require('../config');
const c = require('./components');
const { CONSENT, PRE_TRAINING, DAILY_REFLECTION, POST_TRAINING } = require('../content/instruments');

/**
 * Note on the italic lines in Research Instruments v2.2: the timing notes
 * ("Day 1, before training content begins. About five minutes.") are
 * instructions to whoever administers the instrument, so they are not shown
 * to participants. The voluntariness reminder is participant-facing (part 4,
 * change 9) and is shown at the head of each later instrument.
 */

// --- Consent -----------------------------------------------------------------
// Two submit buttons, identical in size, weight, colour and styling, neither
// pre-selected and neither marked as primary. One tap submits, so nothing
// lingers on screen for an observer to read, and both land on the same
// confirmation page (/done?i=consent), whose URL and content do not vary with
// the choice.
function consentPage({ lang, error }) {
  const buttons = CONSENT.choices.map((choice) => `<button type="submit" class="btn choice" name="choice" value="${esc(choice.value)}">${esc(t(choice, lang))}</button>`).join('\n');

  const main = `<h1>${esc(t(CONSENT.title, lang))}</h1>
${c.errorBanner(error, lang)}
${c.blocks(CONSENT.blocks, lang)}
<hr>
<form class="instrument consent-form" method="post" action="/?lang=${esc(lang)}"
  data-instrument="consent" data-lang="${esc(lang)}"
  data-error-heading="${esc(t(UI.errorHeading, lang))}"
  data-msg-network="${esc(t(UI.errorNetwork, lang))}"
  data-msg-server="${esc(t(UI.errorServer, lang))}"
  data-msg-submitting="${esc(t(UI.submitting, lang))}">
<input type="hidden" name="lang" value="${esc(lang)}">
<p class="choose-one"><strong>${esc(t(CONSENT.prompt, lang))}</strong></p>
<div class="choices">
${buttons}
</div>
</form>`;

  return page({ lang, title: CONSENT.title, main, path: '/' });
}

// --- Pre-training questionnaire ----------------------------------------------
function prePage({ lang, values = {}, errors = {}, error }) {
  const sections = PRE_TRAINING.sections.map((section) => `<section class="section">
<h2>${esc(t(section.title, lang))}</h2>
${section.items.map((item) => c.field(item, lang, values, errors)).join('\n')}
</section>`).join('\n');

  const main = `<h1>${esc(t(PRE_TRAINING.title, lang))}</h1>
${c.errorBanner(error, lang)}
<p class="reminder">${esc(t(PRE_TRAINING.reminder, lang))}</p>
<p class="intro">${esc(t(PRE_TRAINING.intro, lang))}</p>
${c.form(PRE_TRAINING, lang, sections + '\n' + c.submitButton(lang))}`;

  return page({ lang, title: PRE_TRAINING.title, main, path: PRE_TRAINING.path });
}

// --- Daily reflection ---------------------------------------------------------
// R4 belongs to the last training day only, whichever that is for this cohort.
// With JavaScript it appears when the last day is chosen; without JavaScript it
// is visible under its "Day N only" heading, exactly as on the paper
// instrument. The server stores it only when the last day was chosen. The day
// itself is written into the markup so that the client script does not have to
// assume a programme length.
function dailyPage({ lang, values = {}, errors = {}, error }) {
  const finalDay = String(config.programmeDays);
  const showFinalDay = String(values.training_day || '') === finalDay;

  const inner = `<section class="section">
${c.radioGroup(DAILY_REFLECTION.daySelector, lang, values.training_day, {
    name: 'training_day',
    error: errors.training_day,
    errorId: 'e_training_day',
    invalid: Boolean(errors.training_day)
  })}
</section>
<section class="section">
${DAILY_REFLECTION.items.map((item) => c.field(item, lang, values, errors)).join('\n')}
</section>
<section class="section final-day" id="final-day" data-final-day="${esc(finalDay)}"${showFinalDay ? '' : ' data-hidden-without-final-day="1"'}>
<h2>${esc(t(DAILY_REFLECTION.finalDayHeading, lang))}</h2>
${c.textField(DAILY_REFLECTION.finalDayItem, lang, values.r4)}
</section>
${c.submitButton(lang)}`;

  const main = `<h1>${esc(t(DAILY_REFLECTION.title, lang))}</h1>
${c.errorBanner(error, lang)}
<p class="reminder">${esc(t(DAILY_REFLECTION.reminder, lang))}</p>
${c.form(DAILY_REFLECTION, lang, inner)}`;

  return page({ lang, title: DAILY_REFLECTION.title, main, path: DAILY_REFLECTION.path });
}

// --- Post-training evaluation --------------------------------------------------
function evalPage({ lang, values = {}, errors = {}, error }) {
  const likert = POST_TRAINING.likertSections
    .map((section) => c.likertTable(section, POST_TRAINING, lang, values))
    .join('\n');

  const open = `<section class="section">
<h2>${esc(t(POST_TRAINING.openSection.title, lang))}</h2>
${POST_TRAINING.openSection.items.map((item) => c.textField(item, lang, values[item.id])).join('\n')}
</section>`;

  const inner = `<p class="intro">${esc(t(POST_TRAINING.likertIntro, lang))}</p>
${likert}
${open}
${c.submitButton(lang)}`;

  const main = `<h1>${esc(t(POST_TRAINING.title, lang))}</h1>
${c.errorBanner(error, lang)}
<p class="reminder">${esc(t(POST_TRAINING.reminder, lang))}</p>
${c.form(POST_TRAINING, lang, inner)}`;

  return page({ lang, title: POST_TRAINING.title, main, path: POST_TRAINING.path });
}

// --- Confirmation --------------------------------------------------------------
// One page, reached after every instrument. For consent it is identical
// whichever option was chosen: same URL, same bytes.
function donePage({ lang, instrument }) {
  const closing = instrument === 'eval'
    ? `<p class="closing">${esc(t(POST_TRAINING.closing, lang))}</p>`
    : '';

  const main = `<div class="done">
<h1>${esc(t(UI.doneHeading, lang))}</h1>
<p class="lead">${esc(t(UI.doneBody, lang))}</p>
${closing}
<p class="hint">${esc(t(UI.doneCloseHint, lang))}</p>
</div>`;

  return page({ lang, title: UI.doneHeading, main, path: '/done' });
}

function closedPage({ lang, path = '/' }) {
  const main = `<div class="done">
<h1>${esc(t(UI.closedHeading, lang))}</h1>
<p class="lead">${esc(t(UI.closedBody, lang))}</p>
</div>`;
  return page({ lang, title: UI.closedHeading, main, path });
}

// A failure at our end is not the same as a mistyped address, and saying so
// saves whoever is holding the phone from hunting for a typo that is not
// there. The service log carries the reason; this page never does.
function serverErrorPage({ lang }) {
  const main = `<div class="done">
<h1>${esc(t(UI.serverErrorHeading, lang))}</h1>
<p class="lead">${esc(t(UI.serverErrorBody, lang))}</p>
</div>`;
  return page({ lang, title: UI.serverErrorHeading, main, path: '/' });
}

function notFoundPage({ lang }) {
  const main = `<div class="done">
<h1>${esc(t(UI.notFoundHeading, lang))}</h1>
<p class="lead">${esc(t(UI.notFoundBody, lang))}</p>
</div>`;
  return page({ lang, title: UI.notFoundHeading, main, path: '/' });
}

module.exports = {
  consentPage, prePage, dailyPage, evalPage, donePage, closedPage,
  serverErrorPage, notFoundPage
};

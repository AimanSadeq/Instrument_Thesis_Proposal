'use strict';

const { config } = require('./config');
const { UI } = require('./content/ui');
const { t } = require('./render/html');
const { CONSENT, PRE_TRAINING, DAILY_REFLECTION, POST_TRAINING } = require('./content/instruments');

/**
 * Turn a submitted form body into the exact set of column values the schema
 * allows, and nothing else. Anything not named by the instrument definition is
 * discarded rather than stored, so a crafted extra field cannot become a
 * hidden identifier.
 *
 * Every substantive item is optional. Participation is voluntary item by item
 * as well as instrument by instrument, so no answer is ever forced. The single
 * exception is the day selector on the daily reflection, without which the
 * response cannot be placed in the programme at all.
 */

function text(raw, lang, errors, key) {
  if (raw === undefined || raw === null) return null;
  const value = String(raw).trim();
  if (value === '') return null;
  if (value.length > config.maxTextLength) {
    errors[key] = t(UI.errorTooLong, lang);
    return null;
  }
  return value;
}

function choiceOf(item, raw) {
  if (raw === undefined || raw === null || raw === '') return null;
  const found = item.options.find((o) => o.value === String(raw));
  return found ? found.value : undefined; // undefined means "not a valid code"
}

function likert(raw) {
  if (raw === undefined || raw === null || raw === '') return null;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > 5) return undefined;
  return n;
}

function flatItems(sections) {
  return sections.flatMap((s) => s.items);
}

function validateConsent(body, lang) {
  const errors = {};
  const raw = body.choice;
  const valid = CONSENT.choices.some((ch) => ch.value === raw);
  if (!valid) {
    return { ok: false, errors, message: t(UI.errorChoiceRequired, lang), values: {} };
  }
  return { ok: true, errors, values: { choice: raw } };
}

function validatePre(body, lang) {
  const errors = {};
  const values = {};
  let invalidCode = false;

  for (const item of flatItems(PRE_TRAINING.sections)) {
    if (item.type === 'radio') {
      const v = choiceOf(item, body[item.id]);
      if (v === undefined) { invalidCode = true; continue; }
      values[item.id] = v;
    } else {
      values[item.id] = text(body[item.id], lang, errors, item.id);
    }
  }

  return finish(values, errors, invalidCode, lang);
}

function validateDaily(body, lang) {
  const errors = {};
  const values = {};
  let invalidCode = false;

  const day = choiceOf(DAILY_REFLECTION.daySelector, body.training_day);
  if (day === undefined) invalidCode = true;
  if (!day) {
    errors.training_day = t(UI.errorDayRequired, lang);
  } else {
    values.training_day = Number(day);
  }

  for (const item of DAILY_REFLECTION.items) {
    values[item.id] = text(body[item.id], lang, errors, item.id);
  }

  // R4 is the cross-programme question and exists only on the last training
  // day, whichever that is for this cohort. If it arrives on any other day it
  // is dropped, which the database also enforces with a check constraint.
  const r4 = text(body.r4, lang, errors, 'r4');
  values.r4 = values.training_day === config.programmeDays ? r4 : null;

  if (!values.training_day) {
    return { ok: false, errors, values, message: t(UI.errorValidation, lang) };
  }
  return finish(values, errors, invalidCode, lang);
}

function validateEval(body, lang) {
  const errors = {};
  const values = {};
  let invalidCode = false;

  for (const section of POST_TRAINING.likertSections) {
    for (const item of section.items) {
      const v = likert(body[item.id]);
      if (v === undefined) { invalidCode = true; continue; }
      values[item.id] = v;
    }
  }
  for (const item of POST_TRAINING.openSection.items) {
    values[item.id] = text(body[item.id], lang, errors, item.id);
  }

  return finish(values, errors, invalidCode, lang);
}

function finish(values, errors, invalidCode, lang) {
  const messages = Object.values(errors);
  if (invalidCode || messages.length > 0) {
    const tooLong = t(UI.errorTooLong, lang);
    return {
      ok: false,
      errors,
      values,
      message: messages.includes(tooLong) ? tooLong : t(UI.errorValidation, lang)
    };
  }
  return { ok: true, errors, values };
}

module.exports = { validateConsent, validatePre, validateDaily, validateEval };

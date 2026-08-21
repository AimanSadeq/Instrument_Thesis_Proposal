'use strict';

const { esc, t } = require('./html');
const { UI } = require('../content/ui');

/** A block of static instrument prose (consent screen). */
function blocks(list, lang) {
  return list.map((b) => {
    if (b.type === 'h2') return `<h2>${esc(t(b, lang))}</h2>`;
    if (b.type === 'strong') return `<p class="lead"><strong>${esc(t(b, lang))}</strong></p>`;
    if (b.type === 'ul') {
      const items = (b[lang] || b.en).map((i) => `<li>${esc(i)}</li>`).join('\n');
      return `<ul>\n${items}\n</ul>`;
    }
    return `<p>${esc(t(b, lang))}</p>`;
  }).join('\n');
}

/**
 * A radio group. Rendered as a fieldset so that the question is announced
 * with every option, and so that right-to-left layout follows the document
 * direction without any per-element styling.
 *
 * Nothing is ever pre-selected unless the participant already chose it and
 * the page is being re-rendered after a failed submission.
 */
function radioGroup(item, lang, value, options = {}) {
  const name = options.name || item.id;
  const invalid = options.invalid ? ' aria-invalid="true"' : '';
  const describedBy = options.errorId ? ` aria-describedby="${esc(options.errorId)}"` : '';
  const opts = item.options.map((o, index) => {
    const id = `${name}_${index}`;
    const checked = value !== undefined && value !== null && String(value) === String(o.value) ? ' checked' : '';
    return `<div class="option">
  <input type="radio" id="${esc(id)}" name="${esc(name)}" value="${esc(o.value)}"${checked}>
  <label for="${esc(id)}">${esc(t(o, lang))}</label>
</div>`;
  }).join('\n');

  return `<fieldset class="field${options.invalid ? ' field-invalid' : ''}"${invalid}${describedBy}>
<legend>${esc(t(item.label, lang))}</legend>
${options.error ? `<p class="field-error" id="${esc(options.errorId)}" role="alert">${esc(options.error)}</p>` : ''}
<div class="options">
${opts}
</div>
</fieldset>`;
}

/** An open-text answer. Always optional: participation is voluntary item by item. */
function textField(item, lang, value) {
  const id = 'f_' + item.id;
  return `<div class="field">
<label class="field-label" for="${esc(id)}">${esc(t(item.label, lang))}</label>
${item.hint ? `<p class="hint">${esc(t(item.hint, lang))}</p>` : ''}
<textarea id="${esc(id)}" name="${esc(item.id)}" rows="4" maxlength="5000"
  spellcheck="true" autocomplete="off" autocapitalize="sentences">${esc(value)}</textarea>
</div>`;
}

function field(item, lang, values, errors = {}) {
  if (item.type === 'radio') {
    return radioGroup(item, lang, values[item.id], {
      error: errors[item.id],
      errorId: 'e_' + item.id,
      invalid: Boolean(errors[item.id])
    });
  }
  return textField(item, lang, values[item.id]);
}

/**
 * The Likert grid.
 *
 * A real table on a wide screen, and the same table restyled as one card per
 * statement below 640px, which is how it will actually be used. Direction is
 * inherited from <html dir>, so the columns run right to left in Arabic.
 */
function likertTable(section, instrument, lang, values) {
  const head = instrument.scale
    .map((s) => `<th scope="col"><span class="scale-number">${esc(t(s, lang))}</span></th>`)
    .join('');

  const rows = section.items.map((item) => {
    const cells = instrument.scale.map((s) => {
      const id = `${item.id}_${s.value}`;
      const checked = String(values[item.id] || '') === String(s.value) ? ' checked' : '';
      const label = `${t(item.code, lang)} — ${t(s, lang)}`;
      return `<td data-scale="${esc(t(s, lang))}">
  <input type="radio" id="${esc(id)}" name="${esc(item.id)}" value="${esc(s.value)}"${checked}
    aria-label="${esc(label)}">
  <label for="${esc(id)}" class="scale-label"><span aria-hidden="true">${esc(t(s, lang))}</span></label>
</td>`;
    }).join('');

    return `<tr>
<th scope="row"><span class="item-code">${esc(t(item.code, lang))}</span> <span class="item-text">${esc(t(item.label, lang))}</span></th>
${cells}
</tr>`;
  }).join('\n');

  return `<section class="section">
<h2>${esc(t(section.title, lang))}</h2>
<div class="table-scroll">
<table class="likert">
<thead>
<tr><th scope="col" class="statement-head">${esc(t(instrument.statementHeader, lang))}</th>${head}</tr>
</thead>
<tbody>
${rows}
</tbody>
</table>
</div>
</section>`;
}

function errorBanner(message, lang) {
  if (!message) return '';
  return `<div class="banner banner-error" role="alert" tabindex="-1" id="submit-error">
<h2 class="banner-title">${esc(t(UI.errorHeading, lang))}</h2>
<p>${esc(message)}</p>
</div>`;
}

function submitButton(lang) {
  return `<div class="actions">
<button type="submit" class="btn">${esc(t(UI.submit, lang))}</button>
</div>`;
}

/** The form element. Plain POST; JavaScript only improves the failure path. */
function form(instrument, lang, inner) {
  return `<form class="instrument" method="post" action="${esc(instrument.path)}?lang=${esc(lang)}"
  data-instrument="${esc(instrument.id)}" data-lang="${esc(lang)}"
  data-error-heading="${esc(t(UI.errorHeading, lang))}"
  data-msg-network="${esc(t(UI.errorNetwork, lang))}"
  data-msg-server="${esc(t(UI.errorServer, lang))}"
  data-msg-leave="${esc(t(UI.leaveWarning, lang))}"
  data-msg-submitting="${esc(t(UI.submitting, lang))}">
<input type="hidden" name="lang" value="${esc(lang)}">
${inner}
</form>`;
}

module.exports = { blocks, radioGroup, textField, field, likertTable, errorBanner, submitButton, form };

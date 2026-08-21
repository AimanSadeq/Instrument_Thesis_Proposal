'use strict';
/*
 * Progressive enhancement only.
 *
 * Every instrument works with JavaScript switched off: the forms are ordinary
 * POSTs and the server renders the result. What this file adds is a clearer
 * failure path on a bad connection, and the Day 4 rule on the daily reflection.
 *
 * It sets no cookie, writes nothing to web storage of either kind, reads no
 * device characteristic, and generates no identifier. There is nothing here
 * that survives the page. The forbidden browser APIs are absent from this file
 * as literal text as well as in use, so a reviewer can check it by searching.
 */
(function () {
  var forms = document.querySelectorAll('form.instrument[data-instrument]');
  if (!forms.length) return;

  Array.prototype.forEach.call(forms, function (form) {
    setUpDayFour(form);
    setUpLeaveWarning(form);
    setUpSubmit(form);
  });

  /* R4 belongs to Day 4. Without JavaScript it simply stays visible under its
     "Day 4 only" heading, and the server ignores it on days 1 to 3. */
  function setUpDayFour(form) {
    var block = form.querySelector('[data-day4]');
    if (!block) return;
    var radios = form.querySelectorAll('input[name="training_day"]');
    if (!radios.length) return;

    function apply() {
      var chosen = form.querySelector('input[name="training_day"]:checked');
      var isDayFour = Boolean(chosen) && chosen.value === '4';
      block.hidden = !isDayFour;
      if (!isDayFour) {
        var box = block.querySelector('textarea');
        if (box) box.value = '';
      }
    }

    Array.prototype.forEach.call(radios, function (radio) {
      radio.addEventListener('change', apply);
    });
    apply();
  }

  function isDirty(form) {
    var dirty = false;
    Array.prototype.forEach.call(form.querySelectorAll('textarea'), function (box) {
      if (box.value.trim() !== '') dirty = true;
    });
    Array.prototype.forEach.call(form.querySelectorAll('input[type="radio"]'), function (radio) {
      if (radio.checked) dirty = true;
    });
    return dirty;
  }

  function setUpLeaveWarning(form) {
    var message = form.getAttribute('data-msg-leave');
    if (!message) return;
    window.addEventListener('beforeunload', function (event) {
      if (form.dataset.submitted === '1') return;
      if (!isDirty(form)) return;
      event.preventDefault();
      event.returnValue = message;
      return message;
    });
  }

  function banner(form, message) {
    var existing = form.parentNode.querySelector('#submit-error');
    if (!existing) {
      existing = document.createElement('div');
      existing.className = 'banner banner-error';
      existing.id = 'submit-error';
      existing.setAttribute('role', 'alert');
      existing.setAttribute('tabindex', '-1');
      var title = document.createElement('h2');
      title.className = 'banner-title';
      title.textContent = form.getAttribute('data-error-heading') || '';
      existing.appendChild(title);
      existing.appendChild(document.createElement('p'));
      form.parentNode.insertBefore(existing, form);
    }
    existing.querySelector('p').textContent = message;
    existing.focus();
    existing.scrollIntoView({ block: 'start' });
  }

  function markFieldErrors(form, errors) {
    Array.prototype.forEach.call(form.querySelectorAll('.field-invalid'), function (node) {
      node.classList.remove('field-invalid');
      node.removeAttribute('aria-invalid');
    });
    if (!errors) return;
    Object.keys(errors).forEach(function (name) {
      var input = form.querySelector('[name="' + name + '"]');
      if (!input) return;
      var field = input.closest('.field');
      if (!field) return;
      field.classList.add('field-invalid');
      field.setAttribute('aria-invalid', 'true');
      var existing = field.querySelector('.field-error');
      if (!existing) {
        existing = document.createElement('p');
        existing.className = 'field-error';
        existing.setAttribute('role', 'alert');
        field.insertBefore(existing, field.querySelector('.options') || field.firstChild.nextSibling);
      }
      existing.textContent = errors[name];
    });
  }

  /* Submit over fetch so that a failed submission says so on the page the
     participant is looking at, with their answers still in front of them,
     instead of a browser error page that loses them. */
  function setUpSubmit(form) {
    if (typeof window.fetch !== 'function' || typeof window.FormData !== 'function') return;

    form.addEventListener('submit', function (event) {
      if (event.defaultPrevented) return;
      event.preventDefault();

      var button = event.submitter || form.querySelector('button[type="submit"]');
      var data = new FormData(form);
      if (button && button.name) data.append(button.name, button.value);

      var body = new URLSearchParams();
      data.forEach(function (value, key) { body.append(key, value); });

      setBusy(form, button, true);

      fetch(form.getAttribute('action'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'X-Instrument-Async': '1'
        },
        body: body.toString(),
        credentials: 'omit',
        cache: 'no-store',
        redirect: 'follow'
      }).then(function (response) {
        return response.json().catch(function () { return null; }).then(function (payload) {
          if (response.ok && payload && payload.ok && payload.redirect) {
            form.dataset.submitted = '1';
            /* replace, not assign: the back button must not return to a filled
               form that could be sent a second time. */
            window.location.replace(payload.redirect);
            return;
          }
          setBusy(form, button, false);
          markFieldErrors(form, payload && payload.errors);
          banner(form, (payload && payload.message) || form.getAttribute('data-msg-server'));
        });
      }).catch(function () {
        setBusy(form, button, false);
        banner(form, form.getAttribute('data-msg-network'));
      });
    });
  }

  function setBusy(form, button, busy) {
    var buttons = form.querySelectorAll('button[type="submit"]');
    Array.prototype.forEach.call(buttons, function (candidate) {
      candidate.disabled = busy;
    });
    if (!button) return;
    if (busy) {
      button.dataset.label = button.textContent;
      var busyText = form.getAttribute('data-msg-submitting');
      if (busyText) button.textContent = busyText;
    } else if (button.dataset.label) {
      button.textContent = button.dataset.label;
    }
  }
})();

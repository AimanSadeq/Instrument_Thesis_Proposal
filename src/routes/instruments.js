'use strict';

const express = require('express');
const { config } = require('../config');
const db = require('../db');
const { UI } = require('../content/ui');
const { t } = require('../render/html');
const pages = require('../render/pages');
const validate = require('../validate');

const router = express.Router();

const INSTRUMENTS = {
  consent: { path: '/', render: pages.consentPage, validate: validate.validateConsent },
  pre: { path: '/pre', render: pages.prePage, validate: validate.validatePre },
  daily: { path: '/daily', render: pages.dailyPage, validate: validate.validateDaily },
  eval: { path: '/eval', render: pages.evalPage, validate: validate.validateEval }
};

function isAsync(req) {
  return req.get('x-instrument-async') === '1';
}

function html(res, body, status = 200) {
  res.status(status).type('html').send(body);
}

function handleGet(id) {
  return (req, res) => {
    const lang = req.lang;
    if (!config.instrumentsOpen) {
      return html(res, pages.closedPage({ lang, path: INSTRUMENTS[id].path }), 503);
    }
    return html(res, INSTRUMENTS[id].render({ lang }));
  };
}

function handlePost(id) {
  return async (req, res) => {
    const lang = req.lang;
    const spec = INSTRUMENTS[id];

    if (!config.instrumentsOpen) {
      if (isAsync(req)) {
        return res.status(503).json({ ok: false, message: t(UI.closedBody, lang) });
      }
      return html(res, pages.closedPage({ lang, path: spec.path }), 503);
    }

    const result = spec.validate(req.body, lang);
    if (!result.ok) {
      if (isAsync(req)) {
        return res.status(400).json({ ok: false, message: result.message, errors: result.errors });
      }
      return html(res, spec.render({
        lang,
        values: result.values,
        errors: result.errors,
        error: result.message
      }), 400);
    }

    try {
      await db.insertSubmission(id, result.values);
    } catch (err) {
      // Log the failure, never the submitted values.
      console.error('[submit] instrument=%s failed: %s', id, err.code || err.name || 'error');
      const message = t(UI.errorServer, lang);
      if (isAsync(req)) {
        return res.status(500).json({ ok: false, message });
      }
      return html(res, spec.render({
        lang,
        values: result.values,
        errors: {},
        error: message
      }), 500);
    }

    const redirect = `/done?i=${encodeURIComponent(id)}&lang=${encodeURIComponent(lang)}`;
    if (isAsync(req)) {
      return res.json({ ok: true, redirect });
    }
    // Post/redirect/get: a refresh of the confirmation page cannot resubmit.
    return res.redirect(303, redirect);
  };
}

for (const [id, spec] of Object.entries(INSTRUMENTS)) {
  router.get(spec.path, handleGet(id));
  router.post(spec.path, handlePost(id));
}

router.get('/done', (req, res) => {
  const instrument = Object.keys(INSTRUMENTS).includes(req.query.i) ? req.query.i : null;
  return html(res, pages.donePage({ lang: req.lang, instrument }));
});

module.exports = { router, INSTRUMENTS };

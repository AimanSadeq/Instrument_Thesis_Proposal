'use strict';

const path = require('path');
const express = require('express');
const { config, requireProductionConfig } = require('./config');
const db = require('./db');
const pages = require('./render/pages');
const instruments = require('./routes/instruments');
const admin = require('./routes/admin');

const LANGUAGES = ['en', 'ar'];

function createApp() {
  const app = express();

  // No framework fingerprint, and no ETag. An ETag is a value the browser
  // sends back on the next request, so although this application never reads
  // one, it is switched off rather than left as a theoretical marker.
  app.disable('x-powered-by');
  app.set('etag', false);

  // Never resolve a client address from proxy headers. The request's address
  // property is not read anywhere in this codebase, and leaving trust proxy
  // off keeps it meaningless even if something were to read it later.
  app.set('trust proxy', false);

  // There is deliberately no request logger. A request log is where the IP
  // address, the user agent and the exact submission time would otherwise
  // end up (build brief sections 3.3 and 3.4).

  app.use((req, res, next) => {
    res.set({
      'Content-Security-Policy':
        "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; " +
        "form-action 'self'; base-uri 'none'; frame-ancestors 'none'; connect-src 'self'",
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Permissions-Policy':
        'geolocation=(), camera=(), microphone=(), payment=(), usb=(), interest-cohort=()'
    });
    next();
  });

  app.use(express.urlencoded({ extended: false, limit: '128kb' }));

  // Language is carried in the URL and in a hidden form field. It is never
  // stored in a cookie, in web storage, or in the database.
  app.use((req, res, next) => {
    const requested = req.query.lang || req.body.lang;
    req.lang = LANGUAGES.includes(requested) ? requested : 'en';
    next();
  });

  app.use(express.static(path.join(__dirname, '..', 'public'), {
    etag: false,
    lastModified: false,
    maxAge: '1h',
    setHeaders(res) {
      res.set('X-Content-Type-Options', 'nosniff');
    }
  }));

  app.get('/healthz', (req, res) => res.type('text').send('ok'));

  app.use(instruments.router);
  app.use(admin.router);

  app.use((req, res) => {
    res.status(404).type('html').send(pages.notFoundPage({ lang: req.lang || 'en' }));
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error('[error] %s %s: %s', req.method, req.path, err.code || err.name || 'error');
    if (res.headersSent) return;
    res.status(500).type('html').send(pages.serverErrorPage({ lang: req.lang || 'en' }));
  });

  return app;
}

if (require.main === module) {
  if (config.env === 'production') requireProductionConfig();

  // Resolve the TLS settings before accepting a single request. The pool
  // connects lazily, so a certificate that cannot be read would otherwise
  // stay hidden until somebody pressed a button, and would then look like a
  // database fault rather than a configuration one.
  try {
    db.sslConfig();
  } catch (err) {
    console.error('[start] refusing to start: %s', err.message);
    process.exit(1);
  }
  const app = createApp();
  const server = app.listen(config.port, () => {
    console.log('[start] instrument platform listening on port %d, cohort %s, timezone %s, instruments %s',
      config.port, config.cohort, config.timezone, config.instrumentsOpen ? 'open' : 'closed');
  });
  const shutdown = async () => {
    server.close();
    await db.close().catch(() => {});
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

module.exports = { createApp };

'use strict';

/**
 * Capture the screens for the verification record.
 *
 * These are emulated phone viewports in Chromium, which is what this build
 * environment can offer. They are evidence of layout and direction, not a
 * substitute for the real-device testing the brief asks for; see the
 * outstanding items in docs/VERIFICATION.md.
 *
 * Usage: BASE_URL=http://127.0.0.1:3000 node scripts/screenshots.js
 */

const fs = require('fs');
const path = require('path');
const { chromium, devices } = require('playwright');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000';
// Point at an already installed Chromium when one is provided, so that this
// runs on a machine that cannot download browsers.
const EXECUTABLE = process.env.CHROMIUM_PATH || undefined;
const OUT = path.join(__dirname, '..', 'docs', 'screenshots');

const PROFILES = [
  { name: 'iphone', device: devices['iPhone 13'] },
  { name: 'android', device: devices['Pixel 7'] }
];

const SCREENS = [
  { name: 'consent', path: '/', full: true },
  { name: 'pre', path: '/pre', full: true },
  { name: 'daily', path: '/daily', full: true },
  { name: 'daily-final-day', path: '/daily', full: true, finalDay: true },
  { name: 'eval', path: '/eval', full: true }
];

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch(EXECUTABLE ? { executablePath: EXECUTABLE } : {});

  for (const profile of PROFILES) {
    for (const lang of ['ar', 'en']) {
      // A device scale factor of 2 keeps the text crisp while keeping the
      // evidence files small enough to live in the repository.
      const context = await browser.newContext({ ...profile.device, deviceScaleFactor: 2 });
      const page = await context.newPage();

      for (const screen of SCREENS) {
        await page.goto(`${BASE}${screen.path}?lang=${lang}`, { waitUntil: 'networkidle' });
        if (screen.finalDay) {
          const block = await page.getAttribute('[data-final-day]', 'data-final-day');
          await page.click(`input[name="training_day"][value="${block}"]`);
        }
        await page.screenshot({
          path: path.join(OUT, `${profile.name}-${lang}-${screen.name}.png`),
          fullPage: screen.full
        });
      }

      // The two consent options, close up, and a measurement of both. They
      // must match in size, weight, colour and border; only the words differ.
      await page.goto(`${BASE}/?lang=${lang}`, { waitUntil: 'networkidle' });
      const choices = page.locator('.consent-form');
      await choices.scrollIntoViewIfNeeded();
      await choices.screenshot({ path: path.join(OUT, `${profile.name}-${lang}-consent-choices.png`) });

      const styles = await page.$$eval('button.choice', (buttons) => buttons.map((el) => {
        const s = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          width: Math.round(r.width), height: Math.round(r.height),
          fontSize: s.fontSize, fontWeight: s.fontWeight, color: s.color,
          background: s.backgroundColor, border: s.border, textAlign: s.textAlign,
          checked: el.matches(':checked')
        };
      }));
      if (styles.length !== 2) throw new Error('Expected exactly two consent options.');
      if (JSON.stringify(styles[0]) !== JSON.stringify(styles[1])) {
        throw new Error('The consent options are not identical: ' + JSON.stringify(styles));
      }
      console.log(`${profile.name}/${lang}: consent options identical -> ${JSON.stringify(styles[0])}`);

      // Both consent options, and where each one lands.
      for (const choice of ['agree', 'decline']) {
        await page.goto(`${BASE}/?lang=${lang}`, { waitUntil: 'networkidle' });
        await page.click(`button[name="choice"][value="${choice}"]`);
        await page.waitForURL('**/done*');
        await page.screenshot({ path: path.join(OUT, `${profile.name}-${lang}-confirmation-after-${choice}.png`) });
      }

      // Nothing may be stored on the device.
      const storage = await page.evaluate(() => ({
        cookies: document.cookie,
        local: window.localStorage.length,
        session: window.sessionStorage.length
      }));
      const cookies = await context.cookies();
      console.log(`${profile.name}/${lang}: cookies=${cookies.length} document.cookie="${storage.cookies}" localStorage=${storage.local} sessionStorage=${storage.session}`);
      if (cookies.length || storage.cookies || storage.local || storage.session) {
        throw new Error('Something was stored on the device.');
      }

      await context.close();
    }
  }

  await browser.close();
  console.log('screenshots written to docs/screenshots');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

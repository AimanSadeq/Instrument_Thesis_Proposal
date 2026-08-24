'use strict';

/**
 * Behaviour checks that need a real browser: the final-day rule, and what a
 * participant sees when a submission fails on a bad connection.
 *
 * Which day is the final one comes from the page, not from this script, so
 * the check is correct against a three-day cohort as well as a four-day one.
 *
 * Usage: BASE_URL=http://127.0.0.1:3000 node scripts/browser-check.js
 *        CHROMIUM_PATH=/path/to/chrome to use an already installed browser.
 */

const { chromium, devices } = require('playwright');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000';
const EXECUTABLE = process.env.CHROMIUM_PATH || undefined;

let failures = 0;

function check(ok, label) {
  if (!ok) failures += 1;
  console.log(`${ok ? 'pass' : 'FAIL'}  ${label}`);
}

async function main() {
  const browser = await chromium.launch(EXECUTABLE ? { executablePath: EXECUTABLE } : {});
  const context = await browser.newContext({ ...devices['iPhone 13'], deviceScaleFactor: 2 });
  const page = await context.newPage();

  // 1. R4 follows the day selector, on whichever day is the last one.
  await page.goto(`${BASE}/daily?lang=ar`);
  const r4 = page.locator('#final-day');
  const finalDay = await page.getAttribute('[data-final-day]', 'data-final-day');
  const offered = await page.$$eval('input[name="training_day"]', (els) => els.map((e) => e.value));
  check(offered.join(',') === Array.from({ length: Number(finalDay) }, (_, i) => String(i + 1)).join(','),
    `the selector offers exactly days 1 to ${finalDay}, and offered ${offered.join(', ')}`);
  check(!(await r4.isVisible()), 'R4 is hidden until a day is chosen');
  await page.click('input[name="training_day"][value="2"]');
  check(Number(finalDay) === 2 ? await r4.isVisible() : !(await r4.isVisible()),
    'R4 follows Day 2 correctly for this programme length');
  await page.click(`input[name="training_day"][value="${finalDay}"]`);
  check(await r4.isVisible(), `R4 appears on Day ${finalDay}, the last day`);

  // 2. A failed submission says so, and keeps the answers on the page.
  await page.fill('textarea[name="r1"]', 'المحاكاة كانت مفيدة');
  await context.setOffline(true);
  await page.click('button[type="submit"]');
  const banner = page.locator('#submit-error');
  await banner.waitFor({ state: 'visible', timeout: 5000 });
  const bannerText = await banner.innerText();
  check(/فشل الاتصال/.test(bannerText), 'the failure message is visible, and in Arabic');
  check(await page.inputValue('textarea[name="r1"]') === 'المحاكاة كانت مفيدة',
    'the answers are still on the page after the failure');
  check(page.url().includes('/daily'), 'the participant is still on the form, not on a browser error page');
  await page.screenshot({ path: 'docs/screenshots/iphone-ar-submission-failed.png', fullPage: false });

  // 3. The same submission succeeds once the connection returns.
  await context.setOffline(false);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/done*', { timeout: 5000 });
  check(page.url().includes('/done?i=daily'), 'pressing submit again completes the submission');

  // 4. Consent: one tap, and the same confirmation either way.
  const landing = [];
  for (const choice of ['agree', 'decline']) {
    await page.goto(`${BASE}/?lang=en`);
    await page.click(`button[name="choice"][value="${choice}"]`);
    await page.waitForURL('**/done*');
    landing.push(page.url() + '|' + (await page.locator('main').innerText()));
  }
  check(landing[0] === landing[1], 'agreeing and declining land on the same URL with the same text');

  // 5. Nothing is left on the device.
  const stored = await page.evaluate(() => ({
    cookie: document.cookie,
    local: window.localStorage.length,
    session: window.sessionStorage.length
  }));
  const cookies = await context.cookies();
  check(!stored.cookie && stored.local === 0 && stored.session === 0 && cookies.length === 0,
    'no cookie and no web storage after using the forms');

  await browser.close();
  console.log(`\n${failures === 0 ? 'All browser checks passed.' : failures + ' check(s) FAILED.'}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('browser check could not run:', err.message);
  process.exit(2);
});

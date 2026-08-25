const { chromium } = require('/home/user/finance-gamification/node_modules/playwright');
const fs = require('fs');
(async () => {
  const svg = fs.readFileSync('dbr-cycle.svg', 'utf8');
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await browser.newPage({ viewport: { width: 1000, height: 560 }, deviceScaleFactor: 3 });
  await page.setContent(`<!doctype html><html><body style="margin:0">${svg}</body></html>`);
  await page.waitForTimeout(300);
  await page.locator('svg').screenshot({ path: 'dbr-cycle.png' });
  await browser.close();
  console.log('rendered', fs.statSync('dbr-cycle.png').size, 'bytes');
})();

// Renders each plate in cards.html to ../assets/<id>.png at 2x, with transparent corners.
// Usage: node design/render.mjs   (CHROME=/path/to/chrome to override the browser)
import { chromium } from '/home/gabriel/.npm/_npx/420ff84f11983ee5/node_modules/playwright-core/index.mjs';

const exe = process.env.CHROME || '/home/gabriel/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome';
const here = new URL('.', import.meta.url).pathname;
const browser = await chromium.launch({ executablePath: exe });
const page = await browser.newPage({ viewport: { width: 1000, height: 1000 }, deviceScaleFactor: 2 });
await page.goto(`file://${here}cards.html`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.addStyleTag({ content: 'body{background:transparent!important}' });
for (const id of await page.$$eval('section.plate', (els) => els.map((e) => e.id))) {
  await page.locator(`#${id}`).screenshot({ path: `${here}../assets/${id}.png`, omitBackground: true });
  console.log('rendered', id);
}
await browser.close();

// Captures the hero of each live site used on the profile cards.
import { chromium } from '/home/gabriel/.npm/_npx/420ff84f11983ee5/node_modules/playwright-core/index.mjs';
const exe = process.env.CHROME || '/home/gabriel/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome';
const out = new URL('./img/', import.meta.url).pathname;
const sites = [
  ['untd', 'https://untdcorp.org/en/'],
  ['studio', 'https://untdstudio.com/'],
  ['iris', 'https://untd-iris.vercel.app/'],
];
const browser = await chromium.launch({ executablePath: exe });
for (const [name, url] of sites) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, locale: 'en-US' });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(5000);
  await page.screenshot({ path: `${out}${name}.png` });
  console.log('shot', name);
  await page.close();
}
await browser.close();

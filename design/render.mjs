// Renders each plate in cards.html to ../assets/<id>.<hash>.png at 2x, with transparent corners,
// then points README.md at the new files. The hash in the name changes whenever the image does,
// so browsers and GitHub's image cache never show a stale plate.
// Usage: node design/render.mjs   (CHROME=/path/to/chrome to override the browser)
import { chromium } from '/home/gabriel/.npm/_npx/420ff84f11983ee5/node_modules/playwright-core/index.mjs';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const exe = process.env.CHROME || '/home/gabriel/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome';
const here = new URL('.', import.meta.url).pathname;
const assets = `${here}../assets/`;
const readme = `${here}../README.md`;

const browser = await chromium.launch({ executablePath: exe });
const page = await browser.newPage({ viewport: { width: 1000, height: 1000 }, deviceScaleFactor: 2 });
await page.goto(`file://${here}cards.html`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.addStyleTag({ content: 'body{background:transparent!important}' });

let md = readFileSync(readme, 'utf8');
for (const id of await page.$$eval('section.plate', (els) => els.map((e) => e.id))) {
  const tmp = `${assets}${id}.tmp.png`;
  await page.locator(`#${id}`).screenshot({ path: tmp, omitBackground: true });
  execFileSync('python3', ['-c', 'import sys;from PIL import Image;Image.open(sys.argv[1]).save(sys.argv[1],optimize=True)', tmp]);
  const buf = readFileSync(tmp);
  const name = `${id}.${createHash('sha1').update(buf).digest('hex').slice(0, 8)}.png`;
  for (const f of readdirSync(assets)) if (f.startsWith(`${id}.`) && f !== name) unlinkSync(`${assets}${f}`);
  writeFileSync(`${assets}${name}`, buf);
  md = md.replace(new RegExp(`assets/${id}(\\.[0-9a-f]{8})?\\.png`, 'g'), `assets/${name}`);
  console.log('rendered', name);
}
writeFileSync(readme, md);
await browser.close();

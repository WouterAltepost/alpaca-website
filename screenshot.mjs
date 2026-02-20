import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url   = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const screenshotsDir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

// Auto-increment filename
const existing = fs.readdirSync(screenshotsDir).filter(f => f.endsWith('.png'));
const nums = existing.map(f => {
  const m = f.match(/^screenshot-(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
});
const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
const filename = label ? `screenshot-${next}-${label}.png` : `screenshot-${next}.png`;
const outputPath = path.join(screenshotsDir, filename);

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 800));
// Force all animated elements visible for screenshots
await page.evaluate(() => {
  document.querySelectorAll('.fade-up').forEach(el => {
    el.classList.add('visible');
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
  window.scrollTo(0, 0);
});
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: outputPath, fullPage: true });
await browser.close();

console.log(`Screenshot saved: ${outputPath}`);

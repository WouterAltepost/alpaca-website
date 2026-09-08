// Renders the privacy statement to PDF, one file per language, from the built HTML pages.
// Skipped when the statement has not changed since the last render (hash kept next to the PDF),
// so a routine build does not touch the binaries.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { parse } from 'node-html-parser';

const LABELS = {
  nl: { kvk: 'KVK', page: 'Pagina', of: 'van' },
  en: { kvk: 'KVK', page: 'Page', of: 'of' },
};

export async function buildPrivacyPdfs({ root, pages, files, site }) {
  const page = pages.find((p) => p.id === 'privacy');
  const logo = fs.readFileSync(path.join(root, 'brand_assets/logo-email.png')).toString('base64');
  const jobs = [];
  for (const lang of ['nl', 'en']) {
    const htmlFile = page[lang].out ?? page[lang].path.replace(/^\//, '') + '.html';
    const doc = parse(fs.readFileSync(path.join(root, htmlFile), 'utf8'));
    const h1 = doc.querySelector('main h1').textContent.trim();
    const sub = doc.querySelector('main h1 + p').textContent.trim();
    const updated = doc.querySelector('main h1 + p + p').textContent.trim();
    const body = doc.querySelector('.legal').innerHTML;
    const out = files['privacy-pdf'][lang].replace(/^\//, '');
    const html = template({ lang, h1, sub, updated, body, logo, site, labels: LABELS[lang] });
    const hash = crypto.createHash('sha256').update(html).digest('hex').slice(0, 16);
    const hashFile = path.join(root, out + '.hash');
    if (fs.existsSync(path.join(root, out)) && fs.existsSync(hashFile) && fs.readFileSync(hashFile, 'utf8') === hash) { jobs.push({ out, skip: true }); continue; }
    jobs.push({ out, html, hash, hashFile, lang });
  }
  const todo = jobs.filter((j) => !j.skip);
  if (todo.length) {
    const { default: puppeteer } = await import('puppeteer');
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    try {
      for (const j of todo) {
        const p = await browser.newPage();
        await p.setContent(j.html, { waitUntil: 'networkidle0' });
        await p.evaluateHandle('document.fonts.ready');
        const l = LABELS[j.lang];
        await p.pdf({
          path: path.join(root, j.out), format: 'A4', printBackground: true,
          margin: { top: '22mm', right: '20mm', bottom: '22mm', left: '20mm' },
          displayHeaderFooter: true,
          headerTemplate: '<span></span>',
          footerTemplate: `<div style="width:100%; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 8px; color: #A39D94; padding: 0 20mm; display:flex; justify-content: space-between;"><span>${site.name} · ${site.address.street}, ${site.address.postalCode} ${site.address.city} · ${l.kvk} ${site.kvk} · ${site.email}</span><span>${l.page} <span class="pageNumber"></span> ${l.of} <span class="totalPages"></span></span></div>`,
        });
        fs.writeFileSync(j.hashFile, j.hash);
        await p.close();
      }
    } finally { await browser.close(); }
  }
  return jobs.map((j) => j.out + (j.skip ? '  (unchanged)' : ''));
}

function template({ lang, h1, sub, updated, body, logo, site, labels }) {
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@700;800&family=Plus+Jakarta+Sans:wght@400;600&display=swap" rel="stylesheet">
<style>
  @page { size: A4; }
  html { -webkit-print-color-adjust: exact; }
  body { margin: 0; font-family: 'Plus Jakarta Sans', 'Helvetica Neue', Arial, sans-serif; color: #1A1613; font-size: 10.5pt; line-height: 1.6; }
  .head { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #F09537; padding-bottom: 14px; margin-bottom: 26px; }
  .head img { height: 26px; }
  .head span { font-size: 8.5pt; color: #A39D94; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600; }
  h1 { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 26pt; letter-spacing: -0.03em; line-height: 1.05; margin: 0 0 12px; }
  .sub { font-size: 11.5pt; color: #5A544D; margin: 0 0 6px; max-width: 90%; }
  .updated { font-size: 9pt; color: #A39D94; margin: 0 0 8px; }
  h2 { font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 14pt; letter-spacing: -0.02em; margin: 24px 0 8px; break-after: avoid; }
  p { margin: 0 0 8px; color: #5A544D; }
  ul { list-style: none; margin: 4px 0 10px; padding: 0; }
  li { position: relative; padding-left: 16px; margin-bottom: 5px; color: #5A544D; break-inside: avoid; }
  li::before { content: ''; position: absolute; left: 0; top: 0.75em; width: 8px; height: 1.5px; background: #F09537; }
  strong { color: #1A1613; font-weight: 600; }
  a { color: #1A1613; font-weight: 600; text-decoration: underline; text-underline-offset: 2px; }
</style></head><body>
<div class="head"><img src="data:image/png;base64,${logo}" alt="${site.name}"><span>${site.origin.replace(/^https?:\/\//, '')}</span></div>
<h1>${h1}</h1>
<p class="sub">${sub}</p>
<p class="updated">${updated}</p>
${body}
</body></html>`;
}

// Build: src/pages/*.html + src/i18n/nl.json + src/site.css
//   -> index.html, diensten.html, over-ons.html, afspraak.html, privacy.html   (Dutch, the default)
//   -> en/index.html, en/services.html, en/about.html, en/book.html, en/privacy.html   (English)
//   -> assets/site.css, sitemap.xml, robots.txt
// Outputs are committed: Vercel serves the repo root as static files.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parse } from 'node-html-parser';
import { SITE, PAGES, LOCALE, ORG, DEFAULT_LANG, FILES } from './src/site.config.mjs';
import { buildPrivacyPdfs } from './build-pdf.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, s) => { fs.mkdirSync(path.dirname(path.join(ROOT, p)), { recursive: true }); fs.writeFileSync(path.join(ROOT, p), s); };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = (p) => SITE.origin + p;
const outFile = (page, lang) => page[lang].out ?? page[lang].path.replace(/^\//, '') + '.html';

const i18n = JSON.parse(read('src/i18n/nl.json'));
const routeMap = { en: Object.fromEntries(PAGES.map((p) => [p.src, p.en.path])), nl: Object.fromEntries(PAGES.map((p) => [p.src, p.nl.path])) };
const home = (lang) => PAGES[0][lang].path;

// ── 1. CSS ──────────────────────────────────────────────────────────────
execFileSync(path.join(ROOT, 'node_modules/.bin/tailwindcss'), ['-c', 'tailwind.config.js', '-i', 'src/site.css', '-o', 'assets/site.css', '--minify'], { cwd: ROOT, stdio: ['ignore', 'ignore', 'inherit'] });
const cssBytes = fs.statSync(path.join(ROOT, 'assets/site.css')).size;

// ── 2. Pages ────────────────────────────────────────────────────────────
function jsonLd(lang) {
  const a = SITE.address;
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': abs('/#organization'),
    name: SITE.name,
    url: abs(home(lang)),
    vatID: SITE.vat,
    identifier: { '@type': 'PropertyValue', propertyID: 'KVK', value: SITE.kvk },
    logo: abs(SITE.logo),
    image: abs(SITE.logo),
    description: ORG.description[lang],
    email: SITE.email,
    telephone: SITE.phone,
    address: { '@type': 'PostalAddress', streetAddress: a.street, postalCode: a.postalCode, addressLocality: a.city, addressCountry: a.country },
    areaServed: { '@type': 'Country', name: lang === 'nl' ? 'Nederland' : 'Netherlands' },
    knowsLanguage: ['nl', 'en'],
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ORG.hours.days, opens: ORG.hours.opens, closes: ORG.hours.closes }],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: lang === 'nl' ? 'Diensten' : 'Services',
      itemListElement: ORG.services[lang].map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.name, description: s.description } })),
    },
  };
}

function headBlock(page, lang, title, description) {
  const self = page[lang].path;
  const other = lang === 'en' ? 'nl' : 'en';
  return [
    `<link rel="canonical" href="${abs(self)}" />`,
    `<link rel="alternate" hreflang="en" href="${abs(page.en.path)}" />`,
    `<link rel="alternate" hreflang="nl" href="${abs(page.nl.path)}" />`,
    `<link rel="alternate" hreflang="x-default" href="${abs(page[DEFAULT_LANG].path)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(SITE.name)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${abs(self)}" />`,
    `<meta property="og:image" content="${abs(SITE.ogImage)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(SITE.name)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta property="og:locale" content="${LOCALE[lang]}" />`,
    `<meta property="og:locale:alternate" content="${LOCALE[other]}" />`,
    `<script type="application/ld+json">${JSON.stringify(jsonLd(lang)).replace(/</g, '\\u003c')}</script>`,
    `<script>window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };</script>`,
    `<script defer src="/_vercel/insights/script.js"></script>`,
  ].map((l) => '  ' + l).join('\n');
}

function localiseHref(href, lang) {
  // Internal page links only: "/", "/about", "/#expertise", "/book" ... never assets or external URLs.
  const m = href.match(/^(\/[a-z-]*)(#.*)?$/);
  if (!m) return href;
  return (routeMap[lang][m[1]] ?? m[1]) + (m[2] ?? '');
}

function buildPage(page, lang) {
  const src = read(`src/pages/${page.id}.html`);
  const root = parse(src, { comment: true });
  const html = root.querySelector('html');
  const strings = lang === 'nl' ? { ...i18n.shared, ...(i18n.pages[page.id] ?? {}) } : null;
  const missing = [];

  // Translatable text and attributes
  for (const el of root.querySelectorAll('[data-i18n], [data-i18n-attrs]')) {
    if (strings) {
      const key = el.getAttribute('data-i18n');
      if (key) {
        if (!(key in strings)) missing.push(key);
        else if (el.hasAttribute('data-i18n-html')) el.set_content(strings[key]);
        else el.set_content(esc(strings[key]));
      }
      const attrs = el.getAttribute('data-i18n-attrs');
      if (attrs) for (const pair of attrs.split(',')) {
        const [attr, k] = pair.split('=');
        if (!(k in strings)) missing.push(k); else el.setAttribute(attr, strings[k]);
      }
    }
    el.removeAttribute('data-i18n'); el.removeAttribute('data-i18n-html'); el.removeAttribute('data-i18n-attrs');
  }
  if (missing.length) throw new Error(`nl.json is missing ${page.id} keys: ${[...new Set(missing)].join(', ')}`);

  // Head
  html.setAttribute('lang', lang);
  const titleEl = root.querySelector('title');
  const descEl = root.querySelector('meta[name="description"]');
  if (!titleEl || !descEl) throw new Error(`${page.id}: needs <title> and <meta name="description">`);
  const title = lang === 'nl' ? i18n.meta[page.id].title : titleEl.textContent;
  const description = lang === 'nl' ? i18n.meta[page.id].description : descEl.getAttribute('content');
  titleEl.set_content(esc(title));
  descEl.setAttribute('content', description);
  descEl.insertAdjacentHTML('afterend', '\n' + headBlock(page, lang, title, description));

  // Collapsible cards: a one-sentence teaser (first sentence of the body) shown while collapsed on phones
  for (const d of root.querySelectorAll('details.svc')) {
    const p = d.querySelector('.svc-body p');
    const h3 = d.querySelector('summary h3');
    if (!p || !h3) continue;
    const text = p.textContent.replace(/\s+/g, ' ').trim();
    const m = text.match(/^(.+?[.!?])(\s|$)/);
    h3.insertAdjacentHTML('afterend', '\n            <p class="svc-teaser">' + esc(m ? m[1] : text) + '</p>');
  }

  // Links between pages
  for (const a of root.querySelectorAll('a[href]')) a.setAttribute('href', localiseHref(a.getAttribute('href'), lang));
  for (const a of root.querySelectorAll('a[data-file]')) {
    const f = FILES[a.getAttribute('data-file')];
    if (!f) throw new Error(`unknown data-file "${a.getAttribute('data-file')}" in ${page.id}`);
    a.setAttribute('href', f[lang]);
    a.removeAttribute('data-file');
  }

  // Language toggle: one link per language, pointing at this page's counterpart
  for (const a of root.querySelectorAll('.lang-toggle a[data-lang]')) {
    const l = a.getAttribute('data-lang');
    a.setAttribute('href', page[l].path);
    a.removeAttribute('data-lang');
    if (l === lang) { a.setAttribute('class', 'lang-btn active'); a.setAttribute('aria-current', 'page'); }
  }

  const out = root.toString().replace(/^<!DOCTYPE html>\n/i, `<!DOCTYPE html>\n<!-- Generated by build.mjs from src/pages/${page.id}.html. Edit the source, then run: npm run build -->\n`);
  const file = outFile(page, lang);
  write(file, out);
  return file;
}

const written = [];
for (const page of PAGES) for (const lang of ['nl', 'en']) written.push(buildPage(page, lang));

// ── 3. sitemap.xml + robots.txt ─────────────────────────────────────────
const today = new Date().toISOString().slice(0, 10);
const urlEntry = (page, lang) => `  <url>
    <loc>${abs(page[lang].path)}</loc>
    <lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="en" href="${abs(page.en.path)}" />
    <xhtml:link rel="alternate" hreflang="nl" href="${abs(page.nl.path)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(page[DEFAULT_LANG].path)}" />
  </url>`;
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${PAGES.flatMap((p) => ['en', 'nl'].map((l) => urlEntry(p, l))).join('\n')}
</urlset>
`);
write('robots.txt', `User-agent: *
Allow: /

Sitemap: ${abs('/sitemap.xml')}
`);

// ── 4. Privacy statement as PDF (one per language) ──────────────────────
const pdfs = await buildPrivacyPdfs({ root: ROOT, pages: PAGES, files: FILES, site: SITE });

console.log(`assets/site.css  ${(cssBytes / 1024).toFixed(1)} kB`);
for (const f of written) console.log(`${f}`);
for (const f of pdfs) console.log(f);
console.log('sitemap.xml\nrobots.txt');

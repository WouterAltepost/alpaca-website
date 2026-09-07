// Single place for everything the build needs to know about the site.
// Change `origin` when the primary domain changes: canonical URLs, hreflang,
// sitemap, robots.txt, JSON-LD and the analytics domain all derive from it.

export const SITE = {
  origin: 'https://alpacaai.nl',
  name: 'Alpaca AI',
  email: 'wout@alpacaai.nl',
  phone: '+31628283985',
  address: { street: 'Vrijheidslaan 18', postalCode: '1078 PJ', city: 'Amsterdam', country: 'NL' },
  logo: '/brand_assets/logo-email.png',
  ogImage: '/brand_assets/og-image.png',
  kvk: '42024441',
  vat: 'NL005436235B79',
  // Vercel Web Analytics: cookieless, so no consent banner is needed. It only
  // records data once "Web Analytics" is enabled on the Vercel project.
  analytics: 'vercel',
};

// Each source page is emitted twice. `src` is the href written in the source HTML
// (English pages link to each other with these); the build rewrites every internal
// link to the language's real `path`. Dutch is the default language and lives at the
// root; English lives under /en. Output files follow Vercel's cleanUrls convention.
export const PAGES = [
  { id: 'index',    src: '/',         nl: { path: '/',          out: 'index.html' }, en: { path: '/en', out: 'en/index.html' } },
  { id: 'services', src: '/services', nl: { path: '/diensten' },                    en: { path: '/en/services' } },
  { id: 'about',    src: '/about',    nl: { path: '/over-ons' },                    en: { path: '/en/about' } },
  { id: 'book',     src: '/book',     nl: { path: '/afspraak' },                    en: { path: '/en/book' } },
  { id: 'privacy',  src: '/privacy',  nl: { path: '/privacy' },                     en: { path: '/en/privacy' } },
];
export const DEFAULT_LANG = 'nl';

export const LOCALE = { en: 'en_GB', nl: 'nl_NL' };

// Organisation description and service list for the ProfessionalService JSON-LD.
export const ORG = {
  description: {
    en: 'Alpaca AI is a small team of engineers in Amsterdam that designs and builds custom AI systems for businesses in the Netherlands: strategy, development, integration and automation, from brief to production in weeks.',
    nl: 'Alpaca AI is een klein team van engineers in Amsterdam dat AI-systemen op maat ontwerpt en bouwt voor Nederlandse bedrijven: strategie, ontwikkeling, integratie en automatisering, van briefing naar productie in weken.',
  },
  services: {
    en: [
      { name: 'Websites',              description: 'Design, build and launch of websites that work on mobile and get found, with optional maintenance.' },
      { name: 'Web applications',      description: 'Client portals, dashboards and internal tools built around how you work.' },
      { name: 'Custom software',       description: 'From first outline to running system, including hosting and maintenance.' },
      { name: 'Integrations and APIs', description: 'Connecting bookkeeping, CRM, webshop and other systems so data is entered once.' },
      { name: 'AI Solutions',          description: 'Automating manual, repetitive work: processing documents, triaging requests, generating reports.' },
    ],
    nl: [
      { name: 'Websites',                   description: 'Ontwerp, opbouw en livegang van websites die werken op mobiel en gevonden worden, met optioneel onderhoud.' },
      { name: 'Webapplicaties',             description: 'Klantportalen, dashboards en interne tools, gebouwd rond hoe jij werkt.' },
      { name: 'Maatwerksoftware',           description: 'Van eerste opzet tot draaiend systeem, inclusief hosting en onderhoud.' },
      { name: 'Koppelingen en integraties', description: 'Boekhouding, CRM, webshop en andere systemen koppelen zodat gegevens één keer worden ingevoerd.' },
      { name: 'AI-oplossingen',             description: 'Handmatig, terugkerend werk automatiseren: documenten verwerken, aanvragen sorteren, rapportages genereren.' },
    ],
  },
  // Booking hours, also the hours shown on the booking page.
  hours: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '17:00' },
};

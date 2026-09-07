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
  kvk: '42024441',
  vat: 'NL005436235B79',
  // Vercel Web Analytics: cookieless, so no consent banner is needed. It only
  // records data once "Web Analytics" is enabled on the Vercel project.
  analytics: 'vercel',
};

// Each source page is emitted twice. `path` is the public URL; the output file
// follows Vercel's cleanUrls convention (/about -> about.html); index pages set `out` explicitly.
export const PAGES = [
  { id: 'index',   en: { path: '/', out: 'index.html' }, nl: { path: '/nl', out: 'nl/index.html' } },
  { id: 'about',   en: { path: '/about' },   nl: { path: '/nl/over-ons' } },
  { id: 'book',    en: { path: '/book' },    nl: { path: '/nl/afspraak' } },
  { id: 'privacy', en: { path: '/privacy' }, nl: { path: '/nl/privacy' } },
];

export const LOCALE = { en: 'en_GB', nl: 'nl_NL' };

// Organisation description and service list for the ProfessionalService JSON-LD.
export const ORG = {
  description: {
    en: 'Alpaca AI is a small team of engineers in Amsterdam that designs and builds custom AI systems for businesses in the Netherlands: strategy, development, integration and automation, from brief to production in weeks.',
    nl: 'Alpaca AI is een klein team van engineers in Amsterdam dat AI-systemen op maat ontwerpt en bouwt voor Nederlandse bedrijven: strategie, ontwikkeling, integratie en automatisering, van briefing naar productie in weken.',
  },
  services: {
    en: [
      { name: 'AI Strategy & Consulting',  description: 'Roadmaps, use-case prioritisation and build-vs-buy analysis.' },
      { name: 'Custom AI Development',     description: 'LLM applications, fine-tuned models and agent pipelines built around your data and processes.' },
      { name: 'AI Integration & APIs',     description: 'Connecting AI models to your CRM, ERP and internal tools.' },
      { name: 'AI Automation',             description: 'Document processing, customer triage, reporting and research automated end to end.' },
    ],
    nl: [
      { name: 'AI Strategie & Advies',     description: 'Roadmaps, use-case prioritering en build-vs-buy analyse.' },
      { name: 'Maatwerk AI-ontwikkeling',  description: 'LLM-applicaties, fijnafgestemde modellen en agentpijplijnen rondom jouw data en processen.' },
      { name: "AI-integratie & API's",     description: 'AI-modellen koppelen aan jouw CRM, ERP en interne tools.' },
      { name: 'AI-automatisering',         description: 'Documentverwerking, klanttriage, rapportage en onderzoek van begin tot eind geautomatiseerd.' },
    ],
  },
  // Booking hours, also the hours shown on the booking page.
  hours: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '17:00' },
};

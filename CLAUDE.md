# CLAUDE.md — Frontend Website Rules

## Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.

## Reference Images
- If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content (images via `https://placehold.co/`, generic copy). Do not improve or add to the design.
- If no reference image: design from scratch with high craft (see guardrails below).
- Screenshot your output, compare against reference, fix mismatches, re-screenshot. Do at least 2 comparison rounds. Stop only when no visible differences remain or user says so.

## Project Layout & Build
- **Sources live in `src/`.** `src/pages/*.html` are the English pages (the only place to edit markup), `src/i18n/nl.json` holds every Dutch string keyed by `data-i18n`, `src/site.css` is the shared stylesheet (Tailwind directives + custom rules), `src/site.config.mjs` holds the site origin, routes and organisation data.
- **Run `npm run build` after every change.** It compiles Tailwind to `assets/site.css` and writes the deployable pages: Dutch is the default language at the root (`index.html`, `diensten.html`, `over-ons.html`, `afspraak.html`, `privacy.html`) and English lives under `en/` (`en/index.html` served at `/en`, `en/services.html`, `en/about.html`, `en/book.html`, `en/privacy.html`), plus `sitemap.xml` and `robots.txt`. Outputs are committed; Vercel serves the repo root as static files with `.vercelignore` keeping `src/` and tooling out of the deploy.
- **Never edit the generated root or `nl/` HTML files directly**; they are overwritten by the build.
- Translatable text is marked with `data-i18n="key"` (plain text) or `data-i18n="key" data-i18n-html` (inner HTML). Attributes use `data-i18n-attrs="aria-label=key"`. Adding a marked element without a matching key in `nl.json` fails the build on purpose.
- The source HTML is English and links use the `src` paths in `site.config.mjs` (`/about`, `/book`, ...); the build rewrites every internal link to the real path per language. Old URLs (`/nl/...`, `/about`, `/book`, `/services`) redirect in `vercel.json`.
- Service cards are `<details class="card svc" open>`: open on desktop, collapsed on phones by a small script; the build adds a one-sentence teaser from the body text. Steps use `.step-item` inside `.steps`, which becomes a compact timeline under 768px. Desktop layout is unchanged by either. Other phone-only patterns: the booking intro column uses `display: contents` under 1024px so the calendar card comes right after the headline; the pricing grid on the services page is a scroll-snap carousel with dots under 768px; the About story has a "Read more" `<details>` and the principles collapse to headlines under 768px.
- Page-specific styles stay in an inline `<style>` in that page's source; they load after `assets/site.css`, so restate `[hidden] { display: none }` for any class that sets `display`.

## Local Server
- **Always serve on localhost** — never screenshot a `file:///` URL.
- Start the dev server: `node serve.mjs` (serves the project root at `http://localhost:8080`, mirroring Vercel's clean URLs: `/over-ons`, `/en`, `/en/about`)
- `serve.mjs` lives in the project root. Start it in the background before taking any screenshots.
- If the server is already running, do not start a second instance.

## Screenshot Workflow
- Puppeteer is a devDependency in this project's `node_modules`; run scripts from the project root.
- **Always screenshot from localhost:** `node screenshot.mjs http://localhost:8080`
- Screenshots are saved automatically to `./temporary screenshots/screenshot-N.png` (auto-incremented, never overwritten).
- Optional label suffix: `node screenshot.mjs http://localhost:8080 label` → saves as `screenshot-N-label.png`
- `screenshot.mjs` lives in the project root. Use it as-is.
- After screenshotting, read the PNG from `temporary screenshots/` with the Read tool — Claude can see and analyze the image directly.
- When comparing, be specific: "heading is 32px but reference shows ~24px", "card gap is 16px but should be 24px"
- Check: spacing/padding, font size/weight/line-height, colors (exact hex), alignment, border-radius, shadows, image sizing

## Output Defaults
- One source file per page in `src/pages/`, shared styles in `src/site.css`, built by `npm run build`
- Tailwind CSS is compiled at build time (`tailwind.config.js`); never load the play CDN
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`
- Mobile-first responsive

## Brand Assets
- Always check the `brand_assets/` folder before designing. It may contain logos, color guides, style guides, or images.
- If assets exist there, use them. Do not use placeholders where real assets are available.
- If a logo is present, use it. If a color palette is defined, use those exact values — do not invent brand colors.

## Anti-Generic Guardrails
- **Colors:** Never use default Tailwind palette (indigo-500, blue-600, etc.). Pick a custom brand color and derive from it.
- **Shadows:** Never use flat `shadow-md`. Use layered, color-tinted shadows with low opacity.
- **Typography:** Never use the same font for headings and body. Pair a display/serif with a clean sans. Apply tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body.
- **Gradients:** Layer multiple radial gradients. Add grain/texture via SVG noise filter for depth.
- **Animations:** Only animate `transform` and `opacity`. Never `transition-all`. Use spring-style easing.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states. No exceptions.
- **Images:** Add a gradient overlay (`bg-gradient-to-t from-black/60`) and a color treatment layer with `mix-blend-multiply`.
- **Spacing:** Use intentional, consistent spacing tokens — not random Tailwind steps.
- **Depth:** Surfaces should have a layering system (base → elevated → floating), not all sit at the same z-plane.

## Hard Rules
- Do not add sections, features, or content not in the reference
- Do not "improve" a reference design — match it
- Do not stop after one screenshot pass
- Do not use `transition-all`
- Do not use default Tailwind blue/indigo as primary color

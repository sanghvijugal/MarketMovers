# Market Movers website

Marketing and catalogue site for Market Movers (plumbing & sanitary distributor, Jabalpur, MP).
Astro (static output) + Tailwind CSS v4 + shadcn/ui components (React islands only where
interactive) + Hugeicons. Deployed to GitHub Pages at https://marketmovers.co.in by
`.github/workflows/deploy.yml` on every push to `main`.

```
npm run dev      # local dev server
npm run build    # build into dist/ AND run the SEO checks (must pass)
npm run check    # TypeScript / Astro type check
```

## Where things live

- `src/data/site.ts`: business details (phones, WhatsApp, address, hours), brand list, product
  categories. The contact section, footer, WhatsApp links and JSON-LD all read from here.
- `src/data/brands/<slug>.json`: one file per brand page (product lines, specs, tables,
  PDF links). `src/pages/[brand].astro` renders every brand from these files.
- `src/pages/index.astro`: homepage. `src/pages/404.astro`: not-found page.
- `src/components/`: `Header`, `Footer`, `ActionBar` (phone Call/WhatsApp bar), `Logo`
  (mark + name), `LogoMark` (the woven MM logo as inline SVG), `Icon` (Hugeicons → inline SVG), `EnquiryForm.tsx` (React island),
  `brand/*` (brand page parts), `home/*` (homepage React islands: size rings,
  count-up stats, brand sentence), `ui/*` (shadcn components).
- `src/styles/global.css`: design tokens and the transitions.dev recipes. See `DESIGN.md`.
- `public/`: files served as-is (`robots.txt`, `CNAME`, `assets/` OG image and favicons).
- `tools/seo.py`: SEO checker that runs on `dist/` after every build.

## Adding a brand page

1. Add `src/data/brands/<slug>.json` (copy an existing one; lowercase, hyphenated slug).
   Fill `seo.title` (≤ 60 chars, "<Brand> … Jabalpur | Market Movers") and a unique
   `seo.description` (50–160 chars).
2. Set `slug: "<slug>"` for that brand in `brands` in `src/data/site.ts`. Links from the homepage,
   footer, other brand pages and the sitemap then appear automatically.
3. `npm run build` and fix anything the SEO check reports.

## SEO rules (enforced by `npm run build`)

- Never change an existing URL: `/`, `/dutron.html`, `/finolex.html`, `/johnson.html`,
  `/texmo.html`, `/waterflo.html` are indexed by Google (`build.format: "file"` keeps `.html`).
- Every page goes through `src/layouts/Base.astro` with a unique `title`, `description` and
  `path`. The layout adds canonical, Open Graph, Twitter and JSON-LD tags.
- One `<h1>` per page; don't skip heading levels. Style size with CSS, not a smaller tag.
- Every `<img>` needs descriptive `alt`, `width` and `height`. Only the first visible image
  gets `fetchpriority="high"`; the rest `loading="lazy"`.
- Links between pages are real `<a href>`s, never `href="#"` + JavaScript.
- Only `https://` URLs. The WhatsApp number comes from `site.ts`; never hard-code it.

## UI rules

`design-taste-frontend` (in `.claude/skills/`, source in `.claude/skills/SOURCES.md`) is the only
design skill and the single source of design rules. Where anything below or in `DESIGN.md`
disagrees with it, the skill wins. `DESIGN.md` records the project's current decisions.
- Use the shadcn components in `src/components/ui/` for form controls and buttons. Use
  `buttonVariants()` for links that look like buttons in `.astro` files.
- Icons: Hugeicons only (`@hugeicons/core-free-icons`), rendered with `Icon.astro` (or
  `HugeiconsIcon` inside React). Don't mix in other icon sets.
- Motion: animate only `transform` and `opacity` (the accordion's grid-rows height is the one
  exception) and always respect `prefers-reduced-motion`.
- Never change without the owner's approval: URLs, primary nav labels (Brands, Products,
  How to order, Visit), form field names, the logo, legal copy.

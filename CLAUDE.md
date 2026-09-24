# Market Movers website

Static HTML site for Market Movers (plumbing & sanitary distributor, Jabalpur, MP),
hosted on GitHub Pages at https://marketmovers.co.in (see `CNAME`). No build step:
each `*.html` file in the repo root is a public page.

- `index.html`: homepage (products, brands, contact form → WhatsApp)
- `<brand>.html`: one page per brand (dutron, finolex, johnson, texmo, waterflo)
- `assets/`: OG share image and favicons
- `sitemap.xml`, `robots.txt`: generated/maintained for Google
- `tools/seo.py`: sitemap generator + SEO checker (runs in CI via `.github/workflows/seo.yml`)

## SEO rules: keep these true on every change

After any edit, run:

```
python3 tools/seo.py sitemap
python3 tools/seo.py check
```

`check` must report 0 errors before committing. It enforces the rules below.

Every public page must have, in `<head>`:
- a unique `<title>` of 60 characters or fewer, in the form "<Brand/topic> … Jabalpur | Market Movers"
- a unique `<meta name="description">`, 50–160 characters, describing that page's actual content
- `<link rel="canonical" href="https://marketmovers.co.in/<file>.html">` (homepage: `https://marketmovers.co.in/`)
- Open Graph + Twitter tags (`og:title`, `og:description`, `og:url`, `og:type`,
  `og:image` = `https://marketmovers.co.in/assets/og-image.jpg`, `twitter:card`)
- JSON-LD schema: the homepage has the `HardwareStore` business (address, phone, hours,
  brands). Brand pages have a `WebPage` that is `about` the `Brand`. Keep the business
  details in JSON-LD in sync with the visible contact section if the address, phone or hours change.
- never `noindex`

In the body:
- exactly one `<h1>`; don't skip heading levels (h2 → h3, never h2 → h4). Use CSS for size,
  not a smaller heading tag.
- every `<img>` has a descriptive `alt` (what the image shows, e.g. "Texmo HDPE Coils & Pipes",
  not "panel-hdpe") plus `width`/`height`. The image shown on first load gets
  `fetchpriority="high"`; all others `loading="lazy"`.
- links between pages must be real `<a href="page.html">` links. Google does not follow
  `href="#"` + `onclick` navigation.
- only `https://` URLs; no placeholder numbers such as `91XXXXXXXXXX`. The WhatsApp number is
  `919425066923`.

## Adding a new brand page

1. Copy an existing brand page (e.g. `texmo.html`) to `<brand>.html`, using a lowercase,
   hyphenated file name with no spaces.
2. Update its title, description, canonical, og:*, JSON-LD and alt texts for the new brand.
3. Link to it with a real href from `index.html` (the brand tags/pills and the footer
   `.footer-links`) and from the "Also at Market Movers" block on every other brand page.
   Remove the brand from `CATALOG_PDFS` in `index.html` if it was listed there.
4. Run `python3 tools/seo.py sitemap && python3 tools/seo.py check`.

Don't rename or delete an existing page: Google has it indexed. GitHub Pages can't do server
redirects, so if a page must move, keep the old file as a stub with
`<meta http-equiv="refresh" content="0; url=new.html">` and a canonical pointing to the new URL,
and add the stub's name to `NOT_PAGES` in `tools/seo.py`.
`404.html` is the not-found page (intentionally `noindex`, excluded from the sitemap).

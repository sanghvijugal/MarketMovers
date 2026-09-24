# SEO: what's done, what you need to do, and how to earn links

## Why Google wasn't showing the site

1. **Google couldn't reach the brand pages.** Every link from the homepage to
   Dutron / Finolex / Texmo / Waterflo / Johnson was `href="#"` with JavaScript
   `onclick`. Google doesn't follow those, so those 5 pages had no inbound links.
   They are now normal links.
2. **No sitemap, no robots.txt, no descriptions, no canonical URLs, no schema.** All added.
3. **The site is probably not registered in Google Search Console.** Only you can do
   this (steps below). A brand-new domain with no links pointing to it can take weeks
   to get crawled without it.

There were no `noindex` tags on the site, so nothing was actively blocking Google.

## Automatic from now on

`.github/workflows/deploy.yml` runs on every push:
- builds the site; `sitemap.xml` is generated from the pages, with "last modified" dates
  taken from each page's content file in git
- runs `tools/seo.py check` on the built pages. It fails (red ✗ on the commit, and nothing
  is deployed) if a page is missing a title, description, canonical, OG tags or schema;
  has a `noindex`; has zero or two H1s, skipped heading levels, missing alt text, a broken
  internal link or an `http://` URL; or is not linked from any other page
- deploys to GitHub Pages when the push is to `main`
- weekly, checks that every link to manufacturer sites and PDFs still works

`CLAUDE.md` lists the same rules, so Claude follows them when editing the site.

## One-time steps only you can do (≈20 minutes)

### 1. GitHub Pages settings
Repo → **Settings → Pages**:
- **Build and deployment → Source: GitHub Actions.** Do this *before* merging the Astro
  rebuild into `main`. The repo no longer contains ready-made HTML, so the old
  "deploy from branch" setting would publish a broken site.
- **Custom domain:** `marketmovers.co.in` (re-enter it if it's blank after switching source).
- Tick **Enforce HTTPS**. If the box is greyed out, check
that the custom domain shows `marketmovers.co.in` with a green "DNS check successful",
wait for the certificate to be issued (up to 24 h), then tick it.
While there, make sure `www.marketmovers.co.in` also works. Add a `CNAME` DNS record
`www → sanghvijugal.github.io` at your domain registrar, and GitHub will redirect `www`
to the main domain automatically.

### 2. Verify Google Search Console
1. Go to <https://search.google.com/search-console> → **Add property** → choose **Domain**
   → enter `marketmovers.co.in`.
2. Google shows a `google-site-verification=…` TXT record. Add it in your domain
   registrar's DNS settings (GoDaddy / Hostinger / BigRock etc. → DNS → Add TXT record,
   host `@`). Click **Verify**. DNS can take a few minutes to a few hours.
   A Domain property covers http, https, www and non-www in one go.
3. **Sitemaps** → submit `https://marketmovers.co.in/sitemap.xml`.
4. **URL Inspection** → paste `https://marketmovers.co.in/` → **Request indexing**.
   Repeat for each brand page (`/dutron.html`, `/finolex.html`, `/johnson.html`,
   `/texmo.html`, `/waterflo.html`).

If you'd rather use the HTML-tag method, send the `<meta name="google-site-verification" …>`
tag to Claude and ask for it to be added to `src/layouts/Base.astro`.

Also do the same at **Bing Webmaster Tools** (<https://www.bing.com/webmasters>). It can
import directly from Search Console in one click.

### 3. Google Business Profile (the biggest win for a local business)
For searches like "pipe dealer Jabalpur" or "Finolex pipes near me", Google shows the
map pack **above** normal results, and that comes from Google Business Profile, not your
website.
- Claim or create the profile at <https://business.google.com> for
  "Market Movers, 4 & 5 Anjuman Market, Marhatal, Jabalpur 482001"
  (the Google Maps link on the site suggests a listing may already exist; claim it).
- Category: *Plumbing supply store*, plus secondary categories *Pipe supplier*,
  *Bathroom supply store*, *Irrigation equipment supplier*.
- Website: `https://marketmovers.co.in/`. Hours: Mon–Sat 9:00–19:00. Both phone numbers.
- Add real photos: shop front, godown/stock, delivery vehicle. Post monthly.
- Ask happy contractors and retailers for Google reviews. Reviews are the #1 local ranking factor.

Keep the name, address and phone **exactly identical** everywhere (website, Google,
directories). The site uses: **Market Movers, 4 & 5 Anjuman Market, Marhatal, Jabalpur,
Madhya Pradesh 482001, +91 94250 66923**.

## Backlink strategy

Links from relevant, real businesses beat any number of spammy links. Never buy links
or use "backlink packages": Google penalises them. Work down this list, highest value first.

### Tier 1: manufacturer dealer locators (highest value, most relevant)
Each brand you distribute has a "Find a dealer / distributor" page. Ask your company
sales rep (ASM) to list Market Movers **with your website URL**:
- Finolex Pipes: finolexpipes.com dealer locator
- Dutron: dutronindia.com, "Dealer Enquiry" / contact
- Texmo Pipes: texmopipe.com, dealer network
- Waterflo: waterflo.in, contact / dealers
- Johnson Bathrooms (Prism Johnson): johnsonbathrooms.in, "Where to buy"
- Kisan, Plasto, MBH, Rewa, Reco: same request

### Tier 2: business directories and B2B marketplaces (citations + buyer leads)
Create complete, consistent listings with the website link:
- IndiaMART, TradeIndia, ExportersIndia (B2B buyers actively search these)
- Justdial, Sulekha
- Bing Places, Apple Business Connect (Apple Maps)
- Facebook business page, Instagram, LinkedIn company page (put the site in the bio)
- If registered: GeM (Government e-Marketplace) seller profile and Udyam/MSME listing,
  which also back up the "govt. supplier" claim on the site

### Tier 3: local Jabalpur / MP relationships
- Mahakoshal Chamber of Commerce & Industry and any Jabalpur traders' / hardware
  merchants' association member directory
- Builders and contractors you supply: ask to be listed as a supplier on their project pages
- Local plumbers/retailers in your network who have websites or Google profiles
- Local news or agriculture-focused sites: a story about supplying a government
  irrigation project or a farmer drip-irrigation scheme

### Tier 4: content that earns links over time
Add useful pages that people search for and link to, for example:
- "CPVC vs uPVC vs GI pipes: which to use for home plumbing"
- "Borewell casing & column pipe size guide for Madhya Pradesh farmers"
- "Drip & sprinkler irrigation subsidy in MP: how to apply"

Each new page gets a title, description, H1 and links from the homepage. Ask Claude to add it
and the checks above will keep it correct.

### Track it
In Search Console → **Links**, see who links to you. In **Performance**, watch which
searches show the site. Expect movement over 4–12 weeks, not days.

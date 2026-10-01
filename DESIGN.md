# Design

A trade catalogue, not a startup landing page. The site should feel like a well-run
distributor: calm, dense with real information, quick to act on (call / WhatsApp).

`design-taste-frontend` (`.claude/skills/`) is the single source of design rules. This file
records the project's decisions under it. Redesign mode: **preserve the brand** (logo, teal,
Geist, Hindi lines, URLs, plain wording); everything else is open. Owner-approved changes:
nav "Ordering" is now "How to order"; the enquiry form asks for name, delivery area (optional),
product (optional) and requirement (optional), with no phone field since the reply goes to
their WhatsApp.

Dials: `DESIGN_VARIANCE 6`, `MOTION_INTENSITY 5`, `VISUAL_DENSITY 4`.

## Principles

- **Big type, lots of space, no boxes.** No cards, chips, tiles or badges. Separate things with
  space and the odd hairline (one per group, never one per row of a long list).
- **Motion must be motivated.** Every animation is hierarchy, storytelling or feedback. No
  perpetual loops.
- **Honest images.** Photos are generated product still lifes (owner-approved) in
  `src/assets/photos/`, served through Astro `<Picture>` (AVIF/WebP, responsive widths). They
  show products generically and are never presented as our shop, stock or staff. No stock
  photos, no placeholders.
- **One accent.** Teal for primary buttons, links, the logo's outer M and the active pipe
  dimension. Everything else is ink on off-white (light) or off-white on off-black (dark).
- **Plain words, some Hindi.** Section headings carry a short Hindi line stacked under them.
- **No em or en dashes** in visible text. At most one "·" per line.
- **Phones first.** 44–52px buttons, a Call / WhatsApp bar pinned to the bottom on phones, 16px+
  form text so iOS doesn't zoom.

## Tokens (`src/styles/global.css`)

Light and dark, following the visitor's system setting (`prefers-color-scheme`).

| Token | Light | Dark |
|---|---|---|
| `background` / `foreground` | `#f4f4f2` / `#111111` | `#121212` / `#ececea` |
| `card` (ordering band) | `#fafaf9` | `#1a1a19` |
| `muted-foreground` / `faint` | `#62625e` / `#b6b6b1` | `#a2a29d` / `#5a5a56` |
| `border` | `#dadad6` | `#2e2e2c` |
| `teal` = `primary` | `#0b5d63`, light text on it | `#6fb9be`, dark text on it |
| `inverse*` (footer) | `#111111` | `#0a0a0a` |

**Radius:** buttons and the floating header / phone bar are full pills; photo frames, glass
panels and the map are `--radius-glass` (24px); everything else (inputs, menu panel) is 12px.

**Glass (owner-approved, full glass):** photos sit in rounded frames with content on frosted
panels over them (`GlassFrame.astro`, `.glass`). The panels use *baked* glass: a pre-blurred
copy of the photo (`*-blur.jpg`, made with sharp: 720px wide, blur 14, saturation 1.35) lined
up by a small ResizeObserver script, so nothing blurs live while scrolling. Only the floating
header and phone bar (`.glass-live`) use a live `backdrop-filter`. No JS or
`prefers-reduced-transparency` → near-solid fill. Tokens: `--glass-tint`, `--glass-solid`,
`--glass-live`, `--glass-edge`, `--glass-shadow` (light and dark).

**Theme switch:** the page keeps one theme; the black footer is the single deliberate switch
(the skill allows one per page), kept by the owner for the full-width name.

## Type

Geist (variable) for everything; Hindi in IBM Plex Sans Devanagari (sans, to sit with Geist).

| Role | Size | Weight |
|---|---|---|
| Name (homepage top, footer) | 12.4vw phone, `clamp(3rem,13vw,13rem)` | 600 |
| Homepage `h1` | `2.25rem` → `clamp(2.75rem,4.8vw,4.5rem)` | 500, tail in muted |
| Brand page `h1` | `clamp(3rem,7.5vw,6.5rem)`, tagline at 0.5em | 600 |
| Section `h2` | `clamp(2.25rem,4.6vw,4.25rem)` | 600 |
| Large rows (ordering steps) | `clamp(2rem,4.4vw,4rem)` | 600 |
| Item headings | `clamp(1.625rem,2.6vw,2.25rem)` | 600 |
| Body | 19px phone / 15–17px desktop | 400 |

Only the hero has a small label above its heading.

## Homepage layout (one layout family per section)

| Section | Family |
|---|---|
| Hero | pipe photo frame; headline panel and size-rings panel on glass |
| Godown | HDPE coil frame; headline panel and figures panel (2×2 on phones) |
| Brands + products (`#brands`, `#products`) | one linked index: brands lead, product chips below ("Or find by product"); one detail panel on desktop, inline card on phones |
| Ordering (`#order`) | counter photo frame; steps on one glass panel, photo showing on the right |
| Visit + enquiry | side by side on desktop: address, details and map; the form on glass over the fittings photo |

## Interactive pieces (React islands, `src/components/home/`)

| Piece | Library | Notes |
|---|---|---|
| `SizeRings` | NumberFlow, torph | IS 4985 ODs 20–400 mm to scale; ruler of sizes below; stays still until picked |
| `Stats` | NumberFlow, Motion `useInView` | real figures count up once |
| `StockIndex` | none | brands and products light each other up (hover/focus, or tap a chip on phones); one panel shows the last brand or product picked; no "full range" or "authorised" claims until the owner confirms |

## Components

- shadcn/ui (`src/components/ui`): `Button` / `buttonVariants` (teal pill), `Input`, `Textarea`,
  `Label`, `NativeSelect`.
- Icons: Hugeicons, only inside buttons and arrow links.
- `ActionBar.astro`: phone Call / "WhatsApp your list" bar. One label per intent: every "send us your list" button reads "WhatsApp your list". `Logo.astro`: woven MM mark + name + Hindi.
- `LogoMark.astro`: two Ms woven over and under. Inner M in ink (`currentColor`), outer M in
  teal. Heavier `weight` at small sizes. Favicons and the OG image use the same geometry.
- Homepage top: the logo and a full-width "Market Movers" (`.wordmark-top`). On load the two Ms
  slide in and lock together (`LogoMark animate`, `.lm-*`); on scroll the row shrinks away while
  the header logo fades in (scroll-driven CSS). Other pages show the header logo from the start.
- Scroll timelines are set through `--tl-view` / `--tl-page` custom properties. Lightning CSS
  otherwise folds `animation-timeline` into the `animation` shorthand and browsers drop the rule.

## Motion

| Where | What | Why |
|---|---|---|
| Homepage top | two Ms slide together once on load | brand moment |
| Homepage top | name shrinks into the header logo on scroll | hierarchy |
| Headlines (`data-reveal`) | clip-path wipe up, once | hierarchy |
| Ordering heading (`.read-words`) | words darken as it scrolls up | storytelling |
| Stats | figures count up once | storytelling |
| Size rings | settle in once; selected wall scales on pick | feedback |
| Stock index | unrelated brands/chips fade, matching brands get a teal marker, panel crossfades | feedback |
| Glass frames | photo (and the blurred copy in each panel) drifts slower than the page: scroll-driven `translateY` ±9.6% over the frame's pass, no JS on scroll; static where scroll timelines aren't supported | depth |
| Homepage brand → brand page | the brand name morphs into the page heading (cross-document view transition) | continuity |
| Buttons | label rolls up on hover; press scale 0.97 | feedback |
| Accordions, mobile menu, form errors | expand, dropdown, shake | state change |

Everything above turns off under `prefers-reduced-motion`.

## Photos

| Photo | Where | Crop |
|---|---|---|
| `pipe-stack.jpg` | hero frame | anchored left |
| `hdpe-coil.jpg` | godown frame | 35% across |
| `counter.jpg` | ordering frame | 70% across |
| `fittings.jpg` | enquiry frame | anchored left |
| `tap.jpg` | not used at the moment | |

At most one photo per spot and never two back to back. Kept outside the repo: the stock shelves
image (don't pair it with "our godown" wording).

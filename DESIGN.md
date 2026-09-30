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
- **Real images only.** No stock, AI or placeholder photos. Product still lifes and tight crops
  of the stock (see "Photos" below) go into the slots marked `TODO photo slot` in the markup.
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

**Radius:** buttons are full pills; everything else (inputs, images, map, menu panel) is 12px.

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
| Hero | split: text left, pipe-size rings right |
| Godown | headline + one typographic line of figures |
| Brands | index: catalogue brands one per line, "Also in stock" below; detail panel beside it on desktop, details inline on phones |
| Products | three grouped chunks (Pipes; Farm and water; Bath and fittings), one divider each |
| Ordering | three steps set as large type rows |
| Visit | address headline, details, full-width Google map |
| Enquiry | heading and note, form stacked below |

## Interactive pieces (React islands, `src/components/home/`)

| Piece | Library | Notes |
|---|---|---|
| `SizeRings` | NumberFlow, torph | IS 4985 ODs 20–400 mm to scale; ruler of sizes below; stays still until picked |
| `Stats` | NumberFlow, Motion `useInView` | real figures count up once |
| `BrandIndex` | none | names dim only while the list is hovered or focused; the panel shows the selected brand (Finolex first) |

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
| Brand index | other names dim; details crossfade | feedback |
| Buttons | label rolls up on hover; press scale 0.97 | feedback |
| Accordions, mobile menu, form errors | expand, dropdown, shake | state change |

Everything above turns off under `prefers-reduced-motion`.

## Photos (to shoot)

Product, not premises: cut pipe ends stacked end-on; a handful of fittings from above; one tap
close-up; a coil of HDPE or drip line; tight crops of the stock racks; hands at the counter.
Plain background, window light or a product photographer. Brand pages keep manufacturers'
product images.

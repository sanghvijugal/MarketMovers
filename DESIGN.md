# Design

A trade catalogue, not a startup landing page. The site should feel like a well-run
distributor: calm, dense with real information, quick to act on (call / WhatsApp).

## Principles

- **Night showroom.** Luxurious but honest: deep teal-black sections with ivory serif type and
  brass hairlines, alternating with ivory "paper" sections for dense reading (brands, spec pages,
  the form). It should impress a builder the way a good showroom does.
- **No fake photos.** Only real photos of the shop, stock and people. Until they exist, type,
  line art built from real data (the pipe-size rings) and motion carry the page. Never renders,
  stock photos or illustrations.
- **Real things, not SaaS parts.** No icon tiles, chips, card grids or testimonial bubbles.
  Lists and rows separated by hairlines; big serif names; numbers from real data.
- **Plain words, some Hindi.** Headings are confident but concrete; each section carries a short
  Hindi line (`lang="hi"`, Tiro Devanagari Hindi).
- **Phones first.** Buttons 44–52px, Call / WhatsApp bar pinned to the bottom on phones, 16px
  form text so iOS doesn't zoom.

## Tokens (`src/styles/global.css`)

| Token | Use |
|---|---|
| `inverse` / `inverse-2` | teal-black showroom sections `#0a1f21` / `#0f2a2d`, header, footer |
| `inverse-foreground` / `inverse-muted` | ivory type / muted type on dark |
| `brass` / `brass-soft` | action colour and accents on dark (`#c9a45c`) / hairlines on dark |
| `background` / `foreground` | ivory paper `#f4f0e8` / ink `#141312` |
| `card` / `muted` / `border` / `rule` | paper surfaces and hairlines |
| `primary` | teal `#0b5d63`: action colour and links on paper |

Radius 6px (buttons, inputs, boxes). No gradients.

## Type

- **Instrument Serif** (regular and italic) for display: headings, brand names, numbers,
  the wordmark. Italic brass for one emphasised phrase per heading at most.
- **IBM Plex Sans** for reading; **Tiro Devanagari Hindi** for Hindi lines.
- Eyebrows: 12px semibold uppercase, 0.16em tracking, brass on dark / teal on paper.

## Interactive pieces (React islands, `src/components/home/`)

| Piece | Library | Notes |
|---|---|---|
| `SizeRings` | NumberFlow, torph | IS 4985 outside diameters 20–400 mm to true scale; pick a size, the wall scales and the readout counts; cycles on its own until someone picks |
| `AudienceMorph` | torph | "Stocked for builders / contractors / …" word morph |
| `Stats` | NumberFlow, Motion `useInView` | real figures count up once when first seen |
| `Globe` | Cobe | turns to Jabalpur and nearby districts; drag to spin; paused off screen |

Library picks follow Emil Kowalski's curated list (`.claude/skills/pick-ui-library`).

## Components

- shadcn/ui (`src/components/ui`): `Button` / `buttonVariants`, `Input`, `Textarea`, `Label`,
  `NativeSelect`. On dark, buttons are brass; on paper, teal.
- Icons: Hugeicons stroke icons, only inside buttons and arrow links.
- `ActionBar.astro`: phone-only Call / Get a quote bar. `Logo.astro`: serif wordmark + Hindi.

## Motion (transitions.dev recipes + morphicons)

| Where | What | Timing |
|---|---|---|
| Brand page accordions | Accordion expand (grid rows 0fr→1fr, chevron flip) | 250ms open / 200ms close |
| Mobile menu | Menu dropdown (scale 0.97→1 + fade from top-right) | 200ms / 150ms |
| Menu button | morphicons: Hugeicons menu ↔ close morph | spring |
| Form errors | Error state shake on invalid fields (message stays until fixed) | 280ms |
| Buttons | press scale 0.97 | 150ms ease-out |
| Section headings (`data-reveal`) | clip-path wipe up + 12px rise, once | 700ms strong ease-in-out |
| Brand marquee | continuous slide, pauses on hover | 48s linear |
| Brand rows, nav links | hairline sweeps in under the row; arrow nudges | 450ms / 250ms ease-out |
| Ordering steps | connecting line draws with scroll (CSS scroll-driven) | scroll |
| Size rings | rings settle in with 45ms stagger; selected wall scales | 600ms / 520ms ease-out |

Everything above turns off under `prefers-reduced-motion`.

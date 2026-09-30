# Design

A trade catalogue, not a startup landing page. The site should feel like a well-run
distributor: calm, dense with real information, quick to act on (call / WhatsApp).

## Principles

- **Precision.** In the spirit of design-led sites like Vitsoe, Teenage Engineering and Apple
  product pages: one idea per screen, one typeface (Geist) set very large or very small, lots of
  space, black ink on warm off-white. It should look engineered and expensive.
- **No boxes.** No cards, chips, tiles, badges or grids of information. Separate things with
  space and the odd hairline; let big type carry hierarchy. Lists are rows or sentences.
- **No fake photos.** Only real photos of the shop, stock and people. Until then, type, the
  pipe-size rings (real IS 4985 sizes) and motion do the work.
- **Teal is the one accent, used sparingly.** Primary buttons (teal pills), links, the logo's outer M, the active pipe dimension and a status dot. Everything else is ink on off-white.
- **Plain words, some Hindi.** Each section carries a short Hindi line (Tiro Devanagari Hindi).
- **Phones first.** 44–52px buttons, a Call / WhatsApp bar pinned to the bottom on phones, 16px
  form text so iOS doesn't zoom.

## Tokens (`src/styles/global.css`)

| Token | Use |
|---|---|
| `background` / `foreground` | warm off-white `#f1f0ec` / ink `#111111` |
| `card` | slightly lighter band for the ordering section |
| `muted-foreground` / `faint` | secondary text `#6b6a64` / faded words (brand sentence, taglines) `#bdbbb4` |
| `border` | hairlines (`.rule-top` draws a section hairline inside the page gutters) |
| `primary` | black: buttons |
| `teal` | `#0b5d63`: primary buttons (`--primary`), links, active detail, status dot |
| `inverse*` | black footer with the full-width wordmark |

## Type

Geist (variable) for everything. Display sizes use `clamp()` with tight tracking
(-0.045em to -0.06em) and leading 0.85–1. No numbered section labels: the heading stands alone, with its Hindi line stacked under it. Only the hero keeps a small label.
No em or en dashes in visible text (use a comma, colon or hyphen). Long lists are separated by space, not a hairline per row.
Hindi: Tiro Devanagari Hindi.

## Interactive pieces (React islands, `src/components/home/`)

| Piece | Library | Notes |
|---|---|---|
| `SizeRings` | NumberFlow, torph | IS 4985 ODs 20–400 mm to scale; ruler of sizes below; cycles until someone picks |
| `AudienceMorph` | torph | "…for builders / contractors / …" word morph |
| `Stats` | NumberFlow, Motion `useInView` | real figures count up once, set as one typographic line |
| `BrandSentence` | — | all brands as one sentence; hover fades the others and crossfades details on the left |
| `Globe` | Cobe | light globe turning to Jabalpur; drag to spin; paused off screen |

## Components

- shadcn/ui (`src/components/ui`): `Button` / `buttonVariants` (teal pill), `Input`, `Textarea`,
  `Label`, `NativeSelect`.
- Icons: Hugeicons, only inside buttons and arrow links.
- `ActionBar.astro`: phone Call / Get a quote bar. `Logo.astro`: woven MM mark + wordmark + Hindi.
- `LogoMark.astro`: the logo, two Ms woven over and under. Inner M in ink (`currentColor`), outer M in teal (`--teal-on-dark` on black). Heavier `weight` at small sizes. The favicons and OG image in `public/assets/` are drawn from the same geometry.
- Homepage: the logo and a full-width "Market Movers" (`.wordmark-top`) sit above the hero. On load the two Ms slide in from above and below and lock together (`LogoMark animate`, `.lm-*`). The whole row shrinks away on scroll while the header logo fades in (scroll-driven CSS in `global.css`). Other pages show the header logo from the start.
- Hero hierarchy: the name is the only giant line. The `<h1>` sits a clear step below it (≈ ⅓ size, medium weight, tail in muted grey) so the two don't compete.
- Primary CTA labels are wrapped in `.roll` so the text rolls up on hover (a text-shadow copy slides in; transform only, fine pointers only). Adapted from ThreeUI's sliding-text CTA.
- Scroll timelines are set through `--tl-view` / `--tl-page` custom properties. Lightning CSS otherwise folds `animation-timeline` into the `animation` shorthand, and browsers drop the whole rule.

## Motion (transitions.dev recipes + morphicons)

| Where | What | Timing |
|---|---|---|
| Brand page accordions | Accordion expand (grid rows 0fr→1fr, chevron flip) | 250ms open / 200ms close |
| Mobile menu | Menu dropdown (scale 0.97→1 + fade from top-right) | 200ms / 150ms |
| Menu button | morphicons: Hugeicons menu ↔ close morph | spring |
| Form errors | Error state shake on invalid fields (message stays until fixed) | 280ms |
| Buttons | press scale 0.97 | 150ms ease-out |
| Headlines (`data-reveal`) | clip-path wipe up, once | 800ms strong ease-in-out |
| Ordering paragraph (`.read-words`) | words go from 16% to full opacity as it scrolls up (CSS scroll-driven) | scroll |
| Brand sentence | other names fade to `faint`; details crossfade | 300ms / 280ms ease-out |
| Product rows, links | row name nudges right; hairline sweeps in | 450ms ease-out |
| Size rings | rings settle in with 45ms stagger; selected wall scales | 600ms / 520ms ease-out |

Everything above turns off under `prefers-reduced-motion`.

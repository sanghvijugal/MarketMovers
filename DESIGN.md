# Design

A trade catalogue, not a startup landing page. The site should feel like a well-run
distributor: calm, dense with real information, quick to act on (call / WhatsApp).

## Principles

- **Content over decoration.** Real specs, sizes, brands and contact details carry the page.
  No stock illustrations, emoji icons, glowing buttons or gradients.
- **Relatable, not corporate.** Speak like the counter: "Ordering takes one message", a sample
  WhatsApp exchange, "What do you need today?" quick links. Ordering on WhatsApp is the main path.
- **Teal, one action colour.** Deep teal (`primary`) marks buttons, links and the current item.
  A small aqua `highlight` is only for the open-now dot and the step numbers on dark. Everything
  else is warm stone text on a faintly cool ground.
- **Soft and fluid.** Pill buttons and chips, 16–28px card radii, headings sized with `clamp()`
  so they scale smoothly between phone and desktop.
- **Phones first.** Most visitors are contractors and retailers on Android phones. Buttons are
  44–52px tall, a Call / WhatsApp bar is pinned to the bottom on phones, and form fields use 16px
  text so iOS doesn't zoom.

## Tokens (`src/styles/global.css`)

| Token | Use |
|---|---|
| `background` / `foreground` | page `#f8faf9` and body text `#1c1917` |
| `muted` / `muted-foreground` | alternate section surface `#ecf2f1` / secondary text |
| `card` | raised surfaces (cards, form, tables) |
| `border` / `input` | hairlines / form field and outline-button borders |
| `primary` | deep teal `#0b6b73`: buttons, links, focus ring |
| `accent` / `accent-foreground` | pale teal / dark teal: chips, the at-a-glance panel, active nav |
| `highlight` | aqua `#5fc4c0`: open-now dot, step numbers on dark only |
| `inverse*` | dark teal sections ("Ordering takes one message") and the footer |

Radius: inputs 10px (`--radius`), cards `rounded-2xl`, big panels and photos `rounded-3xl`,
buttons and chips `rounded-full`. Shadows only on floating layers and hovered/tilted cards.

## Type

IBM Plex Sans (variable) for everything readable, IBM Plex Sans Devanagari for Hindi, and
IBM Plex Mono for small technical labels only: standards (IS 4985), product-line counts, the
open-now status. Headings are semibold; h1 `clamp(2.25rem, 5.2vw, 4rem)`, section h2
`clamp(1.875rem, 3.4vw, 2.75rem)`. Body 15–19px. Don't change letter-spacing.

## Images

- `src/assets/products/*.jpg`: "What we supply" card images, 1200×600 studio renders on a
  teal backdrop (Bath uses dark marble and gold on purpose, as the premium range). Replace
  with real photos at the same 2:1 crop, subject centred.
- `src/assets/home/`: hero pipe wall and shop front, stand-ins until real photos arrive.
- Rendered through `astro:assets` `<Image>` (WebP, responsive `srcset`, width/height set).

## Components

- shadcn/ui (`src/components/ui`): `Button` / `buttonVariants`, `Input`, `Textarea`, `Label`,
  `NativeSelect`.
- Icons: Hugeicons stroke icons at 1.5px stroke, 16–24px.
- `ActionBar.astro`: phone-only Call / Get a quote bar pinned to the bottom.
- The logo (`Logo.astro`) is temporary. Replace it with the real logo; keep the same size.

## Motion (transitions.dev recipes + morphicons)

| Where | What | Timing |
|---|---|---|
| Brand page accordions | Accordion expand (grid rows 0fr→1fr, chevron flip) | 250ms open / 200ms close |
| Mobile menu | Menu dropdown (scale 0.97→1 + fade from top-right) | 200ms / 150ms |
| Menu button | morphicons: Hugeicons menu ↔ close morph | spring |
| Form errors | Error state shake on invalid fields (message stays until fixed) | 280ms |
| Buttons | press scale 0.97 | 150ms ease-out |
| Product cards (mouse) | lean ≤4° toward the pointer on hover, photo shifts opposite; spring back on leave | 160ms follow / 650ms spring |
| Product cards (touch) | ≤2.5° tilt linked to scroll, flat mid-screen (CSS scroll-driven, no JS) | scroll |

Everything above turns off under `prefers-reduced-motion`.

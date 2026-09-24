# Design

A trade catalogue, not a startup landing page. The site should feel like a well-run
distributor: calm, dense with real information, quick to act on (call / WhatsApp).

## Principles

- **Content over decoration.** Real specs, sizes, brands and contact details carry the page.
  No stock illustrations, emoji icons, glowing buttons, gradients or "Why choose us" card walls.
- **One accent.** Cobalt (`--primary`) marks actions, links and the current item. Everything else
  is warm stone neutrals.
- **Space, not lines.** Separate groups with spacing and the occasional hairline border.
  Sections alternate between `background` and `muted` surfaces.
- **Phones first.** Most visitors are contractors and retailers on Android phones. Buttons are
  40–44px tall, primary actions are full-width on mobile, and form fields use 16px text so
  iOS doesn't zoom.

## Tokens (`src/styles/global.css`)

| Token | Use |
|---|---|
| `background` / `foreground` | page and body text (warm off-white / near-black stone) |
| `muted` / `muted-foreground` | alternate section surface / secondary text |
| `card` | raised surfaces (brand cards, form, tables) |
| `border` / `input` | hairlines / form field borders |
| `primary` | cobalt: buttons, links, focus ring, active nav |
| `accent` / `accent-foreground` | pale cobalt: icon tiles, feature chips, active line in brand nav |
| `inverse*` | footer |

Radius is 6px (`--radius: 0.375rem`). Shadows only on floating layers (mobile menu).

## Type

IBM Plex Sans (variable), with IBM Plex Sans Devanagari as the matching Hindi face (loaded
only when a page contains Hindi). Headings are semibold, sized 4xl/5xl (h1), 3xl (section h2),
2xl (product line h2). Body 15–16px. Don't change letter-spacing.

## Components

- shadcn/ui (`src/components/ui`): `Button` / `buttonVariants`, `Input`, `Textarea`, `Label`,
  `NativeSelect`.
- Icons: Hugeicons stroke icons at 1.5px stroke, 16–20px.
- Photo placeholders (`Placeholder.astro`) and the logo (`Logo.astro`) are temporary. Replace
  them with real photos and the real logo; keep the same sizes.

## Motion (transitions.dev recipes + morphicons)

| Where | What | Timing |
|---|---|---|
| Brand page accordions | Accordion expand (grid rows 0fr→1fr, chevron flip) | 250ms open / 200ms close |
| Mobile menu | Menu dropdown (scale 0.97→1 + fade from top-right) | 200ms / 150ms |
| Menu button | morphicons: Hugeicons menu ↔ close morph | spring |
| Form errors | Error state shake on invalid fields (message stays until fixed) | 280ms |
| Buttons | press scale 0.97 | 150ms ease-out |

Everything above turns off under `prefers-reduced-motion`.

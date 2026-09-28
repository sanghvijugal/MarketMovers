# Design

A trade catalogue, not a startup landing page. The site should feel like a well-run
distributor: calm, dense with real information, quick to act on (call / WhatsApp).

## Principles

- **Trade counter, not a startup.** The site should feel like the shop: a painted signboard at the
  top, a ruled rate list of brands, plain words. If a section would look at home on any SaaS
  landing page (stat tiles, icon grids, chips, testimonial-style bubbles, glowing cards), it
  doesn't belong here.
- **No fake photos.** Only real photos of the shop, stock and people. Until they exist, type and
  ruled tables carry the page. Never use renders, stock photos or illustrations.
- **Plain words, some Hindi.** Say it the way the counter would ("Send your list on WhatsApp").
  Section headings carry a short Hindi line (`lang="hi"`); keep the Hindi simple and correct.
- **One signboard colour.** Deep teal (`primary`) for the sign band, buttons and links. Everything
  else is black ink on warm rate-list paper.
- **Rules, not cards.** Separate things with 1px rules and 2px ink rules under section heads.
  Corners are nearly square (4px). The only boxed things are the enquiry form and price-request box.
- **Phones first.** Buttons are 44–52px tall, a Call / WhatsApp bar is pinned to the bottom on
  phones, and form fields use 16px text so iOS doesn't zoom.

## Tokens (`src/styles/global.css`)

| Token | Use |
|---|---|
| `background` / `foreground` | rate-list paper `#f5f2ea` / ink `#1a1917` |
| `card` / `muted` | lighter paper for alternating sections and boxes / darker paper |
| `muted-foreground` | secondary text `#5f5a52` |
| `border` / `rule` | light hairlines / ink rules (section heads, boxes, header) |
| `primary` | signboard teal `#0b5d63`: sign band, buttons, links, focus ring |
| `inverse*` | the signboard band |

## Type

- **Barlow Condensed** (600/700, uppercase) for the wordmark, headings, nav and brand names:
  the painted-sign voice. Sizes use `clamp()` so they scale smoothly.
- **IBM Plex Sans** for everything you read; **IBM Plex Sans Devanagari** for Hindi.
- Small labels (table heads, fact labels) are Plex Sans semibold uppercase with slight tracking.

## Components

- shadcn/ui (`src/components/ui`): `Button` / `buttonVariants`, `Input`, `Textarea`, `Label`,
  `NativeSelect`.
- Icons: Hugeicons stroke icons, sparingly (inside buttons and arrow links only).
- `ActionBar.astro`: phone-only Call / Get a quote bar pinned to the bottom.
- `Logo.astro` is a text wordmark (English + Hindi). Replace with the real logo when there is one.

## Motion (transitions.dev recipes + morphicons)

| Where | What | Timing |
|---|---|---|
| Brand page accordions | Accordion expand (grid rows 0fr→1fr, chevron flip) | 250ms open / 200ms close |
| Mobile menu | Menu dropdown (scale 0.97→1 + fade from top-right) | 200ms / 150ms |
| Menu button | morphicons: Hugeicons menu ↔ close morph | spring |
| Form errors | Error state shake on invalid fields (message stays until fixed) | 280ms |
| Buttons | press scale 0.97 | 150ms ease-out |

Everything above turns off under `prefers-reduced-motion`.

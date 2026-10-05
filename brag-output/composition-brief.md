# Hyperframes Composition Brief: Market Movers

## Objective
Create a short launch-style brag video for Market Movers (marketmovers.co.in).

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape, 1920x1080, 30fps
- Duration: 25s

## Source Material
- Project root: repository root (Astro site)
- Primary files read: `src/pages/index.astro`, `src/data/site.ts`, `src/data/brands/*.json`, `src/components/LogoMark.astro`, `src/components/home/SizeRings.tsx`, `src/components/home/Stats.tsx`, `src/styles/global.css`, `DESIGN.md`
- Product name: Market Movers
- Tagline / strongest claim: "Pipes, fittings and sanitaryware, from stock."
- Key UI to recreate: the woven MM logo (same geometry as `LogoMark.astro`), glass panels over photo frames, the IS 4985 size rings, the count-up figures, the brand index with teal markers, the three ordering steps.
- Copy that must appear verbatim:
  - Wholesale distributor in Marhatal, Jabalpur
  - Pipes, fittings and sanitaryware, from stock.
  - Ready stock, so your site never waits on a factory.
  - products in stock at the godown / brands on our shelves / product lines with full specifications online
  - Ten brands in stock at our Marhatal counter.
  - Send the list. We'll handle the rest.
  - Send your list / Get rates the same day / Pick up or we deliver
  - WhatsApp your list
  - +91 94250 66923, marketmovers.co.in

## Creative Direction
- Tone preset: polished
- Creative direction: quiet, premium trade film with one continuous flow
- Interpretation: long holds, match-cut transitions (logo to header, pipe end to rings, ring to coil, header back to logo), no hard cuts.
- Angle: see `brag-plan.md`.
- Hook: the two Ms lock together, then the name wipes out full width.
- Outro: logo, "WhatsApp your list" pill, phone and URL.
- Avoid: generic SaaS language, abstract filler, em or en dashes in visible text (site rule), more than one "·" per line, invented claims or prices.

## Visual Identity
- Background: #f4f4f2; card #fafaf9
- Text: #111111; muted #62625e
- Accent: #0b5d63 (teal), on-dark #5aa9ae
- Display/body font: Geist variable (`assets/fonts/geist.woff2`), Hindi in IBM Plex Sans Devanagari (`assets/fonts/plex-hi.woff2`)
- Visual references: photos `pipe-stack.jpg`, `hdpe-coil.jpg`, `counter.jpg`; 24px-radius frames; frosted glass panels (`rgb(250 250 249 / .62)` tint, white edge, soft shadow); full pill buttons.

## Storyboard
Use `brag-plan.md` as the creative contract.
1. Logo lock, 0 to 3.3s
2. From stock, 3.3 to 7.6s
3. Every size, 7.6 to 11s
4. Ready stock, 11 to 15.3s
5. Brands we stock, 15.3 to 18.6s
6. Send the list, 18.6 to 22.9s
7. Outro, 22.9 to 25s

## Audio
- Audio role: warm bed with sparse accents
- Music: `assets/music/happy-beats-business-moves-vol-12-by-ende-dot-app.mp3`, volume 0.35, fade out over the last 1.5s
- Music cue guidance: `~/.claude/skills/brag/assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json`; lock 8.74s (ring sweep) and 22.93s (outro logo landing); beat grid for the four figures.
- Audio-reactive treatment: subtle teal glow behind frames, driven by precomputed RMS.
- SFX: soft impacts for logo lock and reveals, drop for panels, low-risk clicks and keypresses for the chat, one bell for the final logo. All low or medium HF risk.

## Hyperframes Instructions
Built with the `hyperframes-core`, `hyperframes-animation`, `hyperframes-creative`, `hyperframes-keyframes` and `hyperframes-cli` skills. Single paused GSAP timeline (local `assets/js/gsap.min.js`, since the CDN is blocked here). `npx hyperframes check` must pass before render. Everything local.

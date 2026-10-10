# Brag Plan: Market Movers Navratri greeting (vertical, energetic)

- Format: 1080x1920, 30fps, 16.5s
- Sound: no music bed yet (the composed garba track was dropped). Only the soft dandiya clacks on the stick hits and colour cuts and the bell at 9.45 remain; add a licensed garba track before posting.
- Drawn in code (no stock): marigold toran, dandiya sticks with mirror bands and sparks, rangoli mandala, diyas

| Time | Scene |
|---|---|
| 0 to 2.5 | toran drops; dandiya sticks clack on 0.5 / 1.0 / 1.5; "शुभ नवरात्रि" slams on 1.0; "Happy Navratri" |
| 2.5 to 4.5 | rangoli blooms on teal |
| 4.5 to 9 | nine colours, one per beat (no heading or counter): product photos tinted orange, white, red, blue, yellow, green, grey, purple, peacock green (Navratri photo slots go here once downloaded) |
| 9 to 12.5 | the woven MM mark locks inside the rangoli; "मार्केट मूवर्स परिवार की ओर से / नवरात्रि की हार्दिक शुभकामनाएँ" |
| 12.5 to 16.5 | end card with diyas: Market Movers, शुभ नवरात्रि, Marhatal, Jabalpur, marketmovers.co.in |

Draft: online Navratri photos not added yet (image libraries blocked by the environment's network policy).

- Paint wipes (p5.brush 2.2.3, MIT): at each cut (2.5, 4.5, 9.0, 12.5s) a two-layer torn-paper band (`brush.wash` with a hand-torn edge, plus crayon and charcoal strokes) sweeps up over 0.6s and covers the screen on the cut frame. Drawn per frame on a transparent WEBGL canvas with fixed seeds, so every render is identical; the canvas is hidden between wipes.

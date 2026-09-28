import * as React from "react";
import NumberFlow from "@number-flow/react";
import { TextMorph } from "torph/react";

// Pipe outside diameters (mm) from the IS 4985 series, drawn to true
// relative scale. Pick a size to see what it is usually used for.
const SIZES = [20, 25, 32, 40, 50, 63, 75, 90, 110, 140, 160, 200, 250, 315, 400] as const;
type Size = (typeof SIZES)[number];

const USE: Record<Size, string> = {
  20: "House plumbing: taps and bathrooms",
  25: "House plumbing: taps and bathrooms",
  32: "House plumbing: main supply lines",
  40: "Plumbing risers and garden lines",
  50: "Plumbing risers and garden lines",
  63: "Farm lines and sprinkler laterals",
  75: "Waste lines and farm mains",
  90: "Farm and irrigation mains",
  110: "Soil and waste drainage, farm mains",
  140: "Irrigation and water mains",
  160: "Irrigation and water mains",
  200: "Water supply mains",
  250: "Water supply mains",
  315: "Large mains and sewerage",
  400: "Large mains and sewerage",
};

const R_MAX = 200; // 400 mm → 200 px radius in a 440 px box
const radius = (od: number) => (od / 400) * R_MAX;
const CYCLE_MS = 2200;

export default function SizeRings() {
  const [size, setSize] = React.useState<Size>(110);
  const [auto, setAuto] = React.useState(true);

  // Walk through the sizes on its own until someone picks one.
  React.useEffect(() => {
    if (!auto) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      setSize((s) => SIZES[(SIZES.indexOf(s) + 1) % SIZES.length]);
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, [auto]);

  const pick = (s: Size) => {
    setAuto(false);
    setSize(s);
  };

  const r = radius(size);

  return (
    <figure className="m-0 flex flex-col items-center gap-6">
      <div className="relative w-full max-w-[460px]">
        <svg viewBox="0 0 440 440" className="block w-full" aria-hidden="true">
          {/* crosshair and scale ticks, like a drawing sheet */}
          <g stroke="var(--brass)" strokeOpacity="0.25" strokeWidth="1">
            <line x1="220" y1="6" x2="220" y2="434" />
            <line x1="6" y1="220" x2="434" y2="220" />
          </g>
          {SIZES.map((s, i) => (
            <circle
              key={s}
              cx="220"
              cy="220"
              r={radius(s)}
              fill="none"
              className="ring"
              style={{ animationDelay: `${120 + i * 45}ms` }}
              stroke="var(--brass)"
              strokeWidth={s === size ? 2.5 : 1}
              strokeOpacity={s === size ? 1 : 0.3}
            />
          ))}
          {/* the selected pipe's wall: one circle drawn at full size and
              scaled, so changing size is a transform transition */}
          <g className="scaler" style={{ transform: `scale(${r / R_MAX})` }}>
            <circle cx="220" cy="220" r={R_MAX * 0.935} fill="none" stroke="var(--brass)" strokeOpacity="0.2" strokeWidth={R_MAX * 0.13} />
            <line x1={220 - R_MAX} y1="220" x2={220 + R_MAX} y2="220" stroke="var(--brass)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          </g>
          {/* wide invisible strokes so rings are easy to hover or tap */}
          {SIZES.map((s) => (
            <circle
              key={`hit-${s}`}
              cx="220"
              cy="220"
              r={radius(s)}
              fill="none"
              stroke="transparent"
              strokeWidth="7"
              style={{ pointerEvents: "stroke", cursor: "pointer" }}
              onPointerEnter={(e) => e.pointerType === "mouse" && pick(s)}
              onClick={() => pick(s)}
            />
          ))}
        </svg>
        <figcaption className="pointer-events-none absolute inset-x-0 bottom-[4%] text-center">
          <span className="font-display text-[clamp(2.5rem,6vw,3.75rem)] leading-none text-inverse-foreground">
            <NumberFlow value={size} />
            <span className="ml-1 text-[0.45em] text-inverse-muted">mm</span>
          </span>
        </figcaption>
      </div>

      <div className="w-full max-w-[460px] text-center">
        <p className="min-h-[1.5em] text-[15px] text-inverse-muted" aria-live="polite">
          <TextMorph>{USE[size]}</TextMorph>
        </p>
        <div role="radiogroup" aria-label="Pipe outside diameter" className="mt-4 flex flex-wrap justify-center gap-1">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={s === size}
              onClick={() => pick(s)}
              className="size-btn h-8 min-w-10 rounded px-1.5 text-[13px] font-medium tabular-nums text-inverse-muted transition-[background-color,color] duration-150 hover:text-inverse-foreground aria-checked:bg-brass aria-checked:text-inverse"
            >
              {s}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-inverse-muted/80">Outside diameters to scale, 20 to 400 mm (IS 4985 series). Pick one.</p>
      </div>
    </figure>
  );
}

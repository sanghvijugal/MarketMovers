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
    <figure className="m-0 w-full">
      <svg viewBox="0 0 440 440" className="block w-full" aria-hidden="true">
        {SIZES.map((s, i) => (
          <circle
            key={s}
            cx="220"
            cy="220"
            r={radius(s)}
            fill="none"
            className="ring"
            style={{ animationDelay: `${120 + i * 45}ms` }}
            stroke="currentColor"
            strokeWidth={s === size ? 2 : 0.75}
            strokeOpacity={s === size ? 1 : 0.4}
          />
        ))}
        {/* selected wall + dimension line: drawn at full size and scaled,
            so changing size is a transform transition */}
        <g className="scaler" style={{ transform: `scale(${r / R_MAX})` }}>
          <circle cx="220" cy="220" r={R_MAX * 0.935} fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth={R_MAX * 0.13} />
          <line x1={220 - R_MAX} y1="220" x2={220 + R_MAX} y2="220" stroke="var(--teal)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </g>
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

      <figcaption className="mt-5 flex flex-col gap-2 border-b sm:flex-row sm:items-end sm:justify-between sm:gap-6 border-foreground pb-3">
        <span className="text-[clamp(2.5rem,4vw,3.5rem)] leading-none font-medium tracking-[-0.045em] tabular-nums">
          <NumberFlow value={size} />
          <span className="ml-1 text-base tracking-normal text-muted-foreground">mm</span>
        </span>
        <span className="pb-1 text-[16px] sm:text-right sm:text-[14px] text-muted-foreground" aria-live="polite">
          <TextMorph>{USE[size]}</TextMorph>
        </span>
      </figcaption>

      <div role="radiogroup" aria-label="Pipe outside diameter, mm" className="mt-2 grid grid-cols-8 text-center text-[14px] tabular-nums sm:grid-cols-[repeat(15,minmax(0,1fr))] sm:text-[12px]">
        {SIZES.map((s) => (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={s === size}
            onClick={() => pick(s)}
            className="min-h-9 text-faint transition-colors duration-150 hover:text-foreground aria-checked:font-semibold aria-checked:text-foreground"
          >
            {s}
          </button>
        ))}
      </div>
      <p className="mt-1 text-[14px] sm:text-[12px] text-muted-foreground">Outside diameters to scale, IS 4985 series. Pick one.</p>
    </figure>
  );
}

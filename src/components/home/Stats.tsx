import * as React from "react";
import NumberFlow from "@number-flow/react";
import { useInView } from "motion/react";

interface Stat { value: number; suffix?: string; label: string }

// Figures count up once, the first time the row scrolls into view.
export default function Stats({ stats }: { stats: Stat[] }) {
  const ref = React.useRef<HTMLDListElement>(null);
  const seen = useInView(ref, { once: true, margin: "-80px" });
  return (
    <dl ref={ref} className="grid grid-cols-2 gap-y-10 lg:grid-cols-4">
      {stats.map((s, i) => (
        <div key={s.label} className="border-l border-brass-soft pl-5 sm:pl-7">
          <dt className="sr-only">{s.label}</dt>
          <dd className="font-display text-[clamp(3rem,6vw,5rem)] leading-none text-inverse-foreground tabular-nums">
            <NumberFlow value={seen ? s.value : 0} format={{ useGrouping: true }} transformTiming={{ duration: 1100 + i * 150, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }} spinTiming={{ duration: 1100 + i * 150, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }} />
            {s.suffix && <span className="text-brass">{s.suffix}</span>}
          </dd>
          <dd className="mt-3 max-w-[14rem] text-[15px] text-inverse-muted">{s.label}</dd>
        </div>
      ))}
    </dl>
  );
}

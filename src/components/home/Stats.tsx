import * as React from "react";
import NumberFlow from "@number-flow/react";
import { useInView } from "motion/react";

interface Stat { value: number; suffix?: string; label: string }

// Real figures set as one line of big numbers; they count up once, the
// first time the line scrolls into view.
export default function Stats({ stats }: { stats: Stat[] }) {
  const ref = React.useRef<HTMLDListElement>(null);
  const seen = useInView(ref, { once: true, margin: "-80px" });
  return (
    <dl ref={ref} className="flex flex-wrap gap-x-16 gap-y-10">
      {stats.map((s, i) => (
        <div key={s.label} className="flex flex-col">
          <dt className="order-2 mt-3 max-w-[13rem] text-[16px] sm:text-[14px] leading-snug text-muted-foreground">{s.label}</dt>
          <dd className="order-1 text-[clamp(3.5rem,7vw,6.5rem)] leading-[0.85] font-medium tracking-[-0.055em] tabular-nums">
            <NumberFlow
              value={seen ? s.value : 0}
              format={{ useGrouping: true }}
              transformTiming={{ duration: 1100 + i * 150, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }}
              spinTiming={{ duration: 1100 + i * 150, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }}
            />
            {s.suffix && <span className="text-teal">{s.suffix}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

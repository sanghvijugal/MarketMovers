import * as React from "react";

interface Brand { name: string; slug?: string; from?: string; stock?: string; lines?: number }

// All ten brands set as one sentence. Hover (or focus) a name and it comes
// forward while the rest fade back; the panel on the left morphs to that
// brand's details (a short keyed crossfade). On touch screens each name is simply a link.
export default function BrandSentence({ brands, askHref }: { brands: Brand[]; askHref: string }) {
  const [active, setActive] = React.useState<number | null>(null);
  const b = active === null ? null : brands[active];

  const title = b ? b.name : "Ten manufacturers, one counter.";
  const body = b
    ? b.slug
      ? `${b.stock}. ${b.from}.`
      : "Also in stock. The catalogue isn't online yet; ask us for sizes and rates."
    : "Each name opens its full catalogue, with sizes and specifications.";
  const cta = b ? (b.slug ? `${b.lines} product lines →` : "Ask on WhatsApp →") : "";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16" onPointerLeave={() => setActive(null)}>
      <div className="hidden lg:block">
        <div className="sticky top-32 min-h-[14rem]" aria-live="polite">
          <p key={`t${active}`} className="fade-in text-[22px] leading-tight font-medium tracking-[-0.02em]">{title}</p>
          {/* longer text crossfades (keyed) instead of morphing, so it wraps */}
          <p key={`b${active}`} className="fade-in mt-3 text-[19px] sm:text-[15px] leading-relaxed text-muted-foreground">{body}</p>
          {cta && <p key={`c${active}`} className="fade-in mt-4 text-[19px] sm:text-[15px] font-medium text-teal">{cta}</p>}
        </div>
      </div>
      <p className="text-[clamp(3rem,8.4vw,7.5rem)] leading-[0.98] font-semibold tracking-[-0.05em]">
        {brands.map((br, i) => {
          const dim = active !== null && active !== i;
          const cls = `transition-colors duration-300 ${dim ? "text-faint" : "text-foreground"}`;
          const sep = i < brands.length - 1 ? ", " : ".";
          const on = { onPointerEnter: () => setActive(i), onFocus: () => setActive(i), onBlur: () => setActive(null) };
          return (
            <React.Fragment key={br.name}>
              {br.slug ? (
                <a href={`/${br.slug}.html`} className={`${cls} rounded-sm outline-offset-4`} {...on}>
                  {br.name}
                </a>
              ) : (
                <a href={askHref} target="_blank" rel="noopener" className={`${cls} rounded-sm outline-offset-4`} {...on}>
                  {br.name}
                </a>
              )}
              <span className={dim ? "text-faint transition-colors duration-300" : "transition-colors duration-300"}>{sep}</span>
            </React.Fragment>
          );
        })}
      </p>
    </div>
  );
}

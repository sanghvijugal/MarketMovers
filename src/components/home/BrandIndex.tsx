import * as React from "react";

interface Brand { name: string; slug?: string; from?: string; stock?: string; lines?: number }

// Brands as an index, one per line, in two groups: brands with a catalogue on
// this site, and brands we stock without one. On desktop a panel beside the
// list shows the selected brand (hover or focus a name; Finolex to start). On
// phones each catalogue brand shows its details inline, so nothing depends on hover.
export default function BrandIndex({ brands, askHref }: { brands: Brand[]; askHref: string }) {
  const online = brands.filter((b) => b.slug);
  const other = brands.filter((b) => !b.slug);
  const [active, setActive] = React.useState(0);
  // Names only dim while the pointer or focus is in the list, so at rest every name reads.
  const [engaged, setEngaged] = React.useState(false);
  const b = brands[active];

  const select = (i: number) => ({
    onPointerEnter: () => setActive(i),
    onFocus: () => setActive(i),
  });
  const tone = (i: number) =>
    `transition-colors duration-300 ${engaged && active !== i ? "lg:text-muted-foreground" : "text-foreground"}`;

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-20">
      <div
        onPointerEnter={() => setEngaged(true)}
        onPointerLeave={() => setEngaged(false)}
        onFocus={() => setEngaged(true)}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setEngaged(false)}
      >
        <h3 className="text-[19px] sm:text-[15px] font-medium text-muted-foreground">Catalogues online</h3>
        <ul className="mt-6 space-y-8 lg:space-y-3">
          {online.map((br) => {
            const i = brands.indexOf(br);
            return (
              <li key={br.name}>
                <a
                  href={`/${br.slug}.html`}
                  className={`block rounded-md text-[clamp(2.25rem,4.4vw,4rem)] leading-[1.02] font-semibold tracking-[-0.045em] outline-offset-4 ${tone(i)}`}
                  {...select(i)}
                >
                  {br.name}
                </a>
                {/* phones: details inline */}
                <p className="mt-2 text-[19px] leading-relaxed text-muted-foreground lg:hidden">{br.stock}. {br.from}.</p>
                <a href={`/${br.slug}.html`} className="mt-2 inline-block text-[19px] font-medium text-teal lg:hidden">
                  {br.lines} product lines →
                </a>
              </li>
            );
          })}
        </ul>

        <h3 className="mt-14 text-[19px] sm:text-[15px] font-medium text-muted-foreground">Also in stock</h3>
        <ul className="mt-5 grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3">
          {other.map((br) => {
            const i = brands.indexOf(br);
            return (
              <li key={br.name}>
                <a
                  href={askHref}
                  target="_blank"
                  rel="noopener"
                  className={`rounded-md text-[clamp(1.5rem,2.2vw,2rem)] leading-tight font-semibold tracking-[-0.035em] outline-offset-4 ${tone(i)}`}
                  {...select(i)}
                >
                  {br.name}
                </a>
              </li>
            );
          })}
        </ul>
        <a href={askHref} target="_blank" rel="noopener" className="mt-5 inline-block text-[19px] sm:text-[15px] font-medium text-teal">
          Ask for their rates on WhatsApp →
        </a>
      </div>

      {/* desktop: details of the selected brand */}
      <div className="hidden lg:block">
        <div className="sticky top-32 border-t border-border pt-8" aria-live="polite">
          <p key={`n${active}`} className="fade-in text-[clamp(2rem,3vw,2.75rem)] leading-tight font-semibold tracking-[-0.04em]">{b.name}</p>
          {b.slug ? (
            <>
              <p key={`f${active}`} className="fade-in mt-2 text-[15px] text-muted-foreground">{b.from}</p>
              <p key={`s${active}`} className="fade-in mt-6 max-w-[40ch] text-[17px] leading-relaxed">{b.stock}.</p>
              <a key={`c${active}`} href={`/${b.slug}.html`} className="fade-in mt-6 inline-block text-[17px] font-medium text-teal">
                See all {b.lines} product lines →
              </a>
            </>
          ) : (
            <>
              <p key={`s${active}`} className="fade-in mt-6 max-w-[40ch] text-[17px] leading-relaxed">
                In stock at the counter. The catalogue isn't online yet, so ask us for sizes and rates.
              </p>
              <a key={`c${active}`} href={askHref} target="_blank" rel="noopener" className="fade-in mt-6 inline-block text-[17px] font-medium text-teal">
                Ask on WhatsApp →
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

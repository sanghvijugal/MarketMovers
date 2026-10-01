import * as React from "react";

interface Brand { name: string; slug?: string; from?: string; stock?: string; lines?: number }
interface Category { id: string; name: string; text: string; brands: readonly string[] }

type Focus = { kind: "brand"; name: string } | { kind: "product"; id: string };

// Brands and products as one index. Brands lead (big names); the product chips
// below are the other way in. The two are linked: point at a brand and the
// products it makes light up; point at (or tap) a product and only the brands
// that make it stay bright. On desktop one panel shows whichever was picked
// last, so moving between a brand and a product is a single crossfade.
export default function StockIndex({
  brands,
  categories,
  askHref,
  whatsapp,
}: {
  brands: Brand[];
  categories: Category[];
  askHref: string;
  whatsapp: string;
}) {
  const online = brands.filter((b) => b.slug);
  const other = brands.filter((b) => !b.slug);
  // "brands: []" means every brand (fittings)
  const makes = (c: Category, name: string) => c.brands.length === 0 || c.brands.includes(name);
  const productsOf = (name: string) => categories.filter((c) => c.brands.length > 0 && c.brands.includes(name));

  const [pinned, setPinned] = React.useState<string | null>(null); // a tapped product
  const [hover, setHover] = React.useState<Focus | null>(null);
  const focus: Focus = hover ?? (pinned ? { kind: "product", id: pinned } : { kind: "brand", name: online[0].name });

  const product = focus.kind === "product" ? categories.find((c) => c.id === focus.id)! : null;
  const brand = focus.kind === "brand" ? brands.find((b) => b.name === focus.name)! : null;

  // Only dim while someone is actually pointing at or has picked something.
  const active = hover !== null || pinned !== null;
  const brandLit = (name: string) =>
    !active || (brand ? brand.name === name : makes(product!, name));
  const chipLit = (c: Category) =>
    !active || (product ? product.id === c.id : brand ? makes(c, brand.name) && c.brands.length > 0 : true);

  const on = (f: Focus) => ({
    onPointerEnter: (e: React.PointerEvent) => e.pointerType === "mouse" && setHover(f),
    onPointerLeave: (e: React.PointerEvent) => e.pointerType === "mouse" && setHover(null),
    onFocus: () => setHover(f),
    onBlur: () => setHover(null),
  });

  const ask = (text: string) => `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`;

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-20">
      <div>
        <h3 className="text-[19px] sm:text-[15px] font-medium text-muted-foreground">Catalogues online</h3>
        <ul className="mt-5 space-y-3 lg:space-y-2">
          {online.map((b) => (
            <li key={b.name} className={`dim ${brandLit(b.name) ? "" : "is-dim"}`}>
              <a
                href={`/${b.slug}.html`}
                className="group flex items-baseline justify-between gap-4 rounded-md outline-offset-4"
                {...on({ kind: "brand", name: b.name })}
              >
                <span className="relative">
                  <span aria-hidden className={`mark ${active && brandLit(b.name) && product ? "is-on" : ""}`} />
                  <span className="text-[clamp(2.25rem,4.4vw,4rem)] leading-[1.04] font-semibold tracking-[-0.045em]">{b.name}</span>
                </span>
                <span className="shrink-0 text-[17px] sm:text-[15px] font-medium text-teal lg:hidden">{b.lines} lines →</span>
              </a>
            </li>
          ))}
        </ul>

        <h3 className="mt-10 text-[19px] sm:text-[15px] font-medium text-muted-foreground">Also in stock</h3>
        <ul className="mt-4 flex flex-wrap gap-x-7 gap-y-1">
          {other.map((b) => (
            <li key={b.name} className={`dim ${brandLit(b.name) ? "" : "is-dim"}`}>
              <a
                href={ask(`Hello Market Movers, I'd like rates for ${b.name}.`)}
                target="_blank"
                rel="noopener"
                className="relative block rounded-md text-[clamp(1.5rem,2.2vw,2rem)] leading-tight font-semibold tracking-[-0.035em] outline-offset-4"
                {...on({ kind: "brand", name: b.name })}
              >
                <span aria-hidden className={`mark mark-sm ${active && brandLit(b.name) && product ? "is-on" : ""}`} />
                {b.name}
              </a>
            </li>
          ))}
        </ul>

        {/* Products: the other way in. The nav's "Products" link lands here. */}
        <div id="products" className="mt-14 scroll-mt-28 border-t border-border pt-10">
          <h3 className="text-[19px] sm:text-[15px] font-medium text-muted-foreground">Or find by product</h3>
          <ul className="mt-5 flex flex-wrap gap-2 sm:gap-2.5">
            {categories.map((c) => {
              const isPinned = pinned === c.id;
              return (
                <li key={c.id} className={`dim ${chipLit(c) ? "" : "is-dim"}`}>
                  <button
                    type="button"
                    aria-pressed={isPinned}
                    onClick={() => setPinned(isPinned ? null : c.id)}
                    className="chip relative rounded-full border border-border px-3.5 py-2 text-[16px] sm:px-4 sm:py-2.5 sm:text-[15px] font-medium"
                    data-lit={active && chipLit(c) && (brand !== null || isPinned) ? "" : undefined}
                    {...on({ kind: "product", id: c.id })}
                  >
                    <span className="chip-fill" aria-hidden />
                    <span className="relative">{c.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* phones: the tapped product's details, inline */}
          <div className="lg:hidden" aria-live="polite">
            {pinned && (() => {
              const c = categories.find((x) => x.id === pinned)!;
              return (
                <div key={c.id} className="fade-in mt-6 rounded-md bg-card p-5">
                  <p className="text-[19px] leading-relaxed">{c.text}</p>
                  <p className="mt-2 text-[17px] text-muted-foreground">
                    {c.brands.length ? `${c.brands.join(", ")}` : "All brands"}
                  </p>
                  <a href={ask(`Hello Market Movers, I'd like rates for ${c.name}.`)} target="_blank" rel="noopener" className="mt-3 inline-block text-[17px] font-medium text-teal">
                    Ask for rates on WhatsApp →
                  </a>
                </div>
              );
            })()}
          </div>

          <p className="mt-8 text-[19px] sm:text-[17px]">
            Something else?{" "}
            <a href={askHref} target="_blank" rel="noopener" className="font-medium text-teal">Ask us on WhatsApp →</a>
          </p>
        </div>
      </div>

      {/* desktop: one panel for whichever brand or product was picked last */}
      <div className="hidden lg:block">
        <div className="sticky top-32 border-t border-border pt-8" aria-live="polite">
          {brand ? (
            <div key={`b-${brand.name}`} className="fade-in">
              <p className="text-[13px] font-medium tracking-wide text-muted-foreground uppercase">Brand</p>
              <p className="mt-2 text-[clamp(2rem,3vw,2.75rem)] leading-tight font-semibold tracking-[-0.04em]">{brand.name}</p>
              {brand.from && <p className="mt-1 text-[15px] text-muted-foreground">{brand.from}</p>}
              <p className="mt-5 max-w-[40ch] text-[17px] leading-relaxed">
                {brand.stock ? `${brand.stock}.` : "In stock at the counter. The catalogue isn't online yet, so ask us for sizes and rates."}
              </p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {productsOf(brand.name).map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setPinned(c.id)}
                      className="rounded-full bg-card px-3 py-1.5 text-[14px] font-medium"
                    >
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
              <a
                href={brand.slug ? `/${brand.slug}.html` : ask(`Hello Market Movers, I'd like rates for ${brand.name}.`)}
                target={brand.slug ? undefined : "_blank"}
                rel={brand.slug ? undefined : "noopener"}
                className="mt-6 inline-block text-[17px] font-medium text-teal"
              >
                {brand.slug ? `See all ${brand.lines} product lines →` : "Ask on WhatsApp →"}
              </a>
            </div>
          ) : (
            <div key={`p-${product!.id}`} className="fade-in">
              <p className="text-[13px] font-medium tracking-wide text-muted-foreground uppercase">Product</p>
              <p className="mt-2 text-[clamp(2rem,3vw,2.75rem)] leading-tight font-semibold tracking-[-0.04em]">{product!.name}</p>
              <p className="mt-5 max-w-[40ch] text-[17px] leading-relaxed">{product!.text}</p>
              <p className="mt-5 text-[15px] text-muted-foreground">
                {product!.brands.length ? `From ${product!.brands.length} brands, lit on the left` : "Across all our brands"}
              </p>
              <a
                href={ask(`Hello Market Movers, I'd like rates for ${product!.name}.`)}
                target="_blank"
                rel="noopener"
                className="mt-6 inline-block text-[17px] font-medium text-teal"
              >
                Ask for rates on WhatsApp →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

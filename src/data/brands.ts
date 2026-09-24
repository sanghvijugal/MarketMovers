// Brand catalogue content lives in src/data/brands/<slug>.json, one file per
// brand page. Adding a JSON file here (and a `slug` in site.ts) adds a page.

export type Cell = string | { v: string; span: number };

export type Block =
  | { type: "heading"; text: string }
  | { type: "text"; html: string; note?: boolean }
  | { type: "list"; items: string[] }
  | { type: "chips"; kind: "features" | "items"; items: string[] }
  | { type: "table"; header: Cell[] | null; rows: Cell[][]; label?: string }
  | { type: "series"; items: { name: string; text: string }[] }
  | { type: "link"; label: string; href: string; kind: "pdf" | "page" }
  | { type: "image"; src: string; alt: string };

export interface ProductItem {
  name: string;
  std: string;
  blocks: Block[];
}

export interface ProductLine {
  id: string;
  name: string;
  series: string;
  tag: string;
  sections: { title: string; blocks: Block[] }[];
  products: { title: string; intro?: Block[]; items: ProductItem[] }[];
}

export interface Brand {
  slug: string;
  name: string;
  tagline: string;
  origin: string;
  badges: string[];
  about: string;
  seo: { title: string; description: string };
  lines: ProductLine[];
}

const files = import.meta.glob<Brand>("./brands/*.json", { eager: true, import: "default" });

export const brandPages: Brand[] = Object.values(files).sort((a, b) => a.name.localeCompare(b.name));

export function getBrand(slug: string) {
  return brandPages.find((b) => b.slug === slug);
}

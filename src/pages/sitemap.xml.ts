import type { APIRoute } from "astro";
import { execFileSync } from "node:child_process";
import { brandPages } from "@/data/brands";
import { SITE_URL } from "@/data/site";

// <lastmod> is the date of the last commit that changed the page's content,
// so it only moves when something a visitor would notice changes.
function lastmod(files: string[]): string | undefined {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cs", "--", ...files], { encoding: "utf8" }).trim();
    return out || undefined;
  } catch {
    return undefined;
  }
}

export const GET: APIRoute = () => {
  const pages = [
    { loc: `${SITE_URL}/`, files: ["src/pages/index.astro", "src/data/site.ts"] },
    ...brandPages.map((b) => ({ loc: `${SITE_URL}/${b.slug}.html`, files: [`src/data/brands/${b.slug}.json`] })),
  ];
  const urls = pages
    .map(({ loc, files }) => {
      const mod = lastmod(files);
      return `  <url>\n    <loc>${loc}</loc>${mod ? `\n    <lastmod>${mod}</lastmod>` : ""}\n  </url>`;
    })
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
};

#!/usr/bin/env python3
"""SEO checks for the built Market Movers site. Standard library only.

    npm run build                  # builds into dist/ and runs `check`
    python3 tools/seo.py check     # fail if any built page breaks the SEO rules
    python3 tools/seo.py links     # check that external links still resolve

Every *.html file in dist/ is treated as a public page, except the ones in
NOT_PAGES. CI (.github/workflows/deploy.yml) runs `check` on every push and
`links` weekly.
"""
import json
import re
import sys
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urldefrag, urlparse

REPO = Path(__file__).resolve().parent.parent
ROOT = REPO / "dist"  # the built site
SITE = "https://" + (REPO / "public" / "CNAME").read_text().strip()
NOT_PAGES = {"404.html"}  # served by GitHub Pages but must not be indexed

TITLE_MAX = 60
DESC_MIN, DESC_MAX = 50, 160
# alt text that is really an id or file name, e.g. "panel-cpvc", "IMG_123.png"
PLACEHOLDER_ALT = re.compile(r"^(panel|img|image|photo|pic|picture)[-_ ]?\w*$|\.(png|jpe?g|webp|gif|svg)$", re.I)


def pages():
    return sorted(p for p in ROOT.glob("*.html") if p.name not in NOT_PAGES)


def page_url(path):
    return SITE + "/" if path.name == "index.html" else f"{SITE}/{path.name}"


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.lang = None
        self.titles, self.metas, self.links, self.imgs = [], [], [], []
        self.headings, self.anchors, self.ids, self.srcs = [], [], set(), []
        self.jsonld = []
        self._text = None      # collecting text for: title / h1-h6 / json-ld
        self._buf = []
        self.feed(path.read_text(encoding="utf-8"))

    def handle_starttag(self, tag, attrs):
        a = {k: (v or "") for k, v in attrs}
        if "id" in a:
            self.ids.add(a["id"])
        if tag == "html":
            self.lang = a.get("lang")
        elif tag == "title":
            self._start("title")
        elif re.fullmatch(r"h[1-6]", tag):
            self._start(tag)
        elif tag == "meta":
            self.metas.append(a)
        elif tag == "link":
            self.links.append(a)
            if a.get("href"):
                self.srcs.append(a["href"])
        elif tag == "img":
            self.imgs.append(a)
        elif tag == "a" and "href" in a:
            self.anchors.append(a)
        elif tag == "script":
            if a.get("type") == "application/ld+json":
                self._start("ld")
        if tag in ("img", "script", "iframe", "source") and a.get("src"):
            self.srcs.append(a["src"])

    def _start(self, kind):
        self._text, self._buf = kind, []

    def handle_data(self, data):
        if self._text:
            self._buf.append(data)

    def handle_endtag(self, tag):
        kind = self._text
        if kind and (tag == kind or (kind == "ld" and tag == "script")):
            text = "".join(self._buf)
            if kind == "title":
                self.titles.append(text.strip())
            elif kind == "ld":
                self.jsonld.append(text)
            else:
                self.headings.append((int(kind[1]), " ".join(text.split())))
            self._text = None

    def meta(self, key, value):
        return [m.get("content", "") for m in self.metas if m.get(key, "").lower() == value]

    def link_rel(self, rel):
        return [l.get("href", "") for l in self.links if rel in l.get("rel", "").lower().split()]


# ── checks ─────────────────────────────────────────────────────────────────

def check():
    errors, warnings = [], []
    parsed = {p.name: Page(p) for p in pages()}
    seen_titles, seen_descs, inbound = {}, {}, {name: 0 for name in parsed}

    for name, pg in parsed.items():
        def err(msg): errors.append(f"{name}: {msg}")
        def warn(msg): warnings.append(f"{name}: {msg}")
        url = page_url(pg.path)

        if not pg.lang:
            err('<html> has no lang attribute')
        if not any(m.get("name") == "viewport" for m in pg.metas):
            err("missing <meta name=\"viewport\"> (mobile rendering)")

        # title / description
        if len(pg.titles) != 1 or not pg.titles[0]:
            err(f"needs exactly one non-empty <title> (found {len(pg.titles)})")
        else:
            t = pg.titles[0]
            if len(t) > TITLE_MAX:
                warn(f"title is {len(t)} chars; Google truncates around {TITLE_MAX}: {t!r}")
            seen_titles.setdefault(t, []).append(name)
        descs = pg.meta("name", "description")
        if len(descs) != 1 or not descs[0].strip():
            err('needs exactly one <meta name="description">')
        else:
            d = descs[0].strip()
            if not DESC_MIN <= len(d) <= DESC_MAX:
                warn(f"meta description is {len(d)} chars; aim for {DESC_MIN}-{DESC_MAX}")
            seen_descs.setdefault(d, []).append(name)

        # indexing
        for key in ("robots", "googlebot"):
            for c in pg.meta("name", key):
                if "noindex" in c.lower() or "none" in c.lower().split(","):
                    err(f'<meta name="{key}" content="{c}"> blocks Google from indexing this page')
        canon = pg.link_rel("canonical")
        if len(canon) != 1:
            err(f'needs exactly one <link rel="canonical"> (found {len(canon)})')
        elif canon[0] != url:
            err(f"canonical is {canon[0]!r}, expected {url!r}")

        # headings
        levels = [lvl for lvl, _ in pg.headings]
        h1s = levels.count(1)
        if h1s != 1:
            err(f"needs exactly one <h1> (found {h1s})")
        prev = 0
        for lvl, text in pg.headings:
            if prev and lvl > prev + 1:
                err(f"heading jumps from h{prev} to h{lvl} at {text[:50]!r}; don't skip levels")
            if not text:
                err(f"empty <h{lvl}>")
            prev = lvl

        # images
        for img in pg.imgs:
            src = img.get("src", "?")
            alt = img.get("alt")
            if alt is None:
                err(f"<img src={src!r}> has no alt attribute")
            elif PLACEHOLDER_ALT.search(alt.strip()):
                err(f"<img src={src!r}> alt={alt!r} looks like an id/file name, describe the image")
            if not (img.get("width") and img.get("height")):
                warn(f"<img src={src!r}> has no width/height (can cause layout shift)")

        # social / structured data
        for prop in ("og:title", "og:description", "og:image", "og:url", "og:type"):
            if not pg.meta("property", prop):
                err(f'missing <meta property="{prop}">')
        if pg.meta("property", "og:url") and pg.meta("property", "og:url")[0] != url:
            err(f"og:url should be {url!r}")
        img = (pg.meta("property", "og:image") or [""])[0]
        if img.startswith(SITE + "/") and not (ROOT / img[len(SITE) + 1:]).is_file():
            err(f"og:image {img!r} does not exist in the repo")
        if not pg.meta("name", "twitter:card"):
            err('missing <meta name="twitter:card">')
        if not pg.jsonld:
            err("no JSON-LD schema markup")
        for block in pg.jsonld:
            try:
                json.loads(block)
            except json.JSONDecodeError as e:
                err(f"JSON-LD is not valid JSON: {e}")

        # links and resources
        for src in pg.srcs + [a["href"] for a in pg.anchors]:
            if src.startswith("http://"):
                err(f"insecure http:// URL {src!r}; use https://")
            if re.search(r"X{4,}", src):
                err(f"placeholder in link {src!r}")
        for a in pg.anchors:
            href = a["href"].strip()
            scheme = urlparse(href).scheme
            if scheme in ("http", "https", "mailto", "tel", "javascript"):
                if href.lower().startswith("javascript:"):
                    err(f"javascript: link {href!r}; use a real href so Google can follow it")
                continue
            if href in ("", "#"):
                if not a.get("onclick"):
                    err(f'<a href="{href}"> goes nowhere')
                continue
            target, frag = urldefrag(href)
            if target.startswith("/"):
                target = target[1:] or "index.html"
            elif target.startswith("./"):
                target = target[2:]
            target = target or name
            if target.endswith("/"):
                target += "index.html"
            if not (ROOT / target).is_file():
                err(f"broken internal link {href!r}")
                continue
            if frag and target.endswith(".html"):
                ids = parsed[target].ids if target in parsed else Page(ROOT / target).ids
                if frag not in ids:
                    err(f"link {href!r} points to #{frag}, which doesn't exist in {target}")
            if target in inbound and target != name:
                inbound[target] += 1

    for text, names in seen_titles.items():
        if len(names) > 1:
            errors.append(f"duplicate <title> {text!r} on {', '.join(names)}")
    for text, names in seen_descs.items():
        if len(names) > 1:
            errors.append(f"duplicate meta description on {', '.join(names)}")
    for name, n in inbound.items():
        if name != "index.html" and n == 0:
            errors.append(f"{name}: no other page links to it with a real href (Google can't find it)")

    # site-wide files
    robots = ROOT / "robots.txt"
    if not robots.is_file():
        errors.append("robots.txt is missing")
    else:
        body = robots.read_text()
        if f"Sitemap: {SITE}/sitemap.xml" not in body:
            errors.append(f"robots.txt should contain 'Sitemap: {SITE}/sitemap.xml'")
        if re.search(r"^\s*Disallow:\s*/\s*$", body, re.M):
            errors.append("robots.txt disallows the whole site")
    sm = ROOT / "sitemap.xml"
    if not sm.is_file():
        errors.append("sitemap.xml is missing from the build (src/pages/sitemap.xml.ts)")
    else:
        listed = set(re.findall(r"<loc>(.*?)</loc>", sm.read_text()))
        expected = {page_url(p) for p in pages()}
        if listed != expected:
            missing, extra = sorted(expected - listed), sorted(listed - expected)
            errors.append(f"sitemap.xml doesn't match the built pages (missing {missing}, extra {extra}); "
                          "update src/pages/sitemap.xml.ts")

    for w in warnings:
        print("warning:", w)
    for e in errors:
        print("ERROR:", e)
    print(f"{len(parsed)} pages checked: {len(errors)} errors, {len(warnings)} warnings")
    return 1 if errors else 0


# ── external links ─────────────────────────────────────────────────────────

def fetch_status(url):
    headers = {"User-Agent": "Mozilla/5.0 (compatible; MarketMoversLinkCheck/1.0; +" + SITE + ")"}
    for method in ("HEAD", "GET"):
        try:
            req = urllib.request.Request(url, method=method, headers=headers)
            with urllib.request.urlopen(req, timeout=20) as r:
                return r.status
        except urllib.error.HTTPError as e:
            if method == "HEAD" and e.code in (403, 405, 501):
                continue  # some servers reject HEAD; retry with GET
            return e.code
        except Exception as e:  # DNS failure, timeout, TLS error
            if method == "GET":
                return f"{type(e).__name__}: {e}"
    return "unreachable"


def links():
    urls = {}
    for p in pages():
        pg = Page(p)
        for u in pg.srcs + [a["href"] for a in pg.anchors]:
            if u.startswith("https://") and "fonts.g" not in u and not u.startswith(SITE):
                urls.setdefault(u, set()).add(p.name)
    with ThreadPoolExecutor(8) as pool:
        results = dict(zip(urls, pool.map(fetch_status, urls)))
    broken = 0
    for u, status in sorted(results.items()):
        where = ", ".join(sorted(urls[u]))
        if status in (401, 403, 429):
            print(f"warning: {status} (site may be blocking bots) {u}  [{where}]")
        elif not isinstance(status, int) or status >= 400:
            broken += 1
            print(f"BROKEN: {status} {u}  [{where}]")
    print(f"{len(results)} external URLs checked: {broken} broken")
    return 1 if broken else 0


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "check"
    if not ROOT.is_dir():
        sys.exit("dist/ not found; run `npm run build` first")
    if cmd == "check":
        sys.exit(check())
    elif cmd == "links":
        sys.exit(links())
    else:
        sys.exit(__doc__)

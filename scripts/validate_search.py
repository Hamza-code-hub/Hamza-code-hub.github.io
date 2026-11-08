"""Validate local search metadata, static navigation, links and sitemap coverage.

Run from any directory with: python scripts/validate_search.py
This checks source files only; it does not establish live indexing or rankings.
"""
from collections import Counter
from dataclasses import dataclass, field
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
PRIMARY = "https://hamza-ai-engineer.vercel.app"
MIRROR = "https://hamza-code-hub.github.io"
OWNED_HOSTS = {urlsplit(PRIMARY).netloc, urlsplit(MIRROR).netloc}
VOID_TAGS = set("area base br col embed hr img input link meta param source track wbr".split())
SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
IMAGE_NS = "http://www.google.com/schemas/sitemap-image/1.1"


@dataclass
class Node:
    tag: str
    attrs: dict
    line: int
    position: int
    parent: object = None
    children: list = field(default_factory=list)
    text: list = field(default_factory=list)

    def has_class(self, name):
        return name in self.attrs.get("class", "").split()

    def inside(self, ancestor):
        parent = self.parent
        while parent is not None:
            if parent is ancestor:
                return True
            parent = parent.parent
        return False

    def content(self):
        return " ".join(self.text + [child.content() for child in self.children]).strip()


class Page(HTMLParser):
    def __init__(self, path, source):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.source = source
        self.nodes = []
        self.stack = []
        self.feed(source)
        self.close()

    def handle_starttag(self, tag, attrs):
        node = Node(tag, dict(attrs), self.getpos()[0], len(self.nodes), self.stack[-1] if self.stack else None)
        self.nodes.append(node)
        if node.parent is not None:
            node.parent.children.append(node)
        if tag not in VOID_TAGS:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID_TAGS:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                break

    def handle_data(self, data):
        if self.stack:
            self.stack[-1].text.append(data)


def route(path):
    relative = "/" + path.relative_to(ROOT).as_posix()
    return relative[:-len("index.html")] if relative.endswith("index.html") else relative


def main():
    errors = []
    counters = Counter()

    def fail(path, message, node=None):
        location = path.relative_to(ROOT).as_posix()
        errors.append(f"{location}{':' + str(node.line) if node else ''}: {message}")

    paths = sorted([*ROOT.glob("*.html"), *[path for folder in ("projects", "resume", "services", "research") for path in (ROOT / folder).glob("*.html")]])
    pages = {path.resolve(): Page(path, path.read_text(encoding="utf-8")) for path in paths}
    canonical_urls = {PRIMARY + route(path) for path in paths if path.name != "resume.html"}
    graph = {url: set() for url in canonical_urls}
    case_cache = {}

    def owned_url(value, path, context, node=None):
        parsed = urlsplit(value)
        if parsed.netloc in OWNED_HOSTS:
            if parsed.scheme != "https" or parsed.netloc != urlsplit(PRIMARY).netloc:
                fail(path, f"{context} must use the primary HTTPS origin: {value}", node)
            if parsed.path.endswith("index.html") or parsed.path == "/resume.html":
                fail(path, f"{context} must use a canonical page route, not an HTML alias: {value}", node)

    def local_target(value, path, context, node=None, check_fragment=True):
        parsed = urlsplit(value)
        if parsed.scheme and parsed.scheme not in ("http", "https"):
            return None
        if parsed.netloc and parsed.netloc not in OWNED_HOSTS:
            return None
        if parsed.netloc or parsed.path.startswith("/"):
            target = ROOT / unquote(parsed.path.lstrip("/"))
        elif parsed.path:
            target = path.parent / unquote(parsed.path)
        else:
            target = path
        target = target.resolve()
        if target.is_dir():
            target = target / "index.html"
        try:
            relative = target.relative_to(ROOT)
        except ValueError:
            fail(path, f"{context} escapes the site directory: {value}", node)
            return None
        if not target.exists():
            fail(path, f"{context} points to a missing local file: {value}", node)
            return None
        # Windows accepts incorrect case; the production static hosts may not.
        parent = ROOT
        for part in relative.parts:
            if parent not in case_cache:
                case_cache[parent] = {child.name for child in parent.iterdir()}
            if part not in case_cache[parent]:
                fail(path, f"{context} has incorrect filename case: {value}", node)
                break
            parent = parent / part
        if check_fragment and parsed.fragment and target in pages:
            ids = {item.attrs.get("id") for item in pages[target].nodes}
            if unquote(parsed.fragment) not in ids:
                fail(path, f"{context} points to a missing fragment: {value}", node)
        return target

    def schema_urls(value, path, context, node):
        if isinstance(value, dict):
            for key, child in value.items():
                schema_urls(child, path, context + "." + key, node)
        elif isinstance(value, list):
            for index, child in enumerate(value):
                schema_urls(child, path, context + f"[{index}]", node)
        elif isinstance(value, str) and value.startswith(("http://", "https://", "//")):
            owned_url(value, path, context, node)
            # JSON-LD fragments identify entities, not necessarily HTML elements.
            local_target(value, path, context, node, check_fragment=False)

    for path, page in pages.items():
        alias = path == ROOT / "resume.html"
        expected = PRIMARY + ("/resume/" if alias else route(path))
        canonicals = [node.attrs.get("href") for node in page.nodes if node.tag == "link" and "canonical" in node.attrs.get("rel", "").split()]
        if canonicals != [expected]:
            fail(path, f"Expected exactly one canonical {expected!r}; found {canonicals!r}")
        if not alias:
            og_urls = [node.attrs.get("content") for node in page.nodes if node.tag == "meta" and node.attrs.get("property") == "og:url"]
            if og_urls != [expected]:
                fail(path, f"Expected exactly one og:url {expected!r}; found {og_urls!r}")
            headings = [node for node in page.nodes if node.tag == "h1"]
            if len(headings) != 1:
                fail(path, f"Expected one H1; found {len(headings)}")
            headers = [node for node in page.nodes if node.tag == "header" and node.has_class("header")]
            wrappers = [node for node in page.nodes if node.has_class("main-wrapper")]
            if len(headers) != 1 or len(wrappers) != 1 or headers[0].position >= wrappers[0].position or headers[0].inside(wrappers[0]):
                fail(path, "Expected exactly one static site header before .main-wrapper")
        ids = Counter(node.attrs["id"] for node in page.nodes if "id" in node.attrs)
        for value, count in ids.items():
            if count > 1:
                fail(path, f"Duplicate HTML id {value!r} occurs {count} times")
        for node in page.nodes:
            if node.tag == "script" and urlsplit(node.attrs.get("src", "")).path.endswith("/sidebar.js"):
                fail(path, "Remove the sidebar.js runtime include; navigation must be static", node)
            if node.tag == "script" and node.attrs.get("type") == "application/ld+json":
                counters["schema_blocks"] += 1
                try:
                    schema_urls(json.loads("".join(node.text)), path, "JSON-LD", node)
                except (ValueError, TypeError) as error:
                    fail(path, f"Invalid JSON-LD: {error}", node)
            for attribute in ("href", "src"):
                value = node.attrs.get(attribute)
                if not value:
                    continue
                counters["references"] += 1
                owned_url(value, path, attribute, node)
                target = local_target(value, path, attribute, node)
                if node.tag == "a" and target in pages and not alias:
                    if target.name == "resume.html":
                        fail(path, "Link directly to /resume/ instead of resume.html", node)
                    else:
                        graph[expected].add(PRIMARY + route(target))
            if node.tag == "meta" and node.attrs.get("content", "").startswith(("http://", "https://", "//")):
                owned_url(node.attrs["content"], path, "metadata", node)
            if node.has_class("stat-number") and "data-count" in node.attrs:
                counters["static_results"] += 1
                try:
                    expected_count = float(node.attrs["data-count"])
                    shown = re.search(r"[-+]?\d+(?:\.\d+)?", node.content().replace(",", ""))
                    if expected_count > 0 and (shown is None or float(shown[0]) <= 0):
                        fail(path, "Positive data-count needs its real result in source HTML, not zero or empty text", node)
                except ValueError:
                    fail(path, "stat-number data-count must be numeric", node)

    resume_path = ROOT / "resume" / "index.html"
    if resume_path in pages:
        page = pages[resume_path]
        articles = [node for node in page.nodes if node.tag == "article" and node.has_class("resume-wrapper")]
        headers = [node for node in page.nodes if node.tag == "header" and node.has_class("resume-header")]
        # The printable resume intentionally contains two article pages.
        valid = bool(articles) and len(headers) == 1 and any(headers[0].inside(article) for article in articles)
        if valid:
            inside = [node for node in page.nodes if node.inside(headers[0])]
            valid = any(node.tag == "h1" and node.has_class("resume-name") and "Muhammad Hamza" in node.content() for node in inside)
            contacts = [node for node in inside if node.has_class("resume-contact")]
            valid = valid and len(contacts) == 1 and any(node.tag == "a" and node.inside(contacts[0]) and node.attrs.get("href", "").startswith("mailto:") for node in inside)
        if not valid:
            fail(resume_path, "The resume article must retain its own .resume-header, H1 .resume-name and .resume-contact email")
    else:
        fail(resume_path, "Missing canonical resume page")

    for filename in ("sitemap.xml", "sitemap-vercel.xml"):
        path = ROOT / filename
        try:
            tree = ET.parse(path)
            if tree.getroot().tag != "{" + SITEMAP_NS + "}urlset":
                fail(path, "Sitemap root must be urlset in the standard sitemap namespace")
            urls = []
            for item in tree.getroot().findall("{" + SITEMAP_NS + "}url"):
                location = item.findtext("{" + SITEMAP_NS + "}loc") or ""
                urls.append(location)
                images = [node.text or "" for node in item.findall("{" + IMAGE_NS + "}image/{" + IMAGE_NS + "}loc")]
                for image in images:
                    counters[filename + "_images"] += 1
                    if not image.startswith(PRIMARY + "/") or re.search(r"\s", image):
                        fail(path, f"Image URLs must use the primary HTTPS origin with encoded paths: {image}")
                    local_target(image, path, "sitemap image")
                if len(images) != len(set(images)):
                    fail(path, f"Duplicate image URL within {location}")
            if len(urls) != len(set(urls)):
                fail(path, "Duplicate sitemap page URLs")
            for missing in sorted(canonical_urls - set(urls)):
                fail(path, f"Missing canonical page: {missing}")
            for extra in sorted(set(urls) - canonical_urls):
                fail(path, f"Unexpected or noncanonical page: {extra}")
        except (OSError, ET.ParseError) as error:
            fail(path, f"Cannot parse sitemap: {error}")

    reached = set()
    pending = [PRIMARY + "/"]
    while pending:
        url = pending.pop()
        if url not in reached:
            reached.add(url)
            pending.extend(graph.get(url, set()))
    for missing in sorted(canonical_urls - reached):
        fail(ROOT / "index.html", f"No static link path from the homepage to {missing}")

    if errors:
        print(f"FAIL: {len(errors)} search validation error(s)", file=sys.stderr)
        for error in errors:
            print("- " + error, file=sys.stderr)
        return 1
    print(f"PASS: {len(pages)} HTML files, {len(canonical_urls)} canonical Vercel pages, {counters['schema_blocks']} valid JSON-LD blocks")
    print(f"PASS: {counters['references']} reference declarations checked; static navigation, IDs, resume header and {counters['static_results']} source results verified")
    print(f"PASS: both sitemaps cover all canonical pages; {counters['sitemap.xml_images']} image entries per sitemap; all pages reachable from the homepage")
    print("Local source validation only; external URLs are not fetched. Deployment access and indexing require separate checks.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

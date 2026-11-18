// Turns a magic word such as {{embed:/games/Lageta/build/}} into an iframe.
// Astro serves `public/` at the site root in dev and copies it into `dist/`
// during build, so a static game's build folder is already available on the
// same route in dev, build, and preview. The embed only needs that URL.

const MAGIC_PATTERN = /^\{\{\s*(embed|game)\s*:?\s*([^{}]+?)\s*\}\}$/i;
const externalPattern = /^[a-z][a-z\d+.-]*:/i;
const htmlFilePattern = /\.html?$/i;

const escapeHtml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const isWhitespace = (node) => node.type === "text" && node.value.trim() === "";

// Accepts a route such as `games/Lageta/build`, `/games/Lageta/build/`, or a
// game folder name with the `game:` shorthand. Always ends folder routes with
// a slash so relative asset URLs inside the embedded site resolve correctly.
function normalizeRoute(raw, kind) {
  const value = raw
    .trim()
    .replace(/^["'`]|["'`]$/g, "")
    .replace(/\\/g, "/");

  if (!value || externalPattern.test(value) || value.startsWith("//")) return null;

  const parts = value.match(/^([^?#]*)([\s\S]*)$/);
  const pathname = parts[1];
  const suffix = parts[2] ?? "";
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0 || segments.some((segment) => segment === "." || segment === "..")) {
    return null;
  }

  if (kind === "game" && segments.length === 1) {
    segments.unshift("games");
    segments.push("build");
  }

  const trailingSlash = htmlFilePattern.test(segments.at(-1)) ? "" : "/";
  return `/${segments.map(encodeURIComponent).join("/")}${trailingSlash}${suffix}`;
}

function titleFor(route, kind, raw) {
  if (kind === "game" && !raw.includes("/")) return raw.trim();

  const pathname = route.split(/[?#]/, 1)[0];
  const segments = pathname.split("/").filter(Boolean);
  const buildIndex = segments.indexOf("build");
  const candidate = buildIndex > 0 ? segments[buildIndex - 1] : segments.at(-1);

  try {
    return decodeURIComponent(candidate);
  } catch {
    return candidate;
  }
}

function embedHtml(raw, kind) {
  const src = normalizeRoute(raw, kind);
  if (!src) return null;

  const title = titleFor(src, kind, raw);
  return `<div class="embed"><iframe src="${escapeHtml(src)}" title="${escapeHtml(title)}" loading="lazy" allowfullscreen></iframe></div>`;
}

// Only a paragraph that contains nothing but the magic word is replaced, so
// ordinary prose is never swallowed and the iframe stays block-level markup.
function replacementFor(paragraph) {
  if (paragraph.type !== "paragraph") return null;

  const children = (paragraph.children ?? []).filter((child) => !isWhitespace(child));
  if (children.length !== 1 || children[0].type !== "text") return null;

  const text = children[0].value.trim();
  const match = text.match(MAGIC_PATTERN);
  if (!match) return null;

  const html = embedHtml(match[2], match[1].toLowerCase());
  return html ? [{ type: "html", value: html }] : null;
}

function transformChildren(node) {
  if (!Array.isArray(node.children)) return;

  const children = [];
  for (const child of node.children) {
    transformChildren(child);
    const replacement = replacementFor(child);
    if (replacement) children.push(...replacement);
    else children.push(child);
  }
  node.children = children;
}

export default function remarkLocalEmbed() {
  return (tree) => {
    transformChildren(tree);
  };
}

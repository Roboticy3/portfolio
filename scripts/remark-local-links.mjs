import fs from "node:fs";
import path from "node:path";

const externalPattern = /^[a-z][a-z\d+.-]*:/i;
const pageExtension = ".md";

const decodeSafely = (value) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const insideDir = (dir, target) => {
  const relative = path.relative(dir, target);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
};

const splitUrl = (url) => {
  const match = url.match(/^([^?#]*)([\s\S]*)$/);
  return { pathname: match[1], suffix: match[2] };
};

const encodeSegments = (segments) => segments.map(encodeURIComponent).join("/");

// Maps a Markdown source file to the URL of the page Astro generates for it.
const routeForPage = (pagePath, pagesDir) => {
  if (!pagePath || !insideDir(pagesDir, pagePath)) return null;

  const segments = path.relative(pagesDir, pagePath).split(path.sep);
  const last = segments.at(-1);

  if (last === `index${pageExtension}`) {
    segments.pop();
  } else if (last?.endsWith(pageExtension)) {
    segments[segments.length - 1] = last.slice(0, -pageExtension.length);
  } else {
    return null;
  }

  if (segments.length === 0) return "/";
  return `/${encodeSegments(segments)}/`;
};

// Accepts a link to a Markdown file with or without its extension, or to a
// folder containing an index.md, and returns the source file it refers to.
const findPageFile = (candidate, pagesDir) => {
  if (!insideDir(pagesDir, candidate)) return null;

  const candidates = candidate.endsWith(pageExtension)
    ? [candidate]
    : [
        `${candidate}${pageExtension}`,
        path.join(candidate, `index${pageExtension}`),
      ];

  for (const option of candidates) {
    if (fs.existsSync(option) && fs.statSync(option).isFile()) return option;
  }
  return null;
};

// Turns a relative URL into a root-absolute one using the current page's URL,
// so it means the same thing on every page that includes the same Markdown.
const resolveRelative = (pageUrl, relativePath) => {
  const segments = decodeSafely(pageUrl).split("/").filter(Boolean);

  for (const segment of relativePath.split("/")) {
    if (!segment || segment === ".") continue;
    if (segment === "..") segments.pop();
    else segments.push(segment);
  }

  const trailingSlash = relativePath.endsWith("/") ? "/" : "";
  return segments.length === 0
    ? `/${trailingSlash}`
    : `/${encodeSegments(segments)}${trailingSlash}`;
};

function walk(node, callback) {
  callback(node);
  if (Array.isArray(node.children)) {
    for (const child of node.children) walk(child, callback);
  }
}

export default function remarkLocalLinks(options = {}) {
  const pagesDir = path.resolve(options.pagesDir ?? path.join("src", "pages"));

  return (tree, file) => {
    const sourcePath = typeof file?.path === "string" ? path.resolve(file.path) : null;
    const inPages = sourcePath !== null && insideDir(pagesDir, sourcePath);
    const sourceDir = inPages ? path.dirname(sourcePath) : pagesDir;
    const pageUrl = routeForPage(sourcePath, pagesDir) ?? "/";

    walk(tree, (node) => {
      if (node.type !== "link" && node.type !== "definition") return;
      if (typeof node.url !== "string" || !node.url) return;
      if (externalPattern.test(node.url) || node.url.startsWith("//") || node.url.startsWith("#")) return;

      const { pathname, suffix } = splitUrl(node.url);
      if (!pathname) return;

      const decoded = decodeSafely(pathname);
      const candidate = decoded.startsWith("/")
        ? path.resolve(pagesDir, `.${decoded}`)
        : path.resolve(sourceDir, decoded);

      const pageFile = findPageFile(candidate, pagesDir);
      if (pageFile) {
        node.url = `${routeForPage(pageFile, pagesDir)}${suffix}`;
      } else if (!decoded.startsWith("/")) {
        node.url = `${resolveRelative(pageUrl, decoded)}${suffix}`;
      }
    });
  };
}

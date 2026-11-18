import fs from "node:fs";
import path from "node:path";

export const TEXT_EXTENSIONS = new Set([
  ".js",
  ".mjs",
  ".html",
  ".css",
  ".json",
  ".txt",
  ".svg",
  ".map",
  ".xml",
]);

export const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".wasm": "application/wasm",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".txt": "text/plain; charset=utf-8",
};

const toPosix = (value) => value.split(path.sep).join("/");

const insideDir = (dir, target) => {
  const relative = path.relative(dir, target);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
};

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;

    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.isFile()) files.push(full);
  }

  return files;
}

// Every game has two useful paths: the URL route (percent-encoded) and the
// decoded pathname used when matching incoming dev-server requests.
export function discoverGames(publicDir) {
  const gamesRoot = path.join(publicDir, "games");
  if (!fs.existsSync(gamesRoot) || !fs.statSync(gamesRoot).isDirectory()) return [];

  return fs
    .readdirSync(gamesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const buildDir = path.join(gamesRoot, entry.name, "build");
      if (!fs.existsSync(buildDir) || !fs.statSync(buildDir).isDirectory()) return null;

      const encoded = encodeURIComponent(entry.name);
      return {
        name: entry.name,
        buildDir,
        route: `/games/${encoded}/build`,
        pathname: `/games/${entry.name}/build`,
        meta: null,
      };
    })
    .filter(Boolean);
}

export function gameMeta(game) {
  game.meta ??= (() => {
    const routes = new Map();
    const prefixes = new Set();

    for (const file of walk(game.buildDir)) {
      if (!/\.html$/i.test(file)) continue;

      const relative = toPosix(path.relative(game.buildDir, file));
      if (relative.toLowerCase() === "index.html") continue;

      const route = relative.replace(/\.html$/i, "");
      routes.set(route, relative);

      const segments = route.split("/");
      if (segments.length > 1) prefixes.add(`${segments.slice(0, -1).join("/")}/`);
    }

    return {
      routes: [...routes.keys()].sort((a, b) => b.length - a.length),
      prefixes: [...prefixes].sort((a, b) => b.length - a.length),
    };
  })();

  return game.meta;
}

function replaceQuoted(content, token, replacement) {
  for (const quote of ['"', "'", "`"]) {
    content = content.split(`${quote}${token}${quote}`).join(`${quote}${replacement}${quote}`);
  }
  return content;
}

// Static builds commonly hardcode root-absolute routes such as "/tutorial/"
// or "/campaign". Inside an iframe those would navigate to the parent site,
// so point them back at the mounted copy of the game.
export function rewriteText(content, game) {
  const { routes, prefixes } = gameMeta(game);
  const base = game.route;

  for (const route of routes) {
    content = replaceQuoted(content, `/${route}`, `${base}/${route}.html`);
  }
  for (const prefix of prefixes) {
    content = replaceQuoted(content, `/${prefix}`, `${base}/${prefix}`);
  }

  return content;
}

// Subroute files are served at clean URLs, so relative asset URLs need a base
// pointing back at the root of the mounted game.
export function injectBase(html, game, relativeFile = "") {
  const directory = path.posix.dirname(toPosix(relativeFile));
  const base = directory === "." ? `${game.route}/` : `${game.route}/${directory}/`;
  const tag = `<base href="${base}">`;
  return /<head\b[^>]*>/i.test(html)
    ? html.replace(/(<head\b[^>]*>)/i, `$1\n\t${tag}`)
    : `${tag}\n${html}`;
}

export function gameFileForPathname(game, pathname) {
  const decoded = decodeURIComponent(pathname);
  const relative = decoded.slice(game.pathname.length).replace(/^\/+|\/+$/g, "");
  const meta = gameMeta(game);
  const seen = new Set();

  const candidates = [
    relative,
    ...(relative ? [`${relative}.html`] : []),
    relative ? `${relative}/index.html` : "index.html",
  ];

  for (const candidate of candidates) {
    if (!candidate || seen.has(candidate)) continue;
    seen.add(candidate);

    const file = path.resolve(game.buildDir, `.${candidate.startsWith("/") ? candidate : `/${candidate}`}`);
    if (!insideDir(game.buildDir, file) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      continue;
    }

    const ext = path.extname(file).toLowerCase();
    const isHtml = ext === ".html";
    let content = fs.readFileSync(file);

    if (TEXT_EXTENSIONS.has(ext)) {
      content = Buffer.from(rewriteText(content.toString("utf8"), game), "utf8");
      if (isHtml && candidate !== relative) {
        content = Buffer.from(injectBase(content.toString("utf8"), game, candidate), "utf8");
      }
    }

    return { content, ext, isHtml };
  }

  return null;
}

// Rewrites the copied build in dist/ and adds clean-URL HTML files for every
// subroute, so the same links work on a plain static host under preview too.
export function writeMountedGame(game, outDir) {
  const meta = gameMeta(game);

  for (const file of walk(game.buildDir)) {
    const relative = toPosix(path.relative(game.buildDir, file));
    const ext = path.extname(file).toLowerCase();
    const source = fs.readFileSync(file);
    const content = TEXT_EXTENSIONS.has(ext)
      ? Buffer.from(rewriteText(source.toString("utf8"), game), "utf8")
      : source;

    const target = path.join(outDir, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);

    if (ext !== ".html" || relative.toLowerCase() === "index.html") continue;

    const route = relative.replace(/\.html$/i, "");
    const cleanTarget = path.join(outDir, route, "index.html");
    fs.mkdirSync(path.dirname(cleanTarget), { recursive: true });
    fs.writeFileSync(
      cleanTarget,
      injectBase(rewriteText(source.toString("utf8"), game), game, relative),
    );
  }

  return meta;
}

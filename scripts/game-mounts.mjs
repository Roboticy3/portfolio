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
    const routes = new Set();

    for (const file of walk(game.buildDir)) {
      if (!/\.html$/i.test(file)) continue;

      const relative = toPosix(path.relative(game.buildDir, file));
      if (relative.toLowerCase() === "index.html") continue;
      routes.add(relative.replace(/\.html$/i, ""));
    }

    return { routes: [...routes].sort((a, b) => b.length - a.length) };
  })();

  return game.meta;
}

function decodePath(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

// Convert a game-relative route such as "/tutorial/Tutorial" into the mounted
// route. Only routes that correspond to a prerendered file are rewritten;
// SvelteKit's client-side route table is left alone so its own base handling
// still works.
function mountedRoute(game, rawPath) {
  const pathname = decodePath(rawPath).split(/[?#]/)[0];
  const relative = pathname.replace(/^\/+|\/+$/g, "");
  if (!relative) return `${game.route}/`;

  const { routes } = gameMeta(game);
  const match = routes.find((route) => route === relative || route === `${relative}/index`);
  return match ? `${game.route}/${match}` : null;
}

const LOCATION_TARGET = String.raw`(?<![\w.])(?:(?:window|document)\.)?location`;

// Static builds sometimes use `location.pathname = "tutorial/X"` or
// `location.href = "/campaign"`. Those assignments resolve against the origin
// root, so redirect them through helpers that know the game's mount route.
function rewriteNavigation(content, game) {
  return content
    .replace(new RegExp(`${LOCATION_TARGET}\\.pathname\\s*=`, "g"), "window.__gameMountPathname=")
    .replace(new RegExp(`${LOCATION_TARGET}\\.href\\s*=`, "g"), "window.__gameMountHref=")
    .replace(new RegExp(`${LOCATION_TARGET}\\.assign\\s*\\(`, "g"), "window.__gameMountAssign(")
    .replace(new RegExp(`${LOCATION_TARGET}\\.replace\\s*\\(`, "g"), "window.__gameMountReplace(");
}

function rewriteAnchorHrefs(content, game) {
  return content.replace(/(\bhref\s*=\s*)(["'])\/([^"']*)\2/gi, (full, prefix, quote, raw) => {
    const target = mountedRoute(game, `/${raw}`);
    return target ? `${prefix}${quote}${target}${quote}` : full;
  });
}

export function rewriteText(content, game) {
  return rewriteAnchorHrefs(rewriteNavigation(content, game), game);
}

// SvelteKit prerendered HTML infers its base from `location`. That is wrong
// once the game is mounted below the site root, especially for folder URLs
// such as /campaign/. Prefer the mount path passed into the iframe instead,
// while keeping the original expression as a fallback for direct visits.
const SVELTEKIT_BASE = /(base\s*:\s*)(new URL\(\s*(["'])\.\.?\3\s*,\s*location\s*\)\.pathname\.slice\(\s*0\s*,\s*-1\s*\))/g;

export function overrideSvelteKitBase(html) {
  return html.replace(SVELTEKIT_BASE, (_full, prefix, original) => `${prefix}window.__gameMountBase ?? ${original}`);
}

// Runs before the game's module scripts. It only prefixes root-absolute URLs;
// relative URLs and external URLs keep their normal meaning.
export function mountRuntime(game) {
  const fallback = JSON.stringify(game.route);
  return `<script>(()=>{const marker="game-mount:";const fromName=typeof window.name==="string"&&window.name.startsWith(marker)?window.name.slice(marker.length):"";const fromQuery=new URLSearchParams(location.search).get("__game_base");const base=fromName||fromQuery||${fallback};window.__gameMountBase=base;if(!fromName&&base)window.name=marker+base;const underBase=(value)=>value===base||value.startsWith(base+"/");const withBaseParam=(target)=>{const url=new URL(target,location.href);if(!url.searchParams.has("__game_base"))url.searchParams.set("__game_base",base);return url.pathname+url.search+url.hash};const path=(value)=>{const text=String(value);const target=underBase(text)?text:text.startsWith("/")?base+text:base+"/"+text;return withBaseParam(target)};const external=(text)=>/^[a-z][a-z\\d+.-]*:/i.test(text)||text.startsWith("//");const absolute=(value)=>{const text=String(value);if(external(text)||!text.startsWith("/")||underBase(text))return text;return withBaseParam(base+text)};Object.defineProperty(window,"__gameMountPathname",{configurable:true,get:()=>location.pathname,set:(value)=>{location.href=path(value)}});Object.defineProperty(window,"__gameMountHref",{configurable:true,get:()=>location.href,set:(value)=>{location.href=absolute(value)}});window.__gameMountAssign=(value)=>location.assign(absolute(value));window.__gameMountReplace=(value)=>location.replace(absolute(value));const NativeAudio=window.Audio;if(NativeAudio){const MountedAudio=function(source){return new NativeAudio(typeof source==="string"?absolute(source):source)};MountedAudio.prototype=NativeAudio.prototype;window.Audio=MountedAudio}})();</script>`;
}

export function injectMountRuntime(html, game) {
  if (html.includes("__gameMountPathname")) return html;
  const script = mountRuntime(game);
  return /<head\b[^>]*>/i.test(html)
    ? html.replace(/(<head\b[^>]*>)/i, `$1\n\t${script}`)
    : `${script}\n${html}`;
}

// Clean subroute URLs need a base pointing at the source file's directory so
// relative asset URLs such as ../_app/... still resolve.
export function injectBase(html, game, relativeFile = "") {
  if (/<base\b/i.test(html)) return html;

  const directory = path.posix.dirname(toPosix(relativeFile));
  const base = directory === "." ? `${game.route}/` : `${game.route}/${directory}/`;
  const tag = `<base href="${base}">`;
  return /<head\b[^>]*>/i.test(html)
    ? html.replace(/(<head\b[^>]*>)/i, `$1\n\t${tag}`)
    : `${tag}\n${html}`;
}

function prepareHtml(content, game, relativeFile = "", cleanUrl = false) {
  let html = overrideSvelteKitBase(rewriteText(content, game));
  if (cleanUrl) html = injectBase(html, game, relativeFile);
  return injectMountRuntime(html, game);
}

export function gameFileForPathname(game, pathname) {
  const decoded = decodeURIComponent(pathname);
  const relative = decoded.slice(game.pathname.length).replace(/^\/+|\/+$/g, "");
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
    const source = fs.readFileSync(file);
    const content = isHtml
      ? Buffer.from(prepareHtml(source.toString("utf8"), game, candidate, candidate !== relative), "utf8")
      : TEXT_EXTENSIONS.has(ext)
        ? Buffer.from(rewriteText(source.toString("utf8"), game), "utf8")
        : source;

    return { content, ext, isHtml };
  }

  return null;
}

// Rewrites the copied build in dist/ and adds clean-URL HTML files for every
// subroute, so navigation works on a plain static host under preview too.
export function writeMountedGame(game, outDir) {
  const meta = gameMeta(game);

  for (const file of walk(game.buildDir)) {
    const relative = toPosix(path.relative(game.buildDir, file));
    const ext = path.extname(file).toLowerCase();
    const source = fs.readFileSync(file);
    const isHtml = ext === ".html";
    const content = isHtml
      ? Buffer.from(prepareHtml(source.toString("utf8"), game, relative), "utf8")
      : TEXT_EXTENSIONS.has(ext)
        ? Buffer.from(rewriteText(source.toString("utf8"), game), "utf8")
        : source;

    const target = path.join(outDir, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);

    if (!isHtml || relative.toLowerCase() === "index.html") continue;

    const route = relative.replace(/\.html$/i, "");
    const cleanTarget = path.join(outDir, route, "index.html");
    fs.mkdirSync(path.dirname(cleanTarget), { recursive: true });
    fs.writeFileSync(cleanTarget, Buffer.from(prepareHtml(source.toString("utf8"), game, relative, true), "utf8"));
  }

  return meta;
}

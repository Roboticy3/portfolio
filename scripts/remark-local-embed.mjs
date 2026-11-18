// Embeds a local static game from an ordinary Markdown image whose URL points
// at a game's build folder, for example:
//
//   ![The game Lageta](/games/Lageta/build)
//
// The image node becomes an iframe in the generated HTML. The game files in
// public/ are never edited.

const externalPattern = /^[a-z][a-z\d+.-]*:/i;
const indexFilePattern = /\/index\.html?$/i;

const escapeHtml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const decodeSafely = (value) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const isWhitespace = (node) => node.type === "text" && node.value.trim() === "";

function splitUrl(url) {
  const match = url.match(/^([^?#]*)([\s\S]*)$/);
  return { pathname: match[1], suffix: match[2] ?? "" };
}

// Returns the game whose build folder contains this image URL. The decoded
// path is only used for matching; the iframe keeps the author's URL.
function gameForUrl(url, games) {
  if (typeof url !== "string" || !url || externalPattern.test(url) || url.startsWith("//")) return null;

  const { pathname, suffix } = splitUrl(url.replace(/\\/g, "/"));
  if (!pathname) return null;

  const decoded = decodeSafely(pathname).replace(/\/+$/, "") || "/";
  const withoutIndex = decoded.replace(indexFilePattern, "");

  for (const game of games) {
    const roots = [game.route, game.pathname].map((root) => root.replace(/\/+$/, ""));
    const matched = roots.some((root) => withoutIndex === root || withoutIndex.startsWith(`${root}/`));
    if (!matched) continue;

    let sourcePath = pathname.replace(/\/+$/, "");
    sourcePath = sourcePath.replace(indexFilePattern, "");
    if (withoutIndex === roots[0] || withoutIndex === roots[1] || !sourcePath) sourcePath += "/";

    return { game, src: `${sourcePath}${suffix}` };
  }

  return null;
}

function embedHtml(image, match) {
  const title = image.alt?.trim() || match.game.name;
  const mount = match.game.route.replace(/\/+$/, "");
  const style = image.data?.hProperties?.style;
  const styleAttribute = typeof style === "string" && style.trim() ? ` style="${escapeHtml(style)}"` : "";

  return `<div class="embed"${styleAttribute}><iframe src="${escapeHtml(match.src)}" name="game-mount:${escapeHtml(mount)}" title="${escapeHtml(title)}" loading="lazy" allowfullscreen></iframe></div>`;
}

// Only a paragraph containing nothing but the game image is replaced, so
// ordinary images and inline prose are left alone. The `<style>` marker has
// already stripped its text and put the CSS on the image node by this point.
function gameEmbedFor(node, games) {
  if (node.type !== "paragraph") return null;

  const children = (node.children ?? []).filter((child) => !isWhitespace(child));
  if (children.length !== 1 || children[0].type !== "image") return null;

  const match = gameForUrl(children[0].url, games);
  return match ? { type: "html", value: embedHtml(children[0], match) } : null;
}

export default function remarkLocalEmbed(options = {}) {
  const games = options.games ?? [];
  return (tree) => {
    const walk = (node) => {
      if (!Array.isArray(node.children)) return;

      const children = [];
      for (const child of node.children) {
        const replacement = gameEmbedFor(child, games);
        if (replacement) {
          children.push(replacement);
          continue;
        }

        walk(child);
        children.push(child);
      }
      node.children = children;
    };

    walk(tree);
  };
}

const styleMarkerPattern =
  /^<style=(?:"([^"]*)"|'([^']*)'|“([^”]*)”|‘([^’]*)’)\s*>\s*/i;
const mediaTagPattern = /<(img|video|iframe|embed|object|svg|audio)\b([^>]*)>/i;

const escapeAttribute = (value) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

function mergeStyle(existing, style) {
  return existing ? `${existing}; ${style}` : style;
}

function applyStyle(node, style) {
  if (node.type === "image" || node.type === "imageReference") {
    node.data ??= {};
    node.data.hProperties ??= {};
    node.data.hProperties.style = mergeStyle(node.data.hProperties.style, style);
    return true;
  }

  if (node.type === "link") {
    return (node.children ?? []).some((child) => applyStyle(child, style));
  }

  if (node.type === "html") {
    const tagMatch = node.value.match(mediaTagPattern);
    if (!tagMatch) return false;

    const [fullTag, tagName, attributes] = tagMatch;
    const existingStyle = attributes.match(/\bstyle\s*=\s*(["'])(.*?)\1/i);

    if (existingStyle) {
      node.value = node.value.replace(
        existingStyle[0],
        `style=${existingStyle[1]}${mergeStyle(existingStyle[2], style)}${existingStyle[1]}`,
      );
    } else {
      node.value = node.value.replace(
        fullTag,
        `<${tagName}${attributes} style="${escapeAttribute(style)}">`,
      );
    }

    return true;
  }

  return false;
}

function transformChildren(node) {
  if (!Array.isArray(node.children)) return;

  for (const child of node.children) {
    transformChildren(child);
  }

  const children = node.children;

  for (let index = 0; index < children.length; index++) {
    const child = children[index];
    if (child.type !== "text") continue;

    const match = child.value.match(styleMarkerPattern);
    if (!match) continue;

    const style = (match[1] ?? match[2] ?? match[3] ?? match[4] ?? "").trim();
    if (!style) continue;

    let target = null;
    for (let targetIndex = index + 1; targetIndex < children.length; targetIndex++) {
      if (applyStyle(children[targetIndex], style)) {
        target = children[targetIndex];
        break;
      }
    }

    if (!target) continue;

    child.value = child.value.slice(match[0].length);
    if (!child.value) {
      children.splice(index, 1);
      index -= 1;
    }
  }
}

export default function remarkEmbedStyles() {
  return (tree) => {
    transformChildren(tree);
  };
}

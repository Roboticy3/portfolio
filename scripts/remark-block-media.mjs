const isWhitespaceText = (node) => node.type === "text" && node.value.trim() === "";

const isMediaNode = (node) => node.type === "image" || node.type === "imageReference";

// A child counts as media when it is an image on its own, or a link that wraps
// exactly one image. Returns the image node, or null.
const mediaIn = (child) => {
  if (isMediaNode(child)) return child;

  if (child.type === "link") {
    const linkChildren = (child.children ?? []).filter((node) => !isWhitespaceText(node));
    if (linkChildren.length === 1 && isMediaNode(linkChildren[0])) {
      return linkChildren[0];
    }
  }

  return null;
};

const contentChildren = (paragraph) =>
  (paragraph.children ?? []).filter((child) => !isWhitespaceText(child));

const soleMediaChild = (paragraph) => {
  const children = contentChildren(paragraph);
  if (children.length !== 1) return null;
  return mediaIn(children[0]);
};

// Two or more images alone in a paragraph form a row. The images share the
// line's width in proportion to their aspect ratios, giving them all the same
// height.
const mediaRowChildren = (paragraph) => {
  const children = contentChildren(paragraph);
  if (children.length < 2) return null;

  const media = children.map(mediaIn);
  if (media.some((node) => !node)) return null;

  return children.map((child, index) => ({ child, media: media[index] }));
};

const addClass = (node, className) => {
  node.data ??= {};
  node.data.hProperties ??= {};

  const existing = node.data.hProperties.className;
  const classes = Array.isArray(existing) ? existing : existing ? [existing] : [];

  if (!classes.includes(className)) {
    node.data.hProperties.className = [...classes, className];
  }
};

const hasClass = (node, className) => {
  const existing = node.data?.hProperties?.className;
  const classes = Array.isArray(existing) ? existing : existing ? [existing] : [];
  return classes.includes(className);
};

const collectMedia = (node, result = []) => {
  if (isMediaNode(node)) result.push(node);
  if (Array.isArray(node.children)) {
    for (const child of node.children) collectMedia(child, result);
  }
  return result;
};

function transformChildren(node) {
  if (!Array.isArray(node.children)) return;

  for (const child of node.children) {
    transformChildren(child);
  }

  if (node.type === "paragraph") {
    const media = soleMediaChild(node);

    if (media) {
      addClass(media, "media-block");
      return;
    }

    const row = mediaRowChildren(node);
    if (row) {
      addClass(node, "media-row");
      for (const { child, media: image } of row) {
        // An explicit <style> width opts the image out of automatic sizing.
        if (!hasClass(image, "media-sized")) {
          addClass(child, "media-row-item");
        }
      }
      return;
    }

    for (const image of collectMedia(node)) {
      if (!hasClass(image, "media-sized")) {
        addClass(image, "media-inline");
      }
    }
  }
}

export default function remarkBlockMedia() {
  return (tree) => {
    transformChildren(tree);
  };
}

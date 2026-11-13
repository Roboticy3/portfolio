const isWhitespaceText = (node) => node.type === "text" && node.value.trim() === "";

const isMediaNode = (node) => node.type === "image" || node.type === "imageReference";

const soleMediaChild = (paragraph) => {
  const children = (paragraph.children ?? []).filter((child) => !isWhitespaceText(child));
  if (children.length !== 1) return null;

  const [child] = children;
  if (isMediaNode(child)) return child;

  if (child.type === "link") {
    const linkChildren = (child.children ?? []).filter((node) => !isWhitespaceText(node));
    if (linkChildren.length === 1 && isMediaNode(linkChildren[0])) {
      return linkChildren[0];
    }
  }

  return null;
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

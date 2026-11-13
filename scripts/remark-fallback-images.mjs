import { existsSync } from "node:fs";
import path from "node:path";

const isRelativeUrl = (url) =>
  typeof url === "string" &&
  url.length > 0 &&
  !url.startsWith("/") &&
  !url.startsWith("#") &&
  !url.startsWith("//") &&
  !/^[a-z][a-z\d+.-]*:/i.test(url);

const stripQueryAndHash = (url) => url.split(/[?#]/, 1)[0];

const decodePath = (url) => {
  try {
    return decodeURI(url);
  } catch {
    return url;
  }
};

function walk(node, callback) {
  callback(node);

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      walk(child, callback);
    }
  }
}

export default function remarkFallbackImages() {
  return (tree, file) => {
    if (typeof file?.path !== "string") return;

    const sourceDir = path.dirname(file.path);

    walk(tree, (node) => {
      if (node.type !== "image" && node.type !== "definition") return;

      const url = node.url;
      if (!isRelativeUrl(url)) return;

      const localPath = path.resolve(sourceDir, decodePath(stripQueryAndHash(url)));
      if (existsSync(localPath)) return;

      // Treat missing images as normal browser URLs. The image will 404 and
      // the browser will display its alt text instead of failing the build.
      node.url = `/${url.replace(/^(?:\.\.?\/)+/, "").replace(/^\/+/, "")}`;
    });
  };
}

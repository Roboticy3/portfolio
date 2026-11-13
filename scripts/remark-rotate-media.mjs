import { unified } from "unified";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";

const parser = unified().use(remarkParse).use(remarkGfm);
const rotateBlockPattern = /^\s*<rotate>\s*(?:\r?\n([\s\S]*))?$/i;
const closingTagPattern = /\r?\n?\s*<\/rotate>\s*$/i;

function transformRotateBlock(node) {
  if (node.type !== "html") return null;

  const match = node.value.match(rotateBlockPattern);
  if (!match) return null;

  const body = (match[1] ?? "").replace(closingTagPattern, "");
  if (!body.trim()) return null;

  const parsed = parser.parse(body);
  const list = parsed.children.find((child) => child.type === "list");
  if (!list || list.children.length === 0) return null;

  const replacement = [
    { type: "html", value: '<div class="rotate-media" data-rotate>' },
  ];

  for (const item of list.children) {
    replacement.push({
      type: "html",
      value: '<div class="rotate-option" data-rotate-option>',
    });
    replacement.push(...item.children);
    replacement.push({ type: "html", value: "</div>" });
  }

  replacement.push({ type: "html", value: "</div>" });
  return replacement;
}

function transformChildren(node) {
  if (!Array.isArray(node.children)) return;

  const nextChildren = [];

  for (const child of node.children) {
    const replacement = transformRotateBlock(child);
    if (replacement) {
      nextChildren.push(...replacement);
      continue;
    }

    transformChildren(child);
    nextChildren.push(child);
  }

  node.children = nextChildren;
}

export default function remarkRotateMedia() {
  return (tree) => {
    transformChildren(tree);
  };
}

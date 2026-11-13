import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";
import remarkFallbackImages from "./scripts/remark-fallback-images.mjs";

// The launcher in scripts/astro.mjs sets this to "src-content-test" when the
// `--test` flag is passed, so pages and the sidebar are loaded from test
// content without touching the real content in src/.
const contentRoot =
  process.env.CONTENT_ROOT === "src-content-test" ? "src-content-test" : "src";
const contentDir = fileURLToPath(new URL(`./${contentRoot}`, import.meta.url));

export default defineConfig({
  srcDir: contentRoot,
  vite: {
    resolve: {
      alias: {
        // Keeps shared components pointed at whichever content root is active.
        "@content": contentDir,
      },
    },
  },
  // Markdown pages use this layout by default when `layout` is not set in frontmatter.
  markdown: {
    // GitHub-flavored Markdown is enabled by default in Astro.
    remarkPlugins: [remarkFallbackImages],
  },
});

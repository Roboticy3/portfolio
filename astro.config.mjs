import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";
import remarkFallbackImages from "./scripts/remark-fallback-images.mjs";
import remarkRotateMedia from "./scripts/remark-rotate-media.mjs";
import remarkEmbedStyles from "./scripts/remark-embed-styles.mjs";
import remarkBlockMedia from "./scripts/remark-block-media.mjs";
import remarkLocalLinks from "./scripts/remark-local-links.mjs";
import remarkLocalEmbed from "./scripts/remark-local-embed.mjs";
import viteGameRoutes from "./scripts/vite-game-routes.mjs";
import gamesIntegration from "./scripts/astro-games-integration.mjs";

// The launcher in scripts/astro.mjs sets this to "src-content-test" when the
// `--test` flag is passed, so pages and the sidebar are loaded from test
// content without touching the real content in src/.
const contentRoot =
  process.env.CONTENT_ROOT === "src-content-test" ? "src-content-test" : "src";
const contentDir = fileURLToPath(new URL(`./${contentRoot}`, import.meta.url));
const pagesDir = fileURLToPath(new URL(`./${contentRoot}/pages`, import.meta.url));
const publicDir = fileURLToPath(new URL("./public", import.meta.url));

export default defineConfig({
  srcDir: contentRoot,
  integrations: [gamesIntegration(publicDir)],
  vite: {
    resolve: {
      alias: {
        // Keeps shared components pointed at whichever content root is active.
        "@content": contentDir,
      },
    },
    plugins: [viteGameRoutes(publicDir)],
  },
  // Markdown pages use this layout by default when `layout` is not set in frontmatter.
  markdown: {
    // GitHub-flavored Markdown is enabled by default in Astro.
    remarkPlugins: [
      remarkLocalEmbed,
      remarkRotateMedia,
      [remarkLocalLinks, { pagesDir }],
      remarkEmbedStyles,
      remarkBlockMedia,
      remarkFallbackImages,
    ],
  },
});

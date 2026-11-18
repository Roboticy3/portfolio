import fs from "node:fs";
import path from "node:path";

const insideDir = (dir, target) => {
  const relative = path.relative(dir, target);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
};

// Vite's dev static middleware serves files from `public/` but does not fall
// back to index.html for a folder URL. Astro's built output does, so this
// plugin keeps the clean game route working in dev as well.
export default function viteGameRoutes(publicDir) {
  const root = path.resolve(publicDir);

  return {
    name: "local-game-routes",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();

        let pathname;
        try {
          pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
        } catch {
          return next();
        }

        if (!pathname.startsWith("/games/")) return next();

        const segments = pathname.split("/").filter(Boolean);
        if (segments.length === 0 || /\.[a-z\d]+$/i.test(segments.at(-1))) return next();

        const indexFile = path.resolve(root, `.${pathname}`, "index.html");
        if (
          !insideDir(root, indexFile) ||
          !fs.existsSync(indexFile) ||
          !fs.statSync(indexFile).isFile()
        ) {
          return next();
        }

        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(fs.readFileSync(indexFile));
      });
    },
  };
}

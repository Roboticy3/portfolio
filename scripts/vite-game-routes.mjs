import {
  CONTENT_TYPES,
  TEXT_EXTENSIONS,
  discoverGames,
  gameFileForPathname,
} from "./game-mounts.mjs";

// Vite's dev static middleware serves files from `public/` but does not fall
// back to index.html for a folder URL, and it cannot rewrite absolute routes
// baked into a game's compiled JavaScript. This middleware handles both so the
// embedded site behaves the same as it does after build/preview.
export default function viteGameRoutes(publicDir) {
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

        const game = discoverGames(publicDir).find((candidate) =>
          pathname.startsWith(`${candidate.pathname}/`),
        );
        if (!game) return next();

        const result = gameFileForPathname(game, pathname);
        if (!result) return next();

        // Binary assets are unchanged; let Vite stream them with its own
        // caching and range handling.
        if (!TEXT_EXTENSIONS.has(result.ext)) return next();

        res.setHeader("Content-Type", CONTENT_TYPES[result.ext] ?? "application/octet-stream");
        res.end(result.content);
      });
    },
  };
}

import path from "node:path";
import { fileURLToPath } from "node:url";
import { discoverGames, writeMountedGame } from "./game-mounts.mjs";

// Astro copies `public/` into dist/ as-is. This integration post-processes the
// copied game folders: it rewrites their hardcoded absolute routes to the
// mounted URL and adds clean-URL HTML files for each subroute.
export default function gamesIntegration(publicDir) {
  return {
    name: "local-games",
    hooks: {
      "astro:build:done": ({ dir }) => {
        const outDir = typeof dir === "string" ? dir : fileURLToPath(dir);

        for (const game of discoverGames(publicDir)) {
          writeMountedGame(game, path.join(outDir, "games", game.name, "build"));
        }
      },
    },
  };
}

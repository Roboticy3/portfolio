#!/usr/bin/env node
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";

const TEST_FLAGS = new Set(["--test", "--content-test"]);
const args = process.argv.slice(2);
const useTestContent = args.some((arg) => TEST_FLAGS.has(arg));
const astroArgs = args.filter((arg) => !TEST_FLAGS.has(arg));

if (astroArgs.length === 0) {
  console.error("Usage: node scripts/astro.mjs <dev|build|preview> [--test]");
  process.exit(1);
}

const require = createRequire(import.meta.url);
const astroCli = path.join(
  path.dirname(require.resolve("astro/package.json")),
  "astro.js",
);

const child = spawn(process.execPath, [astroCli, ...astroArgs], {
  stdio: "inherit",
  env: {
    ...process.env,
    CONTENT_ROOT: useTestContent ? "src-content-test" : "src",
  },
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});

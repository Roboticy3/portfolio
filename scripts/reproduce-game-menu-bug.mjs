// Reproduces the Lageta menu bug reported after skipping the tutorial:
// main-menu buttons stop rendering their target pages even though the URL
// changes. Run with `npm run repro:game-menu`, or set BASE_URL to use an
// already running dev/preview server.
//
// The controls are clicked through the DOM (element.click()) rather than with
// Playwright's pointer actions because several of the game's buttons animate
// or sit partly outside their container.

import { spawn } from "node:child_process";
import { chromium } from "playwright";

const port = Number(process.env.PORT ?? 4399);
const baseUrl = process.env.BASE_URL ?? `http://localhost:${port}`;
let server = null;

async function waitForServer(url, timeoutMs = 30000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Server is not up yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

if (!process.env.BASE_URL) {
  server = spawn(process.execPath, ["scripts/astro.mjs", "dev", "--test", "--port", String(port)], {
    stdio: "ignore",
  });
  await waitForServer(baseUrl);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const steps = [];

page.on("pageerror", (error) => console.log("PAGEERROR", error.message));
page.on("response", (response) => {
  if (response.status() >= 400) console.log("HTTP", response.status(), response.url());
});

async function gameFrame() {
  const frame = page.frames().find((candidate) => candidate.url().includes("/games/Lageta/build/"));
  if (!frame) throw new Error("Embedded game frame not found");
  return frame;
}

async function clickText(frame, text) {
  const clicked = await frame.evaluate((label) => {
    const element = Array.from(document.querySelectorAll("button, div, span, a")).find(
      (node) => node.children.length === 0 && node.textContent.trim() === label,
    );
    if (!element) return false;
    element.click();
    return true;
  }, text);

  if (!clicked) throw new Error(`Control not found: ${text}`);
  await page.waitForTimeout(900);

  const state = await frame.evaluate(() => ({
    url: location.href,
    text: document.body.innerText.replace(/\s+/g, " ").trim().slice(0, 160),
  }));
  steps.push({ action: text, ...state });
  console.log(`${text.padEnd(24)} ${state.url}`);
  console.log(`${" ".repeat(24)} ${JSON.stringify(state.text)}`);
  return state;
}

try {
  await page.goto(`${baseUrl}/games/embedded%20game/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);

  let frame = await gameFrame();
  for (const label of [
    "Tutorial",
    "Skip Tutorial",
    "Yes",
    "Next",
    "See Level Select Screen",
    "Back",
  ]) {
    frame = await gameFrame();
    await clickText(frame, label);
  }

  frame = await gameFrame();
  const menu = await frame.evaluate(() => document.body.innerText);
  if (!menu.includes("Continue")) throw new Error("Main menu did not show Continue after Back");

  await clickText(frame, "Continue");
  await page.waitForTimeout(1000);

  frame = await gameFrame();
  const result = await frame.evaluate(() => ({
    url: location.href,
    text: document.body.innerText,
  }));

  const urlChanged = result.url.includes("/campaign/");
  const stillMainMenu = result.text.includes("Continue") && result.text.includes("Tutorials");
  const levelSelectRendered = result.text.includes("Some Kind of Combo");

  console.log("\n--- result ---");
  console.log("URL changed to campaign:", urlChanged);
  console.log("Still rendering main menu:", stillMainMenu);
  console.log("Level select rendered:", levelSelectRendered);

  if (urlChanged && stillMainMenu && !levelSelectRendered) {
    console.log("\nBUG REPRODUCED: Continue changes the URL but the main menu stays on screen.");
    process.exitCode = 0;
  } else {
    console.log("\nBug did not reproduce. Game state may have changed.");
    process.exitCode = 1;
  }
} finally {
  await browser.close();
  server?.kill();
}

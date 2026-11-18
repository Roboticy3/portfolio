---
layout: ../../layouts/MarkdownLayout.astro
title: "Embedded Game"
description: "Loading a local static game inside a Markdown page"
---

An image whose URL points at a local game's `build/` folder embeds it in an iframe:

![The game Lageta](/games/Lageta/build)

The `<style>` marker works on game embeds too, and is applied to the iframe wrapper:

<style="min-height: 800px;, width: 100%;">![The game Lageta, tall](/games/Lageta/build)

Both render an iframe pointing at the static site under `/games/Lageta/build/`, so the embedded site works in dev, build, and preview.

Menu clicks, links, sounds, and direct subroute URLs stay under `/games/Lageta/build/`, so the tutorial, level, options, and tooling pages load inside the iframe too.

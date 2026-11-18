---
layout: ../../layouts/MarkdownLayout.astro
title: "Embedded Game"
description: "Loading a local static game inside a Markdown page"
---

A magic word on its own line embeds a static site that lives under `public/`:

{{embed:/games/Lageta/build/}}

The `game:` shorthand assumes the usual `games/<name>/build` route:

{{game:Lageta}}

Both render an iframe pointing at the same hidden route, so the embedded site works in dev, build, and preview.

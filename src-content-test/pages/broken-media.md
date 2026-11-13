---
layout: ../layouts/MarkdownLayout.astro
title: "Broken Media"
description: "Checks that missing images fall back to their alt text"
---

This image points to a file that does not exist:

![pfp](media/pfp.png)

If the image cannot be loaded, the browser should display the alt text "pfp" instead.

The Markdown source deliberately uses a relative path that does not resolve to a file, so it exercises the missing-media fallback.

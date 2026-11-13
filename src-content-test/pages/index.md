---
layout: ../layouts/MarkdownLayout.astro
title: "Welcome"
description: "Personal site and notes"
---

This is a simple, file-based website. The files inside `src/pages/` define the structure of the site:

- `src/pages/index.md` → `/`
- `src/pages/about.md` → `/about/`
- `src/pages/blog/index.md` → `/blog/`
- `src/pages/blog/my-first-post.md` → `/blog/my-first-post/`

To add a new page or blog entry, create a new Markdown (`.md`) file in the folder where you want it to appear. **How you organize documents is reflected directly in the layout/URLs of the site.**

## What you can do

- Write content in [GitHub-style Markdown](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)
- Embed images and media (see the [example post](/blog/my-first-post/))
- Keep information visible site-wide in the left sidebar (edit `src/sidebar.md`), with longer details on the [About](/about/) page

Get started by editing this file or adding a new post under `src/pages/blog/`.

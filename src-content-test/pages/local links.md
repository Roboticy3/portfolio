---
layout: ../layouts/MarkdownLayout.astro
title: "Local Links"
description: "Internal page link resolution tests"
---

## Absolute links

- [about by file](/about.md)
- [about by route](/about/)
- [nested post](/games/notes/second-note.md)

## Relative links

- [about file](about.md)
- [about bare](about)
- [about folder](./about/)
- [nested post](games/notes/second-note.md)

## Links with anchors

- [about heading](/about.md#more-about-me)
- [relative heading](about.md#more-about-me)

## Links with spaces in the file name

- [encoded space](/media%20rows.md)
- [literal space](</media rows.md>)
- [relative with space](<media rows.md>)

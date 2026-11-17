---
layout: ../../layouts/MarkdownLayout.astro
title: "My First Post"
date: "2026-11-11"
description: "An example blog entry written in GitHub-style Markdown"
---

This is an example blog-style entry written in **GitHub-flavored Markdown**.

## Markdown features

You can use headings, lists, links, and emphasis:

- **Bold** and *italic* text
- [Links](https://example.com)
- Inline `code`

### Task lists

- [x] Create the site
- [x] Write a first post
- [ ] Add more content

### Code blocks

```js
function hello(name) {
  return `Hello, ${name}!`;
}
```

### Blockquotes

> Keep content in Markdown files and let the folder structure define the site.

### Tables

| File | URL |
| --- | --- |
| `src/pages/index.md` | `/` |
| `src/pages/blog/my-first-post.md` | `/blog/my-first-post/` |

## Embedding media-content-test

### Image example

Images can be stored in `public/` and referenced by path. This example uses a generated SVG at `/media-content-test/example.svg`:

<figure>
  <img src="/media-content-test/example.svg" alt="Example embedded SVG illustration" width="640" height="360" />
  <figcaption>An embedded SVG image served from <code>public/media-content-test/example.svg</code>.</figcaption>
</figure>

Markdown syntax for the same image:

![Example embedded SVG illustration](/media-content-test/example.svg)

### Video embed example

HTML works inside Markdown, so you can embed media-content-test such as a YouTube video with an `<iframe>` (valid URL):

<div class="embed">
  <iframe
    src="https://www.youtube.com/embed/jNQXAC9IVRw"
    title="Me at the zoo — first YouTube video"
    loading="lazy"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media-content-test; gyroscope; picture-in-picture; web-share"
    referrerpolicy="strict-origin-when-cross-origin"
    allowfullscreen
  ></iframe>
</div>

Embed syntax:

```html
<div class="embed">
  <iframe
    src="https://www.youtube.com/embed/jNQXAC9IVRw"
    title="Embedded video"
    allowfullscreen
  ></iframe>
</div>
```

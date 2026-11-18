# Personal Markdown Site (Vibecoded Base)

A simple, file-based website for blog-style entries and personal pages written in **GitHub-flavored Markdown**.

## Media layout

Images are sized by what shares their paragraph:

- `![alt](img) some text` — the image is inline and sized to about the text height.
- `![alt](img)` alone on a line — the image is a standalone block.
- `![alt](img) ![alt](img)` with no other text — the images form a row. Each image gets a share of the line's width based on its aspect ratio, so every image in the row has the same height. Two same-sized images take 50% each; a wide image takes more width than a tall one.

Images wrapped in links work the same way. Use the `<style="...">` marker on an image to opt it out of automatic row sizing.

### Local page links

Links to other pages can point at the Markdown source or at the generated URL, using either an absolute path from the content root or a path relative to the current Markdown file:

```md
[About](/about.md)
[About](../about.md)
[About](/about/)
```

These all resolve to `/about/`. Anchors and query strings are preserved, and spaces in file names are encoded. Relative links in shared content such as `src/sidebar.md` are resolved from the site root, so they work on every page. External URLs and links to static files in `public/` are left alone apart from being made root-absolute where needed.

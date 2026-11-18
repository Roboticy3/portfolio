# Content test sandbox

This folder contains sandboxed Markdown content. Run Astro with the `--test` flag to load it instead of `src/`:

```bash
npm run dev -- --test
npm run build -- --test
```

- `pages/` maps to site routes, just like `src/pages/`.
- `sidebar.md` replaces `src/sidebar.md`.
- `layouts/MarkdownLayout.astro` forwards to the real layout in `src/layouts/`, so page frontmatter can keep using `../layouts/MarkdownLayout.astro`.

Layouts, components, and other non-Markdown code always come from `src/`.

The `pages/broken-media.md` page deliberately references a missing file (`media/pfp.png`). Missing local images fall back to regular browser URLs, so the build still succeeds and the browser shows the alt text (`pfp`) instead.

The `pages/rotate.md` page demonstrates the random picker:

```md
<rotate>
- ![pfp](media/pfp1.jpg)
- ![pfp](media/pfp2.jpg)
- ![pfp](media/pfp3.jpg)
```

The `<rotate>` line is removed and one list item is randomly selected on each page load.

The `pages/embed styling.md` page tests layout containment in the center column, and `sidebar.md` includes a large image to test sidebar containment. Individual embeds can be styled with:

```md
<style="width:50%;">![Half-width image](/media/example.jpg)
```

The `<style>` marker is removed and applied to the next image or HTML media element on the same line.

`pages/embed styling.md` also has inline examples. Images that share a paragraph with text auto-size to about the text height; adding a size to the `<style>` marker opts the image out of auto-sizing. Standalone images (alone in their own paragraph) keep their normal size.

The `pages/media rows.md` page tests multiple images on one line. With no other text, the images fill the line in proportion to their aspect ratios, so they all have the same height. That page includes equal images, a tall/wide pair, linked images, and a row with one explicitly sized image.

`pages/local links.md` and `pages/games/notes/link probe.md` test internal links. Absolute and relative links to Markdown files (with or without the `.md` extension), links to generated URLs, anchors, and file names with spaces all resolve to the correct page. The sandbox sidebar also has a relative link, which should resolve identically on every page.

`pages/games/embedded game.md` tests local site embeds. The `{{embed:/games/Lageta/build/}}` and `{{game:Lageta}}` magic words become iframes pointing at the static site under `public/games/Lageta/build/`.

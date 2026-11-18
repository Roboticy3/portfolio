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

These all resolve to `/about/`. Anchors and query strings are preserved, and spaces in file names are encoded. Relative links in shared content such as `src/sidebar.md` are resolved from the site root, so they work on every page.

## Embedding local games

Use an ordinary Markdown image whose URL points at a game's `build/` folder:

```md
![The game Lageta](/games/Lageta/build)
```

The alt text becomes the iframe title. Folder routes get a trailing slash automatically so relative asset URLs inside the embedded site keep working.

The normal `<style>` marker works here too:

```md
<style="min-height: 800px;">![The game Lageta](/games/Lageta/build)
```

The route is served by Astro itself: `npm run dev` reads it from `public/`, `npm run build` copies it into `dist/`, and `npm run preview` serves it from there. No separate server or extra route file is needed.

Subroutes stay inside the mount: navigation calls and absolute links in the game are redirected to the mounted route, root-absolute media is remapped, and subroute `.html` files are also served at clean URLs. The mount path is passed to the iframe through its `name`, so the game does not have to infer it from its own URL. SvelteKit games also get their inline `base` set from that path, so folder routes such as `/campaign/` render the correct page. This works in dev, build, and preview. External URLs and links to static files in `public/` are left alone apart from being made root-absolute where needed.

## Principles

- **Simple over custom:** built with [Astro](https://astro.build/) using plain Markdown pages and minimal configuration.
- **Easy local development & deployment:** standard Node.js workflows (`npm install`, `npm run dev`, `npm run build`).
- **Organization = layout:** the folder and file structure inside `src/pages/` maps directly to the site's URLs.

## Project structure

```text
.
├─ public/                 # Static files served as-is (images, media, etc.)
│  └─ media/               # Put local images/media here (reference as /media/...)
├─ src/
│  ├─ components/
│  │  └─ AboutSidebar.astro # Renders the persistent left sidebar
│  ├─ layouts/             # Page layouts
│  ├─ pages/               # Your content (Markdown) — structure mirrors the site
│  │  ├─ index.md          # /
│  │  ├─ about.md          # /about/ (longer-form about content)
│  │  └─ blog/
│  │     ├─ index.md       # /blog/
│  │     ├─ my-first-post.md
│  │     └─ notes/
│  │        └─ second-note.md  # /blog/notes/second-note/
│  └─ sidebar.md           # Markdown content for the left sidebar (shown on every page)
├─ src-content-test/       # Sandboxed Markdown content used with `--test`
├─ scripts/astro.mjs       # Launcher that handles the `--test` flag
├─ astro.config.mjs
└─ package.json
```

## Adding content

1. Create a new `.md` file in `src/pages/` (or a subfolder).
2. Add frontmatter at the top to set the title/layout:

   ```md
   ---
   layout: ../layouts/MarkdownLayout.astro
   title: "My New Post"
   date: "2026-11-11"
   description: "Optional short description"
   ---

   Write your content here in GitHub-style Markdown.
   ```

   > Adjust the `layout` path based on how deeply nested the file is (e.g. `../../layouts/MarkdownLayout.astro` inside `blog/`).

3. Save the file — its location determines its URL. For example, `src/pages/projects/cool-thing.md` becomes `/projects/cool-thing/`.

### Automatic section indexes

Any `index.md` inside a section folder (for example `src/pages/blog/index.md`) automatically gets an **Entries** list of the other Markdown files in that folder and its subfolders. There is no link list to maintain by hand.

- Entries use each file's `title`, `description`, and `date` frontmatter.
- Entries are sorted by `date`, newest first. Undated entries go last, sorted by title.
- Files named `index.md` are never listed. The site root (`src/pages/index.md`) is the home page, so it does not get a generated list.
- Add `entries: false` to a section index's frontmatter to opt out of the generated list.

### Sidebar content

- The left sidebar is rendered from Markdown in `src/sidebar.md` and shown on every page. Edit it like any other content (text, links, images, etc.).
- Use `src/pages/about.md` for longer-form personal content if desired.

### Rotating media

To pick a random embed on every page load, put a Markdown list directly under a `<rotate>` line:

```md
<rotate>
- ![pfp](media/pfp1.jpg)
- ![pfp](media/pfp2.jpg)
- ![pfp](media/pfp3.jpg)
```

The `<rotate>` marker is removed and one list item is shown at random. Each option can be an image, a figure, or another embedded media element. Keep the list items on consecutive lines — a blank line ends the block.

### Embedding local games

Put a magic word on its own line to mount a static site from `public/games/` inside the page:

```md
{{embed:/games/Lageta/build/}}
```

`{{game:Lageta}}` is shorthand for the same `games/<name>/build` route. The word becomes an iframe pointing at the hidden route. Folder routes get a trailing slash automatically so relative asset URLs inside the embedded site resolve correctly.

Astro already handles the route in every mode: `npm run dev` serves `public/` directly, `npm run build` copies it into `dist/`, and `npm run preview` serves those copied files from the same path. No separate server or route file is needed — just drop a game's build folder in `public/games/<name>/build/`.

Subroutes stay inside the mount. Absolute links baked into a game's compiled files (for example `/tutorial/...`) are rewritten to the mounted route, and each subroute's `.html` file is also reachable at its clean URL (`.../build/tutorial/Tutorial`). This happens on the fly in dev and in the copied files during build.

### Embedding media

- **Local files:** put images/media in `public/media/` and reference them by path (e.g. `/media/example.svg`).
  ```md
  ![Alt text](/media/example.svg)
  ```
- **HTML embeds:** standard HTML works inside Markdown, so you can include images, iframes, audio/video, etc. (see `src/pages/blog/my-first-post.md` for working image and YouTube embed examples). Avoid wrapping embeds in code fences unless you want to show the syntax.

Media is automatically contained within the sidebar or center column. To customize a single embed, put a `<style>` marker before it on the same line:

```md
<style="width:50%;">![Half-width image](/media/example.jpg)
<style="width:50%;"><iframe src="https://example.com/embed"></iframe>
```

The marker is removed and its CSS is applied to the embed element. Normal containment rules still apply, so an embed cannot grow wider than its container.

Images placed inline with text (in the same paragraph) automatically shrink to about the text height, so they flow with the sentence:

```md
Here is an inline icon ![logo](/media/logo.svg) in a sentence.
```

If you set a size with the `<style>` marker, the image keeps that size instead:

```md
Here is a larger inline image <style="width:120px;">![chart](/media/chart.png) in a sentence.
```

Images that sit alone in their own paragraph are treated as standalone block media and keep their normal size.

## Local development

Requirements: [Node.js](https://nodejs.org/) (v18+ recommended).

```bash
npm install
npm run dev
```

Then open the local URL shown in the terminal (usually `http://localhost:4321`).

## Build

```bash
npm run build
npm run preview   # preview the production build locally
```

The static site is output to `dist/`.

## Testing with sandboxed content

To load Markdown pages and the sidebar from `src-content-test/` instead of `src/`, pass the `--test` flag:

```bash
npm run dev -- --test
npm run build -- --test
```

- Pages come from `src-content-test/pages/` instead of `src/pages/`.
- The sidebar comes from `src-content-test/sidebar.md` instead of `src/sidebar.md`.
- Layouts and components still come from `src/`, so only the Markdown content changes.
- `--content-test` is accepted as an alias for `--test`.

The sandbox includes `/broken-media/`, which uses `![pfp](media/pfp.png)` to test missing-media handling.

Missing local images are rendered as regular root-relative URLs instead of build-time imports. That means the build succeeds and the browser displays the image's alt text when the media 404s — for example, `![pfp](media/pfp.png)` displays `pfp`.

Without the flag, the site uses `src/` as usual.

## Deployment

Because this builds to a static `dist/` folder, it can be deployed easily to many hosts:

- **GitHub Pages:** build in CI and publish the `dist/` folder (or use an Astro GitHub Pages action).
- **Netlify:** build command `npm run build`, publish directory `dist`.
- **Vercel / Cloudflare Pages:** framework preset Astro, or build `npm run build` with output `dist`.
- **Any static host:** upload the contents of `dist/`.

No server or database is required — content lives in Markdown files in the repository.
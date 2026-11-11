# Personal Markdown Site (Vibecoded Base)

A simple, file-based website for blog-style entries and personal pages written in **GitHub-flavored Markdown**.

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

### Sidebar content

- The left sidebar is rendered from Markdown in `src/sidebar.md` and shown on every page. Edit it like any other content (text, links, images, etc.).
- Use `src/pages/about.md` for longer-form personal content if desired.

### Embedding media

- **Local files:** put images/media in `public/media/` and reference them by path (e.g. `/media/example.svg`).
  ```md
  ![Alt text](/media/example.svg)
  ```
- **HTML embeds:** standard HTML works inside Markdown, so you can include images, iframes, audio/video, etc. (see `src/pages/blog/my-first-post.md` for working image and YouTube embed examples). Avoid wrapping embeds in code fences unless you want to show the syntax.

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

## Deployment

Because this builds to a static `dist/` folder, it can be deployed easily to many hosts:

- **GitHub Pages:** build in CI and publish the `dist/` folder (or use an Astro GitHub Pages action).
- **Netlify:** build command `npm run build`, publish directory `dist`.
- **Vercel / Cloudflare Pages:** framework preset Astro, or build `npm run build` with output `dist`.
- **Any static host:** upload the contents of `dist/`.

No server or database is required — content lives in Markdown files in the repository.
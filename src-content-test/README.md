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

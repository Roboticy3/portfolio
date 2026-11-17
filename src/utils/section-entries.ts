interface Frontmatter {
  [key: string]: unknown;
}

interface MarkdownPageModule {
  frontmatter?: Frontmatter;
}

interface PageInfo {
  relativePath: string;
  directory: string;
  fileName: string;
  isIndex: boolean;
  route: string;
  load: () => Promise<MarkdownPageModule>;
}

export interface SectionEntry {
  href: string;
  title: string;
  date?: string;
  description?: string;
}

// Lazy globs avoid a circular import: the current page loads its layout before
// this utility is evaluated, so eagerly importing every page would read
// frontmatter while that page module is still initializing.
// The @content alias follows the active content root (src/ or src-content-test/).
const pageLoaders = import.meta.glob<MarkdownPageModule>("@content/pages/**/*.md");

const withoutTrailingSlash = (path: string) => path.replace(/\/+$/, "") || "/";

function relativePathFromKey(key: string): string {
  const normalized = key.replace(/\\/g, "/");
  const marker = "/pages/";
  const start = normalized.indexOf(marker);
  return start === -1 ? "" : normalized.slice(start + marker.length);
}

function routeFromPath(relativePath: string): string {
  const segments = relativePath.replace(/\.md$/i, "").split("/");
  if (segments.at(-1)?.toLowerCase() === "index") segments.pop();
  return withoutTrailingSlash(`/${segments.join("/")}`);
}

function hrefFromRoute(route: string): string {
  const segments = route.split("/").filter(Boolean);
  return `/${segments.map(encodeURIComponent).join("/")}/`;
}

function labelFromFileName(fileName: string): string {
  return fileName
    .replace(/\.md$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function asText(value: unknown): string | undefined {
  if (value == null) return undefined;
  const text = String(value).trim();
  return text || undefined;
}

const pages: PageInfo[] = Object.entries(pageLoaders)
  .map(([key, load]) => {
    const relativePath = relativePathFromKey(key);
    const segments = relativePath.split("/");
    const fileName = segments.at(-1) ?? "";
    return {
      relativePath,
      directory: segments.slice(0, -1).join("/"),
      fileName,
      isIndex: fileName.toLowerCase() === "index.md",
      route: routeFromPath(relativePath),
      load,
    };
  })
  .filter((page) => page.relativePath.length > 0);

function decodePathname(pathname: string): string {
  try {
    return withoutTrailingSlash(decodeURI(pathname));
  } catch {
    return withoutTrailingSlash(pathname);
  }
}

function timestampOf(entry: SectionEntry): number {
  if (!entry.date) return Number.NEGATIVE_INFINITY;
  const time = Date.parse(entry.date);
  return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
}

/**
 * Builds the entry list for a section's index.md page.
 * Returns null when the current route is not an index page, so ordinary
 * Markdown pages never get a generated list.
 */
export async function getSectionEntries(
  pathname: string,
): Promise<SectionEntry[] | null> {
  const route = decodePathname(pathname);
  const indexPage = pages.find((page) => page.isIndex && page.route === route);

  // The root index is the home page rather than a content section.
  if (!indexPage || indexPage.directory === "") return null;

  const nestedPrefix = `${indexPage.directory}/`;
  const candidates = pages.filter(
    (page) =>
      !page.isIndex &&
      (page.directory === indexPage.directory ||
        page.directory.startsWith(nestedPrefix)),
  );
  const modules = await Promise.all(candidates.map((page) => page.load()));

  return candidates
    .map((page, index) => {
      const frontmatter = modules[index]?.frontmatter ?? {};
      return {
        href: hrefFromRoute(page.route),
        title: asText(frontmatter.title) ?? labelFromFileName(page.fileName),
        date: asText(frontmatter.date),
        description: asText(frontmatter.description),
      };
    })
    .sort((a, b) => {
      const aTime = timestampOf(a);
      const bTime = timestampOf(b);
      if (aTime !== bTime) return bTime - aTime;
      return a.title.localeCompare(b.title);
    });
}

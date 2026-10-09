import pages from "../pages.json";

export { pages };

export function pageUrl(id: string): string {
  const page = pages.find((entry) => entry.id === id);
  if (!page) throw new Error(`Unknown documentation page: ${id}`);
  return `${import.meta.env.BASE_URL}${page.path}`;
}

export function currentPage(pathname = window.location.pathname) {
  const normalized = pathname.replace(/index\.html$/, "").replace(/\/?$/, "/");
  return pages.find((page) => pageUrl(page.id) === normalized);
}

/** Preserve bookmarks from the original one-page site without hijacking local anchors. */
export function legacyDestination(location: Pick<Location, "pathname" | "hash" | "search">) {
  if (currentPage(location.pathname)?.id !== "home") return;
  const id = location.hash.slice(1);
  const destination =
    id === "tokens" || id === "theme-recipe" || id === "theme-studio" ? "themes" : id;
  if (destination !== "home" && pages.some((page) => page.id === destination)) {
    return `${pageUrl(destination)}${location.search}${location.hash}`;
  }
}

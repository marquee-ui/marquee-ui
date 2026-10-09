# Docs pages and Tide branding

Requested 2026-10-09: export the existing Tide `m.` for GitHub and split the long
homepage into logical pages. This work does not authorize publication.

## Result

- Home keeps the introduction, live card and principles.
- `/getting-started/` holds setup and installation.
- `/components/` holds the 35-family explorer, with a bounded scrolling index.
- `/themes/` holds a live card, token swatches and the selected CSS recipe.
- `/guides/` holds the supported stack; its local navigation links to
  `/guides/composition/`, `/guides/contracts/` and `/guides/recipes/`.

All paths live beneath `/marquee-ui/`. The shared header marks the current page;
the mobile menu closes after navigation. Theme settings persist across documents.
Old homepage section bookmarks redirect to their corresponding pages, retaining
the query and fragment. Skip links remain local to each document.

`apps/docs/pages.json` is the route/title inventory. The docs build writes a real
`index.html` per path plus a recovery page at `404.html`, preserving the Vite base
path for scripts, styles, fonts and Storybook. This does not require a host rewrite
to return the homepage for every URL.

The [brand assets](../../brand/README.md) include 512 and 1024 square PNGs and a
1280 × 640 social preview. The export script renders the website's actual Tide
mark and local font in Chromium; the palette and lettering are unchanged. The
files are intended for manual upload and do not change GitHub settings.

## Validation

New browser cases first failed on the old build for the long home, missing nested
page titles and unchanged legacy URLs. The final checks cover separate-page
navigation, static nested documents, refresh, back/forward, legacy bookmarks,
current-page markers, theme persistence and missing-page recovery at 390, 768 and
1280 pixels. Existing component, composition and syntax journeys now visit their
own pages; their behavior and paint assertions remain.

The theme matrix still compares all eight palette/mode combinations against real
component and composition previews, opening their new pages in the same browser
context. It continues to prove that using theme controls does not reload the
active document.

Full verification, captures and the final preview handoff are retained under
`/home/ankit/.marquee-scratch/DOCS-PAGES-1/`. Package source and the prepared UI
0.2.0 registry/tarball are unchanged by this docs/branding work. Public release
remains held.

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import upstreamNav from "./fixtures/upstream-nav-classes.json" with { type: "json" };
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbPageItem,
  BreadcrumbSeparator,
} from "@/breadcrumb";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/pagination";

/**
 * THE REFERENCE CONSUMER'S OWN INSTRUMENTS, RUN HERE, AGAINST THE REAL PARTS.
 *
 * A moved part keeps a promise the fidelity suite cannot see: the consumer's
 * tests resolve its elements BY ROLE, BY ACCESSIBLE NAME and BY TEST ID, and a
 * part that renders the same pixels through a different tree or a different name
 * reddens a repository this suite cannot run. That is not hypothetical - the
 * Switch put `role="switch"` on its native checkbox and the consumer's probe,
 * which resolved `[role="switch"]` first-in-document-order, re-resolved onto the
 * wrong element and read null for everything it measured. It was found by holding
 * the real parts against the real probe, which is what this file automates.
 *
 * So the six assertions of the consumer's `Breadcrumb.test.tsx`, its three
 * `data-testid` probes and its pager e2e are restated here against a render
 * composed the way the consumption checklist in `docs/as-built.md` says the call
 * sites will compose it. Every name is READ from `upstream-nav-classes.json`
 * (which the extractor read out of the consumer with `git show`), never typed:
 * the landmark name is a contract, and a contract typed twice is a contract that
 * can disagree with itself.
 *
 * ⚠️ WHAT THIS FILE CANNOT DO. jsdom lays nothing out, so nothing here sees a
 * tap, a truncation or a box. Two of the consumer's six assertions are class
 * rails for that reason (its own comments say so), and the properties behind them
 * are measured in resolved declarations in `tailwind-compile.test.tsx` instead.
 * What this file measures is RESOLUTION: which element each probe lands on.
 */

const NAV_LABEL = upstreamNav.contracts["breadcrumb.navLabel"];
const TEST_ID = upstreamNav.contracts["breadcrumb.testId"];
const PAGER_LABEL = upstreamNav.contracts["pagination.navLabel"];
/** The consumer builds its per-link name from a template: `Page ${p}`. */
const pageLabel = (page: number) =>
  upstreamNav.contracts["pagination.linkLabel"].replace("${p}", String(page));

type Crumb = { name: string; path: string | null };

const TRAIL: readonly Crumb[] = [
  { name: "Start", path: "/" },
  { name: "A section", path: "/section" },
  { name: "The page you are on", path: null },
];

/**
 * The consumption shape, exactly as the checklist states it: the call site keeps
 * the test id and the landmark name, chooses the ITEM part by whether the step is
 * a link, and puts the separator INSIDE the item it precedes.
 */
function Trail({ crumbs = TRAIL }: { crumbs?: readonly Crumb[] }) {
  return (
    <Breadcrumb data-testid={TEST_ID}>
      <BreadcrumbList>
        {crumbs.map((crumb, index) =>
          crumb.path === null ? (
            <BreadcrumbPageItem key={crumb.name}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
            </BreadcrumbPageItem>
          ) : (
            <BreadcrumbItem key={crumb.path}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbLink asChild>
                <a href={crumb.path}>{crumb.name}</a>
              </BreadcrumbLink>
            </BreadcrumbItem>
          ),
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

/** The pager's consumption shape: a window with a gap, page 2 current. */
function Pager({ pages = [1, 2, 3, 9], current = 2 }: { pages?: number[]; current?: number }) {
  return (
    <Pagination className="mt-2">
      <PaginationContent>
        {pages.map((page, index) => (
          <PaginationItem key={page}>
            {index > 0 && page - pages[index - 1]! > 1 && <PaginationEllipsis />}
            <PaginationLink asChild isActive={page === current} aria-label={pageLabel(page)}>
              <a href={`/${page}`}>{page}</a>
            </PaginationLink>
          </PaginationItem>
        ))}
      </PaginationContent>
    </Pagination>
  );
}

afterEach(cleanup);

describe("the contracts the consumer's instruments resolve by", () => {
  it("reads its names out of the fixture rather than out of this file", () => {
    // Anchor: every assertion below compares against these four, and a fixture
    // that silently lost its `contracts` map would make them all vacuous.
    expect(NAV_LABEL).toBe("Breadcrumb");
    expect(TEST_ID).toBe("breadcrumb");
    expect(PAGER_LABEL).toBe("Pages");
    expect(pageLabel(2)).toBe("Page 2");
  });

  /**
   * `Breadcrumb.test.tsx`, test 1. ⚠️ The name is CASE-SENSITIVE in the
   * consumer's instrument: `getByRole("navigation", { name: "Breadcrumb" })`
   * matches the accessible name exactly, so shadcn's lowercase `"breadcrumb"`
   * default would redden it. The part therefore defaults to the consumer's own
   * spelling, and this asserts the default rather than a passed prop.
   */
  it("names itself as a breadcrumb so a screen reader can skip to or past it", () => {
    render(<Trail />);
    expect(screen.getByRole("navigation", { name: NAV_LABEL })).toBeInTheDocument();
  });

  /** `Breadcrumb.test.tsx`, test 2. */
  it("links every step except the one you are standing on", () => {
    render(<Trail />);
    const nav = screen.getByRole("navigation", { name: NAV_LABEL });
    const links = within(nav).getAllByRole("link");
    expect(links.map((a) => a.textContent)).toEqual(["Start", "A section"]);
    expect(links.map((a) => a.getAttribute("href"))).toEqual(["/", "/section"]);
    expect(within(nav).getByText("The page you are on")).toBeInTheDocument();
    expect(within(nav).queryByRole("link", { name: "The page you are on" })).toBeNull();
  });

  /** `Breadcrumb.test.tsx`, test 3. */
  it("marks the step you are standing on as the current page", () => {
    render(<Trail />);
    expect(screen.getByText("The page you are on")).toHaveAttribute("aria-current", "page");
  });

  /**
   * `Breadcrumb.test.tsx`, test 4, and the one that decides the separator's
   * SHAPE. The consumer strips a leading `·` off each list item's text, so the
   * separator has to live INSIDE the item it precedes. shadcn's breadcrumb makes
   * it a sibling `<li role="presentation">` instead, which would put five items
   * in this list and redden that test by two extra rows.
   */
  it("renders the steps in trail order, as one list", () => {
    render(<Trail />);
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items.map((li) => li.textContent?.replace(/^·\s*/, ""))).toEqual([
      "Start",
      "A section",
      "The page you are on",
    ]);
  });

  /**
   * `Breadcrumb.test.tsx`, test 5. ⚠️ It greps the LITERAL `min-h-11`, so the
   * house's own `min-h-hit` - the same 44px - would redden it. The rename table
   * carries no entry for `min-h-11` for exactly this reason: a moved part keeps
   * the spelling its consumer's instruments read.
   */
  it("gives every tappable step the 44px floor", () => {
    render(<Trail />);
    for (const link of screen.getAllByRole("link")) {
      expect(link.className).toContain("min-h-11");
    }
  });

  /** `Breadcrumb.test.tsx`, test 6: the UIA-12 invariant, as the consumer rails on it. */
  it("keeps the linked steps unshrinkable, so they cannot stack", () => {
    render(<Trail />);
    for (const link of screen.getAllByRole("link")) {
      expect(link.closest("li")!.className).toContain("shrink-0");
    }
    // …and the one item that MAY shrink is the current page's, which is what the
    // links are protected from. Both halves, or "nothing shrinks" would pass.
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items.filter((li) => !li.className.includes("shrink-0"))).toHaveLength(1);
  });

  /**
   * `e2e/seo.spec.ts:371`, `e2e/a11y.spec.ts:450` and `e2e/mobile-390.spec.ts:883`
   * all resolve the trail by test id: the first hit-tests the links inside it, the
   * second EXCLUDES the trail's links from a tap-theft sweep by
   * `a.closest('[data-testid="breadcrumb"]')`, and the third walks up from it to
   * the shell. All three need the id on an ancestor of the links, and the part
   * spreads props, so the call site keeps writing it.
   */
  it("puts the call site's test id on the landmark itself, above every link", () => {
    render(<Trail />);
    const tagged = screen.getByTestId(TEST_ID);
    expect(tagged.tagName).toBe("NAV");
    expect(tagged).toBe(screen.getByRole("navigation", { name: NAV_LABEL }));
    for (const link of screen.getAllByRole("link")) {
      expect(link.closest(`[data-testid="${TEST_ID}"]`)).toBe(tagged);
    }
  });

  /**
   * `e2e/hubs.spec.ts:565`: the pager is found by its landmark name and the page
   * link by the WHOLE phrase, `"Page 2"` and not `"2"` (that spec's own comment
   * records the 30s timeout the numeral cost). The name is the call site's
   * `aria-label`, so the part must not write one of its own onto a link.
   */
  it("resolves the pager by its landmark name and each page by its whole phrase", () => {
    render(<Pager />);
    const nav = screen.getByRole("navigation", { name: PAGER_LABEL });
    const link = within(nav).getByRole("link", { name: pageLabel(2) });
    expect(link).toHaveAttribute("href", "/2");
    expect(link).toHaveAttribute("aria-current", "page");
    // The numeral alone resolves to nothing, exactly as it does in the consumer:
    // the accessible name is the label, not the text.
    expect(within(nav).queryByRole("link", { name: "2" })).toBeNull();
    // Every other page link is a link and is NOT announced as current.
    const others = within(nav)
      .getAllByRole("link")
      .filter((a) => a !== link);
    expect(others.map((a) => a.getAttribute("aria-label"))).toEqual([
      pageLabel(1),
      pageLabel(3),
      pageLabel(9),
    ]);
    expect(others.filter((a) => a.hasAttribute("aria-current"))).toEqual([]);
  });

  /**
   * The gap dot is decoration, not a step: the pager's `ul` must hold one item
   * per PAGE, and the dot must not be announced. The consumer's window puts the
   * dot inside the item it precedes, like the trail's separator.
   */
  it("keeps the gap dot out of the accessibility tree and out of the item count", () => {
    render(<Pager />);
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items).toHaveLength(4);
    const dots = document.querySelectorAll('[data-slot="pagination-ellipsis"]');
    expect(dots).toHaveLength(1);
    expect(dots[0]).toHaveAttribute("aria-hidden", "true");
    expect(dots[0]!.textContent).toBe("·");
    // It sits in the item it precedes, so it is the 4th page's row that shows it.
    expect(items[3]).toContainElement(dots[0] as HTMLElement);
  });

  /** The trail's separator is the same glyph, hidden the same way, and a slot. */
  it("hides the trail's separator and lets a caller replace the glyph", () => {
    render(<Trail />);
    const separators = document.querySelectorAll('[data-slot="breadcrumb-separator"]');
    expect(separators).toHaveLength(2);
    for (const separator of separators) {
      expect(separator).toHaveAttribute("aria-hidden", "true");
      expect(separator.textContent).toBe("·");
    }
    cleanup();
    render(<BreadcrumbSeparator>/</BreadcrumbSeparator>);
    expect(document.querySelector('[data-slot="breadcrumb-separator"]')!.textContent).toBe("/");
  });

  /**
   * The landmark names are DEFAULTS, not decisions: a second pager on one page,
   * or a consumer with its own wording, renames either landmark without touching
   * the part. `aria-label` is destructured rather than spread, so a caller who
   * passes one wins and a caller who passes none still gets a named landmark.
   */
  it("lets the caller rename either landmark", () => {
    render(
      <Breadcrumb aria-label="Where you are">
        <BreadcrumbList />
      </Breadcrumb>,
    );
    expect(screen.getByRole("navigation", { name: "Where you are" })).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: NAV_LABEL })).toBeNull();
    cleanup();
    render(
      <Pagination aria-label="Review pages">
        <PaginationContent />
      </Pagination>,
    );
    expect(screen.getByRole("navigation", { name: "Review pages" })).toBeInTheDocument();
  });

  /**
   * One prop decides the ink AND the announcement, so they cannot disagree - the
   * Switch's rule in a second shape. A caller's `aria-current` does not survive,
   * deliberately: a link announced as current while drawn as any other page is
   * the exact disagreement `isActive` exists to prevent.
   */
  it("derives the current page's announcement from the same prop as its ink", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="/1" aria-label={pageLabel(1)} aria-current="page">
              1
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    const link = screen.getByRole("link", { name: pageLabel(1) });
    expect(link.hasAttribute("aria-current")).toBe(false);
  });
});

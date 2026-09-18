import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/pagination";

const meta = { title: "Parts/Pagination", component: Pagination } satisfies Meta<typeof Pagination>;
export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The window a caller hands the part, and the shape every call site takes: one
 * item per page, `isActive` on the page you are on, an `aria-label` per link
 * (a link reading "2" announces "2"), and a gap dot inside the item that follows
 * a skipped run.
 *
 * WHICH pages are in the window is not this part's decision - it renders what it
 * is given - so the stories hand it the windows a real pager produces.
 */
function Pager({
  pages,
  current,
  first = false,
}: {
  pages: number[];
  current: number;
  first?: boolean;
}) {
  return (
    <Pagination className="mt-2">
      <PaginationContent>
        {pages.map((page, index) => (
          <PaginationItem key={page}>
            {index > 0 && page - pages[index - 1]! > 1 && <PaginationEllipsis />}
            {/* The first link uses the part's own anchor and the rest `asChild`,
                so both branches are on the workbench: an app passes its router's
                link, and a plain page passes nothing. */}
            {index === 0 && first ? (
              <PaginationLink
                href={`/${page}`}
                aria-label={`Page ${page}`}
                isActive={page === current}
              >
                {page}
              </PaginationLink>
            ) : (
              <PaginationLink asChild isActive={page === current} aria-label={`Page ${page}`}>
                <a href={`/${page}`}>{page}</a>
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
      </PaginationContent>
    </Pagination>
  );
}

/** Early in a long collection: the last page stays one hop away, behind a dot. */
export const Window: Story = {
  render: () => <Pager pages={[1, 2, 3, 9]} current={2} first />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole("navigation", { name: "Pages" });
    // Resolved by the WHOLE phrase, which is how a pager's links are found: the
    // accessible name is the label, not the numeral inside the box.
    const current = within(nav).getByRole("link", { name: "Page 2" });
    await expect(current).toHaveAttribute("aria-current", "page");
    await expect(within(nav).queryByRole("link", { name: "2" })).toBeNull();

    // One item per page, and exactly one of them announced as current.
    const items = within(canvas.getByRole("list")).getAllByRole("listitem");
    await expect(items).toHaveLength(4);
    const links = within(nav).getAllByRole("link");
    await expect(links.filter((a) => a.hasAttribute("aria-current"))).toHaveLength(1);

    // The gap dot is decoration: hidden, and inside the item it precedes.
    const dots = nav.querySelectorAll('[data-slot="pagination-ellipsis"]');
    await expect(dots).toHaveLength(1);
    await expect(dots[0]).toHaveAttribute("aria-hidden", "true");
    await expect(items[3]).toContainElement(dots[0] as HTMLElement);
  },
};

/** Standing on the last page, which is where the window skips in front of you. */
export const LastPage: Story = {
  render: () => <Pager pages={[1, 2, 8, 9]} current={9} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole("navigation", { name: "Pages" });
    const links = within(nav).getAllByRole("link");
    // The current page is the LAST link, and it is still a link: a pager that
    // dropped the link on the page you are on would break a crawler's walk back.
    await expect(links[links.length - 1]).toHaveAttribute("aria-current", "page");
    await expect(links[links.length - 1]).toHaveAttribute("href", "/9");
    await expect(links.filter((a) => a.hasAttribute("aria-current"))).toHaveLength(1);
  },
};

/** A collection that fits on one page: one cell, no dot, and it is current. */
export const SinglePage: Story = {
  render: () => <Pager pages={[1]} current={1} first />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole("navigation", { name: "Pages" });
    await expect(within(nav).getAllByRole("link")).toHaveLength(1);
    await expect(within(nav).getByRole("link", { name: "Page 1" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(nav.querySelectorAll('[data-slot="pagination-ellipsis"]')).toHaveLength(0);
  },
};

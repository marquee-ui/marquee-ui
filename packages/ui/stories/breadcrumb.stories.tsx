import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbPageItem,
  BreadcrumbSeparator,
} from "@/breadcrumb";

const meta = { title: "Parts/Breadcrumb", component: Breadcrumb } satisfies Meta<typeof Breadcrumb>;
export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The shape every call site takes: the separator sits INSIDE the item it
 * precedes, a linked step is a `BreadcrumbItem` and the step you are standing on
 * is a `BreadcrumbPageItem`, which is the only one that may give way.
 *
 * The first link uses `asChild` (a router's own link, the common case in an app)
 * and the second the part's own anchor, so both branches are on the workbench.
 */
export const Trail: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <a href="/">Start</a>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbLink href="/section">A section</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbPageItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>This page</BreadcrumbPage>
        </BreadcrumbPageItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The landmark names itself without being told to, which is what lets a
    // screen reader skip to or past the trail.
    const nav = canvas.getByRole("navigation", { name: "Breadcrumb" });
    await expect(within(nav).getAllByRole("link")).toHaveLength(2);
    // The step you are standing on is on screen and is NOT a link. Anchored on
    // the positive: a link count alone would pass on a trail that dropped it.
    await expect(within(nav).getByText("This page")).toHaveAttribute("aria-current", "page");
    await expect(within(nav).queryByRole("link", { name: "This page" })).toBeNull();

    // One list, three items, and the punctuation inside the items rather than
    // between them: a separator as its own list item would read as a step.
    const items = within(canvas.getByRole("list")).getAllByRole("listitem");
    await expect(items).toHaveLength(3);
    const separators = nav.querySelectorAll('[data-slot="breadcrumb-separator"]');
    await expect(separators).toHaveLength(2);
    await expect(items[1]).toContainElement(separators[0] as HTMLElement);
    await expect(items[2]).toContainElement(separators[1] as HTMLElement);
  },
};

/**
 * The truncation the one-line rule is FOR: a long current step gives way inside a
 * narrow column while both links keep their whole tap band. jsdom lays nothing
 * out, so this story has no `play` - the box is not observable here, and the
 * declarations behind it (`flex-shrink: 0` on the links' items, `min-width: 0`
 * and an ellipsis on the current one) are measured in
 * `test/tailwind-compile.test.tsx` against the compiled stylesheet.
 */
export const LongCurrentPage: Story = {
  render: () => (
    <div className="w-56">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Start</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbLink href="/section">A section</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbPageItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>
              A current step whose name is far too long for this column
            </BreadcrumbPage>
          </BreadcrumbPageItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  ),
};

/** One step: the page you are on, with nothing above it and no separator. */
export const OneStep: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbPageItem>
          <BreadcrumbPage>This page</BreadcrumbPage>
        </BreadcrumbPageItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole("navigation", { name: "Breadcrumb" });
    await expect(within(nav).getByText("This page")).toHaveAttribute("aria-current", "page");
    // No separator before the first step, and nothing to navigate to.
    await expect(nav.querySelectorAll('[data-slot="breadcrumb-separator"]')).toHaveLength(0);
    await expect(within(nav).queryAllByRole("link")).toHaveLength(0);
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Separator } from "@/separator";

const meta = { title: "Parts/Separator", component: Separator } satisfies Meta<typeof Separator>;
export default meta;

type Story = StoryObj<typeof meta>;

/**
 * MEANINGFUL by default. Radix's `decorative` defaults to false, and this part
 * does not override it: a rule that divides two regions is the common case, and
 * the accessible answer is the one you get without reading the props.
 */
export const Horizontal: Story = {
  play: async ({ canvasElement }) => {
    const rule = within(canvasElement).getByRole("separator");
    await expect(rule).toHaveAttribute("data-orientation", "horizontal");
  },
};

/** Opted out: pure decoration, so it is kept out of the accessibility tree. */
export const Decorative: Story = {
  args: { decorative: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("separator")).toBeNull();
  },
};

export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <div className="flex h-8 items-center gap-3">
      <span>one</span>
      <Separator {...args} />
      <span>two</span>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("separator")).toHaveAttribute(
      "data-orientation",
      "vertical",
    );
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Input } from "@/input";
import { Label } from "@/label";

const meta = {
  title: "Parts/Label",
  component: Label,
  args: { children: "Display name" },
} satisfies Meta<typeof Label>;
export default meta;

type Story = StoryObj<typeof meta>;

/** A real label: it NAMES the field, which is what `htmlFor` buys. */
export const Default: Story = {
  render: (args) => (
    <div className="flex flex-col gap-1">
      <Label {...args} htmlFor="display-name" />
      <Input id="display-name" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // `getByLabelText` resolves through the accessibility tree, so this fails if
    // the `for`/`id` pair is broken - which is the whole job of the part.
    await expect(canvas.getByLabelText("Display name")).toHaveAttribute("data-slot", "input");
    await expect(canvas.getByText("Display name").tagName).toBe("LABEL");
  },
};

/** The mono micro-caps section label, as a tone rather than an eleventh part. */
export const Micro: Story = {
  args: { tone: "micro", children: "Last played" },
};

/**
 * `asChild` for the common case where the micro-caps treatment is wanted on
 * something that is not a form label: a section heading has no field to name, and
 * a `<label>` around it would be a lie told to assistive technology.
 */
export const MicroAsHeading: Story = {
  args: { tone: "micro", asChild: true, children: <h2>Recently finished</h2> },
  play: async ({ canvasElement }) => {
    const heading = within(canvasElement).getByRole("heading", { name: "Recently finished" });
    await expect(heading.tagName).toBe("H2");
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { Ribbon } from "@/ribbon";

const meta = {
  title: "Parts/Ribbon",
  component: Ribbon,
  args: { items: ["Player scores only", "No critics, ever", "Free forever"] },
  decorators: [
    (Story) => (
      <div className="relative h-40 overflow-x-clip">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Ribbon>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const ribbon = canvasElement.querySelector('[data-slot="ribbon"]');
    await expect(ribbon).not.toBeNull();
    const halves = Array.from(ribbon!.querySelectorAll("span")).map((s) => s.textContent ?? "");
    // Two IDENTICAL halves is what makes the -50% translation loop seamlessly.
    await expect(halves).toHaveLength(2);
    await expect(halves[1]).toBe(halves[0]);
    await expect(halves[0]).toContain("No critics, ever");
    // Decorative: the band's text is never read out twice.
    await expect(canvasElement.querySelector('[data-slot="ribbon-track"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  },
};

export const OneClaim: Story = { args: { items: ["Free forever"] } };

export const CustomSeparator: Story = {
  args: { items: ["Log it", "Rate it", "Move on"], separator: " / " },
};

/** No claims, no band: there is nothing to repeat, and no ribbon to draw. */
export const Empty: Story = {
  args: { items: [] },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-slot="ribbon"]')).toBeNull();
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Badge } from "@/badge";

const meta = {
  title: "Parts/Badge",
  component: Badge,
  args: { children: "Backlog" },
} satisfies Meta<typeof Badge>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Primary: Story = { args: { tone: "primary", children: "Playing" } };
export const Destructive: Story = { args: { tone: "destructive", children: "Abandoned" } };
export const Success: Story = { args: { tone: "success", children: "Finished" } };

/** `asChild` makes the badge a link without the badge knowing what a router is. */
export const AsChildLink: Story = {
  args: { asChild: true, tone: "primary", children: <a href="/status/playing">Playing</a> },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link", { name: "Playing" });
    await expect(link.tagName).toBe("A");
    await expect(link).toHaveAttribute("data-slot", "badge");
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/accordion";

const meta = { title: "Parts/Accordion", component: Accordion } satisfies Meta<typeof Accordion>;
export default meta;

type Story = StoryObj<typeof meta>;

const items = (
  <>
    <AccordionItem value="one">
      <AccordionTrigger>What counts as finished?</AccordionTrigger>
      <AccordionContent>Whatever you say counts. The credits are a suggestion.</AccordionContent>
    </AccordionItem>
    <AccordionItem value="two">
      <AccordionTrigger>Can I log the same game twice?</AccordionTrigger>
      <AccordionContent>Yes. A replay is its own entry.</AccordionContent>
    </AccordionItem>
  </>
);

export const Single: Story = {
  args: { type: "single", collapsible: true, children: items },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole("button", { name: "What counts as finished?" });
    await expect(first).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(first);
    await expect(first).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByText(/The credits are a suggestion/)).toBeVisible();

    // `type="single"` closes the open one when another opens.
    const second = canvas.getByRole("button", { name: "Can I log the same game twice?" });
    await userEvent.click(second);
    await expect(first).toHaveAttribute("aria-expanded", "false");
    await expect(second).toHaveAttribute("aria-expanded", "true");

    // `collapsible` lets the last open one close again.
    await userEvent.click(second);
    await expect(second).toHaveAttribute("aria-expanded", "false");
  },
};

export const Multiple: Story = {
  args: { type: "multiple", children: items },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole("button", { name: "What counts as finished?" });
    const second = canvas.getByRole("button", { name: "Can I log the same game twice?" });
    await userEvent.click(first);
    await userEvent.click(second);
    await expect(first).toHaveAttribute("aria-expanded", "true");
    await expect(second).toHaveAttribute("aria-expanded", "true");
  },
};

/** The trigger is a slot, so a marker rotates on its own `data-state`. */
export const WithMarker: Story = {
  args: {
    type: "single",
    collapsible: true,
    children: (
      <AccordionItem value="one">
        <AccordionTrigger>
          What counts as finished?
          <span aria-hidden="true">+</span>
        </AccordionTrigger>
        <AccordionContent>Whatever you say counts.</AccordionContent>
      </AccordionItem>
    ),
  },
};

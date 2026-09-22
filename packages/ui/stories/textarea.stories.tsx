import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Textarea } from "@/textarea";

const meta = {
  title: "Parts/Textarea",
  component: Textarea,
  args: { rows: 3, placeholder: "Anything worth remembering" },
} satisfies Meta<typeof Textarea>;
export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The field, three lines tall. What makes it a textarea and not an `Input` with
 * a different tag is that Enter is a character here, not a submit.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByPlaceholderText("Anything worth remembering");
    await expect(field.tagName).toBe("TEXTAREA");
    await expect(field).toHaveAttribute("rows", "3");
    await userEvent.type(field, "first line{Enter}second line");
    await expect(field).toHaveValue("first line\nsecond line");
  },
};

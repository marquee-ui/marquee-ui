import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Input } from "@/input";

const meta = {
  title: "Parts/Input",
  component: Input,
  args: { placeholder: "Search everything" },
} satisfies Meta<typeof Input>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByPlaceholderText("Search everything");
    await userEvent.type(field, "hollow");
    await expect(field).toHaveValue("hollow");
  },
};

export const Disabled: Story = { args: { disabled: true, value: "", readOnly: true } };

export const WithValue: Story = { args: { defaultValue: "Hollow Knight" } };

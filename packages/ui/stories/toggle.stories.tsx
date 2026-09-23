import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Toggle } from "@/toggle";

const meta = { title: "Parts/Toggle", component: Toggle } satisfies Meta<typeof Toggle>;
export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The state lives in the CALLER, as it does in a real product - a favourite
 * writes to a server and reverts on failure - and reaches the drawing only
 * through `aria-pressed`, which is also what a screen reader reads. The name
 * stays "Favourite" in both states: the pressed state carries whether it is,
 * so a name that flipped would announce the state twice, in opposite words.
 */
function Favourite({
  initial = false,
  disabled = false,
}: {
  initial?: boolean;
  disabled?: boolean;
}) {
  const [on, setOn] = useState(initial);
  return (
    <Toggle
      aria-label="Favourite"
      aria-pressed={on}
      disabled={disabled}
      onClick={() => setOn((value) => !value)}
    >
      <span aria-hidden="true">♥</span>
    </Toggle>
  );
}

export const Default: Story = {
  render: () => <Favourite />,
  play: async ({ canvasElement }) => {
    const control = within(canvasElement).getByRole("button", { name: "Favourite" });
    await expect(control).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(control);
    await expect(control).toHaveAttribute("aria-pressed", "true");
    // …and back, with the same name both ways.
    await userEvent.click(control);
    await expect(control).toHaveAttribute("aria-pressed", "false");
    await expect(control).toHaveAccessibleName("Favourite");
  },
};

export const Pressed: Story = { render: () => <Favourite initial /> };

export const Disabled: Story = {
  render: () => <Favourite disabled />,
  play: async ({ canvasElement }) => {
    const control = within(canvasElement).getByRole("button", { name: "Favourite" });
    await expect(control).toBeDisabled();
    await userEvent.click(control);
    await expect(control).toHaveAttribute("aria-pressed", "false");
  },
};

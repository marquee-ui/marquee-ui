import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Button } from "@/button";

const meta = {
  title: "Parts/Button",
  component: Button,
  args: { children: "Save" },
} satisfies Meta<typeof Button>;
export default meta;

type Story = StoryObj<typeof meta>;

/** The board's primary: the offset block, lifting INTO its shadow on hover. */
export const Primary: Story = {
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Save" });
    // An untyped button inside a form submits it, which a primitive must not do
    // by accident.
    await expect(button).toHaveAttribute("type", "button");
    await expect(button.tagName).toBe("BUTTON");
  },
};

/** The second primary: rounded, 44px, lift-on-hover. */
export const PrimaryRounded: Story = { args: { variant: "primaryRounded" } };

export const Secondary: Story = { args: { variant: "secondary", children: "Cancel" } };

export const Ghost: Story = { args: { variant: "ghost", children: "Sign in first" } };

/** Destructive ink from the start; the border stays neutral until it is armed. */
export const Danger: Story = { args: { variant: "danger", children: "Delete" } };

/** Armed: the second tap deletes, so the border joins the ink. */
export const DangerArmed: Story = { args: { variant: "danger", armed: true, children: "Delete" } };

export const ExplicitType: Story = {
  args: { type: "submit", children: "Submit" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: "Submit" })).toHaveAttribute(
      "type",
      "submit",
    );
  },
};

export const Disabled: Story = {
  args: { disabled: true, onClick: fn(), children: "Import" },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Import" });
    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Clickable: Story = {
  args: { onClick: fn(), children: "Try again" },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Try again" }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

/**
 * A link wearing the button. The library owns no router, so `asChild` is how a
 * product's own `<Link>` keeps client-side routing and still looks like a button.
 */
export const AsChildLink: Story = {
  args: {
    asChild: true,
    variant: "ghost",
    children: <a href="/sign-in">Sign in</a>,
  },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link", { name: "Sign in" });
    await expect(link.tagName).toBe("A");
    // `<a type="submit">` is a silent no-op that reads like a working submit.
    await expect(link).not.toHaveAttribute("type");
    await expect(link).toHaveAttribute("href", "/sign-in");
  },
};

/** The caller's own class arrives last, so it wins a conflict. */
export const CallerClassWins: Story = {
  args: { variant: "secondary", className: "w-auto", children: "Sign out" },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Sign out" });
    await expect(button.className).toContain("w-auto");
    await expect(button.className).not.toContain("w-full");
  },
};

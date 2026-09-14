import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Button } from "@/button";
import { Toast, ToastAction, ToastMessage } from "@/toast";

const meta = { title: "Parts/Toast", component: Toast } satisfies Meta<typeof Toast>;
export default meta;

type Story = StoryObj<typeof meta>;

/** The toast portals to a body-level stack; assertions use `document.body`. */
export const WithAction: Story = {
  args: {
    open: true,
    onDismiss: fn(),
    children: (
      <>
        <ToastMessage>Removed from your shelf</ToastMessage>
        <ToastAction onClick={fn()}>Undo</ToastAction>
      </>
    ),
  },
  play: async ({ args, canvasElement }) => {
    const body = within(document.body);
    const status = await body.findByRole("status");
    // The mount point stays empty: nothing an ancestor clips can reach the toast.
    await expect(canvasElement).toBeEmptyDOMElement();
    await expect(status.closest("body")).toBe(document.body);

    await userEvent.click(body.getByRole("button", { name: "Undo" }));
    // Pressing the action also closes it: the owner never has to.
    await expect(args.onDismiss).toHaveBeenCalledTimes(1);
  },
};

export const MessageOnly: Story = {
  args: { open: true, onDismiss: fn(), children: <ToastMessage>Saved</ToastMessage> },
};

export const Closed: Story = {
  args: { open: false, onDismiss: fn(), children: <ToastMessage>Saved</ToastMessage> },
  play: async () => {
    await expect(within(document.body).queryByRole("status")).toBeNull();
  },
};

/**
 * The real shape: an owner holds the state, the toast renders it and dismisses
 * itself. `duration` is short here so the story shows the whole life without a
 * six-second wait.
 */
export const DismissesItself: Story = {
  args: { open: false, onDismiss: fn() },
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Remove</Button>
        <Toast open={open} duration={150} onDismiss={() => setOpen(false)}>
          <ToastMessage>Removed from your shelf</ToastMessage>
        </Toast>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const body = within(document.body);
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Remove" }));
    await body.findByRole("status");
    await waitFor(async () => {
      await expect(body.queryByRole("status")).toBeNull();
    });
  },
};

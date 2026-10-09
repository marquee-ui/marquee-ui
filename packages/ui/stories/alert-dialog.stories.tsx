import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { createRef, useState } from "react";
import { Button } from "@/button";
import { Input } from "@/input";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/alert-dialog";

const meta = { title: "Parts/AlertDialog", component: AlertDialog } satisfies Meta<
  typeof AlertDialog
>;
export default meta;
type Story = StoryObj<typeof meta>;

function Confirmation({ destructive = false }: { destructive?: boolean }) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove draft?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the unsaved draft.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep draft</AlertDialogCancel>
          <AlertDialogAction variant={destructive ? "destructive" : "primary"}>
            Remove draft
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogPortal>
  );
}

export const Default: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger>Review draft</AlertDialogTrigger>
      <Confirmation />
    </AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Review draft" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const dialog = await within(document.body).findByRole("alertdialog", { name: "Remove draft?" });
    await expect(dialog).toHaveAccessibleDescription("This permanently removes the unsaved draft.");
    const cancel = within(dialog).getByRole("button", { name: "Keep draft" });
    await waitFor(async () => {
      await expect(cancel).toHaveFocus();
    });
    await userEvent.tab();
    await expect(within(dialog).getByRole("button", { name: "Remove draft" })).toHaveFocus();
    await userEvent.tab();
    await expect(cancel).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await waitFor(async () => {
      await expect(within(document.body).queryByRole("alertdialog")).toBeNull();
    });
    await expect(trigger).toHaveFocus();
  },
};

export const Destructive: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger>Delete draft</AlertDialogTrigger>
      <Confirmation destructive />
    </AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Delete draft" }));
    await userEvent.click(
      await within(document.body).findByRole("button", { name: "Remove draft" }),
    );
    await waitFor(async () => {
      await expect(within(document.body).queryByRole("alertdialog")).toBeNull();
    });
  },
};

function ControlledExample() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <p role="status">{open ? "Confirmation open" : "Confirmation closed"}</p>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger>Controlled confirmation</AlertDialogTrigger>
        <Confirmation />
      </AlertDialog>
    </>
  );
}
export const Controlled: Story = {
  render: () => <ControlledExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Controlled confirmation" }));
    await expect(
      await within(document.body).findByRole("alertdialog", { name: "Remove draft?" }),
    ).toBeInTheDocument();
    await userEvent.click(await within(document.body).findByRole("button", { name: "Keep draft" }));
    await waitFor(async () => {
      await expect(canvas.getByRole("status")).toHaveTextContent("Confirmation closed");
    });
  },
};

function PreventedExample() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger>Save draft</AlertDialogTrigger>
      <AlertDialogPortal>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogTitle>Save changes?</AlertDialogTitle>
          <AlertDialogDescription>
            The caller decides when saving has finished.
          </AlertDialogDescription>
          <p role="status">{pending ? "Waiting for completion" : "Ready to save"}</p>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                setPending(true);
              }}
            >
              Start saving
            </AlertDialogAction>
            {pending && (
              <Button
                onClick={() => {
                  setPending(false);
                  setOpen(false);
                }}
              >
                Finish saving
              </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
}
export const PreventedClosing: Story = {
  render: () => <PreventedExample />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Save draft" }));
    await userEvent.click(
      await within(document.body).findByRole("button", { name: "Start saving" }),
    );
    const dialog = within(document.body).getByRole("alertdialog");
    await expect(within(dialog).getByRole("status")).toHaveTextContent("Waiting for completion");
    await userEvent.click(within(dialog).getByRole("button", { name: "Finish saving" }));
    await waitFor(async () => {
      await expect(within(document.body).queryByRole("alertdialog")).toBeNull();
    });
  },
};

const composedTrigger = createRef<HTMLButtonElement>();
export const Composition: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open editor</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetTitle>Draft editor</SheetTitle>
        <SheetDescription>Keep editing after a confirmation.</SheetDescription>
        <SheetBody>
          <Input aria-label="Draft name" defaultValue="Untitled" />
          <AlertDialog>
            <AlertDialogTrigger asChild ref={composedTrigger}>
              <Button variant="secondary">Review removal</Button>
            </AlertDialogTrigger>
            <AlertDialogPortal>
              <AlertDialogOverlay />
              <AlertDialogContent asChild>
                <section>
                  <AlertDialogTitle>Remove draft?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently removes the unsaved draft.
                  </AlertDialogDescription>
                  <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                      <Button variant="secondary">Keep draft</Button>
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Button>Remove draft</Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </section>
              </AlertDialogContent>
            </AlertDialogPortal>
          </AlertDialog>
          <SheetClose asChild>
            <Button variant="secondary">Close editor</Button>
          </SheetClose>
        </SheetBody>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvasElement }) => {
    const body = within(document.body);
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Open editor" }));
    const trigger = await body.findByRole("button", { name: "Review removal" });
    await expect(composedTrigger.current).toBe(trigger);
    await userEvent.click(trigger);
    const alert = await body.findByRole("alertdialog");
    await expect(alert.tagName).toBe("SECTION");
    await userEvent.keyboard("{Escape}");
    await waitFor(async () => {
      await expect(trigger).toHaveFocus();
    });
    const input = body.getByRole("textbox", { name: "Draft name" });
    await userEvent.clear(input);
    await userEvent.type(input, "Recovered draft");
    await expect(input).toHaveValue("Recovered draft");
    await userEvent.click(body.getByRole("button", { name: "Close editor" }));
    await waitFor(async () => {
      await expect(body.queryByRole("dialog")).toBeNull();
    });
  },
};

export const TallContent: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger>Review long confirmation</AlertDialogTrigger>
      <AlertDialogPortal>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogTitle>Review every change</AlertDialogTitle>
          <AlertDialogDescription>
            A long confirmation scrolls inside its panel.
          </AlertDialogDescription>
          {Array.from({ length: 32 }, (_, index) => (
            <p key={index}>Change {index + 1}: Check this detail before continuing.</p>
          ))}
          <AlertDialogFooter>
            <AlertDialogCancel>Keep reviewing</AlertDialogCancel>
            <AlertDialogAction>Confirm all changes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Review long confirmation" }),
    );
    const dialog = await within(document.body).findByRole("alertdialog");
    await expect(
      within(dialog).getByText("Change 32: Check this detail before continuing."),
    ).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(async () => {
      await expect(within(document.body).queryByRole("alertdialog")).toBeNull();
    });
  },
};

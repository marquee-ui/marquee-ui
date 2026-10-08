import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Input } from "@/input";
import { Button } from "@/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectPortal,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from "@/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/dialog";

const meta = { title: "Parts/Dialog", component: Dialog } satisfies Meta<typeof Dialog>;
export default meta;
type Story = StoryObj<typeof meta>;

function Parts() {
  return (
    <>
      <DialogTrigger>Open project dialog</DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Project details</DialogTitle>
            <DialogDescription>Edit the name, then close when ready.</DialogDescription>
          </DialogHeader>
          <Input aria-label="Project name" defaultValue="Studio" />
          <DialogFooter>
            <DialogClose>Done</DialogClose>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </>
  );
}

export const Default: Story = {
  args: { children: <Parts /> },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Open project dialog" });
    await userEvent.click(trigger);
    const dialog = await within(document.body).findByRole("dialog", { name: "Project details" });
    await expect(dialog).toHaveAccessibleDescription("Edit the name, then close when ready.");
    await expect(canvasElement).not.toContainElement(dialog);
    await expect(within(dialog).getByRole("textbox", { name: "Project name" })).toHaveFocus();
    await userEvent.click(within(dialog).getByRole("button", { name: "Done" }));
    await waitFor(async () => {
      await expect(within(document.body).queryByRole("dialog")).toBeNull();
    });
    await expect(trigger).toHaveFocus();
  },
};

export const Keyboard: Story = {
  args: { children: <Parts /> },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Open project dialog" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const dialog = await within(document.body).findByRole("dialog", { name: "Project details" });
    const field = within(dialog).getByRole("textbox", { name: "Project name" });
    const close = within(dialog).getByRole("button", { name: "Done" });
    await expect(field).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(close).toHaveFocus();
    await userEvent.tab();
    await expect(field).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await waitFor(async () => {
      await expect(within(document.body).queryByRole("dialog")).toBeNull();
    });
    await expect(trigger).toHaveFocus();
  },
};

function ControlledExample() {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>Open controlled dialog</DialogTrigger>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent>
            <DialogTitle>Controlled form</DialogTitle>
            <DialogDescription>The caller closes after saving.</DialogDescription>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setSaved(true);
                setOpen(false);
              }}
            >
              <Input aria-label="Project name" defaultValue="Studio" />
              <DialogFooter>
                <DialogClose>Cancel</DialogClose>
                <Button type="submit" width="auto">
                  Save
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </DialogPortal>
      </Dialog>
      <p role="status">{saved ? "Saved" : "Not saved"}</p>
    </>
  );
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open controlled dialog" }));
    const dialog = await within(document.body).findByRole("dialog", { name: "Controlled form" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Not saved");
    await userEvent.click(canvas.getByRole("button", { name: "Open controlled dialog" }));
    await userEvent.click(await within(document.body).findByRole("button", { name: "Save" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Saved");
    await expect(within(document.body).queryByRole("dialog")).toBeNull();
  },
};

export const PreventedClose: Story = {
  args: {
    children: (
      <>
        <DialogTrigger>Open protected dialog</DialogTrigger>
        <DialogPortal>
          <DialogOverlay data-testid="protected-overlay" />
          <DialogContent
            onEscapeKeyDown={(event) => event.preventDefault()}
            onPointerDownOutside={(event) => event.preventDefault()}
          >
            <DialogTitle>Protected details</DialogTitle>
            <DialogDescription>
              Dismissal callbacks can be canceled; explicit Close stays available.
            </DialogDescription>
            <DialogClose>Close protected dialog</DialogClose>
          </DialogContent>
        </DialogPortal>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Open protected dialog" }),
    );
    const body = within(document.body);
    const dialog = await body.findByRole("dialog", { name: "Protected details" });
    await userEvent.keyboard("{Escape}");
    await expect(dialog).toBeInTheDocument();
    await userEvent.click(body.getByTestId("protected-overlay"));
    await expect(dialog).toBeInTheDocument();
    await userEvent.click(body.getByRole("button", { name: "Close protected dialog" }));
    await expect(body.queryByRole("dialog")).toBeNull();
  },
};

function NonModalExample() {
  const [clicks, setClicks] = useState(0);
  return (
    <>
      <Button width="auto" onClick={() => setClicks((value) => value + 1)}>
        Outside action
      </Button>
      <output aria-label="Outside clicks">{clicks}</output>
      <Dialog modal={false}>
        <Parts />
      </Dialog>
    </>
  );
}

export const NonModal: Story = {
  render: () => <NonModalExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open project dialog" }));
    await within(document.body).findByRole("dialog", { name: "Project details" });
    await expect(document.querySelector('[data-slot="dialog-overlay"]')).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Outside action" }));
    await expect(canvas.getByLabelText("Outside clicks")).toHaveTextContent("1");
    await expect(within(document.body).queryByRole("dialog")).toBeNull();
  },
};

export const TallContent: Story = {
  args: {
    defaultOpen: true,
    children: (
      <DialogPortal>
        <DialogOverlay />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Long project notes</DialogTitle>
            <DialogDescription>The panel scrolls within the viewport.</DialogDescription>
          </DialogHeader>
          {Array.from({ length: 30 }, (_, index) => (
            <p key={index}>
              Note {index + 1}: leave room for thoughtful details and the next step.
            </p>
          ))}
          <DialogFooter>
            <DialogClose>Finish reading</DialogClose>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    ),
  },
  play: async () => {
    const dialog = await within(document.body).findByRole("dialog", { name: "Long project notes" });
    await expect(within(dialog).getByText(/^Note 30:/)).toBeInTheDocument();
    await expect(
      within(dialog).getByRole("button", { name: "Finish reading" }),
    ).toBeInTheDocument();
  },
};

function SelectParts() {
  return (
    <Select defaultValue="normal">
      <SelectTrigger aria-label="Priority">
        <SelectValue />
      </SelectTrigger>
      <SelectPortal>
        <SelectContent position="popper">
          <SelectViewport>
            {["normal", "urgent"].map((value) => (
              <SelectItem key={value} value={value}>
                <SelectItemText>{value === "normal" ? "Normal" : "Urgent"}</SelectItemText>
              </SelectItem>
            ))}
          </SelectViewport>
        </SelectContent>
      </SelectPortal>
    </Select>
  );
}

export const NestedSelect: Story = {
  args: {
    children: (
      <>
        <DialogTrigger>Open priority dialog</DialogTrigger>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent>
            <DialogTitle>Choose priority</DialogTitle>
            <DialogDescription>Selection keeps the parent dialog open.</DialogDescription>
            <SelectParts />
            <DialogClose>Done</DialogClose>
          </DialogContent>
        </DialogPortal>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const outside = within(canvasElement).getByRole("button", { name: "Open priority dialog" });
    await userEvent.click(outside);
    const body = within(document.body);
    const dialog = await body.findByRole("dialog", { name: "Choose priority" });
    const trigger = within(dialog).getByRole("combobox", { name: "Priority" });
    await userEvent.click(trigger);
    await expect(await body.findByRole("option", { name: "Normal" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await waitFor(async () => {
      await expect(trigger).toHaveTextContent("Urgent");
    });
    await expect(trigger).toHaveFocus();
    await expect(dialog).toBeInTheDocument();
    await userEvent.keyboard("{Enter}");
    await body.findByRole("listbox");
    await userEvent.keyboard("{Escape}");
    await expect(body.queryByRole("listbox")).toBeNull();
    await expect(dialog).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(async () => {
      await expect(body.queryByRole("dialog")).toBeNull();
    });
    await expect(outside).toHaveFocus();
  },
};

export const NestedSheet: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button width="auto">Open parent sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetTitle>Parent sheet</SheetTitle>
        <SheetDescription>The dialog has its own focus and dismissal scope.</SheetDescription>
        <Dialog>
          <Parts />
        </Dialog>
        <SheetClose asChild>
          <Button variant="secondary" width="auto">
            Close sheet
          </Button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvasElement }) => {
    const outside = within(canvasElement).getByRole("button", { name: "Open parent sheet" });
    await userEvent.click(outside);
    const body = within(document.body);
    const sheet = await body.findByRole("dialog", { name: "Parent sheet" });
    const trigger = within(sheet).getByRole("button", { name: "Open project dialog" });
    await userEvent.click(trigger);
    const child = await body.findByRole("dialog", { name: "Project details" });
    await expect(within(child).getByRole("textbox", { name: "Project name" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await waitFor(async () => {
      await expect(body.queryByRole("dialog", { name: "Project details" })).toBeNull();
    });
    await expect(sheet).toBeInTheDocument();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await waitFor(async () => {
      await expect(body.queryByRole("dialog")).toBeNull();
    });
    await expect(outside).toHaveFocus();
  },
};

export const CustomHosts: Story = {
  args: {
    children: (
      <>
        <DialogTrigger asChild>
          <Button variant="secondary" width="auto">
            Open custom dialog
          </Button>
        </DialogTrigger>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent asChild>
            <section>
              <DialogHeader asChild>
                <header>
                  <DialogTitle asChild>
                    <h3>Custom hosts</h3>
                  </DialogTitle>
                  <DialogDescription>
                    Slots preserve the caller's semantic elements.
                  </DialogDescription>
                </header>
              </DialogHeader>
              <DialogFooter asChild>
                <footer>
                  <DialogClose asChild>
                    <Button width="auto">Done</Button>
                  </DialogClose>
                </footer>
              </DialogFooter>
            </section>
          </DialogContent>
        </DialogPortal>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Open custom dialog" }),
    );
    const dialog = await within(document.body).findByRole("dialog", { name: "Custom hosts" });
    await expect(dialog.tagName).toBe("SECTION");
    await expect(
      within(dialog).getByRole("heading", { name: "Custom hosts", level: 3 }),
    ).toBeInTheDocument();
    await expect(dialog.querySelector('[data-slot="dialog-header"]')?.tagName).toBe("HEADER");
    await expect(dialog.querySelector('[data-slot="dialog-footer"]')?.tagName).toBe("FOOTER");
    await userEvent.click(within(dialog).getByRole("button", { name: "Done" }));
    await expect(within(document.body).queryByRole("dialog")).toBeNull();
  },
};

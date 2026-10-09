import type { Meta, StoryObj } from "@storybook/react-vite";
import { useId, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "@/button";
import { Input } from "@/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/dialog";
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
  Popover,
  PopoverAnchor,
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverPortal,
  PopoverTitle,
  PopoverTrigger,
} from "@/popover";

const meta = { title: "Parts/Popover", component: Popover } satisfies Meta<typeof Popover>;
export default meta;
type Story = StoryObj<typeof meta>;

function Parts() {
  const id = useId();
  return (
    <>
      <PopoverTrigger>Open details popover</PopoverTrigger>
      <PopoverPortal>
        <PopoverContent
          aria-labelledby={`${id}-title`}
          aria-describedby={`${id}-description`}
          sideOffset={8}
          collisionPadding={16}
        >
          <PopoverHeader>
            <PopoverTitle id={`${id}-title`}>Project details</PopoverTitle>
            <PopoverDescription id={`${id}-description`}>
              Edit the name, then close when ready.
            </PopoverDescription>
          </PopoverHeader>
          <Input aria-label="Project name" defaultValue="Studio" />
          <PopoverClose>Done</PopoverClose>
          <PopoverArrow />
        </PopoverContent>
      </PopoverPortal>
    </>
  );
}

function DefaultExample() {
  const [clicks, setClicks] = useState(0);
  return (
    <div className="flex flex-wrap items-start gap-4">
      <Popover>
        <Parts />
      </Popover>
      <Button width="auto" variant="secondary" onClick={() => setClicks((count) => count + 1)}>
        Outside action
      </Button>
      <output aria-label="Outside clicks">{clicks}</output>
    </div>
  );
}

export const Default: Story = {
  render: () => <DefaultExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Open details popover" });
    await userEvent.click(trigger);
    const panel = await within(document.body).findByRole("dialog", { name: "Project details" });
    await expect(panel).toHaveAccessibleDescription("Edit the name, then close when ready.");
    await expect(canvasElement).not.toContainElement(panel);
    await expect(within(panel).getByRole("textbox", { name: "Project name" })).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: "Outside action" }));
    await expect(canvas.getByLabelText("Outside clicks")).toHaveTextContent("1");
    await expect(within(document.body).queryByRole("dialog")).toBeNull();
    await expect(canvas.getByRole("button", { name: "Outside action" })).toHaveFocus();
  },
};

function ControlledExample() {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>Open controlled popover</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent aria-label="Controlled form" collisionPadding={16} sideOffset={8}>
            <form
              className="flex flex-col gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                setSaved(true);
                setOpen(false);
              }}
            >
              <Input aria-label="Project name" defaultValue="Studio" />
              <PopoverClose>Cancel</PopoverClose>
              <Button type="submit" width="auto">
                Save
              </Button>
            </form>
          </PopoverContent>
        </PopoverPortal>
      </Popover>
      <p role="status">{saved ? "Saved" : "Not saved"}</p>
    </>
  );
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Open controlled popover" });
    await userEvent.click(trigger);
    const panel = await within(document.body).findByRole("dialog", { name: "Controlled form" });
    await userEvent.click(within(panel).getByRole("button", { name: "Cancel" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Not saved");
    await userEvent.click(trigger);
    await userEvent.click(await within(document.body).findByRole("button", { name: "Save" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Saved");
    await expect(within(document.body).queryByRole("dialog")).toBeNull();
    await expect(trigger).toHaveFocus();
  },
};

export const Modal: Story = {
  render: () => (
    <>
      <Popover modal>
        <Parts />
      </Popover>
      <Button width="auto">Outside action</Button>
    </>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Open details popover" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const panel = await within(document.body).findByRole("dialog", { name: "Project details" });
    await userEvent.tab({ shift: true });
    await expect(within(panel).getByRole("button", { name: "Done" })).toHaveFocus();
    await userEvent.tab();
    await expect(within(panel).getByRole("textbox", { name: "Project name" })).toHaveFocus();
    await expect(document.body.style.pointerEvents).toBe("none");
    await userEvent.keyboard("{Escape}");
    await waitFor(async () => {
      await expect(within(document.body).queryByRole("dialog")).toBeNull();
    });
    await expect(trigger).toHaveFocus();
    await expect(document.body.style.pointerEvents).not.toBe("none");
  },
};

export const Anchored: Story = {
  render: () => (
    <div className="flex min-h-96 flex-col gap-4">
      <Popover>
        <PopoverTrigger>Open anchored notes</PopoverTrigger>
        <PopoverAnchor asChild>
          <div
            className="ml-auto w-40 rounded-md border-2 border-border p-4 text-foreground"
            data-testid="notes-anchor"
          >
            Independent anchor
          </div>
        </PopoverAnchor>
        <PopoverPortal>
          <PopoverContent
            aria-label="Anchored notes"
            side="right"
            align="end"
            sideOffset={8}
            collisionPadding={16}
          >
            <PopoverTitle>Anchored notes</PopoverTitle>
            {Array.from({ length: 24 }, (_, index) => (
              <p key={index}>Note {index + 1}: keep useful detail within reach.</p>
            ))}
            <PopoverClose>Finish reading</PopoverClose>
            <PopoverArrow width={16} height={8} />
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Open anchored notes" }),
    );
    const panel = await within(document.body).findByRole("dialog", { name: "Anchored notes" });
    await expect(within(panel).getByText(/^Note 24:/)).toBeInTheDocument();
    await expect(panel).toHaveAttribute("data-align", "end");
    await userEvent.click(within(panel).getByRole("button", { name: "Finish reading" }));
    await expect(within(document.body).queryByRole("dialog")).toBeNull();
  },
};

export const PreventDismiss: Story = {
  render: () => (
    <>
      <Button width="auto">Outside action</Button>
      <Popover>
        <PopoverTrigger>Open protected popover</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent
            aria-label="Protected details"
            collisionPadding={16}
            onEscapeKeyDown={(event) => event.preventDefault()}
            onPointerDownOutside={(event) => event.preventDefault()}
            onFocusOutside={(event) => event.preventDefault()}
          >
            <PopoverDescription>
              Dismissal callbacks can be canceled; Close stays available.
            </PopoverDescription>
            <PopoverClose>Close protected popover</PopoverClose>
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open protected popover" }));
    const panel = await within(document.body).findByRole("dialog", { name: "Protected details" });
    await userEvent.keyboard("{Escape}");
    await expect(panel).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Outside action" }));
    await expect(panel).toBeInTheDocument();
    await userEvent.click(within(panel).getByRole("button", { name: "Close protected popover" }));
    await expect(within(document.body).queryByRole("dialog")).toBeNull();
  },
};

export const NestedSelect: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger>Open priority popover</PopoverTrigger>
      <PopoverPortal>
        <PopoverContent aria-label="Choose priority" sideOffset={8} collisionPadding={16}>
          <Select defaultValue="normal">
            <SelectTrigger aria-label="Priority">
              <SelectValue />
            </SelectTrigger>
            <SelectPortal>
              <SelectContent position="popper">
                <SelectViewport>
                  <SelectItem value="normal">
                    <SelectItemText>Normal</SelectItemText>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <SelectItemText>Urgent</SelectItemText>
                  </SelectItem>
                </SelectViewport>
              </SelectContent>
            </SelectPortal>
          </Select>
          <PopoverClose>Done</PopoverClose>
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    const outside = within(canvasElement).getByRole("button", { name: "Open priority popover" });
    await userEvent.click(outside);
    const body = within(document.body);
    const panel = await body.findByRole("dialog", { name: "Choose priority" });
    const trigger = within(panel).getByRole("combobox", { name: "Priority" });
    await userEvent.click(trigger);
    await expect(await body.findByRole("option", { name: "Normal" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await waitFor(async () => {
      await expect(trigger).toHaveTextContent("Urgent");
    });
    await expect(trigger).toHaveFocus();
    await expect(panel).toBeInTheDocument();
    await userEvent.keyboard("{Enter}");
    await body.findByRole("listbox");
    await userEvent.keyboard("{Escape}");
    await expect(body.queryByRole("listbox")).toBeNull();
    await expect(panel).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(async () => {
      await expect(body.queryByRole("dialog")).toBeNull();
    });
    await expect(outside).toHaveFocus();
  },
};

export const NestedOverlays: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Dialog>
        <DialogTrigger>Open parent dialog</DialogTrigger>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent>
            <DialogTitle>Parent dialog</DialogTitle>
            <DialogDescription>The popover has its own dismissal scope.</DialogDescription>
            <Popover>
              <Parts />
            </Popover>
            <DialogClose>Close dialog</DialogClose>
          </DialogContent>
        </DialogPortal>
      </Dialog>
      <Sheet>
        <SheetTrigger asChild>
          <Button width="auto">Open parent sheet</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetTitle>Parent sheet</SheetTitle>
          <SheetDescription>The popover has its own dismissal scope.</SheetDescription>
          <Popover>
            <Parts />
          </Popover>
          <SheetClose asChild>
            <Button width="auto">Close sheet</Button>
          </SheetClose>
        </SheetContent>
      </Sheet>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    for (const parent of ["dialog", "sheet"]) {
      const outside = canvas.getByRole("button", { name: `Open parent ${parent}` });
      await userEvent.click(outside);
      const panel = await body.findByRole("dialog", { name: `Parent ${parent}` });
      const trigger = within(panel).getByRole("button", { name: "Open details popover" });
      await userEvent.click(trigger);
      await expect(await body.findByRole("textbox", { name: "Project name" })).toHaveFocus();
      await userEvent.keyboard("{Escape}");
      await waitFor(async () => {
        await expect(body.queryByRole("dialog", { name: "Project details" })).toBeNull();
      });
      await expect(panel).toBeInTheDocument();
      await expect(trigger).toHaveFocus();
      await userEvent.keyboard("{Escape}");
      await waitFor(async () => {
        await expect(body.queryByRole("dialog")).toBeNull();
      });
      await expect(outside).toHaveFocus();
    }
    await expect(document.body.style.pointerEvents).not.toBe("none");
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
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
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@/tooltip";

const meta = {
  title: "Parts/Tooltip",
  component: TooltipProvider,
  args: { delayDuration: 0, children: null },
} satisfies Meta<typeof TooltipProvider>;
export default meta;
type Story = StoryObj<typeof meta>;

function Parts({ label = "Save document", text = "Keyboard shortcut: Control S." }) {
  return (
    <Tooltip>
      <TooltipTrigger>{label}</TooltipTrigger>
      <TooltipPortal>
        <TooltipContent>
          {text}
          <TooltipArrow />
        </TooltipContent>
      </TooltipPortal>
    </Tooltip>
  );
}

export const Default: Story = {
  args: { children: <Parts /> },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Save document" });
    await userEvent.hover(trigger);
    const hint = await within(document.body).findByRole("tooltip");
    await expect(hint).toHaveTextContent("Keyboard shortcut: Control S.");
    await expect(trigger).toHaveAccessibleName("Save document");
    await expect(trigger).toHaveAccessibleDescription("Keyboard shortcut: Control S.");
    await expect(canvasElement).not.toContainElement(hint);
    await userEvent.keyboard("{Escape}");
    await waitFor(async () => {
      await expect(within(document.body).queryByRole("tooltip")).toBeNull();
    });
  },
};

export const Keyboard: Story = {
  render: () => (
    <TooltipProvider delayDuration={700}>
      <Parts />
      <button className="min-h-hit min-w-hit px-4 py-2">Next action</button>
    </TooltipProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    const trigger = canvas.getByRole("button", { name: "Save document" });
    await expect(trigger).toHaveFocus();
    await expect(await within(document.body).findByRole("tooltip")).toHaveTextContent(
      "Keyboard shortcut: Control S.",
    );
    await expect(trigger).toHaveAttribute("data-state", "instant-open");
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Next action" })).toHaveFocus();
    await expect(within(document.body).queryByRole("tooltip")).toBeNull();
  },
};

function ControlledExample() {
  const [open, setOpen] = useState(false);
  const [saves, setSaves] = useState(0);
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger onClick={() => setSaves((value) => value + 1)}>
          Save document
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent>Keyboard shortcut: Control S.</TooltipContent>
        </TooltipPortal>
      </Tooltip>
      <p role="status">
        Saved {saves} times; hint {open ? "open" : "closed"}.
      </p>
      <p>Supplemental text only. The named action works on touch without this hint.</p>
    </TooltipProvider>
  );
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Save document" });
    await userEvent.tab();
    await within(document.body).findByRole("tooltip");
    await expect(canvas.getByRole("status")).toHaveTextContent("Saved 0 times; hint open.");
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("status")).toHaveTextContent("Saved 1 times; hint closed.");
    await expect(within(document.body).queryByRole("tooltip")).toBeNull();
    await expect(trigger).toHaveFocus();
  },
};

export const ProviderDelays: Story = {
  args: {
    delayDuration: 300,
    skipDelayDuration: 800,
    disableHoverableContent: true,
    children: (
      <div className="flex gap-4">
        <Parts label="First action" text="First hint" />
        <Parts label="Second action" text="Second hint" />
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole("button", { name: "First action" });
    const second = canvas.getByRole("button", { name: "Second action" });
    await userEvent.hover(first);
    await expect(within(document.body).queryByRole("tooltip")).toBeNull();
    await expect(await within(document.body).findByRole("tooltip")).toHaveTextContent("First hint");
    await expect(first).toHaveAttribute("data-state", "delayed-open");
    await userEvent.unhover(first);
    await expect(within(document.body).queryByRole("tooltip")).toBeNull();
    await userEvent.hover(second);
    await expect(await within(document.body).findByRole("tooltip")).toHaveTextContent(
      "Second hint",
    );
    await expect(second).toHaveAttribute("data-state", "instant-open");
    await userEvent.unhover(second);
  },
};

export const HoverableContent: Story = {
  args: { children: <Parts text="Supplemental text stays visible while the pointer reads it." /> },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Save document" });
    await userEvent.hover(trigger);
    const hint = await within(document.body).findByRole("tooltip");
    const content = document.querySelector<HTMLElement>('[data-slot="tooltip-content"]')!;
    await userEvent.hover(content);
    await expect(hint).toHaveTextContent(
      "Supplemental text stays visible while the pointer reads it.",
    );
    await expect(content.querySelectorAll("button, a[href], input, [tabindex]")).toHaveLength(0);
    await userEvent.keyboard("{Escape}");
    await expect(within(document.body).queryByRole("tooltip")).toBeNull();
  },
};

export const ImmediateClose: Story = {
  args: {
    disableHoverableContent: true,
    children: <Parts text="This provider closes on trigger leave." />,
  },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Save document" });
    await userEvent.hover(trigger);
    await expect(await within(document.body).findByRole("tooltip")).toHaveTextContent(
      "This provider closes on trigger leave.",
    );
    await userEvent.unhover(trigger);
    await expect(within(document.body).queryByRole("tooltip")).toBeNull();
  },
};

export const CustomHosts: Story = {
  args: {
    children: (
      <>
        <Tooltip defaultOpen>
          <TooltipTrigger asChild>
            <a href="#settings">Visit settings</a>
          </TooltipTrigger>
          <TooltipContent asChild side="top" align="start">
            <section>
              Supplemental details can wrap within the available viewport width without replacing
              this link's accessible name.
              <TooltipArrow width={12} height={6} />
            </section>
          </TooltipContent>
        </Tooltip>
        <p id="settings">Settings remain available without a hint.</p>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link", { name: "Visit settings" });
    const hint = await within(document.body).findByRole("tooltip");
    await expect(canvasElement).toContainElement(hint);
    await expect(link).toHaveAttribute("href", "#settings");
    await expect(canvasElement.querySelector('[data-slot="tooltip-content"]')?.tagName).toBe(
      "SECTION",
    );
    await expect(link).toHaveAccessibleDescription(/^Supplemental details can wrap/);
    await userEvent.keyboard("{Escape}");
    await expect(within(document.body).queryByRole("tooltip")).toBeNull();
  },
};

export const InDialog: Story = {
  render: () => (
    <TooltipProvider delayDuration={0}>
      <Dialog>
        <DialogTrigger>Open editor</DialogTrigger>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent>
            <DialogTitle>Document editor</DialogTitle>
            <DialogDescription>
              Actions retain their own names and keyboard behavior.
            </DialogDescription>
            <Parts />
            <DialogClose>Close editor</DialogClose>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </TooltipProvider>
  ),
  play: async ({ canvasElement }) => {
    const outside = within(canvasElement).getByRole("button", { name: "Open editor" });
    await userEvent.click(outside);
    const dialog = await within(document.body).findByRole("dialog", { name: "Document editor" });
    await expect(await within(document.body).findByRole("tooltip")).toHaveTextContent(
      "Keyboard shortcut: Control S.",
    );
    const trigger = within(dialog).getByRole("button", { name: "Save document" });
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect(within(document.body).queryByRole("tooltip")).toBeNull();
    await expect(dialog).toBeInTheDocument();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect(within(document.body).queryByRole("dialog")).toBeNull();
    await expect(outside).toHaveFocus();
  },
};

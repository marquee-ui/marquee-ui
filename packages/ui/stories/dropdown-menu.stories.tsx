import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "@/button";
import {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/dialog";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/sheet";
import { Popover, PopoverTrigger, PopoverPortal, PopoverContent, PopoverClose } from "@/popover";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuItemIndicator,
  DropdownMenuSeparator,
  DropdownMenuArrow,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/dropdown-menu";

const meta = { title: "Parts/DropdownMenu", component: DropdownMenu } satisfies Meta<
  typeof DropdownMenu
>;
export default meta;
type Story = StoryObj<typeof meta>;

function Actions({ action }: { action?: (name: string) => void }) {
  return (
    <>
      <DropdownMenuTrigger>Project actions</DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent sideOffset={8} collisionPadding={16} align="start">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => action?.("Archived")}>Archive</DropdownMenuItem>
            <DropdownMenuItem disabled>Delete</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => action?.("Renamed")}>Rename</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => action?.("Duplicated")}>Duplicate</DropdownMenuItem>
          <DropdownMenuArrow width={16} height={8} />
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </>
  );
}

function ActionExample({
  controlled = false,
  modal = true,
}: {
  controlled?: boolean;
  modal?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState("No action yet");
  const [clicks, setClicks] = useState(0);
  return (
    <div className="flex flex-wrap items-start gap-4">
      <DropdownMenu modal={modal} {...(controlled ? { open, onOpenChange: setOpen } : {})}>
        <Actions action={setResult} />
      </DropdownMenu>
      <Button width="auto" variant="secondary" onClick={() => setClicks((count) => count + 1)}>
        Outside action
      </Button>
      <p role="status">{result}</p>
      <span aria-label="Outside clicks">{clicks}</span>
    </div>
  );
}

export const Default: Story = {
  render: () => <ActionExample />,
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole("button", { name: "Project actions" });
    trigger.focus();
    await user.keyboard("{Enter}");
    const menu = await body.findByRole("menu", { name: "Project actions" });
    await expect(canvasElement).not.toContainElement(menu);
    await waitFor(() => expect(body.getByRole("menuitem", { name: "Archive" })).toHaveFocus());
    await user.keyboard("{ArrowDown}");
    await expect(body.getByRole("menuitem", { name: "Rename" })).toHaveFocus();
    await expect(body.getByRole("menuitem", { name: "Delete" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await user.keyboard("{Enter}");
    await waitFor(() => expect(body.queryByRole("menu")).toBeNull());
    await expect(canvas.getByRole("status")).toHaveTextContent("Renamed");
    await expect(trigger).toHaveFocus();
  },
};

export const Controlled: Story = {
  render: () => <ActionExample controlled />,
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const trigger = within(canvasElement).getByRole("button", { name: "Project actions" });
    await user.click(trigger);
    await user.click(await within(document.body).findByRole("menuitem", { name: "Archive" }));
    await expect(within(canvasElement).getByRole("status")).toHaveTextContent("Archived");
    await expect(within(document.body).queryByRole("menu")).toBeNull();
    await expect(trigger).toHaveFocus();
  },
};

function CheckableExample() {
  const [checked, setChecked] = useState<boolean | "indeterminate">("indeterminate");
  const [density, setDensity] = useState("compact");
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>View options</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent sideOffset={8} collisionPadding={16}>
            <DropdownMenuCheckboxItem
              checked={checked}
              onCheckedChange={setChecked}
              onSelect={(event) => event.preventDefault()}
            >
              Notifications
              <DropdownMenuItemIndicator>
                <span aria-hidden>✓</span>
              </DropdownMenuItemIndicator>
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Density</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={density} onValueChange={setDensity}>
              <DropdownMenuRadioItem value="compact" onSelect={(event) => event.preventDefault()}>
                Compact
                <DropdownMenuItemIndicator>
                  <span aria-hidden>●</span>
                </DropdownMenuItemIndicator>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="comfortable"
                onSelect={(event) => event.preventDefault()}
              >
                Comfortable
                <DropdownMenuItemIndicator>
                  <span aria-hidden>●</span>
                </DropdownMenuItemIndicator>
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuArrow />
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
      <p role="status">
        {String(checked)} / {density}
      </p>
    </>
  );
}

export const Checkable: Story = {
  render: () => <CheckableExample />,
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const body = within(document.body);
    await user.click(within(canvasElement).getByRole("button", { name: "View options" }));
    const checkbox = await body.findByRole("menuitemcheckbox", { name: "Notifications" });
    await expect(checkbox).toHaveAttribute("aria-checked", "mixed");
    await user.click(checkbox);
    await expect(checkbox).toHaveAttribute("aria-checked", "true");
    await user.click(checkbox);
    await expect(checkbox).toHaveAttribute("aria-checked", "false");
    await user.click(body.getByRole("menuitemradio", { name: "Comfortable" }));
    await expect(body.getByRole("menuitemradio", { name: "Compact" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
    await expect(body.getByRole("menuitemradio", { name: "Comfortable" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await user.keyboard("{Escape}");
    await expect(within(canvasElement).getByRole("status")).toHaveTextContent(
      "false / comfortable",
    );
  },
};

function SubmenuExample({ dir = "ltr" }: { dir?: "ltr" | "rtl" }) {
  const [result, setResult] = useState("No action yet");
  return (
    <>
      <DropdownMenu dir={dir}>
        <DropdownMenuTrigger>Share actions</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent sideOffset={8} collisionPadding={16}>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                Share
                <span className="ml-auto" aria-hidden>
                  {dir === "rtl" ? "‹" : "›"}
                </span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent sideOffset={8} collisionPadding={16}>
                  <DropdownMenuItem onSelect={() => setResult("Link copied")}>
                    Copy link
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setResult("Email shared")}>
                    Email
                  </DropdownMenuItem>
                  <DropdownMenuArrow />
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuItem onSelect={() => setResult("Archived")}>Archive</DropdownMenuItem>
            <DropdownMenuArrow />
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
      <p role="status">{result}</p>
    </>
  );
}

const submenuPlay =
  (dir: "ltr" | "rtl") =>
  async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const user = userEvent.setup();
    const body = within(document.body);
    const trigger = within(canvasElement).getByRole("button", { name: "Share actions" });
    trigger.focus();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(body.getByRole("menuitem", { name: "Share" })).toHaveFocus());
    await user.keyboard(dir === "ltr" ? "{ArrowRight}" : "{ArrowLeft}");
    await waitFor(() => expect(body.getByRole("menuitem", { name: "Copy link" })).toHaveFocus());
    await user.keyboard(dir === "ltr" ? "{ArrowLeft}" : "{ArrowRight}");
    await expect(body.queryByRole("menuitem", { name: "Copy link" })).toBeNull();
    await expect(body.getByRole("menuitem", { name: "Share" })).toHaveFocus();
    await user.keyboard(dir === "ltr" ? "{ArrowRight}{Enter}" : "{ArrowLeft}{Enter}");
    await waitFor(() => expect(body.queryByRole("menu")).toBeNull());
    await expect(within(canvasElement).getByRole("status")).toHaveTextContent("Link copied");
    await expect(trigger).toHaveFocus();
  };
export const Submenu: Story = { render: () => <SubmenuExample />, play: submenuPlay("ltr") };
export const RightToLeft: Story = {
  render: () => <SubmenuExample dir="rtl" />,
  play: submenuPlay("rtl"),
};

export const Nonmodal: Story = {
  render: () => <ActionExample modal={false} />,
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    await user.click(canvas.getByRole("button", { name: "Project actions" }));
    await within(document.body).findByRole("menu");
    await expect(document.body.style.pointerEvents).not.toBe("none");
    await user.click(canvas.getByRole("button", { name: "Outside action" }));
    await expect(within(document.body).queryByRole("menu")).toBeNull();
    await expect(canvas.getByLabelText("Outside clicks")).toHaveTextContent("1");
    await expect(canvas.getByRole("button", { name: "Outside action" })).toHaveFocus();
  },
};

export const PreventDismiss: Story = {
  render: () => (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger>Protected actions</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent
            sideOffset={8}
            collisionPadding={16}
            onEscapeKeyDown={(event) => event.preventDefault()}
            onInteractOutside={(event) => event.preventDefault()}
          >
            <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
              Keep open
            </DropdownMenuItem>
            <DropdownMenuItem>Finish</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
      <Button width="auto">Outside action</Button>
    </>
  ),
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const body = within(document.body);
    const canvas = within(canvasElement);
    await user.click(canvas.getByRole("button", { name: "Protected actions" }));
    const menu = await body.findByRole("menu");
    await user.click(body.getByRole("menuitem", { name: "Keep open" }));
    await expect(menu).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await expect(menu).toBeInTheDocument();
    await user.click(canvas.getByRole("button", { name: "Outside action" }));
    await expect(menu).toBeInTheDocument();
    await user.click(body.getByRole("menuitem", { name: "Finish" }));
    await expect(body.queryByRole("menu")).toBeNull();
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
            <DialogDescription>Actions stay in their own dismissal layer.</DialogDescription>
            <DropdownMenu modal={false}>
              <Actions />
            </DropdownMenu>
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
          <SheetDescription>Actions stay in their own dismissal layer.</SheetDescription>
          <DropdownMenu modal={false}>
            <Actions />
          </DropdownMenu>
          <SheetClose asChild>
            <Button width="auto">Close sheet</Button>
          </SheetClose>
        </SheetContent>
      </Sheet>
      <Popover>
        <PopoverTrigger>Open parent popover</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent aria-label="Parent popover">
            <DropdownMenu modal={false}>
              <Actions />
            </DropdownMenu>
            <PopoverClose>Close popover</PopoverClose>
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const body = within(document.body);
    for (const name of ["dialog", "sheet", "popover"]) {
      const outside = within(canvasElement).getByRole("button", { name: `Open parent ${name}` });
      await user.click(outside);
      const parent = await body.findByRole("dialog", { name: `Parent ${name}` });
      const trigger = within(parent).getByRole("button", { name: "Project actions" });
      trigger.focus();
      await user.keyboard("{Enter}");
      await body.findByRole("menu");
      await user.keyboard("{Escape}");
      await waitFor(() => expect(body.queryByRole("menu")).toBeNull());
      await expect(parent).toBeInTheDocument();
      await expect(trigger).toHaveFocus();
      await user.keyboard("{Escape}");
      await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
      await expect(outside).toHaveFocus();
    }
    await expect(document.body.style.pointerEvents).not.toBe("none");
  },
};

export const CustomHosts: Story = {
  render: () => (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button width="auto">Custom actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent asChild>
        <section>
          <DropdownMenuItem asChild>
            <a href="#archive">Archive link</a>
          </DropdownMenuItem>
        </section>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    await user.click(within(canvasElement).getByRole("button", { name: "Custom actions" }));
    const menu = await within(canvasElement).findByRole("menu");
    await expect(menu.tagName).toBe("SECTION");
    await expect(within(menu).getByRole("menuitem", { name: "Archive link" })).toHaveAttribute(
      "href",
      "#archive",
    );
    await expect(
      menu.querySelectorAll("svg, [data-slot='dropdown-menu-item-indicator']"),
    ).toHaveLength(0);
    await user.keyboard("{Escape}");
    await expect(within(canvasElement).queryByRole("menu")).toBeNull();
  },
};

export const ContentFocus: Story = {
  render: () => (
    <div className="flex gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger>No available actions</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent sideOffset={8} collisionPadding={16}>
            <DropdownMenuItem disabled>Archive unavailable</DropdownMenuItem>
            <DropdownMenuArrow />
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger>No available shares</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent sideOffset={8} collisionPadding={16}>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent sideOffset={8} collisionPadding={16}>
                  <DropdownMenuItem disabled>Copy unavailable</DropdownMenuItem>
                  <DropdownMenuArrow />
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuArrow />
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const body = within(document.body);
    const trigger = within(canvasElement).getByRole("button", { name: "No available actions" });
    trigger.focus();
    await user.keyboard("{Enter}");
    await expect(await body.findByRole("menu", { name: "No available actions" })).toHaveFocus();
    await expect(body.getByRole("menuitem", { name: "Archive unavailable" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await user.keyboard("{Escape}");
    await expect(trigger).toHaveFocus();
    const shares = within(canvasElement).getByRole("button", { name: "No available shares" });
    shares.focus();
    await user.keyboard("{Enter}");
    await expect(body.getByRole("menuitem", { name: "Share" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    await expect(await body.findByRole("menu", { name: "Share" })).toHaveFocus();
    await expect(body.getByRole("menuitem", { name: "Copy unavailable" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await user.keyboard("{Escape}");
    await expect(body.queryByRole("menu")).toBeNull();
    await expect(shares).toHaveFocus();
  },
};

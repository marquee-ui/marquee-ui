import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "@/button";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/sheet";

const meta = { title: "Parts/Sheet", component: Sheet } satisfies Meta<typeof Sheet>;
export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The sheet portals to the body, so assertions use `screen`/`document.body`
 * rather than the story canvas.
 */
export const Default: Story = {
  args: {
    children: (
      <>
        <SheetTrigger asChild>
          <Button>Log a game</Button>
        </SheetTrigger>
        <SheetContent aria-describedby={undefined}>
          <SheetTitle>Log a game</SheetTitle>
          <SheetBody>
            <p>The body is a real scroll region, so a tall form cannot run off the bottom.</p>
          </SheetBody>
          <SheetClose asChild>
            <Button variant="secondary">Cancel</Button>
          </SheetClose>
        </SheetContent>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const body = within(document.body);
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Log a game" }));

    const dialog = await body.findByRole("dialog");
    await expect(within(dialog).getByRole("heading", { name: "Log a game" })).toBeInTheDocument();
    // The grab handle is the swipe affordance and says nothing to a reader.
    await expect(dialog.querySelector('[data-slot="sheet-handle"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );

    await userEvent.keyboard("{Escape}");
    await waitFor(async () => {
      await expect(body.queryByRole("dialog")).toBeNull();
    });
  },
};

/** A visually hidden title is composition, not a flag. */
export const HiddenTitle: Story = {
  args: {
    defaultOpen: true,
    children: (
      <SheetContent aria-describedby={undefined}>
        <SheetTitle className="sr-only">Install instructions</SheetTitle>
        <SheetBody>
          <p>Add to Home Screen from the share sheet.</p>
        </SheetBody>
      </SheetContent>
    ),
  },
  play: async () => {
    const body = within(document.body);
    const heading = await body.findByRole("heading", { name: "Install instructions" });
    await expect(heading.className).toContain("sr-only");
  },
};

/**
 * A destructive confirm is an ALERT, and the role obliges the dialog to carry a
 * description. With parts this is a prop on the content, and the bug the old
 * monolith carried - passing `role: undefined` on every other sheet and deleting
 * the dialog role outright - cannot come back, because nothing is passed here at
 * all unless the caller writes it.
 */
export const AlertDialog: Story = {
  args: {
    defaultOpen: true,
    children: (
      <SheetContent role="alertdialog">
        <SheetTitle>Delete this play?</SheetTitle>
        <SheetDescription>It will not be recoverable.</SheetDescription>
        <SheetClose asChild>
          <Button variant="danger" armed>
            Delete
          </Button>
        </SheetClose>
      </SheetContent>
    ),
  },
  play: async () => {
    const body = within(document.body);
    const dialog = await body.findByRole("alertdialog");
    await expect(body.queryByRole("dialog")).toBeNull();
    // The role's own obligation: an alertdialog has to be described.
    await expect(dialog).toHaveAccessibleDescription("It will not be recoverable.");
  },
};

/**
 * No `SheetBody`: for a child that scrolls its own fields and parks the primary
 * action underneath them. Wrapping such a child nests two scrollbars.
 */
export const ChildScrolls: Story = {
  args: {
    defaultOpen: true,
    children: (
      <SheetContent aria-describedby={undefined}>
        <SheetTitle>Log a game</SheetTitle>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <p>Self-managed scroll region.</p>
        </div>
        <Button>Save</Button>
      </SheetContent>
    ),
  },
  play: async () => {
    const body = within(document.body);
    await body.findByRole("dialog");
    await expect(document.querySelector('[data-slot="sheet-body"]')).toBeNull();
  },
};

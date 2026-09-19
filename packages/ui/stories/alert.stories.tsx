import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Alert, AlertDescription, AlertTitle } from "@/alert";
import { Button } from "@/button";

const meta = { title: "Parts/Alert", component: Alert } satisfies Meta<typeof Alert>;
export default meta;

type Story = StoryObj<typeof meta>;

/** The full shape: a headline in the tone's ink, prose under it. */
export const Default: Story = {
  args: {
    children: (
      <>
        <AlertTitle>Nothing imported yet</AlertTitle>
        <AlertDescription>
          Connect an account and the library arrives on your shelves.
        </AlertDescription>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const box = canvasElement.querySelector('[data-slot="alert"]')!;
    // The parts are INSIDE the box, which is what makes the tone reach them.
    await expect(box).toContainElement(
      within(canvasElement).getByText("Nothing imported yet") as HTMLElement,
    );
    await expect(box).toContainElement(
      canvasElement.querySelector<HTMLElement>('[data-slot="alert-description"]'),
    );
    // A notice is not a section: the headline stays out of the heading outline.
    await expect(within(canvasElement).queryByRole("heading")).toBeNull();
  },
};

export const Destructive: Story = {
  args: {
    tone: "destructive",
    children: (
      <>
        <AlertTitle>We could not confirm that account</AlertTitle>
        <AlertDescription>Nothing was changed. Try again in a moment.</AlertDescription>
      </>
    ),
  },
};

export const Success: Story = {
  args: { tone: "success", children: <AlertDescription>Everything is saved.</AlertDescription> },
};

export const Warning: Story = {
  args: {
    tone: "warning",
    children: <AlertDescription>Two changes are still waiting to sync.</AlertDescription>,
  },
};

export const Info: Story = {
  args: {
    tone: "info",
    children: <AlertDescription>Playtime is hidden, so nothing was split.</AlertDescription>,
  },
};

/**
 * A notice that ARRIVES gets a role from its caller. `status` is polite, `alert`
 * is assertive; the part writes neither, because the tone cannot know which.
 */
export const Announced: Story = {
  args: { role: "status", children: "That link has expired." },
  play: async ({ canvasElement }) => {
    const status = within(canvasElement).getByRole("status");
    await expect(status).toHaveAttribute("data-slot", "alert");
    await expect(status).toHaveTextContent("That link has expired.");
  },
};

/**
 * The default, and the reason it is the default: three notices, one that
 * announces itself and two that were on the page all along - one of them
 * `destructive`, so a tone that tried to decide the role has something to
 * decide it ON.
 *
 * `render` rather than `args.children`: with children the story renders INSIDE
 * `meta.component`, which drew a notice wrapping two notices - the shape a
 * consumer copies (layer 1, MED-4).
 */
export const NotALiveRegion: Story = {
  render: () => (
    <>
      <Alert role="status">The import finished.</Alert>
      <Alert>Ratings are yours and never leave this account.</Alert>
      <Alert tone="destructive">That account is scheduled for deletion.</Alert>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const boxes = [...canvasElement.querySelectorAll('[data-slot="alert"]')];
    await expect(boxes).toHaveLength(3);
    // The anchor: the one notice that WAS given a role is announced, so a query
    // that had rotted would fail here rather than pass the two below.
    await expect(canvas.getAllByRole("status")).toHaveLength(1);
    await expect(canvas.getByRole("status")).toHaveTextContent("The import finished.");
    await expect(canvas.queryByRole("alert")).toBeNull();
    // …and the part writes NEITHER spelling of a live region on the two it was
    // not asked to. A tone-conditional `role` and a blanket `aria-live` both left
    // the whole gate green against a count alone (layer 1, HIGH-1), and
    // `aria-live` needs no role at all, so it has to be read as an attribute.
    for (const quiet of boxes.slice(1)) {
      await expect(quiet.getAttribute("role")).toBeNull();
      await expect(quiet.getAttribute("aria-live")).toBeNull();
      await expect(quiet.getAttribute("aria-atomic")).toBeNull();
    }
  },
};

/**
 * The action is a CHILD, not a part: the box is a flex column, so the control
 * stacks under the prose. The caller owes it the 44px floor, which `Button` has.
 *
 * ⚠️ This is the one story carrying a real product's shape, and it shows the
 * departure the part's docblock names: a destructive LINE with body INK is not a
 * tone, so the ink comes back on the description at the call site.
 */
const keepPressed = fn();

export const WithAction: Story = {
  render: () => (
    <Alert tone="destructive" role="status">
      <AlertDescription className="text-foreground">
        This account is scheduled for deletion. Nothing has been deleted yet.
      </AlertDescription>
      <Button variant="secondary" onClick={keepPressed}>
        Keep my account
      </Button>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    keepPressed.mockClear();
    const canvas = within(canvasElement);
    const action = canvas.getByRole("button", { name: "Keep my account" });
    await expect(canvasElement.querySelector('[data-slot="alert"]')).toContainElement(action);
    // A control inside the notice is reachable and wired - the half a count of
    // elements cannot make. The previous assertion here (that the notice did not
    // close) held with the click DELETED, because nothing here can close (layer 1,
    // LOW-1).
    await userEvent.click(action);
    await expect(keepPressed).toHaveBeenCalledTimes(1);
  },
};

/**
 * `asChild` for the single-sentence notice that wants to stay a paragraph - the
 * shape a server-rendered hint already has. No `<AlertDescription>` inside one.
 */
export const AsChildParagraph: Story = {
  args: {
    asChild: true,
    children: <p role="status">We will not guess, so every game comes in unplayed.</p>,
  },
  play: async ({ canvasElement }) => {
    const status = within(canvasElement).getByRole("status");
    await expect(status.tagName).toBe("P");
    await expect(status).toHaveAttribute("data-slot", "alert");
    await expect(status.className).toContain("border-2");
  },
};

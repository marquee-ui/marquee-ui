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
 * The default, and the reason it is the default: two notices, one that announces
 * itself and one that was on the page all along. The announced one is the anchor -
 * without it, "no live region here" would pass against a query that had rotted.
 */
export const NotALiveRegion: Story = {
  args: {
    children: (
      <>
        <Alert role="status">The import finished.</Alert>
        <Alert>Ratings are yours and never leave this account.</Alert>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("status")).toHaveLength(1);
    await expect(canvas.getByRole("status")).toHaveTextContent("The import finished.");
    // The second box exists and is simply not announced.
    await expect(canvas.getByText(/never leave this account/)).toBeInTheDocument();
    await expect(canvas.queryByRole("alert")).toBeNull();
  },
};

/**
 * The action is a CHILD, not a part: the box is a flex column, so the control
 * stacks under the prose. The caller owes it the 44px floor, which `Button` has.
 */
export const WithAction: Story = {
  args: {
    tone: "destructive",
    role: "status",
    children: (
      <>
        <AlertDescription className="text-foreground">
          This account is scheduled for deletion. Nothing has been deleted yet.
        </AlertDescription>
        <Button variant="secondary" onClick={fn()}>
          Keep my account
        </Button>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const action = canvas.getByRole("button", { name: "Keep my account" });
    await expect(canvasElement.querySelector('[data-slot="alert"]')).toContainElement(action);
    await userEvent.click(action);
    // The notice does not close itself: it has no state and no owner to tell.
    await expect(canvas.getByRole("button", { name: "Keep my account" })).toBeInTheDocument();
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

import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Alert } from "@/alert";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/form";
import { Input } from "@/input";
// Aliased: this file already exports a STORY named `Textarea`.
import { Textarea as TextareaField } from "@/textarea";

const meta = { title: "Parts/Form", component: FormItem } satisfies Meta<typeof FormItem>;
export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Every id this family writes has to RESOLVE, so every play reads the attribute
 * off the control and then looks the ids up in the document. A play that stopped
 * at `toHaveAttribute("aria-describedby")` would pass against a part that named
 * an element nobody renders, which is the whole defect this family was shaped
 * around.
 */
function describedElements(canvasElement: HTMLElement, control: HTMLElement): HTMLElement[] {
  const ids = (control.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean);
  const doc = canvasElement.ownerDocument;
  return ids.map((id) => {
    const found = doc.getElementById(id);
    if (found === null)
      throw new Error(`aria-describedby names "${id}", which resolves to nothing`);
    return found;
  });
}

/** The plain field: a label, a control, and the association between them. */
export const Default: Story = {
  render: () => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input type="email" autoComplete="email" placeholder="you@example.com" />
      </FormControl>
    </FormItem>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The label reaches the control: the one thing a wrapping `<label>` gets for
    // free and a separate one has to be wired for.
    const control = canvas.getByLabelText("Email");
    await expect(control.tagName).toBe("INPUT");
    await expect(control.id).not.toBe("");
    // …and nothing is described or invalid, so neither attribute is written at
    // all. An `aria-describedby` naming an id nothing renders is axe's
    // `aria-valid-attr-value` at critical impact.
    await expect(control.getAttribute("aria-describedby")).toBeNull();
    await expect(control.getAttribute("aria-invalid")).toBeNull();
  },
};

/** The field with a hint: composed, so the control is described by it. */
export const Described: Story = {
  render: () => (
    <FormItem>
      <FormLabel>Profile address</FormLabel>
      <FormControl>
        <Input autoComplete="url" placeholder="example.com/u/yourname" />
      </FormControl>
      <FormDescription>A full address or a bare handle both work.</FormDescription>
    </FormItem>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByLabelText("Profile address");
    const described = describedElements(canvasElement, control);
    await expect(described).toHaveLength(1);
    await expect(described[0]).toHaveAttribute("data-slot", "form-description");
    await expect(described[0]).toHaveTextContent("A full address or a bare handle both work.");
    // A description is on the page from the start, so it is NOT a live region.
    await expect(described[0]!.getAttribute("role")).toBeNull();
    // Described is not invalid.
    await expect(control.getAttribute("aria-invalid")).toBeNull();
  },
};

/**
 * The field that failed. The message is the only part of this family that writes
 * a live region, and it renders only while the field is invalid.
 */
export const Invalid: Story = {
  render: () => (
    <FormItem invalid>
      <FormLabel>Verification code</FormLabel>
      <FormControl>
        <Input inputMode="numeric" autoComplete="one-time-code" defaultValue="123" />
      </FormControl>
      <FormMessage>That code has expired. Ask for a new one.</FormMessage>
    </FormItem>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByLabelText("Verification code");
    await expect(control).toHaveAttribute("aria-invalid", "true");
    const described = describedElements(canvasElement, control);
    await expect(described).toHaveLength(1);
    await expect(described[0]).toHaveAttribute("data-slot", "form-message");
    // The message IS the thing `getByRole("alert")` finds, and it is the same
    // element the control points at - not two elements that happen to agree.
    await expect(canvas.getByRole("alert")).toBe(described[0]);
    await expect(described[0]).toHaveTextContent("That code has expired.");
  },
};

/**
 * Both, which is the only composition where the ORDER of the ids matters: the
 * standing description first, then the thing that just went wrong.
 */
export const DescribedAndInvalid: Story = {
  render: () => (
    <FormItem invalid>
      <FormLabel>Username</FormLabel>
      <FormControl>
        <Input maxLength={20} autoCapitalize="none" defaultValue="a" />
      </FormControl>
      <FormDescription>Letters, numbers and underscores, up to 20.</FormDescription>
      <FormMessage>That username is taken.</FormMessage>
    </FormItem>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByLabelText("Username");
    const described = describedElements(canvasElement, control);
    await expect(described.map((el) => el.getAttribute("data-slot"))).toEqual([
      "form-description",
      "form-message",
    ]);
    await expect(control).toHaveAttribute("aria-invalid", "true");
    // The accessible description a reader is actually given, in order.
    await expect(described.map((el) => el.textContent)).toEqual([
      "Letters, numbers and underscores, up to 20.",
      "That username is taken.",
    ]);
  },
};

/**
 * The same field, valid. The message part is still composed and still renders
 * nothing, and its id is not named - which is what keeps every reference this
 * family writes resolvable in both states.
 */
export const ValidWithMessageComposed: Story = {
  render: () => (
    <FormItem>
      <FormLabel>Username</FormLabel>
      <FormControl>
        <Input maxLength={20} autoCapitalize="none" defaultValue="ramona" />
      </FormControl>
      <FormDescription>Letters, numbers and underscores, up to 20.</FormDescription>
      <FormMessage>That username is taken.</FormMessage>
    </FormItem>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByLabelText("Username");
    // The message is composed and renders NOTHING, so there is no live region
    // and no second described element.
    await expect(canvas.queryByRole("alert")).toBeNull();
    await expect(canvasElement.querySelector('[data-slot="form-message"]')).toBeNull();
    const described = describedElements(canvasElement, control);
    await expect(described).toHaveLength(1);
    await expect(described[0]).toHaveAttribute("data-slot", "form-description");
    await expect(control.getAttribute("aria-invalid")).toBeNull();
  },
};

/**
 * The slot takes any control, not an `Input`. Here it is the `Textarea` part,
 * which is `Input`'s field plus the vertical pad a multi-line field owes; the
 * 44px floor is the CONTROL's, and both parts carry it for you.
 */
export const Textarea: Story = {
  render: () => (
    <FormItem>
      <FormLabel tone="micro">Add a comment</FormLabel>
      <FormControl>
        <TextareaField rows={3} placeholder="Reply to this review" />
      </FormControl>
      <FormDescription>Markdown is not supported, and links are not followed.</FormDescription>
    </FormItem>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByLabelText("Add a comment");
    // The slot put the wiring on a control it knows nothing about.
    await expect(control.tagName).toBe("TEXTAREA");
    await expect(describedElements(canvasElement, control)).toHaveLength(1);
    // The micro tone is `Label`'s, reached through composition rather than
    // re-drawn: the part adds `for`, not a second type treatment.
    const label = canvasElement.querySelector<HTMLElement>('[data-slot="form-label"]')!;
    await expect(label.className).toContain("font-mono");
    await expect(label).toHaveAttribute("for", control.id);
  },
};

/** A field that cannot be edited yet still says what it is. */
export const Disabled: Story = {
  render: () => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input type="email" disabled defaultValue="you@example.com" />
      </FormControl>
      <FormDescription>Sign in again to change the address on the account.</FormDescription>
    </FormItem>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByLabelText("Email") as HTMLInputElement;
    await expect(control.disabled).toBe(true);
    // Disabled is not invalid, and the description still reaches it.
    await expect(control.getAttribute("aria-invalid")).toBeNull();
    await expect(describedElements(canvasElement, control)).toHaveLength(1);
  },
};

/**
 * THE AMBIGUITY, ANSWERED IN A RENDER. A boxed notice and a field message on one
 * screen is the ordinary shape of a failed form, and a message that writes
 * `role="alert"` would be ambiguous with a notice that wrote one too.
 *
 * It is not, because `Alert` writes NO role - that is its own decision, and the
 * two parts fit together rather than competing. `getByRole("alert")` here
 * resolves the field message and only the field message, and the notice is found
 * by its text or its slot.
 */
export const BesideANotice: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Alert tone="destructive">We could not sign you in.</Alert>
      <FormItem invalid>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input type="email" defaultValue="not-an-address" />
        </FormControl>
        <FormMessage>That does not look like an email address.</FormMessage>
      </FormItem>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The anchor: both are on screen, so a query that had rotted would fail here
    // rather than pass the assertions below by finding nothing.
    await expect(canvasElement.querySelectorAll('[data-slot="alert"]')).toHaveLength(1);
    await expect(canvasElement.querySelectorAll('[data-slot="form-message"]')).toHaveLength(1);
    // Exactly one live region on the screen, and it is the field's.
    const alerts = canvas.getAllByRole("alert");
    await expect(alerts).toHaveLength(1);
    await expect(alerts[0]).toHaveAttribute("data-slot", "form-message");
    // The notice carries neither spelling of a live region.
    const notice = canvasElement.querySelector<HTMLElement>('[data-slot="alert"]')!;
    await expect(notice.getAttribute("role")).toBeNull();
    await expect(notice.getAttribute("aria-live")).toBeNull();
  },
};

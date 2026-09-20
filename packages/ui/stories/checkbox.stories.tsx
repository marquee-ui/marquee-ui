import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Checkbox, CheckboxBox, CheckboxIndicator, CheckboxInput } from "@/checkbox";

const meta = { title: "Parts/Checkbox", component: Checkbox } satisfies Meta<typeof Checkbox>;
export default meta;

type Story = StoryObj<typeof meta>;

/** The drawing, spelled once: the mark goes inside the box, in every row. */
const drawing = (
  <CheckboxBox>
    <CheckboxIndicator />
  </CheckboxBox>
);

/**
 * The row as a real product writes it seven times over: a bold label, a quiet
 * second line, and the box pushed to the far edge. `w-full` and
 * `justify-between` are the CALLER's, because the part decides no width - which
 * is what lets the same row sit in a sheet and in a settings list.
 */
function Row({
  label,
  sublabel,
  name,
  defaultChecked = false,
  disabled = false,
}: {
  label: string;
  sublabel: string;
  name?: string;
  defaultChecked?: boolean;
  disabled?: boolean;
}) {
  return (
    <Checkbox className="w-full max-w-content justify-between text-sm text-foreground">
      <span className="flex flex-col">
        {label}
        <span className="text-xs text-foreground-2">{sublabel}</span>
      </span>
      <CheckboxInput name={name} defaultChecked={defaultChecked} disabled={disabled} />
      {drawing}
    </Checkbox>
  );
}

export const Default: Story = {
  render: () => <Row label="Spoilers" sublabel="Blur this review until tapped" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The accessible name comes off the wrapping label, with no `id` and no
    // `htmlFor` anywhere: that association is the reason the row is a `<label>`.
    const control = canvas.getByRole("checkbox", { name: /spoilers/i });
    await expect(control.tagName).toBe("INPUT");
    await expect(control).not.toBeChecked();

    // The nesting the drawing rests on: the mark is inside the box, and the box
    // is inside the row that carries the state trigger.
    const row = canvasElement.querySelector('[data-slot="checkbox"]')!;
    const box = canvasElement.querySelector('[data-slot="checkbox-box"]')!;
    const mark = canvasElement.querySelector('[data-slot="checkbox-indicator"]')!;
    await expect(box).toContainElement(mark as HTMLElement);
    await expect(row).toContainElement(box as HTMLElement);

    // Clicking the ROW's text, not the box: the whole 44px row is the control.
    //
    // ⚠️ The element's OWN `click()`, not `userEvent.click`, and it is the
    // environment rather than a preference: a click on anything inside a
    // `<label>` is forwarded to the labelled control, and forwarding it makes
    // `storybook/test` clone the pointer event, which throws "Failed to
    // construct 'PointerEvent'" under jsdom 30. Measured on the Switch's native
    // host first, on a bare label with nothing of this package in it.
    const text = canvas.getByText("Spoilers");
    text.click();
    await expect(control).toBeChecked();
    // …and back off, because a checkbox that can only be checked is a button.
    text.click();
    await expect(control).not.toBeChecked();
  },
};

/** The checked state, which the workbench has to show as well as reach. */
export const Checked: Story = {
  render: () => <Row label="Ranked" sublabel="Numbered order · reorder anytime" defaultChecked />,
};

export const Disabled: Story = {
  render: () => <Row label="Private" sublabel="Only you can see it" disabled />,
  play: async ({ canvasElement }) => {
    const control = within(canvasElement).getByRole("checkbox", { name: /private/i });
    await expect(control).toBeDisabled();
    within(canvasElement).getByText("Private").click();
    await expect(control).not.toBeChecked();
  },
};

export const DisabledChecked: Story = {
  render: () => <Row label="Private" sublabel="Only you can see it" defaultChecked disabled />,
};

/**
 * In a form, with no hidden mirror input and no JavaScript: the control IS the
 * form control, so its value is in the `FormData` on its own - which is what a
 * `<button aria-checked>` drawn as a checkbox would have to reinvent.
 */
export const InAForm: Story = {
  render: () => (
    <form aria-label="List settings">
      <Row label="Ranked" sublabel="Numbered order · reorder anytime" name="ranked" />
    </form>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByRole("form", { name: "List settings" }) as HTMLFormElement;
    await expect(new FormData(form).get("ranked")).toBeNull();
    canvas.getByText("Ranked").click();
    await expect(new FormData(form).get("ranked")).toBe("on");
  },
};

/**
 * A mark of the caller's own, which is the one thing the indicator takes
 * children for. Everything else about the part is unchanged, including where the
 * mark is and when it is painted.
 */
export const CustomMark: Story = {
  render: () => (
    <Checkbox className="w-full max-w-content justify-between text-sm text-foreground">
      <span>Show adult artwork</span>
      <CheckboxInput defaultChecked />
      <CheckboxBox>
        <CheckboxIndicator data-testid="custom-mark">
          <path d="M4 4l8 8M12 4l-8 8" />
        </CheckboxIndicator>
      </CheckboxBox>
    </Checkbox>
  ),
  play: async ({ canvasElement }) => {
    const mark = canvasElement.querySelector('[data-testid="custom-mark"]')!;
    // The caller's path, and ONLY the caller's: the house tick is not drawn beside it.
    await expect(mark.querySelectorAll("path")).toHaveLength(1);
    await expect(mark.querySelector("path")).toHaveAttribute("d", "M4 4l8 8M12 4l-8 8");
    await expect(mark).toHaveAttribute("aria-hidden", "true");
    await expect(within(canvasElement).getByRole("checkbox")).toBeChecked();
  },
};

/**
 * Two rows in one box, which is how every real settings list draws them: each
 * carries its own state and its own drawing.
 *
 * ⚠️ The related trap - an ancestor `.group` lighting up a box it does not own -
 * is NOT provable here, and the reason is worth knowing: a bare `group` is a
 * marker class that compiles to no rule at all, so a story that rendered one
 * would redden `compiles every one of them` in `tailwind-compile.test.tsx`. The
 * scoping is asserted where it can be seen instead - on the SELECTOR the trigger
 * produces, in `test/choice-drawing.test.tsx`.
 */
export const TwoRows: Story = {
  render: () => (
    <div className="flex w-full max-w-content flex-col gap-1 rounded-md border-2 border-border p-3">
      <Row label="Spoilers" sublabel="Blur this review until tapped" defaultChecked />
      <Row label="Played on" sublabel="Adds a dated entry to your diary" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("checkbox", { name: /spoilers/i })).toBeChecked();
    await expect(canvas.getByRole("checkbox", { name: /played on/i })).not.toBeChecked();
    // Two independent rows, each with its own box and its own mark.
    await expect(canvasElement.querySelectorAll('[data-slot="checkbox"]')).toHaveLength(2);
    await expect(canvasElement.querySelectorAll('[data-slot="checkbox-indicator"]')).toHaveLength(
      2,
    );
  },
};

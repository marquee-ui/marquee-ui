import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Label } from "@/label";
import { Switch, SwitchInput, SwitchThumb, SwitchTrack } from "@/switch";

const meta = { title: "Parts/Switch", component: Switch } satisfies Meta<typeof Switch>;
export default meta;

type Story = StoryObj<typeof meta>;

/** The drawing, spelled once: both hosts put the thumb inside the track. */
const drawing = (
  <SwitchTrack>
    <SwitchThumb />
  </SwitchTrack>
);

/**
 * The button host. The state lives in the CALLER, as it does in a real product -
 * a settings toggle writes to a server and reverts on failure - and reaches the
 * drawing only through `aria-checked`, which is also what a screen reader reads.
 */
function ButtonSwitch({
  initial = false,
  disabled = false,
}: {
  initial?: boolean;
  disabled?: boolean;
}) {
  const [on, setOn] = useState(initial);
  return (
    <Switch
      aria-label="Show adult artwork"
      aria-checked={on}
      disabled={disabled}
      onClick={() => setOn((value) => !value)}
      className="w-full max-w-content justify-between rounded-md border-2 border-border-strong px-4 py-2.5 text-left text-sm text-foreground"
    >
      <span>Show adult artwork</span>
      {drawing}
    </Switch>
  );
}

/** The native host: a real checkbox, invisible, covering the row it labels. */
function CheckboxSwitch({
  name,
  defaultChecked = false,
}: {
  name?: string;
  defaultChecked?: boolean;
}) {
  return (
    <Switch asChild>
      <label className="w-full max-w-content justify-between text-sm text-foreground">
        <span>Notify me on this device</span>
        <SwitchInput name={name} defaultChecked={defaultChecked} />
        {drawing}
      </label>
    </Switch>
  );
}

export const Off: Story = {
  render: () => <ButtonSwitch />,
  play: async ({ canvasElement }) => {
    const control = within(canvasElement).getByRole("switch", { name: "Show adult artwork" });
    // The nesting the whole geometry rests on: the thumb travels inside the
    // track's padding box, so a thumb that is not in the track has no 20px to
    // travel. `test/switch-drawing.test.tsx` measures the pixels; this is where
    // the DOM says the two are in the relationship those pixels assume.
    const track = canvasElement.querySelector('[data-slot="switch-track"]')!;
    const thumb = canvasElement.querySelector('[data-slot="switch-thumb"]')!;
    await expect(track).toContainElement(thumb as HTMLElement);

    await expect(control).toHaveAttribute("aria-checked", "false");
    await userEvent.click(control);
    await expect(control).toHaveAttribute("aria-checked", "true");
    // …and back, because a switch that can only be turned on is a button.
    await userEvent.click(control);
    await expect(control).toHaveAttribute("aria-checked", "false");
  },
};

export const On: Story = { render: () => <ButtonSwitch initial /> };

export const Disabled: Story = {
  render: () => <ButtonSwitch disabled />,
  play: async ({ canvasElement }) => {
    const control = within(canvasElement).getByRole("switch", { name: "Show adult artwork" });
    await expect(control).toBeDisabled();
    await userEvent.click(control);
    await expect(control).toHaveAttribute("aria-checked", "false");
  },
};

export const DisabledOn: Story = { render: () => <ButtonSwitch initial disabled /> };

/** The row's text as a `Label`, which is the common case in a settings list. */
export const WithLabel: Story = {
  render: () => (
    <Switch
      aria-checked={false}
      aria-label="Weekly digest"
      className="w-full max-w-content justify-between rounded-md border-2 border-border-strong px-4 py-2.5"
    >
      <Label tone="micro" asChild>
        <span>Weekly digest</span>
      </Label>
      {drawing}
    </Switch>
  ),
};

export const NativeCheckbox: Story = {
  render: () => <CheckboxSwitch />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The native control announces itself as a switch, exactly as the button
    // host does, and it is the INPUT that does so - not a wrapper.
    const control = canvas.getByRole("switch", { name: "Notify me on this device" });
    await expect(control.tagName).toBe("INPUT");
    await expect(control).not.toBeChecked();

    // Clicking the ROW, not the box: the whole 44px label is the control, which
    // is the reason the input is an overlay rather than the 24px track.
    //
    // ⚠️ The element's OWN `click()`, not `userEvent.click`, and it is the
    // environment rather than a preference: a click on anything inside a
    // `<label>` is forwarded to the labelled control, and forwarding it makes
    // `storybook/test` clone the pointer event, which throws "Failed to
    // construct 'PointerEvent': member view is not of type Window" under jsdom
    // 30. Measured on a bare `<label><span/><input/></label>` with nothing of
    // this package in it, so it is not this part's shape. `click()` is the
    // platform's own activation path, which is exactly the behaviour asserted.
    const row = canvas.getByText("Notify me on this device");
    row.click();
    await expect(control).toBeChecked();
    row.click();
    await expect(control).not.toBeChecked();
  },
};

/**
 * The native host inside a form. No hidden mirror input and no JavaScript: the
 * control IS the form control, so its value is in the `FormData` on its own.
 */
export const InAForm: Story = {
  render: () => (
    <form aria-label="Notification settings">
      <CheckboxSwitch name="notifications" />
    </form>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByRole("form", { name: "Notification settings" }) as HTMLFormElement;
    await expect(new FormData(form).get("notifications")).toBeNull();
    await userEvent.click(canvas.getByRole("switch", { name: "Notify me on this device" }));
    await expect(new FormData(form).get("notifications")).toBe("on");
  },
};

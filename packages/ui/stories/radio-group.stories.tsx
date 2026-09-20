import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  RadioGroup,
  RadioGroupCircle,
  RadioGroupIndicator,
  RadioGroupInput,
  RadioGroupItem,
} from "@/radio-group";

const meta = { title: "Parts/RadioGroup", component: RadioGroup } satisfies Meta<typeof RadioGroup>;
export default meta;

type Story = StoryObj<typeof meta>;

const RULES = [
  { value: "ads", heading: "Reviews and lists are not ad space" },
  { value: "spoilers", heading: "Tag your spoilers" },
  { value: "hate", heading: "No hate, no harassment" },
];

/** The drawing, spelled once. An item may compose none of it - see `NoDrawing`. */
const drawing = (
  <RadioGroupCircle>
    <RadioGroupIndicator />
  </RadioGroupCircle>
);

function Rules({
  defaultValue,
  disabledValue,
  name,
}: {
  defaultValue?: string;
  disabledValue?: string;
  name?: string;
}) {
  return (
    <RadioGroup
      aria-label="Which rule does it break?"
      name={name}
      className="flex w-full max-w-content flex-col gap-1"
    >
      {RULES.map((rule) => (
        <RadioGroupItem
          key={rule.value}
          className="w-full rounded-md border-2 border-border bg-surface px-3 py-2 text-sm text-foreground-2 has-checked:border-primary has-checked:text-foreground"
        >
          <RadioGroupInput
            value={rule.value}
            defaultChecked={rule.value === defaultValue}
            disabled={rule.value === disabledValue}
          />
          {drawing}
          <span>{rule.heading}</span>
        </RadioGroupItem>
      ))}
    </RadioGroup>
  );
}

export const Default: Story = {
  render: () => <Rules />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole("radiogroup", { name: "Which rule does it break?" });
    const radios = canvas.getAllByRole("radio");
    await expect(radios).toHaveLength(3);
    await expect(group).toContainElement(radios[0] as HTMLElement);

    // ONE group, and it is the shared `name` that makes it one - generated here,
    // because this group's value is read from React rather than from a form.
    const names = new Set(radios.map((radio) => radio.getAttribute("name")));
    await expect(names.size).toBe(1);
    await expect([...names][0]).toBeTruthy();

    // Checking the second unchecks nothing the caller wrote: the platform does it.
    canvas.getByText(RULES[1]!.heading).click();
    await expect(radios[1]).toBeChecked();
    await expect(radios[0]).not.toBeChecked();
    canvas.getByText(RULES[2]!.heading).click();
    await expect(radios[2]).toBeChecked();
    await expect(radios[1]).not.toBeChecked();
  },
};

export const Chosen: Story = { render: () => <Rules defaultValue="spoilers" /> };

/**
 * The two behaviours a React radio group re-implements, asserted on the platform's
 * own: a group is ONE tab stop, and the arrow keys move the checked radio. Neither
 * is a line of code in this package.
 */
export const Keyboard: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <button type="button" className="min-h-hit rounded-md border-2 border-border px-3">
        before
      </button>
      <Rules defaultValue="ads" />
      <button type="button" className="min-h-hit rounded-md border-2 border-border px-3">
        after
      </button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radios = canvas.getAllByRole("radio");

    // One stop in, one stop out: three radios, two tabs across the whole group.
    canvas.getByRole("button", { name: "before" }).focus();
    await userEvent.tab();
    await expect(document.activeElement).toBe(radios[0]);
    await userEvent.tab();
    await expect(document.activeElement).toBe(canvas.getByRole("button", { name: "after" }));

    // …and inside the group the arrow keys move the CHECKED radio, not just focus.
    (radios[0] as HTMLElement).focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(radios[1]).toBeChecked();
    await expect(radios[0]).not.toBeChecked();
    await expect(document.activeElement).toBe(radios[1]);
  },
};

export const Disabled: Story = {
  render: () => <Rules defaultValue="ads" disabledValue="hate" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radios = canvas.getAllByRole("radio");
    await expect(radios[2]).toBeDisabled();
    canvas.getByText(RULES[2]!.heading).click();
    await expect(radios[2]).not.toBeChecked();
    await expect(radios[0]).toBeChecked();
  },
};

/**
 * In a form: the group's `name` is the field's name, and the checked radio's
 * value is in the `FormData` with no hidden mirror input behind it.
 */
export const InAForm: Story = {
  render: () => (
    <form aria-label="Report">
      <Rules name="reason" defaultValue="ads" />
    </form>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByRole("form", { name: "Report" }) as HTMLFormElement;
    await expect(new FormData(form).get("reason")).toBe("ads");
    canvas.getByText(RULES[1]!.heading).click();
    await expect(new FormData(form).get("reason")).toBe("spoilers");
    // One field, one value, whatever the group holds.
    await expect([...new FormData(form).getAll("reason")]).toHaveLength(1);
  },
};

/**
 * An option grid that draws no circle at all: the selected state is a ring on the
 * caller's own tile, painted by the row's named group. This is the composition a
 * `variant="bare"` prop would have made a configuration question, and it is a real
 * product's avatar picker.
 */
export const NoDrawing: Story = {
  render: () => (
    <RadioGroup aria-label="Face" className="grid grid-cols-4 gap-3.5">
      {["bear", "fox", "owl", "wolf"].map((face) => (
        <RadioGroupItem key={face} className="justify-center">
          <RadioGroupInput value={face} defaultChecked={face === "fox"} />
          <span className="sr-only">Use the {face} face</span>
          <span
            data-testid={`tile-${face}`}
            aria-hidden="true"
            className="size-16 rounded-full border-2 border-border-strong bg-raised group-has-checked/radio:border-primary group-has-checked/radio:ring-2 group-has-checked/radio:ring-primary"
          />
        </RadioGroupItem>
      ))}
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Every option is still a named radio in a named group, with no circle drawn.
    await expect(canvas.getAllByRole("radio")).toHaveLength(4);
    await expect(canvas.getByRole("radio", { name: "Use the fox face" })).toBeChecked();
    await expect(canvasElement.querySelectorAll('[data-slot="radio-group-circle"]')).toHaveLength(
      0,
    );
    canvasElement.querySelector<HTMLElement>('[data-testid="tile-owl"]')!.click();
    await expect(canvas.getByRole("radio", { name: "Use the owl face" })).toBeChecked();
    await expect(canvas.getByRole("radio", { name: "Use the fox face" })).not.toBeChecked();
  },
};

/**
 * A `<ul>` host through `asChild`, because two real sites draw their options as a
 * list and have tests that resolve the `<li>`s. The role goes on the caller's
 * element and the accessible name comes off it too.
 */
export const AsAList: Story = {
  render: () => (
    <RadioGroup asChild name="rule">
      <ul
        aria-label="Which rule does it break?"
        className="flex w-full max-w-content flex-col gap-1"
      >
        {RULES.map((rule) => (
          <li key={rule.value} className="flex items-stretch gap-1">
            <a
              href={`#${rule.value}`}
              aria-label={`Read ${rule.value} in full`}
              className="flex min-h-hit min-w-hit items-center justify-center rounded-md border-2 border-border font-mono text-xs text-muted"
            >
              ?
            </a>
            <RadioGroupItem className="flex-1 rounded-md border-2 border-border px-3 text-sm text-foreground-2 has-checked:border-primary">
              <RadioGroupInput value={rule.value} />
              {drawing}
              <span>{rule.heading}</span>
            </RadioGroupItem>
          </li>
        ))}
      </ul>
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole("radiogroup", { name: "Which rule does it break?" });
    // The caller's element survives, and the role is on it.
    await expect(group.tagName).toBe("UL");
    await expect(canvasElement.querySelectorAll("li")).toHaveLength(3);
    // The deep link sits OUTSIDE the row: an anchor inside a label would toggle
    // the radio on its way to the page it points at.
    const link = canvas.getByRole("link", { name: "Read ads in full" });
    await expect(link.closest("label")).toBeNull();
    canvas.getByText(RULES[0]!.heading).click();
    await expect(canvas.getAllByRole("radio")[0]).toBeChecked();
  },
};

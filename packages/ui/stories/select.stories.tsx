import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "@/button";
import {
  Select,
  SelectArrow,
  SelectContent,
  SelectGroup,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectLabel,
  SelectPortal,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from "@/select";

const meta = { title: "Parts/Select", component: Select } satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;

function Choices() {
  return (
    <>
      <SelectGroup>
        <SelectLabel>Fruit</SelectLabel>
        <SelectItem value="apple">
          <SelectItemText>Apple</SelectItemText>
          <SelectItemIndicator aria-hidden="true">✓</SelectItemIndicator>
        </SelectItem>
        <SelectItem value="banana" disabled>
          <SelectItemText>Banana</SelectItemText>
          <SelectItemIndicator aria-hidden="true">✓</SelectItemIndicator>
        </SelectItem>
        <SelectItem value="cherry">
          <SelectItemText>Cherry</SelectItemText>
          <SelectItemIndicator aria-hidden="true">✓</SelectItemIndicator>
        </SelectItem>
      </SelectGroup>
      <SelectSeparator />
      <SelectGroup>
        <SelectLabel>Vegetables</SelectLabel>
        <SelectItem value="carrot">
          <SelectItemText>Carrot</SelectItemText>
          <SelectItemIndicator aria-hidden="true">✓</SelectItemIndicator>
        </SelectItem>
      </SelectGroup>
    </>
  );
}

function Parts() {
  return (
    <>
      <SelectTrigger aria-label="Produce" className="w-64">
        <SelectValue placeholder="Pick produce" />
        <SelectIcon aria-hidden="true">⌄</SelectIcon>
      </SelectTrigger>
      <SelectPortal>
        <SelectContent position="popper" sideOffset={4}>
          <SelectScrollUpButton aria-label="Scroll up">⌃</SelectScrollUpButton>
          <SelectViewport>
            <Choices />
          </SelectViewport>
          <SelectScrollDownButton aria-label="Scroll down">⌄</SelectScrollDownButton>
          <SelectArrow />
        </SelectContent>
      </SelectPortal>
    </>
  );
}

/** Uncontrolled state; the text slot alone becomes the trigger value. */
export const Default: Story = {
  args: { defaultValue: "apple", children: <Parts /> },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("combobox", { name: "Produce" });
    await expect(trigger).toHaveTextContent("Apple");
    await userEvent.click(trigger);
    const list = await within(document.body).findByRole("listbox");
    await expect(within(list).getByRole("group", { name: "Fruit" })).toBeInTheDocument();
    await expect(within(list).getByRole("option", { name: "Apple" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await userEvent.click(within(list).getByRole("option", { name: "Cherry" }));
    await waitFor(async () => {
      await expect(trigger).toHaveTextContent("Cherry");
    });
    await expect(within(document.body).queryByRole("listbox")).toBeNull();
    await expect(trigger).toHaveFocus();
    await expect(trigger).not.toHaveTextContent("✓");
  },
};

/** Arrow navigation skips disabled items, typeahead finds the text and Enter commits. */
export const Keyboard: Story = {
  args: { defaultValue: "apple", children: <Parts /> },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("combobox", { name: "Produce" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const list = await within(document.body).findByRole("listbox");
    await waitFor(async () => {
      await expect(within(list).getByRole("option", { name: "Apple" })).toHaveFocus();
    });
    await userEvent.keyboard("{ArrowDown}");
    await expect(within(list).getByRole("option", { name: "Cherry" })).toHaveFocus();
    await userEvent.keyboard("car");
    await waitFor(async () => {
      await expect(within(list).getByRole("option", { name: "Carrot" })).toHaveFocus();
    });
    await userEvent.keyboard("{Enter}");
    await waitFor(async () => {
      await expect(trigger).toHaveTextContent("Carrot");
    });
    await expect(trigger).toHaveFocus();
  },
};

/** Escape dismisses without changing the selection and returns focus. */
export const Escape: Story = {
  args: { defaultValue: "apple", children: <Parts /> },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("combobox", { name: "Produce" });
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    await within(document.body).findByRole("listbox");
    await userEvent.keyboard("{ArrowDown}{Escape}");
    await waitFor(async () => {
      await expect(within(document.body).queryByRole("listbox")).toBeNull();
    });
    await expect(trigger).toHaveFocus();
    await expect(trigger).toHaveTextContent("Apple");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "apple", children: <Parts /> },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("combobox", { name: "Produce" });
    await expect(trigger).toBeDisabled();
    await userEvent.click(trigger);
    await expect(within(document.body).queryByRole("listbox")).toBeNull();
    await expect(trigger).toHaveTextContent("Apple");
  },
};

function ControlledExample() {
  const [value, setValue] = useState("apple");
  return (
    <div className="flex flex-col items-start gap-3">
      <Select value={value} onValueChange={setValue}>
        <Parts />
      </Select>
      <output aria-label="Selected value">{value}</output>
      <Button onClick={() => setValue("carrot")}>Choose carrot externally</Button>
    </div>
  );
}
export const Controlled: Story = {
  render: () => <ControlledExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: "Produce" });
    await userEvent.click(trigger);
    await userEvent.click(await within(document.body).findByRole("option", { name: "Cherry" }));
    await expect(canvas.getByLabelText("Selected value")).toHaveTextContent("cherry");
    await expect(trigger).toHaveTextContent("Cherry");
    await userEvent.click(canvas.getByRole("button", { name: "Choose carrot externally" }));
    await expect(trigger).toHaveTextContent("Carrot");
  },
};

function ControlledOpenExample() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col items-start gap-3">
      <Select open={open} onOpenChange={setOpen} defaultValue="apple">
        <Parts />
      </Select>
      <output aria-label="Open state">{open ? "open" : "closed"}</output>
      <Button onClick={() => setOpen(true)}>Open externally</Button>
    </div>
  );
}
export const ControlledOpen: Story = {
  render: () => <ControlledOpenExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open externally" }));
    await within(document.body).findByRole("listbox");
    await expect(canvas.getByLabelText("Open state")).toHaveTextContent("open");
    await userEvent.keyboard("{Escape}");
    await waitFor(async () => {
      await expect(canvas.getByLabelText("Open state")).toHaveTextContent("closed");
    });
    const trigger = canvas.getByRole("combobox", { name: "Produce" });
    await expect(trigger).toHaveFocus();
    await userEvent.click(trigger);
    await expect(canvas.getByLabelText("Open state")).toHaveTextContent("open");
  },
};

function FormExample() {
  const [submitted, setSubmitted] = useState("Not submitted");
  return (
    <form
      className="flex flex-col items-start gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(String(new FormData(event.currentTarget).get("produce")));
      }}
    >
      <Select name="produce" required defaultValue="apple">
        <Parts />
      </Select>
      <Button type="submit">Submit choice</Button>
      <output aria-label="Submitted value">{submitted}</output>
    </form>
  );
}
export const NativeForm: Story = {
  render: () => <FormExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("combobox", { name: "Produce" }));
    await userEvent.click(await within(document.body).findByRole("option", { name: "Cherry" }));
    await userEvent.click(canvas.getByRole("button", { name: "Submit choice" }));
    await expect(canvas.getByLabelText("Submitted value")).toHaveTextContent("cherry");
    await expect(canvasElement.querySelector('select[name="produce"]')).toHaveAttribute("required");
  },
};

/** No portal or indicator is imposed; every supported asChild slot stays available. */
export const CustomParts: Story = {
  args: {
    defaultValue: "apple",
    children: (
      <>
        <SelectTrigger asChild>
          <Button variant="secondary" aria-label="Custom produce">
            <SelectValue />
            <SelectIcon asChild>
              <span aria-hidden="true">↓</span>
            </SelectIcon>
          </Button>
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectViewport asChild>
            <div data-testid="custom-viewport">
              <SelectItem value="apple" asChild>
                <div>
                  <SelectItemText asChild>
                    <span>Apple</span>
                  </SelectItemText>
                </div>
              </SelectItem>
              <SelectItem value="cherry">
                <SelectItemText>Cherry</SelectItemText>
              </SelectItem>
            </div>
          </SelectViewport>
        </SelectContent>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: "Custom produce" });
    await expect(trigger.tagName).toBe("BUTTON");
    await userEvent.click(trigger);
    const list = await canvas.findByRole("listbox");
    await expect(canvas.getByTestId("custom-viewport")).toBeInTheDocument();
    await expect(list.querySelector('[data-slot="select-item-indicator"]')).toBeNull();
    await userEvent.click(within(list).getByRole("option", { name: "Cherry" }));
    await expect(trigger).toHaveTextContent("Cherry");
  },
};

/** Scroll affordances are optional slots; End can reach items outside the viewport. */
export const Scrollable: Story = {
  args: {
    defaultValue: "1",
    children: (
      <>
        <SelectTrigger aria-label="Section" className="w-64">
          <SelectValue />
          <SelectIcon aria-hidden="true">⌄</SelectIcon>
        </SelectTrigger>
        <SelectPortal>
          <SelectContent position="popper" className="max-h-64">
            <SelectScrollUpButton aria-label="Scroll up">⌃</SelectScrollUpButton>
            <SelectViewport>
              {Array.from({ length: 24 }, (_, index) => (
                <SelectItem key={index} value={String(index + 1)}>
                  <SelectItemText>Section {index + 1}</SelectItemText>
                  <SelectItemIndicator aria-hidden="true">✓</SelectItemIndicator>
                </SelectItem>
              ))}
            </SelectViewport>
            <SelectScrollDownButton aria-label="Scroll down">⌄</SelectScrollDownButton>
          </SelectContent>
        </SelectPortal>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("combobox", { name: "Section" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const list = await within(document.body).findByRole("listbox");
    await expect(within(list).getAllByRole("option")).toHaveLength(24);
    await userEvent.keyboard("{End}{Enter}");
    await waitFor(async () => {
      await expect(trigger).toHaveTextContent("Section 24");
    });
  },
};

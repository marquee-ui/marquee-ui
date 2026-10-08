import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "@/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/dialog";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/sheet";
import {
  Combobox,
  ComboboxCommand,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPortal,
  ComboboxSeparator,
  ComboboxTrigger,
} from "@/combobox";

const meta = { title: "Parts/Combobox", component: Combobox } satisfies Meta<typeof Combobox>;
export default meta;
type Story = StoryObj<typeof meta>;
const fruit = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana", disabled: true },
  { value: "cherry", label: "Cherry" },
  { value: "date", label: "Date" },
];

function Picker() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("apple");
  return (
    <div className="flex flex-col items-start gap-4">
      <Combobox open={open} onOpenChange={setOpen}>
        <ComboboxTrigger aria-label="Fruit" className="w-64">
          {fruit.find((item) => item.value === value)?.label}
          <span aria-hidden="true">⌄</span>
        </ComboboxTrigger>
        <ComboboxPortal>
          <ComboboxContent aria-label="Choose fruit" sideOffset={8} collisionPadding={16}>
            <ComboboxCommand label="Search fruit">
              <ComboboxInput placeholder="Search fruit…" />
              <ComboboxList label="Fruit results">
                <ComboboxEmpty>No fruit found.</ComboboxEmpty>
                <ComboboxGroup heading="Available fruit">
                  {fruit.map((item) => (
                    <ComboboxItem
                      key={item.value}
                      value={item.value}
                      disabled={item.disabled}
                      data-committed={value === item.value}
                      onSelect={(next) => {
                        setValue(next);
                        setOpen(false);
                      }}
                    >
                      {item.label}
                      <span aria-hidden="true">{value === item.value ? "✓" : ""}</span>
                    </ComboboxItem>
                  ))}
                </ComboboxGroup>
                <ComboboxSeparator />
              </ComboboxList>
            </ComboboxCommand>
          </ComboboxContent>
        </ComboboxPortal>
      </Combobox>
      <output aria-label="Committed fruit">{value}</output>
      <Button onClick={() => setValue("cherry")}>Choose cherry externally</Button>
      <Button onClick={() => setOpen(true)}>Open externally</Button>
      <output aria-label="Popup state">{open ? "open" : "closed"}</output>
      <Button className="mt-64">Outside action</Button>
    </div>
  );
}

export const Default: Story = {
  render: () => <Picker />,
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Fruit" });
    await user.click(trigger);
    const input = await within(document.body).findByRole("combobox", { name: "Search fruit" });
    await waitFor(() => expect(input).toHaveFocus());
    await user.type(input, "cherry");
    await expect(within(document.body).getAllByRole("option")).toHaveLength(1);
    await user.click(within(document.body).getByRole("option", { name: "Cherry" }));
    await expect(trigger).toHaveTextContent("Cherry");
    await expect(canvas.getByLabelText("Committed fruit")).toHaveTextContent("cherry");
    await waitFor(() => expect(trigger).toHaveFocus());
    await expect(within(document.body).queryByRole("listbox")).toBeNull();
  },
};

export const Keyboard: Story = {
  render: () => <Picker />,
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const trigger = within(canvasElement).getByRole("button", { name: "Fruit" });
    trigger.focus();
    await user.keyboard("{Enter}");
    const input = await within(document.body).findByRole("combobox", { name: "Search fruit" });
    await waitFor(() => expect(input).toHaveFocus());
    await user.keyboard("{End}");
    await expect(within(document.body).getByRole("option", { name: "Date" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(trigger).toHaveTextContent("Apple");
    await user.keyboard("{Home}{ArrowDown}");
    await expect(within(document.body).getByRole("option", { name: "Cherry" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await user.keyboard("{ArrowUp}");
    await expect(within(document.body).getByRole("option", { name: "Apple" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await user.keyboard("{End}{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
    await expect(trigger).toHaveTextContent("Apple");
    await user.keyboard("{Enter}");
    await within(document.body).findByRole("listbox");
    await user.keyboard("{End}{Enter}");
    await expect(trigger).toHaveTextContent("Date");
  },
};

export const EmptyAndDisabled: Story = {
  render: () => <Picker />,
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const trigger = within(canvasElement).getByRole("button", { name: "Fruit" });
    await user.click(trigger);
    const input = await within(document.body).findByRole("combobox", { name: "Search fruit" });
    await user.type(input, "banana");
    await expect(within(document.body).getByRole("option", { name: "Banana" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await user.keyboard("{Enter}");
    await expect(trigger).toHaveTextContent("Apple");
    await user.clear(input);
    await user.type(input, "no-match");
    await expect(within(document.body).getByText("No fruit found.")).toBeVisible();
    await expect(within(document.body).queryAllByRole("option")).toHaveLength(0);
    await user.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const ControlledOpen: Story = {
  render: () => <Picker />,
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    await user.click(canvas.getByRole("button", { name: "Choose cherry externally" }));
    await expect(canvas.getByRole("button", { name: "Fruit" })).toHaveTextContent("Cherry");
    await user.click(canvas.getByRole("button", { name: "Open externally" }));
    await within(document.body).findByRole("listbox");
    await expect(canvas.getByLabelText("Popup state")).toHaveTextContent("open");
    await user.click(canvas.getByRole("button", { name: "Outside action" }));
    await expect(canvas.getByLabelText("Popup state")).toHaveTextContent("closed");
    await expect(canvas.getByRole("button", { name: "Outside action" })).toHaveFocus();
  },
};

export const Disabled: Story = {
  args: { children: <ComboboxTrigger disabled>Unavailable picker</ComboboxTrigger> },
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const trigger = within(canvasElement).getByRole("button", { name: "Unavailable picker" });
    await expect(trigger).toBeDisabled();
    await user.click(trigger);
    await expect(within(document.body).queryByRole("listbox")).toBeNull();
  },
};

export const CustomParts: Story = {
  args: {
    children: (
      <>
        <ComboboxTrigger asChild>
          <Button variant="secondary">Custom fruit</Button>
        </ComboboxTrigger>
        <ComboboxContent aria-label="Custom fruit popup" sideOffset={8} collisionPadding={16}>
          <ComboboxCommand label="Custom fruit search">
            <ComboboxInput />
            <ComboboxList label="Custom fruit results">
              <ComboboxItem value="apple" asChild>
                <article>Apple</article>
              </ComboboxItem>
              <ComboboxItem value="cherry">Cherry</ComboboxItem>
            </ComboboxList>
          </ComboboxCommand>
        </ComboboxContent>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Custom fruit" });
    await user.click(trigger);
    await expect(trigger.tagName).toBe("BUTTON");
    const item = await canvas.findByRole("option", { name: "Apple" });
    await expect(item.tagName).toBe("ARTICLE");
    await expect(canvas.getByRole("combobox", { name: "Custom fruit search" })).toHaveFocus();
    await expect(canvasElement.querySelector('[data-slot="combobox-item-indicator"]')).toBeNull();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

function FormPicker() {
  const [value, setValue] = useState("apple");
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState("");
  return (
    <form
      className="flex flex-col items-start gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(String(new FormData(event.currentTarget).get("fruit")));
      }}
    >
      <input type="hidden" name="fruit" value={value} />
      <Combobox open={open} onOpenChange={setOpen}>
        <ComboboxTrigger aria-label="Form fruit">{value}</ComboboxTrigger>
        <ComboboxPortal>
          <ComboboxContent aria-label="Form fruit popup" sideOffset={8} collisionPadding={16}>
            <ComboboxCommand label="Search form fruit">
              <ComboboxInput />
              <ComboboxList label="Form fruit results">
                <ComboboxItem
                  value="apple"
                  onSelect={(next) => {
                    setValue(next);
                    setOpen(false);
                  }}
                >
                  Apple
                </ComboboxItem>
                <ComboboxItem
                  value="cherry"
                  onSelect={(next) => {
                    setValue(next);
                    setOpen(false);
                  }}
                >
                  Cherry
                </ComboboxItem>
              </ComboboxList>
            </ComboboxCommand>
          </ComboboxContent>
        </ComboboxPortal>
      </Combobox>
      <Button type="submit">Submit fruit</Button>
      <output aria-label="Submitted fruit">{saved || "Not submitted"}</output>
    </form>
  );
}
export const NativeForm: Story = {
  render: () => <FormPicker />,
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    await user.click(canvas.getByRole("button", { name: "Form fruit" }));
    await user.click(await within(document.body).findByRole("option", { name: "Cherry" }));
    await expect(canvas.getByLabelText("Submitted fruit")).toHaveTextContent("Not submitted");
    await user.click(canvas.getByRole("button", { name: "Submit fruit" }));
    await expect(canvas.getByLabelText("Submitted fruit")).toHaveTextContent("cherry");
  },
};

function LongPicker() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("Section 1");
  return (
    <Combobox open={open} onOpenChange={setOpen}>
      <ComboboxTrigger aria-label="Section">{value}</ComboboxTrigger>
      <ComboboxPortal>
        <ComboboxContent aria-label="Section popup" sideOffset={8} collisionPadding={16}>
          <ComboboxCommand label="Search sections">
            <ComboboxInput />
            <ComboboxList label="Sections">
              {Array.from({ length: 24 }, (_, index) => (
                <ComboboxItem
                  key={index}
                  value={`Section ${index + 1}`}
                  onSelect={(next) => {
                    setValue(next);
                    setOpen(false);
                  }}
                >
                  Section {index + 1}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxCommand>
        </ComboboxContent>
      </ComboboxPortal>
    </Combobox>
  );
}
export const Scrollable: Story = {
  render: () => <LongPicker />,
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const trigger = within(canvasElement).getByRole("button", { name: "Section" });
    await user.click(trigger);
    await within(document.body).findByRole("listbox");
    await user.keyboard("{End}{Enter}");
    await expect(trigger).toHaveTextContent("Section 24");
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const NestedDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open fruit dialog</Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent>
          <DialogTitle>Fruit dialog</DialogTitle>
          <DialogDescription>Search and choose one fruit.</DialogDescription>
          <Picker />
        </DialogContent>
      </DialogPortal>
    </Dialog>
  ),
  play: nestedPlay("dialog"),
};
export const NestedSheet: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open fruit sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetTitle>Fruit sheet</SheetTitle>
        <SheetDescription>Search and choose one fruit.</SheetDescription>
        <Picker />
      </SheetContent>
    </Sheet>
  ),
  play: nestedPlay("sheet"),
};
function nestedPlay(kind: "dialog" | "sheet") {
  return async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const user = userEvent.setup();
    const outside = within(canvasElement).getByRole("button", { name: `Open fruit ${kind}` });
    await user.click(outside);
    const parent = await within(document.body).findByRole("dialog", { name: `Fruit ${kind}` });
    const trigger = within(parent).getByRole("button", { name: "Fruit" });
    await user.click(trigger);
    const search = await within(document.body).findByRole("combobox", { name: "Search fruit" });
    await waitFor(() => expect(search).toHaveFocus());
    await user.keyboard("{End}{Enter}");
    await expect(trigger).toHaveTextContent("Date");
    await expect(parent).toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
    await user.keyboard("{Enter}");
    await within(document.body).findByRole("listbox");
    await user.keyboard("{Escape}");
    await expect(within(document.body).queryByRole("listbox")).toBeNull();
    await expect(parent).toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
    await user.keyboard("{Escape}");
    await waitFor(() => expect(within(document.body).queryByRole("dialog")).toBeNull());
    await expect(outside).toHaveFocus();
  };
}

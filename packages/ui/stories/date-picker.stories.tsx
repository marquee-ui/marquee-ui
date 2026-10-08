import { useId, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "@/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/dialog";
import {
  DatePicker,
  DatePickerCalendar,
  DatePickerClose,
  DatePickerContent,
  DatePickerDescription,
  DatePickerHeader,
  DatePickerPortal,
  DatePickerTitle,
  DatePickerTrigger,
} from "@/date-picker";

const meta = { title: "Parts/DatePicker", component: DatePicker } satisfies Meta<typeof DatePicker>;
export default meta;
type Story = StoryObj<typeof meta>;
// A parent modal can intercept Calendar's early focus effect. Choose the
// roving day after Radix has registered the nested popup's focus scope.
function focusCalendarOnOpen(event: Event) {
  if (!(event.target instanceof HTMLElement)) return;
  const day = event.target.querySelector<HTMLButtonElement>(
    '[data-slot="calendar-day-button"][tabindex="0"]',
  );
  if (day) {
    event.preventDefault();
    day.focus();
  }
}

const october = new Date(2026, 9, 1);
const date = (day: number) => new Date(2026, 9, day);
const format = (value: Date) =>
  value.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

function Single() {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Date | undefined>(date(12));
  return (
    <div className="flex flex-wrap items-center gap-3">
      <DatePicker open={open} onOpenChange={setOpen}>
        <DatePickerTrigger aria-label="Choose date">
          {selected ? format(selected) : "Choose date"}
        </DatePickerTrigger>
        <DatePickerPortal>
          <DatePickerContent aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}>
            <DatePickerHeader>
              <DatePickerTitle id={`${id}-title`}>Choose a day</DatePickerTitle>
              <DatePickerDescription id={`${id}-description`}>
                The 14th is unavailable.
              </DatePickerDescription>
            </DatePickerHeader>
            <DatePickerCalendar
              mode="single"
              defaultMonth={october}
              selected={selected}
              onSelect={(value) => {
                setSelected(value);
                setOpen(false);
              }}
              disabled={date(14)}
              autoFocus
            />
            <DatePickerClose>Close date</DatePickerClose>
          </DatePickerContent>
        </DatePickerPortal>
      </DatePicker>
      <output aria-label="Selected date">{selected ? format(selected) : "No date"}</output>
      <Button width="auto" variant="secondary">
        Outside action
      </Button>
    </div>
  );
}

export const Default: Story = {
  render: () => <Single />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole("button", { name: "Choose date" });
    await userEvent.click(trigger);
    const panel = await body.findByRole("dialog", { name: "Choose a day" });
    await expect(panel).toHaveAccessibleDescription("The 14th is unavailable.");
    await expect(canvasElement).not.toContainElement(panel);
    await expect(within(panel).getByRole("button", { name: /October 12th, 2026/ })).toHaveFocus();
    await expect(within(panel).getByRole("button", { name: /October 14th, 2026/ })).toBeDisabled();
    await userEvent.click(within(panel).getByRole("button", { name: /October 17th, 2026/ }));
    await waitFor(async () => {
      await expect(body.queryByRole("dialog")).toBeNull();
    });
    await expect(trigger).toHaveFocus();
    await expect(canvas.getByLabelText("Selected date")).toHaveTextContent("October 17, 2026");
    await userEvent.click(trigger);
    await body.findByRole("dialog", { name: "Choose a day" });
    await userEvent.keyboard("{ArrowRight}");
    await expect(body.getByRole("button", { name: /October 18th, 2026/ })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await waitFor(async () => {
      await expect(body.queryByRole("dialog")).toBeNull();
    });
    await expect(trigger).toHaveFocus();
  },
};

function RangeDates() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<{ from: Date | undefined; to?: Date }>();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <DatePicker open={open} onOpenChange={setOpen}>
        <DatePickerTrigger aria-label="Choose range">
          {selected?.to ? `${format(selected.from!)} – ${format(selected.to)}` : "Choose range"}
        </DatePickerTrigger>
        <DatePickerPortal>
          <DatePickerContent aria-label="Choose date range">
            <DatePickerDescription>Choose at least two nights.</DatePickerDescription>
            <DatePickerCalendar
              mode="range"
              defaultMonth={october}
              selected={selected}
              min={2}
              onSelect={(value) => {
                setSelected(value);
                if (value?.to) setOpen(false);
              }}
              autoFocus
              footer={selected?.from && !selected.to ? "Choose an end day" : "Choose a start day"}
            />
            <DatePickerClose>Close range</DatePickerClose>
          </DatePickerContent>
        </DatePickerPortal>
      </DatePicker>
      <output aria-label="Selected range">
        {selected?.to
          ? `${selected.from?.getDate()}–${selected.to.getDate()}`
          : "No complete range"}
      </output>
      <Button width="auto" onClick={() => setSelected(undefined)}>
        Reset range
      </Button>
    </div>
  );
}
export const Range: Story = {
  render: () => <RangeDates />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(document.body);
    const trigger = canvas.getByRole("button", { name: "Choose range" });
    await userEvent.click(trigger);
    const panel = await body.findByRole("dialog", { name: "Choose date range" });
    await userEvent.click(within(panel).getByRole("button", { name: /October 22nd, 2026/ }));
    await expect(within(panel).getByText("Choose an end day")).toBeInTheDocument();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(within(panel).getByRole("button", { name: "Close range" }));
    await waitFor(async () => {
      await expect(body.queryByRole("dialog")).toBeNull();
    });
    await expect(trigger).toHaveFocus();
    await userEvent.click(trigger);
    const reopened = await body.findByRole("dialog", { name: "Choose date range" });
    await expect(
      within(reopened)
        .getByRole("button", { name: /October 22nd, 2026/ })
        .closest("td"),
    ).toHaveAttribute("aria-selected", "true");
    await userEvent.click(within(reopened).getByRole("button", { name: /October 24th, 2026/ }));
    await waitFor(async () => {
      await expect(body.queryByRole("dialog")).toBeNull();
    });
    await expect(trigger).toHaveFocus();
    await expect(canvas.getByLabelText("Selected range")).toHaveTextContent("22–24");
    await userEvent.click(canvas.getByRole("button", { name: "Reset range" }));
    await expect(canvas.getByLabelText("Selected range")).toHaveTextContent("No complete range");
  },
};

function DisabledDays() {
  const [selected, setSelected] = useState<Date | undefined>();
  return (
    <div className="flex flex-wrap gap-3">
      <DatePicker>
        <DatePickerTrigger disabled>Unavailable picker</DatePickerTrigger>
      </DatePicker>
      <DatePicker>
        <DatePickerTrigger asChild>
          <Button width="auto" variant="secondary">
            Choose available day
          </Button>
        </DatePickerTrigger>
        <DatePickerPortal>
          <DatePickerContent aria-label="Available dates">
            <DatePickerCalendar
              mode="single"
              defaultMonth={october}
              selected={selected}
              onSelect={setSelected}
              disabled={date(14)}
              autoFocus
              footer={selected ? `Selected day: ${selected.getDate()}` : "Choose an available day"}
            />
            <DatePickerClose>Done choosing</DatePickerClose>
          </DatePickerContent>
        </DatePickerPortal>
      </DatePicker>
    </div>
  );
}
export const Disabled: Story = {
  render: () => <DisabledDays />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(document.body);
    await userEvent.click(canvas.getByRole("button", { name: "Unavailable picker" }));
    await expect(body.queryByRole("dialog")).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Choose available day" }));
    const panel = await body.findByRole("dialog", { name: "Available dates" });
    await userEvent.click(within(panel).getByRole("button", { name: /October 14th, 2026/ }));
    await expect(within(panel).queryAllByRole("gridcell", { selected: true })).toHaveLength(0);
    await userEvent.click(within(panel).getByRole("button", { name: /October 17th, 2026/ }));
    await expect(within(panel).getByText("Selected day: 17")).toBeInTheDocument();
    await userEvent.click(within(panel).getByRole("button", { name: "Done choosing" }));
    await waitFor(async () => {
      await expect(body.queryByRole("dialog")).toBeNull();
    });
  },
};

function Nested() {
  const [selected, setSelected] = useState<Date | undefined>(date(12));
  return (
    <Dialog>
      <DialogTrigger>Open schedule dialog</DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent>
          <DialogTitle>Schedule details</DialogTitle>
          <DialogDescription>The date picker has its own dismissal scope.</DialogDescription>
          <DatePicker>
            <DatePickerTrigger aria-label="Choose dialog date">
              {selected ? format(selected) : "Choose dialog date"}
            </DatePickerTrigger>
            <DatePickerPortal>
              <DatePickerContent aria-label="Dialog date" onOpenAutoFocus={focusCalendarOnOpen}>
                <DatePickerCalendar
                  mode="single"
                  defaultMonth={october}
                  selected={selected}
                  onSelect={setSelected}
                  autoFocus
                />
                <DatePickerClose>Done with date</DatePickerClose>
              </DatePickerContent>
            </DatePickerPortal>
          </DatePicker>
          <output aria-label="Dialog selected date">
            {selected ? format(selected) : "No date"}
          </output>
          <DialogClose>Close schedule dialog</DialogClose>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
export const NestedDialog: Story = {
  render: () => <Nested />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(document.body);
    const outer = canvas.getByRole("button", { name: "Open schedule dialog" });
    await userEvent.click(outer);
    const dialog = await body.findByRole("dialog", { name: "Schedule details" });
    const trigger = within(dialog).getByRole("button", { name: "Choose dialog date" });
    await userEvent.click(trigger);
    const picker = await body.findByRole("dialog", { name: "Dialog date" });
    await userEvent.click(within(picker).getByRole("button", { name: /October 17th, 2026/ }));
    await expect(within(dialog).getByLabelText("Dialog selected date")).toHaveTextContent(
      "October 17, 2026",
    );
    await userEvent.keyboard("{Escape}");
    await waitFor(async () => {
      await expect(body.queryByRole("dialog", { name: "Dialog date" })).toBeNull();
    });
    await expect(trigger).toHaveFocus();
    await expect(dialog).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(async () => {
      await expect(body.queryByRole("dialog")).toBeNull();
    });
    await expect(outer).toHaveFocus();
    await expect(document.body.style.pointerEvents).not.toBe("none");
  },
};

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Calendar, CalendarDayButton, CalendarNavigationButton, CalendarRoot } from "@/calendar";
import type { DateRange, DayButtonProps } from "@daypicker/react";

const meta = { title: "Parts/Calendar", component: Calendar } satisfies Meta<typeof Calendar>;
export default meta;
type Story = StoryObj<typeof meta>;
const october = new Date(2026, 9, 1);
const date = (day: number) => new Date(2026, 9, day);

function Single() {
  const [selected, setSelected] = useState<Date | undefined>(date(12));
  const [month, setMonth] = useState(october);
  return (
    <div className="flex max-w-full flex-col items-start gap-3">
      <Calendar
        mode="single"
        month={month}
        onMonthChange={setMonth}
        selected={selected}
        onSelect={setSelected}
        footer={selected ? `Selected day: ${selected.getDate()}` : "Choose a day"}
      />
      <button
        type="button"
        className="min-h-hit min-w-hit border-2 border-border-strong bg-raised px-3 text-foreground"
        onClick={() => {
          setSelected(undefined);
          setMonth(october);
        }}
      >
        Reset day
      </button>
    </div>
  );
}
export const Default: Story = {
  render: () => <Single />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /October 15th, 2026/ }));
    await expect(canvas.getByText("Selected day: 15")).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: /October 15th, 2026/ }).closest("td"),
    ).toHaveAttribute("aria-selected", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Reset day" }));
    await expect(canvas.getByText("Choose a day")).toBeInTheDocument();
    await expect(canvas.queryAllByRole("gridcell", { selected: true })).toHaveLength(0);
  },
};

function MultipleDays() {
  const [selected, setSelected] = useState<Date[] | undefined>([date(12)]);
  return (
    <Calendar
      mode="multiple"
      defaultMonth={october}
      selected={selected}
      onSelect={setSelected}
      min={1}
      max={3}
      footer={`Selected days: ${selected?.map((day) => day.getDate()).join(", ") ?? "none"}`}
    />
  );
}
export const Multiple: Story = {
  render: () => <MultipleDays />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /October 15th, 2026/ }));
    await expect(canvas.getByText("Selected days: 12, 15")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: /October 12th, 2026/ }));
    await expect(canvas.getByText("Selected days: 15")).toBeInTheDocument();
  },
};

function RangeDays() {
  const [selected, setSelected] = useState<DateRange | undefined>({ from: date(10), to: date(15) });
  return (
    <Calendar
      mode="range"
      defaultMonth={october}
      numberOfMonths={2}
      selected={selected}
      onSelect={setSelected}
      min={2}
      max={7}
      resetOnSelect
      footer={
        selected?.to
          ? `Selected range: ${selected.from?.getDate()}–${selected.to.getDate()}`
          : "Choose an end day"
      }
    />
  );
}
export const Range: Story = {
  render: () => <RangeDays />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /October 20th, 2026/ }));
    await expect(canvas.getByText("Choose an end day")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: /October 23rd, 2026/ }));
    await expect(canvas.getByText("Selected range: 20–23")).toBeInTheDocument();
    await expect(canvas.getAllByRole("gridcell", { selected: true })).toHaveLength(4);
  },
};

export const Disabled: Story = {
  render: () => (
    <Calendar
      mode="single"
      defaultMonth={october}
      disabled={[{ dayOfWeek: [0, 6] }, date(14)]}
      hidden={date(15)}
      startMonth={october}
      endMonth={october}
      footer="Weekends and the 14th are unavailable; the 15th is hidden."
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const unavailable = canvas.getByRole("button", { name: /October 14th, 2026/ });
    await expect(unavailable).toBeDisabled();
    await userEvent.click(unavailable);
    await expect(canvas.queryAllByRole("gridcell", { selected: true })).toHaveLength(0);
    await expect(canvas.queryByRole("button", { name: /October 15th, 2026/ })).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: /October 16th, 2026/ }));
    await expect(
      canvas.getByRole("button", { name: /October 16th, 2026/ }).closest("td"),
    ).toHaveAttribute("aria-selected", "true");
  },
};

function MarkedDay(props: DayButtonProps) {
  return (
    <CalendarDayButton {...props}>
      <span>{props.children}</span>
      {props.day.date.getDate() === 12 && (
        <span aria-hidden="true" className="absolute bottom-1 size-1 rounded-full bg-current" />
      )}
    </CalendarDayButton>
  );
}
export const CustomSlots: Story = {
  render: () => (
    <Calendar
      mode="single"
      defaultMonth={october}
      components={{
        Root: (props) => <CalendarRoot {...props} data-custom-root="true" />,
        DayButton: MarkedDay,
        NextMonthButton: (props) => (
          <CalendarNavigationButton {...props}>
            <span aria-hidden="true">→</span>
          </CalendarNavigationButton>
        ),
      }}
      labels={{ labelNext: () => "Next schedule month" }}
      footer="The dot marks an appointment, not a selection."
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /October 12th, 2026/ }));
    await expect(
      canvas.getByRole("button", { name: /October 12th, 2026/ }).closest("td"),
    ).toHaveAttribute("aria-selected", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Next schedule month" }));
    await expect(canvas.getByRole("grid", { name: "November 2026" })).toBeInTheDocument();
  },
};

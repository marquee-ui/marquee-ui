import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { fr } from "@daypicker/react/locale";
import { afterEach, expect, expectTypeOf, it, vi } from "vitest";
import {
  Calendar,
  CalendarDayButton,
  CalendarNavigationButton,
  CalendarRoot,
  type CalendarProps,
} from "../src/calendar";
import type { DayPickerProps, DateRange, DayButtonProps } from "@daypicker/react";

afterEach(cleanup);
const month = new Date(2026, 9, 1);
const date = (day: number) => new Date(2026, 9, day);
const dayButton = (day: number) =>
  screen.getByRole("button", { name: new RegExp(`October ${day}(?:st|nd|rd|th), 2026`) });

it("retains the primitive discriminated selection contract", () => {
  expectTypeOf<CalendarProps>().toEqualTypeOf<DayPickerProps>();
  // @ts-expect-error a single calendar cannot receive a list of dates
  const single: CalendarProps = { mode: "single", selected: [date(12)] };
  // @ts-expect-error multiple mode cannot receive a range
  const multiple: CalendarProps = { mode: "multiple", selected: { from: date(12), to: date(15) } };
  // @ts-expect-error range mode cannot receive a single Date
  const range: CalendarProps = { mode: "range", selected: date(12) };
  expect([single.mode, multiple.mode, range.mode]).toEqual(["single", "multiple", "range"]);
});

it("reports controlled single selection without taking control from the caller", async () => {
  const change = vi.fn();
  const { rerender } = render(
    <Calendar mode="single" month={month} selected={date(12)} onSelect={change} />,
  );
  await userEvent.click(dayButton(15));
  expect(change).toHaveBeenCalledOnce();
  expect(change.mock.calls[0]![0]).toEqual(date(15));
  expect(dayButton(12).closest("td")).toHaveAttribute("aria-selected", "true");
  expect(dayButton(15).closest("td")).not.toHaveAttribute("aria-selected");
  rerender(<Calendar mode="single" month={month} selected={date(15)} onSelect={change} />);
  expect(dayButton(15).closest("td")).toHaveAttribute("aria-selected", "true");
  expect(dayButton(12).closest("td")).not.toHaveAttribute("aria-selected");
});

it("toggles multiple dates and respects minimum and maximum selection bounds", async () => {
  function Multiple() {
    const [selected, setSelected] = useState<Date[] | undefined>([date(12)]);
    return (
      <Calendar
        mode="multiple"
        month={month}
        selected={selected}
        onSelect={setSelected}
        min={1}
        max={2}
      />
    );
  }
  render(<Multiple />);
  await userEvent.click(dayButton(15));
  expect(screen.getAllByRole("gridcell", { selected: true })).toHaveLength(2);
  await userEvent.click(dayButton(16));
  expect(screen.getAllByRole("gridcell", { selected: true })).toHaveLength(1);
  expect(dayButton(16).closest("td")).toHaveAttribute("aria-selected", "true");
  await userEvent.click(dayButton(15));
  await userEvent.click(dayButton(16));
  expect(screen.getAllByRole("gridcell", { selected: true })).toHaveLength(1);
  expect(dayButton(15).closest("td")).toHaveAttribute("aria-selected", "true");
  await userEvent.click(dayButton(15));
  expect(dayButton(15).closest("td")).toHaveAttribute("aria-selected", "true");
});

it("selects range bounds and resets a range containing an excluded disabled date", async () => {
  function Range() {
    const [selected, setSelected] = useState<DateRange | undefined>();
    return (
      <Calendar
        mode="range"
        month={month}
        selected={selected}
        onSelect={setSelected}
        min={2}
        max={5}
        disabled={date(14)}
        excludeDisabled
        footer={
          selected?.to ? `${selected.from?.getDate()}–${selected.to.getDate()}` : "Choose an end"
        }
      />
    );
  }
  render(<Range />);
  await userEvent.click(dayButton(10));
  await userEvent.click(dayButton(11));
  expect(screen.getByText("Choose an end")).toBeInTheDocument();
  expect(dayButton(11).closest("td")).toHaveAttribute("aria-selected", "true");
  await userEvent.click(dayButton(10));
  await userEvent.click(dayButton(12));
  expect(screen.getByText("10–12")).toHaveAttribute("role", "status");
  expect(screen.getAllByRole("gridcell", { selected: true })).toHaveLength(3);
  await userEvent.click(dayButton(10));
  await userEvent.click(dayButton(15));
  expect(screen.getByText("Choose an end")).toBeInTheDocument();
  expect(dayButton(15).closest("td")).toHaveAttribute("aria-selected", "true");
});

it("preserves disabled and hidden matchers and accessible weekday/day names", async () => {
  const click = vi.fn();
  render(
    <Calendar
      mode="single"
      month={month}
      disabled={[{ dayOfWeek: [0, 6] }, date(14)]}
      hidden={date(15)}
      onDayClick={click}
    />,
  );
  expect(dayButton(14)).toBeDisabled();
  expect(dayButton(17)).toBeDisabled();
  expect(screen.queryByRole("button", { name: /October 15th, 2026/ })).toBeNull();
  expect(screen.getByText("Mo")).toHaveAttribute("aria-label", "Monday");
  await userEvent.click(dayButton(14));
  expect(click).not.toHaveBeenCalled();
  await userEvent.click(dayButton(16));
  expect(click.mock.calls[0]![0]).toEqual(date(16));
});

it("navigates uncontrolled months and leaves a controlled month unchanged until rerender", async () => {
  const change = vi.fn();
  const { rerender } = render(
    <Calendar
      defaultMonth={month}
      onMonthChange={change}
      startMonth={month}
      endMonth={new Date(2026, 10)}
    />,
  );
  expect(screen.getByRole("button", { name: "Go to the Previous Month" })).toBeDisabled();
  await userEvent.click(screen.getByRole("button", { name: "Go to the Next Month" }));
  expect(screen.getByRole("grid", { name: "November 2026" })).toBeInTheDocument();
  expect(change.mock.calls).toEqual([[new Date(2026, 10, 1)]]);
  expect(screen.getByRole("button", { name: "Go to the Next Month" })).toBeDisabled();
  rerender(<Calendar month={month} onMonthChange={change} />);
  await userEvent.click(screen.getByRole("button", { name: "Go to the Next Month" }));
  expect(screen.getByRole("grid", { name: "October 2026" })).toBeInTheDocument();
});

it("keeps real arrow-key focus and selection callbacks through replaceable day parts", async () => {
  const ref = createRef<HTMLButtonElement>();
  const key = vi.fn();
  const select = vi.fn();
  function Day(props: DayButtonProps) {
    return (
      <CalendarDayButton
        {...props}
        ref={props.day.date.getDate() === 12 ? ref : undefined}
        data-custom="day"
      />
    );
  }
  render(
    <Calendar
      mode="single"
      month={month}
      selected={date(12)}
      onSelect={select}
      onDayKeyDown={key}
      components={{ DayButton: Day }}
    />,
  );
  expect(ref.current).toBe(dayButton(12));
  fireEvent.focus(dayButton(12));
  dayButton(12).focus();
  await userEvent.keyboard("{ArrowRight}");
  expect(dayButton(13)).toHaveFocus();
  expect(dayButton(13)).toHaveAttribute("data-custom", "day");
  expect(key.mock.calls[0]![0]).toEqual(date(12));
  await userEvent.keyboard("{Enter}");
  expect(select.mock.calls[0]![0]).toEqual(date(13));
});

it("composes root/footer/caption/nav slots and preserves labels, locale and formatter props", async () => {
  const root = createRef<HTMLDivElement>();
  const nav = createRef<HTMLButtonElement>();
  const click = vi.fn();
  const { container } = render(
    <Calendar
      id="custom-calendar"
      aria-label="Schedule"
      locale={fr}
      defaultMonth={month}
      mode="single"
      labels={{
        labelNext: () => "Next period",
        labelDayButton: (day) => `Choose ${day.getDate()}`,
      }}
      formatters={{ formatCaption: () => "Custom period", formatDay: (day) => `D${day.getDate()}` }}
      components={{
        Root: (props) => <CalendarRoot {...props} ref={root} data-custom="root" />,
        NextMonthButton: (props) => (
          <CalendarNavigationButton
            {...props}
            ref={nav}
            onClick={(event) => {
              click();
              props.onClick?.(event);
            }}
          />
        ),
        Footer: (props) => <aside {...props} data-testid="footer" />,
      }}
      footer="Caller announcement"
    />,
  );
  expect(root.current).toBe(container.querySelector("#custom-calendar"));
  expect(root.current).toHaveAttribute("aria-label", "Schedule");
  expect(root.current).toHaveAttribute("lang", "fr");
  expect(screen.getByText("Custom period")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Choose 12" })).toHaveTextContent("D12");
  expect(screen.getByTestId("footer")).toHaveTextContent("Caller announcement");
  expect(nav.current).toBe(screen.getByRole("button", { name: "Next period" }));
  await userEvent.click(nav.current!);
  expect(click).toHaveBeenCalledOnce();
  expect(screen.getByRole("grid", { name: "novembre 2026" })).toBeInTheDocument();
});

it("preserves native day/nav refs, event props, disabled state and form-safe types", async () => {
  const ref = createRef<HTMLButtonElement>();
  const click = vi.fn();
  const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
  render(
    <form onSubmit={submit}>
      <CalendarNavigationButton ref={ref} onClick={click} title="Custom navigation">
        Move
      </CalendarNavigationButton>
    </form>,
  );
  expect(ref.current).toBe(screen.getByRole("button", { name: "Move" }));
  expect(ref.current).toHaveAttribute("title", "Custom navigation");
  await userEvent.click(ref.current!);
  expect(click).toHaveBeenCalledOnce();
  expect(submit).not.toHaveBeenCalled();
});

it("retains required single selection and restarts an overlong range at its new endpoint", async () => {
  const change = vi.fn();
  const { rerender } = render(
    <Calendar mode="single" required month={month} selected={date(12)} onSelect={change} />,
  );
  await userEvent.click(dayButton(12));
  expect(change.mock.calls[0]![0]).toEqual(date(12));
  expect(dayButton(12).closest("td")).toHaveAttribute("aria-selected", "true");
  rerender(<Calendar mode="range" month={month} min={2} max={5} />);
  await userEvent.click(dayButton(1));
  await userEvent.click(dayButton(7));
  expect(screen.getAllByRole("gridcell", { selected: true })).toHaveLength(1);
  expect(dayButton(7).closest("td")).toHaveAttribute("aria-selected", "true");
  await userEvent.click(dayButton(9));
  expect(screen.getAllByRole("gridcell", { selected: true })).toHaveLength(3);
  expect(dayButton(7)).toHaveAttribute("data-range-start", "true");
  expect(dayButton(9)).toHaveAttribute("data-range-end", "true");
});

it("forwards both root refs and caller classes/styles to their actual hosts", () => {
  const ref = createRef<HTMLDivElement>();
  const animationRef = createRef<HTMLDivElement>();
  const { rerender } = render(<CalendarRoot ref={ref} rootRef={animationRef} title="Root host" />);
  expect(ref.current).toBe(screen.getByTitle("Root host"));
  expect(animationRef.current).toBe(ref.current);
  rerender(
    <Calendar
      mode="single"
      month={month}
      className="caller-root"
      style={{ padding: "1rem" }}
      classNames={{ day_button: "caller-day" }}
      styles={{ day_button: { fontWeight: 700 } }}
      components={{ Root: (props) => <CalendarRoot {...props} ref={ref} /> }}
    />,
  );
  expect(ref.current).toHaveClass("caller-root");
  expect(ref.current!.style.padding).toBe("1rem");
  expect(dayButton(12)).toHaveClass("caller-day");
  expect(dayButton(12)).toHaveStyle({ fontWeight: 700 });
});

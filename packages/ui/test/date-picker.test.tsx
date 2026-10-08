import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { afterEach, expect, expectTypeOf, it, vi } from "vitest";
import { Calendar, type CalendarProps } from "../src/calendar";
import {
  DatePicker,
  DatePickerAnchor,
  DatePickerArrow,
  DatePickerCalendar,
  DatePickerClose,
  DatePickerContent,
  DatePickerDescription,
  DatePickerHeader,
  DatePickerPortal,
  DatePickerTitle,
  DatePickerTrigger,
  type DatePickerCalendarProps,
} from "../src/date-picker";

afterEach(cleanup);
const october = new Date(2026, 9, 1);
const date = (day: number) => new Date(2026, 9, day);
const dayButton = (day: number) =>
  screen.getByRole("button", { name: new RegExp(`October ${day}(?:st|nd|rd|th), 2026`) });

it("retains Calendar's exact discriminated selection modes instead of widening them", () => {
  expectTypeOf<DatePickerCalendarProps>().toEqualTypeOf<CalendarProps>();
  expect(DatePickerCalendar).toBe(Calendar);
  // @ts-expect-error single selection cannot accept multiple dates
  const single: DatePickerCalendarProps = { mode: "single", selected: [date(12)] };
  // @ts-expect-error range selection cannot accept a single date
  const range: DatePickerCalendarProps = { mode: "range", selected: date(12) };
  // @ts-expect-error required single selection must declare selected
  const required: DatePickerCalendarProps = { mode: "single", required: true };
  expect([single.mode, range.mode, required.required]).toEqual(["single", "range", true]);
});

function Single({ onSelect }: { onSelect?: (value: Date | undefined) => void }) {
  return (
    <DatePicker>
      <DatePickerTrigger>Choose day</DatePickerTrigger>
      <DatePickerPortal>
        <DatePickerContent aria-labelledby="day-title" aria-describedby="day-description">
          <DatePickerHeader>
            <DatePickerTitle id="day-title">Schedule day</DatePickerTitle>
            <DatePickerDescription id="day-description">
              The 14th is unavailable.
            </DatePickerDescription>
          </DatePickerHeader>
          <DatePickerCalendar
            mode="single"
            month={october}
            selected={date(12)}
            onSelect={onSelect}
            disabled={date(14)}
            autoFocus
          />
          <DatePickerClose>Cancel day</DatePickerClose>
        </DatePickerContent>
      </DatePickerPortal>
    </DatePicker>
  );
}

it("composes a named portal, selected-day focus, disabled dates and caller-owned selection/close policy", async () => {
  const select = vi.fn();
  const { container } = render(<Single onSelect={select} />);
  const trigger = screen.getByRole("button", { name: "Choose day" });
  await userEvent.click(trigger);
  const panel = await screen.findByRole("dialog", { name: "Schedule day" });
  expect(panel).toHaveAccessibleDescription("The 14th is unavailable.");
  expect(container).not.toContainElement(panel);
  expect(dayButton(12)).toHaveFocus();
  expect(dayButton(14)).toBeDisabled();
  await userEvent.click(dayButton(14));
  expect(select).not.toHaveBeenCalled();
  await userEvent.click(dayButton(17));
  expect(select).toHaveBeenCalledOnce();
  expect(select.mock.calls[0]![0]).toEqual(date(17));
  expect(dayButton(12).closest("td")).toHaveAttribute("aria-selected", "true");
  expect(dayButton(17).closest("td")).not.toHaveAttribute("aria-selected");
  expect(panel).toBeInTheDocument();
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(trigger).toHaveFocus();
});

it("preserves controlled open callbacks and canceled Escape/outside dismissal", async () => {
  const change = vi.fn();
  const escape = vi.fn((event: KeyboardEvent) => event.preventDefault());
  const outside = vi.fn((event: Event) => event.preventDefault());
  function Parts({ open }: { open: boolean }) {
    return (
      <>
        <button>Outside</button>
        <DatePicker open={open} onOpenChange={change}>
          <DatePickerTrigger>Open controlled date</DatePickerTrigger>
          <DatePickerContent
            aria-label="Controlled date"
            onEscapeKeyDown={escape}
            onInteractOutside={outside}
          >
            <DatePickerClose>Close date</DatePickerClose>
          </DatePickerContent>
        </DatePicker>
      </>
    );
  }
  const { rerender } = render(<Parts open={false} />);
  await userEvent.click(screen.getByRole("button", { name: "Open controlled date" }));
  expect(change.mock.calls).toEqual([[true]]);
  expect(screen.queryByRole("dialog")).toBeNull();
  rerender(<Parts open />);
  const panel = await screen.findByRole("dialog", { name: "Controlled date" });
  fireEvent.keyDown(panel, { key: "Escape" });
  await userEvent.click(screen.getByRole("button", { name: "Outside" }));
  expect(escape).toHaveBeenCalledOnce();
  expect(outside).toHaveBeenCalled();
  expect(change.mock.calls).toEqual([[true]]);
  expect(panel).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Close date" }));
  expect(change.mock.calls).toEqual([[true], [false]]);
  expect(panel).toBeInTheDocument();
  rerender(<Parts open={false} />);
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
});

it("dismisses on real outside interaction and preserves its focus", async () => {
  render(
    <>
      <Single />
      <button>Outside action</button>
    </>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Choose day" }));
  await screen.findByRole("dialog", { name: "Schedule day" });
  const outside = screen.getByRole("button", { name: "Outside action" });
  await userEvent.click(outside);
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(outside).toHaveFocus();
});

it("forwards custom hosts, refs, positioning and explicit slots without inventing structure", async () => {
  const trigger = createRef<HTMLButtonElement>();
  const panelRef = createRef<HTMLDivElement>();
  const anchor = createRef<HTMLDivElement>();
  const title = createRef<HTMLHeadingElement>();
  const close = createRef<HTMLButtonElement>();
  const { container } = render(
    <DatePicker>
      <DatePickerAnchor ref={anchor} asChild>
        <div data-testid="anchor">
          <DatePickerTrigger ref={trigger} asChild>
            <button>Custom day</button>
          </DatePickerTrigger>
        </div>
      </DatePickerAnchor>
      <DatePickerContent
        ref={panelRef}
        asChild
        aria-labelledby="custom-title"
        align="end"
        side="right"
        sideOffset={12}
        avoidCollisions={false}
        className="p-3 caller-panel"
      >
        <section>
          <DatePickerTitle ref={title} asChild id="custom-title">
            <h2>Custom calendar</h2>
          </DatePickerTitle>
          <DatePickerClose ref={close} asChild>
            <button>Done</button>
          </DatePickerClose>
          <DatePickerArrow />
        </section>
      </DatePickerContent>
    </DatePicker>,
  );
  expect(anchor.current).toBe(screen.getByTestId("anchor"));
  expect(trigger.current).toBe(screen.getByRole("button", { name: "Custom day" }));
  await userEvent.click(trigger.current!);
  const panel = await screen.findByRole("dialog", { name: "Custom calendar" });
  expect(panelRef.current).toBe(panel);
  expect(panel.tagName).toBe("SECTION");
  expect(container).toContainElement(panel);
  expect(title.current).toBe(screen.getByRole("heading", { level: 2, name: "Custom calendar" }));
  expect(close.current).toBe(screen.getByRole("button", { name: "Done" }));
  expect(panel).toHaveClass("p-3", "caller-panel");
  expect(panel).not.toHaveClass("p-2");
  expect(panel.querySelectorAll("svg")).toHaveLength(1);
  expect(panel.querySelector('[data-slot="calendar"]')).toBeNull();
  await waitFor(() => expect(panel).toHaveAttribute("data-side", "right"));
  expect(panel).toHaveAttribute("data-align", "end");
});

it("allows the caller to complete a range, transport form values, reset and close only when complete", async () => {
  function Range() {
    const [open, setOpen] = useState(false);
    const [range, setRange] = useState<{ from: Date | undefined; to?: Date }>();
    return (
      <form
        onReset={() => {
          setRange(undefined);
          setOpen(false);
        }}
      >
        <DatePicker open={open} onOpenChange={setOpen}>
          <DatePickerTrigger>Choose range</DatePickerTrigger>
          <DatePickerPortal>
            <DatePickerContent aria-label="Date range">
              <DatePickerCalendar
                mode="range"
                month={october}
                min={2}
                selected={range}
                onSelect={(value) => {
                  setRange(value);
                  if (value?.to) setOpen(false);
                }}
              />
              <DatePickerClose>Close range</DatePickerClose>
            </DatePickerContent>
          </DatePickerPortal>
        </DatePicker>
        <input type="hidden" name="from" value={range?.from?.getDate() ?? ""} />
        <input type="hidden" name="to" value={range?.to?.getDate() ?? ""} />
        <output>
          {range?.to ? `${range.from?.getDate()}–${range.to.getDate()}` : "Choose an end"}
        </output>
        <button type="reset">Reset range</button>
      </form>
    );
  }
  const { container } = render(<Range />);
  const trigger = screen.getByRole("button", { name: "Choose range" });
  expect(trigger).toHaveAttribute("type", "button");
  await userEvent.click(trigger);
  await userEvent.click(dayButton(22));
  expect(screen.getByRole("dialog", { name: "Date range" })).toBeInTheDocument();
  expect(new FormData(container.querySelector("form")!).get("from")).toBe("22");
  expect(new FormData(container.querySelector("form")!).get("to")).toBe("");
  await userEvent.click(dayButton(24));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(trigger).toHaveFocus();
  expect(screen.getByText("22–24")).toBeInTheDocument();
  expect([...new FormData(container.querySelector("form")!).entries()]).toEqual([
    ["from", "22"],
    ["to", "24"],
  ]);
  await userEvent.click(screen.getByRole("button", { name: "Reset range" }));
  expect(screen.getByText("Choose an end")).toBeInTheDocument();
  expect([...new FormData(container.querySelector("form")!).entries()]).toEqual([
    ["from", ""],
    ["to", ""],
  ]);
  await userEvent.click(trigger);
  expect(
    within(screen.getByRole("dialog", { name: "Date range" })).queryAllByRole("gridcell", {
      selected: true,
    }),
  ).toHaveLength(0);
});

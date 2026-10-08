import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
} from "@/components/ui/date-picker";

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
// This form transports local calendar days, not timezone-shifted timestamps.
const stamp = (value?: Date) =>
  value
    ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`
    : "";

export default function DatePickerExample() {
  const [day, setDay] = useState<Date | undefined>(date(12));
  const [range, setRange] = useState<{ from: Date | undefined; to?: Date }>();
  const [dayOpen, setDayOpen] = useState(false);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [dialogDay, setDialogDay] = useState<Date | undefined>(date(12));
  const [saved, setSaved] = useState("");
  const [outsideClicks, setOutsideClicks] = useState(0);
  return (
    <div className="flex w-full flex-col items-start gap-4">
      <form
        aria-label="Schedule dates"
        className="flex w-full flex-col items-start gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(
            `Saved day: ${stamp(day) || "none"}; range: ${stamp(range?.from) || "none"} to ${stamp(range?.to) || "none"}`,
          );
        }}
        onReset={() => {
          setDay(undefined);
          setRange(undefined);
          setDayOpen(false);
          setRangeOpen(false);
          setSaved("");
        }}
      >
        <section aria-labelledby="date-picker-single-heading" className="max-w-full">
          <h3 id="date-picker-single-heading" className="mb-2 font-semibold text-foreground">
            Single date
          </h3>
          <DatePicker open={dayOpen} onOpenChange={setDayOpen}>
            <DatePickerTrigger aria-label="Choose date">
              {day ? format(day) : "Choose date"}
            </DatePickerTrigger>
            <DatePickerPortal>
              <DatePickerContent
                aria-labelledby="date-picker-day-title"
                aria-describedby="date-picker-day-description"
              >
                <DatePickerHeader>
                  <DatePickerTitle id="date-picker-day-title">Choose a day</DatePickerTitle>
                  <DatePickerDescription id="date-picker-day-description">
                    The 14th is unavailable.
                  </DatePickerDescription>
                </DatePickerHeader>
                <DatePickerCalendar
                  mode="single"
                  defaultMonth={october}
                  selected={day}
                  onSelect={(value) => {
                    setDay(value);
                    setDayOpen(false);
                  }}
                  disabled={date(14)}
                  autoFocus
                />
                <DatePickerClose>Close date</DatePickerClose>
              </DatePickerContent>
            </DatePickerPortal>
          </DatePicker>
          <input type="hidden" name="day" value={stamp(day)} />
          <output aria-label="Selected date" className="mt-2 block text-sm text-foreground-2">
            {day ? format(day) : "No date selected"}
          </output>
        </section>
        <section aria-labelledby="date-picker-range-heading" className="max-w-full">
          <h3 id="date-picker-range-heading" className="mb-2 font-semibold text-foreground">
            Date range
          </h3>
          <DatePicker open={rangeOpen} onOpenChange={setRangeOpen}>
            <DatePickerTrigger aria-label="Choose range">
              {range?.to ? `${format(range.from!)} – ${format(range.to)}` : "Choose range"}
            </DatePickerTrigger>
            <DatePickerPortal>
              <DatePickerContent
                aria-labelledby="date-picker-range-title"
                aria-describedby="date-picker-range-description"
              >
                <DatePickerHeader>
                  <DatePickerTitle id="date-picker-range-title">Choose date range</DatePickerTitle>
                  <DatePickerDescription id="date-picker-range-description">
                    Two nights minimum. The 18th is unavailable.
                  </DatePickerDescription>
                </DatePickerHeader>
                <DatePickerCalendar
                  mode="range"
                  defaultMonth={october}
                  selected={range}
                  min={2}
                  disabled={date(18)}
                  excludeDisabled
                  onSelect={(value) => {
                    setRange(value);
                    if (value?.to) setRangeOpen(false);
                  }}
                  autoFocus
                  footer={range?.from && !range.to ? "Choose an end day" : "Choose a start day"}
                />
                <DatePickerClose>Close range</DatePickerClose>
              </DatePickerContent>
            </DatePickerPortal>
          </DatePicker>
          <input type="hidden" name="from" value={stamp(range?.from)} />
          <input type="hidden" name="to" value={stamp(range?.to)} />
          <output aria-label="Selected range" className="mt-2 block text-sm text-foreground-2">
            {range?.to ? `${format(range.from!)} – ${format(range.to)}` : "No complete range"}
          </output>
        </section>
        <div className="flex flex-wrap gap-3">
          <Button width="auto" type="submit">
            Save dates
          </Button>
          <Button width="auto" variant="secondary" type="reset">
            Reset dates
          </Button>
          <Button
            width="auto"
            variant="secondary"
            type="button"
            onClick={() => setOutsideClicks((count) => count + 1)}
          >
            Outside action
          </Button>
        </div>
        <output aria-label="Outside clicks" className="text-sm text-foreground-2">
          Outside clicks: {outsideClicks}
        </output>
        <output aria-live="polite" className="text-sm text-foreground-2">
          {saved}
        </output>
      </form>
      <Dialog>
        <DialogTrigger>Open schedule dialog</DialogTrigger>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent>
            <DialogTitle>Schedule details</DialogTitle>
            <DialogDescription>The date picker has its own dismissal scope.</DialogDescription>
            <DatePicker>
              <DatePickerTrigger aria-label="Choose dialog date">
                {dialogDay ? format(dialogDay) : "Choose dialog date"}
              </DatePickerTrigger>
              <DatePickerPortal>
                <DatePickerContent aria-label="Dialog date" onOpenAutoFocus={focusCalendarOnOpen}>
                  <DatePickerCalendar
                    mode="single"
                    defaultMonth={october}
                    selected={dialogDay}
                    onSelect={setDialogDay}
                    autoFocus
                  />
                  <DatePickerClose>Done with date</DatePickerClose>
                </DatePickerContent>
              </DatePickerPortal>
            </DatePicker>
            <output aria-label="Dialog selected date">
              {dialogDay ? format(dialogDay) : "No date"}
            </output>
            <DialogClose>Close schedule dialog</DialogClose>
          </DialogContent>
        </DialogPortal>
      </Dialog>
      <p className="text-sm text-foreground-2">
        DatePicker names are conveniences for composing Calendar and Popover. shadcn supplies a
        recipe, not a separate DatePicker root. Selection, formatting, closing, hidden form values
        and reset belong to this caller. Closing keeps selected dates; reset clears them. In a
        parent Dialog, this caller chooses the initial day through the cancelable onOpenAutoFocus
        callback after the nested focus scope is ready.
      </p>
      <p className="text-sm text-foreground-2">
        The default panel grants the standard 328px Calendar its complete frame. Extra months, week
        numbers and replacement parts may need more space. Text date editing, parsing and time
        selection are outside this recipe.
      </p>
    </div>
  );
}

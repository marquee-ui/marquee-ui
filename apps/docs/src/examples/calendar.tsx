import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

const october = new Date(2026, 9, 1);
const date = (day: number) => new Date(2026, 9, day);

export default function CalendarExample() {
  const [day, setDay] = useState<Date | undefined>(date(12));
  const [days, setDays] = useState<Date[] | undefined>([date(12)]);
  const [range, setRange] = useState<{ from: Date | undefined; to?: Date } | undefined>({
    from: date(10),
    to: date(15),
  });
  const [month, setMonth] = useState(october);
  const [reset, setReset] = useState(0);
  return (
    <div className="flex w-full flex-col items-start gap-6" key={reset}>
      <section className="max-w-full" aria-labelledby="calendar-single-title">
        <h3 id="calendar-single-title" className="mb-2 font-semibold text-foreground">
          Single day
        </h3>
        <Calendar
          mode="single"
          month={month}
          onMonthChange={setMonth}
          selected={day}
          onSelect={setDay}
          footer={day ? `Selected day: ${day.getDate()}` : "Choose a day"}
        />
      </section>
      <section className="max-w-full" aria-labelledby="calendar-multiple-title">
        <h3 id="calendar-multiple-title" className="mb-2 font-semibold text-foreground">
          Multiple days
        </h3>
        <p className="mb-2 text-sm text-foreground-2">
          Choose up to three days. A fourth begins a new selection.
        </p>
        <Calendar
          mode="multiple"
          defaultMonth={october}
          selected={days}
          onSelect={setDays}
          max={3}
          footer={`Selected days: ${days?.map((day) => day.getDate()).join(", ") || "none"}`}
        />
      </section>
      <section className="max-w-full" aria-labelledby="calendar-range-title">
        <h3 id="calendar-range-title" className="mb-2 font-semibold text-foreground">
          Date range
        </h3>
        <p className="mb-2 text-sm text-foreground-2">
          Two to seven nights. The 18th is unavailable; ranges cannot cross it.
        </p>
        <Calendar
          mode="range"
          defaultMonth={october}
          numberOfMonths={2}
          selected={range}
          onSelect={setRange}
          min={2}
          max={7}
          resetOnSelect
          disabled={date(18)}
          excludeDisabled
          footer={
            range?.to
              ? `Selected range: ${range.from?.getDate()}–${range.to.getDate()}`
              : "Choose an end day"
          }
        />
      </section>
      <Button
        type="button"
        onClick={() => {
          setDay(undefined);
          setDays([]);
          setRange(undefined);
          setMonth(october);
          setReset((value) => value + 1);
        }}
      >
        Reset dates
      </Button>
      <p className="text-sm text-foreground-2">
        Selection, reset and announcements belong to this example. Calendar is inline; popup
        DatePicker and form date transport are separate compositions.
      </p>
    </div>
  );
}

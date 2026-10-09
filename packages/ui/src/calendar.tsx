"use client";

import { useEffect, useImperativeHandle, useRef, type ComponentProps, type Ref } from "react";
import {
  DayPicker,
  type DayPickerProps,
  type DayButtonProps,
  type RootProps,
} from "@daypicker/react";
import { cn } from "@/lib/utils";

/** Keep the primitive's single/multiple/range union, including required selection. */
export type CalendarProps = DayPickerProps;
export type CalendarDayButtonProps = DayButtonProps & { ref?: Ref<HTMLButtonElement> };
export type CalendarRootProps = RootProps & { ref?: Ref<HTMLDivElement> };

/** A replaceable root slot. Both the caller ref and DayPicker animation ref reach the host. */
export function CalendarRoot({ rootRef, ref, ...props }: CalendarRootProps) {
  const host = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => host.current!, []);
  useImperativeHandle(rootRef, () => host.current!, []);
  return <div data-slot="calendar" ref={host} {...props} />;
}

/**
 * A real 44px button, with DayPicker's roving focus effect and native event/ref props.
 * Keep gridcell aria-selected upstream; the data modifiers draw that same selection.
 * Consumers replace this slot to compose content, keeping the supplied handlers.
 */
export function CalendarDayButton({
  day: _day,
  modifiers,
  className,
  ref,
  ...props
}: CalendarDayButtonProps) {
  const host = useRef<HTMLButtonElement>(null);
  useImperativeHandle(ref, () => host.current!, []);
  useEffect(() => {
    if (modifiers.focused) host.current?.focus();
  }, [modifiers.focused]);
  return (
    <button
      ref={host}
      type="button"
      data-slot="calendar-day-button"
      data-selected={modifiers.selected || undefined}
      data-range-start={modifiers.range_start || undefined}
      data-range-end={modifiers.range_end || undefined}
      data-range-middle={modifiers.range_middle || undefined}
      data-today={modifiers.today || undefined}
      className={cn(
        "relative z-0 inline-flex size-11 min-h-hit min-w-hit items-center justify-center border-2 border-transparent text-sm text-foreground hover:bg-raised focus-visible:z-10 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink disabled:cursor-not-allowed disabled:text-foreground-faint aria-disabled:cursor-not-allowed aria-disabled:text-foreground-faint data-today:border-border-strong data-selected:bg-primary-muted data-selected:text-foreground data-selected:not-data-range-middle:border-primary-ink forced-colors:data-selected:border-foreground forced-colors:data-selected:underline",
        className,
      )}
      {...props}
    />
  );
}

/** Shared styled slot for PreviousMonthButton and NextMonthButton. */
export function CalendarNavigationButton({
  className,
  type,
  disabled,
  "aria-disabled": ariaDisabled,
  ...props
}: ComponentProps<"button">) {
  return (
    <button
      data-slot="calendar-navigation-button"
      type={type ?? "button"}
      aria-disabled={ariaDisabled}
      disabled={disabled || ariaDisabled === true || ariaDisabled === "true"}
      className={cn(
        "inline-flex size-11 min-h-hit min-w-hit items-center justify-center border-2 border-border-strong bg-raised text-foreground hover:bg-surface focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink disabled:cursor-not-allowed disabled:text-foreground-faint",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Inline Gregorian calendar. Selection/month state and footer announcements are caller owned.
 * Every DayPicker component is replaceable via `components`; `classNames` can replace individual
 * presentation rules. No upstream stylesheet is imported. The default seven 44px columns need
 * 328px including this frame's padding/border. Callers must grant that inline space; week numbers
 * or replacement parts can need more. Preserve the intrinsic minimum instead of shrinking the
 * painted frame around an overflowing grid. Extra months wrap as complete grids.
 */
export function Calendar({ className, classNames, components, ...props }: CalendarProps) {
  return (
    <DayPicker
      className={cn(
        "w-fit min-w-min max-w-full border-2 border-border-strong bg-surface p-2 text-foreground",
        className,
      )}
      classNames={{
        root: "",
        months: "relative flex flex-wrap items-start gap-4",
        month: "relative w-fit max-w-full",
        nav: "absolute inset-x-0 top-0 h-11",
        month_caption: "flex min-h-hit items-center justify-center px-11 text-sm font-semibold",
        caption_label: "text-foreground",
        month_grid: "table border-collapse border-spacing-0",
        weekdays: "",
        weekday: "size-11 p-0 text-center text-xs font-normal text-muted",
        weeks: "",
        week: "",
        day: "size-11 p-0 text-center text-sm",
        day_button: "",
        selected: "",
        range_start: "bg-primary-muted",
        range_middle: "bg-primary-muted",
        range_end: "bg-primary-muted",
        today: "",
        outside: "text-muted",
        disabled: "text-foreground-faint",
        hidden: "invisible",
        footer: "mt-3 max-w-full text-sm text-foreground-2",
        chevron: "size-4 fill-current",
        button_previous: "absolute start-0 top-0 z-10",
        button_next: "absolute end-0 top-0 z-10",
        dropdowns: "flex flex-wrap items-center gap-2",
        dropdown_root: "relative",
        dropdown:
          "min-h-hit border-2 border-border-strong bg-raised px-2 text-sm text-foreground focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink",
        week_number: "size-11 p-0 text-xs text-muted",
        week_number_header: "size-11 p-0 text-xs text-muted",
        ...classNames,
      }}
      components={{
        Root: CalendarRoot,
        DayButton: CalendarDayButton,
        PreviousMonthButton: CalendarNavigationButton,
        NextMonthButton: CalendarNavigationButton,
        ...components,
      }}
      {...props}
    />
  );
}

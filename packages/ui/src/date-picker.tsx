import type { ComponentProps } from "react";
import { Calendar, type CalendarProps } from "./calendar";
import {
  Popover,
  PopoverAnchor,
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverPortal,
  PopoverTitle,
  PopoverTrigger,
} from "./popover";
import { cn } from "@/lib/utils";

/**
 * Namespaced conveniences for an explicit Calendar + Popover composition.
 * shadcn's Date Picker is a recipe, not a separate primitive root. These aliases
 * retain the existing parts' props, refs, asChild slots and accessible contracts.
 * Selection, formatting, form values, reset and close-on-selection belong to the
 * caller. Nothing renders a calendar, portal, title or close control implicitly.
 * Initial focus follows Popover. In a parent modal, Calendar's early autoFocus
 * may be intercepted; the caller can choose the roving day in Content's cancelable
 * onOpenAutoFocus callback after the nested focus scope has registered.
 */
export const DatePicker = Popover;
export const DatePickerTrigger = PopoverTrigger;
export const DatePickerPortal = PopoverPortal;
export const DatePickerAnchor = PopoverAnchor;
export const DatePickerArrow = PopoverArrow;
export const DatePickerClose = PopoverClose;
export const DatePickerHeader = PopoverHeader;
export const DatePickerTitle = PopoverTitle;
export const DatePickerDescription = PopoverDescription;
export const DatePickerCalendar = Calendar;
export type DatePickerCalendarProps = CalendarProps;

/**
 * Grant the standard 328px Calendar its full frame: auto width and 8px padding
 * fit one month in a 390px viewport with 16px collision clearance. Week numbers,
 * extra months and replacement parts can need more room; the caller composes it.
 * All positioning, dismissal and focus callbacks remain cancelable and explicit.
 * If no descendant can take focus, Popover focuses this panel. Its inset outline
 * contrasts with the panel's own ground, including over a parent modal's scrim.
 * Caller classes can replace the focus offset or ink just as other panel styles.
 */
export function DatePickerContent({
  className,
  align = "start",
  sideOffset = 8,
  collisionPadding = 16,
  ...props
}: ComponentProps<typeof PopoverContent>) {
  return (
    <PopoverContent
      data-slot="date-picker-content"
      align={align}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      className={cn("w-auto gap-2 p-2 focus-visible:-outline-offset-4", className)}
      {...props}
    />
  );
}

import { Slot } from "@radix-ui/react-slot";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Slotted = { asChild?: boolean };
const focus =
  "focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-ink";

export type TableContainerProps = Omit<ComponentProps<"div">, "aria-label" | "aria-labelledby"> &
  Slotted &
  (
    | { "aria-label": string; "aria-labelledby"?: string }
    | { "aria-label"?: string; "aria-labelledby": string }
  );

/**
 * Explicit scroll boundary; callers supply a meaningful name and decide whether
 * scrolling is needed. Native arrow-key scrolling follows its tab stop. Unlike
 * an implicit wrapper, its ref, label, events and attributes all reach this host.
 * With asChild, keep a scrollable region host and the native table inside it.
 */
export function TableContainer({ className, asChild = false, ...props }: TableContainerProps) {
  const Host = asChild ? Slot : "div";
  return (
    <Host
      data-slot="table-container"
      role="region"
      tabIndex={0}
      className={cn(
        "relative w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain",
        focus,
        className,
      )}
      {...props}
    />
  );
}

/**
 * A native table, with no data or interaction engine and no implicit wrapper.
 * Every asChild slot must still render its corresponding native table element;
 * custom components can forward props/refs to that host. Links and buttons belong
 * inside a cell, never in place of a row or cell. Scope, headers, spans and all
 * state stay with the caller.
 */
export function Table({ className, asChild = false, ...props }: ComponentProps<"table"> & Slotted) {
  const Host = asChild ? Slot : "table";
  return (
    <Host
      data-slot="table"
      className={cn(
        "w-full caption-bottom border-collapse text-sm text-foreground",
        focus,
        className,
      )}
      {...props}
    />
  );
}

export function TableHeader({
  className,
  asChild = false,
  ...props
}: ComponentProps<"thead"> & Slotted) {
  const Host = asChild ? Slot : "thead";
  return (
    <Host data-slot="table-header" className={cn("bg-surface", focus, className)} {...props} />
  );
}

export function TableBody({
  className,
  asChild = false,
  ...props
}: ComponentProps<"tbody"> & Slotted) {
  const Host = asChild ? Slot : "tbody";
  return (
    <Host
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-b-0", focus, className)}
      {...props}
    />
  );
}

export function TableFooter({
  className,
  asChild = false,
  ...props
}: ComponentProps<"tfoot"> & Slotted) {
  const Host = asChild ? Slot : "tfoot";
  return (
    <Host
      data-slot="table-footer"
      className={cn("border-t-2 border-border bg-surface font-semibold", focus, className)}
      {...props}
    />
  );
}

/** Selected paint is only data-state="selected"; this never selects or focuses a row. */
export function TableRow({ className, asChild = false, ...props }: ComponentProps<"tr"> & Slotted) {
  const Host = asChild ? Slot : "tr";
  return (
    <Host
      data-slot="table-row"
      className={cn(
        "border-b-2 border-border data-[state=selected]:bg-primary-muted forced-colors:data-[state=selected]:outline-solid forced-colors:data-[state=selected]:outline-2 forced-colors:data-[state=selected]:-outline-offset-2 forced-colors:data-[state=selected]:outline-foreground",
        focus,
        className,
      )}
      {...props}
    />
  );
}

export function TableHead({
  className,
  asChild = false,
  ...props
}: ComponentProps<"th"> & Slotted) {
  const Host = asChild ? Slot : "th";
  return (
    <Host
      data-slot="table-head"
      className={cn(
        "px-3 py-3 text-left align-middle font-semibold text-foreground",
        focus,
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({
  className,
  asChild = false,
  ...props
}: ComponentProps<"td"> & Slotted) {
  const Host = asChild ? Slot : "td";
  return (
    <Host data-slot="table-cell" className={cn("p-3 align-middle", focus, className)} {...props} />
  );
}

export function TableCaption({
  className,
  asChild = false,
  ...props
}: ComponentProps<"caption"> & Slotted) {
  const Host = asChild ? Slot : "caption";
  return (
    <Host
      data-slot="table-caption"
      className={cn("py-3 text-left text-sm text-foreground-2", focus, className)}
      {...props}
    />
  );
}

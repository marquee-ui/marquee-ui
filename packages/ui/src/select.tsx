"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * One choice, composed over Radix Select. The primitive owns state, keyboard
 * navigation, typeahead, focus and its native form control. All primitive props
 * and refs pass through. Portal, viewport, text, indicators and icons are caller
 * compositions: no content or item wrapper injects them.
 *
 * Value and ItemText deliberately have no styling, as Radix uses their geometry
 * to align the selected item with the trigger. Content preserves Radix's
 * item-aligned default; choose position="popper" for edge alignment and Arrow.
 */
export const Select = SelectPrimitive.Root;
export const SelectPortal = SelectPrimitive.Portal;

export function SelectTrigger({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "flex min-h-hit min-w-hit items-center justify-between gap-3 rounded-md border-2 border-border bg-surface px-3 py-2 text-sm text-foreground transition-colors data-[placeholder]:text-muted focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:shadow-focus-ring disabled:cursor-not-allowed disabled:text-foreground-faint",
        className,
      )}
      {...props}
    />
  );
}

export function SelectValue(props: ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

export function SelectIcon({ className, ...props }: ComponentProps<typeof SelectPrimitive.Icon>) {
  return (
    <SelectPrimitive.Icon
      data-slot="select-icon"
      className={cn("shrink-0 text-muted", className)}
      {...props}
    />
  );
}

export function SelectContent({
  className,
  position,
  ...props
}: ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Content
      data-slot="select-content"
      position={position}
      className={cn(
        "relative z-50 max-h-96 min-w-32 overflow-hidden rounded-md border-2 border-border bg-overlay text-foreground shadow-lg",
        position === "popper" &&
          "max-h-[var(--radix-select-content-available-height)] max-w-[var(--radix-select-content-available-width)] min-w-[var(--radix-select-trigger-width)]",
        className,
      )}
      {...props}
    />
  );
}

export function SelectViewport({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.Viewport>) {
  return (
    <SelectPrimitive.Viewport
      data-slot="select-viewport"
      className={cn("p-1", className)}
      {...props}
    />
  );
}

export function SelectGroup(props: ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

export function SelectLabel({ className, ...props }: ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("px-3 py-2 text-xs font-semibold text-muted", className)}
      {...props}
    />
  );
}

export function SelectItem({ className, ...props }: ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex min-h-hit min-w-hit cursor-default items-center gap-3 rounded-sm px-3 py-2 text-sm outline-none data-[highlighted]:bg-primary-muted data-[highlighted]:text-primary-ink data-[highlighted]:outline-2 data-[highlighted]:-outline-offset-2 data-[highlighted]:outline-primary data-[disabled]:pointer-events-none data-[disabled]:text-foreground-faint",
        className,
      )}
      {...props}
    />
  );
}

export function SelectItemText(props: ComponentProps<typeof SelectPrimitive.ItemText>) {
  return <SelectPrimitive.ItemText data-slot="select-item-text" {...props} />;
}

export function SelectItemIndicator({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.ItemIndicator>) {
  return (
    <SelectPrimitive.ItemIndicator
      data-slot="select-item-indicator"
      className={cn("ml-auto shrink-0 text-primary-ink", className)}
      {...props}
    />
  );
}

export function SelectSeparator({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

const scrollButtonClasses =
  "flex min-h-hit min-w-hit cursor-default items-center justify-center bg-overlay text-muted";

export function SelectScrollUpButton({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(scrollButtonClasses, className)}
      {...props}
    />
  );
}

export function SelectScrollDownButton({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(scrollButtonClasses, className)}
      {...props}
    />
  );
}

export function SelectArrow({ className, ...props }: ComponentProps<typeof SelectPrimitive.Arrow>) {
  return (
    <SelectPrimitive.Arrow
      data-slot="select-arrow"
      className={cn("fill-overlay", className)}
      {...props}
    />
  );
}

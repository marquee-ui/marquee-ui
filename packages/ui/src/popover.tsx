"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Slot } from "@radix-ui/react-slot";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Radix owns state, positioning, focus and cancelable dismissal. Nonmodal by
 * default; opt into modal focus and pointer isolation with modal. Portal, Arrow,
 * Close and accessible labels are explicit caller compositions. Title and
 * Description are presentation slots: associate their IDs on Content yourself.
 * All supported primitive props, refs and asChild hosts pass through.
 */
export const Popover = PopoverPrimitive.Root;
export const PopoverPortal = PopoverPrimitive.Portal;

const controlClasses =
  "inline-flex min-h-hit min-w-hit items-center justify-center rounded-md border-2 border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-border-strong focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink disabled:cursor-not-allowed disabled:text-foreground-faint";

export function PopoverTrigger({
  className,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return (
    <PopoverPrimitive.Trigger
      data-slot="popover-trigger"
      className={cn(controlClasses, className)}
      {...props}
    />
  );
}

export function PopoverAnchor(props: ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export function PopoverContent({
  className,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Content
      data-slot="popover-content"
      className={cn(
        "z-50 grid w-72 max-w-[var(--radix-popover-content-available-width)] max-h-[var(--radix-popover-content-available-height)] gap-4 overflow-y-auto overscroll-contain rounded-lg border-2 border-border bg-overlay p-4 text-foreground shadow-lg focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink",
        className,
      )}
      {...props}
    />
  );
}

export function PopoverClose({
  className,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Close>) {
  return (
    <PopoverPrimitive.Close
      data-slot="popover-close"
      className={cn(controlClasses, className)}
      {...props}
    />
  );
}

export function PopoverArrow({
  className,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Arrow>) {
  return (
    <PopoverPrimitive.Arrow
      data-slot="popover-arrow"
      className={cn("fill-overlay", className)}
      {...props}
    />
  );
}

export function PopoverHeader({
  className,
  asChild = false,
  ...props
}: ComponentProps<"div"> & { asChild?: boolean }) {
  const Host = asChild ? Slot : "div";
  return (
    <Host data-slot="popover-header" className={cn("flex flex-col gap-1", className)} {...props} />
  );
}

export function PopoverTitle({
  className,
  asChild = false,
  ...props
}: ComponentProps<"h3"> & { asChild?: boolean }) {
  const Host = asChild ? Slot : "h3";
  return (
    <Host
      data-slot="popover-title"
      className={cn("font-display text-base text-foreground", className)}
      {...props}
    />
  );
}

export function PopoverDescription({
  className,
  asChild = false,
  ...props
}: ComponentProps<"p"> & { asChild?: boolean }) {
  const Host = asChild ? Slot : "p";
  return (
    <Host
      data-slot="popover-description"
      className={cn("text-sm text-foreground-2", className)}
      {...props}
    />
  );
}

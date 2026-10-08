"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Short supplemental, noninteractive text for a trigger with its own accessible name.
 * Provider owns timing and hoverability; Radix owns state and positioning.
 * Compose Portal and Arrow explicitly. All primitive props and refs pass through.
 * Essential instructions and touch actions must remain understandable without it.
 */
export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipPortal = TooltipPrimitive.Portal;

export function TooltipTrigger({
  className,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      className={cn(
        "inline-flex min-h-hit min-w-hit items-center justify-center rounded-md border-2 border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-border-strong focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink disabled:cursor-not-allowed disabled:text-foreground-faint",
        className,
      )}
      {...props}
    />
  );
}

export function TooltipContent({
  className,
  sideOffset = 8,
  collisionPadding = 8,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Content
      data-slot="tooltip-content"
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      className={cn(
        "z-50 max-w-[min(20rem,var(--radix-tooltip-content-available-width))] break-words rounded-md border-2 border-border bg-overlay px-3 py-2 text-sm text-foreground shadow-md",
        className,
      )}
      {...props}
    />
  );
}

export function TooltipArrow({
  className,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Arrow>) {
  return (
    <TooltipPrimitive.Arrow
      data-slot="tooltip-arrow"
      className={cn("fill-overlay", className)}
      {...props}
    />
  );
}

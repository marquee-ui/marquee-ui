"use client";

import { Slot } from "@radix-ui/react-slot";
import type { ComponentProps } from "react";
import { Legend, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

type Slotted = { asChild?: boolean };
const focus =
  "focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-ink";

/**
 * Presentation only: compose ResponsiveContainer and Recharts primitives inside.
 * The default height gives ResponsiveContainer a measurable first render; keep
 * a positive height/aspect when overriding it. Data, axes, labels, series, state
 * and accessible naming belong to the caller. The actual keyboard chart surface
 * receives its own visible focus ring, including in isolated registry usage.
 * Its point arrows suppress native ancestor scrolling while Recharts continues
 * navigation; caller key handlers run first and keep cancellation/propagation.
 */
export function ChartContainer({
  className,
  asChild = false,
  onKeyDown,
  ...props
}: ComponentProps<"div"> & Slotted) {
  const Host = asChild ? Slot : "div";
  return (
    <Host
      data-slot="chart-container"
      className={cn(
        "h-64 w-full min-w-0 text-sm text-foreground [&_.recharts-surface]:focus-visible:outline-solid [&_.recharts-surface]:focus-visible:outline-2 [&_.recharts-surface]:focus-visible:-outline-offset-2 [&_.recharts-surface]:focus-visible:outline-primary-ink",
        focus,
        className,
      )}
      {...props}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        const target = event.target;
        if (
          !event.defaultPrevented &&
          (event.key === "ArrowLeft" || event.key === "ArrowRight") &&
          target instanceof Element &&
          target.matches('svg.recharts-surface[role="application"]') &&
          target.ownerDocument.activeElement === target &&
          target.closest('[data-slot="chart-container"]') === event.currentTarget
        ) {
          // Recharts already dispatched point navigation. Cancel only the
          // browser's additional scroll of a native ancestor, without stopping
          // renderer or caller propagation or claiming descendant input keys.
          event.preventDefault();
        }
      }}
    />
  );
}

/** Recharts owns interaction. Supply content explicitly; no data/config inference. */
export const ChartTooltip = Tooltip;
export const ChartLegend = Legend;

/**
 * Keep visible point announcements concise. Recharts hides inactive content in
 * its wrapper; modal recipes may keep this host and its text node mounted to
 * preserve native focus transitions.
 */
export function ChartTooltipContent({
  className,
  asChild = false,
  ...props
}: ComponentProps<"div"> & Slotted) {
  const Host = asChild ? Slot : "div";
  return (
    <Host
      data-slot="chart-tooltip-content"
      role="status"
      aria-live="assertive"
      aria-atomic="true"
      className={cn(
        "grid gap-1 rounded-md border-2 border-border bg-overlay px-3 py-2 text-sm text-foreground shadow-md",
        focus,
        className,
      )}
      {...props}
    />
  );
}

/** Explicit list children retain labels independent of color. Slotted hosts stay ul/li. */
export function ChartLegendContent({
  className,
  asChild = false,
  ...props
}: ComponentProps<"ul"> & Slotted) {
  const Host = asChild ? Slot : "ul";
  return (
    <Host
      data-slot="chart-legend-content"
      className={cn(
        "flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-foreground",
        focus,
        className,
      )}
      {...props}
    />
  );
}

export function ChartLegendItem({
  className,
  asChild = false,
  ...props
}: ComponentProps<"li"> & Slotted) {
  const Host = asChild ? Slot : "li";
  return (
    <Host
      data-slot="chart-legend-item"
      className={cn("inline-flex items-center gap-2", focus, className)}
      {...props}
    />
  );
}

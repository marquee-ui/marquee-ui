"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Disclosure, as four parts over Radix Accordion: keyboard navigation, the
 * `aria-expanded`/`aria-controls` wiring and single-or-multiple behaviour come
 * from the primitive.
 *
 * No chevron is drawn. An icon is a dependency and a taste call, and the trigger
 * is a slot: put whatever marker the product uses inside it. The trigger's own
 * `data-state` is what any such marker rotates on.
 */
export const Accordion = AccordionPrimitive.Root;

export function AccordionItem({
  className,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b-2 border-border", className)}
      {...props}
    />
  );
}

export function AccordionTrigger({
  className,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    // The header is required by the primitive's semantics: the trigger has to be
    // the only child of a heading, or the disclosure has no place in the outline.
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "flex min-h-hit w-full items-center justify-between gap-3 py-3 text-left text-sm font-semibold text-foreground transition-colors hover:text-primary-ink focus-visible:outline-none focus-visible:shadow-focus-ring",
          className,
        )}
        {...props}
      />
    </AccordionPrimitive.Header>
  );
}

export function AccordionContent({
  className,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className={cn("overflow-hidden pb-3 text-sm text-foreground-2", className)}
      {...props}
    />
  );
}

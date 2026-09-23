import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * A button that stays pressed: the quiet raised slab at rest, the primary fill
 * and the lift shadow when pressed.
 *
 * ⚠️ THE STATE IS THE CALLER'S, AND THE DRAWING READS IT FROM `aria-pressed`.
 * There is no `pressed` prop and no `cva` state axis, `switch.tsx`'s rule for
 * `aria-checked`: the attribute a screen reader hears is the one the pressed
 * rules select on, so the drawing cannot say "pressed" while the control
 * announces "not pressed". The part writes `aria-pressed="false"` when the
 * caller passes nothing, because a toggle button with no state is announced as
 * a plain button. `"mixed"` draws as not pressed.
 *
 * ⚠️ HOVER IS SCOPED TO THE UNPRESSED STATE, NOT LEFT TO THE CASCADE. A plain
 * `hover:` border and an `aria-pressed:` border apply together on a pressed
 * toggle under the pointer; Tailwind happens to emit the `aria-pressed:` rules
 * after the `hover:` ones today, so the pressed border would win by source
 * order alone. `not-aria-pressed:hover:` never matches a pressed toggle, so
 * there is nothing for the order to decide (`test/toggle-drawing.test.tsx`
 * evaluates all four states).
 *
 * No `asChild`: `aria-pressed` belongs to a button, and a link that stays
 * pressed is a link whose state is the page (`aria-current`). No focus ring of
 * its own, `Button`'s posture: the platform's outline, or the consumer's.
 * Size it with `className` (`size-11`); `min-h-hit min-w-hit` keep a glyph
 * toggle on the 44px floor on both axes.
 */
export const toggleClass =
  "inline-grid min-h-hit min-w-hit place-items-center border-2 border-border-strong bg-raised text-base text-foreground-2 transition-colors not-aria-pressed:hover:border-muted not-aria-pressed:hover:text-foreground aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:shadow-lift disabled:cursor-not-allowed disabled:opacity-50";

export function Toggle({
  className,
  type,
  "aria-pressed": ariaPressed,
  ...props
}: ComponentProps<"button">) {
  return (
    <button
      data-slot="toggle"
      // An untyped button inside a <form> submits it, which a toggle never means.
      type={type ?? "button"}
      aria-pressed={ariaPressed ?? false}
      className={cn(toggleClass, className)}
      {...props}
    />
  );
}

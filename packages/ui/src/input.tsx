import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * The house field: 44px floor, 2px line, the action colour on focus.
 *
 * Focus is the border's COLOUR, and that is the one cue `forced-colors: active`
 * reverts. `focus:outline-hidden` (0.1.9, in place of the bare opt-out) declares
 * the opt-out's own `outline-style: none` in normal colours, so nothing there
 * moves, and under the mode alone a 2px solid outline 2px clear of the border,
 * which the mode draws in its focus colour (measured in Chromium: `docs/as-built.md`,
 * "LIB-0.1.9"). It is `focus:` and not `focus-visible:` because a text field
 * matches `:focus-visible` on every focus, script, keyboard and pointer alike
 * (measured), so the two are one variant here; and the token sits where the
 * opt-out sat, because a consumer whose `cn` only joins serves this string as
 * written. `Textarea` derives this string and inherits the ring. (No utility is
 * named in this comment that the string does not wear: Tailwind compiles every
 * token it finds in a source, comments included.)
 */
export const inputClass =
  "w-full min-h-hit rounded-md border-2 border-border bg-surface px-3 text-base text-foreground placeholder:text-muted focus:border-primary focus:outline-hidden";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input data-slot="input" className={cn(inputClass, className)} {...props} />;
}

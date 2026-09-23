import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { inputClass } from "./input";

/**
 * The house field, multi-line: `Input`'s own string plus the one thing a
 * `<textarea>` needs that an `<input>` does not.
 *
 * ⚠️ `inputClass` ALONE IS NOT A TEXTAREA. It declares no vertical padding,
 * because an `<input>` centres its single line in the 44px box by itself; a
 * `<textarea>` does not centre anything, and Tailwind's preflight resets every
 * element's padding to 0, so the field string on its own puts the first line
 * flush against the top border (measured: `padding-block` undeclared,
 * `padding-top` undeclared, the preflight `padding: 0` the only rule left).
 *
 * The pad is `py-2`, 8px, and not a taste value: an `Input` centres its text
 * at `(44 - 2 * 2 - 16 * 1.55) / 2` = 7.6px below the top border, and 8px is
 * the spacing-grid step nearest it, so a textarea under an input starts its
 * first line where the input's text sits. marquee-ui's
 * `packages/ui/test/textarea-drawing.test.tsx` derives that number from the
 * compiled sheet rather than typing it.
 *
 * It is a STRING built on `inputClass`, not a copy of it, so the field has one
 * definition: whatever `Input`'s focus, border or ground become, this becomes
 * too - including the open question about `Input`'s focus indicator under
 * `forced-colors: active` (`focus:outline-none` with a border-colour ring),
 * which is decided in `input.tsx` for both.
 *
 * Nothing here decides a height: `rows` does, and even one row clears the 44px
 * floor with this pad. ⚠️ Prefer `rows` to a taller `min-h-*` in `className`:
 * this package's `cn` merges a caller's `min-h-*` over the field's `min-h-hit`,
 * but a consumer whose `cn` is a plain JOIN gets both, and the compiled sheet
 * emits `min-h-hit` AFTER the spacing-scale and arbitrary min-heights, so the
 * caller's floor silently loses (measured, DESIGN-LIB-d-disclosure). Preflight
 * already gives every textarea `resize: vertical`, so a `w-full` field cannot be
 * dragged wider than its column.
 */
export const textareaClass = `${inputClass} py-2`;

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea data-slot="textarea" className={cn(textareaClass, className)} {...props} />;
}

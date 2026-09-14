import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * D11: the library's `cn` has MERGE semantics from day one, not a join.
 *
 * Every shadcn-shaped component assumes `cn()` resolves conflicting utilities, so
 * that a caller's `className` beats a variant's. With a plain join both survive on
 * the element and the STYLESHEET's order decides the winner, which is not the
 * caller's.
 *
 * THE THEME LIST IS LOAD-BEARING, and it was measured rather than assumed:
 * tailwind-merge groups a utility by its own knowledge of Tailwind's DEFAULT
 * scales, so a design system's own theme names fall outside every size-ish group
 * and stop merging. `cn("min-h-hit", "min-h-0")` returned BOTH classes before this
 * list existed - the exact bug merge semantics are here to prevent, hiding inside
 * the fix for it. Colour groups are unaffected (they accept any word), which is
 * why the failure is invisible until a size, a shadow or a tracking value is the
 * thing being overridden.
 *
 * `test/merge-theme.test.ts` derives the names from the emitted stylesheet and
 * fails if this list has fallen behind it.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["3xs", "2xs", "reading", "md", "display"],
      leading: ["display-wrap"],
      tracking: ["label", "display"],
      shadow: ["lift", "band", "focus-ring"],
      spacing: ["hit"],
      font: ["display", "body", "mono"],
      container: ["content", "page"],
      ease: ["standard", "emphasis"],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

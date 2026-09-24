import * as SeparatorPrimitive from "@radix-ui/react-separator";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * A rule at the house line weight, in either orientation.
 *
 * MEANINGFUL by default (`role="separator"`), because Radix's `decorative`
 * defaults to false and this part deliberately does not flip it: the accessible
 * answer should be the one a caller gets without reading the props. Pass
 * `decorative` for a rule that is pure ornament, and it leaves the accessibility
 * tree entirely (`role="none"`).
 *
 * ⚠️ THE RULE IS A BORDER, NOT A FILL (0.1.7): a 2px top border on a box of no
 * height, or a 2px left border on a box of no width, in the line colour. Measured
 * in headless Chromium on the compiled sheet, for two reasons. Forced colors turns
 * an author FILL to `Canvas`, so the 0.1.6 rule (a background on a 2px box)
 * vanished on the forced ground in both palettes, where a border's colour reverts
 * to the ink and is drawn. And a border width is in PIXELS where that box's height
 * was in rem, so the rule stays 2px at any root size (the fill grew to 3px at a
 * 24px root). At a 16px root the two are the same pixels. Recolour it with a border
 * colour: a background sits under the border.
 */
export function Separator({
  className,
  orientation = "horizontal",
  ...props
}: ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      orientation={orientation}
      className={cn(
        "shrink-0 border-border data-[orientation=horizontal]:h-0 data-[orientation=horizontal]:w-full data-[orientation=horizontal]:border-t-2 data-[orientation=vertical]:h-full data-[orientation=vertical]:w-0 data-[orientation=vertical]:border-l-2",
        className,
      )}
      {...props}
    />
  );
}

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
        "shrink-0 bg-border data-[orientation=horizontal]:h-0.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-0.5",
        className,
      )}
      {...props}
    />
  );
}

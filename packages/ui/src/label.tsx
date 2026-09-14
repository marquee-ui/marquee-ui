import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Two tones, and the second one is why this part exists.
 *
 * `micro` is the mono micro-caps section label: the one piece of chrome the
 * panels, the save slots and the hubs all wear, moved here as a VARIANT rather
 * than as an eleventh part (D10). It is often wanted on something that is not a
 * form label at all - a section heading, a figure's caption - which is what
 * `asChild` is for: `<Label asChild tone="micro"><span>Last played</span></Label>`
 * keeps the type treatment and drops the `for`/`id` semantics that would be a lie
 * on a heading.
 *
 * `default` is the ink 5 of the consuming app's standalone labels already carry
 * (`text-sm text-text-secondary`, surveyed at the read commit), transliterated -
 * not a new design decision.
 */
export const labelVariants = cva("", {
  variants: {
    tone: {
      default: "text-sm text-foreground-2",
      micro: "font-mono text-3xs uppercase tracking-[0.14em] text-foreground-2",
    },
  },
  defaultVariants: { tone: "default" },
});

export type LabelProps = ComponentProps<typeof LabelPrimitive.Root> &
  VariantProps<typeof labelVariants>;

export function Label({ className, tone, ...props }: LabelProps) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(labelVariants({ tone }), className)}
      {...props}
    />
  );
}

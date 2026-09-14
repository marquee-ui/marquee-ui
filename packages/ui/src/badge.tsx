import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * A status token, not a control: mono micro-caps inside the house's 2px line.
 * Sharp (`rounded-sm`), because the rounded pill is the one shape the Arcade
 * skeleton does not draw.
 *
 * ⚠️ A badge is sized as a LABEL, not as a control: it carries no tap floor,
 * because one that is not interactive should not be 44px tall. If `asChild` makes it
 * a link or a button, the CALLER owes it `min-h-hit` and room to breathe -
 * `tailwind-compile.test.tsx` checks that every interactive element this package
 * renders clears 44px in resolved pixels, and the `AsChildLink` story shows the
 * shape.
 *
 * `tone` is a VISUAL axis and nothing more - it never changes what is inside.
 * Each tone pairs a status ink with its own muted fill, which is the pairing the
 * presets are built to keep legible; `default` sits on `surface` because there is
 * no muted fill for plain ink.
 */
export const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-sm border-2 px-2 py-0.5 font-mono text-2xs font-bold uppercase tracking-label",
  {
    variants: {
      tone: {
        default: "border-border-strong bg-surface text-foreground-2",
        primary: "border-primary bg-primary-muted text-primary-ink",
        destructive: "border-destructive bg-destructive-muted text-destructive",
        success: "border-success bg-success-muted text-success",
      },
    },
    defaultVariants: { tone: "default" },
  },
);

export type BadgeProps = ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean };

export function Badge({ className, tone, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : "span";
  return <Comp data-slot="badge" className={cn(badgeVariants({ tone }), className)} {...props} />;
}

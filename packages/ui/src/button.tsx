import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * The house button. Every string below already shipped on a real product surface
 * and is MOVED here through the role rename table, not redesigned: the tokens
 * change name, the pixels do not (`test/fidelity.test.ts` pins the utility SET of
 * every variant).
 *
 * The control language: sharp corners, the offset block as the only fill, one
 * hard shadow at the bottom-right, and never a rounded chip for the board's
 * primary.
 */

/** The tone-free secondary skeleton: a variant must pick its own ink AND border. */
const secondaryBase =
  "grid min-h-hit w-full place-items-center rounded-md border-2 px-4 text-sm font-semibold hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";

/**
 * `armed` is a compound axis rather than an appended class, and that shape is the
 * point: two same-specificity border-colour utilities on one element are resolved
 * by stylesheet order, so an appended `border-destructive` would lose to
 * `border-border-strong` silently and permanently. The compound SWAPS the token.
 * `cn`'s merge semantics would also resolve it, but a variant table should not
 * depend on the caller's merge function to be correct.
 */
export const buttonVariants = cva("", {
  variants: {
    variant: {
      /** The board's primary: the offset block, lifting INTO its shadow on hover. */
      primary:
        "grid min-h-[46px] w-full place-items-center bg-primary px-4 text-sm font-bold text-primary-foreground shadow-lift transition-[transform,box-shadow] hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_var(--foreground)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-x-0 disabled:hover:translate-y-0 motion-reduce:transition-none",
      /**
       * The second primary, and it is a whole other button rather than just other
       * corners: rounded, 44px, lift-on-hover. Kept because ~10 auth and settings
       * forms ship exactly this, and a zero-pixel move does not restyle them on
       * the way past.
       */
      primaryRounded:
        "grid min-h-hit w-full place-items-center rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground shadow-lift hover:bg-primary-hover hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0",
      secondary: `${secondaryBase} border-border-strong text-foreground hover:border-muted`,
      /** Destructive ink always; the border joins once armed. */
      danger: `${secondaryBase} text-destructive hover:border-destructive`,
      /** The quietest affordance that is still a control. Sized to its text. */
      ghost:
        "inline-flex h-11 items-center rounded-md border-2 border-border px-4 text-sm text-foreground-2 transition-colors hover:border-border-strong hover:text-foreground",
    },
    armed: { true: "", false: "" },
  },
  compoundVariants: [
    { variant: "danger", armed: true, class: "border-destructive" },
    { variant: "danger", armed: false, class: "border-border-strong" },
  ],
  defaultVariants: { variant: "primary", armed: false },
});

export type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    /**
     * Render the caller's child instead of a `<button>`, keeping the variant
     * classes and every other prop. This is how a link wears a button: the
     * library owns no router, so `<Button asChild><Link href="…">…</Link></Button>`
     * is a client-routed link everywhere and a plain anchor nowhere.
     */
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  armed,
  asChild = false,
  type,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, armed }), className);
  if (asChild) {
    // No `type` on this branch, deliberately: React's anchor props accept one and
    // `<a type="submit">` is a silent no-op that reads like a working submit.
    return <Slot data-slot="button" className={classes} {...props} />;
  }
  // Default `type="button"`: an untyped button inside a <form> submits it, which
  // is never what a secondary or a danger control means.
  return <button data-slot="button" type={type ?? "button"} className={classes} {...props} />;
}

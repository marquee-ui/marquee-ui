import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * The house surface: a raised panel with the 2px line and the small radius.
 *
 * Parts all the way down (D6), with the padding owned by `Card` so that a header
 * and a footer sit on the same gutter as the content without each re-declaring
 * it. "A card inside an accordion item" is a `Card` inside an `AccordionItem`,
 * and needs no prop on either.
 *
 * `Card` and `CardTitle` take `asChild`, as `Button` does: the caller's element is
 * rendered with the part's slot and classes on it. A card's right element is the
 * consumer's (an `<article>` a reader selects by tag, a `<section>`, an `<li>`), and a
 * title's heading level is the page's (`<CardTitle asChild><h2>`). Neither has the
 * content-model reason `RadioGroupItem` refuses it on. The other four parts do not
 * take it: nothing has asked them for another element.
 *
 * `radius` is a visual axis (0.1.8): `md`, the default, is the small radius every card
 * drew before it; `sharp` draws square corners. An axis rather than an appended
 * `rounded-none`: under a `cn` that only joins, two radius utilities on one element
 * resolve by the STYLESHEET's order, not the order they are written. An appended
 * `rounded-none` happens to sort after `rounded-md` and win (measured, 0.1.8); a radius
 * that sorts before it would lose, so no drawing should stand on that order. The table
 * SWAPS the token out of the base string, as `Button`'s `width` axis does, and the
 * axis's class is appended after it. `radius={null}`, which the type allows as it does
 * on every cva axis, emits no radius at all: square corners, as `sharp` draws them.
 *
 * `edge` is a visual axis (0.1.10), in the same shape for the same reason: `default` is
 * the line every card drew before it (`border-border`); `primary` draws the edge in the
 * action role (`border-primary`), for the one card that has to stand out from the cards
 * beside it. Two border colours on one element resolve by the stylesheet's order under a
 * join, so the table SWAPS `border-border` out of the base string rather than leaving a
 * caller to append over it. `edge={null}` emits no edge colour at all.
 *
 * `gutter` is a visual axis (0.1.10), the same shape again: `md` is the gutter every card
 * drew before it (`p-4`); `sm` is half of it (`p-2`), for a card whose content is
 * fixed-pixel art beside a line of text, where the full gutter takes the text's room at
 * a large root font. Both values are the skeleton's 4px rem grid, so both grow with the
 * root font; a pixel gutter is not offered. `gutter={null}` emits no padding at all.
 *
 * The axes' classes follow the base string in the order the axes are declared: the
 * gutter, then the edge colour, then the radius, LAST as 0.1.8 shipped it. So the
 * default emission is 0.1.9's string with `border-border` alone moved, to before the
 * radius. What each value DRAWS is the consumer's measurement, as the radius's is.
 */
const cardVariants = cva("flex flex-col gap-3 border-2 bg-surface", {
  variants: {
    gutter: { md: "p-4", sm: "p-2" },
    edge: { default: "border-border", primary: "border-primary" },
    radius: { md: "rounded-md", sharp: "rounded-none" },
  },
  defaultVariants: { gutter: "md", edge: "default", radius: "md" },
});

export function Card({
  className,
  gutter,
  edge,
  radius,
  asChild = false,
  ...props
}: ComponentProps<"div"> & VariantProps<typeof cardVariants> & { asChild?: boolean }) {
  const Host = asChild ? Slot : "div";
  return (
    <Host
      data-slot="card"
      className={cn(cardVariants({ gutter, edge, radius }), className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div data-slot="card-header" className={cn("flex flex-col gap-1", className)} {...props} />
  );
}

export function CardTitle({
  className,
  asChild = false,
  ...props
}: ComponentProps<"h3"> & { asChild?: boolean }) {
  const Host = asChild ? Slot : "h3";
  return (
    <Host
      data-slot="card-title"
      className={cn("font-display text-lg text-foreground", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-sm text-foreground-2", className)}
      {...props}
    />
  );
}

/** No class of its own: `Card` owns the gutter, this names the slot. */
export function CardContent({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn(className)} {...props} />;
}

export function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div data-slot="card-footer" className={cn("flex items-center gap-3", className)} {...props} />
  );
}

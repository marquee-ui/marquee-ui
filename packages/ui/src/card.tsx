import { Slot } from "@radix-ui/react-slot";
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
 */
export function Card({
  className,
  asChild = false,
  ...props
}: ComponentProps<"div"> & { asChild?: boolean }) {
  const Host = asChild ? Slot : "div";
  return (
    <Host
      data-slot="card"
      className={cn(
        "flex flex-col gap-3 rounded-md border-2 border-border bg-surface p-4",
        className,
      )}
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

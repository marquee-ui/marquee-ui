import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * The house surface: a raised panel with the 2px line and the small radius.
 *
 * Parts all the way down (D6), with the padding owned by `Card` so that a header
 * and a footer sit on the same gutter as the content without each re-declaring
 * it. "A card inside an accordion item" is a `Card` inside an `AccordionItem`,
 * and needs no prop on either.
 */
export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
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

export function CardTitle({ className, ...props }: ComponentProps<"h3">) {
  return (
    <h3
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

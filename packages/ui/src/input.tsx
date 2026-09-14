import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** The house field: 44px floor, 2px line, the action colour on focus. */
export const inputClass =
  "w-full min-h-hit rounded-md border-2 border-border bg-surface px-3 text-base text-foreground placeholder:text-muted focus:border-primary focus:outline-none";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input data-slot="input" className={cn(inputClass, className)} {...props} />;
}

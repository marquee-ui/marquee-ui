"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Radix owns state, roving focus and tab/panel association; children are slots. */
export function Tabs({ className, ...props }: ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex min-w-0 flex-col gap-3 data-[orientation=vertical]:flex-row", className)}
      {...props}
    />
  );
}

const listVariants = cva(
  "group/tabs-list inline-flex min-h-hit w-fit shrink-0 items-center gap-1 data-[orientation=vertical]:h-fit data-[orientation=vertical]:flex-col",
  {
    variants: {
      variant: {
        default: "rounded-md border-2 border-border bg-sunken p-1",
        line: "border-b-2 border-border data-[orientation=vertical]:border-r-2 data-[orientation=vertical]:border-b-0",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function TabsList({
  className,
  variant = "default",
  ...props
}: ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof listVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(listVariants({ variant }), className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex min-h-hit min-w-11 shrink-0 items-center justify-center gap-2 rounded-sm border-b-2 border-transparent px-3 py-2 text-sm font-semibold text-foreground-2 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink focus-visible:shadow-focus-ring disabled:pointer-events-none disabled:text-foreground-faint data-[orientation=vertical]:w-full data-[state=active]:bg-raised data-[state=active]:text-foreground data-[state=active]:shadow-sm forced-colors:data-[state=active]:outline-2 group-data-[variant=line]/tabs-list:rounded-none group-data-[variant=line]/tabs-list:data-[state=active]:border-primary-ink group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:text-primary-ink group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none forced-colors:group-data-[variant=line]/tabs-list:data-[state=active]:outline-2 group-data-[variant=line]/tabs-list:data-[orientation=vertical]:border-r-2 group-data-[variant=line]/tabs-list:data-[orientation=vertical]:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "min-w-0 flex-1 text-sm text-foreground-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink focus-visible:shadow-focus-ring",
        className,
      )}
      {...props}
    />
  );
}

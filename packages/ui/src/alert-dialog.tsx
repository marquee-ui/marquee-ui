"use client";

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Radix owns confirmation semantics, state and focus. Every structural part is explicit. */
export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogPortal = AlertDialogPrimitive.Portal;

const controlClasses =
  "inline-flex min-h-hit min-w-hit items-center justify-center gap-2 rounded-md border-2 px-4 py-2 text-sm font-semibold focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink focus-visible:shadow-focus-ring disabled:cursor-not-allowed disabled:opacity-50";
const quietClasses = "border-border-strong bg-surface text-foreground hover:bg-raised";

export function AlertDialogTrigger({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger
      data-slot="alert-dialog-trigger"
      className={cn(controlClasses, quietClasses, className)}
      {...props}
    />
  );
}

export function AlertDialogOverlay({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn("fixed inset-0 z-50 bg-scrim backdrop-blur-sm", className)}
      {...props}
    />
  );
}

/** Centered, bounded and scrollable. Supply Portal, Overlay, title and actions yourself. */
export function AlertDialogContent({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPrimitive.Content
      data-slot="alert-dialog-content"
      className={cn(
        "fixed left-1/2 top-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto overscroll-contain rounded-lg border-2 border-border bg-overlay p-4 text-foreground shadow-lg focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

type LayoutProps = ComponentProps<"div"> & { asChild?: boolean };

export function AlertDialogHeader({ className, asChild = false, ...props }: LayoutProps) {
  const Host = asChild ? Slot : "div";
  return (
    <Host
      data-slot="alert-dialog-header"
      className={cn("flex min-w-0 flex-col gap-2", className)}
      {...props}
    />
  );
}

export function AlertDialogFooter({ className, asChild = false, ...props }: LayoutProps) {
  const Host = asChild ? Slot : "div";
  return (
    <Host
      data-slot="alert-dialog-footer"
      className={cn("flex flex-col gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

export function AlertDialogTitle({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("font-display text-lg text-foreground", className)}
      {...props}
    />
  );
}

export function AlertDialogDescription({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-sm text-foreground-2", className)}
      {...props}
    />
  );
}

const actionVariants = cva(controlClasses, {
  variants: {
    variant: {
      primary: "border-primary bg-primary text-primary-foreground hover:bg-primary-hover",
      destructive: "border-destructive bg-surface text-destructive hover:bg-destructive-muted",
    },
  },
  defaultVariants: { variant: "primary" },
});

export function AlertDialogAction({
  className,
  variant,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Action> & VariantProps<typeof actionVariants>) {
  return (
    <AlertDialogPrimitive.Action
      data-slot="alert-dialog-action"
      className={cn(actionVariants({ variant }), className)}
      {...props}
    />
  );
}

export function AlertDialogCancel({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <AlertDialogPrimitive.Cancel
      data-slot="alert-dialog-cancel"
      className={cn(controlClasses, quietClasses, className)}
      {...props}
    />
  );
}

"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Slot } from "@radix-ui/react-slot";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * A centered dialog at every width. Radix owns state, modality, focus and
 * cancelable dismissal. Portal, Overlay and Close are explicit compositions;
 * Content never injects another part. All primitive props and refs pass through.
 * The panel owns bounded scrolling; Header and Footer are optional layout slots.
 */
export const Dialog = DialogPrimitive.Root;
export const DialogPortal = DialogPrimitive.Portal;

const controlClasses =
  "inline-flex min-h-hit min-w-hit items-center justify-center rounded-md border-2 border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-border-strong focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink disabled:cursor-not-allowed disabled:text-foreground-faint";

export function DialogTrigger({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Trigger>) {
  return (
    <DialogPrimitive.Trigger
      data-slot="dialog-trigger"
      className={cn(controlClasses, className)}
      {...props}
    />
  );
}

export function DialogClose({ className, ...props }: ComponentProps<typeof DialogPrimitive.Close>) {
  return (
    <DialogPrimitive.Close
      data-slot="dialog-close"
      className={cn(controlClasses, className)}
      {...props}
    />
  );
}

export function DialogOverlay({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn("fixed inset-0 z-50 bg-scrim backdrop-blur-sm", className)}
      {...props}
    />
  );
}

export function DialogContent({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Content
      data-slot="dialog-content"
      className={cn(
        "fixed left-1/2 top-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto overscroll-contain rounded-lg border-2 border-border bg-overlay p-6 text-foreground shadow-lg focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink",
        className,
      )}
      {...props}
    />
  );
}

export function DialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("font-display text-lg text-foreground", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-foreground-2", className)}
      {...props}
    />
  );
}

export function DialogHeader({
  className,
  asChild = false,
  ...props
}: ComponentProps<"div"> & { asChild?: boolean }) {
  const Host = asChild ? Slot : "div";
  return (
    <Host data-slot="dialog-header" className={cn("flex flex-col gap-1", className)} {...props} />
  );
}

export function DialogFooter({
  className,
  asChild = false,
  ...props
}: ComponentProps<"div"> & { asChild?: boolean }) {
  const Host = asChild ? Slot : "div";
  return (
    <Host
      data-slot="dialog-footer"
      className={cn("flex flex-wrap items-center justify-end gap-3", className)}
      {...props}
    />
  );
}

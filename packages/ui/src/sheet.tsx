"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * A bottom sheet on mobile, a centred dialog from 768 up, built on Radix Dialog:
 * focus trap, Esc-to-close, scrim click-out and scroll lock come for free.
 *
 * PARTS, not props (D6). The three things the monolith this was moved from
 * carried as flags are compositions here, and each one gets better for it:
 *
 * - `hideTitle` is `<SheetTitle className="sr-only">`.
 * - `childScrolls` is simply not using `<SheetBody>`.
 * - `role="alertdialog"` is a prop on `<SheetContent>` - and the bug it used to
 *   carry cannot come back. Radix spreads the caller's props AFTER its own
 *   `role="dialog"`, so a monolith with an optional `role` prop passes
 *   `role: undefined` on EVERY sheet and deletes the dialog role outright; that
 *   needed a conditional spread to fix. A part only ever spreads what the caller
 *   actually wrote.
 *
 * What stays OWNED here is the scroll region, because it is the one thing every
 * consumer was previously expected to remember and only one ever did: the panel
 * is capped at 85dvh, so anything taller has to scroll somewhere, and it used to
 * scroll nowhere.
 */

export const Sheet = Dialog.Root;
export const SheetPortal = Dialog.Portal;
export const SheetClose = Dialog.Close;

export function SheetTrigger(props: ComponentProps<typeof Dialog.Trigger>) {
  return <Dialog.Trigger data-slot="sheet-trigger" {...props} />;
}

export function SheetOverlay({ className, ...props }: ComponentProps<typeof Dialog.Overlay>) {
  return (
    <Dialog.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-scrim backdrop-blur-sm data-[state=closed]:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The grab handle is drawn here rather than exposed as a part: it is the sheet's
 * own swipe affordance, not content, and a sheet that forgot it would look like a
 * dialog that had escaped onto the bottom edge. `aria-hidden`, because it says
 * nothing a screen reader cannot already do.
 */
export function SheetContent({
  className,
  children,
  ...props
}: ComponentProps<typeof Dialog.Content>) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <Dialog.Content
        data-slot="sheet-content"
        className={cn(
          "fixed z-50 flex max-h-[85dvh] flex-col gap-3 bg-overlay p-4 shadow-lg focus:outline-none inset-x-0 bottom-0 w-full rounded-t-lg border-t-2 border-border pb-[max(1rem,var(--safe-bottom,0px))] md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:w-[min(92vw,28rem)] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-lg md:border-2 md:pb-4",
          className,
        )}
        {...props}
      >
        <div
          aria-hidden="true"
          data-slot="sheet-handle"
          className="mx-auto h-1 w-10 shrink-0 rounded-full bg-border-strong md:hidden"
        />
        {children}
      </Dialog.Content>
    </SheetPortal>
  );
}

export function SheetTitle({ className, ...props }: ComponentProps<typeof Dialog.Title>) {
  return (
    <Dialog.Title
      data-slot="sheet-title"
      className={cn("font-display text-lg text-foreground", className)}
      {...props}
    />
  );
}

export function SheetDescription({
  className,
  ...props
}: ComponentProps<typeof Dialog.Description>) {
  return (
    <Dialog.Description
      data-slot="sheet-description"
      className={cn("text-sm text-foreground-2", className)}
      {...props}
    />
  );
}

/**
 * The sheet's scroll region. `min-h-0` is load-bearing and not decoration: a flex
 * child defaults to `min-height: auto` and so refuses to shrink below its
 * content, which would push the region past the 85dvh cap instead of scrolling
 * inside it. The negative margin lets the scrollbar and the focus rings use the
 * sheet's full width while the content keeps its padding.
 *
 * Leave it out for a child that manages its own scrolling and parks chrome
 * underneath it; wrapping such a child nests two scrollbars and lets its primary
 * action drift out of the thumb arc.
 */
export function SheetBody({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-body"
      className={cn(
        "-mx-4 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-4",
        className,
      )}
      {...props}
    />
  );
}

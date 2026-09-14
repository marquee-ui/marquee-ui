"use client";

import { createContext, useContext, useEffect, type ComponentProps, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/**
 * One transient toast. The owner holds the state; this renders it, auto-dismisses
 * after 6s (long enough to read and to reach an Undo), and announces politely.
 * There is deliberately no queue: a newer toast replaces the old one.
 *
 * PORTALLED TO THE BODY, and it has to be. `position: fixed` is only relative to
 * the viewport while no ancestor clips or re-anchors it, and a `clip-path` (the
 * house's cut corner) leaves a fixed descendant's bounding box ALONE while
 * removing it from paint and hit-testing - so a toast inside one measures as
 * "visible, enabled and stable" to every instrument while its action cannot be
 * clicked at all.
 *
 * The stack is a single body-level element, created on first use, so that two
 * independent owners do not land two `fixed` strips on exactly the same offset.
 * Zero-height while empty, so it never blocks a tap.
 *
 * REPLACING the message while the toast is open: give `<Toast>` a `key` that
 * changes with the message. The auto-dismiss timer is an effect, and a new key
 * remounts it; without one, a second message inherits the first one's remaining
 * time.
 */

const STACK_ID = "toast-stack";
const DEFAULT_DURATION_MS = 6000;

const ToastContext = createContext<{ dismiss: () => void } | null>(null);

function toastStack(): HTMLElement {
  const existing = document.getElementById(STACK_ID);
  if (existing) return existing;
  const stack = document.createElement("div");
  stack.id = STACK_ID;
  stack.className =
    "pointer-events-none fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-md flex-col gap-2 md:bottom-8";
  document.body.append(stack);
  return stack;
}

export type ToastProps = {
  open: boolean;
  onDismiss: () => void;
  /** Milliseconds before it dismisses itself. */
  duration?: number;
  className?: string;
  children?: ReactNode;
};

export function Toast({
  open,
  onDismiss,
  duration = DEFAULT_DURATION_MS,
  className,
  children,
}: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [open, duration, onDismiss]);

  // `document` is absent while a client component is server-rendered; a toast only
  // ever exists after a user action, so this never costs a real one.
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <ToastContext.Provider value={{ dismiss: onDismiss }}>
      <div
        data-slot="toast"
        role="status"
        className={cn(
          "pointer-events-auto flex items-center justify-between gap-3 border-2 border-border-strong bg-overlay px-4 py-2 text-sm text-foreground shadow-lift",
          className,
        )}
      >
        {children}
      </div>
    </ToastContext.Provider>,
    toastStack(),
  );
}

export function ToastMessage({ className, ...props }: ComponentProps<"span">) {
  return <span data-slot="toast-message" className={cn(className)} {...props} />;
}

/**
 * The optional action, at the 44px floor. Pressing it also dismisses the toast:
 * the owner never has to, and a toast whose action left it on screen would be
 * asking to be pressed twice.
 */
export function ToastAction({ className, onClick, type, ...props }: ComponentProps<"button">) {
  const context = useContext(ToastContext);
  if (context === null) {
    throw new Error("<ToastAction> must be rendered inside a <Toast>.");
  }
  return (
    <button
      data-slot="toast-action"
      type={type ?? "button"}
      className={cn(
        "min-h-11 shrink-0 px-2 font-mono text-xs font-bold uppercase tracking-widest text-primary-ink",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        context.dismiss();
      }}
      {...props}
    />
  );
}

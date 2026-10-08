"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Action menus over Radix. Root owns controlled/uncontrolled state and defaults
 * to modal focus/pointer isolation. Use modal={false} for nonmodal interaction.
 * Portal, indicators, arrows and submenu contents are explicit compositions;
 * wrappers inject no structure. Every supported primitive prop, ref and asChild
 * host passes through. For a form value use Select rather than an action menu.
 */
export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
export const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const contentClasses =
  "z-50 min-w-[min(12rem,var(--radix-dropdown-menu-content-available-width))] max-w-[var(--radix-dropdown-menu-content-available-width)] max-h-[var(--radix-dropdown-menu-content-available-height)] overflow-y-auto overscroll-contain rounded-md border-2 border-border bg-overlay p-1 text-foreground shadow-lg focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink";
const itemClasses =
  "relative flex min-h-hit min-w-hit cursor-default select-none items-center gap-3 rounded-sm px-3 py-2 text-sm outline-none data-[highlighted]:bg-primary-muted data-[highlighted]:text-primary-ink data-[highlighted]:outline-solid data-[highlighted]:outline-2 data-[highlighted]:-outline-offset-2 data-[highlighted]:outline-primary-ink data-[disabled]:pointer-events-none data-[disabled]:text-foreground-faint";

export function DropdownMenuTrigger({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      className={cn(
        "inline-flex min-h-hit min-w-hit items-center justify-center rounded-md border-2 border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-border-strong focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink disabled:cursor-not-allowed disabled:text-foreground-faint",
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuContent({
  className,
  style,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Content
      style={{ outline: undefined, ...style }}
      data-slot="dropdown-menu-content"
      className={cn(contentClasses, className)}
      {...props}
    />
  );
}

export function DropdownMenuGroup(props: ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

export function DropdownMenuLabel({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Label>) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      className={cn("px-3 py-2 text-xs font-semibold text-muted", className)}
      {...props}
    />
  );
}

export function DropdownMenuItem({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Item>) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      className={cn(itemClasses, className)}
      {...props}
    />
  );
}

export function DropdownMenuCheckboxItem({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(itemClasses, className)}
      {...props}
    />
  );
}

export function DropdownMenuRadioGroup(
  props: ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>,
) {
  return <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

export function DropdownMenuRadioItem({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(itemClasses, className)}
      {...props}
    />
  );
}

export function DropdownMenuItemIndicator({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.ItemIndicator>) {
  return (
    <DropdownMenuPrimitive.ItemIndicator
      data-slot="dropdown-menu-item-indicator"
      className={cn("ml-auto shrink-0 text-primary-ink", className)}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("my-1 h-px border-t border-border", className)}
      {...props}
    />
  );
}

export function DropdownMenuArrow({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Arrow>) {
  return (
    <DropdownMenuPrimitive.Arrow
      data-slot="dropdown-menu-arrow"
      className={cn("fill-overlay", className)}
      {...props}
    />
  );
}

export function DropdownMenuSubTrigger({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.SubTrigger>) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      className={cn(itemClasses, className)}
      {...props}
    />
  );
}

export function DropdownMenuSubContent({
  className,
  style,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      style={{ outline: undefined, ...style }}
      data-slot="dropdown-menu-sub-content"
      className={cn(contentClasses, className)}
      {...props}
    />
  );
}

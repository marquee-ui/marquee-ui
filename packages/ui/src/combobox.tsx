"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Command } from "cmdk";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * A caller-composed single-choice searchable popup. Popover owns open state and
 * dismissal; the plain cmdk root owns search and ACTIVE navigation. Its value /
 * onValueChange are navigation, never committed form state. Commit a choice in
 * Item.onSelect, render it in Trigger and close via caller-controlled open state.
 * Portal, command root, input, list, empty state and indicators are explicit parts.
 * Label the search via Command.label and the results via List.label: cmdk owns
 * those ARIA associations. Popover and Input/Item/Empty/Separator retain asChild;
 * cmdk 1.1.1 root/list/group native asChild hosts are unsupported upstream.
 * Primitive refs and cancelable keyboard/dismissal callbacks pass through.
 */
export const Combobox = PopoverPrimitive.Root;
export const ComboboxPortal = PopoverPrimitive.Portal;

export function ComboboxTrigger({
  className,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return (
    <PopoverPrimitive.Trigger
      data-slot="combobox-trigger"
      className={cn(
        "inline-flex min-h-hit min-w-hit items-center justify-between gap-3 rounded-md border-2 border-border bg-surface px-3 py-2 text-sm text-foreground transition-colors hover:border-border-strong focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink disabled:cursor-not-allowed disabled:text-foreground-faint",
        className,
      )}
      {...props}
    />
  );
}

export function ComboboxContent({
  className,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Content
      data-slot="combobox-content"
      className={cn(
        "z-50 w-72 max-w-[var(--radix-popover-content-available-width)] max-h-[var(--radix-popover-content-available-height)] overflow-y-auto overscroll-contain rounded-lg border-2 border-border bg-overlay p-2 text-foreground shadow-lg focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink",
        className,
      )}
      {...props}
    />
  );
}

export function ComboboxCommand({
  className,
  ...props
}: Omit<ComponentProps<typeof Command>, "asChild">) {
  return (
    <Command
      data-slot="combobox-command"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

export function ComboboxInput({ className, ...props }: ComponentProps<typeof Command.Input>) {
  return (
    <Command.Input
      data-slot="combobox-input"
      className={cn(
        "w-full min-h-hit min-w-hit rounded-md border-2 border-border bg-surface px-3 text-base text-foreground placeholder:text-muted focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink disabled:cursor-not-allowed disabled:text-foreground-faint",
        className,
      )}
      {...props}
    />
  );
}

export function ComboboxList({
  className,
  ...props
}: Omit<ComponentProps<typeof Command.List>, "asChild">) {
  return (
    <Command.List
      data-slot="combobox-list"
      className={cn("max-h-64 overflow-y-auto overscroll-contain p-1", className)}
      {...props}
    />
  );
}

export function ComboboxItem({ className, ...props }: ComponentProps<typeof Command.Item>) {
  return (
    <Command.Item
      data-slot="combobox-item"
      className={cn(
        "flex min-h-hit min-w-hit cursor-pointer items-center justify-between gap-3 rounded-sm px-3 py-2 text-sm text-foreground data-[selected=true]:bg-primary-muted data-[selected=true]:outline-solid data-[selected=true]:outline-2 data-[selected=true]:-outline-offset-2 data-[selected=true]:outline-primary-ink data-[disabled=true]:cursor-not-allowed data-[disabled=true]:text-foreground-faint",
        className,
      )}
      {...props}
    />
  );
}

export function ComboboxGroup({
  className,
  ...props
}: Omit<ComponentProps<typeof Command.Group>, "asChild">) {
  return (
    <Command.Group
      data-slot="combobox-group"
      className={cn(
        "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted",
        className,
      )}
      {...props}
    />
  );
}

export function ComboboxEmpty({ className, ...props }: ComponentProps<typeof Command.Empty>) {
  return (
    <Command.Empty
      data-slot="combobox-empty"
      className={cn("px-3 py-4 text-sm text-muted", className)}
      {...props}
    />
  );
}

export function ComboboxSeparator({
  className,
  ...props
}: ComponentProps<typeof Command.Separator>) {
  return (
    <Command.Separator
      data-slot="combobox-separator"
      className={cn("my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

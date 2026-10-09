"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * A numeric value or range, composed as Root, Track, Range and named Thumbs.
 * Radix owns values, keyboard and pointer input, orientation, direction, commits
 * and form association. Every primitive prop, ref and asChild host passes through.
 * Nothing creates thumbs from the value array: each thumb is the caller's part.
 *
 * Uncontrolled form reset restores the initial value at mount. Controlled reset
 * asks onValueChange for that initial value; the caller must accept the change.
 * Radix 1.5's hidden inputs still serialize disabled named sliders. Omit their
 * names or use a native disabled fieldset when disabled values must be excluded;
 * this wrapper adds no form API.
 */
export function Slider({ className, ...props }: ComponentProps<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn(
        "relative flex min-h-hit w-full touch-none select-none items-center data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[orientation=vertical]:h-48 data-[orientation=vertical]:min-w-hit data-[orientation=vertical]:w-11 data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    />
  );
}

export function SliderTrack({ className, ...props }: ComponentProps<typeof SliderPrimitive.Track>) {
  return (
    <SliderPrimitive.Track
      data-slot="slider-track"
      className={cn(
        "relative h-1.5 w-full grow rounded-full bg-border data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5 forced-colors:border forced-colors:border-current",
        className,
      )}
      {...props}
    />
  );
}

export function SliderRange({ className, ...props }: ComponentProps<typeof SliderPrimitive.Range>) {
  return (
    <SliderPrimitive.Range
      data-slot="slider-range"
      className={cn(
        "absolute h-full rounded-full bg-primary-ink data-[orientation=vertical]:h-auto data-[orientation=vertical]:w-full forced-colors:border-2 forced-colors:border-current",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The actual focusable, draggable host is 44px on both axes. Its smaller visible
 * marker is a noninteractive pseudo-element, so the track stays narrow and the
 * whole thumb accepts the pointer. The outline belongs to that real target and
 * survives forced colors; the marker and range retain system-color borders.
 */
export function SliderThumb({ className, ...props }: ComponentProps<typeof SliderPrimitive.Thumb>) {
  return (
    <SliderPrimitive.Thumb
      data-slot="slider-thumb"
      className={cn(
        "relative block size-11 min-h-hit min-w-hit cursor-grab text-foreground active:cursor-grabbing focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink data-[disabled]:cursor-not-allowed after:pointer-events-none after:absolute after:left-1/2 after:top-1/2 after:size-5 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:border-2 after:border-primary-ink after:bg-surface forced-colors:after:border-current",
        className,
      )}
      {...props}
    />
  );
}

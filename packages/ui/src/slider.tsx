"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import { useDirection } from "@radix-ui/react-direction";
import { Slot } from "@radix-ui/react-slot";
import { createContext, useContext, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

const SliderDirection = createContext(1);

/**
 * A numeric value or range, composed as Root, Track, Range and named Thumbs.
 * Radix owns values, keyboard and pointer input, orientation, direction, commits
 * and form association. Every primitive prop, ref and asChild host passes through.
 * Nothing creates thumbs from the value array: each thumb is the caller's part.
 * End margins reserve room for the 44px targets centered on the track endpoints.
 *
 * Uncontrolled form reset restores the initial value at mount. Controlled reset
 * asks onValueChange for that initial value; the caller must accept the change.
 * Radix 1.5's hidden inputs still serialize disabled named sliders. Omit their
 * names or use a native disabled fieldset when disabled values must be excluded;
 * this wrapper adds no form API.
 */
export function Slider({
  className,
  dir,
  orientation = "horizontal",
  inverted = false,
  ...props
}: ComponentProps<typeof SliderPrimitive.Root>) {
  const direction = useDirection(dir);
  const forward = orientation === "vertical" ? inverted : (direction === "ltr") !== inverted;
  return (
    <SliderDirection.Provider value={forward ? 1 : -1}>
      <SliderPrimitive.Root
        dir={direction}
        orientation={orientation}
        inverted={inverted}
        data-slot="slider"
        className={cn(
          "relative mx-[calc(var(--hit-min)/2)] flex min-h-hit w-[calc(100%-var(--hit-min))] touch-none select-none items-center data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[orientation=vertical]:mx-0 data-[orientation=vertical]:my-[calc(var(--hit-min)/2)] data-[orientation=vertical]:h-48 data-[orientation=vertical]:min-w-hit data-[orientation=vertical]:w-11 data-[orientation=vertical]:flex-col",
          className,
        )}
        {...props}
      />
    </SliderDirection.Provider>
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
export function SliderThumb({
  className,
  asChild,
  children,
  ...props
}: ComponentProps<typeof SliderPrimitive.Thumb>) {
  return (
    <SliderPrimitive.Thumb {...props} asChild>
      <SliderThumbTarget
        asChild={asChild}
        data-slot="slider-thumb"
        className={cn(
          "relative block size-11 min-h-hit min-w-hit cursor-grab text-foreground active:cursor-grabbing focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink data-[disabled]:cursor-not-allowed after:pointer-events-none after:absolute after:left-1/2 after:top-1/2 after:size-5 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:border-2 after:border-primary-ink after:bg-surface forced-colors:after:border-current",
          className,
        )}
      >
        {children}
      </SliderThumbTarget>
    </SliderPrimitive.Thumb>
  );
}

/**
 * Radix insets thumbs by half their measured target size at the endpoints.
 * Cancel that inset on the host, keeping its marker centered on the same value
 * as the range and pointer coordinate. A percentage also handles resized hosts.
 * The slotted host receives live values from Radix without duplicating its state.
 */
function SliderThumbTarget({
  asChild,
  style,
  ...props
}: ComponentProps<"span"> & { asChild?: boolean }) {
  const direction = useContext(SliderDirection);
  const min = props["aria-valuemin"] ?? 0;
  const max = props["aria-valuemax"] ?? 100;
  const value = props["aria-valuenow"] ?? min;
  const percent = max === min ? 0 : Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const offset = (percent - 50) * direction;
  const Component = asChild ? Slot : "span";
  return (
    <Component
      {...props}
      style={{
        translate: props["aria-orientation"] === "vertical" ? `0 ${offset}%` : `${offset}% 0`,
        ...style,
      }}
    />
  );
}

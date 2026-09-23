import { Slot } from "@radix-ui/react-slot";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * A boolean control as parts: a hit area, a track and a thumb.
 *
 * ⚠️ THE STATE IS THE PLATFORM'S. This package holds none: the drawing reads
 * `aria-checked` on the root, or a `:checked` descendant of it, so a track can
 * never disagree with what a screen reader is told. That is why there is no
 * `checked` prop and no `cva` state axis - a state variant would be a second
 * source of truth, and the one that can be wrong.
 *
 * TWO HOSTS, ONE DRAWING, and both triggers ride the SAME root:
 *
 *   `<Switch aria-checked={on} onClick={…}>`  - the default `button[role=switch]`,
 *     whose `aria-checked` is both the accessibility contract and the trigger;
 *   `<Switch asChild><label>…<SwitchInput/>…</label></Switch>` - a native
 *     checkbox, whose `:checked` is the browser's own, reached through `:has()`.
 *
 * Neither trigger can fire in the other's host, and that is enforced HERE rather
 * than left to the caller: a `button` has no `:checked` descendant, and the
 * `asChild` branch STRIPS `aria-checked` - without that, one
 * `<Switch asChild aria-checked>` on a label draws a fully ON pill over an
 * unchecked box while the row announces no state at all, which is exactly the
 * disagreement this part exists to make impossible (layer 1, HIGH-4). Both
 * triggers are scoped to the NAMED group `group/switch`, so a switch inside some
 * other `.group` that happens to contain a checked box is not lit up by it.
 *
 * ⚠️ THE VARIANTS ARE SPELLED OUT, TWICE, ON PURPOSE. Tailwind scans source text,
 * so a prefix assembled at run time (`${trigger}:bg-primary`) generates no CSS at
 * all: the class would sit on the element and nowhere in the stylesheet.
 *
 * ⚠️ THE THUMB IS AN ELEMENT, NEVER `::after`. Pseudo-elements on a replaced
 * element are engine-dependent, and a drawing has to be measurable in every
 * engine a consumer ships to. It is also why the native host's input is an
 * invisible overlay rather than the track itself: an `<input>` styled as the
 * 44x24 track is a 24px-tall control, and `min-h-hit` on the row is what the tap
 * floor actually measures (`test/tailwind-compile.test.tsx`).
 *
 * Geometry, and it is arithmetic rather than taste: a 44x24 track with a 2px
 * border leaves a 40x20 padding box; a 16px thumb inset 2px inside that leaves
 * 44 - 2*2 - 2*2 - 16 = 20px of travel, which is `translate-x-5`. So "on" sits
 * flush against the far edge. `test/switch-drawing.test.tsx` re-derives all five
 * numbers from the COMPILED stylesheet rather than from these strings.
 */

/**
 * The control: the hit area, the named group, and the positioning context the
 * native host's overlay input needs.
 *
 * Both focus spellings, because the focused element differs by host - the root
 * itself when it is the button, a descendant when it is the label - and both
 * disabled spellings, for the same reason. The ring is drawn on the ROW in both,
 * rather than on the track, because the row is what the person is pointing at.
 *
 * ⚠️ THE OUTLINE IS THE LOAD-BEARING HALF AND THE SHADOW IS THE NICE ONE.
 * `forced-colors: active` drops a `box-shadow` and keeps an `outline`, so the
 * old `focus-visible:outline-none` left this control with NO focus indicator at
 * all in the mode a person uses because they cannot see the default one -
 * measured in the consuming product, `test/focus-outline.test.tsx` carries the
 * numbers. Both are declared now: the outline for forced colors, the shadow for
 * the dark inner separator that makes the ring readable over cover art.
 */
const switchClass =
  "group/switch relative inline-flex min-h-hit cursor-pointer items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:shadow-focus-ring has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary has-focus-visible:shadow-focus-ring disabled:cursor-not-allowed disabled:opacity-50 has-disabled:cursor-not-allowed has-disabled:opacity-50";

/** The track: the pill, and the fill that changes with the state. */
const trackClass =
  "relative h-6 w-11 shrink-0 rounded-full border-2 border-border-strong bg-overlay transition-colors group-aria-checked/switch:border-primary group-aria-checked/switch:bg-primary group-has-checked/switch:border-primary group-has-checked/switch:bg-primary motion-reduce:transition-none";

/**
 * The thumb: the same 20px of travel from either trigger.
 *
 * Position is the load-bearing half of the state, not colour. Measured: in the
 * light preset the two track fills are 1.13:1 apart, so a viewer who reads the
 * fill alone cannot tell the states apart - the thumb having MOVED is what says
 * which one it is, in both presets and in no colour at all.
 *
 * ⚠️ AND A MOVE IS ONLY SEEN IF THE THING THAT MOVES IS PAINTED. Under
 * `forced-colors: active` the thumb's one paint, a `background-color`, is forced
 * to `Canvas`, the same `Canvas` the track's fill went to, so without the last
 * token here the thumb travelled 20px and nothing on screen moved: checked and
 * unchecked hashed IDENTICAL in headless Chromium, in both forced palettes and
 * both hosts. `forced-colors:border-8` draws it in the mode's own ink instead -
 * 8px of border on a 16px `border-box` meets in the middle, a solid disc, which is
 * `RadioGroupIndicator`'s answer at twice the size. It is scoped to the mode, so
 * the normal drawing is byte-for-byte what it was.
 */
const thumbClass =
  "pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-muted transition-transform group-aria-checked/switch:translate-x-5 group-aria-checked/switch:bg-primary-foreground group-has-checked/switch:translate-x-5 group-has-checked/switch:bg-primary-foreground motion-reduce:transition-none forced-colors:border-8";

/**
 * The native host's control: a real checkbox, covering the whole row.
 *
 * Invisible rather than absent (`opacity-0`, never `hidden`), so it keeps its
 * focus, its keyboard operation, its accessible name from the wrapping label and
 * its value in a `FormData`. `min-h-hit` is the honest statement that its hit box
 * is the row - which is 44px, where an input drawn as the 44x24 track would not
 * be.
 */
const nativeInputClass =
  "absolute inset-0 m-0 min-h-hit cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed";

export type SwitchProps = ComponentProps<"button"> & {
  /**
   * Render the caller's child instead of a `button[role=switch]`, keeping the
   * classes and every other prop. This is the native host: a `<label>` that
   * wraps a `SwitchInput` brings its own semantics, so neither the `role` nor
   * the `aria-checked` this part would otherwise write is spread onto it - a
   * `label[role=switch]` announces a switch with no state behind it, and an
   * `aria-checked` on a label announces nothing while lighting the drawing.
   */
  asChild?: boolean;
};

export function Switch({
  className,
  asChild = false,
  type,
  "aria-checked": ariaChecked,
  ...props
}: SwitchProps) {
  const classes = cn(switchClass, className);
  // No `role`, no `type` and no `aria-checked` on this branch, deliberately: the
  // child brings its own semantics, and each of those three is a lie on a
  // `<label>`. A caller whose child IS a button writes them on that button,
  // where they belong and where they survive the merge.
  if (asChild) return <Slot data-slot="switch" className={classes} {...props} />;
  return (
    <button
      data-slot="switch"
      // An untyped button inside a <form> submits it, which a settings toggle
      // never means.
      type={type ?? "button"}
      role="switch"
      // `role="switch"` REQUIRES `aria-checked`, so the part writes the default
      // the role mandates rather than shipping an `aria-required-attr`
      // violation whenever a caller forgets (layer 1, HIGH-3). It is not state:
      // it is what "off" is spelled as, and the drawing reads the same
      // attribute, so the two cannot disagree.
      aria-checked={ariaChecked ?? false}
      className={classes}
      {...props}
    />
  );
}

/**
 * The native checkbox for the label host.
 *
 * `role="switch"` so both hosts announce the same thing; the checkedness maps to
 * the switch's state on its own, which is why this part writes no `aria-checked`
 * of its own - one that disagreed with the box would be worse than none.
 */
export function SwitchInput({ className, ...props }: Omit<ComponentProps<"input">, "type">) {
  return (
    <input
      data-slot="switch-input"
      type="checkbox"
      role="switch"
      className={cn(nativeInputClass, className)}
      {...props}
    />
  );
}

/** The track. The thumb goes inside it, in either host. */
export function SwitchTrack({ className, ...props }: ComponentProps<"span">) {
  return <span data-slot="switch-track" className={cn(trackClass, className)} {...props} />;
}

/**
 * The thumb.
 *
 * No `aria-hidden`: it names nothing and has no role, and an `aria-hidden`
 * ancestor of the native host's focusable input would be a real violation rather
 * than a tidy one.
 */
export function SwitchThumb({ className, ...props }: ComponentProps<"span">) {
  return <span data-slot="switch-thumb" className={cn(thumbClass, className)} {...props} />;
}

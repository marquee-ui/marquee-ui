"use client";

import { createContext, useContext } from "react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A yes/no as parts: a row, a native checkbox, a box and its mark.
 *
 * ⚠️ THE STATE IS THE PLATFORM'S, exactly as `Switch`'s is. This package holds
 * none: the drawing reads a `:checked` descendant of the row, so the box can
 * never disagree with what a screen reader is told. There is no `checked` prop
 * and no `cva` state axis - a state variant would be a second source of truth,
 * and the one that can be wrong.
 *
 * THE SHAPE, and every piece of it is derived from a real product's seven
 * checkbox rows (read at `50f8a22c`; the measurement is in `docs/as-built.md`):
 *
 *   <Checkbox className="w-full justify-between text-sm">
 *     <span className="flex flex-col">Spoilers<span>Blur this review…</span></span>
 *     <CheckboxInput name="spoilers" />
 *     <CheckboxBox><CheckboxIndicator /></CheckboxBox>
 *   </Checkbox>
 *
 * ⚠️ THE INPUT IS AN INVISIBLE OVERLAY ON THE ROW, NOT THE BOX, and that is
 * `Switch`'s decision 4 rather than a new one. An `<input>` drawn as the 24px box
 * IS a 24px control; as an overlay it keeps everything that made a native
 * checkbox the right choice - focus, the space bar, the accessible name from the
 * wrapping label, its value in a `FormData`, `:checked` - and its hit box becomes
 * the whole 44px row, which is what the person is pointing at.
 *
 * ⚠️ AND IT TAKES TWO INSTRUMENTS TO SAY THAT, not one (layer 1, HIGH-1). The
 * package's floor guard (`test/tailwind-compile.test.tsx`) resolves the INPUT's
 * declared height and demands 44 - and it reads `min-height`/`height` and nothing
 * else, which its own comment says. So an input that kept `min-h-hit` and lost
 * `inset-0` measures 44px tall, renders about 13px wide at the UA checkbox's
 * intrinsic size, and every test passes while the row's tap band is gone.
 * `test/choice-drawing.test.tsx` reads the COVERING - `position: absolute` and a
 * zero `inset` - out of the same compiled sheet, and the two together are what
 * make the floor a fact rather than a hope about label click-forwarding.
 *
 * ⚠️ AND THE ROW HOLDS NOTHING ELSE INTERACTIVE. The overlay covers the row's own
 * text, so there is no text selection inside it and a second control - a link, a
 * button - would be occluded by it. That is inherent to the pattern rather than
 * this part's choice (`Switch` records the same), and a row that needs a link
 * beside it puts that link OUTSIDE the label, which is what the report sheet in
 * the consuming product already does and what `RadioGroupItem`'s `AsAList` story
 * shows.
 *
 * ⚠️ THE MARK IS AN ELEMENT, NEVER `input::after`. The consuming product's own
 * comment says why: pseudo-elements on a replaced element are engine-dependent,
 * and `mobile-webkit` is the one engine its box cannot launch. Same reason
 * `SwitchThumb` is an element.
 *
 * ⚠️ THE STATE TRIGGER IS SPELLED OUT, AND IT IS NAMED. Tailwind scans source
 * text, so a prefix assembled at run time generates no CSS at all; and
 * `group-has-checked/checkbox:` rather than the unnamed `group-has-checked:`,
 * because the unnamed form lights up every box inside any `.group` that happens
 * to contain a checked input - a settings list with a hover group around it is
 * exactly that page (`Switch`'s decision 3, proved there).
 */

/**
 * The row: the hit area, the named group, and the positioning context the
 * overlay input needs.
 *
 * It is a `<label>` and only a `<label>`, so no `asChild`: the label WRAPPING its
 * control is what associates the two with no `id` to keep in sync, and what makes
 * the whole row the target. A caller who wants the row to be something else wants
 * a different control.
 *
 * The focus ring is drawn on the ROW (`has-focus-visible:`) because the input's
 * own ring is invisible at `opacity-0`, and the disabled treatment likewise
 * (`has-disabled:`): the row is the only element either state has to show on.
 *
 * ⚠️ AND IT DECLARES AN OUTLINE, NOT ONLY A SHADOW. `forced-colors: active` drops
 * a `box-shadow` and keeps an `outline`, so a shadow-only ring on a row whose
 * focusable input is already invisible leaves NO focus indicator at all in the
 * mode a person uses because they cannot see the default one. The Switch's label
 * host had the identical hole (`switch.tsx`, and the consuming product's own browser measurement); `test/focus-outline.test.tsx` derives this
 * invariant over every part rather than listing them, which is how this one was
 * found.
 */
const rowClass =
  "group/checkbox relative inline-flex min-h-hit cursor-pointer items-center gap-3 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary has-focus-visible:shadow-focus-ring has-disabled:cursor-not-allowed has-disabled:opacity-50";

/**
 * The native control, invisible and covering the row.
 *
 * Byte-identical to `Switch`'s `nativeInputClass`, deliberately: it is the same
 * decision about the same element, and two spellings of one idea are two things
 * to keep true. `opacity-0`, never `hidden` or `sr-only` - it has to keep its
 * focus, its keyboard operation and its 44px hit box, and `sr-only` would shrink
 * it to 1px.
 */
const inputClass =
  "absolute inset-0 m-0 min-h-hit cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed";

/**
 * The box. `size-6` and `rounded-sm` and a 2px edge are the consuming product's
 * own house box (`OnboardingForm.tsx:171-173`, the one of its seven rows that
 * stopped using the browser's); the fill flips with the state.
 *
 * No `transition-colors`, and that is derived rather than forgotten: the site
 * this is taken from has none, and a fill has no distance to cross. `SwitchTrack`
 * transitions because its thumb travels 20px beside it.
 */
const boxClass =
  "relative grid size-6 shrink-0 place-items-center rounded-sm border-2 border-border-strong bg-surface group-has-checked/checkbox:border-primary group-has-checked/checkbox:bg-primary";

/**
 * The mark inside the box: hidden until the control is checked, and drawn in the
 * ink the fill is guaranteed to carry (`primary-foreground` on `primary` is the
 * pair `Button`'s primary variant already stands on).
 */
const indicatorClass =
  "pointer-events-none absolute size-4 stroke-primary-foreground opacity-0 group-has-checked/checkbox:opacity-100";

/**
 * The row's marker, and the ONE part that demands it is the input.
 *
 * ⚠️ The drawing parts deliberately do NOT (decision 11): a `CheckboxBox` outside a
 * row renders an unlit box that can never light, which is visible in the workbench
 * on the first click. An orphan `CheckboxInput` is the other kind - an invisible,
 * `absolute inset-0` control with no accessible name, absorbing pointer events over
 * whatever ancestor happens to be positioned (layer 1, LOW-2, proved). That is the
 * failure this package throws for, and `RadioGroupInput` already did.
 */
const CheckboxContext = createContext<true | null>(null);

function refuseAsChild(props: object, part: string, element: string): void {
  if ("asChild" in props && (props as { asChild?: unknown }).asChild !== undefined) {
    throw new Error(
      `<${part}> does not take "asChild": it is a <${element}>, and the label WRAPPING its input ` +
        `is what makes the whole 44px row the control and names it with no id to keep in sync. ` +
        `React drops an unknown prop silently, so this is a throw rather than a no-op.`,
    );
  }
}

export type CheckboxProps = ComponentProps<"label">;

export function Checkbox({ className, ...props }: CheckboxProps) {
  refuseAsChild(props, "Checkbox", "label");
  return (
    <CheckboxContext.Provider value={true}>
      <label data-slot="checkbox" className={cn(rowClass, className)} {...props} />
    </CheckboxContext.Provider>
  );
}

export type CheckboxInputProps = Omit<ComponentProps<"input">, "type">;

/** The real control. `type` is fixed, because a part that could be a radio is not this part. */
export function CheckboxInput({ className, ...props }: CheckboxInputProps) {
  if (useContext(CheckboxContext) === null) {
    throw new Error(
      "<CheckboxInput> must be rendered inside a <Checkbox>: it is an invisible overlay that takes " +
        "its 44px hit box and its accessible name from that row, so on its own it is an unnamed " +
        "control covering whichever ancestor happens to be positioned.",
    );
  }
  return (
    <input
      data-slot="checkbox-input"
      type="checkbox"
      className={cn(inputClass, className)}
      {...props}
    />
  );
}

export type CheckboxBoxProps = ComponentProps<"span">;

/** The drawn box. The mark goes inside it. */
export function CheckboxBox({ className, ...props }: CheckboxBoxProps) {
  return <span data-slot="checkbox-box" className={cn(boxClass, className)} {...props} />;
}

export type CheckboxIndicatorProps = Omit<ComponentProps<"svg">, "children"> & {
  /** A mark of the caller's own. The house tick is drawn when this is absent. */
  children?: ReactNode;
};

/**
 * The tick.
 *
 * `aria-hidden`, unlike `SwitchThumb`: that part is an empty `<span>` with no
 * role and nothing to hide, and an svg is neither. It names nothing a screen
 * reader needs - the row's label is the accessible name and the input's own
 * checkedness is the state - so hiding it removes a node rather than a fact.
 *
 * The path is the consuming product's, to the pixel, so a consumption is an
 * adoption and not a redraw. A caller with its own mark passes it as children.
 */
export function CheckboxIndicator({ className, children, ...props }: CheckboxIndicatorProps) {
  return (
    <svg
      data-slot="checkbox-indicator"
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(indicatorClass, className)}
      {...props}
    >
      {children ?? <path d="M3.5 8.5l3 3 6-6" />}
    </svg>
  );
}

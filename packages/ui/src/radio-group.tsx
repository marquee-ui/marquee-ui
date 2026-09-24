"use client";

import { Slot } from "@radix-ui/react-slot";
import { Children, createContext, isValidElement, useContext, useId } from "react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * One choice out of several, as parts: a group, a row per option, a native
 * radio, and a drawing the row may or may not have.
 *
 * ⚠️ THE STATE, THE ROVING TAB STOP AND THE ARROW KEYS ARE ALL THE PLATFORM'S.
 * This package holds no state, no `tabIndex` arithmetic and no key handler, and
 * that is not a saving of effort: the two behaviours a React radio group
 * re-implements are what a shared `name` already gives, and they are MEASURED
 * here rather than assumed (marquee-ui's `packages/ui/test/choice-drawing.test.tsx`,
 * and the plays in its `packages/ui/stories/radio-group.stories.tsx`) -
 * `user.tab()` enters a group of three at the CHECKED radio and leaves it after
 * one stop, and `{ArrowDown}` moves the
 * checked radio to the next one. The drawing reads a `:checked` descendant of
 * the row, so it cannot disagree with what a screen reader is told.
 *
 * ⚠️ AND THE GROUP OWNS THE `name`, which is the whole reason it is a part. A
 * radio with no shared name is not in a group: twelve of them are twelve
 * independent controls, every one of which can be checked at once, and nothing
 * on screen says so until somebody clicks a second one. The group generates one
 * from `useId` when the caller has no form-level name to give, hands it down by
 * context, and `RadioGroupInput` refuses a `name` of its own.
 *
 * THE SHAPE:
 *
 *   <RadioGroup aria-label="Which rule does it break?" className="flex flex-col gap-1">
 *     <RadioGroupItem className="w-full rounded-md border-2 px-3">
 *       <RadioGroupInput value="ads" defaultChecked />
 *       <RadioGroupCircle><RadioGroupIndicator /></RadioGroupCircle>
 *       <span>Reviews and lists are not ad space</span>
 *     </RadioGroupItem>
 *   </RadioGroup>
 *
 * ⚠️ THE DRAWING IS OPTIONAL, BY COMPOSITION AND NOT BY A PROP. An item that
 * composes no `RadioGroupCircle` draws nothing of its own, and its selected state
 * is whatever the caller draws on a sibling (a face, the row). Draw it in
 * something forced colors KEEPS: a border WIDER than the rest state's, an outline,
 * or the caller's own `forced-colors:` treatment of the checked state. A ring is a
 * `box-shadow`, which the mode drops, and a border that changes only its colour
 * reverts to the same ink in both states (the rule is under the dot, below), so
 * either one draws checked and unchecked as ONE picture in that mode. That is the
 * one composition a `variant="bare"` prop would have made a configuration
 * question (D6), and it is a real product's face grid.
 *
 * ⚠️ AND A ROW HOLDS NOTHING ELSE INTERACTIVE, for the same reason `Checkbox`'s
 * does: the overlay covers it. A deep link beside an option goes OUTSIDE the
 * `RadioGroupItem` - the `AsAList` story is exactly that shape, and it is the one
 * the consuming product's report sheet already draws.
 *
 * ⚠️ AND WHAT THIS FAMILY CANNOT MODEL, said here because three sites in that
 * product need it: an option set that a RE-TAP on the chosen option clears.
 * Measured on React 19.3.0 under jsdom - a click on an already-checked radio
 * fires no `change` event at all (a checkbox fires one), which is the platform
 * saying a radio group is never empty once entered. A set that has to be
 * un-sayable is a group of toggles, not this.
 */

type GroupContext = { readonly name: string };

const RadioGroupContext = createContext<GroupContext | null>(null);

/**
 * The accessible name, wherever the caller put it: on the part, on an `asChild`
 * child, or - when that child is a `<fieldset>` - in its `<legend>`.
 *
 * ⚠️ A NON-EMPTY STRING, not a present attribute (layer 1, MED-1, proved):
 * `aria-label=""` satisfied the first edition and names nothing, and
 * `aria-label={group.title}` with an untitled group is exactly how that arrives.
 * What cannot be checked at render is a `aria-labelledby` pointing at an id that
 * does not exist - the element is not in a document yet - so that one is a real
 * hole and is said out loud rather than implied away.
 *
 * ⚠️ AND THE `<legend>` ARM IS NOT A COURTESY (layer 1, MED-2): the props docblock
 * advertises a `<fieldset>` host, and `<fieldset><legend>` is the native named
 * group. Measured with this package's own naming instrument - the
 * `dom-accessibility-api` that every `getByRole(…, { name })` here runs on -
 * `<fieldset role="radiogroup"><legend>X</legend>` resolves as named `X`, so the
 * first edition threw on a group that IS named.
 */
function hasAccessibleName(props: object, children: ReactNode, asChild: boolean): boolean {
  const filled = (value: unknown): boolean => typeof value === "string" && value.trim() !== "";
  const named = (candidate: object): boolean =>
    filled((candidate as { "aria-label"?: unknown })["aria-label"]) ||
    filled((candidate as { "aria-labelledby"?: unknown })["aria-labelledby"]);
  if (named(props)) return true;
  if (!asChild) return false;
  const child = Children.only(children);
  if (!isValidElement<{ children?: ReactNode }>(child)) return false;
  if (named(child.props)) return true;
  if (child.type !== "fieldset") return false;
  return Children.toArray(child.props.children).some(
    (grand) => isValidElement(grand) && grand.type === "legend",
  );
}

/**
 * The role is the part's, in both branches.
 *
 * ⚠️ `Slot` gives the CHILD's props precedence, so `<RadioGroup asChild><ul role="list">`
 * rendered a named LIST of radios with no group at all, and the name refusal above
 * passed it because the `aria-label` was there (layer 1, MED-3, proved). A caller's
 * `role` on the part itself wins the same way, because every part in this package
 * spreads the caller's props last. Both are refused, which is `DescriptionList`'s
 * `refuseRole` in a different costume.
 */
function refuseRole(props: object, children: ReactNode, asChild: boolean): void {
  const carries = (candidate: object): boolean =>
    "role" in candidate && (candidate as { role?: unknown }).role !== undefined;
  const child = asChild ? Children.only(children) : null;
  if (carries(props) || (isValidElement<object>(child) && carries(child.props))) {
    throw new Error(
      '<RadioGroup> writes role="radiogroup" itself and does not take a "role": a role here ' +
        "replaces the group - a list of radios that belong to nothing - while every other " +
        "attribute still looks right. Remove it, or use a plain element.",
    );
  }
}

/**
 * The row: the hit area, the named group, and the positioning context the
 * invisible input needs.
 *
 * ⚠️ THE RING DECLARES AN OUTLINE, NOT ONLY A SHADOW. It is drawn on the ROW
 * (`has-focus-visible:`) because the input's own ring is invisible at
 * `opacity-0` - and `forced-colors: active` drops a `box-shadow` while keeping an
 * `outline`, so a shadow-only ring here would leave NO focus indicator at all in
 * the mode a person uses because they cannot see the default one. The Switch's
 * label host had the identical hole (`switch.tsx`, and the consuming product's own
 * browser measurement); marquee-ui's `packages/ui/test/focus-outline.test.tsx` derives this
 * invariant over every part rather than listing them, which is how this one was
 * found.
 */
const rowClass =
  "group/radio relative inline-flex min-h-hit cursor-pointer items-center gap-3 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary has-focus-visible:shadow-focus-ring has-disabled:cursor-not-allowed has-disabled:opacity-50";

/**
 * The native control, invisible and covering the row: `Switch`'s decision 4 and
 * `CheckboxInput`'s string, for the same reason in the same words. An `<input>`
 * drawn as the 24px circle is a 24px control; as an overlay its hit box is the
 * row, which is what the package's 44px floor guard measures.
 */
const inputClass =
  "absolute inset-0 m-0 min-h-hit cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed";

/** The circle: `CheckboxBox`'s geometry at a different radius, so the two read as one control in two shapes. */
const circleClass =
  "relative grid size-6 shrink-0 place-items-center rounded-full border-2 border-border-strong bg-surface group-has-checked/radio:border-primary group-has-checked/radio:bg-primary";

/**
 * The dot, in the ink the fill guarantees.
 *
 * ⚠️ THE `forced-colors:` BORDER IS THE WHOLE CHECKED STATE IN THAT MODE, AND
 * NOTHING ELSE HERE CARRIES IT. Forced colors discards every AUTHOR colour: a
 * `background-color` becomes `Canvas` (its alpha kept), and a `border-color` or
 * `outline-color` REVERTS to `currentcolor`, the element's ink, which the mode
 * forces to `CanvasText`. (A system colour the author writes is kept as written,
 * and a `box-shadow` is dropped.) So a dot whose only paint is a background
 * sits Canvas on Canvas inside a circle whose fill went Canvas too, and CHECKED
 * AND UNCHECKED BECOME THE SAME PICTURE. The consuming product measured exactly
 * that before this line existed: the two circles hashed identical, where the
 * native radio they replaced did not. `Switch` and `Checkbox` had the same hole
 * and were once said to escape it; measured in headless Chromium, neither did.
 * The Switch's thumb MOVES but paints only a background, so it moved Canvas on
 * Canvas and the two states hashed identical; the Checkbox's tick is an SVG
 * `stroke`, which Chromium does NOT force, so it stayed near-black on a black
 * Canvas. Each now carries its own `forced-colors:` treatment.
 *
 * `border-4` on a `size-2` box is a SOLID disc, not a ring: the box is 8px,
 * `border-box` sizing is the preflight default, and 4px of border on every side
 * meets in the middle - so the mode draws the same dot the native control does,
 * in the user's own ink. It is scoped to `forced-colors:` because the normal
 * drawing must not move: outside that media query this string is byte-for-byte
 * what it was, which is what the consumer's measurement table and its e2e arm
 * are written against. marquee-ui's `packages/ui/test/forced-colors-state.test.tsx`
 * derives the invariant over every part rather than listing this one.
 */
const indicatorClass =
  "pointer-events-none absolute size-2 rounded-full bg-primary-foreground opacity-0 group-has-checked/radio:opacity-100 forced-colors:border-4";

function refuseAsChild(props: object, part: string, element: string): void {
  if ("asChild" in props && (props as { asChild?: unknown }).asChild !== undefined) {
    throw new Error(
      `<${part}> does not take "asChild": it is a <${element}>, and the label WRAPPING its input ` +
        `is what makes the whole 44px row the control and names it with no id to keep in sync.`,
    );
  }
}

export type RadioGroupProps = ComponentProps<"div"> & {
  /**
   * The form field name every radio in this group shares. Generated when it is
   * absent, which is right for a group whose value is read from React rather
   * than from a `FormData`.
   */
  name?: string;
  /**
   * Render the caller's own element - a `<ul>`, a `<fieldset>` - keeping the
   * role, the classes and every other prop. Two real sites draw their options as
   * a list and have tests that resolve the `<li>`s.
   */
  asChild?: boolean;
};

/**
 * The group: the role, the accessible name, and the shared `name`.
 *
 * ⚠️ IT REFUSES TO RENDER WITHOUT AN ACCESSIBLE NAME, and that is deliberately
 * STRICTER than axe: `axe-core@4.12.1`'s own role table says
 * `radiogroup: { accessibleNameRequired: false }` (`axe.js:14706`), and its
 * `aria-required-children` rule does not even run on the role (its matcher reads
 * a `requiredOwned` that entry does not have). So no automated check in either
 * repository would catch an unnamed group - it would simply announce "group" with
 * nothing in front of it. All four radiogroups in the consuming product name
 * themselves, three with `aria-label` and one with `aria-labelledby`; this makes
 * the fourth impossible to forget.
 */
export function RadioGroup({
  className,
  name,
  asChild = false,
  children,
  ...props
}: RadioGroupProps) {
  const generated = useId();
  refuseRole(props, children, asChild);
  if (!hasAccessibleName(props, children, asChild)) {
    throw new Error(
      "<RadioGroup> needs an accessible name: pass a non-empty aria-label, or aria-labelledby " +
        "pointing at the heading above it, or use a <fieldset> with a <legend> through asChild. " +
        "A radiogroup takes its name from the author only, so without one it is announced as an " +
        "unnamed group - and neither axe nor this package can see that from the DOM (axe-core " +
        "4.12.1 has accessibleNameRequired: false for the role).",
    );
  }
  const Host = asChild ? Slot : "div";
  return (
    <RadioGroupContext.Provider value={{ name: name ?? generated }}>
      <Host data-slot="radio-group" role="radiogroup" className={className} {...props}>
        {children}
      </Host>
    </RadioGroupContext.Provider>
  );
}

export type RadioGroupItemProps = ComponentProps<"label">;

/** One option's row: the hit area, the named group, and the positioning context the overlay needs. */
export function RadioGroupItem({ className, ...props }: RadioGroupItemProps) {
  refuseAsChild(props, "RadioGroupItem", "label");
  return <label data-slot="radio-group-item" className={cn(rowClass, className)} {...props} />;
}

export type RadioGroupInputProps = Omit<ComponentProps<"input">, "type" | "name">;

/**
 * The real control.
 *
 * It throws outside a `RadioGroup` rather than rendering a radio with no group:
 * the quiet version of that is a set of options that can all be chosen at once,
 * which looks entirely normal until somebody picks a second one. `Form`'s
 * decision 11 and `DescriptionList`'s, same reasoning.
 */
export function RadioGroupInput({ className, ...props }: RadioGroupInputProps) {
  const group = useContext(RadioGroupContext);
  if (group === null) {
    throw new Error(
      "<RadioGroupInput> must be rendered inside a <RadioGroup>: the group owns the shared name, " +
        "and radios without one are not a group - every one of them can be checked at once.",
    );
  }
  // `!== undefined` rather than `in`, which is `refuseAsChild`'s form above and
  // for the same reason: `{...rest}` from a caller that destructured `name` off
  // its own props carries the key with no value, and `in` calls that a name
  // (DL13 layer 2, LOW-7).
  if ((props as { name?: unknown }).name !== undefined) {
    throw new Error(
      '<RadioGroupInput> does not take "name": the group owns it, so a second spelling here would ' +
        "split one group into two. Pass it to <RadioGroup name=…> instead.",
    );
  }
  return (
    <input
      data-slot="radio-group-input"
      type="radio"
      className={cn(inputClass, className)}
      {...props}
      name={group.name}
    />
  );
}

export type RadioGroupCircleProps = ComponentProps<"span">;

/** The drawn circle. The dot goes inside it - and an item may have neither. */
export function RadioGroupCircle({ className, ...props }: RadioGroupCircleProps) {
  return <span data-slot="radio-group-circle" className={cn(circleClass, className)} {...props} />;
}

export type RadioGroupIndicatorProps = ComponentProps<"span">;

/**
 * The dot.
 *
 * No `aria-hidden`: it is an empty `<span>` with no role and no text, so it names
 * nothing to hide - and an `aria-hidden` ancestor of the row's focusable input
 * would be a real violation rather than a tidy one (`SwitchThumb`'s decision 7).
 */
export function RadioGroupIndicator({ className, ...props }: RadioGroupIndicatorProps) {
  return (
    <span data-slot="radio-group-indicator" className={cn(indicatorClass, className)} {...props} />
  );
}

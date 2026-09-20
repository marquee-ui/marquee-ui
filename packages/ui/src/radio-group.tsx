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
 * here rather than assumed (`test/choice-drawing.test.tsx`, and the plays in
 * `stories/radio-group.stories.tsx`) - `user.tab()` enters a group of three at
 * the CHECKED radio and leaves it after one stop, and `{ArrowDown}` moves the
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
 * is whatever the caller puts on a sibling: `group-has-checked/radio:ring-2` on an
 * avatar, a border on the row. That is the one composition a `variant="bare"` prop
 * would have made a configuration question (D6), and it is a real product's face
 * grid.
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

/** The accessible name, wherever the caller put it: on the part, or on an `asChild` child. */
function hasAccessibleName(props: object, children: ReactNode, asChild: boolean): boolean {
  const named = (candidate: object): boolean =>
    ("aria-label" in candidate &&
      (candidate as { "aria-label"?: unknown })["aria-label"] !== undefined) ||
    ("aria-labelledby" in candidate &&
      (candidate as { "aria-labelledby"?: unknown })["aria-labelledby"] !== undefined);
  if (named(props)) return true;
  if (!asChild) return false;
  const child = Children.only(children);
  return isValidElement<object>(child) && named(child.props);
}

const rowClass =
  "group/radio relative inline-flex min-h-hit cursor-pointer items-center gap-3 has-focus-visible:shadow-focus-ring has-disabled:cursor-not-allowed has-disabled:opacity-50";

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

/** The dot, in the ink the fill guarantees. */
const indicatorClass =
  "pointer-events-none absolute size-2 rounded-full bg-primary-foreground opacity-0 group-has-checked/radio:opacity-100";

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
  if (!hasAccessibleName(props, children, asChild)) {
    throw new Error(
      "<RadioGroup> needs an accessible name: pass aria-label, or aria-labelledby pointing at the " +
        "heading above it. A radiogroup takes its name from the author only, so without one it is " +
        "announced as an unnamed group - and neither axe nor this package can see that from the DOM " +
        "(axe-core 4.12.1 has accessibleNameRequired: false for the role).",
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
  if ("name" in props) {
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

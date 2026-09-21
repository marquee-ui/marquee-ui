"use client";

import { Slot } from "@radix-ui/react-slot";
import { Children, createContext, isValidElement, useContext, useId } from "react";
import type { ComponentProps, ReactNode } from "react";
import { Label } from "./label";
import type { LabelProps } from "./label";
import { cn } from "@/lib/utils";

/**
 * A field, as the WIRING between its label, its control, its description and its
 * message. The drawing is four classes; the reason this family exists is the
 * three attributes almost nobody writes by hand.
 *
 * It is a NEW family rather than a moved one, and it was derived from a real
 * product's forms rather than from a form library. That product has no form
 * library at all - its forms are plain `<form>`s with server actions - and the
 * measurement that decided every part of this file is what its fields do TODAY:
 * 30 error messages, of which exactly ONE carries an `id` and is named by its
 * field's `aria-describedby`; **14** `htmlFor` attributes, **11** of them
 * pointing at a hand-typed string literal and 3 at a variable; and one single
 * `aria-invalid` in the whole tree.
 * Every other field wraps its control in the `<label>` and associates nothing.
 * So the gap this closes is not a look, it is that a person who tabs back to a
 * field that just failed is told nothing about why.
 *
 * WHAT IT DELIBERATELY DOES NOT DECIDE:
 *
 * - **the control**. `FormControl` is a `Slot` and nothing else: it puts the id
 *   and the ARIA on whatever the caller passes, so an `<Input>`, a `<textarea>`
 *   and a `<select>` are all the same call. It draws nothing, so it also owes no
 *   tap floor - the CONTROL owes that, and `Input` already carries it.
 * - **the width, the outer margin and the form**. There is no `Form` root part.
 *   A `<form>` with a class is a part that only re-declares a class, and the
 *   context this family needs is per-FIELD, not per-form, so a root would carry
 *   nothing. The `AlertAction` that was not written is the same decision.
 * - **validation**. Nothing here knows what makes a value wrong. `invalid` is a
 *   prop because the caller is the only one who knows, and because a prop is the
 *   only mechanism that survives server rendering: a registration effect does
 *   not run on the server, so a server-rendered error would ship its HTML with
 *   no wiring at all and acquire it only once hydration lands.
 *
 * ⚠️ THE ONE RULE A CALL SITE HAS TO KNOW: **the parts are DIRECT children of
 * `FormItem`**. The item reads its own `children` to find out which of them were
 * composed, and it names an id in `aria-describedby` only for the ones that
 * were - so a `<FormDescription>` wrapped in a `<div>` is drawn and is not
 * announced. It is read at RENDER, so `{hint && <FormDescription>…}` is exactly
 * right and needs no prop.
 *
 * WHY THAT MECHANISM RATHER THAN UPSTREAM'S. shadcn's `form.tsx` names the
 * description id in `aria-describedby` unconditionally. Measured with axe-core
 * 4.12.1 rather than argued: an `aria-describedby` where NO named id resolves
 * is `aria-valid-attr-value`, impact **critical**; where at least one resolves,
 * axe says nothing at all. A field with a message and no description - which is
 * 29 of the 30 in the consuming product - sits in exactly the first case
 * whenever it is valid, which is to say almost always. So an id is named only
 * when the element carrying it is rendered, and this file has no composition in
 * which a named id dangles.
 */

type FormFieldContextValue = {
  /** The caller's verdict, and the only state in this family. */
  invalid: boolean;
  /** The control's own id, which the label points at. */
  controlId: string;
  descriptionId: string;
  messageId: string;
  /** Exactly the ids that are RENDERED, or undefined when none are. */
  describedBy: string | undefined;
};

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

/**
 * Throws rather than degrading. A part outside a `FormItem` has no id to carry,
 * so the quiet version of this is a label pointing at nothing and a control with
 * no ARIA - the exact defect the family exists to remove, shipped silently.
 */
function useFormField(part: string): FormFieldContextValue {
  const field = useContext(FormFieldContext);
  if (field === null) {
    throw new Error(`<${part}> must be rendered inside a <FormItem>.`);
  }
  return field;
}

type PartCounts = { label: number; control: number; description: number; message: number };

/**
 * How many of each part the caller composed, read off the item's own children at
 * render. That is what makes `{error && <FormMessage>…}` work without a second
 * prop: it tracks what is actually rendered, not what was declared.
 *
 * ⚠️ IT WALKS THE WHOLE ELEMENT TREE, not one level, and the shallow version was
 * a real defect (layer 1, MED-1, reproduced). The control's id and the label's
 * `htmlFor` travel by CONTEXT and so work at any depth - wrapping a control in a
 * `<div className="relative">` for an icon is an ordinary thing to do - and a
 * one-level walk made the description and the message the only parts that broke
 * when wrapped, silently and in the direction nobody would guess: the field
 * marked invalid, the error on screen with a live region, and the control
 * described by nothing. A part is not descended INTO: its children are content.
 *
 * The one arrangement it still cannot see is a component that renders a part
 * from its own internals rather than receiving it as a child. That is the limit
 * of anything render-time, and it is why the throws below exist.
 */
function countParts(children: ReactNode, counts: PartCounts): void {
  for (const child of Children.toArray(children)) {
    if (!isValidElement<{ children?: ReactNode }>(child)) continue;
    if (child.type === FormLabel) counts.label += 1;
    else if (child.type === FormControl) counts.control += 1;
    else if (child.type === FormDescription) counts.description += 1;
    else if (child.type === FormMessage) counts.message += 1;
    else countParts(child.props.children, counts);
  }
}

export type FormItemProps = ComponentProps<"div"> & {
  /**
   * The field is in error. It writes `aria-invalid` on the control, and it is
   * what makes `FormMessage` render - so the message and the attribute can
   * never disagree, and the caller drives both from one `error`.
   */
  invalid?: boolean;
};

/**
 * The field, and the only part that owns anything: one `useId`, the three ids
 * derived from it, and the stack the four other parts sit in.
 *
 * `gap-1` rather than the consuming product's `gap-1.5`: its twelve field
 * wrappers are a 6/6 tie between the two, and 6px is off the house's 4px
 * spacing grid, which `AGENTS.md` names as skeleton. `CardHeader`'s `gap-1` is
 * the precedent for a title-and-prose pair. A new family is not held to the
 * fidelity rule (the Switch's decision 8), so this is a 2px decision, not a
 * regression - and a call site that wants the old gutter says `gap-1.5`.
 *
 * `text-sm` sits on the ITEM and the DESCRIPTION and the MESSAGE carry only
 * their ink, which is `Alert`'s arrangement with the two axes swapped. Not the
 * label: it composes `Label`, whose tones are a size AND an ink (`text-sm
 * text-foreground-2`, or `text-3xs` under `micro`), and that is `Label`'s
 * contract rather than this family's to restate (layer 1, LOW-1 - the first
 * draft of this sentence said "the parts", which the label disobeys). The
 * duplicate `text-sm` resolves to the same value. The control is the one child
 * that must NOT inherit it: `Input` carries `text-base` on itself, which is the
 * 16px floor that stops iOS Safari zooming on focus and never zooming back.
 */
export function FormItem({ className, invalid = false, children, ...props }: FormItemProps) {
  const id = useId();
  const descriptionId = `${id}-description`;
  const messageId = `${id}-message`;
  const counts: PartCounts = { label: 0, control: 0, description: 0, message: 0 };
  countParts(children, counts);

  // ⚠️ ONE OF EACH, ENFORCED. An item owns exactly one `useId`, so a second part
  // of any kind wears an id the first one already has: two `<FormDescription>`s
  // put a duplicate id in the document and announce only the first, and two
  // `<FormControl>`s give two inputs the SAME id and leave the second one
  // unlabelled (layer 1, MED-2, both reproduced). And an item with no control
  // renders a label whose `for` resolves to nothing (LOW-3) - which is the very
  // thing `useFormField`'s throw is written against, one level down. This family
  // refuses a child that brings its own id; being silent about a composition
  // that manufactures a duplicate was the same defect with better manners.
  for (const [part, count] of Object.entries(counts) as [keyof PartCounts, number][]) {
    if (count > 1) {
      throw new Error(
        `<FormItem> holds ${count} <Form${part[0]!.toUpperCase()}${part.slice(1)}> parts: it owns ` +
          `one id, so a second would duplicate it. Use one, or a second <FormItem>.`,
      );
    }
  }
  if (counts.control !== 1) {
    throw new Error(
      "<FormItem> must hold exactly one <FormControl>: without it the label's `for` points at " +
        "nothing. A group of controls is a fieldset, not a field.",
    );
  }

  const describedBy =
    [counts.description ? descriptionId : null, invalid && counts.message ? messageId : null]
      .filter((part): part is string => part !== null)
      .join(" ") || undefined;

  return (
    <FormFieldContext.Provider
      value={{ invalid, controlId: id, descriptionId, messageId, describedBy }}
    >
      <div
        data-slot="form-item"
        className={cn("flex flex-col gap-1 text-sm", className)}
        {...props}
      >
        {children}
      </div>
    </FormFieldContext.Provider>
  );
}

/**
 * The field's label. It composes `Label` rather than re-drawing it, so the tone
 * axis comes along: the consuming product writes both the plain field label and
 * the mono micro-caps one, and `tone="micro"` is the second.
 *
 * `htmlFor` is written AFTER the caller's props, so it cannot be overridden.
 * Pointing a label at something other than the control it wraps is not a thing
 * a caller needs and is a thing they can do by accident.
 *
 * ⚠️ AND `asChild` IS REFUSED HERE, though `Label` offers it. `Label`'s own
 * docblock says `asChild` exists to keep the type treatment and DROP the
 * `for`/`id` semantics "that would be a lie on a heading" - and this part
 * writes `htmlFor` unconditionally, so through it `asChild` put `for` on a
 * `<span>`, which is an invalid attribute and a dead association (layer 1,
 * LOW-2, reproduced). A caller who wants the label's look on something that is
 * not a label wants `<Label asChild>` directly, outside the field.
 */
export function FormLabel({ className, ...props }: LabelProps) {
  const field = useFormField("FormLabel");
  if (props.asChild === true) {
    throw new Error(
      "<FormLabel asChild> would put `for` on an element that is not a label, which is the lie " +
        "<Label asChild> exists to avoid. Use <Label asChild> outside the field.",
    );
  }
  return (
    <Label data-slot="form-label" className={className} {...props} htmlFor={field.controlId} />
  );
}

/**
 * The control, as a pure `Slot`: it renders the caller's own element and puts
 * the wiring on it. No box, no class, no floor of its own.
 *
 * The three attributes are written AFTER this part's own props for the same
 * reason `FormLabel`'s `htmlFor` is: they are the whole point of the part. A
 * caller's own `aria-describedby` is not dropped though - passed HERE it is
 * kept, in front of the family's ids.
 *
 * ⚠️ AND ALL THREE ARE REFUSED ON THE CHILD, LOUDLY, WHICH IS NOT UPSTREAM'S
 * BEHAVIOUR. `Slot` gives the CHILD's props precedence over the slot's, so
 * `<FormControl><Input id="email" /></FormControl>` silently keeps the child's
 * id and leaves the label's `for` pointing at an element that does not exist -
 * a broken label, invisible on screen, in the one part whose whole job is that
 * association. Measured, not reasoned: a child carrying `aria-describedby` was
 * observed winning outright, which is what turned this into a throw.
 *
 * The list is the three attributes this part WRITES, and it is exactly those:
 * `aria-invalid` on the child cannot dangle, but it can disagree with the item -
 * a control announced invalid inside a field that renders no message and
 * describes nothing - so the rule is one rule rather than two thirds of one.
 *
 * ⚠️ AND THE SAME TWO ARE REFUSED ON THIS PART'S OWN PROPS. They used to be
 * accepted and then silently overwritten, which is the opposite policy to the
 * child-side throw for no reason anyone stated (layer 1, LOW-4:
 * `<FormControl id="mine" aria-invalid>` came out with the generated id and no
 * `aria-invalid` at all). `aria-describedby` is the one exception and it is an
 * exception on purpose: it MERGES, in front of the family's ids, because a
 * caller pointing at a second description is a real thing to want.
 */
export function FormControl({
  "aria-describedby": ariaDescribedBy,
  children,
  ...props
}: ComponentProps<typeof Slot>) {
  const field = useFormField("FormControl");
  for (const owned of ["id", "aria-invalid"] as const) {
    if (props[owned] !== undefined) {
      throw new Error(
        `<FormControl> does not take "${owned}": the field writes it. ` +
          `Use <FormItem invalid> for the state, and let the id be generated.`,
      );
    }
  }
  const child = Children.only(children);
  if (
    isValidElement<{ id?: unknown; "aria-describedby"?: unknown; "aria-invalid"?: unknown }>(child)
  ) {
    for (const owned of ["id", "aria-describedby", "aria-invalid"] as const) {
      if (child.props[owned] !== undefined) {
        throw new Error(
          `<FormControl>'s child must not set "${owned}": Slot gives the child precedence, so it ` +
            `would silently replace the wiring. Put it on <FormControl> instead.`,
        );
      }
    }
  }
  const describedBy = [ariaDescribedBy, field.describedBy].filter(Boolean).join(" ") || undefined;
  return (
    <Slot
      data-slot="form-control"
      {...props}
      id={field.controlId}
      aria-describedby={describedBy}
      aria-invalid={field.invalid || undefined}
    >
      {children}
    </Slot>
  );
}

/**
 * The quiet line under a field: what the value is for, what it has to look
 * like, what happens next. Ink only - the item owns the size.
 *
 * `text-muted` is the contract's quietest body ink and is inside the presets'
 * 4.5:1 ink-on-ground check on every ground, in both presets (`BODY_INK_ROLES`).
 * It writes NO role: a description is on the page from the start, so it is not a
 * live region. The two places the consuming product describes a field with
 * something that CHANGES, it writes `role="status"` itself, on an element that
 * is always rendered and empty until it has something to say - and that stays
 * the caller's to write, exactly as `Alert`'s role is.
 */
export function FormDescription({ className, ...props }: ComponentProps<"p">) {
  const field = useFormField("FormDescription");
  return (
    <p
      data-slot="form-description"
      className={cn("text-muted", className)}
      {...props}
      id={field.descriptionId}
    />
  );
}

/**
 * The error, and the one part in this package that writes a live region itself.
 *
 * `Alert` leaves its role to the caller because a boxed notice carries both
 * `status` and `alert` in the wild and the majority of them are on the page from
 * the start. A form message is the other case, and it was measured rather than
 * assumed: all 30 of the consuming product's field messages write `role="alert"`
 * and not one writes anything else, its own testing doctrine names form errors
 * as the `role="alert"` case, and this part renders NOTHING until the field is
 * invalid - so it cannot put a live region on a page that is merely showing a
 * hint, which is the argument that kept the role off `Alert`. The role is a
 * default and not a lock: it is written before the caller's props, so a message
 * that is genuinely polite can say `role="status"`.
 *
 * It renders on `invalid` rather than on having children, so that the attribute
 * and the element cannot disagree: whenever `aria-describedby` names this id,
 * this element is in the document.
 */
export function FormMessage({ className, ...props }: ComponentProps<"p">) {
  const field = useFormField("FormMessage");
  if (!field.invalid) return null;
  return (
    <p
      data-slot="form-message"
      role="alert"
      className={cn("text-destructive", className)}
      {...props}
      id={field.messageId}
    />
  );
}

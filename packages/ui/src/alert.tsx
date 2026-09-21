import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * A boxed notice: the house's 2px line around a sentence, in one of five tones.
 *
 * It is a NEW family rather than a moved one, derived from the notice boxes a
 * real product already draws - `rounded-md border-2 p-3 text-sm`, a tone on the
 * line and on the ink, and nothing else. Every one of those is a paragraph or a
 * small stack, so this is a stack: title, prose and whatever control the notice
 * offers are CHILDREN, not props.
 *
 * WHAT IT DELIBERATELY DOES NOT DECIDE:
 *
 * - **the role**. `status` (polite) and `alert` (assertive) are semantics, not a
 *   look, and the same drawing carries both in the wild. Announcing is about WHEN
 *   a notice arrives, not what colour it is, so the tone cannot decide it either:
 *   a `destructive` box rendered with the page is not assertive, and a `default`
 *   one that appears after an action is worth announcing.
 *
 *   ⚠️ **AND "WHEN IT ARRIVES" IS HALF THE RULE. A ROLE BELONGS ON A REGION THAT
 *   EXISTS, EMPTY, BEFORE ITS CONTENT DOES.** A screen reader announces a
 *   MUTATION inside a region it is already watching, so there are two ways to
 *   write a live region nobody hears, and this note used to name only the first:
 *
 *     - a notice that is on the page from first paint has no mutation to
 *       announce. That is the majority case, which is why a role by default would
 *       put a live region on every page that renders a hint; and
 *     - a notice INSERTED together with its text is announced unreliably, because
 *       the region and its sentence arrive in the SAME mutation and nothing was
 *       watching the region when they did. A conditionally mounted
 *       `<Alert role="status">` is this case wearing the other case's fix.
 *
 *   The shape that does announce is a region that is in the document, empty, from
 *   first paint and whose TEXT later changes. That is usually a different element
 *   from this one - an `sr-only` paragraph that holds the sentence for the
 *   reader - with `<Alert>` beside it as the visible half. Pass `role="status"`
 *   or `role="alert"` HERE only when this box itself is already mounted and empty
 *   before the notice is written into it.
 *
 *   Measured at the reference product rather than reasoned, and its ONE site
 *   for this part carries both halves at once. That notice DOES arrive - both
 *   routes to the URL are client-side soft navigations, instrumented on the
 *   built page as same-document with zero load events - and it declines the role
 *   anyway, because the region would be inserted together with its sentence; and
 *   on the typed-or-reloaded path the same box is there at first paint, where
 *   there is nothing to announce either. So the attribute could do its job on
 *   neither path. A second notice elsewhere in that product - NOT drawn by this
 *   part, and reached by a document navigation it measured - declined for the
 *   first-paint half alone.
 * - **its width and its outer margin**. A part that caps its own line length has
 *   decided the column it sits in, and one that sets its own margin has decided
 *   its relationship to a sibling it does not own. Both are the page's.
 * - **an action part**. The action is a child: `<Alert>` is a flex column, so a
 *   `<Button>` inside it stacks under the prose. A notice is not interactive, so
 *   it carries no tap floor - the moment it holds a control, the CALLER owes that
 *   control the 44px floor, exactly as `Badge` does, and `Button` already has it.
 *
 * `asChild` on the root is for the single-sentence notice that wants to stay a
 * `<p>`. Do not use it with `<AlertDescription>` inside: a `<p>` inside a `<p>`
 * is not a nesting the parser keeps.
 *
 * ⚠️ TWO DEPARTURES A CALL SITE PAYS FOR, said here because a silent one
 * instructs the next reader:
 *
 * - A tone's line and ink are ONE role, so "a destructive line with body ink" is
 *   not spellable as a tone. It exists in the wild - a sign-out notice that is
 *   serious but is a whole paragraph to READ - and the answer is a `className` on
 *   the part or on the description, which the `WithAction` story shows. A tone
 *   that split the two would let a red box carry green ink, which is the thing
 *   the pairing exists to stop.
 * - The box caps no width, so three of the five notices this was derived from
 *   have to re-add their own `max-w-*`. That is the point of the decision, and it
 *   is also three call sites that will look bare until they do.
 */

/**
 * The tone is a VISUAL axis and nothing more (rule 1). It moves the line and the
 * ink TOGETHER, which is what the one notice in the derivation that has a tone
 * axis does in both branches of its own ternary.
 *
 * Every ink here is one of the contract's STATUS roles, which are ink roles - and
 * so every one is already inside the presets' 4.5:1 contrast check on every
 * ground, in both presets (`BODY_INK_ROLES`). `alert-tone.test.tsx` holds the
 * table to that, so a tone can never be painted in a colour nothing measures.
 * The LINE owes no such floor: the notice's meaning is its sentence, never its
 * border, which is why the house's own `--border` sits below 3:1 on purpose.
 */
/**
 * The tone table, exported as DATA rather than buried in the `cva` call.
 *
 * `cva` closes over its config and exposes nothing, so a test that wants to check
 * the table has to retype it - and a retyped list of five covers exactly the five
 * someone remembered, which is how a SIXTH tone with a disagreeing line, an ink
 * outside the contrast matrix and no story went green through both of this
 * family's tables (layer 1, HIGH-2, reproduced). Exported, both tables are derived
 * from this one and a new tone cannot enter unmeasured.
 */
export const ALERT_TONES = {
  default: "border-border text-foreground-2",
  destructive: "border-destructive text-destructive",
  success: "border-success text-success",
  warning: "border-warning text-warning",
  info: "border-info text-info",
} as const;

export const alertVariants = cva("flex flex-col gap-2 rounded-md border-2 p-3 text-sm", {
  variants: { tone: ALERT_TONES },
  defaultVariants: { tone: "default" },
});

export type AlertProps = ComponentProps<"div"> &
  VariantProps<typeof alertVariants> & { asChild?: boolean };

export function Alert({ className, tone, asChild = false, ...props }: AlertProps) {
  const Comp = asChild ? Slot : "div";
  return <Comp data-slot="alert" className={cn(alertVariants({ tone }), className)} {...props} />;
}

/**
 * The notice's headline: the box's own ink at a heavier weight, and no colour of
 * its own - so it cannot disagree with the tone. A `<div>`, not a heading: a
 * notice is not a section, and putting one in the heading outline moves it into
 * every screen reader's document map.
 */
export function AlertTitle({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="alert-title" className={cn("font-semibold", className)} {...props} />;
}

/** No class of its own: `Alert` owns the gutter, the ink and the type size. */
export function AlertDescription({ className, ...props }: ComponentProps<"p">) {
  return <p data-slot="alert-description" className={cn(className)} {...props} />;
}

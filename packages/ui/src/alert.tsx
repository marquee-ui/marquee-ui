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
 *   one that appears after an action is worth announcing. A notice that is on the
 *   page from the start is not a live region at all, and that is the majority
 *   case, so writing one by default would add a live region to every page that
 *   renders a hint. Pass `role="status"` or `role="alert"` when the notice ARRIVES.
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
export const alertVariants = cva("flex flex-col gap-2 rounded-md border-2 p-3 text-sm", {
  variants: {
    tone: {
      default: "border-border text-foreground-2",
      destructive: "border-destructive text-destructive",
      success: "border-success text-success",
      warning: "border-warning text-warning",
      info: "border-info text-info",
    },
  },
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

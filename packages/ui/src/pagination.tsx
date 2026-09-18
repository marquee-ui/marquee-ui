import { Slot } from "@radix-ui/react-slot";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Numbered pages, as parts. MOVED through the role rename table like the trail:
 * the tokens change name, the pixels do not (`test/fidelity.test.tsx`).
 *
 * ⚠️ A CRAWL STRUCTURE BEFORE IT IS A CONTROL. Plain anchors, no client state and
 * no button-driven pager: a crawler that runs no scripts has to be able to walk
 * it, which is the reason the upstream component exists in this shape.
 *
 * ⚠️ WHICH pages appear is NOT here. A window that keeps the first and last page
 * reachable is a rule about a collection, and it lives with the collection - the
 * part is presentation, and it renders the pages a caller hands it.
 *
 * ⚠️ THE PER-LINK NAME IS THE CALLER'S. A page link reading "2" announces "2",
 * which is why the consumer labels every one of them "Page 2" and resolves them
 * by that whole phrase; the part writes no `aria-label` of its own, because the
 * only thing it knows is the child, and guessing a name from a child is how a
 * label ends up disagreeing with the copy around it. ⚠️ Under `asChild` the name
 * a caller puts on the CHILD wins over the one they pass to this part - Radix's
 * `Slot` merges the child's props over the slot's, measured - so the label goes on
 * one of the two, not on both.
 *
 * ⚠️ `min-h-11 min-w-11`, both axes, and NOT the house's `min-h-hit`. They resolve
 * to the same 44px; the reason this part keeps the upstream spelling is FIDELITY -
 * the rename table carries no entry for either, so `min-h-hit` reddens
 * `fidelity > pagination.linkCurrent` and `linkOther` (layer 1, LOW-4: the
 * "the consumer's tests grep the literal" argument is substantiated for the trail
 * and not for this part, so it is not the argument used here).
 */

/** The consumer's own landmark name, and a default a caller can rename. */
const NAV_LABEL = "Pages";
/** The house glyph for a skipped run of pages. Punctuation, so it is a slot. */
const ELLIPSIS = "·";

const contentClass = "flex flex-wrap items-center justify-center gap-2";
const itemClass = "flex items-center gap-2";
const ellipsisClass = "text-muted";
const linkClass =
  "flex min-h-11 min-w-11 items-center justify-center rounded-md border-2 px-3 font-mono text-sm transition-colors";
/** The page you are on, and every other page. One prop picks between them. */
const linkCurrentClass = "border-primary text-foreground";
const linkOtherClass =
  "border-border-strong text-foreground-2 hover:border-primary hover:text-foreground";

/**
 * The landmark, and nothing else: no class of its own, deliberately. The gap
 * between a pager and whatever it pages is the PAGE's composition, so the outer
 * margin is the caller's `className` rather than a margin this part decides about
 * a sibling it does not own.
 *
 * `aria-label` is destructured rather than spread, so a caller who passes their own
 * wins and one who passes none still gets a named landmark. `||` rather than a
 * default parameter, because a default fires only on `undefined`: measured at
 * layer 1 (LOW-2), `aria-label={labelFromSomewhere || ""}` - an ordinary React
 * shape - otherwise ships an UNNAMED navigation landmark, which is the defect the
 * default is here to prevent.
 */
export function Pagination({ "aria-label": ariaLabel, ...props }: ComponentProps<"nav">) {
  return <nav data-slot="pagination" aria-label={ariaLabel || NAV_LABEL} {...props} />;
}

/** The row of pages. Wraps rather than scrolls: every page stays reachable. */
export function PaginationContent({ className, ...props }: ComponentProps<"ul">) {
  return <ul data-slot="pagination-content" className={cn(contentClass, className)} {...props} />;
}

/** One page's cell. The gap dot, when there is one, goes inside it. */
export function PaginationItem({ className, ...props }: ComponentProps<"li">) {
  return <li data-slot="pagination-item" className={cn(itemClass, className)} {...props} />;
}

/**
 * The mark for a run of pages the window skipped.
 *
 * Shown rather than hidden, so the control reads honestly - and `aria-hidden`,
 * because it is punctuation and every page it stands for is still reachable
 * through the first and last links. The glyph is the default child.
 */
export function PaginationEllipsis({ className, children, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="pagination-ellipsis"
      aria-hidden="true"
      className={cn(ellipsisClass, className)}
      {...props}
    >
      {children ?? ELLIPSIS}
    </span>
  );
}

export type PaginationLinkProps = ComponentProps<"a"> & {
  /**
   * Render the caller's child instead of an `<a>`, keeping the classes and every
   * other prop: the library owns no router, so a consumer's own link composes in.
   */
  asChild?: boolean;
  /**
   * The page you are on: its ink AND its announcement, from one prop.
   *
   * ⚠️ It is written AFTER the caller's props on purpose, so an `aria-current`
   * passed to THIS part cannot land without the ink that belongs with it:
   * the attribute and the border are two halves of one fact.
   *
   * ⚠️ AND THAT IS AS FAR AS IT REACHES, measured at layer 1 rather than assumed:
   * Radix's `Slot` merges the CHILD's props over the slot's, so under `asChild` an
   * `aria-current` written on the child wins and a link can still be announced as
   * current while drawn as any other page. That is `asChild`'s own contract - the
   * caller's element is the caller's - so the rule for a host is: pass `isActive`,
   * and do not also write `aria-current` on the child.
   * `test/nav-consumption.test.tsx` pins both halves.
   */
  isActive?: boolean;
};

export function PaginationLink({
  className,
  asChild = false,
  isActive = false,
  ...props
}: PaginationLinkProps) {
  const classes = cn(linkClass, isActive ? linkCurrentClass : linkOtherClass, className);
  const current = isActive ? "page" : undefined;
  if (asChild) {
    return (
      <Slot data-slot="pagination-link" className={classes} {...props} aria-current={current} />
    );
  }
  return <a data-slot="pagination-link" className={classes} {...props} aria-current={current} />;
}

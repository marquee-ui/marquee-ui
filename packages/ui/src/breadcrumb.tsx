import { Slot } from "@radix-ui/react-slot";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * The trail of where you are, as parts. Every string below already shipped on a
 * real product surface and is MOVED here through the role rename table, not
 * redesigned: the tokens change name, the pixels do not
 * (marquee-ui's `packages/ui/test/fidelity.test.tsx` pins the utility SET of every
 * part against the upstream strings, read with `git show` and never retyped).
 *
 * ⚠️ ONE LINE, ALWAYS, AND THAT IS A TAP-TARGET DECISION RATHER THAN A LOOK.
 * The links carry the 44px floor, and a 44px band over a ~20px line pitch makes
 * the LATER link in the DOM win a tap on the earlier one's own visible text
 * (measured upstream, with `elementFromPoint` rather than with a bounding box,
 * which cannot see it). So the linked steps never shrink and the only flexible
 * item is the current page, which is not a tap target at all.
 *
 * ⚠️ THAT INVARIANT SHIPS AS TWO ITEM PARTS, NOT AS A PROP. `BreadcrumbItem`
 * cannot shrink and `BreadcrumbPageItem` is the one that can, so the step you are
 * standing on is the only thing that may give way and the choice is made by which
 * part a call site reaches for. A `shrinkable` flag would put the decision at
 * every call site instead, where half-applying it is invisible.
 *
 * ⚠️ THE SEPARATOR LIVES INSIDE THE ITEM IT PRECEDES, and that is not shadcn's
 * shape (a sibling `<li role="presentation" aria-hidden>`). Two reasons, one of
 * them measured:
 *   - the upstream row is a flex container with ONE child per step, and the
 *     one-line rule is a tap-target decision expressed as `shrink-0` on those
 *     children. shadcn's shape makes a three-step trail five flex children, two
 *     of which no rule here has ever been measured against;
 *   - the item's own TEXT then carries the glyph, which is what the consumer's
 *     trail-order test reads (it strips a leading `·` off each item). Measured on
 *     this runner: shadcn's hidden sibling leaves the items reading
 *     `["a", "b"]` and this shape leaves them reading `["a", "·b"]` - the strip
 *     exists for the second.
 * ⚠️ AND THE ITEM COUNT IS NOT WHAT CATCHES IT. A separator `<li>` that is
 * `aria-hidden` (shadcn's) or nested inside an item (measured: no `listitem`
 * role at all) is not counted either way, so a test that counts items cannot
 * tell the shapes apart. It is the item's text that can.
 *
 * ⚠️ `min-h-11`, NOT the house's `min-h-hit`. The same 44px either way, and the
 * spelling the consumer's own floor test greps for; the rename table carries no
 * entry for it for exactly that reason.
 *
 * Plain anchors and no state: a trail is server-renderable markup, and
 * `BreadcrumbLink`'s `asChild` is how a consumer's router link wears it.
 */

/** The consumer's own landmark name, and a default a caller can rename. */
const NAV_LABEL = "Breadcrumb";
/** The house glyph between steps. Punctuation, so it is a slot and not an icon. */
const SEPARATOR = "·";

const listClass = "flex items-center text-sm text-foreground-2";
/** A step that is a link: the tap target, and it cannot be squeezed. */
const itemClass = "flex shrink-0 items-center";
/** The step you are standing on: the only item allowed to give way. */
const pageItemClass = "flex min-w-0 items-center";
const separatorClass = "px-2 text-muted";
const linkClass =
  "inline-flex min-h-11 items-center underline underline-offset-2 hover:text-foreground";
const pageClass = "truncate text-foreground";

/**
 * The landmark. A caller who passes their own `aria-label` wins and one who passes
 * none still gets a NAMED landmark; the name is a contract a consumer's tests
 * resolve by, and the default is the one its markup already used.
 *
 * `||` rather than a default parameter, because a default fires only on
 * `undefined`: measured at layer 1 (LOW-2), `aria-label={value || ""}` otherwise
 * ships an UNNAMED navigation landmark, which is the defect the default prevents.
 *
 * No class of its own: the nav is the landmark, and an empty `class=""` on every
 * consumer's trail would be a lie about the element.
 */
export function Breadcrumb({ "aria-label": ariaLabel, ...props }: ComponentProps<"nav">) {
  return <nav data-slot="breadcrumb" aria-label={ariaLabel || NAV_LABEL} {...props} />;
}

/** The trail itself. `ol`, because the order of a trail IS its meaning. */
export function BreadcrumbList({ className, ...props }: ComponentProps<"ol">) {
  return <ol data-slot="breadcrumb-list" className={cn(listClass, className)} {...props} />;
}

/** A step that points somewhere else. Unshrinkable, so its tap band is its own. */
export function BreadcrumbItem({ className, ...props }: ComponentProps<"li">) {
  return <li data-slot="breadcrumb-item" className={cn(itemClass, className)} {...props} />;
}

/**
 * The step you are standing on.
 *
 * `min-w-0` is on the ITEM and not on the page inside it, and that is load-bearing
 * rather than tidy: a flex item's automatic minimum size is its content, so
 * without this the row would rather overflow than let the name truncate.
 */
export function BreadcrumbPageItem({ className, ...props }: ComponentProps<"li">) {
  return (
    <li data-slot="breadcrumb-page-item" className={cn(pageItemClass, className)} {...props} />
  );
}

/**
 * The punctuation between two steps, inside the item it precedes.
 *
 * `aria-hidden` because it is punctuation: a screen reader announces the list, and
 * a middot read aloud between every step is noise. The glyph is the default child,
 * so a consumer with another house style passes its own.
 */
export function BreadcrumbSeparator({ className, children, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-separator"
      aria-hidden="true"
      className={cn(separatorClass, className)}
      {...props}
    >
      {children ?? SEPARATOR}
    </span>
  );
}

export type BreadcrumbLinkProps = ComponentProps<"a"> & {
  /**
   * Render the caller's child instead of an `<a>`, keeping the classes and every
   * other prop. This is how a router's link wears a step: the library owns no
   * router, so the consumer's own `Link` composes in without the part knowing it.
   *
   * ⚠️ Radix's `Slot` merges the CHILD's props over this part's, measured, so an
   * attribute written on the child wins over the same one passed here. Write each
   * of them in one place.
   */
  asChild?: boolean;
};

export function BreadcrumbLink({ className, asChild = false, ...props }: BreadcrumbLinkProps) {
  const classes = cn(linkClass, className);
  if (asChild) return <Slot data-slot="breadcrumb-link" className={classes} {...props} />;
  return <a data-slot="breadcrumb-link" className={classes} {...props} />;
}

/**
 * The current step's name. `aria-current="page"` rather than a link to itself,
 * which is the one step of a trail a reader is already standing on.
 */
export function BreadcrumbPage({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      aria-current="page"
      className={cn(pageClass, className)}
      {...props}
    />
  );
}

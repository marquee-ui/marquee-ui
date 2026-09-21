import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * A face: a circular image with an optional corner mark, as parts.
 *
 * ⚠️ **IT DECLARES NO SIZE, AND THAT IS THE MEASUREMENT RATHER THAN AN OMISSION.**
 * The consuming product draws ELEVEN faces and they are SEVEN different boxes -
 * 26, 28, 34, 36, 56, 64, 96 - with two of the pairs two pixels apart (26/28 from
 * two components that say so in their own docblocks, 34/36 from a strip and a top
 * bar). A `cva` with seven arbitrary values is not a visual axis, it is one
 * product's measurements wearing a `size` prop, and `DescriptionList` already
 * refused the same shape for the same reason ("eight product sites, eight
 * layouts"). So the caller sizes `<Avatar>` and the image FILLS it.
 *
 * ⚠️ **AND THAT IS ALSO WHY THERE IS ONE SHAPE AND NOT TWO.** The component this
 * family is lifted from sizes the `<img>` itself when there is no mark and the
 * WRAPPER when there is, and that fork shipped a real bug: the keyed branch
 * emitted `h-16 w-16 shrink-0 h-full w-full` on one element, same specificity,
 * `h-full` later in the sheet, so every uploaded and every picked face was sized
 * by its container instead of by its prop - invisible to a `toContain` assertion,
 * to an e2e that read only `src`, and to a screenshot suite whose fixtures never
 * take that branch. Here the root always carries the box and the image is always
 * `h-full w-full`, so the fork does not exist to get wrong.
 *
 * ⚠️ **THE MARK'S TYPE COMES THROUGH A CUSTOM PROPERTY, NOT A PROP**, and the
 * reason is the CONSUMER's `cn`: the reference consumer's is a plain JOIN rather
 * than a tailwind-merge (a declared exclusion from this registry, and its own
 * docblock says so: "a caller's `className` does NOT beat a variant's"). So
 * `className="text-[0.36rem]"` over a part that already declares a `text-*`
 * leaves BOTH on the element with the stylesheet's order picking the winner. A
 * `var()` cannot be fought that way: the part reads
 * `--avatar-mark-size`, the caller sets it, and there is one declaration on the
 * element either way. Its default, `20cqw`, is 20% of the face's own width -
 * which is why the root opens a container - so a mark is legible at 26px and at
 * 96px with the caller saying nothing at all.
 *
 * ⚠️ **NO RADIX, AND IT WAS PROBED RATHER THAN RECALLED.**
 * `@radix-ui/react-avatar@1.2.6` under `react@19.3.0`
 * (`$BATCH_SCRATCH/s2/radix-probe/probe.mjs`): `renderToString` of
 * `<Root><Image src alt/><Fallback>N</Fallback></Root>` emits
 * `<span class="root"><span class="fb">N</span></span>` - **no `<img>` at all** -
 * and after mount, with the image not yet loaded, the DOM still holds zero
 * `<img>` elements. Its `Image` is a load-status state machine that paints
 * nothing until the browser has the bytes. Nine of the eleven faces in the
 * consuming product are on SERVER-rendered pages whose HTML is what a crawler and
 * a screenshot suite read, and that product's fallback is at the DATA layer (a
 * face key computed from the handle, so there is always a URL and never a
 * loading state to model). Adopting it would ship a letter on a circle to the
 * server - exactly the placeholder that product retired by decision - and add a
 * dependency whose dist opens `"use client"`. This family is a native `<img>`.
 *
 * THE SHAPE:
 *
 *   <Avatar className="h-14 w-14">
 *     <AvatarImage src={faceUrl} />
 *     <AvatarBadge className="font-mono font-bold uppercase text-primary-ink">N</AvatarBadge>
 *   </Avatar>
 */

function refuseAsChild(props: object, part: string, element: string, why: string): void {
  if ("asChild" in props && (props as { asChild?: unknown }).asChild !== undefined) {
    throw new Error(
      `<${part}> does not take "asChild": it is a <${element}>, and ${why} React drops an ` +
        `unknown prop silently, so this is a throw rather than a no-op.`,
    );
  }
}

export type AvatarProps = ComponentProps<"span"> & {
  /**
   * Render the caller's own element - a link, a button - keeping the box, the
   * positioning context and every other prop. A face that IS a link owes
   * `min-h-hit` from the caller, exactly as `Badge`'s does: this package's floor
   * guard resolves every `a[href]` a story renders against the compiled sheet
   * and demands 44px, and the story is what gets copied.
   */
  asChild?: boolean;
};

/**
 * The box, the positioning context for the mark, and the container the mark's
 * type is measured against. It declares no width or height of its own: see the
 * family docblock.
 *
 * `@container` is `container-type: inline-size`, whose layout containment is a
 * no-op HERE and would not be in general - an element whose inline size is
 * decided by its contents would stop being. This one's contents are an image at
 * `h-full w-full`, so a root with no box of its own is already drawing nothing,
 * and the story and the drawing test both say so.
 */
export function Avatar({ className, asChild = false, ...props }: AvatarProps) {
  const Host = asChild ? Slot : "span";
  return (
    <Host
      data-slot="avatar"
      className={cn("relative inline-flex shrink-0 @container", className)}
      {...props}
    />
  );
}

/**
 * The edge, and the only visual axis the measurement supports.
 *
 * Three values, one measured site each, rather than a number: ten of the eleven
 * faces draw the house's 2px line; the smallest (26px, in a byline) draws 1px and
 * its own docblock calls the proportion "the design, not an accident"; and one
 * (a top bar's, inside a gradient ring of its own) draws none. A `border-*`
 * passed through `className` could not express any of them - two border widths on
 * one element is the plain-join trap the family docblock describes - so the axis
 * is where a caller can actually reach it.
 */
export const avatarImageVariants = cva("h-full w-full rounded-full bg-surface object-cover", {
  variants: {
    edge: {
      default: "border-2 border-border-strong",
      thin: "border border-border-strong",
      none: "",
    },
  },
  defaultVariants: { edge: "default" },
});

export type AvatarImageProps = Omit<ComponentProps<"img">, "src"> &
  VariantProps<typeof avatarImageVariants> & {
    /**
     * Required, and a TYPE rather than a throw: an `<img>` with no `src` draws
     * the browser's broken-image glyph, which is loud. This package throws for
     * the misuse whose failure is QUIET - an invalid `<dl>`, a radio with no
     * group - and not for the kind you can see.
     */
    src: string;
  };

/**
 * The face itself.
 *
 * `alt` defaults to `""` and stays the caller's. Empty is right at every site
 * measured - a handle is adjacent text in all eleven - and it is a DEFAULT rather
 * than a fixed value because a face with no name beside it is a real composition
 * and would then be unnameable.
 *
 * `bg-surface` under the image is not decoration: a drawn face with a transparent
 * background (every generated set the reference product uses) otherwise sits on
 * whatever is behind the root, so the same member had two different faces
 * depending on which component drew them.
 */
export function AvatarImage({ className, edge, alt = "", ...props }: AvatarImageProps) {
  refuseAsChild(
    props,
    "AvatarImage",
    "img",
    "a void element has no child to give its props to - `asChild` here renders the " +
      "caller's element and NO image at all.",
  );
  return (
    <img
      data-slot="avatar-image"
      alt={alt}
      className={cn(avatarImageVariants({ edge }), className)}
      {...props}
    />
  );
}

export type AvatarBadgeProps = ComponentProps<"span">;

/**
 * The corner mark: a status dot, an initial, a count. WHAT it says is the
 * caller's; that it is a circle on the face's rim at 4:30, cut out of the face by
 * its own edge, is this part's.
 *
 * ⚠️ It is `aria-hidden`, written AFTER the caller's props so it cannot be turned
 * off - `RadioGroupInput`'s `name` is placed the same way and for the same
 * reason - because a mark on a decorative face
 * is decoration by construction: it repeats something already written beside the
 * face (an initial), or it is a state a control must announce for itself (a
 * status dot on an avatar announces nothing to anyone who cannot see it). A real
 * announcement goes in text next to the avatar, where a screen reader reaches it
 * in reading order rather than as a stray letter.
 *
 * ⚠️ It is NOT `Badge` with a rounded corner. `Badge` is a micro-caps status token
 * with a tap-floor note and a tone axis; this is a ~40%-of-a-circle mark with no
 * type of its own. Two shapes, two parts.
 *
 * `h-2/5` and the -4% offsets are one tuned pair, measured from the reference
 * product's own design gate: a 40% mark offset 4% past the rim sits centred on
 * it. A different mark geometry is a different composition, and the root is
 * `relative` so a caller can write one.
 */
export function AvatarBadge({ className, ...props }: AvatarBadgeProps) {
  refuseAsChild(
    props,
    "AvatarBadge",
    "span",
    "its position, its size and its `aria-hidden` are the whole part - an element " +
      "of the caller's in its place is a child of <Avatar>, which is already `relative`.",
  );
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "absolute -right-[4%] -bottom-[4%] grid h-2/5 w-2/5 place-items-center rounded-full " +
          "border-2 border-border-strong bg-surface leading-none " +
          "text-[length:var(--avatar-mark-size,20cqw)]",
        className,
      )}
      {...props}
      aria-hidden="true"
    />
  );
}

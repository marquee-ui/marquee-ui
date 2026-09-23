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
 * leaves BOTH on the element with the stylesheet's order picking the winner. The
 * `var()` is the route AROUND that, not an immunity to it: a caller who moves the
 * VALUE writes one declaration and has nothing to fight, and a caller who writes
 * a second `text-*` anyway is back in the same trap. Its default is `17cqw` -
 * 17% of the face's own width, which is why the root opens a container - and that
 * number is the MEDIAN of the five sizes the reference product's own design gate
 * drew (0.206, 0.198, 0.171, 0.170, 0.158 of the face, smallest face first). It
 * is a median and not a rule: the ratio that product chose FALLS as the face
 * grows, which no single number reproduces, so every site that cares sets the
 * var. What the default buys is a mark that is proportional rather than
 * inherited at a size nobody picked.
 *
 * ⚠️ **NO RADIX, AND IT WAS PROBED RATHER THAN RECALLED.**
 * `@radix-ui/react-avatar@1.2.6` under `react@19.3.0`: `renderToString` of
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
 * `@container` is `container-type: inline-size`, and it has a CONSEQUENCE rather
 * than none (layer 1, MED-1: the first edition of this note called it a no-op and
 * said the drawing test proved it, and neither was true). Containment means the
 * root's inline size stops reading its contents, so a root the caller never sized
 * collapses to zero instead of falling back to the image's intrinsic width. That
 * is not a regression this family introduces - an unsized root is already drawing
 * an image at `h-full w-full` of nothing - but it does make the mistake SILENT
 * rather than merely wrong, and nothing here can catch it: jsdom lays nothing out
 * and this package has no browser runner. So it is the caller's contract, said
 * out loud: **`<Avatar>` owes a box.** Every story carries one.
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
 * The edge and the ground: the two visual axes the measurement supports.
 *
 * **`edge`.** Three values, one measured site each, rather than a number: ten of
 * the eleven faces draw the house's 2px line; the smallest (26px, in a byline)
 * draws 1px and its own docblock calls the proportion "the design, not an
 * accident"; and one (a top bar's, inside a gradient ring of its own) draws none.
 * A `border-*` passed through `className` could not express any of them - two
 * border widths on one element is the plain-join trap the family docblock
 * describes - so the axis is where a caller can actually reach it.
 *
 * **`ground`, and it is here because the base HAD it and that was the bug.**
 * `bg-surface` was hard-coded in this base, where a `className` cannot displace
 * it under a plain join, so the reference consumer - whose every face is a drawn
 * SVG with no background of its own, sitting on a card that is itself `--surface`
 * - wrote `backgroundColor: var(--raised)` as an inline DECLARATION on all eleven
 * of them, and said so in its own docblock: "a `bg-raised` CLASS loses
 * (`.bg-surface` is emitted after `.bg-raised`, measured), so it is a declaration
 * until the library grows a `ground` axis". This is that axis. Two values, two
 * measured grounds, the role contract's own names; `surface` is the default, so
 * the move changes no existing drawing.
 *
 * Why an axis rather than the custom-property seam `--avatar-mark-size` is: a
 * seam is what the MARK'S TYPE needs, because its five values are a curve nobody
 * can name. A ground is a role, the contract has five of them, and a caller
 * picking one by name is exactly what `cva` is for.
 */
export const avatarImageVariants = cva("h-full w-full rounded-full object-cover", {
  variants: {
    edge: {
      default: "border-2 border-border-strong",
      thin: "border border-border-strong",
      none: "",
    },
    ground: {
      surface: "bg-surface",
      raised: "bg-raised",
    },
  },
  defaultVariants: { edge: "default", ground: "surface" },
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
 * A ground under the image is not decoration, which is why there is always one
 * and the axis picks WHICH: a drawn face with a transparent background (every
 * generated set the reference product uses) otherwise sits on whatever is behind
 * the root, so the same member had two different faces depending on which
 * component drew them.
 */
export function AvatarImage({ className, edge, ground, alt = "", ...props }: AvatarImageProps) {
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
      className={cn(avatarImageVariants({ edge, ground }), className)}
      {...props}
    />
  );
}

/**
 * The mark's edge, and the reason it is an axis on a second `cva` rather than the
 * image's.
 *
 * TWO values, not the image's three, because two is what the mark's own sites
 * measure: three of the reference product's five mark sizes take the house's 2px,
 * and the two smallest faces (28 and 34, whose mark is a circle of 11.2 and
 * 13.6px - the mark is 40% of the face) take 1.5px, because at 2px the ring eats
 * the letter. There is no measured site with no edge at all: the edge is what
 * CUTS the mark out of the face it overhangs, so `none` would be a value nobody
 * has drawn.
 *
 * ⚠️ **1.5px IS NOT `AvatarImage`'s `thin`, WHICH IS 1px, AND THE TWO NAMES
 * MEANING TWO NUMBERS IS THE DECISION RATHER THAN AN OVERSIGHT.** `thin` means
 * "the small-face treatment" on each part, and the parts are at different scales:
 * a 26px face wearing 1px and an ~11px mark wearing 1.5px are the two
 * measurements, taken from two elements, and one shared number would be a number
 * neither site drew. marquee-ui's `packages/ui/test/avatar-drawing.test.tsx`
 * asserts both widths in ONE arm so the asymmetry is met rather than discovered.
 *
 * ⚠️ **A NON-INTEGER WIDTH IS A THING THIS PACKAGE CANNOT MEASURE.** How 1.5px
 * lands on a device pixel is the browser's, and on a `rounded-full` element it is
 * anti-aliased rather than snapped; jsdom lays nothing out and this package has
 * no browser runner, so the claim here is the DECLARED width and nothing about
 * what a screen does with it. The alternative - refusing the non-integer and
 * shipping 1px - was considered and refused for one reason: it would move a
 * drawing the consuming product measured, and the request this axis answers is
 * for the product to be able to DELETE its inline declaration, not to redraw.
 */
export const avatarBadgeVariants = cva(
  // ⚠️ `leading-none` COMES AFTER THE FONT SIZE, AND THAT IS NOT A STYLE
  // CHOICE. This package's own `cn` is a real tailwind-merge, and
  // tailwind-merge's `font-size` group CONFLICTS with `leading` - because
  // `text-sm` sets a line-height too - so a `text-*` written after
  // `leading-none` DELETES it. Written the other way round the shipped
  // element carried no line-height at all and nothing said so: layer 1's
  // M16 deleted `leading-none` from this string and the suite stayed
  // GREEN, which is how the class was found to have never been on the
  // element. Measured with this package's own `cn`, not reasoned.
  "absolute -right-[4%] -bottom-[4%] grid h-2/5 w-2/5 place-items-center rounded-full " +
    "border-border-strong bg-surface " +
    "text-[length:var(--avatar-mark-size,17cqw)] leading-none",
  {
    variants: {
      edge: {
        default: "border-2",
        thin: "border-[1.5px]",
      },
    },
    defaultVariants: { edge: "default" },
  },
);

export type AvatarBadgeProps = ComponentProps<"span"> & VariantProps<typeof avatarBadgeVariants>;

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
export function AvatarBadge({ className, edge, ...props }: AvatarBadgeProps) {
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
      className={cn(avatarBadgeVariants({ edge }), className)}
      {...props}
      aria-hidden="true"
    />
  );
}

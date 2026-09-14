import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import "./ribbon.css";

/**
 * The house band: a tilted strip of claims scrolling across the top of a page,
 * under whatever floats above it.
 *
 * **Geometry.** Absolutely positioned, so the caller only has to be `relative`.
 * `w-[110vw]` centred on the content column overshoots the viewport at every
 * breakpoint, and the page shell's `overflow-x-clip` swallows the overhang so it
 * cannot cause horizontal scroll. The -3 degree tilt raises the band's right end
 * by sin(3)x50vw = 2.62vw, so a 2.62vw-growing top offset cancels it and the
 * right edge sits at a constant ~64px at every width.
 *
 * **Recipe.** The band clips its own track; two identical halves animate
 * `translateX(0 -> -50%)`, which advances by exactly one half and so loops with
 * no seam. Em-spaces (U+2003) around the separator do not collapse the way ASCII
 * spaces do, and each token ENDS with the separator so the spacing at the loop
 * seam matches the spacing inside the track. The half repeats well past the
 * widest viewport so the band never runs out of text before the reset.
 *
 * **Pace.** The duration scales with the track, holding ~45px/s at ~10px/char.
 *
 * NOT parts, and that is the one deliberate exception to D6 in this package: the
 * seamless loop is the invariant "the two halves are identical", and a children
 * slot is precisely the way to break it. What composes instead is the CONTENT -
 * `items` and `separator`.
 */

/** Characters per second, tuned to ~45px/s at the display face's ~10px/char. */
const CHARS_PER_SECOND = 4.5;

/**
 * Em-spaces (U+2003), not ASCII spaces: a run of ASCII spaces collapses in HTML,
 * so the gap either side of the glyph would vanish and the loop seam would read
 * tighter than the interior. Written as escapes because an invisible character in
 * source is one nobody reviews.
 */
const DEFAULT_SEPARATOR = "\u2003\u2726\u2003";

/** Enough halves to outrun the widest viewport before the -50% reset. */
const MIN_HALF_CHARS = 600;

export type RibbonProps = Omit<ComponentProps<"div">, "children"> & {
  readonly items: readonly string[];
  /** Between items and after the last one, so the seam matches the interior. */
  readonly separator?: string;
};

export function Ribbon({ items, separator = DEFAULT_SEPARATOR, className, ...props }: RibbonProps) {
  const token = items.join(separator) + separator;
  // An empty band has no track to repeat and would divide by zero below. Rendering
  // nothing is the honest answer: a caller with no claims has no ribbon.
  if (items.length === 0 || token.length === 0) return null;

  const half = token.repeat(Math.max(2, Math.ceil(MIN_HALF_CHARS / token.length)));
  const duration = `${Math.round(half.length / CHARS_PER_SECOND)}s`;

  return (
    <div
      data-slot="ribbon"
      className={cn(
        "pointer-events-none absolute left-1/2 top-[calc(64px+2.62vw)] z-[4] w-[110vw] -translate-x-1/2",
        className,
      )}
      {...props}
    >
      <div data-slot="ribbon-band" className="-rotate-3 overflow-hidden bg-brand shadow-band">
        <div
          aria-hidden="true"
          data-slot="ribbon-track"
          className="mq-marquee py-1.5 font-display text-sm text-brand-foreground"
          style={{ animationDuration: duration }}
        >
          <span className="shrink-0">{half}</span>
          <span className="shrink-0">{half}</span>
        </div>
      </div>
    </div>
  );
}

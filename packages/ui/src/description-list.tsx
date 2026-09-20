import { cva, type VariantProps } from "class-variance-authority";
import { Children, Fragment, createContext, isValidElement, useContext } from "react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The term/detail cell: a figure with a label over or beside it, as a real
 * `<dl>`.
 *
 * ⚠️ **THIS FAMILY IS THE CONTENT MODEL, NOT A LOOK.** HTML's `dl` takes one of
 * TWO shapes and they may not be mixed: either `dt`/`dd` groups directly, or
 * `<div>` wrappers each holding one group. Every one of the eight hand-written
 * `<dl>`s in the consuming product (read at `f8385c6d`) uses the `<div>` form -
 * 8 of 8 - and one of them records paying for getting it wrong: the profile
 * ledger's docblock says "a `div` inside a `dl` may hold only `dt`/`dd`, so an
 * anchor as its third child is a real WCAG 1.3.1 failure (axe
 * `definition-list`) - which is exactly what `e2e/profile.spec.ts` reported when
 * the four-cell version of this was first written the other way." The parts
 * below make that composition the only one available.
 *
 * ⚠️ **AND THAT IS WHY THERE IS NO `asChild` ANYWHERE.** All four elements are
 * fixed by the content model: the list is a `dl`, the group is a `div`, the term
 * is a `dt`, the detail is a `dd`. `<DescriptionDetails asChild>` around a link
 * is the one composition that looks obviously useful and is precisely the axe
 * failure above - the link belongs INSIDE the `dd`, which is what the ledger
 * does and what the `LinkedFigure` story shows. Both parts refuse `asChild`
 * rather than letting it through to a DOM attribute.
 *
 * The one thing a caller ALWAYS owns is the list's layout, because the product
 * has eight and no two agree: a 2-column grid with gridlines drawn by `gap-px`
 * over a coloured backdrop (`game/[slug]:757`), a 3-column grid with a border
 * per cell (`MemberRow:171`), a 10-column grid at `gap-[2px]`
 * (`Ledger:223`), two 2-column grids (`reckoning:201`, `ImportPreview:214`), two
 * flex columns at `gap-2` and `gap-4` (`ScoreBlock:227`, `transparency:460`) and
 * one bare block (`admin/reports:85`). A `cva` with eight values is not an axis.
 *
 * ⚠️ The `dd`'s UA `margin-inline-start: 40px` is Tailwind's PREFLIGHT to zero,
 * not this family's: `@import "tailwindcss"` resets margin on every element.
 * That is the same bet `BreadcrumbList` and `PaginationContent` already make -
 * neither carries `list-none` or `p-0` - so it is the package's posture rather
 * than a new one. A consumer who compiles Tailwind with preflight off owes all
 * three parts a reset.
 */

type ListMarker = { readonly inList: true };
type ItemMarker = { readonly inItem: true };

const DescriptionListContext = createContext<ListMarker | null>(null);
const DescriptionItemContext = createContext<ItemMarker | null>(null);

/**
 * A part outside its parent throws, rather than rendering something that looks
 * right. The quiet version is an invalid `dl` - which is the state this family
 * exists to replace, and it looks entirely normal on screen. `Form`'s decision
 * 11, same reasoning.
 */
function requireContext(marker: unknown, part: string, parent: string): void {
  if (marker === null) {
    throw new Error(`<${part}> must be rendered inside a <${parent}>.`);
  }
}

/**
 * Every element child, with FRAGMENTS descended into and nothing else.
 *
 * ⚠️ The distinction is the content model's, not a convenience: a fragment renders
 * NO element, so `<><DescriptionTerm/><DescriptionDetails/></>` is a valid group
 * and has to be read through; any real element between the group and its `dt`/`dd`
 * is invalid, so it has to be refused rather than descended. `Form`'s walk
 * descends both, which is right there and would be wrong here.
 *
 * ⚠️ AND `Children.toArray` DOES NOT DO THIS. Measured, on React 19.3.0: it
 * flattens arrays and drops falsy children, and keeps a fragment as one element
 * whose type is the fragment symbol. The first draft of this family relied on it
 * flattening fragments and refused a legal group; the test named
 * "counts through a fragment" is what found it.
 */
type ElementChild = { type: unknown; props: { children?: ReactNode } };
type Walked = { elements: ElementChild[]; text: string[] };

/**
 * ⚠️ IT SURFACES TEXT, AND THAT IS LAYER 1's HIGH-1. The first draft skipped every
 * non-element child, so neither guard below could see a string or a number, and
 * `{count && <DescriptionDetails>{count}</DescriptionDetails>}` with `count === 0`
 * put a literal `0` text node beside the pair - which axe-core 4.12.1 reports as
 * `definition-list`, impact `serious`, WCAG 1.3.1
 * (`invalid-children-evaluate`: `if (nodeType === 3 && nodeValue.trim() !== '')`).
 * The most ordinary React conditional there is, producing the exact violation this
 * family exists to stop. Whitespace-only text stays legal because JSX emits it.
 */
function walkChildren(children: ReactNode, out: Walked): void {
  for (const child of Children.toArray(children)) {
    if (typeof child === "string" || typeof child === "number") {
      const value = String(child);
      if (value.trim() !== "") out.text.push(value);
      continue;
    }
    if (!isValidElement<{ children?: ReactNode }>(child)) continue;
    if (child.type === Fragment) {
      walkChildren(child.props.children, out);
      continue;
    }
    out.elements.push(child);
  }
}

function walked(children: ReactNode): Walked {
  const out: Walked = { elements: [], text: [] };
  walkChildren(children, out);
  return out;
}

/**
 * `asChild` cannot be legal on an element the content model fixes - which is all
 * four of them, so all four call this. It was two of four at `41f243a6` while the
 * docblock above, decision 2 and a describe block all said four (layer 1, MED-2),
 * and React 19 drops an unknown prop silently, so there was not even a stray
 * attribute to notice.
 */
function refuseAsChild(props: object, part: string, element: string): void {
  if ("asChild" in props && (props as { asChild?: unknown }).asChild !== undefined) {
    throw new Error(
      `<${part}> does not take "asChild": HTML's dl content model fixes it as <${element}>, and a ` +
        `link or span in its place is the axe "definition-list" failure this family exists to ` +
        `stop. Put the element INSIDE <DescriptionDetails> instead.`,
    );
  }
}

/**
 * ⚠️ A `role` on the term or the detail is refused, and layer 1's MED-1 is why it
 * is refused rather than observed. `role="presentation"` leaves the DOM shape
 * reading `DT,DD` - so a structural assertion, including the consuming product's
 * own `expect([...cell.children].map((c) => c.tagName)).toEqual(["DT","DD"])`,
 * still passes - while the computed `term` / `definition` roles are gone and axe's
 * `only-dlitems` check reports it (`validRoles: ['definition','term','listitem']`).
 * A guard nothing structural can see has to be a refusal.
 *
 * It is NOT refused on the list or the item: `aria-live` belongs on the list (the
 * consuming product puts it there) and neither element's role carries the
 * association.
 */
function refuseRole(props: object, part: string, element: string): void {
  if ("role" in props && (props as { role?: unknown }).role !== undefined) {
    throw new Error(
      `<${part}> does not take "role": the <${element}> element is what associates a term with its ` +
        `detail, and any role replaces that association while leaving the DOM looking correct. ` +
        `Use aria-* on the part, or a role on <DescriptionList>.`,
    );
  }
}

/**
 * The group's arrangement, and the ONE visual axis the measurement supports.
 *
 * `stack` is 6 of the 8 sites (the term over its detail). Two of the six write
 * `flex flex-col gap-1` and the other four get the same result from block flow,
 * so the flex spelling is the one that is stated rather than inherited.
 * `gap-1` is the 4px grid `AGENTS.md` names as skeleton, and `FormItem` took the
 * same value against the same off-grid alternative.
 *
 * `inline` is the other 2 (`ScoreBlock:87`, the `RawFigure` wrapper, is
 * `flex flex-wrap items-baseline gap-x-2 gap-y-0.5`; `admin/reports:87` is
 * `flex gap-2 break-words`; the `<dl>`s themselves open at `:227` and `:85`). `items-baseline` comes from the first, where a
 * micro-caps label sits beside a display figure and the baselines are the whole
 * point; `flex-wrap` likewise. The gap is `gap-2`: the two sites agree on 8px
 * across, and the 2px down is off the 4px grid, so the skeleton breaks that tie
 * exactly as it broke `FormItem`'s.
 *
 * It is a `cva` rather than two class strings a caller appends, and the reason
 * is the CONSUMER's `cn`: the reference consumer's is a plain JOIN, not a
 * tailwind-merge (its
 * `lib/utils.ts` is a declared exclusion from this registry), so
 * `className="flex-row"` over a part that already says `flex-col` leaves both on
 * the element with the stylesheet's order picking the winner. That trap is
 * recorded twice in the consuming product (`micro-label.ts`, `MemberRow.tsx:80`)
 * and it has shipped a wrong colour once. Mutually exclusive strings cannot do
 * it.
 */
export const descriptionItemVariants = cva("", {
  variants: {
    layout: {
      stack: "flex flex-col gap-1",
      inline: "flex flex-wrap items-baseline gap-2",
    },
  },
  defaultVariants: { layout: "stack" },
});

/**
 * The term's type treatment.
 *
 * `micro` is the mono micro-caps label, and it is the DEFAULT here - unlike
 * `Label`, where it is opt-in - because 6 of the 8 sites draw their `dt` that
 * way. It is NOT `labelVariants({ tone: "micro" })`, and both reasons are
 * measured:
 *
 *  1. **The ink is different.** `Label`'s `micro` ends `text-foreground-2`;
 *     5 of the 6 micro-caps terms are `text-muted` (the 6th,
 *     `reckoning:109`, is the one that reuses the product's own copy of
 *     `labelVariants.micro`). Composing `Label` would be wrong at five sites and
 *     the caller would override the ink at each, which is the two-`text-*`-on-one-
 *     element trap above.
 *  2. **`Label` is a client module.** It wraps `@radix-ui/react-label`, whose
 *     dist opens `"use client"` (checked, 2.1.15) - and 7 of the 8 `<dl>` sites
 *     are server components. A static cell should not buy a client boundary for
 *     four utilities.
 *
 * The tracking is `tracking-label`, the house's own named token (0.12em), and
 * that is a TIE-BREAK rather than a majority: the five micro-caps terms spell
 * five different values (`tracking-wide` twice, `tracking-[0.14em]` twice,
 * `tracking-label` once, plus the ledger's three measured per-breakpoint
 * values). `tracking-label` is the only one of them that is a NAME, and
 * `--tracking-label` exists for exactly this treatment (`Badge` already uses
 * it). `text-3xs` is the majority of the same set.
 *
 * `plain` declares NOTHING, deliberately. The two non-micro terms disagree with
 * each other (`transparency:461` is a prose title at
 * `text-reading font-semibold text-foreground`, `admin/reports:86` is a bare
 * `text-muted`), so there is no second treatment to name - and an empty variant
 * lets each pass its own single `text-*` with nothing to fight.
 */
export const descriptionTermVariants = cva("", {
  variants: {
    tone: {
      micro: "font-mono text-3xs uppercase tracking-label text-muted",
      plain: "",
    },
  },
  defaultVariants: { tone: "micro" },
});

export type DescriptionListProps = ComponentProps<"dl">;

/**
 * The `<dl>`. It decides no layout, and it refuses the one child that is
 * knowably wrong: a bare `dt` or `dd`.
 *
 * Mixing the two content-model forms in one list is invalid, and this family
 * only offers the `<div>` form, so a `dt` or `dd` straight inside the list is
 * always the mixing error. Anything else is NOT refused here, and that is
 * deliberate: three of the eight product sites factor a group into a component
 * (`Ledger`'s `Cell`, `ScoreBlock`'s `RawFigure`, `reckoning`'s `Fact`), and a
 * component is not an element - refusing an unrecognised child type would reject
 * all three while proving nothing. What those components render is checked where
 * it can be: inside `<DescriptionItem>`.
 */
export function DescriptionList({ className, children, ...props }: DescriptionListProps) {
  refuseAsChild(props, "DescriptionList", "dl");
  const { elements, text } = walked(children);
  if (text.length > 0) {
    throw new Error(
      `<DescriptionList> holds text of its own (${JSON.stringify(text[0])}): a dl's children are ` +
        `its groups, and a text node between them is an axe "definition-list" failure. Put the ` +
        `text inside a <DescriptionDetails>.`,
    );
  }
  for (const child of elements) {
    if (child.type === "dt" || child.type === "dd") {
      // ⚠️ The message says what was CHECKED, not what was inferred (layer 1,
      // LOW-2): this fires on a bare `dt`/`dd` here whether or not the list also
      // holds a wrapper, because this family only draws the wrapper form, so the
      // bare form is never the one it is building. And the check is bounded -
      // a COMPONENT at this level that returns a bare pair is genuinely mixed and
      // genuinely invalid, and is not caught; decision 11 records why walking
      // component output is refused, and axe cannot see that case either.
      throw new Error(
        `<DescriptionList> holds a bare <${child.type}>: this family draws the <div>-wrapper form ` +
          `of a dl's group, and the two forms may not be mixed in one list. Wrap the pair in ` +
          `<DescriptionItem>.`,
      );
    }
  }
  return (
    <DescriptionListContext.Provider value={{ inList: true }}>
      <dl data-slot="description-list" className={className} {...props}>
        {children}
      </dl>
    </DescriptionListContext.Provider>
  );
}

export type DescriptionItemProps = ComponentProps<"div"> &
  VariantProps<typeof descriptionItemVariants>;

/**
 * One group: the `<div>` that may hold only a term and its detail.
 *
 * It refuses any other child, and THAT is the family's central guard. The child
 * it exists to refuse is a component, not an element - the ledger's bug was a
 * `<Link>` as the group's third child - so the check is by part identity and not
 * by element type. A part's own children are content and are not walked, which
 * is what leaves a link free to live inside the `dd`.
 *
 * It also holds the content model's ORDER (every term before every detail) and
 * its arity floor (at least one of each), because a group with no `dd` is as
 * invalid as one with a stray `<a>` and looks just as normal.
 */
export function DescriptionItem({ className, layout, children, ...props }: DescriptionItemProps) {
  requireContext(useContext(DescriptionListContext), "DescriptionItem", "DescriptionList");
  refuseAsChild(props, "DescriptionItem", "div");

  const { elements, text } = walked(children);
  if (text.length > 0) {
    throw new Error(
      `<DescriptionItem> holds text of its own (${JSON.stringify(text[0])}): a dl group holds a ` +
        `term and its detail, and a text node beside them is an axe "definition-list" failure. ` +
        `Put the text inside <DescriptionDetails>. If it came from ` +
        `{count && <DescriptionDetails>…}, the guard rendered the NUMBER: use {count !== 0 && …}.`,
    );
  }
  let terms = 0;
  let details = 0;
  for (const child of elements) {
    // The content model admits script-supporting elements in a group as well as in
    // the list itself - "… optionally intermixed with script-supporting elements" -
    // and axe skips them, because they are not exposed to a screen reader
    // (layer 1, LOW-3: the first draft threw and its message named a failure that
    // does not apply to these two).
    if (child.type === "script" || child.type === "template") continue;
    if (child.type === DescriptionTerm) {
      if (details > 0) {
        throw new Error(
          "<DescriptionItem> puts a <DescriptionTerm> after a <DescriptionDetails>: a dl group is " +
            "one or more terms FOLLOWED BY one or more details. Reorder them, or use a second item.",
        );
      }
      terms += 1;
    } else if (child.type === DescriptionDetails) {
      details += 1;
    } else {
      throw new Error(
        "<DescriptionItem> may hold only <DescriptionTerm> and <DescriptionDetails>: a div inside " +
          "a dl is a group, and any third child makes the list invalid (axe `definition-list`). " +
          "Content that belongs to the value - a link, a hint, a unit - goes INSIDE " +
          "<DescriptionDetails>.",
      );
    }
  }
  if (terms === 0 || details === 0) {
    throw new Error(
      `<DescriptionItem> holds ${terms} <DescriptionTerm> and ${details} <DescriptionDetails>: a ` +
        `group needs at least one of each, or there is a label with no value or a value with no label.`,
    );
  }

  return (
    <DescriptionItemContext.Provider value={{ inItem: true }}>
      <div
        data-slot="description-item"
        className={cn(descriptionItemVariants({ layout }), className)}
        {...props}
      >
        {children}
      </div>
    </DescriptionItemContext.Provider>
  );
}

/**
 * ⚠️ BOTH CONTEXTS ARE CLEARED INSIDE A TERM AND INSIDE A DETAIL, and layer 1's
 * HIGH-2 is why. React context flows down, so the first draft left the item's
 * context live inside the `dd`: `<DescriptionDetails><DescriptionTerm>…` rendered a
 * `<dt>` inside a `<dd>`, which is invalid HTML and an axe `dlitem` violation at
 * `serious` impact - and the item's own walk could not see it, because a part's
 * children are content and are deliberately not walked (decision 10).
 *
 * Clearing rather than refusing by element is what keeps the ONE legal nesting
 * working: a `dd` may hold flow content, so `<dd><dl>…</dl></dd>` is valid, and the
 * inner `<DescriptionList>` / `<DescriptionItem>` re-provide both contexts on the
 * way down. A part reached WITHOUT that re-provision throws the existing
 * "must be rendered inside a" message, which names exactly what is missing.
 */
function NotInsideAPart({ children }: { children?: ReactNode }) {
  return (
    <DescriptionListContext.Provider value={null}>
      <DescriptionItemContext.Provider value={null}>{children}</DescriptionItemContext.Provider>
    </DescriptionListContext.Provider>
  );
}

export type DescriptionTermProps = ComponentProps<"dt"> &
  VariantProps<typeof descriptionTermVariants>;

/** The label. Its `<dt>` is what associates it with the detail that follows. */
export function DescriptionTerm({ className, tone, children, ...props }: DescriptionTermProps) {
  requireContext(useContext(DescriptionItemContext), "DescriptionTerm", "DescriptionItem");
  refuseAsChild(props, "DescriptionTerm", "dt");
  refuseRole(props, "DescriptionTerm", "dt");
  return (
    <dt
      data-slot="description-term"
      className={cn(descriptionTermVariants({ tone }), className)}
      {...props}
    >
      <NotInsideAPart>{children}</NotInsideAPart>
    </dt>
  );
}

export type DescriptionDetailsProps = ComponentProps<"dd">;

/**
 * The value. It carries NO ink of its own: two of the eight sites paint the `dd`
 * `text-foreground`, one `text-foreground-2` and five leave it to inherit while
 * styling the figure inside it, so there is no majority to name - and the figure
 * is the thing that varies (a count, a display numeral, a name, a paragraph).
 *
 * ⚠️ A control inside a `dd` owes `min-h-hit` FROM THE CALLER, and the stories
 * are what get copied: the package's own floor check resolves every `a[href]` a
 * story renders against the compiled stylesheet and demands 44px. The ledger's
 * real anchor is an `absolute inset-0` overlay whose tap band is the cell's own
 * height; a story cannot copy that without the cell, so `LinkedFigure` draws the
 * inline form with the floor on the link.
 */
export function DescriptionDetails({ className, children, ...props }: DescriptionDetailsProps) {
  requireContext(useContext(DescriptionItemContext), "DescriptionDetails", "DescriptionItem");
  refuseAsChild(props, "DescriptionDetails", "dd");
  refuseRole(props, "DescriptionDetails", "dd");
  return (
    <dd data-slot="description-details" className={className} {...props}>
      <NotInsideAPart>{children}</NotInsideAPart>
    </dd>
  );
}

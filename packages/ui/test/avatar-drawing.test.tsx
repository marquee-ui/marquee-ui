import { cleanup, render } from "@testing-library/react";
import { composeStories } from "@storybook/react-vite";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { loadCompiledSheet, type CompiledSheet } from "./helpers/compiled-sheet.js";
import {
  Avatar,
  AvatarBadge,
  AvatarImage,
  avatarBadgeVariants,
  avatarImageVariants,
} from "@/avatar";
import * as avatarStories from "../stories/avatar.stories.js";

/**
 * The face's geometry, in RESOLVED VALUES rather than class names.
 *
 * ⚠️ WHAT THIS FILE CANNOT DO, STATED FIRST. jsdom lays nothing out, so "the mark
 * sits on the rim" is not observable here in any story - and neither is the one
 * thing `20cqw` exists for, because jsdom implements no container queries at all.
 * What IS observable is every number the drawing is MADE of, read out of the
 * compiled stylesheet: the image fills its root, the root declares no box of its
 * own, the mark is a square on the diagonal at 40% of the face, the mark carries
 * exactly ONE font-size declaration and it is the seam, and the edge axis
 * resolves to three different widths. There is no state cascade to measure -
 * this family has no state - which is why this file has two halves and
 * `switch-drawing.test.tsx` has three.
 *
 * ⚠️ Every class name below is read off the RENDERED part or story, never typed
 * here: a utility a test file names is a utility that file can conjure into
 * existence, which is why `test/fixtures/compile.css` turns Tailwind's source
 * detection off.
 */

let sheet: CompiledSheet;
beforeAll(async () => {
  sheet = await loadCompiledSheet();
}, 60_000);

afterEach(cleanup);

const stories = composeStories(avatarStories);

const classesOf = (element: Element | null): string[] =>
  (element?.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);

/**
 * A CSS percentage as a fraction, in the two shapes Tailwind 4 emits for the
 * utilities this family uses: `calc(2 / 5 * 100%)` for a fraction utility and
 * `calc(4% * -1)` for a negative arbitrary one. Null when the value is not a
 * percentage, so a property nobody declared cannot read as 0.
 */
function fraction(value: string): number | null {
  const ratio = /^calc\(\s*(-?\d*\.?\d+)\s*\/\s*(-?\d*\.?\d+)\s*\*\s*100%\s*\)$/.exec(value);
  if (ratio) return Number(ratio[1]!) / Number(ratio[2]!);
  const negated = /^calc\(\s*(-?\d*\.?\d+)%\s*\*\s*(-?\d*\.?\d+)\s*\)$/.exec(value);
  if (negated) return (Number(negated[1]!) / 100) * Number(negated[2]!);
  const plain = /^(-?\d*\.?\d+)%$/.exec(value);
  if (plain) return Number(plain[1]!) / 100;
  return null;
}

/** The classes ONE part contributes, with no caller string in the list. */
function bare(): { root: string[]; image: string[]; mark: string[] } {
  const { container } = render(
    <Avatar>
      <AvatarImage src="/face.svg" />
      <AvatarBadge>n</AvatarBadge>
    </Avatar>,
  );
  const found = {
    root: classesOf(container.querySelector('[data-slot="avatar"]')),
    image: classesOf(container.querySelector('[data-slot="avatar-image"]')),
    mark: classesOf(container.querySelector('[data-slot="avatar-badge"]')),
  };
  cleanup();
  return found;
}

/** The image's classes at one value of the edge axis, read off the DOM. */
function imageAt(edge: "default" | "thin" | "none"): string[] {
  const { container } = render(<AvatarImage src="/face.svg" edge={edge} />);
  const found = classesOf(container.querySelector('[data-slot="avatar-image"]'));
  cleanup();
  return found;
}

/** The image's classes at one value of the ground axis, read off the DOM. */
function groundAt(ground: "surface" | "raised"): string[] {
  const { container } = render(<AvatarImage src="/face.svg" ground={ground} />);
  const found = classesOf(container.querySelector('[data-slot="avatar-image"]'));
  cleanup();
  return found;
}

/** The mark's classes at one value of ITS edge axis, read off the DOM. */
function markAt(edge: "default" | "thin"): string[] {
  const { container } = render(<AvatarBadge edge={edge}>n</AvatarBadge>);
  const found = classesOf(container.querySelector('[data-slot="avatar-badge"]'));
  cleanup();
  return found;
}

/**
 * ⚠️ THE VARIANT FUNCTION'S OWN OUTPUT, UNMERGED - AND THAT IS THE ONLY
 * INSTRUMENT THAT CAN SEE THE DEFECT THESE TWO AXES EXIST TO REMOVE.
 *
 * Both axes were added because a value sat in a `cva` BASE (or a literal), where
 * a consumer whose `cn` is a plain JOIN cannot displace it. This package's own
 * `cn` is a real tailwind-merge, so a base that KEPT `bg-surface` beside a
 * `bg-raised` variant is resolved before anything renders and the rendered
 * element looks perfect - measured, not reasoned: both mutations (`bg-surface`
 * back in the image's base, `border-2` back in the mark's) left the whole file
 * GREEN at 11 passed when the arms below read only `markAt`/`groundAt`. So the
 * arms read the STRING a plain-join consumer is handed, resolved against the
 * compiled sheet, where a leftover shows up as a SECOND declaration.
 * `alert-tone.test.tsx:36` reads its axis the same way.
 */
const tokensOf = (variants: string): string[] => variants.split(/\s+/).filter(Boolean);

describe("the face's geometry, in resolved values", () => {
  it("found a real drawing to measure, and a sheet to measure it in", () => {
    // Anchors: every claim below comes from these two, and both can be empty.
    expect(sheet.css.length).toBeGreaterThan(10_000);
    const parts = bare();
    expect(parts.image.length).toBeGreaterThan(3);
    expect(parts.mark.length).toBeGreaterThan(5);
    // …and the percentage resolver answers in both directions, or every
    // comparison below would be `null === null`.
    expect(fraction("calc(2 / 5 * 100%)")).toBeCloseTo(0.4, 10);
    expect(fraction("calc(4% * -1)")).toBeCloseTo(-0.04, 10);
    expect(fraction("auto")).toBeNull();
  });

  it("puts the box on the ROOT's caller and NONE on the part, in either element", () => {
    // The family's central decision, as an assertion rather than a docblock:
    // seven different boxes across eleven faces in the reference product, so the
    // size is the caller's. A `cva` that grew a `size` axis would redden here.
    const parts = bare();
    for (const property of ["width", "height", "min-width", "min-height"]) {
      expect(sheet.declared(parts.root, property), `root declares ${property}`).toBeNull();
    }
    // The image fills whatever the caller gave the root, in both axes, and
    // declares no floor of its own that could fight it.
    for (const property of ["width", "height"]) {
      expect(
        sheet.declaredValues(parts.image, property).map(fraction),
        `image ${property}`,
      ).toEqual([1]);
    }
    for (const property of ["min-width", "min-height"]) {
      expect(sheet.declared(parts.image, property), `image declares ${property}`).toBeNull();
    }
  });

  it("gives the mark one square box on the diagonal, at 40% of the face", () => {
    // Square, and on the 4:30 diagonal, because `right` and `bottom` are the
    // SAME number - compared to each other rather than pinned twice, so a mark
    // nudged on one axis alone cannot pass.
    const { mark } = bare();
    const [w] = sheet.declaredValues(mark, "width").map(fraction);
    const [h] = sheet.declaredValues(mark, "height").map(fraction);
    const [right] = sheet.declaredValues(mark, "right").map(fraction);
    const [bottom] = sheet.declaredValues(mark, "bottom").map(fraction);
    expect(w).toBeCloseTo(0.4, 10);
    expect(h).toBe(w);
    expect(right).toBe(bottom);
    // It OVERHANGS: a non-negative offset would sit the mark inside the face,
    // which is a different drawing that still passes every equality above.
    expect(right!).toBeLessThan(0);
  });

  it("carries exactly ONE font-size on the mark, and it is the seam", () => {
    // The reason the seam exists: a consumer's `cn` may be a plain join, so a
    // second `text-*` would not replace this one, it would sit beside it. One
    // declaration is the property that makes the seam work, so one is what is
    // measured.
    const { mark } = bare();
    const sizes = sheet.declaredValues(mark, "font-size");
    expect(sizes).toEqual(["var(--avatar-mark-size,17cqw)"]);
  });

  it("opens the container that fallback is measured against", () => {
    // `20cqw` with no container resolves against the nearest ANCESTOR container
    // or the small viewport - a mark that scales with the window instead of the
    // face, and identical in every class-name assertion. jsdom cannot compute
    // it, so the sheet is the instrument.
    const { root } = bare();
    const opened = root.filter((token) => sheet.rule(token).includes("container-type"));
    expect(opened).toHaveLength(1);
    expect(sheet.rule(opened[0]!)).toContain("container-type: inline-size");
  });

  it("cuts the mark out of the face, and paints a ground under a transparent one", () => {
    // ⚠️ LAYER 1's HIGH-2, AND THIS ARM IS THE FINDING. The file's own docblock
    // said it reads "every number the drawing is MADE of"; it read the boxes, the
    // offsets, the radius, the font and the container, and NOT these. So the mark
    // could lose its edge and its centring, and the face its ground, with the
    // whole suite green - four classes whose docblocks call them load-bearing
    // (M11, M15, M16, M17, and M23 proved all four deletable together).
    const parts = bare();
    // The face's ground: a drawn face with a transparent background otherwise
    // sits on whatever is behind the root, which is how one member gets two
    // different faces from two components.
    expect(sheet.declaredValues(parts.image, "background-color")).toEqual(["var(--surface)"]);
    // The mark's edge is what CUTS it out of the face it overhangs - compared to
    // the image's ink rather than pinned, so one role moving moves both.
    expect(sheet.declared(parts.mark, "border-width")).toBe(2);
    expect(sheet.declaredValues(parts.mark, "border-color")).toEqual(
      sheet.declaredValues(parts.image, "border-color"),
    );
    // …and it is a centred box, not a corner of text: `place-items` is the only
    // thing putting the glyph in the middle of it, and `line-height: 1` the only
    // thing stopping a mono ascent pushing it off centre.
    expect(sheet.declaredValues(parts.mark, "place-items")).toEqual(["center"]);
    expect(sheet.declaredValues(parts.mark, "line-height")).toContain("1");
    // The root is a box that sits IN a line of text at eight of the eleven sites
    // measured, so its display is part of the drawing rather than a default.
    expect(sheet.declaredValues(parts.root, "display")).toEqual(["inline-flex"]);
  });

  it("draws both circles with the same corner, and the face with object-fit", () => {
    const parts = bare();
    const radius = (classes: readonly string[]) => sheet.declaredValues(classes, "border-radius");
    expect(radius(parts.image)).toHaveLength(1);
    // The mark is a circle for the same reason the face is, so the two are
    // compared rather than each pinned to a spelling.
    expect(radius(parts.mark)).toEqual(radius(parts.image));
    // …and it is the UNBOUNDED pill value rather than a step off the radius
    // scale, which is what makes it a circle at every box the caller picks. The
    // instrument is the resolved length, not the token's name: `--radius-full`
    // is a name, and a name can be re-pointed at 4px without moving a character
    // here (`choice-drawing.test.tsx` reads the circle the same way).
    expect(sheet.lengthPx(radius(parts.image)[0]!)).toBeGreaterThan(1000);
    expect(sheet.declaredValues(parts.image, "object-fit")).toEqual(["cover"]);
  });

  it("resolves the edge axis to three different widths, one of them nobody's", () => {
    // Three measured sites, three values. `none` is NULL and not 0: the
    // difference between "no border" and "a 0px border" is what lets a caller's
    // own ring be the only edge.
    expect(sheet.declared(imageAt("default"), "border-width")).toBe(2);
    expect(sheet.declared(imageAt("thin"), "border-width")).toBe(1);
    expect(sheet.declared(imageAt("none"), "border-width")).toBeNull();
    // …and the ink is the same role in the two that have one, so the axis is a
    // WIDTH axis and not a second colour decision.
    expect(sheet.declaredValues(imageAt("default"), "border-color")).toEqual(
      sheet.declaredValues(imageAt("thin"), "border-color"),
    );
  });

  it("resolves the ground axis to two grounds, with the old value still the default", () => {
    // s1's REQUEST 1, half one. `bg-surface` sat in the cva BASE, where a
    // consumer whose `cn` is a plain join cannot reach it, so the reference
    // product wrote `backgroundColor: var(--raised)` as an inline DECLARATION on
    // every face it draws - a second ground on the element with the stylesheet's
    // order picking the winner. Two measured grounds, read out of the sheet.
    expect(sheet.declaredValues(groundAt("surface"), "background-color")).toEqual([
      "var(--surface)",
    ]);
    expect(sheet.declaredValues(groundAt("raised"), "background-color")).toEqual(["var(--raised)"]);
    // EXACTLY ONE ground in what the VARIANT hands a caller, which is the whole
    // property the axis exists to produce and which the two reads above cannot
    // see (see `tokensOf`): a base that kept `bg-surface` would hand a plain-join
    // consumer two, and leave the stylesheet's order to pick.
    expect(
      sheet.declaredValues(tokensOf(avatarImageVariants({ ground: "raised" })), "background-color"),
    ).toEqual(["var(--raised)"]);
    // …and it is a MOVE rather than a new default: an image with no `ground`
    // still draws what the base used to hard-code, so no existing site moves.
    expect(sheet.declaredValues(bare().image, "background-color")).toEqual(
      sheet.declaredValues(groundAt("surface"), "background-color"),
    );
  });

  it("resolves the MARK's edge axis to the two widths its own sites measure", () => {
    // s1's REQUEST 1, half two, and the same defect one part over: the mark's
    // `border-2` is a literal in `AvatarBadge`'s class string, so the two small
    // faces (28 and 34, whose mark is an ~11-14px circle the 2px ring eats) are
    // drawn by an inline `borderWidth` declaration in the consumer.
    expect(sheet.declared(markAt("default"), "border-width")).toBe(2);
    expect(sheet.declared(markAt("thin"), "border-width")).toBe(1.5);
    // The default is what the literal hard-coded, so the three faces that take
    // the part's own value are untouched.
    expect(sheet.declared(bare().mark, "border-width")).toBe(2);
    // …and ONE width in what the variant hands a plain-join caller, for the same
    // reason and with the same blindness behind it: `border-2` left in the base
    // is invisible to every read above.
    expect(
      sheet.declaredValues(tokensOf(avatarBadgeVariants({ edge: "thin" })), "border-width"),
    ).toEqual(["1.5px"]);
    // ⚠️ AND `thin` HERE IS NOT `thin` ON THE IMAGE, ON PURPOSE. The mark is 40%
    // of the face, so the two axes carry the two measurements they were taken
    // from rather than one shared number: 1px on a 26px face, 1.5px on the mark
    // of a 28 or 34 one. Asserted side by side, so the asymmetry is a decision a
    // reader meets rather than a typo they find.
    expect(sheet.declared(imageAt("thin"), "border-width")).toBe(1);
    // The ink is one role at both widths, so this is a WIDTH axis and not a
    // second colour decision - compared rather than pinned, exactly as the
    // image's axis compares its own two.
    expect(sheet.declaredValues(markAt("thin"), "border-color")).toEqual(
      sheet.declaredValues(markAt("default"), "border-color"),
    );
  });

  it("keeps the story's own box on the root, which is what a consumer copies", () => {
    // The stories are what get copied, so the claim is made about one: the box
    // the reference consumer would write lands on the ROOT and the image still
    // declares only its fill.
    const { container } = render(<stories.Default />);
    const root = classesOf(container.querySelector('[data-slot="avatar"]'));
    const image = classesOf(container.querySelector('[data-slot="avatar-image"]'));
    expect(sheet.declared(root, "height")).toBe(64);
    expect(sheet.declared(root, "width")).toBe(64);
    expect(sheet.declaredValues(image, "height").map(fraction)).toEqual([1]);
  });
});

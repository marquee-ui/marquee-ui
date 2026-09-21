import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Avatar, AvatarBadge, AvatarImage } from "@/avatar";

/**
 * The two refusals, and the one thing a caller may always do.
 *
 * React 19 drops an unknown prop silently, so an `asChild` that this family does
 * not implement would not even leave a stray attribute behind: the caller would
 * write it, nothing would happen, and the face would keep its own element. Both
 * refusals are throws for that reason - `DescriptionList`'s MED-2 in a different
 * costume.
 */
afterEach(cleanup);

describe("the face refuses asChild where the element is not the caller's to give", () => {
  it("refuses it on the image, because a void element has no child", () => {
    expect(() =>
      render(
        // @ts-expect-error - `asChild` is not in the props type; a spread is the
        // JS route that reaches this, and the type is not the guard.
        <AvatarImage src="/face.svg" asChild />,
      ),
    ).toThrow('<AvatarImage> does not take "asChild"');
  });

  it("refuses it on the mark, whose position and aria-hidden ARE the part", () => {
    expect(() =>
      render(
        // @ts-expect-error - same route.
        <AvatarBadge asChild>n</AvatarBadge>,
      ),
    ).toThrow('<AvatarBadge> does not take "asChild"');
  });

  it("lets a SPREAD whose asChild is undefined through, in both parts", () => {
    // `{...rest}` from a caller that destructured `asChild` off its own props
    // carries the key with no value, and `"asChild" in props` would call that a
    // request (DL13 layer 2, LOW-7, one family over). The positive half is the
    // point: the parts still render their own elements.
    const rest = { asChild: undefined };
    render(
      <Avatar className="h-16 w-16">
        <AvatarImage src="/face.svg" alt="Nova" {...rest} />
        <AvatarBadge {...rest}>n</AvatarBadge>
      </Avatar>,
    );
    expect(screen.getByRole("img", { name: "Nova" }).tagName).toBe("IMG");
    expect(document.querySelector('[data-slot="avatar-badge"]')!.tagName).toBe("SPAN");
  });

  it("keeps the variant props OFF both elements, which only the destructure does", () => {
    // ⚠️ LAYER 1's LOW-1, AND THIS ARM IS THE FINDING. `ground` and `edge` are
    // kept off the DOM by being destructured out of `...props` and by nothing
    // else. The reviewer left `ground` in the spread and read it from `props`
    // instead: `pnpm test` stayed at 565 passed (the one red being the registry
    // BYTE digest, which fires for any edit), `pnpm typecheck` said `Done`, and
    // the shipped element was
    // `<img data-slot="avatar-image" … class="… bg-raised" ground="raised">` -
    // an invalid attribute on every consumer's face plus React's "does not
    // recognize the prop" warning, with nothing anywhere looking.
    //
    // React 19 lower-cases an unknown prop and WRITES it, which is what makes
    // this observable; the pre-existing `edge` had the same hole.
    render(
      <Avatar className="h-16 w-16">
        <AvatarImage src="/face.svg" ground="raised" edge="thin" />
        <AvatarBadge edge="thin">n</AvatarBadge>
      </Avatar>,
    );
    const image = document.querySelector('[data-slot="avatar-image"]')!;
    const mark = document.querySelector('[data-slot="avatar-badge"]')!;
    // The anchor FIRST, so an arm whose render silently drew nothing cannot
    // pass its two absences: the values did reach the variants.
    expect(image.getAttribute("class")).toContain("bg-raised");
    expect(mark.getAttribute("class")).toContain("border-[1.5px]");
    for (const attribute of ["ground", "edge"]) {
      expect(image.getAttribute(attribute), `image keeps ${attribute} off the DOM`).toBeNull();
      expect(mark.getAttribute(attribute), `mark keeps ${attribute} off the DOM`).toBeNull();
    }
  });

  it("keeps the mark hidden even when the caller asks for it not to be", () => {
    // The part writes `aria-hidden` AFTER the spread, so this is a real refusal
    // rather than a default. Every other part in this package spreads last, so a
    // reader has to be told which way round this one is - and told by a test,
    // because reordering two JSX attributes changes nothing else on screen.
    render(
      <Avatar className="h-16 w-16">
        <AvatarImage src="/face.svg" />
        {/* @ts-expect-error - `false` is a legal aria-hidden value and that is
            exactly the caller this arm is about. */}
        <AvatarBadge aria-hidden={false}>n</AvatarBadge>
      </Avatar>,
    );
    const mark = document.querySelector('[data-slot="avatar-badge"]')!;
    expect(mark.getAttribute("aria-hidden")).toBe("true");
  });
});

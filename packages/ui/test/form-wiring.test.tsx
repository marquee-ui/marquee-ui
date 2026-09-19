import { BODY_INK_ROLES } from "@marquee-ui/tokens";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/form";
import { Input } from "@/input";

/**
 * The three properties of this family that a STORY cannot state.
 *
 * The stories assert the wiring one field at a time, which is what a call site
 * looks like. These are the claims that only exist ACROSS renders or ACROSS the
 * contract: that two fields on one page cannot collide, that a part used outside
 * its item fails loudly rather than drawing a dead label, and that the two inks
 * this family names are inks the presets actually measure.
 */

afterEach(cleanup);

const describedIds = (control: Element): string[] =>
  (control.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean);

function field(props: { invalid?: boolean; label: string }) {
  return (
    <FormItem invalid={props.invalid}>
      <FormLabel>{props.label}</FormLabel>
      <FormControl>
        <Input />
      </FormControl>
      <FormDescription>Anything you like.</FormDescription>
      <FormMessage>That is not it.</FormMessage>
    </FormItem>
  );
}

describe("two fields on one page cannot collide", () => {
  it("gives every item its own id, and every part of an item the same one", () => {
    const { container } = render(
      <form>
        {field({ label: "Email" })}
        {field({ label: "Password", invalid: true })}
      </form>,
    );

    const controls = [...container.querySelectorAll("input")];
    const labels = [...container.querySelectorAll<HTMLLabelElement>('[data-slot="form-label"]')];
    expect(controls).toHaveLength(2);
    expect(labels).toHaveLength(2);

    // The anchor: every id is a real, non-empty string, so the uniqueness
    // assertion below cannot pass by comparing two empty ones. This is the defect
    // the family exists to remove - the consuming product's twelve `htmlFor`
    // attributes are hand-typed literals, which is exactly what collides when a
    // form is rendered twice on one page.
    const ids = controls.map((c) => c.id);
    for (const id of ids) expect(id).not.toBe("");
    expect(new Set(ids).size).toBe(2);

    // Each label points at ITS OWN control, not at whichever came first.
    for (const [i, label] of labels.entries()) {
      expect(label.htmlFor).toBe(ids[i]);
    }

    // …and so does each item's description and message.
    const described = controls.map(describedIds);
    // ⚠️ ANCHOR THE COUNT FIRST. Everything below loops over `described`, so a
    // `describedIds` that returned nothing - or a fixture that stopped
    // composing the two describable parts - made all of it vacuous and left
    // this test green (layer 1, run twice). The valid field names its
    // description; the invalid one names its description AND its message.
    expect(described.map((list) => list.length)).toEqual([1, 2]);
    expect(new Set(described.flat()).size).toBe(described.flat().length);
    for (const [i, list] of described.entries()) {
      for (const id of list) {
        const target = container.ownerDocument.getElementById(id);
        expect(target, `${id} resolves`).not.toBeNull();
        expect(controls[i]!.closest('[data-slot="form-item"]')).toContainElement(target);
      }
    }
  });

  it("names the message only on the field that is invalid", () => {
    const { container } = render(
      <form>
        {field({ label: "Email" })}
        {field({ label: "Password", invalid: true })}
      </form>,
    );
    const [valid, invalid] = [...container.querySelectorAll("input")];
    expect(describedIds(valid!)).toHaveLength(1);
    expect(describedIds(invalid!)).toHaveLength(2);
    expect(valid!.getAttribute("aria-invalid")).toBeNull();
    expect(invalid!.getAttribute("aria-invalid")).toBe("true");
    // Exactly one live region on a page holding two fields.
    expect(container.querySelectorAll('[role="alert"]')).toHaveLength(1);
  });
});

describe("a caller's own aria-describedby is kept, and the child cannot clobber it", () => {
  it("keeps the caller's id in front of the family's, and both still resolve", () => {
    // The wiring is written AFTER this part's own props so it cannot be silently
    // overridden - and the cost of that ordering would be DROPPING a second
    // description a caller legitimately wants, which is why it is merged rather
    // than replaced. No story passes one, so it is stated here or it is untested.
    const { container } = render(
      <div>
        <p id="shared-note">Everything here is public.</p>
        <FormItem invalid>
          <FormLabel>Email</FormLabel>
          <FormControl aria-describedby="shared-note">
            <Input />
          </FormControl>
          <FormMessage>That is not it.</FormMessage>
        </FormItem>
      </div>,
    );
    const control = container.querySelector("input")!;
    const ids = describedIds(control);
    expect(ids[0]).toBe("shared-note");
    expect(ids).toHaveLength(2);
    // Every one of them resolves - which is the property, not the count.
    for (const id of ids) {
      expect(container.ownerDocument.getElementById(id), id).not.toBeNull();
    }
    expect(container.ownerDocument.getElementById(ids[1]!)).toHaveAttribute(
      "data-slot",
      "form-message",
    );
  });

  it.each(["id", "aria-describedby", "aria-invalid"])(
    "refuses a child that sets its own %s, rather than losing the wiring to it",
    (owned) => {
      // `Slot` gives the CHILD precedence, so this spelling does not merge - it
      // REPLACES. Found by writing the merge test with the attribute on the
      // child and watching the family's own id vanish from the result, which is
      // a label pointing at nothing and nothing on screen to show for it.
      // `aria-invalid` is here for the weaker reason: it cannot dangle, but it
      // can announce a control invalid inside a field that renders no message
      // and describes nothing, which is the same disagreement one step quieter.
      expect(() =>
        render(
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input {...{ [owned]: "mine" }} />
            </FormControl>
          </FormItem>,
        ),
      ).toThrow(`<FormControl>'s child must not set "${owned}"`);
    },
  );
});

describe("a part outside its item fails loudly", () => {
  // Silence here is the defect: a label pointing at nothing and a control with no
  // ARIA at all is precisely the state this family was written to replace, and it
  // looks completely normal on screen.
  it.each([
    ["FormLabel", <FormLabel key="l">Email</FormLabel>],
    [
      "FormControl",
      <FormControl key="c">
        <Input />
      </FormControl>,
    ],
    ["FormDescription", <FormDescription key="d">Hint.</FormDescription>],
    ["FormMessage", <FormMessage key="m">Wrong.</FormMessage>],
  ])("%s throws when it is not inside a FormItem", (name, element) => {
    expect(() => render(element)).toThrow(`<${name}> must be rendered inside a <FormItem>.`);
  });

  it("renders all four without throwing once they are inside one", () => {
    // The positive anchor for the block above: without it, a `render` that threw
    // for some unrelated reason would satisfy every case.
    //
    // ⚠️ `not.toThrow()` ALONE IS NOT THAT ANCHOR. It passed against
    // `render(<div />)` and against a fixture carrying two of the four parts
    // (layer 1, both run), because it observes nothing that rendered. So the
    // four slots are counted.
    const { container } = render(field({ label: "Email", invalid: true }));
    expect(
      ["form-item", "form-label", "form-control", "form-description", "form-message"].map(
        (slot) => container.querySelectorAll(`[data-slot="${slot}"]`).length,
      ),
    ).toEqual([1, 1, 1, 1, 1]);
  });
});

describe("the two inks this family names are inks the presets measure", () => {
  // `Alert`'s rule, applied to a family with no `cva`: a class like `text-brand`
  // or `text-primary` compiles exactly as well and is measured against no ground
  // by anything, so a part may only paint in a role that is already inside the
  // presets' 4.5:1 ink-on-ground check. Imported rather than retyped.
  const inks = ["muted", "destructive"] as const;

  it("names them, and the instrument can tell a covered role from an uncovered one", () => {
    // Anchor both ways, or a list that always returned true would pass.
    // ⚠️ And anchor the LIST: emptying `inks` left this green, because the
    // positive half was carried entirely by the literal (layer 1, run). Two is
    // the number of inks this family paints, and the arm below reads them back
    // off the rendered parts rather than off this list.
    expect(inks).toHaveLength(2);
    expect((BODY_INK_ROLES as readonly string[]).includes("primary")).toBe(false);
    expect((BODY_INK_ROLES as readonly string[]).includes("brand")).toBe(false);
    for (const ink of inks) {
      expect((BODY_INK_ROLES as readonly string[]).includes(ink), ink).toBe(true);
    }
  });

  it("paints the description and the message in exactly those two", () => {
    // Read off the rendered parts, so a part that quietly changed its ink to an
    // unmeasured role reddens here rather than in a list nobody updated.
    const { container } = render(field({ label: "Email", invalid: true }));
    const painted = (slot: string) =>
      (container.querySelector(`[data-slot="${slot}"]`)?.getAttribute("class") ?? "")
        .split(/\s+/)
        .filter((c) => c.startsWith("text-"));
    expect(painted("form-description")).toEqual(["text-muted"]);
    expect(painted("form-message")).toEqual(["text-destructive"]);
  });
});

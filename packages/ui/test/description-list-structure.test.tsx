import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  DescriptionDetails,
  DescriptionItem,
  DescriptionList,
  DescriptionTerm,
  descriptionItemVariants,
  descriptionTermVariants,
} from "../src/description-list.js";

/**
 * The claims that exist ACROSS renders or across the contract, which a story with
 * one list cannot state: the five refusals, the two arrangements as a pair, and
 * the content model's own rules.
 *
 * Everything a single composition can say is said in a story play instead
 * (`stories/description-list.stories.tsx`), because a story is what a consumer
 * copies and the workbench is the docs. This file is the other half.
 *
 * ⚠️ A render that THROWS is the deliverable here, not an error to be tolerated.
 * The quiet version of every one of these is an invalid `<dl>` - a label with no
 * value, a value with no label, an anchor sitting beside the pair instead of
 * inside it - and every one of them looks entirely normal on screen. The profile
 * ledger in the consuming product records paying for exactly that: axe
 * `definition-list`, found by an e2e sweep rather than by looking.
 */

afterEach(cleanup);

/** The valid baseline every refusal below is a single mutation away from. */
function valid() {
  return (
    <DescriptionList>
      <DescriptionItem>
        <DescriptionTerm>Developer</DescriptionTerm>
        <DescriptionDetails>Studio Nine</DescriptionDetails>
      </DescriptionItem>
    </DescriptionList>
  );
}

describe("the baseline this file mutates", () => {
  it("renders, and renders the content model", () => {
    // The positive anchor: without it every `toThrow` below could be passing
    // because the parts never work at all.
    render(valid());
    const list = screen.getByRole("term").closest("dl");
    expect(list).not.toBeNull();
    expect(list!.children).toHaveLength(1);
    const group = list!.children[0]!;
    expect(group.tagName).toBe("DIV");
    expect(group.getAttribute("data-slot")).toBe("description-item");
    expect([...group.children].map((element) => element.tagName)).toEqual(["DT", "DD"]);
    // The roles a browser computes from the elements, which is the half of the
    // association that structure alone does not show.
    expect(screen.getByRole("term")).toHaveTextContent("Developer");
    expect(screen.getByRole("definition")).toHaveTextContent("Studio Nine");
  });

  it("gives every part a data-slot, and the list none of its own classes", () => {
    render(valid());
    const list = screen.getByRole("term").closest("dl")!;
    // The list declares NO layout: eight product sites, eight layouts.
    expect(list.getAttribute("class")).toBeNull();
    expect(screen.getByRole("term").getAttribute("data-slot")).toBe("description-term");
    expect(screen.getByRole("definition").getAttribute("data-slot")).toBe("description-details");
  });
});

describe("a part outside its parent throws, rather than drawing an invalid list", () => {
  it.each([
    ["DescriptionItem", <DescriptionItem key="i">x</DescriptionItem>, "DescriptionList"],
    ["DescriptionTerm", <DescriptionTerm key="t">x</DescriptionTerm>, "DescriptionItem"],
    ["DescriptionDetails", <DescriptionDetails key="d">x</DescriptionDetails>, "DescriptionItem"],
  ])("%s throws, naming the parent it needs", (part, element, parent) => {
    // The message is what ties the red to THIS guard: `Children.only` and a dozen
    // other things also throw, so a bare `.toThrow()` would pass on any of them.
    expect(() => render(element)).toThrow(`<${part}> must be rendered inside a <${parent}>.`);
  });

  it("a term inside a LIST but outside an item still throws", () => {
    // The near miss: the list's own context is present, the item's is not. A
    // single shared context would have let this through.
    expect(() =>
      render(
        <DescriptionList>
          <DescriptionTerm>Developer</DescriptionTerm>
        </DescriptionList>,
      ),
    ).toThrow("<DescriptionTerm> must be rendered inside a <DescriptionItem>.");
  });
});

describe("the item refuses every child that is not one of its two parts", () => {
  it("refuses an anchor beside the pair, which is the failure this family exists to stop", () => {
    // The ledger's own bug, verbatim in shape: the link as the group's THIRD
    // child rather than inside the `dd`.
    expect(() =>
      render(
        <DescriptionList>
          <DescriptionItem>
            <DescriptionTerm>Followers</DescriptionTerm>
            <DescriptionDetails>128</DescriptionDetails>
            <a href="#followers">128 followers</a>
          </DescriptionItem>
        </DescriptionList>,
      ),
    ).toThrow("may hold only <DescriptionTerm> and <DescriptionDetails>");
  });

  it("refuses a component child too, because the ledger's stray child WAS a component", () => {
    // `<Link>`, not `<a>`. A guard that only refused intrinsic elements would
    // have missed the real defect entirely.
    const Door = () => <a href="#x">128</a>;
    expect(() =>
      render(
        <DescriptionList>
          <DescriptionItem>
            <DescriptionTerm>Followers</DescriptionTerm>
            <DescriptionDetails>128</DescriptionDetails>
            <Door />
          </DescriptionItem>
        </DescriptionList>,
      ),
    ).toThrow("may hold only <DescriptionTerm> and <DescriptionDetails>");
  });

  it("but a part's OWN children are content, and are not walked", () => {
    // The positive half of the same rule, and the one that makes the family
    // usable: the link is legal INSIDE the `dd`. Asserted by a render that does
    // not throw AND by finding the anchor where it belongs.
    render(
      <DescriptionList>
        <DescriptionItem>
          <DescriptionTerm>
            Followers <span aria-hidden="true">→</span>
          </DescriptionTerm>
          <DescriptionDetails>
            <a href="#followers" className="min-h-hit">
              128
            </a>
          </DescriptionDetails>
        </DescriptionItem>
      </DescriptionList>,
    );
    const link = screen.getByRole("link");
    expect(link.parentElement!.tagName).toBe("DD");
    expect(screen.getByRole("definition")).toContainElement(link);
    // …and the group still has exactly two element children.
    expect(screen.getByRole("term").parentElement!.children).toHaveLength(2);
  });

  it("refuses a group with no detail, and a group with no term", () => {
    expect(() =>
      render(
        <DescriptionList>
          <DescriptionItem>
            <DescriptionTerm>Developer</DescriptionTerm>
          </DescriptionItem>
        </DescriptionList>,
      ),
    ).toThrow("holds 1 <DescriptionTerm> and 0 <DescriptionDetails>");
    expect(() =>
      render(
        <DescriptionList>
          <DescriptionItem>
            <DescriptionDetails>Studio Nine</DescriptionDetails>
          </DescriptionItem>
        </DescriptionList>,
      ),
    ).toThrow("holds 0 <DescriptionTerm> and 1 <DescriptionDetails>");
  });

  it("refuses a detail before its term, which is the one ORDER the model fixes", () => {
    expect(() =>
      render(
        <DescriptionList>
          <DescriptionItem>
            <DescriptionDetails>Studio Nine</DescriptionDetails>
            <DescriptionTerm>Developer</DescriptionTerm>
          </DescriptionItem>
        </DescriptionList>,
      ),
    ).toThrow("puts a <DescriptionTerm> after a <DescriptionDetails>");
  });

  it("allows several terms then several details, which the model also fixes", () => {
    // Not a hypothetical: HTML's group is "one or more dt FOLLOWED BY one or more
    // dd", and a guard that demanded exactly one of each would refuse a legal
    // list. No product site needs it today; the rule is the model's, not the
    // product's.
    render(
      <DescriptionList>
        <DescriptionItem>
          <DescriptionTerm>Developer</DescriptionTerm>
          <DescriptionTerm>Publisher</DescriptionTerm>
          <DescriptionDetails>Studio Nine</DescriptionDetails>
          <DescriptionDetails>Nine Press</DescriptionDetails>
        </DescriptionItem>
      </DescriptionList>,
    );
    expect(screen.getAllByRole("term")).toHaveLength(2);
    expect(screen.getAllByRole("definition")).toHaveLength(2);
  });

  it("counts through a fragment and drops a falsy child, so a conditional part is fine", () => {
    const note: string | null = null;
    render(
      <DescriptionList>
        <DescriptionItem>
          <>
            <DescriptionTerm>Streak</DescriptionTerm>
            <DescriptionDetails>12</DescriptionDetails>
          </>
          {note !== null && <DescriptionDetails>{note}</DescriptionDetails>}
        </DescriptionItem>
      </DescriptionList>,
    );
    expect(screen.getByRole("term")).toHaveTextContent("Streak");
    expect(screen.getAllByRole("definition")).toHaveLength(1);
  });
});

describe("the list refuses the one child it can know is wrong", () => {
  it("refuses a bare dt or dd, which would mix the two content-model forms", () => {
    for (const bare of [<dt key="t">Developer</dt>, <dd key="d">Studio Nine</dd>]) {
      expect(() => render(<DescriptionList>{bare}</DescriptionList>)).toThrow(
        "a dl's groups are either bare dt/dd or <div> wrappers, never both",
      );
      cleanup();
    }
  });

  it("does NOT refuse a component child, because three product sites are exactly that", () => {
    // `Ledger`'s `Cell`, `ScoreBlock`'s `RawFigure`, `reckoning`'s `Fact`. A
    // component is not an element, so it leaves nothing between the `dl` and its
    // group - and refusing it would reject all three while proving nothing.
    const Fact = ({ label, value }: { label: string; value: string }) => (
      <DescriptionItem>
        <DescriptionTerm>{label}</DescriptionTerm>
        <DescriptionDetails>{value}</DescriptionDetails>
      </DescriptionItem>
    );
    render(
      <DescriptionList>
        <Fact label="Hours" value="184" />
        <Fact label="Streak" value="12" />
      </DescriptionList>,
    );
    const list = screen.getAllByRole("term")[0]!.closest("dl")!;
    // The DOM the component produced is still a list of groups and nothing else.
    expect([...list.children].map((element) => element.getAttribute("data-slot"))).toEqual([
      "description-item",
      "description-item",
    ]);
  });
});

describe("asChild is refused, because the content model fixes all four elements", () => {
  // `asChild` is not in either part's props type, so this is the JS caller's
  // route: TypeScript already refuses it, and the throw is what stops it landing
  // as a stray DOM attribute on a `dt` that is silently no longer the term.
  const asChild = { asChild: true } as unknown as Record<string, never>;

  it("DescriptionTerm refuses it, naming the element", () => {
    expect(() =>
      render(
        <DescriptionList>
          <DescriptionItem>
            <DescriptionTerm {...asChild}>
              <span>Followers</span>
            </DescriptionTerm>
            <DescriptionDetails>128</DescriptionDetails>
          </DescriptionItem>
        </DescriptionList>,
      ),
    ).toThrow(
      '<DescriptionTerm> does not take "asChild": HTML\'s dl content model fixes it as <dt>',
    );
  });

  it("DescriptionDetails refuses it, which is the composition the brief asked for", () => {
    // `<DescriptionDetails asChild><a/></DescriptionDetails>` renders the anchor
    // IN PLACE OF the `dd`, i.e. as the group's second child - which is the axe
    // `definition-list` failure. The link goes inside the `dd`, not instead of it.
    expect(() =>
      render(
        <DescriptionList>
          <DescriptionItem>
            <DescriptionTerm>Followers</DescriptionTerm>
            <DescriptionDetails {...asChild}>
              <a href="#followers">128</a>
            </DescriptionDetails>
          </DescriptionItem>
        </DescriptionList>,
      ),
    ).toThrow(
      '<DescriptionDetails> does not take "asChild": HTML\'s dl content model fixes it as <dd>',
    );
  });
});

describe("the two arrangements are one axis with two values, not one value and a className", () => {
  it("resolves to different class strings, and the default is the stack", () => {
    // The pair is the instrument: a `cva` whose two values happened to be equal
    // would make every layout assertion in the stories vacuous.
    const stack = descriptionItemVariants({ layout: "stack" });
    const inline = descriptionItemVariants({ layout: "inline" });
    expect(stack).not.toBe(inline);
    expect(descriptionItemVariants({})).toBe(stack);
    // Derived, and stated so a change has to be deliberate: 6 of 8 sites stack.
    expect(stack.split(" ").sort()).toEqual(["flex", "flex-col", "gap-1"]);
    expect(inline.split(" ").sort()).toEqual(["flex", "flex-wrap", "gap-2", "items-baseline"]);
  });

  it("the item renders the axis and the caller's class, in that order", () => {
    render(
      <DescriptionList>
        <DescriptionItem layout="inline" className="border-2 border-border p-3">
          <DescriptionTerm>Median</DescriptionTerm>
          <DescriptionDetails>4.3</DescriptionDetails>
        </DescriptionItem>
      </DescriptionList>,
    );
    const group = screen.getByRole("term").parentElement!;
    expect(group.getAttribute("class")).toBe(
      "flex flex-wrap items-baseline gap-2 border-2 border-border p-3",
    );
  });
});

describe("the term's two tones", () => {
  it("micro is the default, and plain declares nothing at all", () => {
    expect(descriptionTermVariants({})).toBe(descriptionTermVariants({ tone: "micro" }));
    expect(descriptionTermVariants({ tone: "plain" })).toBe("");
    // The measured treatment, named so that a silent edit has to argue with the
    // derivation in the docblock: mono micro-caps in the MUTED ink, at the
    // house's own named tracking.
    expect(descriptionTermVariants({ tone: "micro" }).split(" ").sort()).toEqual([
      "font-mono",
      "text-3xs",
      "text-muted",
      "tracking-label",
      "uppercase",
    ]);
  });

  it("does NOT reuse Label's micro tone, and the difference is the ink", () => {
    // Recorded as an assertion rather than as prose, because "we could have
    // composed Label" is the first thing a reader will ask. The two differ in
    // exactly one utility, and it is the colour: Label's is `text-foreground-2`,
    // 5 of the 6 micro-caps terms in the product are muted.
    const term = new Set(descriptionTermVariants({ tone: "micro" }).split(" "));
    expect(term.has("text-muted")).toBe(true);
    expect(term.has("text-foreground-2")).toBe(false);
  });

  it("paints the term in a role the presets measure for contrast", async () => {
    // `text-muted` is in the tokens package's own body-ink list, so it is inside
    // the 4.5:1 ink-on-ground check on every ground in both presets. Imported
    // rather than retyped, with two negative anchors, so the arm cannot pass by
    // saying yes to everything - `Form`'s measurement 3, same shape.
    const { BODY_INK_ROLES } = await import("@marquee-ui/tokens");
    const inks: string[] = [...BODY_INK_ROLES];
    expect(inks.length).toBeGreaterThan(2);
    expect(inks).toContain("muted");
    expect(inks).not.toContain("primary");
    expect(inks).not.toContain("brand");
  });
});

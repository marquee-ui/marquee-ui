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
import { labelVariants } from "../src/label.js";

/**
 * The claims that exist ACROSS renders or across the contract, which a story with
 * one list cannot state: the EIGHT refusals, the two arrangements as a pair, and
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
        "this family draws the <div>-wrapper form of a dl's group, and the two forms may not be " +
          "mixed in one list",
      );
      cleanup();
    }
  });

  it("refuses an intrinsic element between the groups, which axe calls only-dlitems", () => {
    // DL11 layer 2, LOW-6. A `<div>` child is flattened by axe and is the other
    // legal form of the content model, so it stays allowed; anything else
    // intrinsic and visible - an `<hr>` between groups, a `<span>` of prose - is
    // a badNode in axe-core 4.12.1's `onlyDlitemsEvaluate`, impact `serious`,
    // and it is knowable here from `typeof child.type === "string"`.
    for (const stray of [<hr key="hr" />, <span key="s">and</span>, <p key="p">why</p>]) {
      expect(() =>
        render(
          <DescriptionList>
            <DescriptionItem>
              <DescriptionTerm>Developer</DescriptionTerm>
              <DescriptionDetails>Studio Nine</DescriptionDetails>
            </DescriptionItem>
            {stray}
          </DescriptionList>,
        ),
      ).toThrow("a dl's children are its groups");
      cleanup();
    }
  });

  it("leaves the OTHER legal shapes alone: a div wrapper, and the script-supporting pair", () => {
    // The bound, stated positively so the widening above cannot creep. A roleless
    // `<div>` is what axe flattens and what the content model's second form is
    // made of; `<script>` and `<template>` are the "optionally intermixed"
    // elements, and axe skips both because neither is exposed to a screen reader.
    render(
      <DescriptionList>
        <DescriptionItem>
          <DescriptionTerm>Developer</DescriptionTerm>
          <DescriptionDetails>Studio Nine</DescriptionDetails>
        </DescriptionItem>
        <div data-testid="hand-written">
          <dt>Publisher</dt>
          <dd>Studio Ten</dd>
        </div>
        <template data-testid="tpl" />
      </DescriptionList>,
    );
    expect(screen.getByTestId("hand-written").tagName).toBe("DIV");
    expect(screen.getByTestId("tpl").tagName).toBe("TEMPLATE");
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
    // ⚠️ It COMPARES THE TWO VARIANTS. Layer 1's MED-3.2: the first version named
    // both strings by hand and never imported `labelVariants`, so it stayed GREEN
    // when `Label`'s micro tone was edited to be byte-identical to this one - i.e.
    // it could not observe the decision it is named for.
    const term = new Set(descriptionTermVariants({ tone: "micro" }).split(" "));
    const label = new Set(labelVariants({ tone: "micro" }).split(" ").filter(Boolean));
    // Anchor: two real sets, or every difference below is vacuous.
    expect(term.size).toBeGreaterThan(3);
    expect(label.size).toBeGreaterThan(3);
    // They differ in exactly one member each way…
    const onlyTerm = [...term].filter((token) => !label.has(token));
    const onlyLabel = [...label].filter((token) => !term.has(token));
    // …and this is where the two families genuinely disagree: the term states its
    // own tracking in the house's NAMED token where `Label` still carries a
    // literal, so the sets differ by the colour AND the tracking. The colour is
    // the decision; the tracking is `Label`'s to fix and is a CONSUMED behaviour
    // this batch, flagged to the orchestrator rather than edited.
    expect(onlyTerm).toContain("text-muted");
    expect(onlyLabel).toContain("text-foreground-2");
    // The load-bearing half: the two are not the same string.
    expect(descriptionTermVariants({ tone: "micro" })).not.toBe(labelVariants({ tone: "micro" }));
  });

  it("paints the term in a role the presets measure for contrast", async () => {
    // The role is DERIVED FROM THE VARIANT, not typed here. Layer 1's MED-3.1: the
    // first version read `BODY_INK_ROLES` and asserted `toContain("muted")`, which
    // stayed GREEN when the term's ink became `text-primary` - a role its own
    // negative anchor declares is not a body ink. It compared nothing.
    const { BODY_INK_ROLES } = await import("@marquee-ui/tokens");
    const inks: string[] = [...BODY_INK_ROLES];
    const ink = descriptionTermVariants({ tone: "micro" })
      .split(" ")
      .filter((token) => token.startsWith("text-") && !/^text-(\[|[0-9])/.test(token))
      .map((token) => token.slice("text-".length));
    // Anchors: exactly one colour utility to talk about, and a list long enough to
    // be a real list.
    expect(ink).toHaveLength(1);
    expect(inks.length).toBeGreaterThan(2);
    // The claim: whatever ink the variant paints with is one the presets hold to
    // 4.5:1 on every ground.
    expect(inks).toContain(ink[0]);
    // …and the instrument can tell a covered role from an uncovered one.
    expect(inks).not.toContain("primary");
    expect(inks).not.toContain("brand");
  });
});

/**
 * The compositions layer 1 proved the first draft ACCEPTED, each one a violation
 * axe-core 4.12.1 rates `serious` / WCAG 1.3.1. Added red-first: every test in
 * this block failed against `41f243a6` before the fix that answers it.
 */
describe("a text or number child is refused, at both levels (layer 1, HIGH-1)", () => {
  it("refuses a stray string inside an item", () => {
    expect(() =>
      render(
        <DescriptionList>
          <DescriptionItem>
            {"stray"}
            <DescriptionTerm>Developer</DescriptionTerm>
            <DescriptionDetails>Studio Nine</DescriptionDetails>
          </DescriptionItem>
        </DescriptionList>,
      ),
    ).toThrow('<DescriptionItem> holds text of its own ("stray")');
  });

  it("refuses the ZERO that the shortest React conditional produces", () => {
    // The concrete case layer 1 named: `{count && <DescriptionDetails>…}` with
    // `count === 0` renders a literal `0` text node beside the pair. The product
    // writes `!== null` at both its conditional sites today, so it is one
    // character away rather than hypothetical.
    const count = 0;
    expect(() =>
      render(
        <DescriptionList>
          <DescriptionItem>
            <DescriptionTerm>Reviews</DescriptionTerm>
            <DescriptionDetails>0</DescriptionDetails>
            {count && <DescriptionDetails>{count}</DescriptionDetails>}
          </DescriptionItem>
        </DescriptionList>,
      ),
    ).toThrow('<DescriptionItem> holds text of its own ("0")');
  });

  it("refuses a stray string inside the list", () => {
    expect(() =>
      render(
        <DescriptionList>
          {"stray"}
          <DescriptionItem>
            <DescriptionTerm>Developer</DescriptionTerm>
            <DescriptionDetails>Studio Nine</DescriptionDetails>
          </DescriptionItem>
        </DescriptionList>,
      ),
    ).toThrow("holds text of its own");
  });

  it("but whitespace stays legal, because JSX produces it", () => {
    // The negative anchor for the two guards above: `{" "}` is a real text node
    // and refusing it would make the family unusable in formatted JSX.
    render(
      <DescriptionList>
        {" "}
        <DescriptionItem>
          {" "}
          <DescriptionTerm>Developer</DescriptionTerm>{" "}
          <DescriptionDetails>Studio Nine</DescriptionDetails>{" "}
        </DescriptionItem>{" "}
      </DescriptionList>,
    );
    expect(screen.getByRole("term")).toHaveTextContent("Developer");
    expect(screen.getByRole("definition")).toHaveTextContent("Studio Nine");
  });
});

describe("a part inside a part is refused (layer 1, HIGH-2)", () => {
  it("refuses a term inside a detail, which renders a dt inside a dd", () => {
    expect(() =>
      render(
        <DescriptionList>
          <DescriptionItem>
            <DescriptionTerm>Followers</DescriptionTerm>
            <DescriptionDetails>
              128
              <DescriptionTerm>per week</DescriptionTerm>
            </DescriptionDetails>
          </DescriptionItem>
        </DescriptionList>,
      ),
    ).toThrow("<DescriptionTerm> must be rendered inside a <DescriptionItem>.");
  });

  it("refuses a whole item inside a detail", () => {
    expect(() =>
      render(
        <DescriptionList>
          <DescriptionItem>
            <DescriptionTerm>Followers</DescriptionTerm>
            <DescriptionDetails>
              <DescriptionItem>
                <DescriptionTerm>inner</DescriptionTerm>
                <DescriptionDetails>1</DescriptionDetails>
              </DescriptionItem>
            </DescriptionDetails>
          </DescriptionItem>
        </DescriptionList>,
      ),
    ).toThrow("<DescriptionItem> must be rendered inside a <DescriptionList>.");
  });

  it("refuses a detail inside a detail", () => {
    expect(() =>
      render(
        <DescriptionList>
          <DescriptionItem>
            <DescriptionTerm>Followers</DescriptionTerm>
            <DescriptionDetails>
              <DescriptionDetails>128</DescriptionDetails>
            </DescriptionDetails>
          </DescriptionItem>
        </DescriptionList>,
      ),
    ).toThrow("<DescriptionDetails> must be rendered inside a <DescriptionItem>.");
  });

  it("but a WHOLE NESTED LIST inside a detail works, because a dd may hold flow content", () => {
    // The positive anchor, and the reason the fix resets the context rather than
    // refusing by element: `<dd><dl>…</dl></dd>` is valid, and the inner list
    // re-provides both contexts. Without this arm the fix could have been "refuse
    // everything below a detail", which would be wrong.
    render(
      <DescriptionList>
        <DescriptionItem>
          <DescriptionTerm>Breakdown</DescriptionTerm>
          <DescriptionDetails>
            <DescriptionList>
              <DescriptionItem>
                <DescriptionTerm>Median</DescriptionTerm>
                <DescriptionDetails>4.3</DescriptionDetails>
              </DescriptionItem>
            </DescriptionList>
          </DescriptionDetails>
        </DescriptionItem>
      </DescriptionList>,
    );
    const terms = screen.getAllByRole("term");
    expect(terms).toHaveLength(2);
    // The inner dl really is inside the outer dd, and the inner dt's own parent
    // chain reaches a dl - which is what axe's `dlitem` check walks.
    const inner = screen.getByText("Median");
    expect(inner.closest("dd")).not.toBeNull();
    expect(inner.parentElement!.parentElement!.tagName).toBe("DL");
  });
});

describe("role and asChild are refused on the parts that own an element (layer 1, MED-1/MED-2)", () => {
  it("refuses a role on the term or the detail, which would destroy the association", () => {
    // `role="presentation"` leaves the DOM shape reading DT,DD - so `groupsOf`
    // and the consuming product's own `["DT","DD"]` assertion both still pass -
    // while the computed `term` / `definition` roles are gone. Nothing structural
    // can see it, so it is refused rather than observed.
    for (const [part, Part] of [
      ["DescriptionTerm", DescriptionTerm],
      ["DescriptionDetails", DescriptionDetails],
    ] as const) {
      expect(() =>
        render(
          <DescriptionList>
            <DescriptionItem>
              {part === "DescriptionTerm" ? (
                <Part role="presentation">Followers</Part>
              ) : (
                <DescriptionTerm>Followers</DescriptionTerm>
              )}
              {part === "DescriptionDetails" ? (
                <Part role="presentation">128</Part>
              ) : (
                <DescriptionDetails>128</DescriptionDetails>
              )}
            </DescriptionItem>
          </DescriptionList>,
        ),
      ).toThrow(`<${part}> does not take "role"`);
      cleanup();
    }
  });

  it("refuses asChild on all FOUR parts, which is what the docblock claims", () => {
    // It was two of four at `41f243a6` while three sentences said four, and React
    // 19 drops the unknown prop silently so there was not even a stray attribute.
    const asChild = { asChild: true } as unknown as Record<string, never>;
    expect(() => render(<DescriptionList {...asChild}>x</DescriptionList>)).toThrow(
      '<DescriptionList> does not take "asChild"',
    );
    expect(() =>
      render(
        <DescriptionList>
          <DescriptionItem {...asChild}>x</DescriptionItem>
        </DescriptionList>,
      ),
    ).toThrow('<DescriptionItem> does not take "asChild"');
  });
});

describe("the content model's script-supporting elements are allowed (layer 1, LOW-3)", () => {
  it("permits a template beside the pair, which the spec permits and axe ignores", () => {
    // Both `dl` and the group `div` are specified as "… optionally intermixed
    // with script-supporting elements". The first draft threw, and its message
    // claimed an axe `definition-list` failure that does not apply to these two:
    // axe's `getInvalidSelector` skips anything not exposed to a screen reader.
    render(
      <DescriptionList>
        <DescriptionItem>
          <DescriptionTerm>Developer</DescriptionTerm>
          <DescriptionDetails>Studio Nine</DescriptionDetails>
          <template data-testid="tpl" />
        </DescriptionItem>
      </DescriptionList>,
    );
    expect(screen.getByRole("term")).toHaveTextContent("Developer");
    expect(screen.getByTestId("tpl").tagName).toBe("TEMPLATE");
  });
});

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Checkbox, CheckboxBox, CheckboxIndicator, CheckboxInput } from "../src/checkbox.js";
import {
  RadioGroup,
  RadioGroupCircle,
  RadioGroupIndicator,
  RadioGroupInput,
  RadioGroupItem,
} from "../src/radio-group.js";

/**
 * The claims that exist ACROSS renders or across the contract, which a story with
 * one control cannot state: the refusals, the generated group name, and the two
 * places a caller may put the group's accessible name.
 *
 * Everything a single composition can say is said in a story play instead
 * (`stories/checkbox.stories.tsx`, `stories/radio-group.stories.tsx`), because a
 * story is what a consumer copies. This file is the other half, and
 * `choice-drawing.test.tsx` is the third: the pixels and the cascade.
 *
 * ⚠️ A render that THROWS is the deliverable in half of these. The quiet version
 * of every refusal here is a control that looks entirely normal and is wrong
 * underneath: a `for` on a `<span>`, a radio with no group, two groups sharing one
 * name so that choosing in one clears the other.
 */

afterEach(cleanup);

const box = (
  <CheckboxBox>
    <CheckboxIndicator />
  </CheckboxBox>
);

describe("the row is a label, and asChild is refused on both families", () => {
  // `asChild` is not in either part's props type, so this is the JS caller's
  // route: TypeScript already refuses it, and the throw is what stops it landing
  // in a JavaScript consumer - where React 19 drops an unknown prop silently, so
  // there would not even be a stray attribute to notice.
  const asChild = { asChild: true } as unknown as { children?: React.ReactNode };

  it("Checkbox refuses it, naming the element and the reason", () => {
    expect(() =>
      render(
        <Checkbox {...asChild}>
          <span>Spoilers</span>
        </Checkbox>,
      ),
    ).toThrow('<Checkbox> does not take "asChild"');
  });

  it("RadioGroupItem refuses it too", () => {
    expect(() =>
      render(
        <RadioGroup aria-label="Rules">
          <RadioGroupItem {...asChild}>
            <span>Ads</span>
          </RadioGroupItem>
        </RadioGroup>,
      ),
    ).toThrow('<RadioGroupItem> does not take "asChild"');
  });

  it("but the GROUP takes it, because two real sites draw their options as a list", () => {
    render(
      <RadioGroup asChild>
        <ul aria-label="Rules">
          <li>
            <RadioGroupItem>
              <RadioGroupInput value="ads" />
              <span>Ads</span>
            </RadioGroupItem>
          </li>
        </ul>
      </RadioGroup>,
    );
    const group = screen.getByRole("radiogroup", { name: "Rules" });
    expect(group.tagName).toBe("UL");
    expect(screen.getByRole("radio", { name: "Ads" })).toBeInTheDocument();
  });
});

describe("the group's accessible name", () => {
  it("refuses to render without one, which is stricter than axe on purpose", () => {
    expect(() =>
      render(
        <RadioGroup>
          <RadioGroupItem>
            <RadioGroupInput value="ads" />
            <span>Ads</span>
          </RadioGroupItem>
        </RadioGroup>,
      ),
    ).toThrow("<RadioGroup> needs an accessible name");
  });

  it("takes it from aria-label, from aria-labelledby, or from an asChild child", () => {
    const item = (
      <RadioGroupItem>
        <RadioGroupInput value="ads" />
        <span>Ads</span>
      </RadioGroupItem>
    );
    render(<RadioGroup aria-label="By label">{item}</RadioGroup>);
    expect(screen.getByRole("radiogroup", { name: "By label" })).toBeInTheDocument();
    cleanup();

    render(
      <>
        <p id="heading">By heading</p>
        <RadioGroup aria-labelledby="heading">{item}</RadioGroup>
      </>,
    );
    expect(screen.getByRole("radiogroup", { name: "By heading" })).toBeInTheDocument();
    cleanup();

    // The one that is easy to get wrong: with `asChild` the caller's name is on
    // the CHILD, not in this part's props, so a refusal that read only its own
    // props would reject a perfectly named group.
    render(
      <RadioGroup asChild>
        <fieldset aria-label="By child">{item}</fieldset>
      </RadioGroup>,
    );
    expect(screen.getByRole("radiogroup", { name: "By child" })).toBeInTheDocument();
  });
});

describe("an empty name is no name, and a role of the caller's is refused", () => {
  const item = (
    <RadioGroupItem>
      <RadioGroupInput value="ads" />
      <span>Ads</span>
    </RadioGroupItem>
  );

  it("refuses an EMPTY aria-label, which is how an untitled group arrives", () => {
    // layer 1, MED-1: `aria-label={group.title}` with an untitled set passes a
    // present attribute that names nothing, and the screen reader says "group".
    for (const label of ["", "   "]) {
      expect(() => render(<RadioGroup aria-label={label}>{item}</RadioGroup>)).toThrow(
        "<RadioGroup> needs an accessible name",
      );
      cleanup();
    }
  });

  it("takes a <legend>, which is the fieldset shape its own props docblock advertises", () => {
    // layer 1, MED-2: the docblock offers a `<fieldset>` host and the first
    // edition threw on the native named group. The name is read back with the
    // same instrument every other arm here uses.
    render(
      <RadioGroup asChild>
        <fieldset>
          <legend>Which rule does it break?</legend>
          {item}
        </fieldset>
      </RadioGroup>,
    );
    const group = screen.getByRole("radiogroup", { name: "Which rule does it break?" });
    expect(group.tagName).toBe("FIELDSET");
  });

  it("refuses a role, on the part and on an asChild child", () => {
    // layer 1, MED-3: `Slot` gives the child's props precedence, so
    // `<RadioGroup asChild><ul role="list">` rendered a named LIST of radios that
    // belong to no group - with the name refusal satisfied and nothing else to see.
    expect(() =>
      render(
        <RadioGroup aria-label="Rules" role="group">
          {item}
        </RadioGroup>,
      ),
    ).toThrow('<RadioGroup> writes role="radiogroup" itself');
    cleanup();
    expect(() =>
      render(
        <RadioGroup asChild>
          <ul role="list" aria-label="Rules">
            {item}
          </ul>
        </RadioGroup>,
      ),
    ).toThrow('<RadioGroup> writes role="radiogroup" itself');
  });
});

describe("the group owns the shared name, and that is why it is a part", () => {
  const group = (label: string, name?: string) => (
    <RadioGroup aria-label={label} name={name}>
      {["a", "b"].map((value) => (
        <RadioGroupItem key={value}>
          <RadioGroupInput value={value} />
          <RadioGroupCircle>
            <RadioGroupIndicator />
          </RadioGroupCircle>
          <span>{`${label} ${value}`}</span>
        </RadioGroupItem>
      ))}
    </RadioGroup>
  );

  it("gives every radio in one group the same name, generated when none is passed", () => {
    render(group("First"));
    const names = screen.getAllByRole("radio").map((radio) => radio.getAttribute("name"));
    expect(names).toHaveLength(2);
    expect(new Set(names).size).toBe(1);
    expect(names[0]).toBeTruthy();
  });

  it("gives TWO groups on one page two different names, which is what keeps them apart", () => {
    // The defect this prevents is invisible until somebody uses the page: with
    // one name across both groups, choosing in the second clears the first, and
    // the browser does it - no React state is involved and nothing logs.
    render(
      <>
        {group("First")}
        {group("Second")}
      </>,
    );
    const nameOf = (label: string) =>
      screen.getByRole("radio", { name: `${label} a` }).getAttribute("name");
    expect(nameOf("First")).not.toBe(nameOf("Second"));

    // …and the browser proves the separation: checking in one leaves the other alone.
    screen.getByText("First a").click();
    screen.getByText("Second b").click();
    expect(screen.getByRole("radio", { name: "First a" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Second b" })).toBeChecked();
  });

  it("uses the caller's name when there is a form field to match", () => {
    render(group("First", "reason"));
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toHaveAttribute("name", "reason");
    }
  });

  it("refuses a name on the INPUT, which would split one group in two", () => {
    expect(() =>
      render(
        <RadioGroup aria-label="Rules">
          <RadioGroupItem>
            {/* @ts-expect-error - `name` is omitted from the props type; this is the JS route. */}
            <RadioGroupInput value="ads" name="mine" />
            <span>Ads</span>
          </RadioGroupItem>
        </RadioGroup>,
      ),
    ).toThrow('<RadioGroupInput> does not take "name"');
  });

  it("throws outside a group rather than rendering an ungrouped radio", () => {
    expect(() => render(<RadioGroupInput value="ads" />)).toThrow(
      "<RadioGroupInput> must be rendered inside a <RadioGroup>",
    );
  });

  it("and the CHECKBOX's input throws outside its row for the same kind of reason", () => {
    // layer 1, LOW-2: decision 11 keeps the drawing parts context-free because
    // their failure is visible - an unlit box. An orphan input is the other kind:
    // `absolute inset-0 opacity-0` with no accessible name, over whichever
    // ancestor happens to be positioned.
    expect(() => render(<CheckboxInput />)).toThrow(
      "<CheckboxInput> must be rendered inside a <Checkbox>",
    );
  });
});

describe("the parts carry their slots, their own classes and the caller's", () => {
  it("gives every part a data-slot and puts the caller's class after the family's", () => {
    render(
      <Checkbox className="w-full justify-between">
        <span>Spoilers</span>
        <CheckboxInput data-testid="in" className="peer" />
        {box}
      </Checkbox>,
    );
    const row = screen.getByText("Spoilers").closest("[data-slot]")!;
    expect(row.getAttribute("data-slot")).toBe("checkbox");
    expect(row.getAttribute("class")).toContain("w-full justify-between");
    // The family's own string is still there: a `className` REPLACING it is the
    // failure this arm exists for, and `cn` is what makes it an append.
    expect(row.getAttribute("class")).toContain("min-h-hit");
    expect(screen.getByTestId("in").getAttribute("class")).toContain("peer");
    expect(screen.getByTestId("in")).toHaveAttribute("type", "checkbox");
    expect(document.querySelector('[data-slot="checkbox-box"]')).not.toBeNull();
    expect(document.querySelector('[data-slot="checkbox-indicator"]')).not.toBeNull();
  });

  it("draws the house tick, and only the caller's mark when there is one", () => {
    render(
      <Checkbox>
        <CheckboxInput />
        <CheckboxBox>
          <CheckboxIndicator data-testid="house" />
        </CheckboxBox>
      </Checkbox>,
    );
    const house = screen.getByTestId("house");
    expect(house.tagName).toBe("svg");
    expect(house).toHaveAttribute("aria-hidden", "true");
    expect(house.querySelectorAll("path")).toHaveLength(1);
    const housePath = house.querySelector("path")!.getAttribute("d");
    cleanup();

    render(
      <Checkbox>
        <CheckboxInput />
        <CheckboxBox>
          <CheckboxIndicator data-testid="mine">
            <circle cx="8" cy="8" r="3" />
          </CheckboxIndicator>
        </CheckboxBox>
      </Checkbox>,
    );
    const mine = screen.getByTestId("mine");
    expect(mine.querySelector("circle")).not.toBeNull();
    // The house tick is REPLACED, not drawn underneath: two marks in one box is
    // what a `children ?? default` written the other way around produces.
    expect(mine.querySelectorAll("path")).toHaveLength(0);
    expect(housePath).toBeTruthy();
  });

  it("fixes the input's type in both families, so a part cannot become the other one", () => {
    render(
      <RadioGroup aria-label="Rules">
        <RadioGroupItem>
          <RadioGroupInput data-testid="radio" value="ads" />
          <span>Ads</span>
        </RadioGroupItem>
      </RadioGroup>,
    );
    expect(screen.getByTestId("radio")).toHaveAttribute("type", "radio");
  });
});

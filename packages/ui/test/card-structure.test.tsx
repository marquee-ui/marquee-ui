import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";

import { Card, CardTitle } from "@/card";

/**
 * `Card` and `CardTitle` render the CALLER'S element through `asChild`, and keep
 * their own slot and drawing on it.
 *
 * A card is a generic container whose right element is the consumer's (an
 * `<article>` a reader selects by tag, a `<section>`, an `<li>`), and a title's
 * heading LEVEL is the page's, not the part's. Neither has the content-model reason
 * `RadioGroupItem` and `Checkbox` refuse on. The other four parts take no `asChild`:
 * nothing has asked for another element there.
 *
 * Each case reads the element by its SLOT and then asks what it IS, so a render that
 * dropped the prop and wrapped the child in the part's own `div` (what the part did
 * before 0.1.7) reads as the wrong element rather than passing on the child's text.
 */
/**
 * React never writes a boolean to an unknown attribute, so a leaked `asChild` shows
 * only as the warning it logs, and React logs it ONCE per prop per module: the first
 * render that leaks it, whichever test that is. So every test is watched from its
 * first render (layer 1 r5 LOW-3: an attribute check could not fail, and a spy
 * installed mid-test missed the warning the test's first render had already spent).
 */
let errors: MockInstance<typeof console.error>;
beforeEach(() => {
  errors = vi.spyOn(console, "error");
});
afterEach(() => {
  const leaked = errors.mock.calls
    .flat()
    .map(String)
    .filter((m) => /asChild/i.test(m));
  errors.mockRestore();
  cleanup();
  expect(leaked, "asChild reached a DOM element").toEqual([]);
});

const tokens = (element: Element): string[] =>
  (element.getAttribute("class") ?? "").split(/\s+/).filter(Boolean).sort();

/** The one element carrying `data-slot="<slot>"`. */
function slot(slotName: string): HTMLElement {
  const found = document.querySelectorAll<HTMLElement>(`[data-slot="${slotName}"]`);
  expect(found, `expected exactly one [data-slot="${slotName}"]`).toHaveLength(1);
  return found[0]!;
}

/** The part's own drawing, read off its default render rather than retyped. */
function ownTokens(mount: () => void, slotName: string): string[] {
  mount();
  const out = tokens(slot(slotName));
  cleanup();
  return out;
}

describe("Card renders the caller's element through asChild", () => {
  it("renders an <article> as the card, with the slot and the drawing on it", () => {
    const drawing = ownTokens(() => render(<Card />), "card");
    expect(drawing, "the default card wears no class: the read is empty").toContain("border-2");

    const { container } = render(
      <Card asChild>
        <article aria-label="A review">body</article>
      </Card>,
    );
    const card = slot("card");
    expect(card.tagName, "the card is not the caller's element").toBe("ARTICLE");
    expect(container.firstElementChild, "the part wrapped the caller's element").toBe(card);
    expect(tokens(card), "the article does not wear the card's drawing").toEqual(drawing);
    expect(card).toHaveAttribute("aria-label", "A review");
    expect(card).toHaveTextContent("body");
  });

  it("joins the caller's class on the part with the child's own", () => {
    const drawing = ownTokens(() => render(<Card />), "card");
    render(
      <Card asChild className="relative">
        <article className="w-71">body</article>
      </Card>,
    );
    expect(tokens(slot("card"))).toEqual([...drawing, "relative", "w-71"].sort());
  });

  it("stays a <div> without it, and with asChild={false}", () => {
    render(<Card>body</Card>);
    expect(slot("card").tagName).toBe("DIV");
    cleanup();
    render(<Card asChild={false}>body</Card>);
    expect(slot("card").tagName).toBe("DIV");
  });
});

describe("CardTitle renders the caller's heading level through asChild", () => {
  it("renders an <h2> as the title, with the slot and the drawing on it", () => {
    const drawing = ownTokens(() => render(<CardTitle>Hollow Knight</CardTitle>), "card-title");
    expect(drawing).toContain("font-display");

    const { container } = render(
      <CardTitle asChild>
        <h2>Hollow Knight</h2>
      </CardTitle>,
    );
    const title = slot("card-title");
    expect(title.tagName, "the title is not the caller's element").toBe("H2");
    expect(container.firstElementChild).toBe(title);
    expect(tokens(title)).toEqual(drawing);
    expect(screen.getByRole("heading", { level: 2, name: "Hollow Knight" })).toBe(title);
  });

  it("stays an <h3> without it", () => {
    render(<CardTitle>Hollow Knight</CardTitle>);
    expect(slot("card-title").tagName).toBe("H3");
    expect(screen.getByRole("heading", { level: 3, name: "Hollow Knight" })).toBeInTheDocument();
  });
});

import { cleanup, render } from "@testing-library/react";
import { composeStories } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { STORY_SUITES, storySuiteNames } from "./helpers/story-suites.js";

/**
 * Compose every story and run each declared play in jsdom. Vitest's assertion
 * requirement below is satisfied by the real storybook/test assertions, not by
 * the invocation counters. Omitting a play call or replacing it with a no-op
 * must fail that story even when the counters still claim it ran.
 *
 * This proves execution and the assertions each play contains. Compiled-style
 * tests and isolated browser journeys separately cover geometry and paint;
 * passing this corpus does not establish every API or composition.
 */

const SUITES = STORY_SUITES;

/**
 * `composeStories` returns a map whose values widen to `unknown` through a
 * namespace import, so the shape a story is USED as is stated once here rather
 * than cast at each call site. No `any`: the two members this file touches are
 * the render function and the optional play.
 */
type PlayableStory = ((props?: Record<string, unknown>) => ReactElement) & {
  play?: (context: { canvasElement: HTMLElement }) => Promise<void> | void;
};

const storiesOf = (module: object): [string, PlayableStory][] =>
  Object.entries(composeStories(module as Parameters<typeof composeStories>[0])) as [
    string,
    PlayableStory,
  ][];

afterEach(cleanup);

/** Exact inventory catches stories or composed plays disappearing altogether. */
const DECLARED_PLAYS = 185;
const DECLARED_STORIES = 215;

describe("every story renders, and every play function passes", () => {
  const seen: string[] = [];
  const withPlay: string[] = [];
  const ran: string[] = [];

  for (const [name, module] of Object.entries(SUITES)) {
    const entries = storiesOf(module);

    it(`${name}: has stories`, () => {
      expect(entries.length).toBeGreaterThan(0);
    });

    for (const [storyName, Story] of entries) {
      const id = `${name}/${storyName}`;
      seen.push(id);
      if (typeof Story.play === "function") withPlay.push(id);
      it(id, async () => {
        const { container } = render(<Story />);
        if (typeof Story.play !== "function") return;
        expect.hasAssertions();
        await Story.play({ canvasElement: container });
        ran.push(id);
      });
    }
  }

  it("covers all thirty-five part families, with every story counted", () => {
    // The anchor: a loop that silently composed nothing would pass in silence.
    // Checked against the FILES rather than against a list retyped here, so a
    // part that never entered the shared map reddens instead of vanishing
    // (layer 1 of the Switch, MED-2).
    expect(Object.keys(SUITES).sort()).toEqual(storySuiteNames());
    expect(storySuiteNames()).toHaveLength(35);
    // Exact, not a floor: a floor of 35 tolerated seven stories vanishing.
    expect(seen).toHaveLength(DECLARED_STORIES);
  });

  it(`runs all ${DECLARED_PLAYS} play functions, and knows if one stopped running`, () => {
    expect(withPlay, "stories whose play was composed").toHaveLength(DECLARED_PLAYS);
    expect(ran, "plays that actually executed").toEqual(withPlay);
  });
});

import { cleanup, render } from "@testing-library/react";
import { composeStories } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it } from "vitest";

import * as accordion from "../stories/accordion.stories.js";
import * as badge from "../stories/badge.stories.js";
import * as button from "../stories/button.stories.js";
import * as card from "../stories/card.stories.js";
import * as input from "../stories/input.stories.js";
import * as label from "../stories/label.stories.js";
import * as ribbon from "../stories/ribbon.stories.js";
import * as separator from "../stories/separator.stories.js";
import * as sheet from "../stories/sheet.stories.js";
import * as toast from "../stories/toast.stories.js";

/**
 * D4: the stories ARE the tests. One render to maintain, not two.
 *
 * Every story in the package is composed and rendered here, and every `play`
 * function is run. A story that renders nothing, or whose interaction assertion
 * has rotted, reddens `pnpm test` rather than waiting for someone to open
 * Storybook.
 *
 * WHY jsdom and `composeStories` rather than Storybook's browser-mode runner:
 * the browser runner needs a Playwright chromium download in CI and on every
 * contributor's machine, for assertions that are all DOM-shaped (roles, focus,
 * attributes, portals). The one thing a browser would add that jsdom cannot is
 * COMPUTED STYLE - and that is proved directly and more cheaply by
 * `tailwind-compile.test.ts`, which compiles these very sources against the real
 * emitted stylesheet and reads the declarations the utilities produce. So the two
 * halves are split by instrument rather than merged into a slow one.
 */

const SUITES = {
  accordion,
  badge,
  button,
  card,
  input,
  label,
  ribbon,
  separator,
  sheet,
  toast,
};

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

describe("every story renders, and every play function passes", () => {
  const seen: string[] = [];

  for (const [name, module] of Object.entries(SUITES)) {
    const entries = storiesOf(module);

    it(`${name}: has stories`, () => {
      expect(entries.length).toBeGreaterThan(0);
    });

    for (const [storyName, Story] of entries) {
      seen.push(`${name}/${storyName}`);
      it(`${name}/${storyName}`, async () => {
        const { container } = render(<Story />);
        await Story.play?.({ canvasElement: container });
      });
    }
  }

  it("covers all ten part families, with every story counted", () => {
    // The anchor: a loop that silently composed nothing would pass in silence.
    expect(Object.keys(SUITES).sort()).toEqual([
      "accordion",
      "badge",
      "button",
      "card",
      "input",
      "label",
      "ribbon",
      "separator",
      "sheet",
      "toast",
    ]);
    expect(seen.length).toBeGreaterThanOrEqual(35);
  });
});

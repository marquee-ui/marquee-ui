import { composeStories } from "@storybook/react-vite";
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeAll, expect, it } from "vitest";
import { loadCompiledSheet, type CompiledSheet } from "./helpers/compiled-sheet.js";
import * as tabsStories from "../stories/tabs.stories.js";

const stories = composeStories(tabsStories);
let sheet: CompiledSheet;
beforeAll(async () => {
  sheet = await loadCompiledSheet();
}, 60_000);
afterEach(cleanup);

// The generic source inventory combines a file's tokens. Measure each host so
// a panel's outline cannot cover for a trigger that lost its own focus width.
it.each(["Default", "Composition"] as const)(
  "%s gives every tab and panel host its own compiled focus outline",
  (name) => {
    const Story = stories[name];
    const { container } = render(<Story />);
    const hosts = [...container.querySelectorAll('[role="tab"], [role="tabpanel"]')];
    expect(hosts.length, "real keyboard hosts were rendered").toBeGreaterThanOrEqual(4);
    for (const host of hosts) {
      const focus = (host.getAttribute("class") ?? "")
        .split(/\s+/)
        .filter((token) => token.startsWith("focus-visible:"));
      const label = `${name}/${host.getAttribute("role")}/${host.textContent}`;
      expect(focus.length, `${label} has focus declarations`).toBeGreaterThan(0);
      for (const token of focus) {
        const selectors = sheet.selectorsOf(token);
        expect(selectors.length, `${label} focus selector compiled`).toBeGreaterThan(0);
        for (const selector of selectors)
          expect(
            selector.endsWith(":focus-visible"),
            `${label} selector matches its own focus`,
          ).toBe(true);
      }
      expect(sheet.declared(focus, "outline-width"), `${label} owns its focus outline width`).toBe(
        2,
      );
      expect(
        sheet.declared(focus, "outline-offset"),
        `${label} focus separates from selection`,
      ).toBe(2);
      expect(
        sheet.declaredValues(focus, "outline-color"),
        `${label} focus reads an ink role`,
      ).toEqual(["var(--primary-ink)"]);
    }
  },
);

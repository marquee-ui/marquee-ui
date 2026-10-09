import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeAll, expect, it } from "vitest";
import { Calendar } from "../src/calendar";
import { loadCompiledSheet, type CompiledSheet } from "./helpers/compiled-sheet.js";

let sheet: CompiledSheet;
beforeAll(async () => {
  sheet = await loadCompiledSheet();
}, 60_000);
afterEach(cleanup);

it.each(["calendar-day-button", "calendar-navigation-button"])(
  "%s owns compiled focus and 44px geometry",
  (slot) => {
    const { container } = render(<Calendar mode="single" defaultMonth={new Date(2026, 9, 1)} />);
    const host = container.querySelector(`[data-slot="${slot}"]`)!;
    expect(host, `${slot} exists`).not.toBeNull();
    const classes = host.className.split(/\s+/);
    const focus = classes.filter((token) => token.startsWith("focus-visible:"));
    expect(sheet.declaredValues(focus, "outline-style"), `${slot} paints focus`).toContain("solid");
    expect(sheet.declared(focus, "outline-width"), `${slot} focus width`).toBe(2);
    expect(sheet.declared(focus, "outline-offset"), `${slot} focus offset`).toBe(2);
    expect(sheet.declaredValues(focus, "outline-color"), `${slot} focus ink`).toEqual([
      "var(--primary-ink)",
    ]);
    expect(sheet.declared(classes, "min-height"), `${slot} target height`).toBe(44);
    expect(sheet.declared(classes, "min-width"), `${slot} target width`).toBe(44);
  },
);

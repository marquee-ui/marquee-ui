import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, expect, it } from "vitest";
import {
  DatePicker,
  DatePickerClose,
  DatePickerContent,
  DatePickerTrigger,
} from "../src/date-picker";
import { loadCompiledSheet, type CompiledSheet } from "./helpers/compiled-sheet.js";

let sheet: CompiledSheet;
beforeAll(async () => {
  sheet = await loadCompiledSheet();
}, 60_000);
afterEach(cleanup);

it.each(["trigger", "panel", "close"])(
  "DatePicker %s inherits a compiled solid focus outline and role ink",
  (part) => {
    render(
      <DatePicker defaultOpen>
        <DatePickerTrigger>Open date</DatePickerTrigger>
        <DatePickerContent aria-label="Date focus">
          <DatePickerClose>Close date</DatePickerClose>
        </DatePickerContent>
      </DatePicker>,
    );
    const host =
      part === "panel"
        ? screen.getByRole("dialog", { name: "Date focus" })
        : screen.getByRole("button", { name: part === "trigger" ? "Open date" : "Close date" });
    const focus = host.className.split(/\s+/).filter((token) => token.startsWith("focus-visible:"));
    expect(sheet.declaredValues(focus, "outline-style"), `${part} solid focus`).toContain("solid");
    expect(sheet.declared(focus, "outline-width"), `${part} focus width`).toBe(2);
    expect(sheet.declared(focus, "outline-offset"), `${part} focus offset`).toBe(2);
    expect(sheet.declaredValues(focus, "outline-color"), `${part} focus ink`).toEqual([
      "var(--primary-ink)",
    ]);
    if (part !== "panel") {
      const classes = host.className.split(/\s+/);
      expect(sheet.declared(classes, "min-height"), `${part} height`).toBe(44);
      expect(sheet.declared(classes, "min-width"), `${part} width`).toBe(44);
    }
  },
);

it("DatePicker's compiled panel sizing grants a complete Calendar with usable padding", () => {
  render(
    <DatePicker defaultOpen>
      <DatePickerContent aria-label="Date sizing">Explicit content</DatePickerContent>
    </DatePicker>,
  );
  const classes = screen.getByRole("dialog", { name: "Date sizing" }).className.split(/\s+/);
  expect(sheet.declaredValues(classes, "width"), "panel intrinsic width").toEqual(["auto"]);
  expect(sheet.declared(classes, "padding"), "panel padding").toBe(8);
  expect(sheet.declared(classes, "border-width"), "panel border").toBe(2);
  expect(sheet.declaredValues(classes, "overflow-x"), "panel does not hide overflow").not.toContain(
    "hidden",
  );
});

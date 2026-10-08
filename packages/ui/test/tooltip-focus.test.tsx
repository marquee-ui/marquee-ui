import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, expect, it } from "vitest";
import { Tooltip, TooltipProvider, TooltipTrigger } from "../src/tooltip";
import { loadCompiledSheet, type CompiledSheet } from "./helpers/compiled-sheet.js";

let sheet: CompiledSheet;
beforeAll(async () => {
  sheet = await loadCompiledSheet();
}, 60_000);
afterEach(cleanup);

it("owns a compiled solid 2px focus outline independent of docs CSS", () => {
  render(
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>Save</TooltipTrigger>
      </Tooltip>
    </TooltipProvider>,
  );
  const classes = screen.getByRole("button", { name: "Save" }).className.split(/\s+/);
  const focus = classes.filter((token) => token.startsWith("focus-visible:"));
  expect(
    sheet.declaredValues(focus, "outline-style"),
    "Tooltip trigger paints a solid outline",
  ).toContain("solid");
  expect(sheet.declared(focus, "outline-width"), "Tooltip trigger outline width").toBe(2);
  expect(sheet.declared(focus, "outline-offset"), "Tooltip trigger outline offset").toBe(2);
  expect(
    sheet.declaredValues(focus, "outline-color"),
    "Tooltip trigger uses a focus ink role",
  ).toEqual(["var(--primary-ink)"]);
  expect(sheet.declared(classes, "min-height"), "Tooltip trigger target height").toBe(44);
  expect(sheet.declared(classes, "min-width"), "Tooltip trigger target width").toBe(44);
});

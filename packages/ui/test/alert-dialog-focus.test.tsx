import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, expect, it } from "vitest";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../src/alert-dialog";
import { loadCompiledSheet, type CompiledSheet } from "./helpers/compiled-sheet.js";

let sheet: CompiledSheet;
beforeAll(async () => {
  sheet = await loadCompiledSheet();
}, 60_000);
afterEach(cleanup);

it.each([false, true])(
  "native/composed=%s gives each control its own compiled target and focus paint",
  (asChild) => {
    render(
      <AlertDialog defaultOpen>
        <AlertDialogTrigger asChild={asChild}>
          {asChild ? <button>Open</button> : "Open"}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Confirm</AlertDialogTitle>
          <AlertDialogDescription>Review the change.</AlertDialogDescription>
          <AlertDialogCancel asChild={asChild}>
            {asChild ? <button>Cancel</button> : "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction asChild={asChild}>
            {asChild ? <button>Confirm change</button> : "Confirm change"}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>,
    );
    const controls = screen.getAllByRole("button", { hidden: true });
    expect(controls).toHaveLength(3);
    for (const control of controls) {
      const classes = control.className.split(/\s+/);
      const focus = classes.filter((name) => name.startsWith("focus-visible:"));
      const label = control.textContent;
      expect(sheet.declared(classes, "min-height"), `${label} target height`).toBe(44);
      expect(sheet.declared(classes, "min-width"), `${label} target width`).toBe(44);
      expect(sheet.declared(focus, "outline-width"), `${label} owns focus width`).toBe(2);
      expect(sheet.declared(focus, "outline-offset"), `${label} separates focus from border`).toBe(
        2,
      );
      expect(sheet.declaredValues(focus, "outline-style"), `${label} paints an outline`).toContain(
        "solid",
      );
      expect(sheet.declaredValues(focus, "outline-color"), `${label} uses readable ink`).toEqual([
        "var(--primary-ink)",
      ]);
      for (const token of focus) {
        const selectors = sheet.selectorsOf(token);
        expect(selectors.length, `${label} focus compiles`).toBeGreaterThan(0);
        for (const selector of selectors)
          expect(selector.endsWith(":focus-visible"), `${label} matches its own focus`).toBe(true);
      }
    }
  },
);

it.each([
  ["primary", "var(--primary)", "var(--primary-foreground)", "var(--primary)"],
  ["destructive", "var(--destructive)", "var(--destructive)", "var(--surface)"],
] as const)(
  "%s Action preserves its compiled visual border, ink and ground",
  (variant, border, ink, ground) => {
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogTitle>Confirm</AlertDialogTitle>
          <AlertDialogDescription>Review the change.</AlertDialogDescription>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant={variant}>Confirm change</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>,
    );
    const action = screen.getByRole("button", { name: "Confirm change" });
    const resting = action.className.split(/\s+/).filter((token) => !token.includes(":"));
    expect(sheet.declaredValues(resting, "border-color"), `${variant} Action border role`).toEqual([
      border,
    ]);
    expect(sheet.declaredValues(resting, "color"), `${variant} Action ink role`).toEqual([ink]);
    expect(
      sheet.declaredValues(resting, "background-color"),
      `${variant} Action ground role`,
    ).toEqual([ground]);
  },
);

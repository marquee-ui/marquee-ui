import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeAll, expect, it } from "vitest";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "../src/dialog";
import { loadCompiledSheet, type CompiledSheet } from "./helpers/compiled-sheet.js";

let sheet: CompiledSheet;
beforeAll(async () => {
  sheet = await loadCompiledSheet();
}, 60_000);
afterEach(cleanup);

it.each(["dialog-trigger", "dialog-content", "dialog-close"])(
  "%s owns a compiled solid focus outline without docs CSS",
  (slot) => {
    const { container } = render(
      <Dialog defaultOpen>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Focus</DialogTitle>
          <DialogClose>Close</DialogClose>
        </DialogContent>
      </Dialog>,
    );
    const host = container.querySelector(`[data-slot="${slot}"]`)!;
    expect(host, `${slot} exists`).not.toBeNull();
    const focus = host.className.split(/\s+/).filter((token) => token.startsWith("focus-visible:"));
    expect(sheet.declaredValues(focus, "outline-style"), `${slot} paints an outline`).toContain(
      "solid",
    );
    expect(sheet.declared(focus, "outline-width"), `${slot} outline width`).toBe(2);
    expect(sheet.declared(focus, "outline-offset"), `${slot} outline offset`).toBe(2);
    expect(sheet.declaredValues(focus, "outline-color"), `${slot} uses an ink role`).toEqual([
      "var(--primary-ink)",
    ]);
  },
);

it.each(["dialog-trigger", "dialog-close"])("%s owns 44px height and width", (slot) => {
  const { container } = render(
    <Dialog defaultOpen>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle>Targets</DialogTitle>
        <DialogClose>Close</DialogClose>
      </DialogContent>
    </Dialog>,
  );
  const host = container.querySelector(`[data-slot="${slot}"]`)!;
  const classes = host.className.split(/\s+/);
  expect(sheet.declared(classes, "min-height"), `${slot} target height`).toBe(44);
  expect(sheet.declared(classes, "min-width"), `${slot} target width`).toBe(44);
});

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, expect, it } from "vitest";
import {
  DatePicker,
  DatePickerCalendar,
  DatePickerClose,
  DatePickerContent,
  DatePickerPortal,
  DatePickerTrigger,
} from "../src/date-picker";
import { Dialog, DialogContent, DialogPortal, DialogTitle, DialogTrigger } from "../src/dialog";
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
    expect(sheet.declared(focus, "outline-offset"), `${part} focus offset`).toBe(
      part === "panel" ? -4 : 2,
    );
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

it("naturally focuses an all-disabled Calendar panel on keyboard open inside Dialog, with inset focus paint", async () => {
  render(
    <Dialog>
      <DialogTrigger>Open schedule</DialogTrigger>
      <DialogPortal>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Schedule</DialogTitle>
          <DatePicker>
            <DatePickerTrigger>Choose unavailable dates</DatePickerTrigger>
            <DatePickerPortal>
              <DatePickerContent aria-label="Unavailable dates">
                <DatePickerCalendar
                  mode="single"
                  month={new Date(2026, 9, 1)}
                  disabled
                  hideNavigation
                />
              </DatePickerContent>
            </DatePickerPortal>
          </DatePicker>
        </DialogContent>
      </DialogPortal>
    </Dialog>,
  );
  await userEvent.tab();
  expect(screen.getByRole("button", { name: "Open schedule" })).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Choose unavailable dates" })).toHaveFocus(),
  );
  await userEvent.keyboard("{Enter}");
  const panel = await screen.findByRole("dialog", { name: "Unavailable dates" });
  await waitFor(() => expect(panel).toHaveFocus());
  expect(panel.querySelectorAll("button:not(:disabled)")).toHaveLength(0);
  expect(panel.querySelectorAll("button:disabled").length).toBeGreaterThanOrEqual(31);
  const focus = panel.className.split(/\s+/).filter((token) => token.startsWith("focus-visible:"));
  expect(
    sheet.declared(focus, "outline-offset"),
    "panel ring sits inside its own overlay ground",
  ).toBe(-4);
  await userEvent.keyboard("{Escape}");
  await waitFor(() =>
    expect(screen.queryByRole("dialog", { name: "Unavailable dates" })).toBeNull(),
  );
  expect(screen.getByRole("button", { name: "Choose unavailable dates" })).toHaveFocus();
  expect(screen.getByRole("dialog", { name: "Schedule" })).toBeInTheDocument();
});

it("allows callers to replace the panel's inset offset and role ink", () => {
  render(
    <DatePicker defaultOpen>
      <DatePickerContent
        aria-label="Caller focus"
        className="focus-visible:outline-offset-8 focus-visible:outline-foreground"
      >
        Caller content
      </DatePickerContent>
    </DatePicker>,
  );
  const focus = screen
    .getByRole("dialog", { name: "Caller focus" })
    .className.split(/\s+/)
    .filter((token) => token.startsWith("focus-visible:"));
  expect(focus).not.toContain("focus-visible:-outline-offset-4");
  expect(focus).not.toContain("focus-visible:outline-offset-2");
  expect(focus).toContain("focus-visible:outline-offset-8");
  expect(focus).toContain("focus-visible:outline-foreground");
  expect(focus).not.toContain("focus-visible:outline-primary-ink");
});

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

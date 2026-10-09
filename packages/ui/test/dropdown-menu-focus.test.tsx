import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeAll, expect, it } from "vitest";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "../src/dropdown-menu";
import { loadCompiledSheet, type CompiledSheet } from "./helpers/compiled-sheet.js";

let sheet: CompiledSheet;
beforeAll(async () => {
  sheet = await loadCompiledSheet();
}, 60_000);
afterEach(cleanup);

function Hosts() {
  return (
    <DropdownMenu defaultOpen modal={false}>
      <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Archive</DropdownMenuItem>
        <DropdownMenuCheckboxItem>Notifications</DropdownMenuCheckboxItem>
        <DropdownMenuRadioGroup value="compact">
          <DropdownMenuRadioItem value="compact">Compact</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSub defaultOpen>
          <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
          <DropdownMenuSubContent forceMount>
            <DropdownMenuItem>Copy link</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

it.each(["trigger", "content", "sub-content"])(
  "%s compiles solid focus ink without a primitive inline override",
  (slot) => {
    const { container } = render(<Hosts />);
    const host = container.querySelector<HTMLElement>(`[data-slot="dropdown-menu-${slot}"]`)!;
    expect(host, `${slot} exists`).not.toBeNull();
    const classes = host.className.split(/\s+/).filter((name) => name.startsWith("focus-visible:"));
    expect(host.style.outline, `${slot} does not suppress its stylesheet outline`).toBe("");
    expect(sheet.declaredValues(classes, "outline-style"), `${slot} outline paint`).toContain(
      "solid",
    );
    expect(sheet.declared(classes, "outline-width"), `${slot} outline width`).toBe(2);
    expect(sheet.declaredValues(classes, "outline-color"), `${slot} outline ink`).toEqual([
      "var(--primary-ink)",
    ]);
  },
);

it.each(["item", "checkbox-item", "radio-item", "sub-trigger"])(
  "%s compiles highlighted focus ink and a 44px target",
  (slot) => {
    const { container } = render(<Hosts />);
    const host = container.querySelector(`[data-slot="dropdown-menu-${slot}"]`)!;
    expect(host, `${slot} exists`).not.toBeNull();
    const classes = host.className.split(/\s+/);
    expect(sheet.declared(classes, "min-height"), `${slot} height`).toBe(44);
    expect(sheet.declared(classes, "min-width"), `${slot} width`).toBe(44);
    const highlighted = classes.filter((name) => name.startsWith("data-[highlighted]:"));
    expect(
      sheet.declaredValues(highlighted, "outline-style"),
      `${slot} highlighted outline paint`,
    ).toContain("solid");
    expect(sheet.declared(highlighted, "outline-width"), `${slot} highlighted outline width`).toBe(
      2,
    );
    expect(
      sheet.declaredValues(highlighted, "outline-color"),
      `${slot} highlighted outline ink`,
    ).toEqual(["var(--primary-ink)"]);
  },
);

it("Trigger compiles a 44px height and width", () => {
  const { container } = render(<Hosts />);
  const classes = container
    .querySelector('[data-slot="dropdown-menu-trigger"]')!
    .className.split(/\s+/);
  expect(sheet.declared(classes, "min-height"), "Trigger height").toBe(44);
  expect(sheet.declared(classes, "min-width"), "Trigger width").toBe(44);
});

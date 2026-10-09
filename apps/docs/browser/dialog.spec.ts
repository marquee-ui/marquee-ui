import { readFileSync } from "node:fs";
import { expect, test, type Locator } from "@playwright/test";

const example = readFileSync(new URL("../src/examples/dialog.tsx", import.meta.url), "utf8");

async function target(control: Locator) {
  await expect(control).toBeVisible();
  await control.scrollIntoViewIfNeeded();
  const box = await control.boundingBox();
  expect(box!.height, "Dialog control target height").toBeGreaterThanOrEqual(44);
  expect(box!.width, "Dialog control target width").toBeGreaterThanOrEqual(44);
  expect(
    await control.evaluate((el) => {
      const box = el.getBoundingClientRect();
      const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
      return el === hit || el.contains(hit);
    }),
    "Dialog control accepts a pointer at its center",
  ).toBe(true);
}

async function contrast(control: Locator, ground: Locator, property: "color" | "outlineColor") {
  const background = await ground.evaluate((el) => getComputedStyle(el).backgroundColor);
  return control.evaluate(
    (el, { background, property }) => {
      const luminance = (color: string) => {
        const channels = color
          .match(/[\d.]+/g)!
          .slice(0, 3)
          .map((value) => {
            const channel = Number(value) / 255;
            return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
          });
        return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
      };
      const ink = luminance(getComputedStyle(el)[property]);
      const fill = luminance(background);
      return (Math.max(ink, fill) + 0.05) / (Math.min(ink, fill) + 0.05);
    },
    { background, property },
  );
}

async function paintedFocus(control: Locator, ground: Locator, label: string) {
  await control.focus();
  await expect(control).toBeFocused();
  await control.evaluate(async (el) => {
    await Promise.all(el.getAnimations().map((animation) => animation.finished));
  });
  await expect(control, `${label} outline style`).toHaveCSS("outline-style", "solid");
  expect(
    await control.evaluate((el) => parseFloat(getComputedStyle(el).outlineWidth)),
    `${label} outline width`,
  ).toBeGreaterThanOrEqual(2);
  const ratio = await contrast(control, ground, "outlineColor");
  expect(ratio, `${label} outline contrast`).toBeGreaterThanOrEqual(3);
  await test.info().attach(label, {
    body: JSON.stringify({
      ...(await control.evaluate((el) => ({
        style: getComputedStyle(el).outlineStyle,
        width: getComputedStyle(el).outlineWidth,
      }))),
      contrast: ratio,
    }),
    contentType: "application/json",
  });
}

test("Dialog demo traps and restores keyboard focus, keeps Cancel form-safe and saves caller state", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("components/");
  await page.getByRole("button", { name: "Preview Dialog", exact: true }).click();
  const canvas = page.locator(".family-canvas");
  const trigger = canvas.getByRole("button", { name: "Edit project", exact: true });
  await target(trigger);
  await trigger.focus();
  await trigger.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Edit project", exact: true });
  await expect(dialog).toHaveAccessibleDescription("Save a name and priority for this project.");
  const field = dialog.getByRole("textbox", { name: "Project name" });
  await expect(field).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("button", { name: "Save project" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(field).toBeFocused();
  await field.fill("Workshop");
  const select = dialog.getByRole("combobox", { name: "Project priority" });
  await select.focus();
  await select.press("Enter");
  await expect(page.getByRole("option", { name: "Normal", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("option", { name: "Urgent", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(select).toHaveText("Urgent");
  await expect(select).toBeFocused();
  const close = dialog.getByRole("button", { name: "Cancel editing" });
  await target(close);
  await close.click();
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(canvas.getByRole("status")).toHaveText("Nothing saved yet.");
  await trigger.press("Space");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("textbox", { name: "Project name" }).fill("Workshop");
  await dialog.getByRole("button", { name: "Save project" }).click();
  await expect(canvas.getByRole("status")).toHaveText("Saved Workshop with normal priority.");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(errors).toEqual([]);
});

test("Dialog outside click dismisses, while canceled Escape and outside events keep a protected panel open", async ({
  page,
}) => {
  await page.goto("storybook/iframe.html?id=parts-dialog--default&viewMode=story&embed=true");
  const trigger = page.getByRole("button", { name: "Open project dialog" });
  await trigger.click();
  await expect(page.getByRole("dialog", { name: "Project details" })).toBeVisible();
  await page.mouse.click(8, 8);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("pointer-events", "none");
  await page.goto(
    "storybook/iframe.html?id=parts-dialog--prevented-close&viewMode=story&embed=true",
  );
  await page.getByRole("button", { name: "Open protected dialog" }).click();
  const protectedPanel = page.getByRole("dialog", { name: "Protected details" });
  await expect(protectedPanel).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(protectedPanel, "prevented Escape preserves the dialog").toBeVisible();
  await page.mouse.click(8, 8);
  await expect(protectedPanel, "prevented outside event preserves the dialog").toBeVisible();
  await protectedPanel.getByRole("button", { name: "Close protected dialog" }).click();
  await expect(protectedPanel).toHaveCount(0);
});

test("Nonmodal Dialog leaves outside controls available and dismisses on outside focus", async ({
  page,
}) => {
  await page.goto("storybook/iframe.html?id=parts-dialog--non-modal&viewMode=story&embed=true");
  const outside = page.getByRole("button", { name: "Outside action" });
  const trigger = page.getByRole("button", { name: "Open project dialog" });
  await trigger.click();
  await expect(page.getByRole("dialog", { name: "Project details" })).toBeVisible();
  await expect(page.locator('[data-slot="dialog-overlay"]')).toHaveCount(0);
  await outside.focus();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(outside).toBeFocused();
  await outside.click();
  await expect(page.getByLabel("Outside clicks")).toHaveText("1");
  await expect(page.locator("body")).not.toHaveCSS("pointer-events", "none");
});

test("Select inside Dialog owns option focus and only its own Escape layer", async ({ page }) => {
  await page.goto("storybook/iframe.html?id=parts-dialog--nested-select&viewMode=story&embed=true");
  const outside = page.getByRole("button", { name: "Open priority dialog" });
  await outside.click();
  const dialog = page.getByRole("dialog", { name: "Choose priority" });
  const trigger = dialog.getByRole("combobox", { name: "Priority" });
  await trigger.focus();
  await trigger.press("Enter");
  await expect(page.getByRole("option", { name: "Normal", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("option", { name: "Urgent", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveText("Urgent");
  await expect(trigger).toBeFocused();
  await expect(dialog).toBeVisible();
  await trigger.press("Enter");
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await expect(dialog, "Select Escape preserves its parent Dialog").toBeVisible();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(outside).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("pointer-events", "none");
  await outside.click();
  await expect(dialog).toBeVisible();
});

test("Dialog inside Sheet restores focus through separate Escape and outside dismissal layers", async ({
  page,
}) => {
  await page.goto("storybook/iframe.html?id=parts-dialog--nested-sheet&viewMode=story&embed=true");
  const outside = page.getByRole("button", { name: "Open parent sheet" });
  await outside.click();
  const sheet = page.getByRole("dialog", { name: "Parent sheet" });
  const trigger = sheet.getByRole("button", { name: "Open project dialog" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Project details" });
  const field = dialog.getByRole("textbox", { name: "Project name" });
  await expect(field).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("button", { name: "Done" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(field).toBeFocused();
  await expect(
    page.locator('[data-slot="sheet-content"]'),
    "the parent layer becomes inert while its child is active",
  ).toHaveCSS("pointer-events", "none");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(sheet).toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.press("Enter");
  await expect(dialog).toBeVisible();
  await expect(field).toBeFocused();
  await expect(page.locator('[data-slot="sheet-content"]')).toHaveCSS("pointer-events", "none");
  expect(
    await page
      .locator('[data-slot="dialog-overlay"]')
      .evaluate((el) => document.elementFromPoint(8, 8) === el),
    "the child overlay receives its own outside pointer",
  ).toBe(true);
  await page.mouse.click(8, 8);
  await expect(dialog, "outside pointer closes only the child").toHaveCount(0);
  await expect(sheet).toBeVisible();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(sheet).toHaveCount(0);
  await expect(outside).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("pointer-events", "none");
});

test("Tall Dialog stays centered within every viewport and scrolls to a hittable final action", async ({
  page,
}) => {
  await page.goto("storybook/iframe.html?id=parts-dialog--tall-content&viewMode=story&embed=true");
  const panel = page.getByRole("dialog", { name: "Long project notes" });
  await expect(panel).toBeVisible();
  const bounds = await panel.boundingBox();
  const viewport = page.viewportSize()!;
  expect(bounds!.x, "panel left edge").toBeGreaterThanOrEqual(16);
  expect(bounds!.y, "panel top edge").toBeGreaterThanOrEqual(16);
  expect(bounds!.x + bounds!.width, "panel right edge").toBeLessThanOrEqual(viewport.width - 16);
  expect(bounds!.y + bounds!.height, "panel bottom edge").toBeLessThanOrEqual(viewport.height - 16);
  expect(
    Math.abs(bounds!.x + bounds!.width / 2 - viewport.width / 2),
    "panel horizontal center",
  ).toBeLessThan(1);
  expect(
    Math.abs(bounds!.y + bounds!.height / 2 - viewport.height / 2),
    "panel vertical center",
  ).toBeLessThan(1);
  expect(
    await panel.evaluate((el) => el.scrollHeight > el.clientHeight),
    "tall panel has a real scroll region",
  ).toBe(true);
  await expect(panel).toHaveCSS("overflow-y", "auto");
  await expect(panel).toHaveCSS("overscroll-behavior", "contain");
  await panel.evaluate((el) => {
    el.scrollTop = 0;
  });
  await expect.poll(async () => panel.evaluate((el) => el.scrollTop)).toBe(0);
  const close = panel.getByRole("button", { name: "Finish reading" });
  await close.scrollIntoViewIfNeeded();
  expect(
    await panel.evaluate((el) => el.scrollTop),
    "final action requires scrolling",
  ).toBeGreaterThan(0);
  await target(close);
  await page.screenshot({ path: test.info().outputPath("dialog-tall.png") });
  await close.click();
  await expect(panel).toHaveCount(0);
});

test("Dialog hosts paint readable focus in isolated dark, light, accent and forced colors", async ({
  page,
}) => {
  await page.goto("components/");
  await page.getByRole("button", { name: "Light", exact: true }).click();
  await page.getByRole("button", { name: /^Customize theme:/ }).click();
  await page.getByRole("radio", { name: /^Violet\b/ }).click();
  await page.keyboard.press("Escape");
  const accent = await page.locator("html").evaluate((el) => {
    const style = getComputedStyle(el);
    return Object.fromEntries(
      ["--primary", "--primary-foreground", "--primary-ink", "--primary-muted"].map((role) => [
        role,
        style.getPropertyValue(role),
      ]),
    );
  });
  for (const [mode, preset] of [
    ["Dark", "arcade"],
    ["Light", "light"],
    ["Accent", "light"],
  ] as const) {
    await page.goto(
      `storybook/iframe.html?id=parts-dialog--default&viewMode=story&embed=true&globals=preset:${preset}`,
    );
    await expect(page.locator("html")).toHaveCSS(
      "color-scheme",
      preset === "light" ? "light" : "dark",
    );
    if (mode === "Accent")
      await page.locator("html").evaluate((el, roles) => {
        for (const [role, value] of Object.entries(roles)) el.style.setProperty(role, value);
      }, accent);
    const trigger = page.getByRole("button", { name: "Open project dialog" });
    await page.keyboard.press("Tab");
    await paintedFocus(trigger, trigger, `${mode} isolated trigger`);
    expect(
      await contrast(trigger, trigger, "color"),
      `${mode} trigger text contrast`,
    ).toBeGreaterThanOrEqual(4.5);
    await trigger.press("Enter");
    const panel = page.getByRole("dialog", { name: "Project details" });
    await expect(panel).toBeVisible();
    const close = panel.getByRole("button", { name: "Done" });
    await paintedFocus(close, panel, `${mode} isolated Close`);
    await target(close);
    expect(
      await contrast(close, close, "color"),
      `${mode} Close text contrast`,
    ).toBeGreaterThanOrEqual(4.5);
    await paintedFocus(panel, panel, `${mode} isolated Content`);
    expect(
      await contrast(panel, panel, "color"),
      `${mode} Content text contrast`,
    ).toBeGreaterThanOrEqual(4.5);
    await page.screenshot({ path: test.info().outputPath(`dialog-${mode.toLowerCase()}.png`) });
    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);
  }
  await page.emulateMedia({ forcedColors: "active" });
  const trigger = page.getByRole("button", { name: "Open project dialog" });
  await page.keyboard.press("Tab");
  await paintedFocus(trigger, trigger, "forced-colors trigger");
  await trigger.press("Enter");
  const panel = page.getByRole("dialog", { name: "Project details" });
  await expect(panel).toBeVisible();
  await paintedFocus(panel.getByRole("button", { name: "Done" }), panel, "forced-colors Close");
  await paintedFocus(panel, panel, "forced-colors Content");
  await expect(panel).toHaveCSS("border-top-style", "solid");
  expect(
    await panel.evaluate((el) => parseFloat(getComputedStyle(el).borderTopWidth)),
    "forced-colors panel boundary width",
  ).toBeGreaterThanOrEqual(2);
  expect(
    await panel.evaluate((el) => getComputedStyle(el).borderTopColor),
    "forced-colors panel boundary ink",
  ).not.toBe(await panel.evaluate((el) => getComputedStyle(el).backgroundColor));
});

test("Dialog live composition is highlighted and copies exact local-alias source bytes", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("components/");
  await page.getByRole("button", { name: "Preview Dialog", exact: true }).click();
  const block = page.locator(".family-detail .code-block");
  const code = block.locator("pre code");
  expect(await code.textContent()).toBe(example);
  expect(await code.locator(".token").count(), "TSX syntax is highlighted").toBeGreaterThan(20);
  await block.getByRole("button", { name: "Copy Dialog composition" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(example);
  await expect(block.getByRole("status")).toHaveText("Copied to clipboard");
  await expect(page.locator(".family-canvas")).toContainText("Unreleased candidate.");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
});

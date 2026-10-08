import { readFileSync } from "node:fs";
import { expect, test, type Locator } from "@playwright/test";

const example = readFileSync(new URL("../src/examples/popover.tsx", import.meta.url), "utf8");

async function target(control: Locator) {
  await expect(control).toBeVisible();
  await control.scrollIntoViewIfNeeded();
  const box = await control.boundingBox();
  expect(box!.height, "Popover control target height").toBeGreaterThanOrEqual(44);
  expect(box!.width, "Popover control target width").toBeGreaterThanOrEqual(44);
  expect(
    await control.evaluate((el) => {
      const bounds = el.getBoundingClientRect();
      const hit = document.elementFromPoint(
        bounds.left + bounds.width / 2,
        bounds.top + bounds.height / 2,
      );
      return el === hit || el.contains(hit);
    }),
    "Popover control accepts a pointer at its center",
  ).toBe(true);
}

async function paintedArrow(panel: Locator) {
  const arrow = panel.locator('[data-slot="popover-arrow"]');
  await expect(arrow).toBeVisible();
  const opacity = await arrow.evaluate((el) => {
    let paint = Number(getComputedStyle(el).fillOpacity);
    for (let host: Element | null = el; host; host = host.parentElement) {
      paint *= Number(getComputedStyle(host).opacity);
    }
    return paint;
  });
  expect(opacity, "explicit Arrow paint opacity").toBeGreaterThan(0);
  expect(
    await arrow.evaluate((el) => {
      const box = el.getBoundingClientRect();
      const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
      return el === hit || el.contains(hit);
    }),
    "explicit Arrow paints outside the scrollable panel",
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

test("Popover demo keeps Cancel form-safe, saves caller state and restores focus after nested Select", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("./");
  await page.getByRole("button", { name: "Preview Popover", exact: true }).click();
  const canvas = page.locator("[data-popover-demo]");
  const trigger = canvas.getByRole("button", { name: "Edit details", exact: true });
  await target(trigger);
  await trigger.focus();
  await trigger.press("Enter");
  const panel = page.getByRole("dialog", { name: "Edit details", exact: true });
  await expect(panel).toHaveAccessibleDescription("Save a name and priority for this project.");
  const field = panel.getByRole("textbox", { name: "Project name" });
  await expect(field).toBeFocused();
  await field.fill("Workshop");
  const select = panel.getByRole("combobox", { name: "Project priority" });
  await select.focus();
  await select.press("Enter");
  await expect(page.getByRole("option", { name: "Normal", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("option", { name: "Urgent", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(select).toHaveText("Urgent");
  await expect(select).toBeFocused();
  await expect(panel).toBeVisible();
  const close = panel.getByRole("button", { name: "Cancel editing" });
  await target(close);
  await page.screenshot({ path: test.info().outputPath("popover-demo.png") });
  await close.click();
  await expect(panel).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(canvas.getByRole("status")).toHaveText("Nothing saved yet.");
  await trigger.press("Space");
  await expect(panel).toBeVisible();
  await panel.getByRole("textbox", { name: "Project name" }).fill("Workshop");
  await panel.getByRole("button", { name: "Save details" }).click();
  await expect(canvas.getByRole("status")).toHaveText("Saved Workshop with normal priority.");
  await expect(panel).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(errors).toEqual([]);
});

test("Default nonmodal Popover closes on Escape, outside pointer and outside focus without stealing focus", async ({
  page,
}) => {
  await page.goto("storybook/iframe.html?id=parts-popover--default&viewMode=story&embed=true");
  const trigger = page.getByRole("button", { name: "Open details popover" });
  const outside = page.getByRole("button", { name: "Outside action" });
  const panel = page.getByRole("dialog", { name: "Project details" });
  await trigger.click();
  await expect(panel).toBeVisible();
  await paintedArrow(panel);
  await expect(page.locator("body")).not.toHaveCSS("pointer-events", "none");
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.press("Enter");
  await expect(panel).toBeVisible();
  await target(outside);
  await outside.click();
  await expect(panel).toHaveCount(0);
  await expect(outside).toBeFocused();
  await expect(page.getByLabel("Outside clicks")).toHaveText("1");
  await trigger.click();
  await expect(panel).toBeVisible();
  await outside.focus();
  await expect(panel).toHaveCount(0);
  await expect(outside).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("pointer-events", "none");
});

test("Modal Popover traps keyboard focus, blocks outside pointers and releases both locks", async ({
  page,
}) => {
  await page.goto("storybook/iframe.html?id=parts-popover--modal&viewMode=story&embed=true");
  const trigger = page.getByRole("button", { name: "Open details popover" });
  await trigger.focus();
  await trigger.press("Enter");
  const panel = page.getByRole("dialog", { name: "Project details" });
  const field = panel.getByRole("textbox", { name: "Project name" });
  await expect(field).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(panel.getByRole("button", { name: "Done" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(field).toBeFocused();
  await expect(page.getByRole("button", { name: "Outside action" })).toHaveCount(0);
  await expect(page.locator("body")).toHaveCSS("pointer-events", "none");
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("pointer-events", "none");
  await target(page.getByRole("button", { name: "Outside action" }));
});

test("Prevented Escape, outside pointer and outside focus preserve Popover while Close works", async ({
  page,
}) => {
  await page.goto(
    "storybook/iframe.html?id=parts-popover--prevent-dismiss&viewMode=story&embed=true",
  );
  const trigger = page.getByRole("button", { name: "Open protected popover" });
  const outside = page.getByRole("button", { name: "Outside action" });
  await trigger.click();
  const panel = page.getByRole("dialog", { name: "Protected details" });
  await expect(panel).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(panel, "prevented Escape keeps the panel").toBeVisible();
  await target(outside);
  await outside.click();
  await expect(panel, "prevented outside pointer keeps the panel").toBeVisible();
  await outside.focus();
  await expect(panel, "prevented outside focus keeps the panel").toBeVisible();
  await panel.getByRole("button", { name: "Close protected popover" }).click();
  await expect(panel).toHaveCount(0);
  await expect(page.locator("body")).not.toHaveCSS("pointer-events", "none");
});

test("Select inside Popover owns selection and only its own Escape layer", async ({ page }) => {
  await page.goto(
    "storybook/iframe.html?id=parts-popover--nested-select&viewMode=story&embed=true",
  );
  const outside = page.getByRole("button", { name: "Open priority popover" });
  await outside.click();
  const panel = page.getByRole("dialog", { name: "Choose priority" });
  const trigger = panel.getByRole("combobox", { name: "Priority" });
  await trigger.focus();
  await trigger.press("Enter");
  await expect(page.getByRole("option", { name: "Normal", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("option", { name: "Urgent", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveText("Urgent");
  await expect(trigger).toBeFocused();
  await expect(panel).toBeVisible();
  await trigger.press("Enter");
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await expect(panel, "Select Escape preserves its parent Popover").toBeVisible();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await expect(outside).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("pointer-events", "none");
});

test("Popover inside Dialog and Sheet dismisses only its layer and restores the parent focus scope", async ({
  page,
}) => {
  await page.goto(
    "storybook/iframe.html?id=parts-popover--nested-overlays&viewMode=story&embed=true",
  );
  for (const name of ["dialog", "sheet"]) {
    const outside = page.getByRole("button", { name: `Open parent ${name}` });
    await outside.click();
    const parent = page.getByRole("dialog", { name: `Parent ${name}` });
    const trigger = parent.getByRole("button", { name: "Open details popover" });
    await trigger.click();
    const panel = page.getByRole("dialog", { name: "Project details" });
    await expect(panel.getByRole("textbox", { name: "Project name" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);
    await expect(parent).toBeVisible();
    await expect(trigger).toBeFocused();
    await trigger.press("Enter");
    await expect(panel).toBeVisible();
    const parentClose = parent.getByRole("button", { name: `Close ${name}` });
    await parentClose.focus();
    await expect(panel, "outside parent focus closes only the nonmodal child").toHaveCount(0);
    await expect(parent).toBeVisible();
    await expect(parentClose).toBeFocused();
    await target(parentClose);
    await page.keyboard.press("Escape");
    await expect(parent).toHaveCount(0);
    await expect(outside).toBeFocused();
    await expect(page.locator("body")).not.toHaveCSS("pointer-events", "none");
  }
});

test("Independent Anchor positions bounded scrollable content and leaves the final action hittable", async ({
  page,
}) => {
  await page.goto("storybook/iframe.html?id=parts-popover--anchored&viewMode=story&embed=true");
  await page.getByRole("button", { name: "Open anchored notes" }).click();
  const panel = page.getByRole("dialog", { name: "Anchored notes" });
  await expect(panel).toBeVisible();
  await expect(panel).toHaveAttribute("data-side", "left");
  await expect(panel).toHaveAttribute("data-align", "end");
  const bounds = (await panel.boundingBox())!;
  const anchor = (await page.getByTestId("notes-anchor").boundingBox())!;
  const viewport = page.viewportSize()!;
  expect(bounds.x, "panel left collision bound").toBeGreaterThanOrEqual(16);
  expect(bounds.y, "panel top collision bound").toBeGreaterThanOrEqual(16);
  expect(bounds.x + bounds.width, "panel right collision bound").toBeLessThanOrEqual(
    viewport.width - 16,
  );
  expect(bounds.y + bounds.height, "panel bottom collision bound").toBeLessThanOrEqual(
    viewport.height - 16,
  );
  expect(
    Math.abs(bounds.x + bounds.width + 8 + 8 - anchor.x),
    "panel follows the independent anchor with sideOffset and Arrow height",
  ).toBeLessThan(1);
  expect(
    await panel.evaluate((el) => el.scrollHeight > el.clientHeight),
    "long panel has a real scroll region",
  ).toBe(true);
  await expect(panel).toHaveCSS("overflow-y", "auto");
  await expect(panel).toHaveCSS("overscroll-behavior", "contain");
  const close = panel.getByRole("button", { name: "Finish reading" });
  await close.scrollIntoViewIfNeeded();
  expect(
    await panel.evaluate((el) => el.scrollTop),
    "final action requires scrolling",
  ).toBeGreaterThan(0);
  await target(close);
  await paintedArrow(panel);
  await page.setViewportSize({
    width: viewport.width === 390 ? 768 : 390,
    height: viewport.height,
  });
  await expect
    .poll(
      async () => {
        const resized = (await panel.boundingBox())!;
        return resized.x + resized.width <= page.viewportSize()!.width - 16;
      },
      { message: "collision bounds update after resizing an open scrolled panel" },
    )
    .toBe(true);
  await paintedArrow(panel);
  await target(close);
  await page.screenshot({ path: test.info().outputPath("popover-anchor.png") });
  await close.click();
  await expect(panel).toHaveCount(0);
});

test("Popover hosts paint readable focus without docs CSS in dark, light, accent and forced colors", async ({
  page,
}) => {
  await page.goto("./");
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
      `storybook/iframe.html?id=parts-popover--default&viewMode=story&embed=true&globals=preset:${preset}`,
    );
    await expect(page.locator("html")).toHaveCSS(
      "color-scheme",
      preset === "light" ? "light" : "dark",
    );
    if (mode === "Accent")
      await page.locator("html").evaluate((el, roles) => {
        for (const [role, value] of Object.entries(roles)) el.style.setProperty(role, value);
      }, accent);
    const trigger = page.getByRole("button", { name: "Open details popover" });
    await page.keyboard.press("Tab");
    await target(trigger);
    await paintedFocus(trigger, trigger, `${mode} isolated trigger`);
    expect(
      await contrast(trigger, trigger, "color"),
      `${mode} trigger text contrast`,
    ).toBeGreaterThanOrEqual(4.5);
    await trigger.press("Enter");
    const panel = page.getByRole("dialog", { name: "Project details" });
    await expect(panel).toBeVisible();
    await paintedFocus(panel, panel, `${mode} isolated Content`);
    const close = panel.getByRole("button", { name: "Done" });
    await paintedFocus(close, panel, `${mode} isolated Close`);
    await target(close);
    expect(
      await contrast(close, close, "color"),
      `${mode} Close text contrast`,
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      await contrast(panel.getByRole("heading"), panel, "color"),
      `${mode} title text contrast`,
    ).toBeGreaterThanOrEqual(4.5);
    await page.screenshot({
      path: test.info().outputPath(`popover-isolated-${mode.toLowerCase()}.png`),
    });
  }
  await page.emulateMedia({ forcedColors: "active" });
  const panel = page.getByRole("dialog", { name: "Project details" });
  await paintedFocus(panel.getByRole("button", { name: "Done" }), panel, "Forced colors Close");
  expect(
    await panel.evaluate((el) => getComputedStyle(el).borderTopColor),
    "forced-colors panel boundary ink",
  ).not.toBe(await panel.evaluate((el) => getComputedStyle(el).backgroundColor));
});

test("Popover live composition is highlighted and copies exact local-alias source bytes", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("./");
  await page.getByRole("button", { name: "Preview Popover", exact: true }).click();
  const block = page.locator(".family-detail .code-block");
  const code = block.locator("pre code");
  expect(await code.textContent()).toBe(example);
  expect(await code.locator(".token").count(), "TSX syntax is highlighted").toBeGreaterThan(20);
  await block.getByRole("button", { name: "Copy Popover composition" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(example);
  await expect(block.getByRole("status")).toHaveText("Copied to clipboard");
  await expect(page.locator("[data-popover-demo]")).toContainText("Unreleased candidate.");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
});

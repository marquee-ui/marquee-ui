import { readFileSync } from "node:fs";
import { expect, test, type Locator } from "@playwright/test";

const example = readFileSync(new URL("../src/examples/select.tsx", import.meta.url), "utf8");

async function contrast(control: Locator, ground: Locator) {
  const fill = await ground.evaluate((el) => getComputedStyle(el).backgroundColor);
  return control.evaluate((el, background) => {
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
    const ink = luminance(getComputedStyle(el).color),
      fill = luminance(background);
    return (Math.max(ink, fill) + 0.05) / (Math.min(ink, fill) + 0.05);
  }, fill);
}

async function visibleTarget(control: Locator) {
  await expect(control).toBeVisible();
  await control.scrollIntoViewIfNeeded();
  const box = await control.boundingBox();
  expect(box!.height, "control tap height").toBeGreaterThanOrEqual(44);
  expect(box!.width, "control tap width").toBeGreaterThanOrEqual(44);
  expect(
    await control.evaluate((el) => {
      const box = el.getBoundingClientRect();
      const top = Math.max(0, box.top),
        bottom = Math.min(innerHeight, box.bottom);
      const hit = document.elementFromPoint(box.left + box.width / 2, (top + bottom) / 2);
      return el === hit || el.contains(hit);
    }),
    "control center must accept the pointer",
  ).toBe(true);
}

test("Select demo selects with the keyboard, skips disabled, restores focus and submits natively", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("./");
  await page.getByRole("button", { name: "Preview Select", exact: true }).click();
  const canvas = page.locator(".family-canvas");
  const trigger = canvas.getByRole("combobox", { name: "Project priority" });
  await visibleTarget(trigger);
  await expect(trigger).toHaveText("Normal⌄");
  await trigger.focus();
  await page.keyboard.press("Enter");
  const list = page.getByRole("listbox");
  await expect(list).toBeVisible();
  await expect(page.getByRole("option", { name: "Normal", exact: true })).toBeFocused();
  await expect(page.getByRole("option", { name: "Archived" })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await page.keyboard.press("End");
  await expect(page.getByRole("option", { name: "Urgent" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveText("Urgent⌄");
  await expect(trigger).toBeFocused();
  await expect(list).toHaveCount(0);
  await trigger.press("Enter");
  await page.keyboard.press("l");
  await expect(page.getByRole("option", { name: "Low", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toHaveText("Urgent⌄");
  await expect(trigger).toBeFocused();
  await canvas.getByRole("button", { name: "Save priority" }).click();
  await expect(canvas.getByRole("status")).toHaveText("Saved priority: urgent.");
  expect(errors).toEqual([]);
});

test("Select popup fits, exposes 44px choices and stays readable through dark, light and accent roles", async ({
  page,
}) => {
  await page.goto("./");
  for (const mode of ["Dark", "Light"]) {
    await page.getByRole("button", { name: mode, exact: true }).click();
    if (mode === "Light") {
      await page.getByRole("button", { name: /^Customize theme:/ }).click();
      await page.getByRole("radio", { name: /^Violet\b/ }).click();
      await page.keyboard.press("Escape");
    }
    await page.getByRole("button", { name: "Preview Select", exact: true }).click();
    const trigger = page.getByRole("combobox", { name: "Project priority" });
    expect(await contrast(trigger, trigger), `${mode} trigger contrast`).toBeGreaterThanOrEqual(
      4.5,
    );
    await trigger.click();
    const list = page.getByRole("listbox");
    const low = page.getByRole("option", { name: "Low", exact: true });
    await visibleTarget(low);
    const bounds = await list.boundingBox();
    expect(bounds!.x, "popup left edge").toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width, "popup right edge").toBeLessThanOrEqual(
      page.viewportSize()!.width,
    );
    expect(bounds!.y + bounds!.height, "popup bottom edge").toBeLessThanOrEqual(
      page.viewportSize()!.height,
    );
    expect(await contrast(low, list), `${mode} item contrast`).toBeGreaterThanOrEqual(4.5);
    await page.keyboard.press("Home");
    await expect(low).toBeFocused();
    expect(await contrast(low, low), `${mode} highlighted item contrast`).toBeGreaterThanOrEqual(
      4.5,
    );
    expect(await low.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe("solid");
    await page.screenshot({ path: test.info().outputPath(`select-${mode.toLowerCase()}.png`) });
    await page.keyboard.press("Escape");
  }
});

test("Select source is highlighted, copies exact bytes and contains its scrolling at every width", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("./");
  await page.getByRole("button", { name: "Preview Select", exact: true }).click();
  const block = page.locator(".family-detail .code-block");
  const code = block.locator("pre code");
  expect(await code.textContent()).toBe(example);
  expect(await code.locator(".token").count(), "TSX syntax must be highlighted").toBeGreaterThan(
    20,
  );
  await block.getByRole("button", { name: "Copy Select composition" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(example);
  await expect(block.getByRole("status")).toHaveText("Copied to clipboard");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
});

test("Select's optional scroll parts reveal distant items in a constrained popup", async ({
  page,
}) => {
  await page.goto("storybook/iframe.html?id=parts-select--scrollable&viewMode=story");
  const trigger = page.getByRole("combobox", { name: "Section" });
  await trigger.focus();
  await trigger.press("Enter");
  const viewport = page.locator('[data-slot="select-viewport"]');
  await expect(page.getByRole("listbox")).toBeVisible();
  expect(
    await viewport.evaluate((el) => el.scrollHeight > el.clientHeight),
    "long choices must scroll inside the viewport",
  ).toBe(true);
  const down = page.locator('[data-slot="select-scroll-down-button"]');
  await visibleTarget(down);
  await down.hover();
  await expect.poll(async () => viewport.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  await page.keyboard.press("End");
  const last = page.getByRole("option", { name: "Section 24", exact: true });
  await expect(last).toBeFocused();
  await visibleTarget(last);
  const up = page.locator('[data-slot="select-scroll-up-button"]');
  await visibleTarget(up);
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveText("Section 24⌄");
  await expect(trigger).toBeFocused();
});

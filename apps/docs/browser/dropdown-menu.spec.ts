import { readFileSync } from "node:fs";
import { expect, test, type Locator } from "@playwright/test";

const example = readFileSync(new URL("../src/examples/dropdown-menu.tsx", import.meta.url), "utf8");

async function target(control: Locator) {
  await expect(control).toBeVisible();
  await control.scrollIntoViewIfNeeded();
  const box = await control.boundingBox();
  expect(box!.height, "DropdownMenu control target height").toBeGreaterThanOrEqual(44);
  expect(box!.width, "DropdownMenu control target width").toBeGreaterThanOrEqual(44);
  expect(
    await control.evaluate((el) => {
      const bounds = el.getBoundingClientRect();
      const hit = document.elementFromPoint(
        bounds.left + bounds.width / 2,
        bounds.top + bounds.height / 2,
      );
      return el === hit || el.contains(hit);
    }),
    "DropdownMenu control accepts a pointer at its center",
  ).toBe(true);
}

async function paintedArrow(panel: Locator) {
  const arrow = panel.locator('[data-slot="dropdown-menu-arrow"]');
  await expect(arrow).toBeVisible();
  const opacity = await arrow.evaluate((el) => {
    let paint = Number(getComputedStyle(el).fillOpacity);
    for (let host: Element | null = el; host; host = host.parentElement) {
      paint *= Number(getComputedStyle(host).opacity);
    }
    return paint;
  });
  const fill = await arrow.evaluate((el) => getComputedStyle(el).fill);
  expect(fill, "Arrow uses the panel fill").toBe(
    await panel.evaluate((el) => getComputedStyle(el).backgroundColor),
  );
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
  const opacity = await control.evaluate((el) => {
    let paint = 1;
    for (let host: Element | null = el; host; host = host.parentElement) {
      paint *= Number(getComputedStyle(host).opacity);
    }
    return paint;
  });
  expect(opacity, `${label} focus paint opacity`).toBe(1);
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

test("DropdownMenu demo owns checked and radio state, selects a submenu action and returns focus", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("components/");
  await page.getByRole("button", { name: "Preview DropdownMenu", exact: true }).click();
  const canvas = page.locator("[data-dropdown-menu-demo]");
  const trigger = canvas.getByRole("button", { name: "Project actions" });
  await target(trigger);
  await trigger.focus();
  await trigger.press("Enter");
  const menu = page.getByRole("menu", { name: "Project actions" });
  await expect(menu).toBeVisible();
  await paintedArrow(menu);
  const checkbox = menu.getByRole("menuitemcheckbox", { name: "Notifications" });
  await target(checkbox);
  await checkbox.click();
  await expect(checkbox).toHaveAttribute("aria-checked", "false");
  await expect(menu).toBeVisible();
  await menu.getByRole("menuitemradio", { name: "Comfortable" }).click();
  await expect(menu.getByRole("menuitemradio", { name: "Compact" })).toHaveAttribute(
    "aria-checked",
    "false",
  );
  await expect(menu.getByRole("menuitemradio", { name: "Comfortable" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await expect(canvas.getByRole("status", { includeHidden: true })).toHaveText(
    "No action yet. Notifications off; comfortable density.",
  );
  const share = menu.getByRole("menuitem", { name: "Share" });
  await share.focus();
  await share.press("ArrowRight");
  const copy = page.getByRole("menuitem", { name: "Copy link" });
  await expect(copy).toBeFocused();
  await target(copy);
  await paintedArrow(page.getByRole("menu", { name: "Share", exact: true }));
  await page.screenshot({ path: test.info().outputPath("dropdown-menu-demo.png") });
  await copy.press("Enter");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(canvas.getByRole("status")).toHaveText(
    "Link copied. Notifications off; comfortable density.",
  );
  await expect(page.locator("body")).not.toHaveCSS("pointer-events", "none");
  await expect(page.locator("body")).not.toHaveAttribute("data-scroll-locked");
  expect(errors).toEqual([]);
});

test("DropdownMenu keyboard navigation skips disabled items, typeaheads and dispatches an action", async ({
  page,
}) => {
  await page.goto("storybook/iframe.html?id=parts-dropdownmenu--default&viewMode=story&embed=true");
  const trigger = page.getByRole("button", { name: "Project actions" });
  await trigger.focus();
  await trigger.press("ArrowDown");
  const archive = page.getByRole("menuitem", { name: "Archive" });
  await expect(archive).toBeFocused();
  await target(archive);
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menuitem", { name: "Rename" })).toBeFocused();
  await page.keyboard.press("End");
  await expect(page.getByRole("menuitem", { name: "Duplicate" })).toBeFocused();
  await page.keyboard.press("Home");
  await expect(archive).toBeFocused();
  await page.keyboard.press("r");
  await expect(page.getByRole("menuitem", { name: "Rename" })).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(archive).toBeFocused();
  const disabled = page.getByRole("menuitem", { name: "Delete" });
  await expect(disabled).toHaveAttribute("aria-disabled", "true");
  await disabled.dispatchEvent("click");
  await expect(page.getByRole("menu")).toBeVisible();
  await archive.press("Enter");
  await expect(page.getByRole("status")).toHaveText("Archived");
  await expect(trigger).toBeFocused();
});

test("Default modal menu blocks outside pointers and scroll, keeps Tab inside and releases locks on Escape", async ({
  page,
}) => {
  await page.goto("storybook/iframe.html?id=parts-dropdownmenu--default&viewMode=story&embed=true");
  const trigger = page.getByRole("button", { name: "Project actions" });
  await trigger.focus();
  await trigger.press("Enter");
  const item = page.getByRole("menuitem", { name: "Archive" });
  await expect(item).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(item).toBeFocused();
  await expect(page.locator("body")).toHaveCSS("pointer-events", "none");
  await expect(page.locator("body")).toHaveAttribute("data-scroll-locked", "1");
  await expect(page.getByRole("button", { name: "Outside action" })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("pointer-events", "none");
  await expect(page.locator("body")).not.toHaveAttribute("data-scroll-locked");
  const outside = page.getByRole("button", { name: "Outside action" });
  await target(outside);
  await outside.click();
  await expect(page.getByLabel("Outside clicks")).toHaveText("1");
});

test("Nonmodal menu closes on outside pointer and focus while the outside control receives the action", async ({
  page,
}) => {
  await page.goto(
    "storybook/iframe.html?id=parts-dropdownmenu--nonmodal&viewMode=story&embed=true",
  );
  const trigger = page.getByRole("button", { name: "Project actions" });
  const outside = page.getByRole("button", { name: "Outside action" });
  await trigger.click();
  await expect(page.getByRole("menu")).toBeVisible();
  await expect(page.locator("body")).not.toHaveCSS("pointer-events", "none");
  await expect(page.locator("body")).not.toHaveAttribute("data-scroll-locked");
  await target(outside);
  await outside.click();
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(outside).toBeFocused();
  await expect(page.getByLabel("Outside clicks")).toHaveText("1");
  await trigger.press("Enter");
  await expect(page.getByRole("menuitem", { name: "Archive" })).toBeFocused();
  await outside.focus();
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(outside).toBeFocused();
});

test("preventDefault preserves selection, Escape and outside interaction until an ordinary action closes", async ({
  page,
}) => {
  await page.goto(
    "storybook/iframe.html?id=parts-dropdownmenu--prevent-dismiss&viewMode=story&embed=true",
  );
  const trigger = page.getByRole("button", { name: "Protected actions" });
  await trigger.focus();
  await trigger.press("Enter");
  const menu = page.getByRole("menu");
  const keep = page.getByRole("menuitem", { name: "Keep open" });
  await expect(keep).toBeFocused();
  await keep.press("Enter");
  await expect(menu, "canceled selection preserves menu").toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu, "canceled Escape preserves menu").toBeVisible();
  await page.getByRole("button", { name: "Outside action" }).click();
  await expect(menu, "canceled outside pointer preserves menu").toBeVisible();
  await page.getByRole("menuitem", { name: "Finish" }).click();
  await expect(menu).toHaveCount(0);
  await expect(page.locator("body")).not.toHaveCSS("pointer-events", "none");
});

test("directional submenu traversal preserves its parent on the return key and selects an action", async ({
  page,
}) => {
  for (const [story, open, back] of [
    ["submenu", "ArrowRight", "ArrowLeft"],
    ["right-to-left", "ArrowLeft", "ArrowRight"],
  ]) {
    await page.goto(
      `storybook/iframe.html?id=parts-dropdownmenu--${story}&viewMode=story&embed=true`,
    );
    const trigger = page.getByRole("button", { name: "Share actions" });
    await trigger.focus();
    await trigger.press("Enter");
    const share = page.getByRole("menuitem", { name: "Share", exact: true });
    await expect(share).toBeFocused();
    await target(share);
    await share.press(open!);
    const sub = page.getByRole("menu", { name: "Share", exact: true });
    const copy = sub.getByRole("menuitem", { name: "Copy link" });
    await expect(copy).toBeFocused();
    await target(copy);
    await paintedArrow(sub);
    const bounds = (await sub.boundingBox())!;
    expect(bounds.x, "submenu left bound").toBeGreaterThanOrEqual(16);
    expect(bounds.x + bounds.width, "submenu right bound").toBeLessThanOrEqual(
      page.viewportSize()!.width - 16,
    );
    await copy.press(back!);
    await expect(sub).toHaveCount(0);
    await expect(share).toBeFocused();
    await expect(page.getByRole("menu", { name: "Share actions" })).toBeVisible();
    await share.press(open!);
    await expect(copy).toBeFocused();
    await copy.press("Enter");
    await expect(page.getByRole("menu")).toHaveCount(0);
    await expect(page.getByRole("status")).toHaveText("Link copied");
    await expect(trigger).toBeFocused();
  }
});

test("menu inside Dialog, Sheet and Popover closes its own layer and preserves parent locks and focus", async ({
  page,
}) => {
  await page.goto(
    "storybook/iframe.html?id=parts-dropdownmenu--nested-overlays&viewMode=story&embed=true",
  );
  for (const name of ["dialog", "sheet", "popover"]) {
    const outside = page.getByRole("button", { name: `Open parent ${name}` });
    await outside.click();
    const parent = page.getByRole("dialog", { name: `Parent ${name}` });
    const trigger = parent.getByRole("button", { name: "Project actions" });
    await target(trigger);
    await trigger.focus();
    await trigger.press("Enter");
    const item = page.getByRole("menuitem", { name: "Archive" });
    await expect(item).toBeFocused();
    await target(item);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).toHaveCount(0);
    await expect(parent).toBeVisible();
    await expect(trigger).toBeFocused();
    if (name === "popover") {
      await expect(page.locator("body")).not.toHaveCSS("pointer-events", "none");
      await expect(page.locator("body")).not.toHaveAttribute("data-scroll-locked");
    } else {
      await expect(page.locator("body")).toHaveCSS("pointer-events", "none");
      await expect(page.locator("body")).toHaveAttribute("data-scroll-locked", "1");
    }
    await trigger.press("Enter");
    await expect(item).toBeFocused();
    await item.press("Enter");
    await expect(page.getByRole("menu")).toHaveCount(0);
    await expect(parent).toBeVisible();
    await expect(trigger).toBeFocused();
    await page.keyboard.press("Tab");
    const close = parent.getByRole("button", { name: `Close ${name}` });
    await expect(close).toBeFocused();
    await target(close);
    await close.click();
    await expect(parent).toHaveCount(0);
    await expect(outside).toBeFocused();
    await expect(page.locator("body")).not.toHaveCSS("pointer-events", "none");
    await expect(page.locator("body")).not.toHaveAttribute("data-scroll-locked");
  }
});

test("isolated DropdownMenu hosts paint readable focus in dark, light, accent and forced colors", async ({
  page,
}) => {
  await page.goto("components/");
  await page.getByRole("button", { name: "Light", exact: true }).click();
  await page.getByRole("button", { name: /^Customize theme:/ }).click();
  await page.getByRole("radio", { name: /^Violet\b/ }).click();
  await page.keyboard.press("Escape");
  const accent = await page
    .locator("html")
    .evaluate((el) =>
      Object.fromEntries(
        ["--primary", "--primary-foreground", "--primary-ink", "--primary-muted"].map((role) => [
          role,
          getComputedStyle(el).getPropertyValue(role),
        ]),
      ),
    );
  for (const [mode, preset] of [
    ["Dark", "arcade"],
    ["Light", "light"],
    ["Accent", "light"],
  ]) {
    await page.goto(
      `storybook/iframe.html?id=parts-dropdownmenu--checkable&viewMode=story&embed=true&globals=preset:${preset}`,
    );
    await expect(page.locator("html")).toHaveCSS(
      "color-scheme",
      preset === "light" ? "light" : "dark",
    );
    if (mode === "Accent")
      await page.locator("html").evaluate((el, roles) => {
        for (const [role, value] of Object.entries(roles)) el.style.setProperty(role, value);
      }, accent);
    const trigger = page.getByRole("button", { name: "View options" });
    await page.keyboard.press("Tab");
    await target(trigger);
    await paintedFocus(trigger, page.locator("body"), `${mode} Trigger`);
    expect(
      await contrast(trigger, trigger, "color"),
      `${mode} trigger text`,
    ).toBeGreaterThanOrEqual(4.5);
    await trigger.press("Enter");
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    await paintedArrow(menu);
    for (const [role, name] of [
      ["menuitemcheckbox", "Notifications"],
      ["menuitemradio", "Compact"],
    ] as const) {
      const item = menu.getByRole(role, { name });
      await target(item);
      await paintedFocus(item, item, `${mode} ${role}`);
      expect(await contrast(item, item, "color"), `${mode} ${role} text`).toBeGreaterThanOrEqual(
        4.5,
      );
    }
    await page.keyboard.press("Escape");
    await page.goto(
      `storybook/iframe.html?id=parts-dropdownmenu--submenu&viewMode=story&embed=true&globals=preset:${preset}`,
    );
    if (mode === "Accent")
      await page.locator("html").evaluate((el, roles) => {
        for (const [role, value] of Object.entries(roles)) el.style.setProperty(role, value);
      }, accent);
    await page.getByRole("button", { name: "Share actions" }).focus();
    await page.keyboard.press("Enter");
    const share = page.getByRole("menuitem", { name: "Share", exact: true });
    await paintedFocus(share, share, `${mode} SubTrigger`);
    await share.press("ArrowRight");
    const sub = page.getByRole("menu", { name: "Share", exact: true });
    await expect(sub).toBeVisible();
    const copy = sub.getByRole("menuitem", { name: "Copy link" });
    await paintedFocus(copy, copy, `${mode} Item`);
    await target(copy);
    expect(await contrast(copy, copy, "color"), `${mode} Item text`).toBeGreaterThanOrEqual(4.5);
    await page.keyboard.press("Escape");
    await page.goto(
      `storybook/iframe.html?id=parts-dropdownmenu--content-focus&viewMode=story&embed=true&globals=preset:${preset}`,
    );
    if (mode === "Accent")
      await page.locator("html").evaluate((el, roles) => {
        for (const [role, value] of Object.entries(roles)) el.style.setProperty(role, value);
      }, accent);
    await page.mouse.move(0, 0);
    const contentsTrigger = page.getByRole("button", { name: "No available actions" });
    await contentsTrigger.focus();
    await contentsTrigger.press("Enter");
    const focusedContent = page.getByRole("menu", { name: "No available actions" });
    await expect(focusedContent).toBeFocused();
    await paintedFocus(focusedContent, page.locator("body"), `${mode} Content`);
    await page.keyboard.press("Escape");
    const sharesTrigger = page.getByRole("button", { name: "No available shares" });
    await sharesTrigger.focus();
    await sharesTrigger.press("Enter");
    const emptyShare = page.getByRole("menuitem", { name: "Share" });
    await expect(emptyShare).toBeFocused();
    await target(emptyShare);
    await emptyShare.press("ArrowRight");
    const focusedSub = page.getByRole("menu", { name: "Share", exact: true });
    await expect(focusedSub).toBeFocused();
    await paintedFocus(focusedSub, page.locator("body"), `${mode} SubContent`);
    await page.screenshot({
      path: test.info().outputPath(`dropdown-menu-isolated-${mode!.toLowerCase()}.png`),
    });
  }
  await page.emulateMedia({ forcedColors: "active" });
  const sub = page.getByRole("menu", { name: "Share", exact: true });
  await paintedFocus(sub, page.locator("body"), "Forced colors SubContent");
  expect(
    await sub.evaluate((el) => getComputedStyle(el).borderTopColor),
    "forced-colors panel boundary",
  ).not.toBe(await sub.evaluate((el) => getComputedStyle(el).backgroundColor));
});

test("DropdownMenu composition is highlighted and copies exact registry-alias source", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("components/");
  await page.getByRole("button", { name: "Preview DropdownMenu", exact: true }).click();
  const block = page.locator(".family-detail .code-block");
  const code = block.locator("pre code");
  expect(await code.textContent()).toBe(example);
  expect(await code.locator(".token").count(), "TSX syntax highlighted").toBeGreaterThan(20);
  await block.getByRole("button", { name: "Copy DropdownMenu composition" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(example);
  await expect(block.getByRole("status")).toHaveText("Copied to clipboard");
  await expect(page.locator("[data-dropdown-menu-demo]")).toContainText("Unreleased candidate.");
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
    "docs has no horizontal overflow",
  ).toBeLessThanOrEqual(page.viewportSize()!.width);
});

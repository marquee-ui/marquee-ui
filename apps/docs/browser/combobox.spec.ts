import { readFileSync } from "node:fs";
import { expect, test, type Locator } from "@playwright/test";

const example = readFileSync(new URL("../src/examples/combobox.tsx", import.meta.url), "utf8");

async function target(control: Locator) {
  await expect(control).toBeVisible();
  await control.scrollIntoViewIfNeeded();
  const box = (await control.boundingBox())!;
  expect(box.height, "Combobox control target height").toBeGreaterThanOrEqual(44);
  expect(box.width, "Combobox control target width").toBeGreaterThanOrEqual(44);
  await expect
    .poll(
      () =>
        control.evaluate((el) => {
          const rect = el.getBoundingClientRect();
          const hit = document.elementFromPoint(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
          );
          return hit === el || el.contains(hit);
        }),
      { message: "Combobox control accepts a pointer at its center" },
    )
    .toBe(true);
}

/** Read paint against the actual exterior point, composite ancestor surfaces and opacity. */
async function paint(control: Locator, label: string, kind: "outline" | "border" = "outline") {
  await expect(control).toBeVisible();
  const evidence = await control.evaluate((el, kind) => {
    const rgba = (color: string) => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const context = canvas.getContext("2d")!;
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      return Array.from(context.getImageData(0, 0, 1, 1).data);
    };
    const composite = (over: number[], under: number[]) => {
      const alpha = over[3]! / 255;
      return [0, 1, 2]
        .map((index) => over[index]! * alpha + under[index]! * (1 - alpha))
        .concat(255);
    };
    const background = (host: Element) => {
      const chain: Element[] = [];
      for (let parent: Element | null = host; parent; parent = parent.parentElement)
        chain.unshift(parent);
      let result = rgba(getComputedStyle(document.documentElement).backgroundColor);
      for (const parent of chain)
        result = composite(rgba(getComputedStyle(parent).backgroundColor), result);
      return result;
    };
    const style = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    // Offset outlines extend outward; active descendant outlines are inset.
    const width = parseFloat(kind === "border" ? style.borderTopWidth : style.outlineWidth);
    const offset = kind === "border" ? 0 : parseFloat(style.outlineOffset);
    const inset = offset < 0;
    const x = rect.left + Math.min(12, rect.width / 2);
    const y = inset ? rect.top + 5 : rect.top - offset - width - 1;
    const exterior = document.elementFromPoint(x, y);
    if (!exterior) throw new Error("Combobox outline exterior is outside the canvas");
    const ground = background(exterior);
    const ink = rgba(kind === "border" ? style.borderTopColor : style.outlineColor);
    let opacity = 1;
    let visible = true;
    for (let host: Element | null = el; host; host = host.parentElement) {
      const computed = getComputedStyle(host);
      opacity *= Number(computed.opacity);
      visible &&= computed.visibility === "visible" && computed.display !== "none";
    }
    ink[3] = ink[3]! * opacity;
    const paintedInk = composite(ink, ground);
    const luminance = (channels: number[]) => {
      const linear = channels.slice(0, 3).map((value) => {
        const v = value / 255;
        return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      });
      return linear[0]! * 0.2126 + linear[1]! * 0.7152 + linear[2]! * 0.0722;
    };
    const a = luminance(paintedInk),
      b = luminance(ground);
    return {
      style: kind === "border" ? style.borderTopStyle : style.outlineStyle,
      width,
      opacity,
      visible,
      contrast: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
      exterior: exterior.getAttribute("data-slot") || exterior.tagName,
      ground,
      ink,
    };
  }, kind);
  expect(evidence.visible, `${label} ancestor visibility`).toBe(true);
  expect(evidence.opacity, `${label} cumulative ancestor opacity`).toBeGreaterThan(0);
  expect(evidence.style, `${label} ${kind} style`).toBe("solid");
  expect(evidence.width, `${label} ${kind} width`).toBeGreaterThanOrEqual(
    kind === "border" ? 1 : 2,
  );
  expect(
    evidence.contrast,
    `${label} painted ${kind} contrast against actual exterior`,
  ).toBeGreaterThanOrEqual(3);
  await test
    .info()
    .attach(label, { body: JSON.stringify(evidence), contentType: "application/json" });
}

test("demo searches without submitting, commits only on selection and uses caller native form state", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Preview Combobox", exact: true }).click();
  const canvas = page.locator("[data-combobox-demo]");
  const trigger = canvas.getByRole("button", { name: "Language", exact: true });
  await target(trigger);
  await trigger.click();
  const input = page.getByRole("combobox", { name: "Search languages" });
  await expect(input).toBeFocused();
  await target(input);
  await input.press("End");
  await expect(page.getByRole("option", { name: "Spanish" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(trigger).toContainText("English");
  await input.fill("italian");
  await expect(page.getByRole("option", { name: "Italian" })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await input.press("Enter");
  await expect(trigger).toContainText("English");
  await expect(canvas.getByRole("status")).toHaveText("Choose a language, then save.");
  await input.fill("missing");
  await expect(
    page
      .getByRole("listbox", { name: "Language results" })
      .getByText("No languages found.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("option")).toHaveCount(0);
  await input.fill("french");
  const french = page.getByRole("option", { name: "French" });
  await target(french);
  await french.click();
  await expect(trigger).toContainText("French");
  await expect(trigger).toBeFocused();
  await expect(page.getByRole("listbox")).toHaveCount(0);
  const save = canvas.getByRole("button", { name: "Save language" });
  await target(save);
  await save.click();
  await expect(canvas.getByRole("status")).toHaveText("Saved language: french.");
  await canvas.screenshot({ path: test.info().outputPath("combobox-demo-canvas.png") });
  await page.screenshot({ path: test.info().outputPath("combobox-demo.png"), fullPage: true });
});

test("keyboard active descendant skips disabled choices and Escape/outside preserve committed state", async ({
  page,
}) => {
  await page.goto("storybook/iframe.html?id=parts-combobox--default&viewMode=story&embed=true");
  const trigger = page.getByRole("button", { name: "Fruit", exact: true });
  await trigger.focus();
  await trigger.press("Enter");
  const input = page.getByRole("combobox", { name: "Search fruit" });
  await expect(input).toBeFocused();
  await input.press("Home");
  await input.press("ArrowDown");
  const cherry = page.getByRole("option", { name: "Cherry" });
  await expect(cherry).toHaveAttribute("aria-selected", "true");
  await expect(input).toHaveAttribute("aria-activedescendant", (await cherry.getAttribute("id"))!);
  await input.press("ArrowUp");
  await expect(page.getByRole("option", { name: "Apple" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await input.press("End");
  await input.press("Escape");
  await expect(trigger).toContainText("Apple");
  await expect(trigger).toBeFocused();
  await trigger.press("Space");
  await expect(input).toBeFocused();
  await input.press("End");
  await input.press("Enter");
  await expect(trigger).toContainText("Date");
  await expect(trigger).toBeFocused();
  await trigger.press("Enter");
  await expect(input).toBeFocused();
  const outside = page.getByRole("button", { name: "Outside action" });
  await target(outside);
  await outside.click();
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await expect(outside).toBeFocused();
  await expect(trigger).toContainText("Date");
});

test("controlled external state, disabled trigger and custom hosts stay compositional", async ({
  page,
}) => {
  await page.goto(
    "storybook/iframe.html?id=parts-combobox--controlled-open&viewMode=story&embed=true",
  );
  await page.getByRole("button", { name: "Choose cherry externally" }).click();
  await expect(page.getByRole("button", { name: "Fruit", exact: true })).toContainText("Cherry");
  await page.getByRole("button", { name: "Open externally" }).click();
  await expect(page.getByLabel("Popup state")).toHaveText("open");
  await page.keyboard.press("Escape");
  await expect(page.getByLabel("Popup state")).toHaveText("closed");
  await page.goto("storybook/iframe.html?id=parts-combobox--disabled&viewMode=story&embed=true");
  await expect(page.getByRole("button", { name: "Unavailable picker" })).toBeDisabled();
  await page.goto(
    "storybook/iframe.html?id=parts-combobox--custom-parts&viewMode=story&embed=true",
  );
  await page.getByRole("button", { name: "Custom fruit" }).click();
  await expect(page.getByRole("combobox", { name: "Custom fruit search" })).toBeFocused();
  await expect(page.getByRole("option", { name: "Apple" })).toHaveJSProperty("tagName", "ARTICLE");
  await expect(page.locator('[data-slot="combobox-item-indicator"]')).toHaveCount(0);
  await page.keyboard.press("Escape");
});

test("nested Dialog and Sheet retain focus and dismiss only the current layer", async ({
  page,
}) => {
  for (const kind of ["dialog", "sheet"] as const) {
    await page.goto(
      `storybook/iframe.html?id=parts-combobox--nested-${kind}&viewMode=story&embed=true`,
    );
    const outside = page.getByRole("button", { name: `Open fruit ${kind}` });
    await target(outside);
    await outside.click();
    const parent = page.getByRole("dialog", { name: `Fruit ${kind}`, exact: true });
    const trigger = parent.getByRole("button", { name: "Fruit", exact: true });
    await target(trigger);
    await trigger.click();
    const input = page.getByRole("combobox", { name: "Search fruit" });
    await expect(input).toBeFocused();
    await target(input);
    await input.press("End");
    await input.press("Enter");
    await expect(trigger).toContainText("Date");
    await expect(trigger).toBeFocused();
    await expect(parent).toBeVisible();
    await trigger.press("Enter");
    await expect(input).toBeFocused();
    await input.press("Escape");
    await expect(page.getByRole("listbox")).toHaveCount(0);
    await expect(parent).toBeVisible();
    await expect(trigger).toBeFocused();
    await trigger.press("Escape");
    await expect(parent).toHaveCount(0);
    await expect(outside).toBeFocused();
    await expect(page.locator("body")).not.toHaveCSS("pointer-events", "none");
  }
});

test("bounded list scrolls to its last selectable row with real hit readiness", async ({
  page,
}) => {
  await page.goto("storybook/iframe.html?id=parts-combobox--scrollable&viewMode=story&embed=true");
  const trigger = page.getByRole("button", { name: "Section", exact: true });
  await trigger.click();
  const list = page.getByRole("listbox", { name: "Sections" });
  await expect(list).toHaveCSS("overflow-y", "auto");
  await expect(list).toHaveCSS("overscroll-behavior", "contain");
  expect(
    await list.evaluate((el) => el.scrollHeight > el.clientHeight),
    "list has real overflow",
  ).toBe(true);
  const input = page.getByRole("combobox", { name: "Search sections" });
  await expect(input).toBeFocused();
  await input.press("End");
  const last = page.getByRole("option", { name: "Section 24", exact: true });
  await expect(last).toHaveAttribute("aria-selected", "true");
  await expect
    .poll(() => list.evaluate((el) => el.scrollTop), { message: "End scrolls the list" })
    .toBeGreaterThan(0);
  await target(last);
  await page.screenshot({ path: test.info().outputPath("combobox-scroll.png"), fullPage: true });
  await last.click();
  await expect(trigger).toContainText("Section 24");
});

test("isolated trigger, input, content and active choice paint in dark/light/accent/forced colors", async ({
  page,
}) => {
  await page.goto("./");
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
    ["dark", "arcade"],
    ["light", "light"],
    ["accent", "light"],
    ["forced", "light"],
  ] as const) {
    await page.emulateMedia({ forcedColors: "none" });
    await page.goto(
      `storybook/iframe.html?id=parts-combobox--default&viewMode=story&embed=true&globals=preset:${preset}`,
    );
    await expect(page.locator("html")).toHaveCSS(
      "color-scheme",
      preset === "light" ? "light" : "dark",
    );
    if (mode === "forced") await page.emulateMedia({ forcedColors: "active" });
    if (mode === "accent")
      await page.locator("html").evaluate((el, roles) => {
        for (const [role, value] of Object.entries(roles)) el.style.setProperty(role, value);
      }, accent);
    const trigger = page.getByRole("button", { name: "Fruit", exact: true });
    await page.keyboard.press("Tab");
    await trigger.focus();
    await target(trigger);
    await paint(trigger, `${mode} trigger`);
    await trigger.press("Enter");
    const input = page.getByRole("combobox", { name: "Search fruit" });
    await expect(input).toBeFocused();
    await paint(input, `${mode} input`);
    await input.press("End");
    const active = page.getByRole("option", { name: "Date" });
    await expect(active).toHaveAttribute("aria-selected", "true");
    await target(active);
    await paint(active, `${mode} active choice`);
    const panel = page.getByRole("dialog", { name: "Choose fruit" });
    await panel.focus();
    await expect(panel).toBeFocused();
    await paint(panel, `${mode} content`);
    if (mode === "forced") {
      const separator = panel.getByRole("separator");
      await expect(separator).toBeVisible();
      await paint(separator, "forced separator", "border");
    }
    await page.screenshot({
      path: test.info().outputPath(`combobox-isolated-${mode}.png`),
      fullPage: true,
    });
    await page.keyboard.press("Escape");
  }
});

test("copyable composition uses local registry aliases and preserves exact source", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("./");
  await page.getByRole("button", { name: "Preview Combobox", exact: true }).click();
  const block = page.locator(".family-detail .code-block");
  await expect(block.locator("pre code")).toHaveText(example);
  await block.getByRole("button", { name: "Copy Combobox composition" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(example);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
});

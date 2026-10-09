import { readFileSync } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";

const example = readFileSync(new URL("../src/examples/tooltip.tsx", import.meta.url), "utf8");
const contentSelector = '[data-slot="tooltip-content"]';

async function story(page: Page, name: string, preset = "arcade") {
  // Storybook's embed mode disables automatic plays. These checks own interaction.
  await page.goto(
    `storybook/iframe.html?id=parts-tooltip--${name}&viewMode=story&embed=true&globals=preset:${preset}`,
  );
  await expect(page.locator("#storybook-root")).not.toBeEmpty();
}

async function target(control: Locator) {
  await expect(control).toBeVisible();
  await control.scrollIntoViewIfNeeded();
  const box = await control.boundingBox();
  expect(box!.height, "Tooltip trigger target height").toBeGreaterThanOrEqual(44);
  expect(box!.width, "Tooltip trigger target width").toBeGreaterThanOrEqual(44);
  expect(
    await control.evaluate((el) => {
      const box = el.getBoundingClientRect();
      const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
      return el === hit || el.contains(hit);
    }),
    "Tooltip trigger accepts a pointer at its center",
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

test("Tooltip demo links supplemental text, preserves focus after Escape and activates its controlled action", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("components/");
  await page.getByRole("button", { name: "Preview Tooltip", exact: true }).click();
  const canvas = page.locator(".family-canvas");
  const trigger = canvas.locator('[data-slot="tooltip-trigger"]');
  await target(trigger);
  await trigger.focus();
  const content = page.locator(contentSelector);
  await expect(content).toBeVisible();
  await expect(trigger).toHaveAccessibleName("Save document");
  await expect(trigger).toHaveAccessibleDescription("Keyboard shortcut: Control S.");
  await expect(
    canvas.locator(contentSelector),
    "explicit Portal escapes the demo canvas",
  ).toHaveCount(0);
  await expect(
    content.locator("button, a[href], input, [tabindex]"),
    "tooltip text is noninteractive",
  ).toHaveCount(0);
  await page.screenshot({ path: test.info().outputPath("tooltip-demo.png") });
  await page.keyboard.press("Escape");
  await expect(content).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.press("Enter");
  await expect(canvas.getByRole("status")).toHaveText("Saved 1 time.");
  await expect(content).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(errors).toEqual([]);
});

test("Provider delay holds the first hover while the skip window opens the next root immediately", async ({
  page,
}) => {
  await story(page, "provider-delays");
  const first = page.getByRole("button", { name: "First action" });
  const second = page.getByRole("button", { name: "Second action" });
  await target(first);
  await target(second);
  await first.evaluate((el) => {
    el.addEventListener(
      "pointermove",
      () => {
        el.setAttribute("data-hover-start", String(performance.now()));
      },
      { once: true },
    );
    const observer = new MutationObserver(() => {
      if (el.getAttribute("data-state") !== "closed") {
        el.setAttribute(
          "data-open-elapsed",
          String(performance.now() - Number(el.getAttribute("data-hover-start"))),
        );
        observer.disconnect();
      }
    });
    observer.observe(el, { attributes: true, attributeFilter: ["data-state"] });
  });
  await first.hover();
  await expect(first).toHaveAttribute("data-state", "delayed-open");
  expect(
    Number(await first.getAttribute("data-open-elapsed")),
    "configured provider delay reaches the browser",
  ).toBeGreaterThanOrEqual(280);
  await page.mouse.move(380, 300, { steps: 8 });
  await expect(page.locator(contentSelector)).toHaveCount(0);
  await second.hover();
  await expect(second, "provider skip delay applies to another root").toHaveAttribute(
    "data-state",
    "instant-open",
  );
  await expect(page.getByRole("tooltip")).toHaveText("Second hint");
});

test("Hoverable text remains readable across the trigger gap, and disabling hoverability closes on leave", async ({
  page,
}) => {
  await story(page, "hoverable-content");
  const trigger = page.getByRole("button", { name: "Save document" });
  await trigger.hover();
  const content = page.locator(contentSelector);
  await expect(content).toBeVisible();
  const box = await content.boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2, { steps: 8 });
  await expect(content, "moving into supplemental text preserves the hint").toBeVisible();
  await expect(content).toContainText(
    "Supplemental text stays visible while the pointer reads it.",
  );
  await page.mouse.move(380, 300, { steps: 8 });
  await expect(content).toHaveCount(0);
  await story(page, "immediate-close");
  await page.getByRole("button", { name: "Save document" }).hover();
  await expect(page.locator(contentSelector)).toBeVisible();
  await page.mouse.move(380, 300, { steps: 8 });
  await expect(
    page.locator(contentSelector),
    "disabled hoverability closes on trigger leave",
  ).toHaveCount(0);
});

test("Explicit custom hosts preserve placement, readable wrapping, collision bounds and a painted arrow", async ({
  page,
}) => {
  await story(page, "custom-hosts");
  const link = page.getByRole("link", { name: "Visit settings" });
  await target(link);
  const content = page.locator(contentSelector);
  await expect(content).toBeVisible();
  await expect(content, "top placement flips at the viewport edge").toHaveAttribute(
    "data-side",
    "bottom",
  );
  await expect(content).toHaveAttribute("data-align", "start");
  expect(await content.evaluate((el) => el.tagName)).toBe("SECTION");
  await expect(link).toHaveAccessibleDescription(/^Supplemental details can wrap/);
  const box = await content.boundingBox();
  const viewport = page.viewportSize()!;
  expect(box!.x, "tooltip clears the left collision boundary").toBeGreaterThanOrEqual(7);
  expect(box!.x + box!.width, "tooltip clears the right collision boundary").toBeLessThanOrEqual(
    viewport.width - 7,
  );
  expect(box!.y + box!.height, "tooltip clears the bottom viewport edge").toBeLessThanOrEqual(
    viewport.height - 7,
  );
  expect(
    await content.evaluate((el) => el.scrollHeight <= el.clientHeight),
    "wrapped supplemental text is not clipped",
  ).toBe(true);
  const arrow = content.locator('[data-slot="tooltip-arrow"]');
  await expect(arrow).toBeVisible();
  const arrowPaint = await arrow.evaluate((el) => {
    let opacity = 1;
    for (let current: Element | null = el; current; current = current.parentElement) {
      opacity *= Number(getComputedStyle(current).opacity);
    }
    const drawing = el.querySelector("polygon") ?? el;
    return { opacity, fillOpacity: Number(getComputedStyle(drawing).fillOpacity) };
  });
  expect(
    arrowPaint.opacity * arrowPaint.fillOpacity,
    "the explicit Arrow paints at full opacity",
  ).toBe(1);
  expect(
    await arrow.evaluate((el) => {
      const box = el.getBoundingClientRect();
      const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
      return el === hit || el.contains(hit);
    }),
    "the explicit Arrow paints outside the content boundary",
  ).toBe(true);
  await page.screenshot({ path: test.info().outputPath("tooltip-collision.png") });
});

test("Tooltip in Dialog owns its Escape layer without trapping focus or dismissing the editor", async ({
  page,
}) => {
  await story(page, "in-dialog");
  const outside = page.getByRole("button", { name: "Open editor" });
  await outside.click();
  const dialog = page.getByRole("dialog", { name: "Document editor" });
  const trigger = dialog.getByRole("button", { name: "Save document" });
  await expect(trigger).toBeFocused();
  await expect(page.locator(contentSelector)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(contentSelector)).toHaveCount(0);
  await expect(dialog, "Tooltip Escape preserves its parent Dialog").toBeVisible();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(dialog.getByRole("button", { name: "Close editor" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(trigger).toBeFocused();
  await expect(page.locator(contentSelector)).toBeVisible();
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(outside).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("pointer-events", "none");
});

test("Isolated Tooltip paints visible focus and readable content in dark, light, accent and forced colors", async ({
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
    ["dark", "arcade"],
    ["light", "light"],
    ["accent", "light"],
  ] as const) {
    await story(page, "default", preset);
    await expect(page.locator("html")).toHaveCSS(
      "color-scheme",
      preset === "light" ? "light" : "dark",
    );
    if (mode === "accent")
      await page.locator("html").evaluate((el, roles) => {
        for (const [role, value] of Object.entries(roles)) el.style.setProperty(role, value);
      }, accent);
    const trigger = page.getByRole("button", { name: "Save document" });
    await page.keyboard.press("Tab");
    await expect(trigger).toBeFocused();
    await trigger.evaluate(async (el) => {
      await Promise.all(el.getAnimations().map((animation) => animation.finished));
    });
    await target(trigger);
    await expect(trigger, `${mode} isolated focus outline style`).toHaveCSS(
      "outline-style",
      "solid",
    );
    expect(
      await trigger.evaluate((el) => parseFloat(getComputedStyle(el).outlineWidth)),
      `${mode} isolated focus outline width`,
    ).toBeGreaterThanOrEqual(2);
    expect(
      await contrast(trigger, page.locator("body"), "outlineColor"),
      `${mode} isolated focus outline contrast`,
    ).toBeGreaterThanOrEqual(3);
    expect(
      await contrast(trigger, trigger, "color"),
      `${mode} trigger text contrast`,
    ).toBeGreaterThanOrEqual(4.5);
    const content = page.locator(contentSelector);
    await expect(content).toBeVisible();
    expect(
      await contrast(content, content, "color"),
      `${mode} supplemental text contrast`,
    ).toBeGreaterThanOrEqual(4.5);
    await test.info().attach(`tooltip-${mode}-paint`, {
      body: JSON.stringify(
        await trigger.evaluate((el) => ({
          style: getComputedStyle(el).outlineStyle,
          width: getComputedStyle(el).outlineWidth,
        })),
      ),
      contentType: "application/json",
    });
    await page.screenshot({ path: test.info().outputPath(`tooltip-${mode}.png`) });
  }
  await page.emulateMedia({ forcedColors: "active" });
  const trigger = page.getByRole("button", { name: "Save document" });
  await expect(trigger).toHaveCSS("outline-style", "solid");
  expect(
    await trigger.evaluate((el) => parseFloat(getComputedStyle(el).outlineWidth)),
    "forced colors focus width",
  ).toBeGreaterThanOrEqual(2);
  expect(
    await contrast(trigger, page.locator("body"), "outlineColor"),
    "forced colors focus contrast",
  ).toBeGreaterThanOrEqual(3);
  const content = page.locator(contentSelector);
  await expect(content).toHaveCSS("border-top-style", "solid");
  expect(
    await content.evaluate((el) => parseFloat(getComputedStyle(el).borderTopWidth)),
    "forced colors tooltip boundary width",
  ).toBeGreaterThanOrEqual(2);
  expect(
    await contrast(content, content, "color"),
    "forced colors supplemental text contrast",
  ).toBeGreaterThanOrEqual(4.5);
});

test("Touch activates a named action without needing hover text or trapping focus", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  try {
    await page.goto(`${baseURL}components/`);
    await page.getByRole("button", { name: "Preview Tooltip", exact: true }).tap();
    const canvas = page.locator(".family-canvas");
    const trigger = canvas.getByRole("button", { name: "Save document" });
    await target(trigger);
    await expect(page.locator(contentSelector)).toHaveCount(0);
    await trigger.tap();
    await expect(canvas.getByRole("status")).toHaveText("Saved 1 time.");
    await expect(trigger).toHaveAccessibleName("Save document");
    await expect(page.locator(contentSelector)).toHaveCount(0);
    await page.getByRole("button", { name: "Preview Button", exact: true }).tap();
    await expect(
      page.getByRole("heading", { name: "Button", exact: true, level: 3 }),
    ).toBeFocused();
  } finally {
    await context.close();
  }
});

test("Tooltip composition is highlighted and copies the exact local-alias example", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("components/");
  await page.getByRole("button", { name: "Preview Tooltip", exact: true }).click();
  const block = page.locator(".family-detail .code-block");
  const code = block.locator("pre code");
  expect(await code.textContent()).toBe(example);
  expect(await code.locator(".token").count(), "TSX syntax is highlighted").toBeGreaterThan(20);
  await block.getByRole("button", { name: "Copy Tooltip composition" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(example);
  await expect(block.getByRole("status")).toHaveText("Copied to clipboard");
  await expect(page.locator(".family-canvas")).toContainText("Unreleased candidate.");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
});

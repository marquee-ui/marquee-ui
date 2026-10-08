import { readFileSync } from "node:fs";
import { expect, test, type Locator } from "@playwright/test";

const example = readFileSync(new URL("../src/examples/date-picker.tsx", import.meta.url), "utf8");
const day = (root: Locator, number: number) =>
  root.getByRole("button", { name: new RegExp(`October ${number}(?:st|nd|rd|th), 2026`) });

/** Never scroll a target into place: the panel must already expose its controls. */
async function target(control: Locator) {
  await expect(control).toBeVisible();
  const box = (await control.boundingBox())!;
  expect(box.width, "DatePicker real target width").toBeGreaterThanOrEqual(44);
  expect(box.height, "DatePicker real target height").toBeGreaterThanOrEqual(44);
  await expect
    .poll(
      () =>
        control.evaluate((el) => {
          const rect = el.getBoundingClientRect();
          return [
            [rect.left + 3, rect.top + 3],
            [rect.right - 3, rect.bottom - 3],
            [rect.left + rect.width / 2, rect.top + rect.height / 2],
          ].every(([x, y]) => {
            const hit = document.elementFromPoint(x!, y!);
            return hit === el || el.contains(hit);
          });
        }),
      { message: "DatePicker receives hits across the complete unscrolled target" },
    )
    .toBe(true);
}

async function contained(panel: Locator) {
  const geometry = await panel.evaluate((el) => {
    const box = (node: Element) => {
      const rect = node.getBoundingClientRect(),
        css = getComputedStyle(node);
      return {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
        width: rect.width,
        contentLeft: rect.left + parseFloat(css.borderLeftWidth) + parseFloat(css.paddingLeft),
        contentRight: rect.right - parseFloat(css.borderRightWidth) - parseFloat(css.paddingRight),
        contentTop: rect.top + parseFloat(css.borderTopWidth) + parseFloat(css.paddingTop),
        contentBottom:
          rect.bottom - parseFloat(css.borderBottomWidth) - parseFloat(css.paddingBottom),
        padding: parseFloat(css.paddingLeft),
        clientWidth: node.clientWidth,
        scrollWidth: node.scrollWidth,
      };
    };
    return {
      panel: box(el),
      root: box(el.querySelector('[data-slot="calendar"]')!),
      grid: box(el.querySelector('[role="grid"]')!),
      viewport: innerWidth,
      viewportHeight: innerHeight,
      days: [...el.querySelectorAll('[data-slot="calendar-day-button"]')].map(box),
    };
  });
  expect(geometry.panel.left, "panel begins inside viewport").toBeGreaterThanOrEqual(0);
  expect(geometry.panel.right, "panel ends inside viewport").toBeLessThanOrEqual(geometry.viewport);
  expect(geometry.panel.padding, "panel grants usable padding").toBeGreaterThanOrEqual(8);
  expect(geometry.panel.scrollWidth, "panel has no hidden horizontal overflow").toBeLessThanOrEqual(
    geometry.panel.clientWidth,
  );
  expect(
    geometry.root.width,
    "Calendar complete frame retains its standard minimum",
  ).toBeGreaterThanOrEqual(328);
  expect(geometry.grid.width, "grid retains seven 44px columns").toBeGreaterThanOrEqual(308);
  expect(geometry.root.left, "Calendar frame begins inside panel content").toBeGreaterThanOrEqual(
    geometry.panel.contentLeft - 0.5,
  );
  expect(geometry.root.right, "Calendar frame ends inside panel content").toBeLessThanOrEqual(
    geometry.panel.contentRight + 0.5,
  );
  expect(geometry.panel.top, "panel begins inside viewport vertically").toBeGreaterThanOrEqual(0);
  expect(geometry.panel.bottom, "panel ends inside viewport vertically").toBeLessThanOrEqual(
    geometry.viewportHeight,
  );
  for (const child of [geometry.grid, ...geometry.days]) {
    expect(child.left, "grid/day begins inside Calendar content").toBeGreaterThanOrEqual(
      geometry.root.contentLeft - 0.5,
    );
    expect(child.right, "grid/day ends inside Calendar content").toBeLessThanOrEqual(
      geometry.root.contentRight + 0.5,
    );
  }
  await test.info().attach("date-picker-geometry", {
    body: JSON.stringify(geometry),
    contentType: "application/json",
  });
}

async function paint(control: Locator) {
  return control.evaluate((el) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d")!;
    const rgba = (color: string) => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      return [...ctx.getImageData(0, 0, 1, 1).data].map((n, index) => (index === 3 ? n / 255 : n));
    };
    const ground = (element: Element | null) => {
      const chain: Element[] = [];
      for (let node = element; node; node = node.parentElement) chain.unshift(node);
      // An unpainted html canvas receives the body's background even beyond
      // the body's short layout box (CSS background propagation).
      const rootFill = rgba(getComputedStyle(document.documentElement).backgroundColor);
      const propagated = rootFill[3] === 0;
      const canvasFill = propagated
        ? rgba(getComputedStyle(document.body).backgroundColor)
        : rootFill;
      let result = [0, 1, 2].map(
        (i) => canvasFill[i]! * canvasFill[3]! + 255 * (1 - canvasFill[3]!),
      );
      for (const node of chain) {
        if (node === document.documentElement || (propagated && node === document.body)) continue;
        const c = rgba(getComputedStyle(node).backgroundColor);
        result = result.map((n, i) => c[i]! * c[3]! + n * (1 - c[3]!));
      }
      return result;
    };
    const luminance = (channels: number[]) => {
      const linear = channels
        .slice(0, 3)
        .map((n) => (n / 255 <= 0.04045 ? n / 255 / 12.92 : ((n / 255 + 0.055) / 1.055) ** 2.4));
      return linear[0]! * 0.2126 + linear[1]! * 0.7152 + linear[2]! * 0.0722;
    };
    const contrast = (a: number[], b: number[]) => {
      const l1 = luminance(a),
        l2 = luminance(b);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    };
    const css = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const offset = parseFloat(css.outlineOffset) + parseFloat(css.outlineWidth) / 2;
    const exterior = [
      [rect.left - offset, rect.top + rect.height / 2],
      [rect.right + offset, rect.top + rect.height / 2],
      [rect.left + rect.width / 2, rect.top - offset],
      [rect.left + rect.width / 2, rect.bottom + offset],
    ].map(([x, y]) => {
      const outside = document.elementFromPoint(x!, y!);
      if (!outside) throw new Error("DatePicker focus exterior is outside the viewport");
      return ground(outside);
    });
    let opacity = 1;
    let visible = true;
    for (let node: Element | null = el; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      opacity *= Number(style.opacity);
      visible &&=
        style.display !== "none" &&
        style.visibility === "visible" &&
        style.contentVisibility !== "hidden";
    }
    const ink = rgba(css.color),
      outline = rgba(css.outlineColor);
    const composite = (color: number[], fill: number[]) =>
      color
        .slice(0, 3)
        .map((channel, index) => channel * color[3]! + fill[index]! * (1 - color[3]!));
    const textGround = ground(el);
    return {
      opacity,
      visible,
      outlineStyle: css.outlineStyle,
      outlineWidth: parseFloat(css.outlineWidth),
      outlineAlpha: outline[3],
      focusContrast: Math.min(...exterior.map((fill) => contrast(composite(outline, fill), fill))),
      textContrast: contrast(composite(ink, textGround), textGround),
      backgroundAlpha: rgba(css.backgroundColor)[3],
    };
  });
}

async function focusPaint(control: Locator, label: string) {
  await control.focus();
  await expect(control).toBeFocused();
  await control.evaluate(async (el) => {
    await Promise.all(el.getAnimations().map((animation) => animation.finished));
  });
  const values = await paint(control);
  expect(values.visible, `${label} ancestors show the focused control`).toBe(true);
  expect(values.opacity, `${label} effective opacity`).toBe(1);
  expect(values.outlineStyle, `${label} solid focus`).toBe("solid");
  expect(values.outlineWidth, `${label} focus width`).toBeGreaterThanOrEqual(2);
  expect(values.outlineAlpha, `${label} visible focus alpha`).toBeGreaterThan(0);
  expect(
    values.focusContrast,
    `${label} focus contrasts with actual exterior paint`,
  ).toBeGreaterThanOrEqual(3);
  await test
    .info()
    .attach(label, { body: JSON.stringify(values), contentType: "application/json" });
}

test("DatePicker docs preserve selection, disabled dates, keyboard, range completion, caller forms and reset", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Preview DatePicker", exact: true }).click();
  const canvas = page.locator(".family-canvas");
  const trigger = canvas.getByRole("button", { name: "Choose date" });
  await trigger.click();
  const panel = page.getByRole("dialog", { name: "Choose a day" });
  await expect(panel).toHaveAccessibleDescription("The 14th is unavailable.");
  await expect(day(panel, 12)).toBeFocused();
  await expect(day(panel, 14)).toBeDisabled();
  await day(panel, 12).press("ArrowRight");
  await expect(day(panel, 13)).toBeFocused();
  await day(panel, 13).press("ArrowRight");
  await expect(day(panel, 15)).toBeFocused();
  await day(panel, 15).press("Enter");
  await expect(panel).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(canvas.getByLabel("Selected date", { exact: true })).toHaveText("October 15, 2026");
  await expect(canvas.locator('input[name="day"]')).toHaveValue("2026-10-15");
  await trigger.click();
  await expect(day(panel, 15)).toBeFocused();
  await panel.getByRole("button", { name: "Close date" }).click();
  await expect(trigger).toBeFocused();
  await expect(canvas.locator('input[name="day"]')).toHaveValue("2026-10-15");
  await trigger.click();
  await expect(panel).toBeVisible();
  await canvas.getByRole("button", { name: "Outside action" }).click();
  await expect(panel).toHaveCount(0);
  await expect(canvas.getByRole("button", { name: "Outside action" })).toBeFocused();
  await expect(canvas.getByLabel("Outside clicks")).toHaveText("Outside clicks: 1");
  await canvas.getByRole("button", { name: "Choose range" }).click();
  const range = page.getByRole("dialog", { name: "Choose date range" });
  await expect(day(range, 18)).toBeDisabled();
  await day(range, 22).click();
  await expect(range.getByText("Choose an end day")).toBeVisible();
  await expect(canvas.locator('input[name="from"]')).toHaveValue("2026-10-22");
  await expect(canvas.locator('input[name="to"]')).toHaveValue("");
  await range.getByRole("button", { name: "Close range" }).click();
  await expect(range).toHaveCount(0);
  await expect(canvas.getByRole("button", { name: "Choose range" })).toBeFocused();
  await expect(canvas.locator('input[name="from"]')).toHaveValue("2026-10-22");
  await canvas.getByRole("button", { name: "Choose range" }).click();
  await expect(day(range, 22).locator("..")).toHaveAttribute("aria-selected", "true");
  await expect(range.getByText("Choose an end day")).toBeVisible();
  await target(day(range, 24));
  await day(range, 24).click();
  await expect(range).toHaveCount(0);
  await expect(canvas.getByRole("button", { name: "Choose range" })).toBeFocused();
  await expect(canvas.getByLabel("Selected range")).toHaveText(
    "October 22, 2026 – October 24, 2026",
  );
  await expect(canvas.locator('input[name="to"]')).toHaveValue("2026-10-24");
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
    "completed range creates no page overflow",
  ).toBeLessThanOrEqual(page.viewportSize()!.width);
  await canvas.screenshot({
    path: test.info().outputPath("date-picker-completed-range-example.png"),
  });
  await canvas.getByRole("button", { name: "Save dates" }).click();
  await expect(
    canvas.getByText("Saved day: 2026-10-15; range: 2026-10-22 to 2026-10-24", { exact: true }),
  ).toBeVisible();
  await canvas.getByRole("button", { name: "Reset dates" }).click();
  await expect(canvas.getByLabel("Selected date", { exact: true })).toHaveText("No date selected");
  await expect(canvas.getByLabel("Selected range")).toHaveText("No complete range");
  for (const name of ["day", "from", "to"])
    await expect(canvas.locator(`input[name="${name}"]`)).toHaveValue("");
  await trigger.click();
  await expect(panel.getByRole("gridcell", { selected: true })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await canvas.screenshot({ path: test.info().outputPath("date-picker-complete-example.png") });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
    "example creates no page overflow",
  ).toBeLessThanOrEqual(page.viewportSize()!.width);
});

test("DatePicker isolated panel contains the full frame and every Saturday without scroll repairs", async ({
  page,
}) => {
  await page.goto("storybook/iframe.html?id=parts-datepicker--default&viewMode=story&embed=true");
  const trigger = page.getByRole("button", { name: "Choose date" });
  await expect(trigger).toBeVisible();
  await trigger.click();
  const panel = page.getByRole("dialog", { name: "Choose a day" });
  await contained(panel);
  for (const button of await panel.locator("button:not(:disabled)").all()) await target(button);
  for (const saturday of [3, 10, 17, 24, 31]) await target(day(panel, saturday));
  await day(panel, 31).click();
  await expect(panel).toHaveCount(0);
  await expect(trigger).toHaveText("October 31, 2026");
  await trigger.click();
  await expect(day(panel, 31).locator("..")).toHaveAttribute("aria-selected", "true");
  await expect(day(panel, 31)).toBeFocused();
  await panel.screenshot({ path: test.info().outputPath("date-picker-contained-saturday.png") });
});

test("DatePicker fits inside Dialog and Escape dismisses one scope with correct focus return", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Preview DatePicker", exact: true }).click();
  const outer = page.getByRole("button", { name: "Open schedule dialog" });
  await outer.click();
  const dialog = page.getByRole("dialog", { name: "Schedule details", exact: true });
  const trigger = dialog.getByRole("button", { name: "Choose dialog date" });
  await expect(trigger).toBeFocused();
  await trigger.click();
  const panel = page.getByRole("dialog", { name: "Dialog date", exact: true });
  await expect(day(panel, 12)).toBeFocused();
  await contained(panel);
  for (const saturday of [3, 10, 17, 24]) await target(day(panel, saturday));
  // A centered modal leaves less vertical space than a complete popup. Observe
  // the scroll region first, then use a real wheel to reveal its lower controls.
  const before = await panel.evaluate((el) => ({
    top: el.scrollTop,
    height: el.clientHeight,
    scrollHeight: el.scrollHeight,
  }));
  if (before.scrollHeight > before.height) {
    await expect(panel).toHaveCSS("overflow-y", "auto");
    await panel.hover();
    await page.mouse.wheel(0, before.scrollHeight);
    await expect
      .poll(() => panel.evaluate((el) => el.scrollTop), {
        message: "nested popup responds to real wheel scrolling",
      })
      .toBeGreaterThan(before.top);
  }
  await target(day(panel, 31));
  await target(panel.getByRole("button", { name: "Done with date" }));
  await day(panel, 31).click();
  await expect(day(panel, 31).locator("..")).toHaveAttribute("aria-selected", "true");
  await expect(dialog.getByLabel("Dialog selected date")).toHaveText("October 31, 2026");
  await expect(panel).toBeVisible();
  await page.screenshot({ path: test.info().outputPath("date-picker-nested-dialog.png") });
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await expect(dialog).toBeVisible();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(outer).toBeFocused();
  expect(
    await page.evaluate(() => document.body.style.pointerEvents),
    "nested locks released",
  ).not.toBe("none");
});

test("DatePicker real hosts paint focus outside docs CSS in light, dark and forced colors", async ({
  page,
}) => {
  for (const [preset, forced] of [
    ["arcade", false],
    ["light", false],
    ["arcade", true],
  ] as const) {
    await page.emulateMedia({ forcedColors: forced ? "active" : "none" });
    await page.goto(
      `storybook/iframe.html?id=parts-datepicker--default&viewMode=story&embed=true&globals=preset:${preset}`,
    );
    const trigger = page.getByRole("button", { name: "Choose date" });
    await expect(trigger).toBeVisible();
    if (preset === "light") {
      const sheet = page.locator("#marquee-light-preset");
      await expect(sheet).toHaveAttribute("href", "./tokens/light.css");
      await expect
        .poll(() => sheet.evaluate((el) => (el as HTMLLinkElement).sheet !== null))
        .toBe(true);
    }
    await page.keyboard.press("Tab");
    await focusPaint(trigger, `${preset}/${forced} Trigger`);
    await trigger.press("Enter");
    const panel = page.getByRole("dialog", { name: "Choose a day" });
    await expect(day(panel, 12)).toBeFocused();
    await target(day(panel, 12));
    await focusPaint(day(panel, 12), `${preset}/${forced} selected day`);
    await focusPaint(
      panel.getByRole("button", { name: "Go to the Next Month" }),
      `${preset}/${forced} navigation`,
    );
    await focusPaint(
      panel.getByRole("button", { name: "Close date" }),
      `${preset}/${forced} Close`,
    );
    await focusPaint(panel, `${preset}/${forced} Content`);
    await panel.screenshot({
      path: test.info().outputPath(`date-picker-focus-${preset}-${forced}.png`),
    });
    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);
  }
});

test("DatePicker example source is highlighted and copied byte for byte", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("./");
  await page.getByRole("button", { name: "Preview DatePicker", exact: true }).click();
  const block = page.locator(".family-detail .code-block");
  expect(await block.locator("pre code").textContent()).toBe(example);
  expect(
    await block.locator("pre code .token").count(),
    "DatePicker source is highlighted",
  ).toBeGreaterThan(20);
  await block.getByRole("button", { name: "Copy DatePicker composition" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(example);
  await expect(block.getByRole("status")).toHaveText("Copied to clipboard");
});

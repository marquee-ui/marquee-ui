import { readFileSync } from "node:fs";
import { expect, test, type Locator } from "@playwright/test";
const example = readFileSync(new URL("../src/examples/data-table.tsx", import.meta.url), "utf8");

async function realTarget(control: Locator) {
  await expect(control).toBeVisible();
  const box = (await control.boundingBox())!;
  expect(box.width, "data table control real width").toBeGreaterThanOrEqual(44);
  expect(box.height, "data table control real height").toBeGreaterThanOrEqual(44);
  await expect
    .poll(
      () =>
        control.evaluate((el) => {
          const rect = el.getBoundingClientRect();
          return [
            [rect.left + 3, rect.top + rect.height / 2],
            [rect.right - 3, rect.top + rect.height / 2],
            [rect.left + rect.width / 2, rect.top + 3],
            [rect.left + rect.width / 2, rect.bottom - 3],
            [rect.left + rect.width / 2, rect.top + rect.height / 2],
          ].every(([x, y]) => {
            const hit = document.elementFromPoint(x!, y!);
            return hit === el || el.contains(hit);
          });
        }),
      {
        message: "data table control receives pointer hits across its target without scroll repair",
      },
    )
    .toBe(true);
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
      return [...ctx.getImageData(0, 0, 1, 1).data].map((n, i) => (i === 3 ? n / 255 : n));
    };
    const ground = (element: Element | null) => {
      const chain: Element[] = [];
      for (let node = element; node; node = node.parentElement) chain.unshift(node);
      let result = [255, 255, 255];
      for (const node of chain) {
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
    const css = getComputedStyle(el),
      rect = el.getBoundingClientRect();
    // Sample the actual exterior even when the outline is inset to avoid clipping.
    const exterior = [
      [rect.left - 1, rect.top + rect.height / 2],
      [rect.right + 1, rect.top + rect.height / 2],
      [rect.left + rect.width / 2, rect.top - 1],
      [rect.left + rect.width / 2, rect.bottom + 1],
    ].map(([x, y]) => ground(document.elementFromPoint(x!, y!)));
    let opacity = 1,
      visible = true;
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
      color.slice(0, 3).map((channel, i) => channel * color[3]! + fill[i]! * (1 - color[3]!));
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

async function focusContained(control: Locator) {
  const focusEdge = await control.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const boundary = el.closest('[role="region"]')!.getBoundingClientRect();
    const css = getComputedStyle(el);
    const extension = parseFloat(css.outlineWidth) + Math.max(0, parseFloat(css.outlineOffset));
    return {
      left: rect.left - extension,
      right: rect.right + extension,
      start: boundary.left,
      end: boundary.right,
    };
  });
  expect(
    focusEdge.left,
    "action focus outline fits the scroll region's leading edge",
  ).toBeGreaterThanOrEqual(focusEdge.start);
  expect(
    focusEdge.right,
    "action focus outline fits the scroll region's trailing edge",
  ).toBeLessThanOrEqual(focusEdge.end);
}

test("DataTable client sorting, filter recovery, finite pages, and cell menu work after native keyboard scroll", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Preview DataTable", exact: true }).click();
  const canvas = page.locator(".family-canvas");
  const region = canvas.getByRole("region", { name: "Client entries" });
  const table = region.getByRole("table", { name: "Client entries" });
  await expect(table).toBeVisible();
  expect(await table.evaluate((el) => [...el.children].map((child) => child.tagName))).toEqual([
    "CAPTION",
    "THEAD",
    "TBODY",
  ]);
  await expect(table.getByRole("columnheader", { name: "Action" })).toHaveAttribute("scope", "col");
  await expect(table.getByRole("rowheader", { name: "Cedar" })).toHaveAttribute("scope", "row");
  await region.scrollIntoViewIfNeeded();
  await region.focus();
  expect(await region.evaluate((el) => el.scrollLeft), "native horizontal starting position").toBe(
    0,
  );
  const overflow = await region.evaluate((el) => el.scrollWidth - el.clientWidth);
  if (page.viewportSize()!.width === 390)
    expect(overflow, "mobile table owns its overflow").toBeGreaterThan(100);
  if (overflow > 0) {
    for (let i = 0; i < 24; i++) await region.press("ArrowRight", { delay: 50 });
    await expect
      .poll(() => region.evaluate((el) => el.scrollLeft), {
        message: "native arrows reach the last column before any control helper",
      })
      .toBeGreaterThanOrEqual(overflow - 1);
  }
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
    "table never widens page",
  ).toBeLessThanOrEqual(page.viewportSize()!.width);
  await canvas.screenshot({ path: test.info().outputPath("data-table-last-column.png") });
  await region.press("Tab");
  const name = table.getByRole("button", { name: /^Name/ });
  await expect(name).toBeFocused();
  await name.press("Tab");
  const amount = table.getByRole("button", { name: /^Amount/ });
  await expect(amount).toBeFocused();
  await amount.press("Tab");
  const action = table.getByRole("button", { name: "Actions for Cedar" });
  await expect(action).toBeFocused();
  await realTarget(action);
  await focusContained(action);
  await canvas.screenshot({ path: test.info().outputPath("data-table-keyboard-action.png") });
  await action.press("Enter");
  const item = page.getByRole("menuitem", { name: "Open Cedar" });
  await expect(item).toBeFocused();
  await realTarget(item);
  await item.press("Enter");
  await expect(canvas.getByLabel("Opened entry")).toHaveText("Opened entry: Cedar");
  await expect(action).toBeFocused();
  const names = () => table.getByRole("rowheader").allTextContents();
  await name.click();
  expect(await names()).toEqual(["Aster", "Birch"]);
  await expect(table.getByRole("columnheader", { name: /^Name/ })).toHaveAttribute(
    "aria-sort",
    "ascending",
  );
  await expect(name).toHaveAccessibleName(/^Name\s*, Sorted ascending$/);
  await name.click();
  expect(await names()).toEqual(["Elm", "Dahlia"]);
  await expect(table.getByRole("columnheader", { name: /^Name/ })).toHaveAttribute(
    "aria-sort",
    "descending",
  );
  await amount.click();
  expect(await names()).toEqual(["Aster", "Elm"]);
  await expect(table.getByRole("columnheader", { name: /^Amount/ })).toHaveAttribute(
    "aria-sort",
    "descending",
  );
  await expect(table.getByRole("columnheader", { name: /^Name/ })).toHaveAttribute(
    "aria-sort",
    "none",
  );
  await amount.click();
  expect(await names()).toEqual(["Dahlia", "Birch"]);
  await expect(table.getByRole("columnheader", { name: /^Amount/ })).toHaveAttribute(
    "aria-sort",
    "ascending",
  );
  await canvas.getByRole("button", { name: "Next" }).click();
  expect(await names()).toEqual(["Cedar", "Elm"]);
  await canvas.getByRole("button", { name: "Next" }).click();
  expect(await names()).toEqual(["Aster"]);
  await expect(canvas.getByRole("button", { name: "Next" })).toBeDisabled();
  await expect(canvas.getByLabel("Entry page", { exact: true })).toHaveText(
    "Page 3 of 3. 5 results.",
  );
  await canvas.getByRole("button", { name: "Previous" }).click();
  expect(await names()).toEqual(["Cedar", "Elm"]);
  await canvas.getByLabel("Filter name").fill("elm");
  expect(await names()).toEqual(["Elm"]);
  await expect(canvas.getByLabel("Entry page", { exact: true })).toHaveText(
    "Page 1 of 1. 1 results.",
  );
  await canvas.getByLabel("Filter name").fill("missing");
  await expect(table.getByRole("cell", { name: "No matching entries." })).toHaveAttribute(
    "colspan",
    "4",
  );
  await expect(canvas.getByRole("button", { name: "Previous" })).toBeDisabled();
  await expect(canvas.getByRole("button", { name: "Next" })).toBeDisabled();
  await canvas.screenshot({ path: test.info().outputPath("data-table-empty.png") });
  await canvas.getByLabel("Filter name").fill("");
  expect(await names()).toEqual(["Dahlia", "Birch"]);
  await canvas.screenshot({ path: test.info().outputPath("data-table-recovered.png") });
});

test("DataTable sort focus and changed data remain readable in isolated dark, light and forced colors", async ({
  page,
}) => {
  for (const [preset, forced] of [
    ["arcade", false],
    ["light", false],
    ["light", true],
  ] as const) {
    await page.emulateMedia({ forcedColors: forced ? "active" : "none" });
    await page.goto(
      `storybook/iframe.html?id=parts-datatable--default&viewMode=story&embed=true&globals=preset:${preset}`,
    );
    const region = page.getByRole("region", { name: "Client entries" });
    await expect(region).toBeVisible();
    if (preset === "light")
      await expect
        .poll(() =>
          page
            .locator("link#marquee-light-preset")
            .evaluate((el) => Boolean((el as HTMLLinkElement).sheet)),
        )
        .toBe(true);
    await page.keyboard.press("Tab");
    const sort = region.getByRole("button", { name: /^Name/ });
    await sort.focus();
    await expect(sort).toBeFocused();
    await realTarget(sort);
    await expect
      .poll(async () => (await paint(sort)).textContrast, {
        message: "sort text settles to readable token paint after preset and hover transitions",
      })
      .toBeGreaterThanOrEqual(4.5);
    const focused = await paint(sort);
    expect(focused.visible).toBe(true);
    expect(focused.opacity).toBe(1);
    expect(focused.outlineStyle, "isolated sort focus has a solid line").toBe("solid");
    expect(focused.outlineWidth, "isolated sort focus width").toBeGreaterThanOrEqual(2);
    expect(focused.outlineAlpha).toBeGreaterThan(0);
    expect(
      focused.focusContrast,
      "sort focus contrasts with actual exterior paint",
    ).toBeGreaterThanOrEqual(3);
    expect(focused.textContrast, "sort text contrasts with its own surface").toBeGreaterThanOrEqual(
      4.5,
    );
    await sort.press("Enter");
    await expect(region.getByRole("columnheader", { name: /^Name/ })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
    expect(await region.getByRole("rowheader").allTextContents()).toEqual(["Aster", "Birch"]);
    const row = await paint(region.getByRole("rowheader", { name: "Aster" }));
    expect(row.textContrast, "sorted data remains readable").toBeGreaterThanOrEqual(4.5);
    await region.screenshot({
      path: test.info().outputPath(`data-table-sort-${preset}-${forced}.png`),
    });
    await sort.press("Tab");
    await page.keyboard.press("Tab");
    const action = region.getByRole("button", { name: "Actions for Aster" });
    await expect(action).toBeFocused();
    await realTarget(action);
    await focusContained(action);
    const actionPaint = await paint(action);
    expect(actionPaint.outlineStyle, "isolated cell action focus style").toBe("solid");
    expect(actionPaint.outlineWidth, "isolated cell action focus width").toBeGreaterThanOrEqual(2);
    expect(
      actionPaint.focusContrast,
      "isolated cell action focus contrasts with its exterior",
    ).toBeGreaterThanOrEqual(3);
    expect(actionPaint.textContrast, "isolated cell action text contrast").toBeGreaterThanOrEqual(
      4.5,
    );
    await region.screenshot({
      path: test.info().outputPath(`data-table-action-${preset}-${forced}.png`),
    });
    await page.getByLabel("Filter name").fill("missing");
    const empty = region.getByRole("cell", { name: "No matching entries." });
    await expect(empty).toHaveAttribute("colspan", "4");
    expect((await paint(empty)).textContrast, "empty text remains readable").toBeGreaterThanOrEqual(
      4.5,
    );
    await region.screenshot({
      path: test.info().outputPath(`data-table-empty-${preset}-${forced}.png`),
    });
  }
});

test("DataTable grouped render slots and slotted native hosts work outside docs CSS", async ({
  page,
}) => {
  await page.goto(
    "storybook/iframe.html?id=parts-datatable--header-groups&viewMode=story&embed=true",
  );
  const table = page.getByRole("table", { name: "Grouped entries" });
  await expect(table.getByRole("columnheader", { name: "Details" })).toHaveAttribute(
    "scope",
    "colgroup",
  );
  await expect(table.getByRole("columnheader", { name: "Details" })).toHaveAttribute(
    "colspan",
    "2",
  );
  await expect(table.locator("thead tr")).toHaveCount(2);
  await expect(table.getByRole("cell", { name: "Monthly service" })).toBeVisible();
  await page.goto("storybook/iframe.html?id=parts-datatable--composed&viewMode=story&embed=true");
  const composed = page.getByRole("table", { name: "Composed entries" });
  await expect(composed).toHaveAttribute("data-custom-table");
  const empty = composed.getByRole("cell", { name: "No columns yet." });
  await expect(empty).toHaveAttribute("data-custom-empty");
  await expect(empty).toHaveAttribute("colspan", "1");
  const sort = composed.getByRole("button", { name: "Caller sort" });
  await realTarget(sort);
  await sort.click();
  await expect(composed.getByRole("columnheader", { name: "Caller sort" })).toHaveAttribute(
    "aria-sort",
    "ascending",
  );
  await expect(sort).toHaveAttribute("aria-description", "Sorted ascending");
});

test("DataTable example source is highlighted and copied byte for byte", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("./");
  await page.getByRole("button", { name: "Preview DataTable", exact: true }).click();
  const section = page.locator(".family-detail .code-block");
  expect(await section.locator("pre code").textContent()).toBe(example);
  expect(
    await section.locator("pre code .token").count(),
    "data table source highlighting",
  ).toBeGreaterThan(10);
  await section.getByRole("button", { name: "Copy DataTable composition" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(example);
  await expect(section.getByRole("status")).toHaveText("Copied to clipboard");
});

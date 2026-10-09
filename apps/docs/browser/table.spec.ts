import { readFileSync } from "node:fs";
import { expect, test, type Locator } from "@playwright/test";

const example = readFileSync(new URL("../src/examples/table.tsx", import.meta.url), "utf8");

async function realTarget(control: Locator) {
  await expect(control).toBeVisible();
  const box = (await control.boundingBox())!;
  expect(box.width, "table action real width").toBeGreaterThanOrEqual(44);
  expect(box.height, "table action real height").toBeGreaterThanOrEqual(44);
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
      { message: "table action receives pointer hits across its target without scroll repair" },
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

test("Table preserves native semantics and keyboard scrolls to a real last-column action without page overflow", async ({
  page,
}) => {
  await page.goto("components/");
  await page.getByRole("button", { name: "Preview Table", exact: true }).click();
  const canvas = page.locator(".family-canvas");
  const region = canvas.getByRole("region", { name: "Recent invoices" });
  const table = region.getByRole("table", { name: "Recent invoices" });
  await expect(table).toBeVisible();
  expect(await table.evaluate((el) => [...el.children].map((child) => child.tagName))).toEqual([
    "CAPTION",
    "THEAD",
    "TBODY",
    "TFOOT",
  ]);
  await expect(table.getByRole("columnheader", { name: "Action" })).toHaveAttribute("scope", "col");
  await expect(table.getByRole("rowheader", { name: "INV-101" })).toHaveAttribute("scope", "row");
  await expect(table.locator("tfoot th")).toHaveAttribute("colspan", "2");
  await expect(table.locator("tfoot td")).toHaveText("200.00");
  await expect(
    canvas
      .getByRole("table", { name: "Pending invoices" })
      .getByRole("cell", { name: "No invoices yet." }),
  ).toHaveAttribute("colspan", "2");
  // Only the region is brought vertically into view. No action helper scrolls a cell.
  await region.scrollIntoViewIfNeeded();
  await region.focus();
  await expect(region).toBeFocused();
  expect(await region.evaluate((el) => el.scrollLeft), "horizontal start before keyboard").toBe(0);
  const overflow = await region.evaluate((el) => el.scrollWidth - el.clientWidth);
  if (page.viewportSize()!.width === 390)
    expect(overflow, "wide mobile table overflows only its region").toBeGreaterThan(100);
  if (overflow > 0) {
    for (let i = 0; i < 20; i++) await region.press("ArrowRight", { delay: 50 });
    await expect
      .poll(() => region.evaluate((el) => el.scrollLeft), {
        message: "native ArrowRight scroll reaches the final column before any helper",
      })
      .toBeGreaterThanOrEqual(overflow - 1);
  }
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
    "table never widens the page",
  ).toBeLessThanOrEqual(page.viewportSize()!.width);
  await region.press("Tab");
  const select = table.getByRole("button", { name: "Select INV-101" });
  await expect(select).toBeFocused();
  await select.press("Tab");
  const action = table.getByRole("button", { name: "Open INV-102" });
  await expect(action).toBeFocused();
  await realTarget(action);
  await action.press("Enter");
  await expect(canvas.getByLabel("Opened invoice")).toHaveText("Opened invoice: INV-102");
  await realTarget(select);
  await select.click();
  await expect(select).toHaveAttribute("aria-pressed", "false");
  await expect(select.locator("xpath=ancestor::tr")).not.toHaveAttribute("data-state");
  await canvas.screenshot({ path: test.info().outputPath("table-complete-final-column.png") });
  await region.focus();
  if (overflow > 0) {
    for (let i = 0; i < 20; i++) await region.press("ArrowLeft", { delay: 50 });
    await expect.poll(() => region.evaluate((el) => el.scrollLeft)).toBe(0);
  }
  await canvas.screenshot({ path: test.info().outputPath("table-complete-first-column.png") });
});

test("Table grouped headers and every asChild host retain native structure and caller actions outside docs CSS", async ({
  page,
}) => {
  await page.goto("storybook/iframe.html?id=parts-table--header-groups&viewMode=story&embed=true");
  const table = page.getByRole("table", { name: "Quarterly totals" });
  await expect(table.getByRole("columnheader", { name: "Quarter" })).toHaveAttribute(
    "rowspan",
    "2",
  );
  await expect(table.getByRole("columnheader", { name: "Revenue" })).toHaveAttribute(
    "scope",
    "colgroup",
  );
  await expect(table.getByRole("cell", { name: "120" })).toHaveAttribute("headers", "q1 revenue");
  await page.goto("storybook/iframe.html?id=parts-table--composed&viewMode=story&embed=true");
  const region = page.getByRole("region", { name: "Composed invoices" });
  await expect(region).toBeVisible();
  expect(await region.evaluate((el) => el.tagName)).toBe("SECTION");
  const tags = await region.evaluate((el) =>
    [...el.querySelectorAll("[data-slot]")]
      .filter((node) => node.getAttribute("data-slot")?.startsWith("table"))
      .map((node) => node.tagName),
  );
  expect(tags).toEqual([
    "TABLE",
    "CAPTION",
    "THEAD",
    "TR",
    "TH",
    "TBODY",
    "TR",
    "TD",
    "TFOOT",
    "TR",
    "TD",
  ]);
  const action = region.getByRole("button", { name: "Open composed invoice" });
  await realTarget(action);
  await action.click();
  await expect(page.getByLabel("Composed action")).toHaveText("opened");
});

test("Table hosts paint isolated focus and selected rows in dark, light and forced colors", async ({
  page,
}) => {
  for (const [preset, forced] of [
    ["arcade", false],
    ["light", false],
    ["light", true],
  ] as const) {
    await page.emulateMedia({ forcedColors: forced ? "active" : "none" });
    await page.goto(
      `storybook/iframe.html?id=parts-table--focusable-parts&viewMode=story&embed=true&globals=preset:${preset}`,
    );
    const region = page.getByRole("region", { name: "Focusable table parts" });
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
    for (const name of [
      "table-container",
      "table",
      "table-caption",
      "table-header",
      "table-row",
      "table-head",
      "table-body",
      "table-cell",
      "table-footer",
    ]) {
      const host = page.locator(`[data-slot="${name}"]`);
      await host.focus();
      await expect(host).toBeFocused();
      const values = await paint(host);
      expect(values.visible, `${preset}/${forced}/${name} ancestors are visible`).toBe(true);
      expect(values.opacity, `${name} effective opacity`).toBe(1);
      expect(values.outlineStyle, `${name} focus style`).toBe("solid");
      expect(values.outlineWidth, `${name} focus width`).toBeGreaterThanOrEqual(2);
      expect(values.outlineAlpha, `${name} outline has visible alpha`).toBeGreaterThan(0);
      expect(
        values.focusContrast,
        `${name} contrast against actual exterior paint`,
      ).toBeGreaterThanOrEqual(3);
    }
    await region.screenshot({
      path: test.info().outputPath(`table-focus-${preset}-${forced}.png`),
    });
    await page.goto(
      `storybook/iframe.html?id=parts-table--default&viewMode=story&embed=true&globals=preset:${preset}`,
    );
    const selection = page.getByRole("button", { name: "Select INV-101" });
    await expect(selection).toBeVisible();
    if (preset === "light")
      await expect
        .poll(() =>
          page
            .locator("link#marquee-light-preset")
            .evaluate((el) => Boolean((el as HTMLLinkElement).sheet)),
        )
        .toBe(true);
    await expect(selection).toHaveAttribute("aria-pressed", "true");
    const row = selection.locator("xpath=ancestor::tr");
    await expect(row).toHaveAttribute("data-state", "selected");
    const selected = await paint(row);
    const selectedFill = await row.evaluate((el) => getComputedStyle(el).backgroundColor);
    const cellPaint = await paint(row.locator("th"));
    expect(
      cellPaint.textContrast,
      "selected row header contrasts with actual selected surface",
    ).toBeGreaterThanOrEqual(4.5);
    if (forced) {
      expect(selected.outlineStyle, "forced colors preserve selected row boundary").toBe("solid");
      expect(selected.outlineWidth, "forced colors selected boundary width").toBeGreaterThanOrEqual(
        2,
      );
    } else expect(selected.backgroundAlpha, "selected row has opaque token paint").toBe(1);
    await selection.scrollIntoViewIfNeeded();
    await realTarget(selection);
    await page.getByRole("region", { name: "Recent invoices" }).screenshot({
      path: test.info().outputPath(`table-selected-${preset}-${forced}.png`),
    });
    await selection.click();
    await expect(row).not.toHaveAttribute("data-state");
    if (!forced)
      expect(
        await row.evaluate((el) => getComputedStyle(el).backgroundColor),
        "caller state removes selected paint",
      ).not.toBe(selectedFill);
  }
});

test("Table example source is highlighted and copied byte for byte", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("components/");
  await page.getByRole("button", { name: "Preview Table", exact: true }).click();
  const section = page.locator(".family-detail .code-block");
  expect(await section.locator("pre code").textContent()).toBe(example);
  expect(
    await section.locator("pre code .token").count(),
    "table source highlighting",
  ).toBeGreaterThan(10);
  await section.getByRole("button", { name: "Copy Table composition" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(example);
  await expect(section.getByRole("status")).toHaveText("Copied to clipboard");
});

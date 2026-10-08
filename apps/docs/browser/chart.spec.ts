import { readFileSync } from "node:fs";
import { expect, test, type Locator } from "@playwright/test";

const example = readFileSync(new URL("../src/examples/chart.tsx", import.meta.url), "utf8");

async function paint(host: Locator) {
  return host.evaluate((el) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d")!;
    const rgba = (color: string) => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      return [...ctx.getImageData(0, 0, 1, 1).data].map((n, i) => (i === 3 ? n / 255 : n));
    };
    const ground = (node: Element | null) => {
      const chain: Element[] = [];
      for (; node; node = node.parentElement) chain.unshift(node);
      let result = [255, 255, 255];
      for (const ancestor of chain) {
        const color = rgba(getComputedStyle(ancestor).backgroundColor);
        result = result.map((n, i) => color[i]! * color[3]! + n * (1 - color[3]!));
      }
      return result;
    };
    const luminance = (channels: number[]) => {
      const c = channels.map((n) =>
        n / 255 <= 0.04045 ? n / 255 / 12.92 : ((n / 255 + 0.055) / 1.055) ** 2.4,
      );
      return c[0]! * 0.2126 + c[1]! * 0.7152 + c[2]! * 0.0722;
    };
    const contrast = (a: number[], b: number[]) =>
      (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);
    const css = getComputedStyle(el),
      rect = el.getBoundingClientRect();
    const exterior = [
      [rect.left - 1, rect.top + rect.height / 2],
      [rect.right + 1, rect.top + rect.height / 2],
      [rect.left + rect.width / 2, rect.top - 1],
      [rect.left + rect.width / 2, rect.bottom + 1],
    ]
      .filter(([x, y]) => x! >= 0 && y! >= 0 && x! < innerWidth && y! < innerHeight)
      .map(([x, y]) => ground(document.elementFromPoint(x!, y!)));
    if (exterior.length === 0) exterior.push(ground(el.parentElement));
    const composite = (color: number[], fill: number[]) =>
      color.slice(0, 3).map((n, i) => n * color[3]! + fill[i]! * (1 - color[3]!));
    const outline = rgba(css.outlineColor),
      background = ground(el);
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
    return {
      opacity,
      visible,
      outlineStyle: css.outlineStyle,
      outlineWidth: parseFloat(css.outlineWidth),
      outlineOffset: parseFloat(css.outlineOffset),
      outlineAlpha: outline[3],
      focusContrast: Math.min(...exterior.map((fill) => contrast(composite(outline, fill), fill))),
      textContrast: contrast(composite(rgba(css.color), background), background),
      backgroundAlpha: rgba(css.backgroundColor)[3],
    };
  });
}

async function seriesGeometry(chart: Locator, kind: "bars" | "lines") {
  const marks = chart.locator(
    kind === "bars" ? ".recharts-bar-rectangle path" : ".recharts-line-curve",
  );
  await expect(marks).toHaveCount(kind === "bars" ? 8 : 2);
  for (const mark of await marks.all()) {
    const geometry = (await mark.boundingBox())!;
    expect(geometry.width, "rendered series width").toBeGreaterThan(0);
    expect(geometry.height, "rendered series height").toBeGreaterThan(0);
  }
  await expect(marks.nth(kind === "bars" ? 4 : 1)).toHaveAttribute("stroke-dasharray", "4 3");
  if (kind === "bars") {
    for (const [index, ratio] of [18 / 12, 24 / 20, 28 / 16, 32 / 24].entries()) {
      await expect
        .poll(
          () =>
            marks.evaluateAll(
              (nodes, month) =>
                nodes[month]!.getBoundingClientRect().height /
                nodes[month + 4]!.getBoundingClientRect().height,
              index,
            ),
          { message: `month ${index + 1} bar heights represent the declared two-series data` },
        )
        .toBeCloseTo(ratio, 1);
    }
  } else {
    const dots = chart.locator(".recharts-line-dots circle");
    await expect(dots).toHaveCount(8);
    const ys = await dots.evaluateAll((nodes) =>
      nodes.map((node) => Number(node.getAttribute("cy"))),
    );
    const unit = (ys[0]! - ys[3]!) / (32 - 18);
    expect(unit, "line values increase upward").toBeGreaterThan(0);
    for (const [index, delta] of [6, 4, 12, 8].entries())
      expect(
        (ys[index + 4]! - ys[index]!) / unit,
        `month ${index + 1} line positions represent both declared values`,
      ).toBeCloseTo(delta, 1);
  }
  return marks;
}

async function namedPoint(chart: Locator, live: Locator) {
  await chart.focus();
  await expect(chart).toBeFocused();
  // Focus can preserve a point already chosen by the pointer. Navigate to the
  // first point using the public keyboard contract before reading the sequence.
  for (let i = 0; i < 4; i++) await chart.press("ArrowLeft");
  await expect(live).toHaveText("Jan. North 18. South 12.");
  await chart.press("ArrowRight");
  await expect(live).toHaveText("Feb. North 24. South 20.");
  await chart.press("ArrowRight");
  await chart.press("ArrowRight");
  await expect(live).toHaveText("Apr. North 32. South 24.");
  await chart.press("ArrowLeft");
  await expect(live).toHaveText("Mar. North 28. South 16.");
}

test("Chart renders measured bar/line geometry, keyboard and pointer data plus a complete native alternative", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Preview Chart", exact: true }).click();
  const canvas = page.locator(".family-canvas");
  const table = canvas.getByRole("table", { name: "Monthly volume data" });
  await expect(table).toBeVisible();
  await expect(table.getByRole("columnheader")).toHaveText(["Month", "North", "South"]);
  await expect(table.getByRole("row")).toHaveText([
    "MonthNorthSouth",
    "Jan1812",
    "Feb2420",
    "Mar2816",
    "Apr3224",
  ]);
  await expect(table.getByRole("rowheader", { name: "Apr" })).toHaveAttribute("scope", "row");
  for (const kind of ["bars", "lines"] as const) {
    const chart = canvas.getByRole("application", { name: `Monthly volume ${kind}` });
    await chart.scrollIntoViewIfNeeded();
    await expect(chart).toBeVisible();
    const host = chart.locator("xpath=ancestor::*[@data-slot='chart-container']");
    await expect
      .poll(
        async () =>
          Math.abs((await chart.boundingBox())!.width - (await host.boundingBox())!.width),
        { message: `${kind} follows the measured available width` },
      )
      .toBeLessThanOrEqual(1);
    const box = (await chart.boundingBox())!;
    expect(box.width, `${kind} real width`).toBeGreaterThan(200);
    expect(box.height, `${kind} real height`).toBe(256);
    const labels = chart.locator(".recharts-xAxis-tick-labels text");
    await expect(labels).toHaveText(["Jan", "Feb", "Mar", "Apr"]);
    await expect
      .poll(
        () =>
          labels.evaluateAll((nodes) =>
            Math.max(
              0,
              ...nodes.flatMap((node) => {
                const text = node.getBoundingClientRect();
                const svg = node.closest("svg")!.getBoundingClientRect();
                return [svg.left - text.left, text.right - svg.right];
              }),
            ),
          ),
        { message: `${kind} all month labels fit the actual SVG without clipping` },
      )
      .toBeLessThanOrEqual(1);
    const marks = await seriesGeometry(chart, kind);
    const live = host.getByRole("status");
    // Move the pointer outside the resized graph before switching to keyboard
    // modality; an active hover can otherwise continue to display its point.
    await page.mouse.move(0, 0);
    await namedPoint(chart, live);
    await expect(live).toHaveAttribute("aria-live", "assertive");
    await expect(live).toHaveAttribute("aria-atomic", "true");
    await expect(
      host.getByRole("list", { name: "Volume series" }).getByRole("listitem"),
    ).toHaveText(["North (solid)", "South (dashed)"]);
    const wrapper = host.locator(".recharts-wrapper");
    const firstMark =
      kind === "bars" ? marks.first() : chart.locator(".recharts-line-dots circle").first();
    const point = (await firstMark.boundingBox())!;
    const wrapperBox = (await wrapper.boundingBox())!;
    await page.mouse.move(point.x + point.width / 2, wrapperBox.y + wrapperBox.height / 2);
    await expect(live).toHaveText("Jan. North 18. South 12.");
    await host.screenshot({
      path: test.info().outputPath(`chart-${kind}-complete.png`),
      style: ".theme-studio { position: static !important; }",
    });
  }
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
    "chart does not widen the page",
  ).toBeLessThanOrEqual(page.viewportSize()!.width);
  await canvas.screenshot({
    path: test.info().outputPath("chart-complete-example.png"),
    // Only capture disables the unrelated sticky studio that would cover a
    // tall element screenshot; all interaction/geometry assertions use real CSS.
    style: ".theme-studio { position: static !important; }",
  });
});

test("Chart SVG focus, live tooltip and labeled legend paint in isolated dark/light/forced colors", async ({
  page,
}) => {
  for (const kind of ["bars", "lines"] as const) {
    for (const [preset, forced] of [
      ["arcade", false],
      ["light", false],
      ["light", true],
    ] as const) {
      await page.emulateMedia({ forcedColors: forced ? "active" : "none" });
      await page.goto(
        `storybook/iframe.html?id=parts-chart--${kind === "bars" ? "default" : "line"}&viewMode=story&embed=true&globals=preset:${preset}`,
      );
      const chart = page.getByRole("application", { name: `Monthly volume ${kind}` });
      await expect(chart).toBeVisible();
      if (preset === "light")
        await expect
          .poll(() =>
            page
              .locator("link#marquee-light-preset")
              .evaluate((el) => Boolean((el as HTMLLinkElement).sheet)),
          )
          .toBe(true);
      await page.evaluate(async () => {
        await document.fonts.ready;
      });
      await page.mouse.move(0, 0);
      await page.keyboard.press("Tab");
      await chart.focus();
      await expect(chart).toBeFocused();
      const focus = await paint(chart);
      expect(focus.visible, "actual focused SVG is visible").toBe(true);
      expect(focus.opacity, "actual focused SVG is opaque").toBe(1);
      expect(focus.outlineStyle, "actual focused SVG ring").toBe("solid");
      expect(focus.outlineWidth, "actual focused SVG ring width").toBeGreaterThanOrEqual(2);
      expect(focus.outlineOffset, "inset ring avoids SVG clipping").toBeLessThanOrEqual(0);
      expect(focus.outlineAlpha, "actual SVG outline visible alpha").toBeGreaterThan(0);
      expect(
        focus.focusContrast,
        "actual SVG ring contrasts with exterior paint",
      ).toBeGreaterThanOrEqual(3);
      await expect(chart.locator(".recharts-xAxis-tick-labels text")).toHaveText([
        "Jan",
        "Feb",
        "Mar",
        "Apr",
      ]);
      const labelOverlap = await chart.evaluate((svg) => {
        const bounds = svg.getBoundingClientRect();
        const inset = Math.max(0, -parseFloat(getComputedStyle(svg).outlineOffset));
        return Math.max(
          0,
          ...[...svg.querySelectorAll(".recharts-xAxis-tick-labels text")].flatMap((label) => {
            const ink = label.getBoundingClientRect();
            return [bounds.left + inset - ink.left, ink.right - (bounds.right - inset)];
          }),
        );
      });
      expect(
        labelOverlap,
        `${kind} month labels remain clear of the actual inward SVG focus ring`,
      ).toBeLessThanOrEqual(0.1);
      const marks = await seriesGeometry(chart, kind);
      const live = page.getByRole("status");
      await chart.press("ArrowRight");
      await expect(live).toHaveText("Feb. North 24. South 20.");
      const tooltip = await paint(live);
      expect(tooltip.visible).toBe(true);
      expect(tooltip.opacity).toBe(1);
      expect(tooltip.backgroundAlpha, "tooltip has an opaque ground").toBe(1);
      expect(
        tooltip.textContrast,
        "live data contrasts with tooltip ground",
      ).toBeGreaterThanOrEqual(4.5);
      const legend = page.getByRole("list", { name: "Volume series" });
      for (const item of await legend.getByRole("listitem").all())
        expect((await paint(item)).textContrast, "legend remains readable").toBeGreaterThanOrEqual(
          4.5,
        );
      if (!forced) {
        const colors = await marks.evaluateAll(
          (nodes, type) => [
            getComputedStyle(nodes[0]!)[type === "bars" ? "fill" : "stroke"],
            getComputedStyle(nodes[type === "bars" ? 4 : 1]!)[type === "bars" ? "fill" : "stroke"],
          ],
          kind,
        );
        expect(colors[0], "two role-token series paint distinctly").not.toBe(colors[1]);
      }
      await page.locator("#storybook-root").screenshot({
        path: test.info().outputPath(`chart-paint-${kind}-${preset}-${forced}.png`),
      });
    }
  }
});

test("Chart explicit slots and opt-in host focus work without docs CSS", async ({ page }) => {
  await page.goto("storybook/iframe.html?id=parts-chart--composed&viewMode=story&embed=true");
  const host = page.getByLabel("Composed chart");
  expect(await host.evaluate((el) => el.tagName)).toBe("SECTION");
  const list = host.getByRole("list", { name: "Caller series" });
  expect(await list.evaluate((el) => el.tagName)).toBe("UL");
  expect(await list.getByRole("listitem").evaluate((el) => el.tagName)).toBe("LI");
  const action = list.getByRole("button", { name: "Toggle North" });
  await action.click();
  await expect(page.getByLabel("Caller visibility")).toHaveText("North hidden");
  await page.goto(
    "storybook/iframe.html?id=parts-chart--focusable-parts&viewMode=story&embed=true",
  );
  await page.keyboard.press("Tab");
  for (const slot of [
    "chart-container",
    "chart-tooltip-content",
    "chart-legend-content",
    "chart-legend-item",
  ]) {
    const part = page.locator(`[data-slot='${slot}']`);
    await part.focus();
    await expect(part).toBeFocused();
    const focused = await paint(part);
    expect(focused.outlineStyle, `${slot} focus style`).toBe("solid");
    expect(focused.outlineWidth, `${slot} focus width`).toBeGreaterThanOrEqual(2);
    expect(focused.focusContrast, `${slot} exterior contrast`).toBeGreaterThanOrEqual(3);
  }
});

test("Chart keyboard tooltip stays inside existing dialog and dismissal restores trigger focus", async ({
  page,
}) => {
  await page.goto("storybook/iframe.html?id=parts-chart--in-dialog&viewMode=story&embed=true");
  const trigger = page.getByRole("button", { name: "Inspect monthly chart" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Monthly chart details" });
  const chart = dialog.getByRole("application", { name: "Monthly volume bars" });
  const close = dialog.getByRole("button", { name: "Done inspecting" });
  await expect(close).toBeFocused();
  await close.press("Shift+Tab");
  await expect(chart).toBeFocused();
  await chart.press("ArrowRight");
  await expect(dialog.getByRole("status")).toHaveText("Feb. North 24. South 20.");
  await expect(dialog.getByRole("table", { name: "Monthly volume data" })).toBeVisible();
  await expect(dialog).toBeVisible();
  await chart.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("Chart example source is highlighted and copied byte for byte", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("./");
  await page.getByRole("button", { name: "Preview Chart", exact: true }).click();
  const block = page.locator(".family-detail .code-block");
  expect(await block.locator("pre code").textContent()).toBe(example);
  expect(
    await block.locator("pre code .token").count(),
    "chart source highlighting",
  ).toBeGreaterThan(10);
  await block.getByRole("button", { name: "Copy Chart composition" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(example);
  await expect(block.getByRole("status")).toHaveText("Copied to clipboard");
});

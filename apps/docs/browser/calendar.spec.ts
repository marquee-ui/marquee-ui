import { readFileSync } from "node:fs";
import { expect, test, type Locator } from "@playwright/test";

const example = readFileSync(new URL("../src/examples/calendar.tsx", import.meta.url), "utf8");
const day = (root: Locator, number: number) =>
  root.getByRole("button", { name: new RegExp(`October ${number}(?:st|nd|rd|th), 2026`) });

async function target(control: Locator) {
  await expect(control).toBeVisible();
  await control.scrollIntoViewIfNeeded();
  const box = (await control.boundingBox())!;
  expect(box.width, "calendar real target width").toBeGreaterThanOrEqual(44);
  expect(box.height, "calendar real target height").toBeGreaterThanOrEqual(44);
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
      { message: "calendar receives hits across its real 44px target" },
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
      return [...ctx.getImageData(0, 0, 1, 1).data].map((n, index) => (index === 3 ? n / 255 : n));
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
    const css = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const offset = parseFloat(css.outlineOffset) + parseFloat(css.outlineWidth) / 2;
    const exterior = [
      [rect.left - offset, rect.top + rect.height / 2],
      [rect.right + offset, rect.top + rect.height / 2],
      [rect.left + rect.width / 2, rect.top - offset],
      [rect.left + rect.width / 2, rect.bottom + offset],
    ].map(([x, y]) => ground(document.elementFromPoint(x!, y!)));
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
  await target(control);
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
}

async function rangePaint(root: Locator) {
  const geometry = await root.evaluate((el) => {
    const cells = [...el.querySelectorAll('td[aria-selected="true"]')];
    return cells.map((cell) => {
      const button = cell.querySelector("button")!;
      const cellBox = cell.getBoundingClientRect(),
        buttonBox = button.getBoundingClientRect();
      return {
        date: cell.getAttribute("data-day"),
        selected: button.getAttribute("data-selected"),
        start: button.hasAttribute("data-range-start"),
        end: button.hasAttribute("data-range-end"),
        middle: button.hasAttribute("data-range-middle"),
        cell: {
          width: cellBox.width,
          height: cellBox.height,
          left: cellBox.left,
          right: cellBox.right,
          top: cellBox.top,
        },
        button: {
          width: buttonBox.width,
          height: buttonBox.height,
          left: buttonBox.left,
          right: buttonBox.right,
          top: buttonBox.top,
        },
        fill: getComputedStyle(cell).backgroundColor,
      };
    });
  });
  expect(
    geometry.map((cell) => cell.date),
    "range paint is the exact selected inclusive interval",
  ).toEqual(["2026-10-10", "2026-10-11", "2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15"]);
  expect(geometry[0]!.start).toBe(true);
  expect(geometry.at(-1)!.end).toBe(true);
  expect(geometry.slice(1, -1).every((cell) => cell.middle)).toBe(true);
  for (const cell of geometry) {
    expect(cell.selected, "range drawing follows accessible selection").toBe("true");
    expect(cell.button.width, "range paint fills its full day width").toBe(cell.cell.width);
    expect(cell.button.height, "range paint fills its full day height").toBe(cell.cell.height);
    expect(cell.button.left, "range paint begins at the cell edge").toBe(cell.cell.left);
    expect(cell.button.right, "range paint ends at the cell edge").toBe(cell.cell.right);
    expect(cell.fill, "range cell carries contiguous paint").not.toBe("rgba(0, 0, 0, 0)");
  }
  for (let i = 1; i < geometry.length; i++) {
    if (geometry[i]!.cell.top === geometry[i - 1]!.cell.top)
      expect(
        Math.abs(geometry[i]!.cell.left - geometry[i - 1]!.cell.right),
        "same-row range has no paint gaps",
      ).toBeLessThanOrEqual(0.5);
  }
}

async function containedCalendar(root: Locator) {
  const geometry = await root.evaluate((el) => {
    const box = (node: Element) => {
      const rect = node.getBoundingClientRect();
      const css = getComputedStyle(node);
      const leftInset = parseFloat(css.borderLeftWidth) + parseFloat(css.paddingLeft);
      const rightInset = parseFloat(css.borderRightWidth) + parseFloat(css.paddingRight);
      const topInset = parseFloat(css.borderTopWidth) + parseFloat(css.paddingTop);
      const bottomInset = parseFloat(css.borderBottomWidth) + parseFloat(css.paddingBottom);
      return {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
        width: rect.width,
        content: {
          left: rect.left + leftInset,
          right: rect.right - rightInset,
          top: rect.top + topInset,
          bottom: rect.bottom - bottomInset,
        },
        inlineInsets: leftInset + rightInset,
      };
    };
    return {
      root: box(el),
      grids: [...el.querySelectorAll('[role="grid"]')].map(box),
      days: [...el.querySelectorAll('td[role="gridcell"], [data-slot="calendar-day-button"]')].map(
        box,
      ),
    };
  });
  const required =
    Math.max(...geometry.grids.map((grid) => grid.width)) + geometry.root.inlineInsets;
  expect(
    geometry.root.width,
    "Calendar frame honors its actual grid plus inline padding and border",
  ).toBeGreaterThanOrEqual(required);
  for (const child of [...geometry.grids, ...geometry.days]) {
    expect(
      child.left,
      "Calendar grid/day starts inside its painted content",
    ).toBeGreaterThanOrEqual(geometry.root.content.left - 0.5);
    expect(child.right, "Calendar grid/day ends inside its painted content").toBeLessThanOrEqual(
      geometry.root.content.right + 0.5,
    );
    expect(
      child.top,
      "Calendar grid/day top stays inside its painted content",
    ).toBeGreaterThanOrEqual(geometry.root.content.top - 0.5);
    expect(
      child.bottom,
      "Calendar grid/day bottom stays inside its painted content",
    ).toBeLessThanOrEqual(geometry.root.content.bottom + 0.5);
  }
  return { root: geometry.root, required };
}

test("Calendar docs preserve controlled day, keyboard movement, multiple dates, range bounds and reset", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Preview Calendar", exact: true }).click();
  const canvas = page.locator(".family-canvas");
  const single = canvas.getByRole("region", { name: "Single day" });
  await target(day(single, 12));
  await day(single, 12).focus();
  await day(single, 12).press("ArrowRight");
  await expect(day(single, 13)).toBeFocused();
  await day(single, 13).press("Enter");
  await expect(single.getByText("Selected day: 13")).toBeVisible();
  await single.getByRole("button", { name: "Go to the Next Month" }).click();
  await expect(single.getByRole("grid", { name: "November 2026" })).toBeVisible();
  const multiple = canvas.getByRole("region", { name: "Multiple days" });
  await day(multiple, 15).click();
  await expect(multiple.getByText("Selected days: 12, 15")).toBeVisible();
  await day(multiple, 12).click();
  await expect(multiple.getByText("Selected days: 15")).toBeVisible();
  const range = canvas.getByRole("region", { name: "Date range" });
  await rangePaint(range);
  await expect(day(range, 18)).toBeDisabled();
  await day(range, 16).click();
  await day(range, 20).click();
  await expect(range.getByText("Choose an end day")).toBeVisible();
  await expect(day(range, 20).locator("..")).toHaveAttribute("aria-selected", "true");
  await day(range, 23).click();
  await expect(range.getByText("Selected range: 20–23")).toBeVisible();
  const reset = canvas.getByRole("button", { name: "Reset dates" });
  await target(reset);
  await reset.click();
  await expect(single.getByRole("grid", { name: "October 2026" })).toBeVisible();
  await expect(single.getByText("Choose a day")).toBeVisible();
  await expect(multiple.getByText("Selected days: none")).toBeVisible();
  await expect(range.getByText("Choose an end day")).toBeVisible();
  await expect(canvas.getByRole("gridcell", { selected: true })).toHaveCount(0);
  await canvas.screenshot({ path: test.info().outputPath("calendar-complete-canvas.png") });
});

test("Calendar grids fit every viewport and every enabled day/navigation control is a real 44px target", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Preview Calendar", exact: true }).click();
  test.setTimeout(90_000);
  const canvas = page.locator(".family-canvas");
  const roots = canvas.locator('[data-slot="calendar"]');
  await expect(roots).toHaveCount(3);
  const canvasBounds = (await canvas.boundingBox())!;
  const previewContent = await canvas.locator("..").evaluate((el) => {
    const bounds = el.getBoundingClientRect();
    const css = getComputedStyle(el);
    return {
      left: bounds.left + parseFloat(css.borderLeftWidth) + parseFloat(css.paddingLeft),
      right: bounds.right - parseFloat(css.borderRightWidth) - parseFloat(css.paddingRight),
    };
  });
  for (const root of await roots.all()) {
    const geometry = await containedCalendar(root);
    expect(
      canvasBounds.width,
      "Calendar preview grants the real required inline size",
    ).toBeGreaterThanOrEqual(geometry.required);
    expect(
      geometry.root.left,
      "Calendar frame begins inside its actual canvas",
    ).toBeGreaterThanOrEqual(canvasBounds.x - 0.5);
    expect(geometry.root.right, "Calendar frame ends inside its actual canvas").toBeLessThanOrEqual(
      canvasBounds.x + canvasBounds.width + 0.5,
    );
    expect(
      geometry.root.left,
      "Calendar frame begins inside preview painted content",
    ).toBeGreaterThanOrEqual(previewContent.left - 0.5);
    expect(
      geometry.root.right,
      "Calendar frame ends inside preview painted content",
    ).toBeLessThanOrEqual(previewContent.right + 0.5);
    const bounds = (await root.boundingBox())!;
    expect(bounds.x, "calendar left stays in viewport").toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width, "calendar right stays in viewport").toBeLessThanOrEqual(
      page.viewportSize()!.width,
    );
    for (const button of await root.locator("button:not(:disabled)").all()) await target(button);
  }
  const saturday = day(canvas.getByRole("region", { name: "Single day" }), 31);
  await target(saturday);
  await saturday.click();
  await expect(saturday.locator("..")).toHaveAttribute("aria-selected", "true");
  await expect(canvas.getByText("Selected day: 31")).toBeVisible();
  const range = canvas.getByRole("region", { name: "Date range" });
  const grids = await range.getByRole("grid").all();
  expect(grids).toHaveLength(2);
  const first = (await grids[0]!.boundingBox())!,
    second = (await grids[1]!.boundingBox())!;
  expect(first.width, "seven-day grid retains seven real targets").toBeGreaterThanOrEqual(7 * 44);
  if (page.viewportSize()!.width === 390) {
    expect(second.y, "second month stacks on small viewport").toBeGreaterThan(
      first.y + first.height,
    );
    expect(
      Math.abs(first.x - second.x),
      "stacked month grids share their left edge",
    ).toBeLessThanOrEqual(0.5);
  }
  await range.screenshot({ path: test.info().outputPath("calendar-two-month-grid.png") });
  await canvas.screenshot({
    path: test.info().outputPath("calendar-contained-complete-canvas.png"),
  });
});

test("Calendar preserves its intrinsic frame when a caller grants less than the seven-day minimum", async ({
  page,
}) => {
  await page.goto("storybook/iframe.html?id=parts-calendar--default&viewMode=story&embed=true");
  const root = page.locator('[data-slot="calendar"]');
  await expect(root).toBeVisible();
  await root.locator("..").evaluate((el) => {
    (el as HTMLElement).style.width = "306px";
  });
  const geometry = await containedCalendar(root);
  expect(
    geometry.required,
    "default seven-day frame needs 308px grid plus 20px padding/border",
  ).toBe(328);
  expect(
    (await root.locator("..").boundingBox())!.width,
    "deliberately insufficient caller inline size",
  ).toBe(306);
  await target(day(root, 31));
  await day(root, 31).click();
  await expect(day(root, 31).locator("..")).toHaveAttribute("aria-selected", "true");
});

test("Calendar selected text and focus paint outside docs CSS in dark, light, accent and forced colors", async ({
  page,
}) => {
  for (const [mode, accent, forced] of [
    ["Dark", "Automatic", false],
    ["Light", "Automatic", false],
    ["Light", "Violet", false],
    ["Light", "Violet", true],
  ] as const) {
    await page.emulateMedia({ forcedColors: forced ? "active" : "none" });
    await page.goto("./");
    await page.getByRole("button", { name: mode, exact: true }).click();
    if (accent === "Violet") {
      await page.getByRole("button", { name: /^Customize theme:/ }).click();
      await page.getByRole("radio", { name: /^Violet\b/ }).click();
      await page.keyboard.press("Escape");
    }
    const roles = await page
      .locator("html")
      .evaluate((el) =>
        [...(el as HTMLElement).style]
          .filter((name) => name.startsWith("--"))
          .map((name) => [name, (el as HTMLElement).style.getPropertyValue(name)]),
      );
    await page.goto(
      `storybook/iframe.html?id=parts-calendar--range&viewMode=story&embed=true&globals=preset:${mode === "Light" ? "light" : "arcade"}`,
    );
    await page.locator("html").evaluate((el, roles) => {
      for (const [name, value] of roles) (el as HTMLElement).style.setProperty(name!, value!);
    }, roles);
    const root = page.locator('[data-slot="calendar"]');
    await expect(root).toBeVisible();
    // A story play can have changed the range; create this exact interval through real clicks.
    await day(root, 10).click();
    await day(root, 15).click();
    await rangePaint(root);
    await page.keyboard.press("Tab");
    for (const number of [10, 12, 15]) {
      const selected = day(root, number);
      await focusPaint(selected, `${mode}/${accent}/${forced} day ${number}`);
      const values = await paint(selected);
      expect(
        values.textContrast,
        "selected calendar text contrasts with its actual fill",
      ).toBeGreaterThanOrEqual(4.5);
      expect(values.backgroundAlpha, "selected day paints an opaque fill").toBe(1);
      if (forced) await expect(selected).toHaveCSS("text-decoration-line", "underline");
    }
    await focusPaint(
      root.getByRole("button", { name: "Go to the Next Month" }),
      `${mode}/${accent}/${forced} navigation`,
    );
    await root.screenshot({
      path: test.info().outputPath(`calendar-isolated-${mode}-${accent}-${forced}.png`),
    });
  }
});

test("Calendar disabled/hidden matchers and custom slot keyboard navigation work outside docs CSS", async ({
  page,
}) => {
  await page.goto("storybook/iframe.html?id=parts-calendar--disabled&viewMode=story&embed=true");
  const root = page.locator('[data-slot="calendar"]');
  await expect(day(root, 14)).toBeDisabled();
  await expect(day(root, 15)).toHaveCount(0);
  await expect(root.getByRole("button", { name: "Go to the Previous Month" })).toBeDisabled();
  await expect(root.getByRole("button", { name: "Go to the Next Month" })).toBeDisabled();
  await day(root, 16).focus();
  await day(root, 16).press("ArrowRight");
  await expect(day(root, 19)).toBeFocused();
  await day(root, 19).press("Space");
  await expect(day(root, 19).locator("..")).toHaveAttribute("aria-selected", "true");
  await page.goto(
    "storybook/iframe.html?id=parts-calendar--custom-slots&viewMode=story&embed=true",
  );
  await expect(page.locator('[data-custom-root="true"]')).toBeVisible();
  // CustomSlots' play may have navigated once. Navigate back only if it did.
  if (await root.getByRole("grid", { name: "November 2026" }).count())
    await root.getByRole("button", { name: "Go to the Previous Month" }).click();
  await day(root, 12).focus();
  await day(root, 12).press("ArrowRight");
  await expect(day(root, 13)).toBeFocused();
  await day(root, 13).press("Enter");
  await expect(day(root, 13).locator("..")).toHaveAttribute("aria-selected", "true");
  await root.getByRole("button", { name: "Next schedule month" }).click();
  await expect(root.getByRole("grid", { name: "November 2026" })).toBeVisible();
});

test("Calendar example source is highlighted and copied byte for byte", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("./");
  await page.getByRole("button", { name: "Preview Calendar", exact: true }).click();
  const section = page.locator(".family-detail .code-block");
  expect(await section.locator("pre code").textContent()).toBe(example);
  expect(
    await section.locator("pre code .token").count(),
    "Calendar source is highlighted",
  ).toBeGreaterThan(10);
  await section.getByRole("button", { name: "Copy Calendar composition" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(example);
  await expect(section.getByRole("status")).toHaveText("Copied to clipboard");
});

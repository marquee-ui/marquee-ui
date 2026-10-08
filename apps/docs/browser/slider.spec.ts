import { readFileSync } from "node:fs";
import { expect, test, type Locator } from "@playwright/test";

const example = readFileSync(new URL("../src/examples/slider.tsx", import.meta.url), "utf8");

async function target(thumb: Locator) {
  await expect(thumb).toBeVisible();
  await thumb.scrollIntoViewIfNeeded();
  const bounds = await thumb.boundingBox();
  expect(bounds!.width, "real slider thumb tap width").toBeGreaterThanOrEqual(44);
  expect(bounds!.height, "real slider thumb tap height").toBeGreaterThanOrEqual(44);
  await expect
    .poll(
      () =>
        thumb.evaluate((el) => {
          const box = el.getBoundingClientRect();
          return [
            [box.left + 3, box.top + 3],
            [box.right - 3, box.bottom - 3],
            [box.left + box.width / 2, box.top + box.height / 2],
          ].every(([x, y]) => {
            const hit = document.elementFromPoint(x!, y!);
            return el === hit || el.contains(hit);
          });
        }),
      { message: "thumb accepts the pointer beyond its visible marker" },
    )
    .toBe(true);
}

async function paintContrast(thumb: Locator, property: "outlineColor" | "borderColor") {
  return thumb.evaluate((el, property) => {
    const luminance = (color: string) => {
      const values = color
        .match(/[\d.]+/g)!
        .slice(0, 3)
        .map((value) => {
          const c = Number(value) / 255;
          return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        });
      return values[0]! * 0.2126 + values[1]! * 0.7152 + values[2]! * 0.0722;
    };
    const style = getComputedStyle(el, property === "borderColor" ? "::after" : null);
    let ground: Element | null = el;
    while (ground && getComputedStyle(ground).backgroundColor === "rgba(0, 0, 0, 0)")
      ground = ground.parentElement;
    const ink = luminance(style[property]);
    const fill = luminance(getComputedStyle(ground ?? document.body).backgroundColor);
    return (Math.max(ink, fill) + 0.05) / (Math.min(ink, fill) + 0.05);
  }, property);
}

test("Slider keys step, constrain independently named range values, commit, submit and reset", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("./");
  await page.getByRole("button", { name: "Preview Slider", exact: true }).click();
  const canvas = page.locator(".family-canvas");
  const volume = canvas.getByRole("slider", { name: "Volume", exact: true });
  await target(volume);
  await expect(volume).toHaveAttribute("aria-valuetext", "40 percent");
  await volume.focus();
  await expect(volume).toBeFocused();
  for (const [key, value] of [
    ["ArrowRight", "45"],
    ["PageUp", "95"],
    ["Shift+ArrowLeft", "45"],
    ["End", "100"],
    ["Home", "0"],
    ["ArrowUp", "5"],
    ["PageDown", "0"],
  ] as const) {
    await page.keyboard.press(key);
    await expect(volume, `${key} updates the visible value`).toHaveAttribute(
      "aria-valuenow",
      value,
    );
    await expect(canvas.getByRole("status").first()).toHaveText(`Committed volume: ${value}%`);
  }
  await volume.press("ArrowRight");
  const low = canvas.getByRole("slider", { name: "Start time" });
  const high = canvas.getByRole("slider", { name: "End time" });
  await target(low);
  await target(high);
  await low.focus();
  await page.keyboard.press("Shift+ArrowRight");
  await expect(low).toHaveAttribute("aria-valuenow", "70");
  await page.keyboard.press("ArrowRight");
  await expect(low).toHaveAttribute("aria-valuenow", "70");
  await expect(high).toHaveAttribute("aria-valuenow", "80");
  await expect(low).toHaveAttribute("aria-valuetext", "70 minutes");
  await canvas.getByRole("button", { name: "Save playback" }).click();
  await expect(canvas.getByRole("status").last()).toHaveText("Saved volume: 5; range: 70–80.");
  await canvas.getByRole("button", { name: "Reset playback" }).click();
  await expect(volume).toHaveAttribute("aria-valuenow", "40");
  await expect(low).toHaveAttribute("aria-valuenow", "20");
  await expect(high).toHaveAttribute("aria-valuenow", "80");
  await canvas.getByRole("button", { name: "Save playback" }).click();
  await expect(canvas.getByRole("status").last()).toHaveText("Saved volume: 40; range: 20–80.");
  expect(
    await canvas
      .getByRole("form", { name: "Playback settings" })
      .evaluate((el) => new FormData(el as HTMLFormElement).has("unavailable")),
    "native disabled fieldset excludes Slider transport input",
  ).toBe(false);
  const transport = canvas.locator('input[name="unavailable"]');
  expect(
    await transport.evaluate((el) => {
      const fieldset = el.closest("fieldset")!;
      fieldset.disabled = false;
      const value = new FormData(el.closest("form")!).get("unavailable");
      fieldset.disabled = true;
      return value;
    }),
    "disabled Slider alone still serializes its native input",
  ).toBe("40");
  expect(errors).toEqual([]);
});

test("Slider pointer drag updates before committing and the narrow track accepts a click", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Preview Slider", exact: true }).click();
  const canvas = page.locator(".family-canvas");
  const thumb = canvas.getByRole("slider", { name: "Volume", exact: true });
  await target(thumb);
  const root = thumb.locator('xpath=ancestor::*[@data-slot="slider"]');
  const track = root.locator('[data-slot="slider-track"]');
  const trackBox = (await track.boundingBox())!;
  expect(trackBox.height, "visible track stays narrow").toBeLessThan(12);
  const box = (await thumb.boundingBox())!;
  await page.mouse.move(box.x + 3, box.y + 3);
  await page.mouse.down();
  await page.mouse.move(trackBox.x + trackBox.width * 0.75, trackBox.y + trackBox.height / 2, {
    steps: 8,
  });
  await expect(thumb).toHaveAttribute("aria-valuenow", "75");
  await expect(canvas.getByRole("status").first()).toHaveText("Committed volume: 40%");
  await page.mouse.up();
  await expect(canvas.getByRole("status").first()).toHaveText("Committed volume: 75%");
  await track.click({ position: { x: trackBox.width * 0.25, y: trackBox.height / 2 } });
  await expect(thumb).toHaveAttribute("aria-valuenow", "25");
  await expect(canvas.getByRole("status").first()).toHaveText("Committed volume: 25%");
});

test("orientation, direction, inverted and disabled states move actual visible paint", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Preview Slider", exact: true }).click();
  const canvas = page.locator(".family-canvas");
  for (const [name, key, expected, axis, sign] of [
    ["Vertical level", "ArrowUp", "45", "y", -1],
    ["Right-to-left balance", "ArrowRight", "35", "x", 1],
    ["Inverted balance", "ArrowRight", "35", "x", 1],
  ] as const) {
    const thumb = canvas.getByRole("slider", { name });
    await target(thumb);
    await thumb.focus();
    await expect(thumb).toBeFocused();
    const root = thumb.locator('xpath=ancestor::*[@data-slot="slider"]');
    const before = (await thumb.boundingBox())!;
    const oldPaint = await root.screenshot();
    await page.keyboard.press(key);
    await expect(thumb).toHaveAttribute("aria-valuenow", expected);
    const after = (await thumb.boundingBox())!;
    expect(
      (after[axis] - before[axis]) * sign,
      `${name} marker moves in its physical direction`,
    ).toBeGreaterThan(1);
    expect((await root.screenshot()).equals(oldPaint), `${name} changed visible paint`).toBe(false);
  }
  const disabled = canvas.getByRole("slider", { name: "Unavailable balance" });
  await expect(disabled).toHaveAttribute("data-disabled");
  await expect(disabled).not.toHaveAttribute("tabindex");
  await expect(disabled).toBeDisabled();
  await disabled.scrollIntoViewIfNeeded();
  const disabledBox = (await disabled.boundingBox())!;
  // A real pointer can land on a disabled control; Locator.click deliberately
  // waits for it to become enabled, which cannot exercise this state.
  await page.mouse.click(
    disabledBox.x + disabledBox.width / 2,
    disabledBox.y + disabledBox.height / 2,
  );
  await expect(disabled).toHaveAttribute("aria-valuenow", "40");
  const vertical = canvas.getByRole("slider", { name: "Vertical level" });
  await expect(vertical).toHaveAttribute("aria-orientation", "vertical");
  await target(vertical);
  const track = vertical
    .locator('xpath=ancestor::*[@data-slot="slider"]')
    .locator('[data-slot="slider-track"]');
  const box = (await track.boundingBox())!;
  await track.click({ position: { x: box.width / 2, y: box.height * 0.25 } });
  await expect(vertical).toHaveAttribute("aria-valuenow", "75");
});

test("Slider focus and markers paint without docs CSS in dark, light, accent and forced colors", async ({
  page,
}) => {
  for (const [mode, accent] of [
    ["Dark", "Automatic"],
    ["Light", "Automatic"],
    ["Light", "Violet"],
  ] as const) {
    await page.goto("./");
    await page.getByRole("button", { name: mode, exact: true }).click();
    if (accent === "Violet") {
      await page.getByRole("button", { name: /^Customize theme:/ }).click();
      await page.getByRole("radio", { name: /^Violet\b/ }).click();
      await page.keyboard.press("Escape");
    }
    // Move the demo's measured role assignments into the isolated component
    // preview. No docs stylesheet can supply the thumb's missing focus rules.
    const roles = await page
      .locator("html")
      .evaluate((el) =>
        [...(el as HTMLElement).style]
          .filter((name) => name.startsWith("--"))
          .map((name) => [name, (el as HTMLElement).style.getPropertyValue(name)]),
      );
    await page.goto(
      `storybook/iframe.html?id=parts-slider--default&viewMode=story&embed=true&globals=preset:${mode === "Light" ? "light" : "arcade"}`,
    );
    const thumb = page.getByRole("slider", { name: "Volume", exact: true });
    await expect(thumb).toHaveAttribute("aria-valuenow", "40");
    await page.locator("html").evaluate((el, roles) => {
      for (const [name, value] of roles) (el as HTMLElement).style.setProperty(name!, value!);
    }, roles);
    await target(thumb);
    await page.keyboard.press("Tab");
    await thumb.focus();
    await expect(thumb).toBeFocused();
    await thumb.evaluate(async (el) => {
      await Promise.all(el.getAnimations().map((animation) => animation.finished));
    });
    await expect(thumb, `${mode}/${accent} isolated focus style`).toHaveCSS(
      "outline-style",
      "solid",
    );
    expect(
      await thumb.evaluate((el) => parseFloat(getComputedStyle(el).outlineWidth)),
      `${mode}/${accent} isolated focus width`,
    ).toBeGreaterThanOrEqual(2);
    expect(
      await paintContrast(thumb, "outlineColor"),
      `${mode}/${accent} isolated focus contrast`,
    ).toBeGreaterThanOrEqual(3);
    expect(
      await paintContrast(thumb, "borderColor"),
      `${mode}/${accent} visible marker contrast`,
    ).toBeGreaterThanOrEqual(3);
    const marker = await thumb.evaluate((el) => {
      const css = getComputedStyle(el, "::after");
      return {
        width: parseFloat(css.width),
        height: parseFloat(css.height),
        content: css.content,
        style: css.borderStyle,
      };
    });
    expect(marker).toEqual({ width: 20, height: 20, content: '""', style: "solid" });
    const range = thumb
      .locator('xpath=ancestor::*[@data-slot="slider"]')
      .locator('[data-slot="slider-range"]');
    expect(
      await range.evaluate((el) => {
        const luminance = (color: string) => {
          const channels = color
            .match(/[\d.]+/g)!
            .slice(0, 3)
            .map((value) => {
              const c = Number(value) / 255;
              return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
            });
          return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
        };
        const ink = luminance(getComputedStyle(el).backgroundColor);
        const ground = luminance(getComputedStyle(el.parentElement!).backgroundColor);
        return (Math.max(ink, ground) + 0.05) / (Math.min(ink, ground) + 0.05);
      }),
      `${mode}/${accent} selected range contrast against track`,
    ).toBeGreaterThanOrEqual(3);
    expect(
      (await range.boundingBox())!.width,
      "selected range actually paints a nonempty segment",
    ).toBeGreaterThan(10);
  }
  await page.emulateMedia({ forcedColors: "active" });
  const thumb = page.getByRole("slider", { name: "Volume", exact: true });
  await thumb.focus();
  await expect(thumb).toHaveCSS("outline-style", "solid");
  expect(
    await paintContrast(thumb, "outlineColor"),
    "forced-colors focus contrast",
  ).toBeGreaterThanOrEqual(3);
  const root = thumb.locator('xpath=ancestor::*[@data-slot="slider"]');
  const before = await root.screenshot();
  await thumb.press("ArrowRight");
  await expect(thumb).toHaveAttribute("aria-valuenow", "45");
  expect(
    (await root.screenshot()).equals(before),
    "forced-colors arrow changes visible marker paint",
  ).toBe(false);
  await expect(root.locator('[data-slot="slider-range"]')).toHaveCSS("border-top-style", "solid");
  expect(
    await thumb.evaluate((el) => parseFloat(getComputedStyle(el, "::after").borderTopWidth)),
    "forced-colors marker border width",
  ).toBe(2);
});

test("Slider example is highlighted and copied exactly; uncontrolled native form reset works", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("./");
  await page.getByRole("button", { name: "Preview Slider", exact: true }).click();
  const section = page.locator(".family-detail .code-block");
  expect(await section.locator("pre code").textContent()).toBe(example);
  expect(
    await section.locator("pre code .token").count(),
    "Slider source is highlighted",
  ).toBeGreaterThan(10);
  await section.getByRole("button", { name: "Copy Slider composition" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(example);
  await expect(section.getByRole("status")).toHaveText("Copied to clipboard");
  await page.goto("storybook/iframe.html?id=parts-slider--in-a-form&viewMode=story&embed=true");
  const thumb = page.getByRole("slider", { name: "Volume", exact: true });
  await expect(thumb).toHaveAttribute("aria-valuenow", "40");
  await thumb.focus();
  await thumb.press("ArrowRight");
  await expect(thumb).toHaveAttribute("aria-valuenow", "45");
  const form = page.getByRole("form", { name: "Volume settings" });
  expect(await form.evaluate((el) => new FormData(el as HTMLFormElement).get("volume"))).toBe("45");
  await page.getByRole("button", { name: "Reset volume" }).click();
  await expect(thumb).toHaveAttribute("aria-valuenow", "40");
  expect(await form.evaluate((el) => new FormData(el as HTMLFormElement).get("volume"))).toBe("40");
});

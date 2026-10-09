import { readFileSync } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { demoThemes, withDemoAccent } from "../../../packages/tokens/src/presets/docs-themes";
import { resolveColors } from "../../../packages/tokens/src/resolve";

const example = readFileSync(new URL("../src/examples/alert-dialog.tsx", import.meta.url), "utf8");

async function openExample(page: Page) {
  await page.goto("components/");
  await page.getByRole("button", { name: "Preview AlertDialog", exact: true }).click();
}

async function target(control: Locator) {
  await control.scrollIntoViewIfNeeded();
  const box = (await control.boundingBox())!;
  expect(box.width, "confirmation control target width").toBeGreaterThanOrEqual(44);
  expect(box.height, "confirmation control target height").toBeGreaterThanOrEqual(44);
  expect(
    await control.evaluate((el) => {
      const box = el.getBoundingClientRect();
      return el.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2));
    }),
    "confirmation control receives pointer hits",
  ).toBe(true);
}

async function paint(control: Locator, ground: Locator) {
  const background = await ground.evaluate((el) => getComputedStyle(el).backgroundColor);
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
    const ratio = (ink: string, fill: string) => {
      const a = luminance(ink),
        b = luminance(fill);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    };
    const style = getComputedStyle(el);
    return {
      style: style.outlineStyle,
      width: parseFloat(style.outlineWidth),
      focus: ratio(style.outlineColor, background),
      text: ratio(style.color, style.backgroundColor),
    };
  }, background);
}

test("AlertDialog names, focuses Cancel, traps focus, blocks outside dismissal and distinguishes actions", async ({
  page,
}) => {
  await openExample(page);
  const canvas = page.locator(".family-canvas");
  const trigger = canvas.getByRole("button", { name: "Review draft removal" });
  await target(trigger);
  await trigger.focus();
  await page.keyboard.press("Enter");
  const alert = page.getByRole("alertdialog", { name: "Remove this draft?" });
  await expect(alert).toHaveAccessibleDescription(
    "This permanently removes the unsaved draft. Choose Keep draft to continue editing.",
  );
  const cancel = alert.getByRole("button", { name: "Keep draft" });
  const action = alert.getByRole("button", { name: "Remove draft", exact: true });
  await expect(cancel).toBeFocused();
  await target(cancel);
  await target(action);
  await page.keyboard.press("Tab");
  await expect(action).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(cancel).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(action).toBeFocused();
  await page.mouse.click(8, 8);
  await expect(alert, "outside pointer cannot dismiss confirmation").toBeVisible();
  expect(
    await page.evaluate(() => document.elementFromPoint(8, 8)?.getAttribute("data-slot")),
    "outside pointer is intercepted by the explicit overlay",
  ).toBe("alert-dialog-overlay");
  await page.keyboard.press("Tab");
  await expect(
    cancel,
    "keyboard focus stays in the confirmation after outside interaction",
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(alert).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(canvas.getByRole("status")).toHaveText("Your draft is safe.");
  await trigger.click();
  await cancel.click();
  await expect(alert).toHaveCount(0);
  await expect(canvas.getByRole("status")).toHaveText("Your draft is safe.");
  await trigger.click();
  await action.click();
  await expect(alert).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(canvas.getByRole("status")).toHaveText("Draft removed.");
});

test("AlertDialog preserves the caller's asynchronous closing and nested Sheet input recovery", async ({
  page,
}) => {
  // React and Radix must start with the same clock that advances the simulated save.
  // Replacing timers after the app loads is undefined behavior in Playwright.
  await page.clock.install();
  await openExample(page);
  const canvas = page.locator(".family-canvas");
  const save = canvas.getByRole("button", { name: "Save before closing" });
  await save.click();
  const alert = page.getByRole("alertdialog", { name: "Save your changes?" });
  await alert.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(alert.getByRole("status")).toHaveText("Saving changes…");
  await expect(alert.getByRole("button", { name: "Cancel save" })).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(alert, "prevented close remains open during saving").toBeVisible();
  await page.clock.runFor(500);
  await expect(alert).toHaveCount(0);
  await expect(save).toBeFocused();
  await expect(canvas.getByRole("status")).toHaveText("Changes saved.");
  const editor = canvas.getByRole("button", { name: "Open draft editor" });
  await editor.click();
  const sheet = page.getByRole("dialog", { name: "Draft editor" });
  const input = sheet.getByRole("textbox", { name: "Draft name" });
  await input.fill("Before confirmation");
  const review = sheet.getByRole("button", { name: "Review removal in editor" });
  await review.click();
  const nested = page.getByRole("alertdialog", { name: "Remove this draft?" });
  await expect(nested.getByRole("button", { name: "Keep draft" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(nested).toHaveCount(0);
  try {
    await expect(review).toBeFocused();
  } catch (error) {
    // Preserve the actual parent state when a hosted run cannot restore focus.
    // Role locators alone cannot distinguish a closed Sheet from aria-hidden one.
    console.error(
      "NESTED_ESCAPE_STATE",
      await page.evaluate(() => ({
        activeElement: document.activeElement?.outerHTML,
        sheets: Array.from(document.querySelectorAll('[data-slot="sheet-content"]')).map(
          (element) => element.outerHTML,
        ),
        confirmations: Array.from(
          document.querySelectorAll('[data-slot="alert-dialog-content"]'),
        ).map((element) => element.outerHTML),
        bodyPointerEvents: document.body.style.pointerEvents,
      })),
    );
    throw error;
  }
  await target(input);
  await input.fill("Recovered after confirmation");
  await expect(input).toHaveValue("Recovered after confirmation");
  await sheet.getByRole("button", { name: "Close editor" }).click();
  await expect(sheet).toHaveCount(0);
  await expect(editor).toBeFocused();
  await target(save);
});

test("AlertDialog source is highlighted and copies exact registry-alias composition", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await openExample(page);
  const block = page.locator(".family-detail .code-block");
  expect(await block.locator("pre code").textContent()).toBe(example);
  expect(await block.locator(".token").count(), "source has highlighted semantics").toBeGreaterThan(
    5,
  );
  await block.getByRole("button", { name: "Copy AlertDialog composition" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(example);
  await expect(block.getByRole("status")).toHaveText("Copied to clipboard");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
});

test("isolated native and composed AlertDialog controls paint focus through presets, accents and forced colors", async ({
  page,
}) => {
  for (const preset of ["arcade", "light"] as const) {
    for (const story of ["default", "composition"] as const) {
      for (const accent of ["auto", "violet"] as const) {
        await page.goto(
          `storybook/iframe.html?id=parts-alertdialog--${story}&viewMode=story&embed=true&globals=preset:${preset}`,
        );
        if (accent === "violet") {
          const roles = resolveColors(
            withDemoAccent(demoThemes.arcade[preset === "light" ? "light" : "dark"], accent),
          );
          await page.evaluate((roles) => {
            for (const [role, color] of Object.entries(roles))
              document.documentElement.style.setProperty(`--${role}`, color);
          }, roles);
        }
        const trigger =
          story === "default"
            ? page.getByRole("button", { name: "Review draft" })
            : page.getByRole("button", { name: "Review removal" });
        if (story === "composition")
          await page.getByRole("button", { name: "Open editor" }).click();
        await expect(trigger).toBeVisible();
        await page.keyboard.press("Tab");
        await trigger.focus();
        await target(trigger);
        for (const forcedColors of ["none", "active"] as const) {
          await page.emulateMedia({ forcedColors });
          const triggerPaint = await paint(trigger, trigger);
          expect(
            triggerPaint.style,
            `${preset}/${story}/${accent}/${forcedColors} trigger paints focus`,
          ).toBe("solid");
          expect(
            triggerPaint.width,
            `${preset}/${story}/${accent}/${forcedColors} trigger focus width`,
          ).toBeGreaterThanOrEqual(2);
          expect(
            triggerPaint.focus,
            `${preset}/${story}/${accent}/${forcedColors} trigger focus contrast`,
          ).toBeGreaterThanOrEqual(3);
        }
        await page.emulateMedia({ forcedColors: "none" });
        await trigger.press("Enter");
        const alert = page.getByRole("alertdialog");
        const cancel = alert.getByRole("button", { name: "Keep draft" });
        const action = alert.getByRole("button", { name: "Remove draft", exact: true });
        for (const forcedColors of ["none", "active"] as const) {
          await page.emulateMedia({ forcedColors });
          for (const control of [cancel, action]) {
            await control.focus();
            await target(control);
            const actual = await paint(control, alert);
            expect(actual.style, `${preset}/${story}/${forcedColors} control paints focus`).toBe(
              "solid",
            );
            expect(
              actual.width,
              `${preset}/${story}/${forcedColors} control focus width`,
            ).toBeGreaterThanOrEqual(2);
            expect(
              actual.focus,
              `${preset}/${story}/${forcedColors} control focus contrast`,
            ).toBeGreaterThanOrEqual(3);
            expect(
              actual.text,
              `${preset}/${story}/${forcedColors} control text contrast`,
            ).toBeGreaterThanOrEqual(4.5);
          }
        }
        await page.emulateMedia({ forcedColors: "none" });
        await page.screenshot({
          path: test.info().outputPath(`alert-dialog-${preset}-${story}-${accent}.png`),
        });
        await page.keyboard.press("Escape");
      }
    }
  }
  await openExample(page);
  await page.getByRole("button", { name: "Light", exact: true }).click();
  await page.getByRole("button", { name: /^Customize theme:/ }).click();
  await page.getByRole("radio", { name: /^Violet\b/ }).check();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await page.getByRole("button", { name: "Review draft removal" }).click();
  const alert = page.getByRole("alertdialog");
  const cancel = alert.getByRole("button", { name: "Keep draft" });
  await page.keyboard.press("Tab");
  await cancel.focus();
  const actual = await paint(cancel, alert);
  expect(actual.style, "accent confirmation paints focus").toBe("solid");
  expect(actual.width, "accent confirmation focus width").toBeGreaterThanOrEqual(2);
  expect(actual.focus, "accent confirmation focus contrast").toBeGreaterThanOrEqual(3);
});

test("long AlertDialog panels stay centered inside the viewport and scroll to usable actions", async ({
  page,
}) => {
  await page.goto(
    "storybook/iframe.html?id=parts-alertdialog--tall-content&viewMode=story&embed=true",
  );
  await page.getByRole("button", { name: "Review long confirmation" }).click();
  const alert = page.getByRole("alertdialog", { name: "Review every change" });
  const bounds = (await alert.boundingBox())!;
  const viewport = page.viewportSize()!;
  expect(bounds.x, "confirmation left edge").toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width, "confirmation right edge").toBeLessThanOrEqual(viewport.width);
  expect(bounds.y, "confirmation top edge").toBeGreaterThanOrEqual(0);
  expect(bounds.y + bounds.height, "confirmation bottom edge").toBeLessThanOrEqual(viewport.height);
  expect(
    Math.abs(bounds.x + bounds.width / 2 - viewport.width / 2),
    "confirmation horizontally centered",
  ).toBeLessThan(1);
  expect(
    Math.abs(bounds.y + bounds.height / 2 - viewport.height / 2),
    "confirmation vertically centered",
  ).toBeLessThan(1);
  expect(
    await alert.evaluate((el) => el.scrollHeight > el.clientHeight),
    "long confirmation has real overflow",
  ).toBe(true);
  await expect(alert).toHaveCSS("overflow-y", "auto");
  const action = alert.getByRole("button", { name: "Confirm all changes" });
  await target(action);
  expect(
    await alert.evaluate((el) => el.scrollTop),
    "actions are reachable through panel scrolling",
  ).toBeGreaterThan(0);
  await expect(alert.getByText("Change 32: Check this detail before continuing.")).toBeInViewport();
  await page.screenshot({ path: test.info().outputPath("alert-dialog-tall.png") });
  await action.click();
  await expect(alert).toHaveCount(0);
});

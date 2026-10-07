import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const example = readFileSync(new URL("../src/examples/tabs.tsx", import.meta.url), "utf8");

async function openTabs(page: Page) {
  await page.goto("./#components");
  await page.getByRole("button", { name: "Preview Tabs", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Tabs", exact: true })).toBeVisible();
}

test("live Tabs selects by keyboard, contains 44px controls and copies highlighted source", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await openTabs(page);
  const canvas = page.locator(".family-canvas");
  const horizontal = canvas.getByRole("tablist", { name: "Project sections" });
  const overview = horizontal.getByRole("tab", { name: "Overview" });
  const activity = horizontal.getByRole("tab", { name: "Activity" });
  await expect(horizontal.getByRole("tab", { name: "Reports" })).toBeDisabled();
  await expect(overview).toHaveAttribute("aria-selected", "true");
  await overview.focus();
  await page.keyboard.press("ArrowRight");
  await expect(activity).toBeFocused();
  await expect(activity).toHaveAttribute("aria-selected", "true");
  await expect(overview).toHaveAttribute("aria-selected", "false");
  const activityPanel = canvas.getByRole("tabpanel", { name: "Activity" });
  await expect(activityPanel).toHaveText("Recent project activity.");
  await expect(activity).toHaveAttribute(
    "aria-controls",
    (await activityPanel.getAttribute("id"))!,
  );
  await expect(activityPanel).toHaveAttribute(
    "aria-labelledby",
    (await activity.getAttribute("id"))!,
  );
  await page.keyboard.press("Home");
  await expect(overview).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(canvas.getByRole("tabpanel", { name: "Overview" })).toBeFocused();

  const vertical = canvas.getByRole("tablist", { name: "Account sections" });
  const profile = vertical.getByRole("tab", { name: "Profile" });
  const settings = vertical.getByRole("tab", { name: "Settings" });
  await expect(vertical).toHaveAttribute("aria-orientation", "vertical");
  await profile.focus();
  await page.keyboard.press("ArrowDown");
  await expect(settings).toBeFocused();
  await expect(settings).toHaveAttribute("aria-selected", "false");
  await expect(canvas.getByRole("tabpanel", { name: "Profile" })).toHaveText(
    "Your profile details.",
  );
  await page.keyboard.press("Enter");
  await expect(settings).toHaveAttribute("aria-selected", "true");
  await expect(canvas.getByRole("tabpanel", { name: "Settings" })).toHaveText(
    "Your account settings.",
  );
  await page.keyboard.press("Home");
  await expect(profile).toBeFocused();
  await page.keyboard.press("Space");
  await expect(profile).toHaveAttribute("aria-selected", "true");
  await expect(canvas.getByRole("tabpanel", { name: "Profile" })).toHaveText(
    "Your profile details.",
  );

  const tabs = canvas.getByRole("tab");
  await expect(tabs).toHaveCount(5);
  for (const tab of await tabs.all()) {
    await tab.scrollIntoViewIfNeeded();
    const box = (await tab.boundingBox())!;
    expect(box.width, "tab target width").toBeGreaterThanOrEqual(44);
    expect(box.height, "tab target height").toBeGreaterThanOrEqual(44);
    expect(box.x, "tab stays inside viewport").toBeGreaterThanOrEqual(0);
    expect(box.x + box.width, "tab stays inside viewport").toBeLessThanOrEqual(
      page.viewportSize()!.width,
    );
    if (await tab.isEnabled())
      expect(
        await tab.evaluate((el) => {
          const rect = el.getBoundingClientRect();
          return el.contains(
            document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2),
          );
        }),
        "tab receives pointer hits",
      ).toBe(true);
  }
  const first = (await profile.boundingBox())!;
  const second = (await settings.boundingBox())!;
  expect(second.y, "vertical list stacks triggers").toBeGreaterThan(first.y + first.height);
  expect(second.x, "vertical triggers share a column").toBe(first.x);
  const start = (await overview.boundingBox())!;
  const end = (await activity.boundingBox())!;
  expect(end.x, "horizontal list advances across columns").toBeGreaterThan(start.x + start.width);
  expect(end.y).toBe(start.y);

  const block = page.locator(".family-detail .code-block");
  expect(await block.locator("pre code").textContent()).toBe(example);
  expect(
    await block.locator(".token").count(),
    "copyable source has highlighted semantics",
  ).toBeGreaterThan(5);
  await block.getByRole("button", { name: "Copy Tabs composition" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(example);
  await expect(block.getByRole("status")).toHaveText("Copied to clipboard");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
  await canvas.screenshot({ path: test.info().outputPath("tabs-composition.png") });
});

test("Tabs paints readable state and focus from dark, light and accent roles", async ({ page }) => {
  await openTabs(page);
  const canvas = page.locator(".family-canvas");
  const profile = canvas.getByRole("tab", { name: "Profile" });
  const paints: string[] = [];
  for (const mode of ["dark", "light"]) {
    await page
      .getByRole("button", { name: mode === "dark" ? "Dark" : "Light", exact: true })
      .click();
    for (const accent of ["Automatic", "Violet"]) {
      await page.getByRole("button", { name: /^Customize theme:/ }).click();
      await page.getByRole("radio", { name: new RegExp(`^${accent}\\b`) }).check();
      await page.getByRole("button", { name: "Done", exact: true }).click();
      await page.keyboard.press("Tab");
      await profile.focus();
      await expect(profile).toBeFocused();
      await expect(profile).toHaveCSS("outline-style", "solid");
      const ratios = await canvas.evaluate((el) => {
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
        const background = (element: Element): string => {
          for (let current: Element | null = element; current; current = current.parentElement) {
            const fill = getComputedStyle(current).backgroundColor;
            if (fill !== "rgba(0, 0, 0, 0)" && fill !== "transparent") return fill;
          }
          throw new Error("Tabs has no painted background");
        };
        const contrast = (ink: string, ground: string) => {
          const a = luminance(ink),
            b = luminance(ground);
          return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        };
        return [
          ...el.querySelectorAll('[role="tab"]:not([disabled]), [role="tabpanel"]:not([hidden])'),
        ].map((element) => ({
          label: element.textContent,
          text: contrast(getComputedStyle(element).color, background(element)),
          focus: contrast(getComputedStyle(element).outlineColor, background(element)),
        }));
      });
      expect(ratios).toHaveLength(6);
      for (const ratio of ratios)
        expect(ratio.text, `${mode}/${accent} ${ratio.label} ink`).toBeGreaterThanOrEqual(4.5);
      const focused = ratios.find((ratio) => ratio.label === "Profile")!;
      expect(focused.focus, `${mode}/${accent} focus outline`).toBeGreaterThanOrEqual(3);
      paints.push(await profile.evaluate((el) => getComputedStyle(el).color));
    }
  }
  expect(paints[0], "dark selected line follows accent").not.toBe(paints[1]);
  expect(paints[2], "light selected line follows accent").not.toBe(paints[3]);
  await page.emulateMedia({ forcedColors: "active" });
  await profile.focus();
  await expect(profile).toHaveCSS("outline-style", "solid");
  expect(
    await profile.evaluate((el) => parseFloat(getComputedStyle(el).outlineWidth)),
  ).toBeGreaterThanOrEqual(2);
});

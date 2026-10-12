import { expect, test } from "@playwright/test";

test.use({ hasTouch: true });

test("touch taps reach Slider endpoints and commit the value", async ({ page }) => {
  await page.goto("components/");
  await page.getByRole("button", { name: "Preview Slider", exact: true }).tap();
  for (const [name, vertical, reversed] of [
    ["Volume", false, false],
    ["Vertical level", true, true],
    ["Right-to-left balance", false, true],
    ["Inverted balance", false, true],
  ] as const) {
    const thumb = page.getByRole("slider", { name, exact: true });
    const track = thumb
      .locator('xpath=ancestor::*[@data-slot="slider"]')
      .locator('[data-slot="slider-track"]');
    for (const value of [0, 100]) {
      await track.scrollIntoViewIfNeeded();
      const box = (await track.boundingBox())!;
      const end = (value === 100) !== reversed;
      // Keep a full CSS pixel inside the track when an engine rounds input coordinates.
      await page.touchscreen.tap(
        box.x + (vertical ? box.width / 2 : end ? box.width - 1 : 1),
        box.y + (vertical ? (end ? box.height - 1 : 1) : box.height / 2),
      );
      await expect(thumb).toHaveAttribute("aria-valuenow", String(value));
      if (name === "Volume")
        await expect(page.getByRole("status").first()).toHaveText(`Committed volume: ${value}%`);
    }
  }
});

test("touch selects calendar dates and closes DatePicker with the selected value", async ({
  page,
}) => {
  await page.goto("components/");
  await page.getByRole("button", { name: "Preview Calendar", exact: true }).tap();
  const single = page.getByRole("region", { name: "Single day" });
  await single.getByRole("button", { name: /October 31st, 2026/ }).tap();
  await expect(single.getByText("Selected day: 31")).toBeVisible();
  await single.getByRole("button", { name: "Go to the Next Month" }).tap();
  await expect(single.getByRole("grid", { name: "November 2026" })).toBeVisible();

  await page.getByRole("button", { name: "Preview DatePicker", exact: true }).tap();
  const trigger = page.getByRole("button", { name: "Choose date", exact: true });
  await trigger.tap();
  const panel = page.getByRole("dialog", { name: "Choose a day" });
  await expect(panel.getByRole("button", { name: /October 14th, 2026/ })).toBeDisabled();
  await panel.getByRole("button", { name: /October 15th, 2026/ }).tap();
  await expect(panel).toHaveCount(0);
  await expect(trigger).toHaveText("October 15, 2026");
  await expect(page.locator('input[name="day"]')).toHaveValue("2026-10-15");
  await trigger.tap();
  await expect(
    panel.getByRole("button", { name: /October 15th, 2026/ }).locator(".."),
  ).toHaveAttribute("aria-selected", "true");
});

test("touch opens Select and Combobox and commits only the chosen option", async ({ page }) => {
  await page.goto("components/");
  await page.getByRole("button", { name: "Preview Select", exact: true }).tap();
  const select = page.getByRole("combobox", { name: "Project priority" });
  await select.tap();
  await page.getByRole("option", { name: "Urgent", exact: true }).tap();
  await expect(select).toHaveText("Urgent⌄");
  await expect(page.getByRole("listbox")).toHaveCount(0);

  await page.getByRole("button", { name: "Preview Combobox", exact: true }).tap();
  const combo = page.getByRole("button", { name: "Language", exact: true });
  await combo.tap();
  await page.getByRole("combobox", { name: "Search languages" }).fill("french");
  await expect(combo).toContainText("English");
  await page.getByRole("option", { name: "French", exact: true }).tap();
  await expect(combo).toContainText("French");
  await expect(page.getByRole("listbox")).toHaveCount(0);
});

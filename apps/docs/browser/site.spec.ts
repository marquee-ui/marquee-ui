import { expect, test, type Locator } from "@playwright/test";

async function foregroundContrast(control: Locator) {
  return control.evaluate((el) => {
    const style = getComputedStyle(el);
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
    const ink = luminance(style.color),
      fill = luminance(style.backgroundColor);
    return (Math.max(ink, fill) + 0.05) / (Math.min(ink, fill) + 0.05);
  });
}

test("loads real fonts, readable primary actions and a page that fits the viewport", async ({
  page,
}) => {
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));
  await page.goto("./");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await page.keyboard.press("Tab");
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  const skipBox = await skip.boundingBox();
  expect(skipBox!.x).toBeGreaterThanOrEqual(0);
  expect(skipBox!.y).toBeGreaterThanOrEqual(0);
  expect(skipBox!.x + skipBox!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  expect(await foregroundContrast(skip), "focused skip-link label contrast").toBeGreaterThanOrEqual(
    4.5,
  );
  expect(await skip.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe("solid");
  await page.screenshot({ path: test.info().outputPath("skip-link.png") });
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(() =>
      Array.from(document.fonts)
        .filter((face) => face.status === "loaded")
        .map((face) => face.family)
        .sort(),
    ),
  ).toEqual(["Boldonse", "Space Grotesk", "Space Mono"]);
  expect(await page.locator("h1").evaluate((el) => getComputedStyle(el).fontFamily)).toContain(
    "Boldonse",
  );
  const primary = page.getByRole("link", { name: "Start building" });
  const contrast = await foregroundContrast(primary);
  expect(contrast, "primary action label contrast").toBeGreaterThanOrEqual(4.5);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
  expect(await primary.evaluate((el) => el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(
    44,
  );
  await primary.focus();
  expect(await primary.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe("solid");
  await page.screenshot({ path: test.info().outputPath("hero.png") });
  await primary.click();
  await expect(page).toHaveURL(/\/getting-started\/$/);
  await expect(page.getByRole("heading", { name: "Run the starter", level: 2 })).toBeVisible();
  await expect(
    page.locator("#getting-started").getByRole("link", { name: "supported stack and limitations" }),
  ).toHaveAttribute("href", "/marquee-ui/guides/");
  expect(failures).toEqual([]);
});

test("navigates on mobile and operates real examples with a keyboard", async ({
  page,
  context,
}, info) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("./");
  if (info.project.name === "mobile") {
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    await expect(page.getByRole("button", { name: "Menu", exact: true })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  }
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Components", exact: true })
    .click();
  if (info.project.name === "mobile") {
    await expect(page.getByRole("button", { name: "Menu", exact: true })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  }
  await page.getByRole("button", { name: "Preview Switch", exact: true }).click();
  const switchControl = page.getByRole("switch", { name: "Email updates" });
  await switchControl.focus();
  await page.keyboard.press("Space");
  await expect(switchControl).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "Preview Sheet", exact: true }).click();
  const trigger = page.getByRole("button", { name: "Open project sheet" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Project details" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await page.goto("guides/composition/");
  await page.getByRole("button", { name: "Behind the build" }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page
      .locator(".composition-preview")
      .getByText("Put any content here. You own the structure.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Copy Card inside an accordion" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Copied to clipboard" })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    await page.locator(".composition-layout pre code").innerText(),
  );
});

test("renders every family and sends each workbench link to a real story", async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("components/");
  const index = await request.get("storybook/index.json");
  expect(index.status()).toBe(200);
  const storyIndex = (await index.json()) as { entries: Record<string, unknown> };
  const families = page.getByRole("button", { name: /^Preview / });
  await expect(families).toHaveCount(35);
  // Independent of the production catalog: a nonempty placeholder is not a preview.
  const expectedParts = [
    ["Chart", "[data-slot=chart-container] .recharts-surface"],
    ["DataTable", "table[data-slot=data-table]"],
    ["Table", "table[data-slot=table]"],
    ["DatePicker", "[data-slot=popover-trigger]"],
    ["Combobox", "[data-slot=combobox-trigger]"],
    ["Calendar", "[data-slot=calendar]"],
    ["DropdownMenu", "[data-slot=dropdown-menu-trigger]"],
    ["Slider", "[data-slot=slider]"],
    ["Button", "button[data-slot=button]"],
    ["Accordion", "[data-slot=accordion-item]"],
    ["Alert", "[data-slot=alert]"],
    ["Avatar", "[data-slot=avatar] [data-slot=avatar-image]"],
    ["Badge", "[data-slot=badge]"],
    ["Breadcrumb", "nav[data-slot=breadcrumb]"],
    ["Card", "[data-slot=card] [data-slot=card-title]"],
    ["Checkbox", "input[data-slot=checkbox-input]"],
    ["Description list", "dl[data-slot=description-list] dt"],
    ["Form", "[data-slot=form-item] input"],
    ["Input", "input[data-slot=input]"],
    ["Label", "label[data-slot=label]"],
    ["Pagination", "nav[data-slot=pagination] [data-slot=pagination-link]"],
    ["Radio group", "[role=radiogroup] input[type=radio]"],
    ["Ribbon", "[data-slot=ribbon] [data-slot=ribbon-track]"],
    ["Separator", "[data-slot=separator]"],
    ["Sheet", "button[data-slot=sheet-trigger]"],
    ["Switch", "button[role=switch] [data-slot=switch-track]"],
    ["Textarea", "textarea[data-slot=textarea]"],
    ["Toast", "button[data-slot=button]"],
    ["Select", "[data-slot=select-trigger]"],
    ["Tabs", "[data-slot=tabs-list]"],
    ["Tooltip", "[data-slot=tooltip-trigger]"],
    ["Popover", "[data-slot=popover-trigger]"],
    ["AlertDialog", "[data-slot=alert-dialog-trigger]"],
    ["Dialog", "[data-slot=dialog-trigger]"],
    ["Toggle", "button[data-slot=toggle][aria-pressed]"],
  ] as const;
  for (const [name, selector] of expectedParts) {
    await page.getByRole("button", { name: `Preview ${name}`, exact: true }).click();
    await expect(
      page.locator(".family-detail").getByRole("heading", { name, exact: true, level: 3 }),
    ).toBeFocused();
    const canvas = page.locator(".family-canvas");
    await expect(
      canvas.locator(selector).first(),
      `${name} must render its actual parts`,
    ).toBeVisible();
    if (name === "Sheet") {
      await canvas.getByRole("button", { name: "Open project sheet" }).click();
      await expect(page.getByRole("dialog", { name: "Project details" })).toBeVisible();
      await page.getByRole("button", { name: "Done", exact: true }).click();
      await expect(page.getByRole("dialog")).toHaveCount(0);
    }
    if (name === "Toast") {
      await canvas.getByRole("button", { name: "Show notification" }).click();
      await expect(page.locator("[data-slot=toast-message]")).toHaveText("Project saved.");
      await page.getByRole("button", { name: "Dismiss", exact: true }).click();
      await expect(page.locator("[data-slot=toast]")).toHaveCount(0);
    }
    const link = page.locator(".family-heading a");
    const href = await link.getAttribute("href");
    expect(href).toMatch(/^\/marquee-ui\/storybook\/\?path=\/story\//);
    const id = new URL(href!, "http://localhost").searchParams.get("path")!.replace("/story/", "");
    expect(storyIndex.entries[id], `missing Storybook story ${id}`).toBeDefined();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      page.viewportSize()!.width,
    );
  }
  expect(errors).toEqual([]);
});

test("serves Storybook fonts and both presets beneath the deployment subpath", async ({ page }) => {
  const styles: string[] = [];
  page.on("response", (response) => {
    if (response.url().includes("/tokens/") && response.ok())
      styles.push(new URL(response.url()).pathname);
  });
  await page.goto("storybook/iframe.html?id=parts-button--primary&viewMode=story");
  await expect(page.locator("[data-slot=button]")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(() =>
      Array.from(document.fonts)
        .filter((face) => face.status === "loaded")
        .map((face) => face.family),
    ),
  ).toContain("Space Grotesk");
  expect(styles).toContain("/marquee-ui/storybook/tokens/fonts.css");
  const darkGround = await page.evaluate(() =>
    getComputedStyle(document.body).getPropertyValue("--background").trim(),
  );
  await page.goto(
    "storybook/iframe.html?id=parts-button--primary&viewMode=story&globals=preset:light",
  );
  await expect(page.locator("#marquee-light-preset")).toHaveAttribute("href", "./tokens/light.css");
  await expect
    .poll(async () =>
      page.evaluate(() => getComputedStyle(document.body).getPropertyValue("--background").trim()),
    )
    .not.toBe(darkGround);
  expect(styles).toContain("/marquee-ui/storybook/tokens/light.css");
});

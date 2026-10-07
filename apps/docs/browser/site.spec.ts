import { expect, test } from "@playwright/test";

test("loads real fonts, readable primary actions and a page that fits the viewport", async ({
  page,
}) => {
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));
  await page.goto("./");
  await expect(page.getByRole("heading", { name: "Run the starter", level: 3 })).toBeVisible();
  await expect(
    page.locator("#getting-started").getByRole("link", { name: "supported stack and limitations" }),
  ).toHaveAttribute("href", "#supported-stack");
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
  const contrast = await primary.evaluate((el) => {
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
  expect(failures).toEqual([]);
});

test("navigates on mobile and operates real examples with a keyboard", async ({
  page,
  context,
}, info) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("./");
  if (info.project.name === "mobile") {
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.getByRole("button", { name: "Menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "Components", exact: true })
      .click();
    await expect(page.getByRole("button", { name: "Menu" })).toHaveAttribute(
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
  await page.goto("./");
  const index = await request.get("storybook/index.json");
  expect(index.status()).toBe(200);
  const storyIndex = (await index.json()) as { entries: Record<string, unknown> };
  const families = page.getByRole("button", { name: /^Preview / });
  await expect(families).toHaveCount(21);
  for (const family of await families.all()) {
    await family.click();
    const link = page.locator(".family-heading a");
    const href = await link.getAttribute("href");
    expect(href).toMatch(/^\/marquee-ui\/storybook\/\?path=\/story\//);
    const id = new URL(href!, "http://localhost").searchParams.get("path")!.replace("/story/", "");
    expect(storyIndex.entries[id], `missing Storybook story ${id}`).toBeDefined();
    await expect(page.locator(".family-canvas")).not.toBeEmpty();
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

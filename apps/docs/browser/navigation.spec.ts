import { expect, test } from "@playwright/test";

test("home is an introduction and the main navigation opens separate pages", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Compose ityour way.");
  await expect(
    page.locator("#getting-started, #components, #tokens, #supported-stack"),
  ).toHaveCount(0);
  for (const [label, path, heading] of [
    ["Get started", "getting-started/", "From empty project to your first composition."],
    ["Components", "components/", "A kit of possibilities."],
    ["Themes", "themes/", "A role for every detail."],
    ["Guides", "guides/", "Know the contract."],
  ]) {
    const menu = page.getByRole("button", { name: "Menu", exact: true });
    if (await menu.isVisible()) await menu.click();
    const link = page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: label, exact: true });
    await expect(link).toHaveAttribute("href", `/marquee-ui/${path}`);
    await link.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`/marquee-ui/${path}$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading!);
    await expect(page.locator(`#main-navigation a[href="/marquee-ui/${path}"]`)).toHaveAttribute(
      "aria-current",
      "page",
    );
    if (await menu.isVisible()) await expect(menu).toHaveAttribute("aria-expanded", "false");
  }
  await page.goBack();
  await expect(page).toHaveURL(/\/themes\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("A role for every detail.");
  await page.goForward();
  await expect(page).toHaveURL(/\/guides\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Know the contract.");
});

test("nested guide URLs are static documents that load directly and survive refresh", async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const [path, title, heading] of [
    ["guides/composition/", "Composition", "Put the parts together."],
    ["guides/contracts/", "Component contracts", "Familiar names. Explicit contracts."],
    ["guides/recipes/", "Recipe contracts", "Compose the newer families."],
  ]) {
    const response = await request.get(`${path}index.html`);
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain(`<title>${title} — Marquee UI</title>`);
    await page.goto(path!);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading!);
    await expect(
      page.getByRole("navigation", { name: "Guide navigation" }).locator('[aria-current="page"]'),
    ).toHaveCount(1);
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading!);
    await page.evaluate(() => document.fonts.ready);
    expect(await page.locator("h1").evaluate((el) => getComputedStyle(el).fontFamily)).toContain(
      "Boldonse",
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      page.viewportSize()!.width,
    );
  }
  expect(errors).toEqual([]);
});

test("remaining legacy bookmarks retain their destinations and unknown pages offer a way home", async ({
  page,
}) => {
  for (const [anchor, path] of [
    ["getting-started", "getting-started/"],
    ["composition", "guides/composition/"],
    ["tokens", "themes/"],
    ["theme-studio", "themes/"],
    ["theme-recipe", "themes/"],
    ["supported-stack", "guides/"],
    ["recipe-contracts", "guides/recipes/"],
  ]) {
    await page.goto(`./?from=bookmark#${anchor}`);
    await expect(page).toHaveURL(new RegExp(`/marquee-ui/${path}\\?from=bookmark#${anchor}$`));
    await expect(page.locator(`#${anchor}`)).toBeAttached();
  }
  await page.goto("404.html");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found.");
  await page.getByRole("link", { name: "Go to the homepage" }).click();
  await expect(page).toHaveURL(/\/marquee-ui\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Compose ityour way.");
});

test("old section links resolve to the new page and theme preferences follow navigation", async ({
  page,
}) => {
  await page.goto("./#components");
  await expect(page).toHaveURL(/\/components\/#components$/);
  await expect(page.getByRole("button", { name: "Preview Button", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Light", exact: true }).click();
  await page.getByRole("button", { name: /^Customize theme:/ }).click();
  await page.getByRole("radio", { name: "Tide", exact: true }).check();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  const menu = page.getByRole("button", { name: "Menu", exact: true });
  if (await menu.isVisible()) await menu.click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Themes", exact: true })
    .click();
  await expect(page).toHaveURL(/\/themes\/$/);
  await expect(page.getByRole("button", { name: /^Customize theme:/ })).toHaveAccessibleName(
    "Customize theme: Tide, Automatic accent",
  );
  await expect(page.locator("html")).toHaveCSS("color-scheme", "light");
  await expect(page.locator("#theme-recipe code")).toContainText("tide / light / auto accent");
  await page.goto("./#common-name-api");
  await expect(page).toHaveURL(/\/guides\/contracts\/#common-name-api$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Familiar names. Explicit contracts.",
  );
});

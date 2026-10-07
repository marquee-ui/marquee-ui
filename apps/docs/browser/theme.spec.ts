import { expect, test, type Page } from "@playwright/test";

const storageKey = "marquee-demo-theme-v1";
const palettes = ["arcade", "electric", "clementine", "tide"];

function contrast(ink: string, ground: string) {
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
  const a = luminance(ink),
    b = luminance(ground);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

async function pageAppearance(page: Page) {
  return page.evaluate(() => {
    const css = (selector: string) => getComputedStyle(document.querySelector(selector)!);
    return {
      ground: css("html").backgroundColor,
      ink: css("html").color,
      heading: css("h1 span").color,
      action: css(".hero-actions a").backgroundColor,
      preview: css(".studio-card").backgroundColor,
      composed: css(".composition-preview").backgroundColor,
      family: css(".family-preview").backgroundColor,
      brandFill: css(".principle-band").backgroundColor,
    };
  });
}

test("expressive changes the composition's depth and identity, beyond its switch", async ({
  page,
}) => {
  await page.goto("./");
  const card = page.locator(".studio-card");
  const appearance = () =>
    card.evaluate((el) => ({
      shadow: getComputedStyle(el).boxShadow,
      border: getComputedStyle(el).borderColor,
      heading: getComputedStyle(el.querySelector("h2")!).color,
      font: getComputedStyle(el.querySelector("h2")!).fontFamily,
    }));
  const expressive = await appearance();
  const toggle = page.getByRole("switch", { name: "Make it expressive" });
  await toggle.focus();
  await page.keyboard.press("Space");
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  const restrained = await appearance();
  expect(restrained.shadow, "switch must change card depth").not.toBe(expressive.shadow);
  expect(restrained.heading, "switch must change heading identity").not.toBe(expressive.heading);
  expect(restrained.border, "switch must change visible frame").not.toBe(expressive.border);
  expect(restrained.font, "restrained heading uses the body face").not.toBe(expressive.font);
});

test("theme studio offers separate mode and palette choices", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("link", { name: "Start building", exact: true }).click();
  await expect(page.getByRole("region", { name: "Theme studio", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Light", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Dark", exact: true })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Palette", exact: true })).toBeVisible();
  const studio = page.getByRole("region", { name: "Theme studio", exact: true });
  const box = await studio.boundingBox();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height).toBeLessThanOrEqual(100);
  for (const control of await studio.locator("button, select").all()) {
    const bounds = await control.boundingBox();
    expect(bounds!.width).toBeGreaterThanOrEqual(44);
    expect(bounds!.height).toBeGreaterThanOrEqual(44);
    expect(
      await control.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return el.contains(
          document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2),
        );
      }),
      "toolbar controls receive pointer hit-testing above deep docs",
    ).toBe(true);
  }
  await page.getByRole("link", { name: "Try the theme studio" }).click();
  await expect(page).toHaveURL(/#theme-studio$/);
  await expect(studio).toBeVisible();
});

test("every mode/palette repaints the page and actual previews with readable roles", async ({
  page,
}) => {
  await page.goto("./");
  let navigationCount = 0;
  page.on("framenavigated", () => navigationCount++);
  const states: Awaited<ReturnType<typeof pageAppearance>>[] = [];
  for (const palette of palettes) {
    await page.getByRole("combobox", { name: "Palette", exact: true }).selectOption(palette);
    for (const mode of ["light", "dark"]) {
      await page
        .getByRole("button", { name: mode === "dark" ? "Dark" : "Light", exact: true })
        .click();
      await expect(page.locator("html")).toHaveCSS("color-scheme", mode);
      // The ink roles are resolved by the browser, including the code presentation's contract.
      const pairs = await page.evaluate(() => {
        const probe = document.createElement("span");
        document.body.append(probe);
        const results: { ink: string; fill: string; label: string }[] = [];
        for (const ground of ["background", "surface", "raised", "overlay", "sunken"]) {
          for (const role of [
            "foreground",
            "foreground-2",
            "muted",
            "primary-ink",
            "brand-ink",
            "info",
            "success",
            "warning",
          ]) {
            probe.style.color = `var(--${role})`;
            probe.style.backgroundColor = `var(--${ground})`;
            const style = getComputedStyle(probe);
            results.push({
              ink: style.color,
              fill: style.backgroundColor,
              label: `${role} on ${ground}`,
            });
          }
        }
        probe.remove();
        return results;
      });
      for (const pair of pairs)
        expect(
          contrast(pair.ink, pair.fill),
          `${palette}/${mode} ${pair.label}`,
        ).toBeGreaterThanOrEqual(4.5);
      const primary = page.getByRole("link", { name: "Start building", exact: true });
      await page.keyboard.press("Tab");
      await primary.focus();
      await expect(primary).toHaveCSS("outline-style", "solid");
      const primaryStyle = await primary.evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          ink: style.color,
          fill: style.backgroundColor,
          focus: style.outlineColor,
          ground: getComputedStyle(document.documentElement).backgroundColor,
        };
      });
      expect(
        contrast(primaryStyle.ink, primaryStyle.fill),
        `${palette}/${mode} actual primary action`,
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrast(primaryStyle.focus, primaryStyle.ground),
        `${palette}/${mode} actual focus outline`,
      ).toBeGreaterThanOrEqual(3);
      const band = await page.locator(".principle-band").evaluate((el) => ({
        ink: getComputedStyle(el).color,
        fill: getComputedStyle(el).backgroundColor,
      }));
      expect(contrast(band.ink, band.fill), `${palette}/${mode} brand fill`).toBeGreaterThanOrEqual(
        4.5,
      );
      const appearance = await pageAppearance(page);
      expect(contrast(appearance.ink, appearance.ground)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(appearance.heading, appearance.ground)).toBeGreaterThanOrEqual(4.5);
      expect(appearance.preview).toBe(appearance.family);
      expect(appearance.composed).toBe(appearance.family);
      states.push(appearance);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        page.viewportSize()!.width,
      );
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(() =>
          Array.from(document.fonts)
            .filter((face) => face.status === "loaded")
            .map((face) => face.family)
            .sort(),
        ),
      ).toEqual(["Boldonse", "Space Grotesk", "Space Mono"]);
    }
  }
  for (const property of ["ground", "preview", "composed", "family", "heading"] as const) {
    expect(
      new Set(states.map((state) => state[property])).size,
      `eight visibly distinct ${property} styles`,
    ).toBe(8);
  }
  for (const property of ["action", "brandFill"] as const) {
    expect(
      new Set(states.map((state) => state[property])).size,
      `four distinct palette ${property} colors`,
    ).toBe(4);
  }
  expect(navigationCount, "theme changes happen without a reload").toBe(0);
});

test("persists palette, mode and composition across refresh and copies the selected CSS", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("./");
  await page.getByRole("button", { name: "Light", exact: true }).click();
  await page.getByRole("combobox", { name: "Palette", exact: true }).selectOption("electric");
  await page.getByRole("switch", { name: "Make it expressive" }).click();
  const chosen = await pageAppearance(page);
  await page.reload();
  await expect(page.getByRole("button", { name: "Light", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("combobox", { name: "Palette", exact: true })).toHaveValue(
    "electric",
  );
  await expect(page.getByRole("switch", { name: "Make it expressive" })).toHaveAttribute(
    "aria-checked",
    "false",
  );
  expect(await pageAppearance(page)).toEqual(chosen);
  await page.getByRole("button", { name: "Copy Selected theme recipe" }).click();
  const recipe = await page.locator("#theme-recipe pre code").innerText();
  expect(recipe).toContain("electric / light");
  expect(recipe).toContain("color-scheme: light;");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(recipe);
  await expect(page.locator("#theme-recipe")).toContainText(
    "local customizations, not preset exports in npm 0.1.0",
  );
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), storageKey)).toEqual({
    mode: "light",
    palette: "electric",
    expressive: false,
  });
});

for (const raw of [
  "{",
  JSON.stringify({ mode: "light", palette: "unknown", expressive: true }),
  JSON.stringify({ mode: "light", palette: "tide" }),
]) {
  test(`invalid preference safely restores the default and remains interactive: ${raw}`, async ({
    page,
  }) => {
    await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
      key: storageKey,
      value: raw,
    });
    await page.goto("./");
    await expect(page.getByRole("button", { name: "Dark", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.getByRole("combobox", { name: "Palette", exact: true })).toHaveValue(
      "arcade",
    );
    await expect(page.getByRole("switch", { name: "Make it expressive" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    const before = await pageAppearance(page);
    await page.getByRole("button", { name: "Light", exact: true }).click();
    expect((await pageAppearance(page)).ground).not.toBe(before.ground);
  });
}

test("blocked storage still allows live themes and keyboard controls under reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get: () => {
        throw new Error("storage denied");
      },
    }),
  );
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("./");
  await page.getByRole("link", { name: "Start building", exact: true }).click();
  const light = page.getByRole("button", { name: "Light", exact: true });
  await page.keyboard.press("Tab");
  await light.focus();
  await expect(light).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveCSS("color-scheme", "light");
  const palette = page.getByRole("combobox", { name: "Palette", exact: true });
  await palette.focus();
  await expect(palette).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await expect(palette).toHaveValue("tide");
  const switchControl = page.getByRole("switch", { name: "Make it expressive" });
  await switchControl.focus();
  await page.keyboard.press("Space");
  await expect(switchControl).toHaveAttribute("aria-checked", "false");
  await expect(page.locator("[data-slot=switch-thumb]").first()).toHaveCSS(
    "transition-duration",
    "0s",
  );
  await expect(page.locator(".studio-card")).toHaveCSS("animation-name", "none");
  expect(errors).toEqual([]);
});

test("boots with a valid saved choice and remains interactive when writes fail", async ({
  page,
}) => {
  await page.addInitScript((key) => {
    localStorage.setItem(
      key,
      JSON.stringify({ mode: "light", palette: "tide", expressive: false }),
    );
    Storage.prototype.setItem = () => {
      throw new Error("quota exceeded");
    };
  }, storageKey);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("./");
  await expect(page.getByRole("button", { name: "Light", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("combobox", { name: "Palette", exact: true })).toHaveValue("tide");
  await expect(page.getByRole("switch", { name: "Make it expressive" })).toHaveAttribute(
    "aria-checked",
    "false",
  );
  const before = await pageAppearance(page);
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  expect((await pageAppearance(page)).ground).not.toBe(before.ground);
  await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
  expect(errors).toEqual([]);
});

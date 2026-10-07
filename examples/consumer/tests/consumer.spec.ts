import { expect, test } from "@playwright/test";
import type { Response } from "@playwright/test";

test("published registry components paint, load fonts and respond to pointer and keyboard", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  const fontResponses: Response[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.url().endsWith(".woff2")) {
      fontResponses.push(response);
    }
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Make it yours." })).toBeVisible();
  const fonts = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].map((face) => ({ family: face.family, status: face.status }));
  });
  expect(fonts).toHaveLength(3);
  expect(fonts.every((face) => face.status === "loaded")).toBe(true);
  expect(fontResponses).toHaveLength(3);
  const servedFonts = await Promise.all(
    fontResponses.map(async (response) => ({
      url: response.url(),
      status: response.status(),
      contentType: response.headers()["content-type"],
      magic: (await response.body()).subarray(0, 4).toString(),
    })),
  );
  for (const face of servedFonts) {
    expect(face.status).toBe(200);
    expect(face.contentType).toMatch(/^font\/woff2/);
    expect(face.magic).toBe("wOF2");
  }

  const paint = await page.evaluate(() => {
    const body = getComputedStyle(document.body);
    const button = document.querySelector<HTMLButtonElement>("[data-slot=button]");
    if (!button) throw new Error("Missing registry button");
    const control = getComputedStyle(button);
    const probe = document.createElement("span");
    document.body.append(probe);
    probe.style.backgroundColor = "var(--background)";
    const expectedBackground = getComputedStyle(probe).backgroundColor;
    probe.style.backgroundColor = "var(--primary)";
    const expectedPrimary = getComputedStyle(probe).backgroundColor;
    probe.style.fontFamily = "var(--font-body)";
    const expectedBodyFont = getComputedStyle(probe).fontFamily;
    probe.style.fontFamily = "var(--font-display)";
    const expectedDisplayFont = getComputedStyle(probe).fontFamily;
    const heading = document.querySelector("h1");
    if (!heading) throw new Error("Missing display heading");
    probe.remove();
    return {
      background: body.backgroundColor,
      expectedBackground,
      primary: control.backgroundColor,
      expectedPrimary,
      height: button.getBoundingClientRect().height,
      shadow: control.boxShadow,
      font: body.fontFamily,
      expectedBodyFont,
      displayFont: getComputedStyle(heading).fontFamily,
      expectedDisplayFont,
    };
  });
  expect(paint.background).toBe(paint.expectedBackground);
  expect(paint.background).not.toBe("rgba(0, 0, 0, 0)");
  expect(paint.primary).toBe(paint.expectedPrimary);
  expect(paint.primary).not.toBe(paint.background);
  expect(paint.height).toBeGreaterThanOrEqual(46);
  expect(paint.shadow).not.toBe("none");
  expect(paint.font).toBe(paint.expectedBodyFont);
  expect(paint.displayFont).toBe(paint.expectedDisplayFont);
  expect(paint.displayFont).not.toBe(paint.font);
  await testInfo.attach("browser-observations", {
    body: JSON.stringify({ paint, fonts, servedFonts }, null, 2),
    contentType: "application/json",
  });

  await page.getByLabel("Display name").fill("Ada");
  await expect(page.getByText("Hello, Ada.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Add one", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Count: 1");

  const toggle = page.getByRole("switch", { name: "Enable reminders" });
  const thumb = toggle.locator("[data-slot=switch-thumb]");
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  const before = await thumb.boundingBox();
  await toggle.focus();
  await toggle.press("Space");
  await expect(toggle).toHaveAttribute("aria-checked", "true");
  await expect.poll(async () => (await thumb.boundingBox())?.x).toBe((before?.x ?? 0) + 20);
  expect((await toggle.boundingBox())?.height).toBeGreaterThanOrEqual(44);

  await page.getByRole("button", { name: "Who owns these components?" }).click();
  await expect(
    page.getByText("You do. The registry copies source", { exact: false }),
  ).toBeVisible();
  const trigger = page.getByRole("button", { name: "Open details" });
  await trigger.click();
  await expect(page.getByRole("dialog", { name: "A composed sheet" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(errors).toEqual([]);
  await page.screenshot({ path: `proof/consumer-${testInfo.project.name}.png`, fullPage: true });
});

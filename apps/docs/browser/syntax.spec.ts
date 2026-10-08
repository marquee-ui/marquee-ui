import { readFileSync } from "node:fs";
import { expect, test, type Locator } from "@playwright/test";

const example = readFileSync(new URL("../src/examples/button.tsx", import.meta.url), "utf8");
const guide = readFileSync(new URL("../../../docs/getting-started.md", import.meta.url), "utf8");
const fences = [...guide.matchAll(/```([^\n]+)\n([\s\S]*?)\n```/g)].map((match) => ({
  language: match[1]!,
  code: match[2]!,
}));

// Read painted text leaves, including nested tokens; a class without color cannot pass.
async function paintedCode(code: Locator) {
  return code.evaluate((el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const leaves: { text: string; color: string }[] = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (node.textContent?.trim())
        leaves.push({ text: node.textContent, color: getComputedStyle(node.parentElement!).color });
    }
    return leaves;
  });
}

async function minimumCodeContrast(code: Locator) {
  return code.evaluate((el) => {
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
    const ground = luminance(getComputedStyle(el.closest("pre")!).backgroundColor);
    const ratios: number[] = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.textContent?.trim()) continue;
      const ink = luminance(getComputedStyle(node.parentElement!).color);
      ratios.push((Math.max(ink, ground) + 0.05) / (Math.min(ink, ground) + 0.05));
    }
    return Math.min(...ratios);
  });
}

test("paints TSX semantics, repaints from roles and copies the original example", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("./");
  const block = page.locator(".family-detail .code-block");
  const code = block.locator("pre code");
  expect(await code.textContent()).toBe(example);
  const leaves = await paintedCode(code);
  const keyword = leaves.find((leaf) => leaf.text === "import")!;
  const string = leaves.find((leaf) => leaf.text === '"react"')!;
  const number = leaves.find((leaf) => leaf.text === "0")!;
  expect(
    new Set([keyword?.color, string?.color, number?.color]).size,
    "keyword, string and number must paint distinct colors",
  ).toBe(3);
  const oldColor = keyword.color;
  expect(
    await minimumCodeContrast(code),
    "all painted TSX text must remain readable",
  ).toBeGreaterThanOrEqual(4.5);
  // An inherited role fixture exercises the CODE/THEME seam without requiring controls here.
  await block.evaluate((el) =>
    (el as HTMLElement).style.setProperty("--primary-ink", "var(--info)"),
  );
  const repainted = await paintedCode(code);
  expect(repainted.find((leaf) => leaf.text === "import")?.color).not.toBe(oldColor);
  expect(repainted.find((leaf) => leaf.text === "import")?.color).toBe(
    repainted.find((leaf) => leaf.text === "className")?.color,
  );
  expect(await code.textContent()).toBe(example);
  await block.evaluate((el) => (el as HTMLElement).style.removeProperty("--primary-ink"));
  await block.getByRole("button", { name: "Copy Button composition" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(example);
  await expect(block.getByRole("status")).toHaveText("Copied to clipboard");
  await block.screenshot({ path: test.info().outputPath("highlighted-example.png") });
});

test("keeps painted source readable under the emitted dark and light token fixtures", async ({
  page,
  request,
}) => {
  await page.goto("./");
  const block = page.locator(".family-detail .code-block");
  const code = block.locator("pre code");
  await block.evaluate((el) => el.classList.add("syntax-mode-fixture"));
  const paints: string[][] = [];
  for (const [mode, sheet] of [
    ["dark", "tokens.css"],
    ["light", "light.css"],
  ]) {
    const response = await request.get(sheet!);
    expect(response.status()).toBe(200);
    const fixture = await page.addStyleTag({
      content: (await response.text()).replaceAll(
        ":root",
        ".code-presentation.syntax-mode-fixture",
      ),
    });
    const leaves = await paintedCode(code);
    const colors = [...new Set(leaves.map((leaf) => leaf.color))].sort();
    expect(colors.length, `${mode} source must retain colored semantics`).toBeGreaterThan(2);
    expect(
      await minimumCodeContrast(code),
      `${mode} token fixture source contrast`,
    ).toBeGreaterThanOrEqual(4.5);
    expect(await code.textContent()).toBe(example);
    paints.push(colors);
    await block.screenshot({ path: test.info().outputPath(`code-${mode}.png`) });
    await fixture.evaluate((el) => el.remove());
  }
  expect(paints[0], "mode roles must actually recolor highlighted source").not.toEqual(paints[1]);
});

test("highlights each canonical fence, copies its source and keeps scrolling local", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("./#getting-started");
  const blocks = page.locator("#getting-started .canonical-guide .code-block");
  await expect(blocks).toHaveCount(fences.length);
  for (const [index, fence] of fences.entries()) {
    const block = blocks.nth(index);
    const code = block.locator("pre code");
    expect(await code.textContent(), `${fence.language} fence ${index} source`).toBe(fence.code);
    const colors = new Set((await paintedCode(code)).map((leaf) => leaf.color));
    expect(colors.size, `${fence.language} fence ${index} needs painted syntax`).toBeGreaterThan(1);
    expect(
      await minimumCodeContrast(code),
      `${fence.language} fence ${index} text contrast`,
    ).toBeGreaterThanOrEqual(4.5);
    await block
      .getByRole("button", { name: `Copy ${fence.language.toUpperCase()} example` })
      .click();
    expect(
      await page.evaluate(() => navigator.clipboard.readText()),
      `fence ${index} copied bytes`,
    ).toBe(fence.code);
    const box = await block.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
  const scroll = blocks.nth(7).locator("pre");
  await blocks.nth(7).getByRole("button").focus();
  await page.keyboard.press("Tab");
  await expect(scroll).toBeFocused();
  expect(await scroll.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe("solid");
  const widest = await blocks.locator("pre").evaluateAll((elements) =>
    elements.map((el) => ({
      client: el.clientWidth,
      scroll: el.scrollWidth,
      overflow: getComputedStyle(el).overflowX,
    })),
  );
  expect(widest.every((size) => size.overflow === "auto")).toBe(true);
  if (page.viewportSize()!.width === 390)
    expect(
      widest.some((size) => size.scroll > size.client),
      "long code lines must scroll inside their block",
    ).toBe(true);
});

test("gives prose clear hierarchy, readable inline code and a contained table", async ({
  page,
}) => {
  await page.goto("./#supported-stack");
  const guide = page.locator("#getting-started .canonical-guide");
  const heading = guide.getByRole("heading", { name: "Run the starter" });
  const paragraph = guide.locator("p").first();
  expect(await heading.evaluate((el) => getComputedStyle(el).color)).not.toBe(
    await paragraph.evaluate((el) => getComputedStyle(el).color),
  );
  const inline = guide.locator("p code").first();
  expect(await inline.evaluate((el) => getComputedStyle(el).borderTopStyle)).toBe("solid");
  expect(await inline.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(
    await paragraph.evaluate((el) => getComputedStyle(el).backgroundColor),
  );
  const tables = page.locator("#supported-stack table");
  await expect(tables).toHaveCount(2);
  for (const [index, table] of (await tables.all()).entries()) {
    const header = table.locator("th").first();
    const cell = table.locator("td").first();
    expect(
      await header.evaluate((el) => getComputedStyle(el).backgroundColor),
      `supported table ${index + 1} header fill differs from its body`,
    ).not.toBe(await cell.evaluate((el) => getComputedStyle(el).backgroundColor));
    expect(
      await header.evaluate((el) => Number(getComputedStyle(el).fontWeight)),
      `supported table ${index + 1} header weight exceeds its body`,
    ).toBeGreaterThan(await cell.evaluate((el) => Number(getComputedStyle(el).fontWeight)));
  }
  const list = page.locator("#supported-stack ul");
  expect(await list.evaluate((el) => getComputedStyle(el).listStyleType)).toBe("disc");
  expect(
    await list
      .locator("li")
      .first()
      .evaluate((el) => getComputedStyle(el, "::marker").color),
  ).not.toBe(
    await list
      .locator("li")
      .first()
      .evaluate((el) => getComputedStyle(el).color),
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
  for (const [index, table] of (await tables.all()).entries()) {
    await table.scrollIntoViewIfNeeded();
    await page.screenshot({ path: test.info().outputPath(`guide-prose-${index + 1}.png`) });
  }
});

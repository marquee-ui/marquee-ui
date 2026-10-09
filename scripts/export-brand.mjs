/* global document, localStorage, getComputedStyle -- callbacks execute in Chromium */
import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(new URL("../apps/docs/package.json", import.meta.url));
const { chromium } = require("@playwright/test");
const destination = new URL("../brand/", import.meta.url);
mkdirSync(destination, { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 1024 },
    deviceScaleFactor: 1,
  });
  await page.addInitScript(() =>
    localStorage.setItem(
      "marquee-demo-theme-v1",
      JSON.stringify({
        palette: "tide",
        mode: "dark",
        accent: "auto",
        expressive: true,
      }),
    ),
  );
  await page.goto(process.argv[2] ?? "http://localhost:4174/marquee-ui/");
  await page.locator(".site-header .logo-mark").waitFor();
  await page.evaluate(() => document.fonts.ready);
  if (!(await page.evaluate(() => document.fonts.check('24px "Boldonse"')))) {
    throw new Error("The website display font must load before exporting the mark.");
  }
  const mark = await page.locator(".site-header .logo-mark").evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      text: element.textContent,
      css: Array.from(style)
        .map((key) => `${key}:${style.getPropertyValue(key)}`)
        .join(";"),
      size: element.getBoundingClientRect().width,
    };
  });
  for (const size of [512, 1024]) {
    await page.evaluate(
      ({ mark, size }) => {
        document.querySelector("#brand-export")?.remove();
        const frame = document.createElement("div");
        frame.id = "brand-export";
        frame.style.cssText = `position:fixed;inset:0 auto auto 0;width:${size}px;height:${size}px;z-index:1000;overflow:hidden`;
        const logo = document.createElement("span");
        logo.textContent = mark.text;
        logo.style.cssText = mark.css;
        logo.style.transform = `scale(${size / mark.size})`;
        logo.style.transformOrigin = "top left";
        frame.append(logo);
        document.body.append(frame);
      },
      { mark, size },
    );
    await page
      .locator("#brand-export")
      .screenshot({ path: fileURLToPath(new URL(`marquee-tide-${size}.png`, destination)) });
  }
  await page.evaluate((mark) => {
    document.querySelector("#brand-export")?.remove();
    const frame = document.createElement("div");
    frame.id = "brand-export";
    frame.style.cssText =
      "position:fixed;inset:0 auto auto 0;width:1280px;height:640px;z-index:1000;overflow:hidden;background:var(--background);color:var(--foreground);padding:64px;display:flex;flex-direction:column;justify-content:space-between";
    frame.innerHTML = `<div style="font:var(--weight-bold) 32px var(--font-body);letter-spacing:-0.04em">marquee <span style="font:16px var(--font-mono);color:var(--muted);letter-spacing:var(--tracking-label)">UI</span></div><div style="font:52px/1.65 var(--font-display);letter-spacing:var(--tracking-display);color:var(--brand-ink)">Compose it<br>your way.</div><div style="font:16px var(--font-mono);color:var(--foreground-2)">REACT PARTS. ONE DESIGN LANGUAGE.</div>`;
    const logo = document.createElement("span");
    logo.textContent = mark.text;
    logo.style.cssText = mark.css;
    logo.style.position = "absolute";
    logo.style.left = "872px";
    logo.style.top = "172px";
    logo.style.transform = `scale(${296 / mark.size})`;
    logo.style.transformOrigin = "top left";
    frame.append(logo);
    document.body.append(frame);
  }, mark);
  await page
    .locator("#brand-export")
    .screenshot({ path: fileURLToPath(new URL("marquee-github-social.png", destination)) });
  console.log(
    `Exported the website's Tide mark and repository preview to ${fileURLToPath(destination)}`,
  );
} finally {
  await browser.close();
}

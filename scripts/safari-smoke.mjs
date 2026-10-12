import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import { promisify } from "node:util";

// Desktop uses SafariDriver; iPhone uses XCTest native input via Appium.
// All component input goes through the driver, never DOM .click().
const mode = process.env.SAFARI_TARGET ?? "desktop";
assert.ok(["desktop", "iphone"].includes(mode), "SAFARI_TARGET must be desktop or iphone");
const endpoint = process.env.WEBDRIVER_URL ?? "http://127.0.0.1:4444";
const base = process.env.SAFARI_BASE_URL ?? "http://127.0.0.1:4177/marquee-ui/";
const output = process.env.SAFARI_RESULTS ?? ".docs-browser-results/safari";
await mkdir(output, { recursive: true });
let session;
const report = { mode, commit: process.env.GITHUB_SHA, checks: [] };
async function request(method, path, body, timeout = 30_000) {
  let response;
  let value;
  try {
    response = await globalThis.fetch(`${endpoint}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: globalThis.AbortSignal.timeout(timeout),
    });
    ({ value } = await response.json());
  } catch (cause) {
    const error = new Error(`WebDriver transport failed: ${method} ${path}`, { cause });
    error.fatalTransport = true;
    throw error;
  }
  assert.ok(response.ok && !value?.error, `${method} ${path}: ${JSON.stringify(value)}`);
  return value;
}
const command = (method, path, body, timeout) =>
  request(method, `/session/${session}${path}`, body, timeout);
const script = (code, ...args) => command("POST", "/execute/sync", { script: code, args });
async function until(code, label, ...args) {
  const end = Date.now() + 20_000;
  while (Date.now() < end) {
    if (await script(code, ...args)) return;
    await delay(100);
  }
  assert.fail(`Timed out: ${label}`);
}
async function element(selector, using = "css selector") {
  const end = Date.now() + 20_000;
  while (Date.now() < end) {
    const elements = await command("POST", "/elements", {
      using,
      value: selector,
    });
    if (elements.length) {
      assert.equal(elements.length, 1, `Unique element: ${selector}`);
      return elements[0];
    }
    await delay(100);
  }
  assert.fail(`Missing element: ${selector}`);
}
const id = (el) => el["element-6066-11e4-a52e-4f735466cecf"];
async function click(el) {
  await script("arguments[0].scrollIntoView({block:'center',inline:'nearest'})", el);
  await command("POST", `/element/${id(el)}/click`, {});
}
async function button(text) {
  const el = await element(`//button[normalize-space(.)=${JSON.stringify(text)}]`, "xpath");
  await click(el);
  return el;
}
async function navigate(path) {
  await command("POST", "/url", { url: new URL(path, base).href });
  await until(
    "return document.readyState === 'complete' && document.fonts.status === 'loaded'",
    "page and bundled fonts load",
  );
}
async function preview(name) {
  await navigate("components/");
  await click(await element(`button[aria-label="Preview ${name}"]`));
}
async function screenshot(name) {
  const encoded = await command("GET", "/screenshot", undefined, 10_000);
  await writeFile(`${output}/${name}.png`, Buffer.from(encoded, "base64"));
}
async function keys(value) {
  await command("POST", "/actions", {
    actions: [
      {
        type: "key",
        id: "keyboard",
        actions: [
          { type: "keyDown", value },
          { type: "keyUp", value },
        ],
      },
    ],
  });
}
async function tap(x, y, origin = "viewport") {
  // Appium translates element-relative web coordinates to native screen points.
  await command("POST", "/actions", {
    actions: [
      {
        type: "pointer",
        id: "pointer",
        parameters: { pointerType: mode === "iphone" ? "touch" : "mouse" },
        actions: [
          {
            type: "pointerMove",
            duration: 0,
            origin,
            x: Math.round(x),
            y: Math.round(y),
          },
          { type: "pointerDown", button: 0 },
          { type: "pause", duration: 100 },
          { type: "pointerUp", button: 0 },
        ],
      },
    ],
  });
}
const checks = [
  [
    "slider-endpoints-and-commit",
    async () => {
      await preview("Slider");
      const thumb = await element('[role="slider"][aria-label="Volume"]');
      const track = await script(
        "return arguments[0].closest('[data-slot=\"slider\"]').querySelector('[data-slot=\"slider-track\"]')",
        thumb,
      );
      for (const value of [0, 100]) {
        await script("arguments[0].scrollIntoView({block:'center'})", track);
        const rect = await script(
          "const r=arguments[0].getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height}",
          track,
        );
        if (mode === "iphone")
          await tap(value ? rect.width / 2 - 1 : -rect.width / 2 + 1, 0, track);
        else await tap(rect.x + (value ? rect.width - 1 : 1), rect.y + rect.height / 2);
        await until(
          "return arguments[0].getAttribute('aria-valuenow') === String(arguments[1])",
          `Slider reaches ${value}`,
          thumb,
          value,
        );
        await until(
          "return document.querySelector('[role=status]').textContent === 'Committed volume: '+arguments[0]+'%'",
          `Slider commits ${value}`,
          value,
        );
        const geometry = await script(
          "const t=arguments[0].getBoundingClientRect(), r=arguments[1].getBoundingClientRect(); return {center:t.x+t.width/2,start:r.x,end:r.right,width:t.width,height:t.height}",
          thumb,
          track,
        );
        assert.ok(
          Math.abs(geometry.center - (value ? geometry.end : geometry.start)) < 1,
          "Visible Slider marker reaches track endpoint",
        );
        assert.ok(
          geometry.width >= 43.999 && geometry.height >= 43.999,
          "Slider has a 44px target",
        );
      }
      await button("Save playback");
      await until(
        "return document.body.textContent.includes('Saved volume: 100; range: 20–80.')",
        "Slider submits accepted value",
      );
      await button("Reset playback");
      await until(
        "return arguments[0].getAttribute('aria-valuenow') === '40'",
        "Slider reset",
        thumb,
      );
    },
  ],
  [
    "calendar-selection-and-layout",
    async () => {
      await preview("Calendar");
      const region = 'section[aria-labelledby="calendar-single-title"]';
      const day = await element(`${region} button[aria-label*="October 31st, 2026"]`);
      await click(day);
      await until(
        "return document.querySelector(arguments[0]).textContent.includes('Selected day: 31')",
        "Calendar selects day",
        region,
      );
      assert.ok(
        await script(
          "const r=arguments[0].getBoundingClientRect(); return r.width >= 43.999 && r.height >= 43.999",
          day,
        ),
        "Calendar day has a 44px target",
      );
      assert.ok(
        await script("return document.documentElement.scrollWidth <= innerWidth"),
        "Calendar does not overflow the page",
      );
      await click(await element(`${region} button[aria-label="Go to the Next Month"]`));
      await element(`${region} [role="grid"][aria-label="November 2026"]`);
    },
  ],
  [
    "combobox-selection-and-form",
    async () => {
      await preview("Combobox");
      const trigger = await element('[data-combobox-demo] [data-slot="combobox-trigger"]');
      await click(trigger);
      await click(await element('[role="option"][data-value="french"]'));
      await until(
        "return arguments[0].textContent.includes('French') && !document.querySelector('[role=listbox]')",
        "Combobox commits and closes",
        trigger,
      );
      await button("Save language");
      await until(
        "return document.querySelector('[data-combobox-demo] [role=status]').textContent === 'Saved language: french.'",
        "Combobox form value",
      );
    },
  ],
  [
    "nested-dialog-dismissal-and-focus",
    async () => {
      await navigate(
        "storybook/iframe.html?id=parts-dialog--nested-sheet&viewMode=story&embed=true",
      );
      const outside = await button("Open parent sheet");
      const trigger = await button("Open project dialog");
      await until(
        "return getComputedStyle(document.querySelector('[data-slot=sheet-content]')).pointerEvents === 'none'",
        "Parent becomes inert",
      );
      await element('[data-slot="dialog-content"]');
      if (mode === "iphone")
        await click(await element('[data-slot="dialog-content"] [data-slot="dialog-close"]'));
      else await keys("\uE00C");
      await until(
        "return !document.querySelector('[data-slot=dialog-content]') && document.querySelector('[data-slot=sheet-content]') && document.activeElement === arguments[0]",
        "Dismissal closes only child and restores focus",
        trigger,
      );
      if (mode === "iphone") await button("Close sheet");
      else await keys("\uE00C");
      await until(
        "return !document.querySelector('[data-slot=sheet-content]') && document.activeElement === arguments[0] && getComputedStyle(document.body).pointerEvents !== 'none'",
        "Second dismissal closes parent and unlocks page",
        outside,
      );
    },
  ],
  [
    "modal-scroll-reachability",
    async () => {
      await navigate(
        "storybook/iframe.html?id=parts-dialog--tall-content&viewMode=story&embed=true",
      );
      const panel = await element('[data-slot="dialog-content"]');
      assert.ok(
        await script(
          "const r=arguments[0].getBoundingClientRect(); return r.top >= 15 && r.left >= 15 && r.bottom <= innerHeight-15 && r.right <= innerWidth-15 && arguments[0].scrollHeight > arguments[0].clientHeight",
          panel,
        ),
        "Long dialog is bounded and internally scrollable",
      );
      const finish = await element('//button[normalize-space(.)="Finish reading"]', "xpath");
      await script("arguments[0].scrollIntoView({block:'center'})", finish);
      assert.ok(
        await script("return arguments[0].scrollTop > 0", panel),
        "Final action needs panel scrolling",
      );
      await screenshot("modal-scrolled");
      await click(finish);
      await until(
        "return !document.querySelector('[data-slot=dialog-content]')",
        "Scrolled final action closes dialog",
      );
    },
  ],
];
try {
  const capabilities = {
    browserName: "Safari",
    platformName: mode === "iphone" ? "iOS" : "macOS",
  };
  if (mode === "iphone") {
    assert.ok(process.env.SAFARI_DEVICE_UDID, "SAFARI_DEVICE_UDID identifies the booted simulator");
    Object.assign(capabilities, {
      "appium:automationName": "XCUITest",
      "appium:udid": process.env.SAFARI_DEVICE_UDID,
      "appium:platformVersion": "26.2",
      "appium:nativeWebTap": true,
      "appium:nativeWebTapStrict": true,
      "appium:safariInitialUrl": base,
      "appium:showXcodeLog": true,
      "appium:wdaLaunchTimeout": 120_000,
      "appium:wdaConnectionTimeout": 30_000,
    });
  }
  const created = await request(
    "POST",
    "/session",
    {
      capabilities: { alwaysMatch: capabilities },
    },
    mode === "iphone" ? 300_000 : 90_000,
  );
  session = created.sessionId;
  report.capabilities = created.capabilities;
  await writeFile(`${output}/results.json`, JSON.stringify(report, null, 2) + "\n");
  assert.match(created.capabilities.browserName, /^safari$/i, "Actual Safari is required");
  assert.match(
    created.capabilities.platformName,
    mode === "iphone" ? /^ios$/i : /^mac(os| os x)?$/i,
  );
  if (mode === "iphone") {
    const caps = created.capabilities;
    assert.equal(caps["appium:udid"] ?? caps.udid, process.env.SAFARI_DEVICE_UDID);
    assert.equal(caps["appium:nativeWebTap"] ?? caps.nativeWebTap, true);
    assert.equal(caps["appium:platformVersion"] ?? caps.platformVersion, "26.2");
    report.phase = "safari-setup";
    const context = await command("GET", "/context");
    await command("POST", "/context", { name: "NATIVE_APP" });
    await writeFile(`${output}/safari-setup.xml`, await command("GET", "/source"));
    // Only browser onboarding is present here; no component journey has started.
    for (let attempt = 0; attempt < 4; attempt++) {
      const close = await command("POST", "/elements", {
        using: "-ios predicate string",
        value:
          'type == "XCUIElementTypeButton" AND (label == "Close" OR label == "Close tip" OR label == "Dismiss")',
      });
      if (!close.length) break;
      assert.equal(close.length, 1, "Unique Safari tutorial dismissal");
      await command("POST", `/element/${id(close[0])}/click`, {});
    }
    await command("POST", "/context", { name: context });
    report.userAgent = await script("return navigator.userAgent");
    assert.match(report.userAgent, /iPhone.*Safari/);
  } else await command("POST", "/window/rect", { width: 1280, height: 900 });
  console.log("SAFARI_SESSION", JSON.stringify(created.capabilities));
  report.phase = "driver-preflight";
  console.log("START driver-preflight");
  await navigate(
    "data:text/html," +
      encodeURIComponent(
        '<meta name="viewport" content="width=device-width,initial-scale=1"><button style="margin:60px;padding:30px" onclick="document.querySelector(\'output\').textContent=event.isTrusted ? \'ready\' : \'untrusted\'">Driver probe</button><output>waiting</output>',
      ),
  );
  await button("Driver probe");
  await until(
    "return document.querySelector('output').textContent === 'ready'",
    "Trusted native Safari click completes on plain HTML",
  );
  report.preflightPassed = true;
  console.log("PASS driver-preflight");
  for (const [name, run] of checks) {
    try {
      report.phase = name;
      console.log("START", name);
      await run();
      await screenshot(name);
      report.checks.push({ name, passed: true });
      console.log("PASS", name);
    } catch (error) {
      report.checks.push({
        name,
        passed: false,
        error: String(error.stack ?? error),
      });
      console.error("FAIL", name, error);
      // A dead driver cannot supply diagnostics or run the remaining journeys.
      // Preserve the failure now instead of repeatedly waiting on that session.
      if (error.fatalTransport) break;
      await screenshot(`${name}-failure`).catch(() => {});
      await command("GET", "/source", undefined, 10_000)
        .then((source) => writeFile(`${output}/${name}-failure.html`, source))
        .catch(() => {});
    } finally {
      await writeFile(`${output}/results.json`, JSON.stringify(report, null, 2) + "\n");
    }
  }
  assert.equal(
    report.checks.filter((check) => !check.passed).length,
    0,
    "Every Safari smoke check must pass",
  );
} catch (error) {
  report.error = String(error.stack ?? error);
  process.exitCode = 1;
  console.error(error);
  if (mode === "iphone" && process.env.SAFARI_DEVICE_UDID)
    await promisify(execFile)(
      "xcrun",
      [
        "simctl",
        "io",
        process.env.SAFARI_DEVICE_UDID,
        "screenshot",
        `${output}/failure-before-teardown.png`,
      ],
      { timeout: 10_000 },
    ).catch((captureError) => console.error(captureError));
} finally {
  if (session)
    await command("DELETE", "", undefined, mode === "iphone" ? 30_000 : 5_000).catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
  await writeFile(`${output}/results.json`, JSON.stringify(report, null, 2) + "\n");
}

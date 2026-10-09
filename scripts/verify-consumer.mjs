import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { cp, lstat, mkdir, readFile, realpath, writeFile } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRegistryServer } from "../examples/consumer/registry.mjs";

const repo = fileURLToPath(new URL("../", import.meta.url));
const pins = { "@marquee-ui/ui": "0.1.10", "@marquee-ui/tokens": "0.1.0" };

export function verifyLock(lock, published) {
  for (const [name, artifact] of Object.entries(published)) {
    const entry = lock.packages?.[`node_modules/${name}`];
    assert.ok(entry, `Missing npm lock entry: ${name}`);
    assert.ok(
      !entry.link &&
        entry.version === artifact.version &&
        entry.resolved === artifact.tarball &&
        entry.integrity === artifact.integrity,
      `Published artifact mismatch: ${name}`,
    );
  }
  return published;
}

export async function assertExternalTarget(checkout, requested) {
  const checkoutRoot = await realpath(checkout);
  const target = join(await realpath(dirname(resolve(requested))), basename(resolve(requested)));
  const pathFromCheckout = relative(checkoutRoot, target);
  assert.ok(
    pathFromCheckout && (pathFromCheckout.startsWith("../") || isAbsolute(pathFromCheckout)),
    "Consumer target must be outside the checkout",
  );
  await assert.rejects(lstat(target), { code: "ENOENT" }, "Consumer target must not already exist");
  return target;
}

async function run(command, args, cwd, env, capture = false) {
  console.log(`> ${command} ${args.join(" ")}`);
  const child = spawn(command, args, {
    cwd,
    env,
    stdio: capture ? "pipe" : "inherit",
  });
  let stdout = "";
  let stderr = "";
  if (capture) {
    child.stdout.setEncoding("utf8").on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.setEncoding("utf8").on("data", (chunk) => {
      stderr += chunk;
    });
  }
  const [status] = await once(child, "exit");
  assert.equal(status, 0, `${command} exited ${status}\n${stderr}`);
  return stdout;
}

async function main() {
  assert.ok(process.argv[2], "Usage: node scripts/verify-consumer.mjs <new external directory>");
  const target = await assertExternalTarget(repo, process.argv[2]);
  const template = join(repo, "examples/consumer");
  // Copy only starter sources: no ignored dependencies, cached downloads or generated copies.
  for (const file of [
    "package.json",
    "package-lock.json",
    "components.json",
    "tsconfig.json",
    "vite.config.ts",
    "index.html",
    "registry.mjs",
    "playwright.config.ts",
    "src/App.tsx",
    "src/main.tsx",
    "src/index.css",
    "tests/consumer.spec.ts",
    "README.md",
    ".gitignore",
  ]) {
    await mkdir(dirname(join(target, file)), { recursive: true });
    await cp(join(template, file), join(target, file));
  }
  const env = { ...process.env, npm_config_cache: join(target, ".npm-cache") };
  const published = {};
  for (const [name, version] of Object.entries(pins)) {
    const metadata = JSON.parse(
      await run(
        "npm",
        ["view", `${name}@${version}`, "--json", "--registry=https://registry.npmjs.org"],
        target,
        env,
        true,
      ),
    );
    published[name] = {
      version: metadata.version,
      tarball: metadata.dist.tarball,
      integrity: metadata.dist.integrity,
    };
  }
  verifyLock(JSON.parse(await readFile(join(target, "package-lock.json"), "utf8")), published);
  await run(
    "npm",
    ["ci", "--registry=https://registry.npmjs.org", "--no-audit", "--no-fund"],
    target,
    env,
  );
  const lock = JSON.parse(await readFile(join(target, "package-lock.json"), "utf8"));
  verifyLock(lock, published);
  for (const [name, version] of Object.entries(pins)) {
    const installed = join(target, "node_modules", name);
    assert.equal((await lstat(installed)).isSymbolicLink(), false, `${name} must not be a link`);
    assert.equal(await realpath(installed), installed, `${name} must resolve inside this consumer`);
    assert.equal(
      JSON.parse(await readFile(join(installed, "package.json"), "utf8")).version,
      version,
    );
  }
  const registryPort = Number(process.env.CONSUMER_REGISTRY_PORT ?? 4186);
  const componentsPath = join(target, "components.json");
  const config = JSON.parse(await readFile(componentsPath, "utf8"));
  config.registries["@marquee"] = `http://127.0.0.1:${registryPort}/{name}.json`;
  await writeFile(componentsPath, `${JSON.stringify(config, null, 2)}\n`);
  const server = createRegistryServer(join(target, "node_modules/@marquee-ui/ui/r"));
  server.listen(registryPort, "127.0.0.1");
  await once(server, "listening");
  try {
    await run("npm", ["run", "add:components"], target, env);
  } finally {
    await new Promise((done, fail) => server.close((error) => (error ? fail(error) : done())));
  }
  for (const name of [
    "utils",
    "button",
    "accordion",
    "sheet",
    "switch",
    "input",
    "label",
    "card",
  ]) {
    const item = JSON.parse(
      await readFile(join(target, "node_modules/@marquee-ui/ui/r", `${name}.json`), "utf8"),
    );
    for (const file of item.files) {
      const copied = await readFile(join(target, "src", file.target), "utf8");
      assert.equal(copied.trim(), file.content.trim(), `Registry bytes differ for ${file.target}`);
    }
  }
  await run("npm", ["run", "build"], target, env);
  await run("npm", ["exec", "--", "playwright", "install", "chromium"], target, env);
  await run("npm", ["run", "proof"], target, env);
  await mkdir(join(target, "proof"), { recursive: true });
  await writeFile(
    join(target, "proof/provenance.json"),
    `${JSON.stringify({ measuredAt: new Date().toISOString(), published, consumer: target, node: process.version }, null, 2)}\n`,
  );
  console.log(`Cold published consumer verified: ${target}\nEvidence: ${join(target, "proof")}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}

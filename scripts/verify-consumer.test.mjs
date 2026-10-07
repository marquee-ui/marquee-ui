import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { once } from "node:events";
import { request } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { assertExternalTarget, verifyLock } from "./verify-consumer.mjs";
import { createRegistryServer, registryItemPath } from "../examples/consumer/registry.mjs";

test("registry item paths reject traversal and unrelated files", () => {
  assert.equal(registryItemPath("/button.json"), "button.json");
  assert.equal(registryItemPath("/radio-group.json"), "radio-group.json");
  for (const pathname of [
    "/../package.json",
    "/fonts.css",
    "/r/button.json",
    "/%2e%2e/package.json",
    "/button.json?path=../secret",
  ]) {
    assert.equal(registryItemPath(pathname), null);
  }
});

function registryResponse(port, path, method = "GET") {
  return new Promise((resolve, reject) => {
    const outgoing = request({ hostname: "127.0.0.1", port, path, method }, (incoming) => {
      let body = "";
      incoming.setEncoding("utf8");
      incoming.on("data", (chunk) => {
        body += chunk;
      });
      incoming.on("error", reject);
      incoming.on("end", () =>
        resolve({
          status: incoming.statusCode,
          contentType: incoming.headers["content-type"],
          body,
        }),
      );
    });
    outgoing.on("error", reject);
    outgoing.end();
  });
}

test("installed registry serves exact JSON over HTTP and rejects missing, traversal and POST requests", async () => {
  const root = await mkdtemp(join(tmpdir(), "marquee-registry-unit-"));
  const contents = JSON.stringify({
    name: "button",
    files: [{ content: "export const Button = 1;" }],
  });
  await writeFile(join(root, "button.json"), contents);
  const server = createRegistryServer(root);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    assert.deepEqual(await registryResponse(address.port, "/button.json"), {
      status: 200,
      contentType: "application/json",
      body: contents,
    });
    for (const [path, method] of [
      ["/missing.json", "GET"],
      ["/../button.json", "GET"],
      ["/%2e%2e/button.json", "GET"],
      ["/button.json", "POST"],
    ]) {
      assert.equal((await registryResponse(address.port, path, method)).status, 404);
    }
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    await rm(root, { recursive: true, force: true });
  }
});

const published = {
  "@marquee-ui/ui": {
    version: "0.1.10",
    tarball: "https://registry.npmjs.org/@marquee-ui/ui/-/ui-0.1.10.tgz",
    integrity: "sha512-ui-proof",
  },
  "@marquee-ui/tokens": {
    version: "0.1.0",
    tarball: "https://registry.npmjs.org/@marquee-ui/tokens/-/tokens-0.1.0.tgz",
    integrity: "sha512-tokens-proof",
  },
};

function lock() {
  return {
    packages: Object.fromEntries(
      Object.entries(published).map(([name, artifact]) => [
        `node_modules/${name}`,
        {
          version: artifact.version,
          resolved: artifact.tarball,
          integrity: artifact.integrity,
        },
      ]),
    ),
  };
}

test("accepts the exact registry tarballs and their live integrity metadata", () => {
  assert.deepEqual(verifyLock(lock(), published), published);
});

test("rejects missing, substituted, linked, wrong-version and wrong-integrity packages", () => {
  for (const name of Object.keys(published)) {
    const missing = lock();
    delete missing.packages[`node_modules/${name}`];
    assert.throws(() => verifyLock(missing, published), /Missing npm lock entry/);
    for (const bad of [
      { resolved: "file:../../packages/ui" },
      { resolved: "https://example.org/substitute.tgz" },
      { version: "0.0.0" },
      { integrity: "sha512-substitute" },
      { link: true },
    ]) {
      const substituted = lock();
      Object.assign(substituted.packages[`node_modules/${name}`], bad);
      assert.throws(() => verifyLock(substituted, published), /Published artifact mismatch/);
    }
  }
});

test("requires a new target outside the checkout, including through symlinked parents", async () => {
  const root = await mkdtemp(join(tmpdir(), "marquee-consumer-unit-"));
  try {
    const repo = join(root, "repo");
    await mkdir(repo);
    const target = join(root, "new-consumer");
    assert.equal(await assertExternalTarget(repo, target), target);
    await assert.rejects(assertExternalTarget(repo, join(repo, "nested")), /outside the checkout/);
    await assert.rejects(assertExternalTarget(repo, repo), /outside the checkout/);
    await mkdir(target);
    await assert.rejects(assertExternalTarget(repo, target), /must not already exist/);
    const linked = join(root, "linked-repo");
    await symlink(repo, linked);
    await assert.rejects(
      assertExternalTarget(repo, join(linked, "nested")),
      /outside the checkout/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

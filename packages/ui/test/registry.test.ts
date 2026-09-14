import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The shadcn registry, and the reason it is COMMITTED rather than built on demand.
 *
 * Two consumers have to be able to read it:
 *   1. anyone, over the network, from raw GitHub;
 *   2. a CI job with NO network at all, from inside an installed package - which
 *      is the reference consumer's constraint, because its drift check
 *      (`shadcn diff`) has to read this registry on a runner that makes no
 *      external calls.
 * One built directory satisfies both: it lives inside the package's `files`, so
 * it is in `node_modules` after an install, and it is committed, so it has a raw
 * URL. There is exactly one copy, so the two cannot drift apart.
 *
 * A committed build artefact rots the moment a source changes, so the checks
 * below compare the built JSON against the sources byte for byte rather than
 * trusting that someone re-ran the build.
 */

const root = process.cwd();
const registryPath = resolve(root, "registry.json");
const outDir = resolve(root, "packages/ui/r");

type RegistryFile = { path: string; type: string; target?: string; content?: string };
type RegistryItem = {
  name: string;
  type: string;
  title?: string;
  description?: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files: RegistryFile[];
};

const registry = JSON.parse(readFileSync(registryPath, "utf8")) as {
  name: string;
  items: RegistryItem[];
};
const built = (name: string): RegistryItem =>
  JSON.parse(readFileSync(resolve(outDir, `${name}.json`), "utf8")) as RegistryItem;

const uiPkg = JSON.parse(readFileSync(resolve(root, "packages/ui/package.json"), "utf8")) as {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  files: string[];
  exports: Record<string, unknown>;
};
/**
 * RUNTIME dependencies, deliberately not the dev ones. Every package a registry item
 * tells a consumer to install is a package this one imports at runtime, so it belongs
 * in `dependencies` - it was in `devDependencies` at first, and validating the ranges
 * against THAT list is what made the mistake look correct.
 */
const uiDeps = uiPkg.dependencies;

describe("registry.json", () => {
  it("declares the ten part families plus the one shared lib", () => {
    // Anchor: every loop below is vacuous against an empty item list.
    expect(registry.items.map((item) => item.name).sort()).toEqual([
      "accordion",
      "badge",
      "button",
      "card",
      "input",
      "label",
      "ribbon",
      "separator",
      "sheet",
      "toast",
      "utils",
    ]);
  });

  it("points every file at a path that exists", () => {
    for (const item of registry.items) {
      expect(item.files.length, item.name).toBeGreaterThan(0);
      for (const file of item.files) {
        expect(existsSync(resolve(root, file.path)), `${item.name}: ${file.path}`).toBe(true);
      }
    }
  });

  it("registers every component source exactly once", () => {
    // The failure this catches: a new part that ships in the package and is
    // simply never installable, because nobody remembered the registry.
    const sources = readdirSync(resolve(root, "packages/ui/src"))
      .filter((name) => name.endsWith(".tsx") || name.endsWith(".css"))
      .sort();
    const registered = registry.items
      .flatMap((item) => item.files.map((file) => file.path))
      .filter((path) => path.startsWith("packages/ui/src/") && !path.includes("/lib/"))
      .map((path) => path.slice("packages/ui/src/".length))
      .sort();
    expect(registered).toEqual(sources);
    expect(new Set(registered).size).toBe(registered.length);
  });

  it("targets the consumer's own component directory, not the library's layout", () => {
    // Measured, not assumed: with no `target`, shadcn 4.21 keeps the tail of the
    // library path and writes `components/ui/src/button.tsx`.
    for (const item of registry.items) {
      for (const file of item.files) {
        const basename = file.path.split("/").pop()!;
        const expected =
          file.type === "registry:lib" ? `lib/${basename}` : `components/ui/${basename}`;
        expect(file.target, `${item.name}: ${file.path}`).toBe(expected);
      }
    }
  });

  it("declares npm dependencies at the versions the package itself builds against", () => {
    let checked = 0;
    for (const item of registry.items) {
      for (const dependency of item.dependencies ?? []) {
        const at = dependency.lastIndexOf("@");
        const name = dependency.slice(0, at);
        const range = dependency.slice(at + 1);
        expect(uiDeps[name], `${item.name}: ${name} is not a dependency of @marquee-ui/ui`).toBe(
          range,
        );
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(5);
  });

  it("resolves every registry dependency inside this registry", () => {
    const names = new Set(registry.items.map((item) => item.name));
    let checked = 0;
    for (const item of registry.items) {
      for (const dependency of item.registryDependencies ?? []) {
        // `@marquee/x` is this registry's own namespace; a bare name would
        // resolve against shadcn's public registry instead.
        expect(dependency.startsWith("@marquee/"), `${item.name}: ${dependency}`).toBe(true);
        expect(names.has(dependency.slice("@marquee/".length))).toBe(true);
        checked++;
      }
    }
    expect(checked).toBe(10);
  });

  it("keeps no stylesheet's first token a comment", () => {
    // MEASURED: `shadcn add` strips a LEADING comment block from a stylesheet as
    // a banner, so a css file that opens with one lands in the consumer already
    // different from the registry, and a `shadcn diff` drift check reports that
    // difference forever. Every other comment in the file survives.
    for (const item of registry.items) {
      for (const file of item.files.filter((f) => f.path.endsWith(".css"))) {
        const text = readFileSync(resolve(root, file.path), "utf8").trimStart();
        expect(text.startsWith("/*"), `${file.path} opens with a comment`).toBe(false);
      }
    }
  });
});

describe("the built registry in packages/ui/r", () => {
  it("has one file per item and nothing else", () => {
    expect(readdirSync(outDir).sort()).toEqual(
      [...registry.items.map((item) => `${item.name}.json`), "registry.json"].sort(),
    );
  });

  it("ships an INDEX that is the root registry, byte for byte", () => {
    // The shipped `r/registry.json` is what an agent or a consumer reads to find out
    // what this registry contains, and nothing looked at its contents: setting its
    // `name` to `marquee-ui-STALE`, or its `items` to `[]`, was green. It is a copy
    // of the root file, so the honest assertion is that it is the SAME file.
    const shipped = readFileSync(resolve(outDir, "registry.json"), "utf8");
    expect(shipped).toBe(readFileSync(registryPath, "utf8"));
  });

  it("advertises every item in that index, with its files", () => {
    // …and a byte-compare of two identical mistakes would still pass, so the index
    // is also read as data.
    const shipped = JSON.parse(readFileSync(resolve(outDir, "registry.json"), "utf8")) as {
      name: string;
      items: RegistryItem[];
    };
    expect(shipped.name).toBe("marquee-ui");
    expect(shipped.items.map((item) => item.name).sort()).toEqual(
      registry.items.map((item) => item.name).sort(),
    );
    for (const item of shipped.items) {
      expect(item.files.length, item.name).toBeGreaterThan(0);
      for (const file of item.files) {
        expect(existsSync(resolve(root, file.path)), `${item.name}: ${file.path}`).toBe(true);
      }
    }
  });

  it("carries the CURRENT bytes of every source it ships", () => {
    // The check that makes a committed build artefact safe: if a component
    // changed and nobody re-ran `pnpm build`, this is red.
    let compared = 0;
    for (const item of registry.items) {
      const output = built(item.name);
      expect(output.name).toBe(item.name);
      expect(output.files.length).toBe(item.files.length);
      for (const file of output.files) {
        expect(file.content, `${item.name}: ${file.path} has no content`).toBeTypeOf("string");
        expect(file.content, `${item.name}: ${file.path} is stale`).toBe(
          readFileSync(resolve(root, file.path), "utf8"),
        );
        compared++;
      }
    }
    expect(compared).toBe(12);
  });

  it("carries the title, description and both dependency lists into the item file", () => {
    for (const item of registry.items) {
      const output = built(item.name);
      expect(output.title, item.name).toBe(item.title);
      expect(output.description, item.name).toBe(item.description);
      expect(output.dependencies ?? [], item.name).toEqual(item.dependencies ?? []);
      expect(output.registryDependencies ?? [], item.name).toEqual(item.registryDependencies ?? []);
    }
  });

  it("is inside the package's published files, so it installs with no network", () => {
    expect(uiPkg.files).toContain("r");
    expect(uiPkg.exports["./r/*"]).toBe("./r/*");
  });

  it("declares as RUNTIME dependencies everything the shipped sources import", () => {
    // The package advertises `exports["."]`, so an installed copy has to resolve
    // every bare import in `src/`. A devDependency does not install for a consumer.
    const imported = new Set<string>();
    for (const item of registry.items) {
      for (const file of item.files.filter(
        (f) => f.path.endsWith(".tsx") || f.path.endsWith(".ts"),
      )) {
        const text = readFileSync(resolve(root, file.path), "utf8");
        for (const match of text.matchAll(/from "([^".][^"]*)"/g)) {
          const specifier = match[1]!;
          if (specifier.startsWith("@/") || specifier.startsWith(".")) continue;
          const name = specifier.startsWith("@")
            ? specifier.split("/").slice(0, 2).join("/")
            : specifier.split("/")[0]!;
          imported.add(name);
        }
      }
    }
    expect(imported.size).toBeGreaterThan(4);
    const peers = new Set(["react", "react-dom"]);
    const missing = [...imported].filter((name) => !(name in uiDeps) && !peers.has(name));
    expect(missing, "imported at runtime but not a dependency or a peer").toEqual([]);
  });
});

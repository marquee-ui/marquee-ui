import { existsSync, readFileSync, readdirSync } from "node:fs";
import { posix, resolve } from "node:path";
import ts from "typescript";
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
  peerDependencies: Record<string, string>;
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
/** The packages a consumer brings itself, which no item declares and every check skips. */
const peers: ReadonlySet<string> = new Set(Object.keys(uiPkg.peerDependencies));

/**
 * A declared dependency's package name, its `@<range>` stripped:
 * `@radix-ui/react-slot@^1.3.3` → `@radix-ui/react-slot`. One with no range is its own
 * name (a scoped name's leading `@` is not a range), and the range check reddens it
 * for the missing range (layer 1 r5 LOW-8: the first edition cut its last letter).
 */
const packageName = (dependency: string): string => {
  const at = dependency.lastIndexOf("@");
  return at > 0 ? dependency.slice(0, at) : dependency;
};

/** One source file of an item: its path, which decides how it is parsed, and its text. */
type Source = { path: string; text: string };

/**
 * Every module specifier a source names, in source order. The ONE walk all three
 * dependency checks stand on: `bareImports` below for the per-item arm and the union
 * check, `registryImports` for the registry-dependencies check.
 *
 * Read through the TypeScript scanner, as `forced-colors-state.test.tsx` reads its
 * literals, at exactly four positions: an import's specifier (`import … from "x"`
 * and the side-effect `import "x"`), a re-export's (`export … from "x"`), and a
 * dynamic `import("x")` whose FIRST argument is a string literal. So a comment or a
 * string that spells an import is never read as one. A `.ts` file is parsed as
 * TypeScript and a `.tsx` as TSX, because each parser misreads the other's file and
 * loses every import after the misread: an angle-bracket assertion in a `.ts` is an
 * unclosed element to TSX, and a backtick in a `.tsx`'s JSX text opens a template to TS.
 * ⚠️ NOT read, and in no part source today: `import("x")` with a computed argument
 * (unknowable), `import x = require("x")`, a `require("x")` call, and a type-position
 * `typeof import("x")`.
 */
const specifiersOf = ({ path, text }: Source): string[] => {
  const specifiers: string[] = [];
  const visit = (node: ts.Node): void => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      specifiers.push(node.moduleSpecifier.text);
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments[0] !== undefined &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      specifiers.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  };
  visit(ts.createSourceFile(path, text, ts.ScriptTarget.Latest));
  return specifiers;
};

/**
 * Every bare package a source imports: `@/…` and `./…` are the item's own registry, a
 * scoped name is its first two segments, any other its first.
 */
const bareImports = (source: Source): string[] =>
  specifiersOf(source)
    .filter((specifier) => !specifier.startsWith("@/") && !specifier.startsWith("."))
    .map((specifier) =>
      specifier.startsWith("@")
        ? specifier.split("/").slice(0, 2).join("/")
        : specifier.split("/")[0]!,
    );

/** Every file the registry ships, to the item that ships it. */
const shippedBy: ReadonlyMap<string, string> = new Map(
  registry.items.flatMap((item) => item.files.map((file) => [file.path, item.name] as const)),
);

/**
 * The registry items a source's imports require, for the item `own` it belongs to.
 * Each specifier is resolved to the FILE a consumer's `shadcn add` copy needs: a
 * relative one (`./x`, `../x`) against the source's own directory, and `@/lib/…`
 * against `packages/ui/src/lib/`, trying the name as written and with `.tsx` / `.ts`
 * (a `.js` suffix read as the TypeScript file it compiles from). The item that ships
 * that file is required, as `@marquee/<item>`.
 *
 * ONE rule for a sibling that is not a part: a file the source's OWN item ships is
 * never a dependency. That is `ribbon.tsx`'s `import "./ribbon.css"`, a file of the
 * `ribbon` item itself. A file NO item ships reads as `unshipped <specifier>`, which
 * no item can declare, so the check reddens naming it; so does any `@/…` outside
 * `@/lib/`, because this reader resolves no other alias path (the items target only
 * `components/ui/` and `lib/`). A bare package is `bareImports`' to read. (DL27 layer
 * 1 r5 MED-2: a `.css` rule and an item-names rule each passed a part that imports a
 * file its consumer never receives; this rule reddens each such shape r5 ran.)
 */
const registryImports = (source: Source, own: string): string[] =>
  specifiersOf(source).flatMap((specifier) => {
    if (!specifier.startsWith(".") && !specifier.startsWith("@/")) return [];
    const base = specifier.startsWith(".")
      ? posix.join(posix.dirname(source.path), specifier)
      : specifier.startsWith("@/lib/")
        ? `packages/ui/src/${specifier.slice(2)}`
        : undefined;
    const stem = base?.replace(/\.js$/, "");
    const owner =
      stem === undefined
        ? undefined
        : [stem, `${stem}.tsx`, `${stem}.ts`].map((path) => shippedBy.get(path)).find(Boolean);
    if (owner === own) return [];
    return [owner === undefined ? `unshipped ${specifier}` : `@marquee/${owner}`];
  });

/**
 * What an item's `registryDependencies` get wrong against its OWN sources, one line
 * per name: a required item it does not declare (a consumer's copy imports a file it
 * never receives), and a declared item none of its files imports.
 */
const registryDrift = (
  name: string,
  declared: readonly string[],
  sources: readonly Source[],
): string[] => {
  const required = new Set(sources.flatMap((source) => registryImports(source, name)));
  const names = new Set(declared);
  return [
    ...[...required]
      .filter((n) => !names.has(n))
      .map((n) => `${name}: imports ${n} and does not declare it`),
    ...[...names]
      .filter((n) => !required.has(n))
      .map((n) => `${name}: declares ${n} and does not import it`),
  ];
};

/** An item's `.ts` / `.tsx` files. */
const sourcesOf = (item: RegistryItem): Source[] =>
  item.files
    .filter((f) => /\.tsx?$/.test(f.path))
    .map((f) => ({ path: f.path, text: readFileSync(resolve(root, f.path), "utf8") }));

/** A text written in a test, read as a `.tsx` part. */
const part = (text: string): Source => ({ path: "part.tsx", text });

/**
 * What an item's `dependencies` get wrong against its OWN sources, one line per
 * package, naming the item: a bare import it does not declare (a `shadcn add`
 * consumer without the package gets an import that resolves to nothing), and a
 * declared package none of its files imports (a consumer installs it for nothing).
 * A `peer` is the consumer's own and is never an item's to declare.
 */
const dependencyDrift = (
  name: string,
  declared: readonly string[],
  sources: readonly Source[],
  peers: ReadonlySet<string>,
): string[] => {
  const imported = new Set(sources.flatMap(bareImports).filter((n) => !peers.has(n)));
  const names = new Set(declared.map(packageName));
  return [
    ...[...imported]
      .filter((n) => !names.has(n))
      .map((n) => `${name}: imports ${n} and does not declare it`),
    ...[...names]
      .filter((n) => !imported.has(n))
      .map((n) => `${name}: declares ${n} and does not import it as a dependency`),
  ];
};

describe("registry.json", () => {
  it("declares the thirty-four part families plus the one shared lib", () => {
    // Anchor: every loop below is vacuous against an empty item list.
    expect(registry.items.map((item) => item.name).sort()).toEqual([
      "accordion",
      "alert",
      "alert-dialog",
      "avatar",
      "badge",
      "breadcrumb",
      "button",
      "calendar",
      "card",
      "checkbox",
      "combobox",
      "data-table",
      "date-picker",
      "description-list",
      "dialog",
      "dropdown-menu",
      "form",
      "input",
      "label",
      "pagination",
      "popover",
      "radio-group",
      "ribbon",
      "select",
      "separator",
      "sheet",
      "slider",
      "switch",
      "table",
      "tabs",
      "textarea",
      "toast",
      "toggle",
      "tooltip",
      "utils",
    ]);
  });

  it("types every item by where its files live: a part is registry:ui, the shared lib registry:lib", () => {
    // Nothing read an item's `type` (DL20 layer 1, LOW-5: `toggle` retyped
    // `registry:component` was GREEN). A consumer that counted `registry:ui`
    // items would need this; thepile's drift check counts every item today
    // (DL20 layer 2 LOW-1). Derived from each item's own file paths, not a list.
    for (const item of registry.items) {
      const lib = item.files.every((file) => file.path.startsWith("packages/ui/src/lib/"));
      expect(item.type, item.name).toBe(lib ? "registry:lib" : "registry:ui");
      for (const file of item.files)
        expect(file.type, `${item.name}: ${file.path}`).toBe(item.type);
    }
    expect(
      registry.items.filter((item) => item.type === "registry:lib").map((item) => item.name),
      "the one shared lib",
    ).toEqual(["utils"]);
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
        const name = packageName(dependency);
        const range = dependency.slice(name.length + 1);
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
    expect(checked).toBe(40);
  });

  it("declares exactly the registry dependencies its sources import", () => {
    // The count above cannot say WHICH: swapping `textarea`'s `@marquee/input` for
    // `@marquee/label` was GREEN, and a consumer's `shadcn add textarea` would then
    // write a copy whose `./input` resolves to nothing (DL19 layer 1, MED-3). So the
    // set is DERIVED from each shipped source's own imports - a sibling part by
    // `./<name>`, the shared lib by `@/lib/utils` - and compared, per item.
    // Until DL27 it read them with a regex over `from "…"`: a COMMENT spelling a
    // sibling import reddened it (a false red on prose) and a side-effect
    // `import "./x"` was never read (a false green on a real import). Now through
    // `registryDrift` and `registryImports`, the scanner's specifiers resolved to the
    // item that ships each file.
    let derived = 0;
    const drift: string[] = [];
    for (const item of registry.items) {
      drift.push(...registryDrift(item.name, item.registryDependencies ?? [], sourcesOf(item)));
      derived += new Set(sourcesOf(item).flatMap((source) => registryImports(source, item.name)))
        .size;
    }
    expect(
      drift,
      "a registry item's registryDependencies differ from the items that ship the files its sources import",
    ).toEqual([]);
    // Anchor: the same total the count above holds, reached from the imports. And the
    // rule, holding on the tree: `ribbon` imports `./ribbon.css`, its own file, and
    // declares `@marquee/utils` alone, so a reader without the rule reddens `ribbon`.
    expect(derived).toBe(40);
  });

  it("reads a source's registry dependencies as the items that ship the files it imports", () => {
    // The check above's reader and compare, on texts written here, in a test of their
    // own so that a red here names the reader and the check's red names an item (a pin
    // inside the check reddened first and hid the item's line, measured in DL27).
    const text = [
      '// import { Label } from "./label"',
      '/** export * from "./toast" */',
      "const prose = 'import x from \"./alert\"';",
      'const path = "./alert";',
      'import "./toggle";',
      'import { Input } from "./input.js";',
      'import "./ribbon.css";',
      'import { cn } from "@/lib/utils";',
      'import { Slot } from "@radix-ui/react-slot";',
      'import "./helpers";',
      'import { Label } from "@/label";',
      'import { merge } from "@/lib/merge";',
      'import { x } from "../x";',
      'export { Badge } from "./badge";',
      'export const later = () => import("./sheet");',
    ].join("\n");
    const card = { path: "packages/ui/src/card.tsx", text };
    expect(registryImports(card, "card"), "the sibling reader, over every import shape").toEqual([
      "@marquee/toggle",
      "@marquee/input",
      "@marquee/ribbon",
      "@marquee/utils",
      "unshipped ./helpers",
      "unshipped @/label",
      "unshipped @/lib/merge",
      "unshipped ../x",
      "@marquee/badge",
      "@marquee/sheet",
    ]);
    // The rule: a file the source's own item ships is not a dependency.
    const ribbon = { path: "packages/ui/src/ribbon.tsx", text: 'import "./ribbon.css";' };
    expect(registryImports(ribbon, "ribbon"), "the item's own stylesheet").toEqual([]);
    // The compare, both ways, on DL19's swap (`textarea` declaring `label` for `input`).
    const textarea = {
      path: "packages/ui/src/textarea.tsx",
      text: 'import { cn } from "@/lib/utils";\nimport { inputClass } from "./input";',
    };
    expect(
      registryDrift("textarea", ["@marquee/label", "@marquee/utils"], [textarea]),
      "the compare, both ways",
    ).toEqual([
      "textarea: imports @marquee/input and does not declare it",
      "textarea: declares @marquee/label and does not import it",
    ]);
    expect(registryDrift("textarea", ["@marquee/input", "@marquee/utils"], [textarea])).toEqual([]);
  });

  it("reads a source's imports at every specifier position and nowhere else", () => {
    // The reader both dependency checks call. Until DL26 it was a regex over
    // `from "…"`: a COMMENT that spelled one was read as an import (a false red on
    // prose), and a side-effect `import "x"` or a dynamic `import("x")` was not read
    // at all (a false green on a real import; DL25 layer 1 r5 LOW-6, each run).
    const text = [
      '// import { Slot } from "@radix-ui/react-slot"',
      '/** export * from "lodash" */',
      'import "@radix-ui/react-toggle";',
      'import { cva } from "class-variance-authority";',
      'import type { ReactNode } from "react";',
      'export { clsx } from "clsx/lite";',
      'export * from "@scope/pkg/deep";',
      "const prose = 'import x from \"left-pad\"';",
      'export const lazy = () => import("tailwind-merge");',
      "export const later = () => import(`@radix-ui/react-slot`);",
      'export const json = () => import("date-fns", { with: { type: "json" } });',
      "export const unknown = (name: string) => import(name);",
      'import { cn } from "@/lib/utils";',
      'import { Label } from "./label";',
      "export const node: ReactNode = prose;",
    ].join("\n");
    expect(bareImports(part(text)), "the reader, over every import shape").toEqual([
      "@radix-ui/react-toggle",
      "class-variance-authority",
      "react",
      "clsx",
      "@scope/pkg",
      "tailwind-merge",
      "@radix-ui/react-slot",
      "date-fns",
    ]);
    // A `.ts` source is parsed as TypeScript, not TSX: `<number>value` is a type
    // assertion there and an unclosed JSX element in a `.tsx`, which swallows every
    // import after it (both measured, DL26).
    const assertion =
      'const value: unknown = 1;\nconst n = <number>value;\nexport const f = () => import("clsx");';
    expect(bareImports({ path: "lib/x.ts", text: assertion }), "a .ts source").toEqual(["clsx"]);
    // And a `.tsx` as TSX: to the TypeScript parser this JSX text's backtick opens a
    // template that swallows the re-export after it (DL26 layer 1 r5 LOW-1, proved on
    // a real part source).
    const backtick = 'export const Hint = () => <kbd>press ` to open</kbd>;\nexport * from "clsx";';
    expect(bareImports(part(backtick)), "a .tsx source").toEqual(["clsx"]);
  });

  it("declares exactly the npm dependencies its own sources import, per item", () => {
    // The ranges above are checked only for what an item DECLARES, and the union
    // below only against the package: a `card` that imported `Slot` and declared
    // nothing, or a `button` that stopped declaring `class-variance-authority`, was
    // GREEN on the whole suite (DL24 layer 1 r5 MED-2; DL25 re-ran both). So each
    // item's set is DERIVED from its own files' bare imports and compared, both ways.
    expect([...peers].sort(), "the peers a consumer brings, which no item declares").toEqual([
      "react",
      "react-dom",
    ]);
    // The READER, on texts written here: each direction, a peer, the item's own
    // registry and a deep import.
    expect(
      dependencyDrift("x", [], [part('import { Slot } from "@radix-ui/react-slot";')], peers),
      "an undeclared import reads as declared",
    ).toEqual(["x: imports @radix-ui/react-slot and does not declare it"]);
    expect(
      dependencyDrift(
        "x",
        ["class-variance-authority@^0.7.1"],
        [part('import { useId } from "react";')],
        peers,
      ),
      "a declared package no source imports reads as imported",
    ).toEqual(["x: declares class-variance-authority and does not import it as a dependency"]);
    expect(
      dependencyDrift(
        "x",
        ["@radix-ui/react-slot@^1.3.3", "clsx@^2.1.1"],
        [
          part('import { Slot } from "@radix-ui/react-slot/dist/index";'),
          part('import { clsx } from "clsx/lite";\nimport { useId } from "react";'),
          part(
            'import { createPortal } from "react-dom";\nimport { cn } from "@/lib/utils";\nimport { Label } from "./label";',
          ),
        ],
        peers,
      ),
      "a peer, the item's own registry or a deep import reads as a dependency",
    ).toEqual([]);

    let derived = 0;
    let declared = 0;
    const drift: string[] = [];
    for (const item of registry.items) {
      drift.push(...dependencyDrift(item.name, item.dependencies ?? [], sourcesOf(item), peers));
      declared += (item.dependencies ?? []).length;
      derived += new Set(
        sourcesOf(item)
          .flatMap(bareImports)
          .filter((n) => !peers.has(n)),
      ).size;
    }
    expect(
      drift,
      "a registry item's dependencies differ from its own sources' bare imports: declare what it imports, drop what it does not",
    ).toEqual([]);
    // Anchor: the walk reached every declared pair from the imports (21 at DL25), so a
    // walk over no item or no import cannot pass. Not a counter to move: a part that
    // declares what it imports moves both sides (layer 1 r5 LOW-5).
    expect(
      declared,
      "no item declares a dependency: the walk has nothing to compare",
    ).toBeGreaterThan(5);
    expect(derived, "the imports reached fewer pairs than the items declare").toBe(declared);
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
    expect(compared).toBe(36);
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
    const notInstalled = (names: Iterable<string>): string[] =>
      [...names].filter((name) => !(name in uiDeps) && !peers.has(name));
    // The filter, on names written here: a dependency and a peer pass and anything else
    // does not (DL26 layer 1 r5 LOW-3: a filter that let every name through was GREEN).
    expect(notInstalled(["clsx", "react", "left-pad"]), "the filter").toEqual(["left-pad"]);
    const imported = new Set(registry.items.flatMap(sourcesOf).flatMap(bareImports));
    expect(imported.size).toBeGreaterThan(4);
    expect(notInstalled(imported), "imported at runtime but not a dependency or a peer").toEqual(
      [],
    );
  });
});

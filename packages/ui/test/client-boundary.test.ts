import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

/**
 * THE DIRECTIVE, AS A SHIPPING CONTRACT RATHER THAN A HABIT.
 *
 * A part file that calls a client-only React hook and does NOT open with
 * `"use client"` is not a component with a caveat: it is a file the consumer's
 * framework REFUSES TO BUILD the moment a server component imports it. Measured,
 * not reasoned - the orchestrator vendored this package's `form.tsx` into a Next
 * 15 app at `d69b5df6`, composed it in an existing Server Component page, and
 * `pnpm --filter @thepile/web build` exited 1 with:
 *
 *   You're importing a component that needs createContext. This React Hook only
 *   works in a Client Component. To fix, mark the file (or its parent) with the
 *   "use client" directive.
 *
 * naming `src/components/ui/form.tsx:2:1`. Four files were in that state here
 * (`form`, `checkbox`, `radio-group`, `description-list`) while three others
 * (`accordion`, `sheet`, `toast`) carried the directive - so the rule existed and
 * nothing held anyone to it. This is the thing that holds.
 *
 * ⚠️ `useId` IS DELIBERATELY NOT IN THE SET. React serves it on the server (it is
 * how a server-rendered label and its input agree on an id at all), and Next's
 * loader does not flag it. A file whose only react import is `useId` stays a
 * server module, which is the whole point of `FormLabel`'s generated ids.
 *
 * ⚠️ THE BOUND IS FINITE: React hook imports and CLIENT_ONLY_LIBRARIES are read.
 * Client-only imports from other unclassified modules remain invisible. Recharts
 * arrives in BATCH-PARITY-7 and joins that dependency set because its runtime
 * Tooltip/Legend own effects, context and portals while its entry lacks a marker.
 * Type-only imports stay outside the client requirement.
 *
 * The other bounds, each one exercised by the table at the foot of this file
 * rather than promised here: a multi-line import, braces with no spaces, an
 * aliased hook (`createContext as mk`) and a namespace import are all read; a
 * `type`-only import and an inline `type` member are dropped; and the directive
 * is recognised only double-quoted, which is what `prettier --check` enforces
 * for the whole repository anyway.
 */

const ROOT = resolve(process.cwd());
const SRC = resolve(ROOT, "packages/ui/src");
const MODULES = resolve(ROOT, "packages/ui/node_modules");

/**
 * The hooks whose mere IMPORT makes a module client-only, which is Next's own
 * test: the loader reads the import, not the call.
 */
const CLIENT_ONLY = [
  "createContext",
  "useContext",
  "useState",
  "useEffect",
  "useRef",
  "useLayoutEffect",
  "useReducer",
  "useSyncExternalStore",
] as const;

/** Every part file on disk, so the check cannot fall behind a list. */
const PARTS = readdirSync(SRC)
  .filter((name) => name.endsWith(".tsx"))
  .sort();

const read = (name: string): string => readFileSync(resolve(SRC, name), "utf8");

/**
 * The RUNTIME names one file imports from `react`.
 *
 * `import type { … } from "react"` is skipped whole and an inline `type X` member
 * is dropped, because neither survives compilation - a file importing only
 * `type ComponentProps` is a server module and reads identically to one importing
 * `useState` if the `type` keyword is ignored.
 */
function reactRuntimeImports(text: string): string[] {
  const names: string[] = [];
  for (const match of text.matchAll(/^import\s+(type\s+)?\{([^}]*)\}\s*from\s*"react";/gm)) {
    if (match[1] !== undefined) continue;
    for (const member of match[2]!.split(",")) {
      const token = member.trim();
      if (token === "" || token.startsWith("type ")) continue;
      names.push(token.split(/\s+as\s+/)[0]!.trim());
    }
  }
  // ⚠️ AND THE NAMESPACE FORM, WHICH IS THE ONE THAT MATTERS MOST (layer 1,
  // HIGH-1, proved). `import * as React from "react"` + `React.createContext(…)`
  // is what UPSTREAM SHADCN publishes, so it is the likeliest spelling for a part
  // copied in from there - and the first edition of this parser read named
  // imports only. It was run: `checkbox.tsx` rewritten that way with its
  // directive DELETED left the whole suite at 29 files / 528 tests passed, which
  // is exactly the state whose Next build this file's docblock quotes as exit 1.
  for (const ns of text.matchAll(/^import\s+\*\s+as\s+([A-Za-z_$][\w$]*)\s+from\s*"react";/gm)) {
    const alias = ns[1]!;
    for (const use of text.matchAll(new RegExp(`\\b${alias}\\.([A-Za-z_$][\\w$]*)\\b`, "g"))) {
      names.push(use[1]!);
    }
  }
  return names;
}

/**
 * Recharts 3's Tooltip/Legend use effects, context and portals without marking
 * its root ESM entry. Its runtime import needs our boundary; a type import does
 * not. Keep this finite dependency set separate from the marked-Radix resolver.
 * https://nextjs.org/docs/app/getting-started/server-and-client-components#third-party-components
 * Source inspected 2026-10-08: recharts 3.10.1 es6/component/Legend.js and Tooltip.js.
 */
const CLIENT_ONLY_LIBRARIES: ReadonlySet<string> = new Set(["recharts"]);

function clientLibraryImports(text: string): string[] {
  const source = ts.createSourceFile(
    "part.tsx",
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const imports = source.statements.flatMap((statement) => {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier))
      return [];
    const specifier = statement.moduleSpecifier.text;
    if (!CLIENT_ONLY_LIBRARIES.has(specifier)) return [];
    const clause = statement.importClause;
    if (clause?.isTypeOnly) return [];
    const bindings = clause?.namedBindings;
    if (
      clause?.name === undefined &&
      bindings !== undefined &&
      ts.isNamedImports(bindings) &&
      bindings.elements.length > 0 &&
      bindings.elements.every((member) => member.isTypeOnly)
    )
      return [];
    return [specifier];
  });
  return [...new Set(imports)];
}

const needsBoundary = (text: string): string[] => [
  ...reactRuntimeImports(text).filter((name) => (CLIENT_ONLY as readonly string[]).includes(name)),
  ...clientLibraryImports(text),
];

/** The directive as the FIRST statement, which is the only position it works in. */
const opensWithDirective = (text: string): boolean => /^"use client";\r?\n/.test(text);

/**
 * The ESM entry a bare specifier resolves to, read out of the dependency's own
 * `exports` map. Null when the package, the map or the file is not there, so a
 * resolution that quietly fails cannot read as "not a client module" - the anchor
 * below is what proves it resolves at all.
 */
function moduleEntry(specifier: string): string | null {
  try {
    const dir = resolve(MODULES, specifier);
    const pkg = JSON.parse(readFileSync(resolve(dir, "package.json"), "utf8")) as {
      exports?: Record<string, { import?: string | { default?: string }; default?: string }>;
      module?: string;
      main?: string;
    };
    const dot = pkg.exports?.["."];
    const entry =
      (typeof dot?.import === "string" ? dot.import : dot?.import?.default) ??
      dot?.default ??
      pkg.module ??
      pkg.main;
    if (entry === undefined) return null;
    return readFileSync(resolve(dir, entry), "utf8");
  } catch {
    return null;
  }
}

/** Every bare `@radix-ui/…` specifier one file imports. */
const radixImports = (text: string): string[] =>
  [...text.matchAll(/from\s*"(@radix-ui\/[a-z-]+)"/g)].map((match) => match[1]!);

/** True when one of the primitives this file wraps opens with the directive itself. */
const wrapsClientModule = (text: string): boolean =>
  radixImports(text).some((specifier) => {
    const entry = moduleEntry(specifier);
    return entry !== null && opensWithDirective(entry);
  });

describe("every part that needs a client boundary declares one", () => {
  it("found real sources, and the predicate partitions them", () => {
    // Anchors. An empty walk, or a parser that matched nothing, makes the guard
    // below pass by checking nothing - and that is this repository's most
    // recurrent defect. So: the walk is real, BOTH sides of the partition are
    // non-empty, and two named files sit on the sides they are known to be on.
    expect(PARTS.length).toBeGreaterThan(15);
    const client = PARTS.filter((name) => needsBoundary(read(name)).length > 0);
    const server = PARTS.filter((name) => needsBoundary(read(name)).length === 0);
    expect(client.length).toBeGreaterThan(0);
    expect(server.length).toBeGreaterThan(0);
    expect(client).toContain("form.tsx");
    expect(server).toContain("button.tsx");
    // …and the type-only import is really dropped: `card.tsx` imports
    // `type ComponentProps` from react and nothing else.
    expect(reactRuntimeImports(read("card.tsx"))).toEqual([]);
    // …while an inline `type` member beside real hooks keeps only the hooks.
    expect(reactRuntimeImports(read("toast.tsx"))).toEqual([
      "createContext",
      "useContext",
      "useEffect",
    ]);
    // …and the dependency resolver reaches real bytes, in both verdicts: it is
    // what decides the third arm, and a resolver that silently returned null
    // would make that arm pass by knowing nothing.
    expect(moduleEntry("@radix-ui/react-accordion")).not.toBeNull();
    expect(wrapsClientModule(read("accordion.tsx"))).toBe(true);
    expect(wrapsClientModule(read("switch.tsx"))).toBe(false);
    expect(radixImports(read("switch.tsx"))).toEqual(["@radix-ui/react-slot"]);
  });

  it.each([
    ['import { createContext } from "react";', ["createContext"]],
    ['import {createContext} from "react";', ["createContext"]],
    ['import {\n  useState,\n  type ReactNode,\n} from "react";', ["useState"]],
    ['import { createContext as mk } from "react";', ["createContext"]],
    ['import type { ComponentProps } from "react";', []],
    ['import { useId } from "react";', ["useId"]],
    ['import * as React from "react";\nconst C = React.createContext(null);', ["createContext"]],
    ['import * as R from "react";\nR.useState(0);\nR.memo(x);', ["useState", "memo"]],
    ['import * as React from "react";\nconst n = React.version;', ["version"]],
  ])("reads %j as %j", (source, expected) => {
    // The parser's BOUNDS, exercised rather than described - including the two
    // rows that decide nothing on their own (`memo`, `version` are read and then
    // filtered by CLIENT_ONLY), because a parser that over-reads and a filter
    // that under-filters fail the same way from outside.
    expect(reactRuntimeImports(source)).toEqual(expected);
  });

  it.each([
    ['import { Legend, Tooltip } from "recharts";', ["recharts"]],
    ['import {\n Legend as PlotLegend, type TooltipProps,\n} from "recharts";', ["recharts"]],
    ['import * as Charts from "recharts";', ["recharts"]],
    ['import "recharts";', ["recharts"]],
    ['import {} from "recharts";', ["recharts"]],
    ['import type { TooltipProps } from "recharts";', []],
    ['import { type TooltipProps } from "recharts";', []],
    [
      '// import { Legend } from "recharts";\nconst prose = \'import { Tooltip } from "recharts";\';',
      [],
    ],
    ['import type { Table } from "@tanstack/react-table";\nimport { Fragment } from "react";', []],
  ])("requires a boundary only for runtime client-library imports in %j", (source, expected) => {
    expect(needsBoundary(source)).toEqual(expected);
  });

  it("reads useId and then does NOT ask it for a boundary", () => {
    // The split the table above rests on, said once as a behaviour: the parser
    // reads every runtime name, and `CLIENT_ONLY` is what decides. React serves
    // `useId` on the server - it is how a server-rendered label and its input
    // agree on an id at all - so a file whose only react import is `useId` stays
    // a server module. `form.tsx` imports it beside two real hooks, which is why
    // the negative case is stated here rather than read off a file.
    expect(needsBoundary('import { useId } from "react";')).toEqual([]);
    expect(needsBoundary('import * as React from "react";\nReact.useId();')).toEqual([]);
    expect(needsBoundary('import * as React from "react";\nReact.useState(0);')).toEqual([
      "useState",
    ]);
  });

  it('opens every file importing client-only hooks or libraries with "use client"', () => {
    const offenders = PARTS.filter((name) => {
      const text = read(name);
      return needsBoundary(text).length > 0 && !opensWithDirective(text);
    }).map((name) => `packages/ui/src/${name} (imports ${needsBoundary(read(name)).join(", ")})`);
    expect(offenders).toEqual([]);
  });

  it("does not spend the boundary on a file that is entitled to none", () => {
    // The other direction, and it is not symmetric. `"use client"` on a static
    // cell costs the consumer a bundle entry and, in Next, everything below it -
    // so a directive with nothing behind it is a defect too, just a quiet one.
    //
    // ⚠️ But "nothing behind it" is NOT "no react hook", and the first draft of
    // this arm said it was: it reported `accordion.tsx` and `sheet.tsx`, which
    // import no hook at all and are entitled to the directive all the same,
    // because the Radix primitive each one wraps is ITSELF a client module. That
    // is measured here rather than listed, so the day a dependency changes its
    // mind the guard changes with it.
    const wasteful = PARTS.filter((name) => {
      const text = read(name);
      return (
        opensWithDirective(text) && needsBoundary(text).length === 0 && !wrapsClientModule(text)
      );
    });
    expect(wasteful).toEqual([]);
  });
});

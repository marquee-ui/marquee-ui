import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { repoRoot } from "./helpers/source-files.js";

/**
 * Every test file is collected by SOME project.
 *
 * The suite runs as two vitest projects because the two halves need different
 * environments (node for the emitters, jsdom for the components), and a split
 * include is exactly how a test file ends up collected by nobody: it does not fail,
 * it does not run, and the total stays the same. Measured, not imagined - a
 * deliberately failing `expect(1).toBe(2)` planted in a package with no project, and
 * a `.test.tsx` planted in a project whose include named only `.test.ts`, BOTH left
 * the run byte-identical at 226 passed.
 *
 * So the config exports ONE glob spelling (`TEST_GLOB`, both extensions), and this
 * asserts the other half: that every package which has a `test/` directory is named
 * by a project.
 */

type ProjectConfig = { test?: { name?: string; include?: string[] } };
type RootConfig = { test?: { projects?: ProjectConfig[] } };

const config = (await import("../../../vitest.config.js")) as unknown as {
  default: RootConfig;
  TEST_GLOB: (pkg: string) => string;
};

const projects = config.default.test?.projects ?? [];
const includes = projects.flatMap((project) => project.test?.include ?? []);

/** Every package directory that actually contains a `test/` directory. */
const packagesWithTests = readdirSync(join(repoRoot, "packages")).filter((pkg) =>
  existsSync(join(repoRoot, "packages", pkg, "test")),
);

describe("vitest project coverage", () => {
  it("found real projects and real packages", () => {
    // Anchor: two empty lists compare equal and would prove nothing.
    expect(projects.length).toBeGreaterThanOrEqual(2);
    expect(includes.length).toBeGreaterThanOrEqual(2);
    expect(packagesWithTests.length).toBeGreaterThanOrEqual(2);
  });

  it("names every package that has tests", () => {
    const uncovered = packagesWithTests.filter((pkg) => !includes.includes(config.TEST_GLOB(pkg)));
    expect(uncovered, "these packages have a test/ directory that no project collects").toEqual([]);
  });

  it("collects both extensions in every project", () => {
    // A project that includes only `.test.ts` swallows every `.test.tsx` in silence.
    for (const include of includes) {
      expect(include, include).toContain("{ts,tsx}");
    }
  });

  it("gives every project a name, so a red says which half it came from", () => {
    expect(projects.map((project) => project.test?.name).sort()).toEqual(["tokens", "ui"]);
  });
});

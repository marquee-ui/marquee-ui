import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Every `##` heading in `docs/as-built.md` appears ONCE, and every `###` heading
 * appears once WITHIN its `##` section.
 *
 * The record grows by splicing a new section in by heading text, and a splice that
 * finds the wrong occurrence of its marker is silent: batch DL14's Avatar stream
 * re-appended 4,135 lines of earlier sections after its own and overwrote its own
 * section's tail with the Switch's, and nothing said so until the reconciler counted
 * headings by hand (`docs/as-built.md`, "Reconciler closures (batch DL14, layer 2)").
 * A duplicated `##` is the first symptom of a doubled document; a duplicated `###`
 * inside one section is a splice that landed inside the wrong family.
 *
 * `###` headings repeat ACROSS sections by design (every family has "What shipped",
 * "Decisions", "thepile inputs"), which is exactly why a splice marker must be read
 * under its `##` and never file-wide. `####` and deeper are not held to anything.
 */
const asBuilt = fileURLToPath(new URL("../../../docs/as-built.md", import.meta.url));

describe("docs/as-built.md", () => {
  it("has a heading to check (a positive anchor, so an empty read cannot pass)", () => {
    const headings = readFileSync(asBuilt, "utf8")
      .split("\n")
      .filter((line) => /^#{2,3} /.test(line));
    expect(headings.length).toBeGreaterThan(50);
  });

  it("names every ## heading once, and every ### heading once within its ## section", () => {
    const seen = new Map<string, number>();
    let section = "(before the first ## heading)";
    for (const line of readFileSync(asBuilt, "utf8").split("\n")) {
      if (/^## /.test(line)) {
        section = line;
        seen.set(line, (seen.get(line) ?? 0) + 1);
      } else if (/^### /.test(line)) {
        const key = `${section} > ${line}`;
        seen.set(key, (seen.get(key) ?? 0) + 1);
      }
    }
    const duplicated = [...seen].filter(([, n]) => n > 1).map(([h, n]) => `${n}x ${h}`);
    expect(
      duplicated,
      "a heading appears more than once: a section was spliced in twice, or a splice marker matched the wrong occurrence",
    ).toEqual([]);
  });
});

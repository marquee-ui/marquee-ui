/**
 * Regenerates `upstream-classes.json`: the class strings the six MOVED part
 * families wore in the reference consumer, at one commit, read with `git show` and
 * never retyped.
 *
 *   node packages/ui/test/fixtures/extract-upstream.mjs <path-to-reference-repo> <commit>
 *
 * The reference consumer is a private application, so this script takes its path as
 * an argument and this repository contains none of its identifiers beyond the file
 * paths needed to read it back. `fidelity.test.tsx` consumes the output; the suite
 * cannot verify the fixture against a repository it cannot see, so RE-RUNNING THIS
 * is the check, and the commit is recorded in the output for exactly that reason.
 *
 * Four of the button strings and the input come from the byte-pins that repo's own
 * tests produced by EVALUATING the module, which is why they are read out of the
 * test files rather than out of the components.
 */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const [repo, commit] = process.argv.slice(2);
if (!repo || !commit) {
  console.error("usage: extract-upstream.mjs <path-to-reference-repo> <commit>");
  process.exit(2);
}

const show = (path) =>
  execFileSync("git", ["-C", repo, "show", `${commit}:${path}`], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });

const UI = "apps/web/src/components/ui/";
const FILES = [
  `${UI}Button.tsx`,
  `${UI}Button.test.tsx`,
  `${UI}form-styles.ts`,
  `${UI}form-styles.test.ts`,
  `${UI}Sheet.tsx`,
  `${UI}Toast.tsx`,
  `${UI}Ribbon.tsx`,
];
const source = Object.fromEntries(FILES.map((path) => [path, show(path)]));

/** The first string literal after `marker`, exactly as written. */
function after(file, marker, label) {
  const text = source[file];
  const at = text.indexOf(marker);
  if (at < 0) throw new Error(`marker not found for ${label} in ${file}`);
  const match = /"((?:[^"\\]|\\.)*)"/.exec(text.slice(at + marker.length));
  if (!match) throw new Error(`no string literal after ${label}`);
  return match[1];
}

const btn = `${UI}Button.tsx`;
const btnTest = `${UI}Button.test.tsx`;
const forms = `${UI}form-styles.ts`;
const formsTest = `${UI}form-styles.test.ts`;
const sheet = `${UI}Sheet.tsx`;
const toast = `${UI}Toast.tsx`;
const ribbon = `${UI}Ribbon.tsx`;

const classes = {
  "button.primary": after(btnTest, "expect(BUTTON_CLASS.primary).toBe(", "button.primary"),
  "button.primaryRounded": after(formsTest, "expect(primaryButtonClass).toBe(", "primaryRounded"),
  "button.secondary": after(formsTest, "expect(secondaryButtonClass).toBe(", "secondary"),
  "button.dangerArmed": after(formsTest, "expect(dangerButtonClass(true)).toBe(", "dangerArmed"),
  "button.dangerIdle": after(formsTest, "expect(dangerButtonClass(false)).toBe(", "dangerIdle"),
  "button.ghost": after(btnTest, "expect(BUTTON_CLASS.ghost).toBe(", "button.ghost"),
  "button.secondaryBase": after(btn, "const secondaryBase =", "secondaryBase"),
  "input.field": after(formsTest, "expect(inputClass).toBe(", "inputClass"),
  "label.micro": after(forms, "export const microLabelClass =", "microLabel"),
  "sheet.overlay": after(sheet, "<Dialog.Overlay className=", "sheet.overlay"),
  "sheet.handle": after(
    sheet,
    'data-testid="sheet-handle"\n            className=',
    "sheet.handle",
  ),
  "sheet.title": after(sheet, "Dialog.Title className={cn(", "sheet.title"),
  "sheet.description": after(sheet, "<Dialog.Description className=", "sheet.description"),
  "sheet.body": after(sheet, 'data-testid="sheet-body"\n              className=', "sheet.body"),
  "toast.stack": after(toast, "stack.className =", "toast.stack"),
  "toast.strip": after(toast, 'role="status"\n      className=', "toast.strip"),
  "toast.action": after(toast, "onDismiss();\n          }}\n          className=", "toast.action"),
  "ribbon.outer": after(ribbon, 'data-testid="ribbon"\n      className=', "ribbon.outer"),
  "ribbon.band": after(ribbon, "<div className=", "ribbon.band"),
  "ribbon.track": after(ribbon, 'aria-hidden="true"\n          className=', "ribbon.track"),
};

// The sheet's panel is three concatenated literals inside one `cn()`.
const parts = [...source[sheet].matchAll(/"((?:[^"\\]|\\.)*)"/g)]
  .map((match) => match[1])
  .filter(
    (value) =>
      value.startsWith("fixed z-50 flex") ||
      value.startsWith("inset-x-0 bottom-0") ||
      value.startsWith("md:inset-x-auto"),
  );
if (parts.length !== 3) throw new Error(`sheet panel: expected 3 parts, found ${parts.length}`);
classes["sheet.content"] = parts.join(" ");

const output = {
  $generated: "node packages/ui/test/fixtures/extract-upstream.mjs <reference-repo> <commit>",
  $note: "Regenerate against the reference repository; the suite cannot verify these.",
  commit,
  files: FILES,
  classes: Object.fromEntries(Object.entries(classes).sort(([a], [b]) => a.localeCompare(b))),
};

const out = new URL("./upstream-classes.json", import.meta.url);
writeFileSync(out, `${JSON.stringify(output, null, 2)}\n`);
console.log(`wrote ${Object.keys(classes).length} class strings from ${commit} to ${out.pathname}`);

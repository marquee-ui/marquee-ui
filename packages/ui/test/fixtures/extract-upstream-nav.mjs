/**
 * Regenerates `upstream-nav-classes.json`: the class strings and the ARIA
 * contracts the two MOVED navigation families wore in the reference consumer, at
 * one commit, read with `git show` and never retyped.
 *
 *   node packages/ui/test/fixtures/extract-upstream-nav.mjs <path-to-reference-repo> <commit>
 *
 * A SECOND fixture beside `upstream-classes.json` rather than more rows in it: a
 * fixture's only check is the commit it records, and these two were read at
 * different commits (the six a2 families at `ffb71a66`, these two later). One
 * `commit` field cannot be honest about both.
 *
 * WHY THE ARIA CONTRACTS ARE IN HERE TOO. For a moved part the accessible name is
 * as much a consumer contract as a pixel is: the reference consumer's own tests
 * resolve its landmarks BY NAME, and a name typed into this package by hand is
 * exactly the shape of mistake this file exists to make impossible. So the nav
 * labels, the test id and the per-link label template are read out of the source
 * as well, and `nav-consumption.test.tsx` asserts the parts against them.
 *
 * Every marker below must appear EXACTLY ONCE in its file, and that is checked
 * rather than assumed: resolving a target by position ("the first match") silently
 * picks something else the moment a second candidate exists.
 */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const [repo, commit] = process.argv.slice(2);
if (!repo || !commit) {
  console.error("usage: extract-upstream-nav.mjs <path-to-reference-repo> <commit>");
  process.exit(2);
}

const show = (path) =>
  execFileSync("git", ["-C", repo, "show", `${commit}:${path}`], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });

const CRUMB = "apps/web/src/components/game/Breadcrumb.tsx";
const PAGER = "apps/web/src/components/hubs/HubPagination.tsx";
const FILES = [CRUMB, PAGER];
const source = Object.fromEntries(FILES.map((path) => [path, show(path)]));

/** The one index of `marker` in `file`, or a throw. */
function once(file, marker, label) {
  const text = source[file];
  const first = text.indexOf(marker);
  if (first < 0) throw new Error(`${label}: marker not found in ${file}: ${marker}`);
  if (text.indexOf(marker, first + 1) >= 0) {
    throw new Error(`${label}: marker is not unique in ${file}: ${marker}`);
  }
  return first + marker.length;
}

const LITERAL = /"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g;

/** The first `count` string literals (double-quoted or template) after `marker`. */
function literalsAfter(file, marker, count, label) {
  const rest = source[file].slice(once(file, marker, label));
  const out = [];
  LITERAL.lastIndex = 0;
  for (const match of rest.matchAll(LITERAL)) {
    out.push(match[1] ?? match[2]);
    if (out.length === count) return out;
  }
  throw new Error(`${label}: wanted ${count} literals after ${marker}, found ${out.length}`);
}

const after = (file, marker, label) => literalsAfter(file, marker, 1, label)[0];

/**
 * The two `<li>` class strings the trail picks between, taken out of the ONE
 * ternary that picks them - and only if the condition still reads the way the
 * mapping below assumes, so a reordered ternary throws instead of swapping the
 * two silently.
 */
function crumbItemClasses() {
  const text = source[CRUMB];
  const open = text.indexOf("<li");
  if (open < 0) throw new Error("crumb item: no <li in the trail");
  if (text.indexOf("<li", open + 1) >= 0) throw new Error("crumb item: more than one <li");
  const tag = text.slice(open, text.indexOf(">", open));
  const literals = [...tag.matchAll(LITERAL)].map((match) => match[1] ?? match[2]);
  if (literals.length !== 2) {
    throw new Error(
      `crumb item: expected 2 class strings in the <li tag, found ${literals.length}`,
    );
  }
  const condition = tag.indexOf("crumb.path === null ?");
  if (condition < 0 || condition > tag.indexOf(`"${literals[0]}"`)) {
    throw new Error("crumb item: the ternary no longer tests `crumb.path === null` first");
  }
  // The condition is true for the step you are standing on, so the FIRST branch
  // is the current item and the second is a linked one.
  return { current: literals[0], link: literals[1] };
}

/** The pager's link: one `cn()` of a base plus the current/other pair. */
function pagerLinkClasses() {
  const [base, current, other] = literalsAfter(PAGER, "className={cn(", 3, "pager link");
  const text = source[PAGER];
  const between = text.slice(text.indexOf(`"${base}"`), text.indexOf(`"${current}"`));
  if (!between.includes("p === current")) {
    throw new Error("pager link: the pair is no longer chosen by `p === current`");
  }
  return { base, current, other };
}

const item = crumbItemClasses();
const link = pagerLinkClasses();
const [pagerNavLabel, pagerNavClass] = literalsAfter(PAGER, "<nav aria-label=", 2, "pager nav");

const classes = {
  "breadcrumb.list": after(CRUMB, "<ol className=", "crumb list"),
  "breadcrumb.item": item.link,
  "breadcrumb.currentItem": item.current,
  "breadcrumb.separator": after(CRUMB, '<span aria-hidden="true" className=', "crumb separator"),
  "breadcrumb.link": after(CRUMB, "href={crumb.path}", "crumb link"),
  "breadcrumb.page": after(CRUMB, '<span aria-current="page" className=', "crumb page"),
  "pagination.nav": pagerNavClass,
  "pagination.content": after(PAGER, "<ul className=", "pager list"),
  "pagination.item": after(PAGER, "<li", "pager item"),
  "pagination.ellipsis": after(PAGER, '<span aria-hidden="true" className=', "pager gap dot"),
  "pagination.link": link.base,
  "pagination.linkCurrent": link.current,
  "pagination.linkOther": link.other,
};

/** The ARIA contracts, read for the same reason the classes are. */
const contracts = {
  "breadcrumb.navLabel": after(CRUMB, "<nav aria-label=", "crumb nav label"),
  "breadcrumb.testId": after(CRUMB, "data-testid=", "crumb test id"),
  "pagination.navLabel": pagerNavLabel,
  "pagination.linkLabel": after(PAGER, "aria-label={", "pager link label"),
};

const output = {
  $generated: "node packages/ui/test/fixtures/extract-upstream-nav.mjs <reference-repo> <commit>",
  $note: "Regenerate against the reference repository; the suite cannot verify these.",
  commit,
  files: FILES,
  classes: Object.fromEntries(Object.entries(classes).sort(([a], [b]) => a.localeCompare(b))),
  contracts: Object.fromEntries(Object.entries(contracts).sort(([a], [b]) => a.localeCompare(b))),
};

const out = new URL("./upstream-nav-classes.json", import.meta.url);
writeFileSync(out, `${JSON.stringify(output, null, 2)}\n`);
console.log(
  `wrote ${Object.keys(classes).length} class strings and ${Object.keys(contracts).length} contracts from ${commit} to ${out.pathname}`,
);

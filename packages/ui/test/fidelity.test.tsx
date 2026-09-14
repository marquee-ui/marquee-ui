import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import upstream from "./fixtures/upstream-classes.json" with { type: "json" };
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/accordion";
import { Badge } from "@/badge";
import { buttonVariants } from "@/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/card";
import { cn } from "@/lib/utils";
import { Input, inputClass } from "@/input";
import { Label, labelVariants } from "@/label";
import { Ribbon } from "@/ribbon";
import { Separator } from "@/separator";
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetTitle } from "@/sheet";
import { Toast, ToastAction, ToastMessage } from "@/toast";

/**
 * The move is a RENAME, not a redesign.
 *
 * Six of the ten part families were lifted out of a real product, and the promise
 * this package makes to that product is that the consume step shows an empty
 * screenshot diff. Class assertions are normally worthless - a restatement of the
 * implementation - and here they are the deliverable itself, so this file pins
 * them the only way that can fail usefully: it carries the UPSTREAM strings as
 * they were read (`git show <read sha>:apps/web/src/components/ui/*`, copied out
 * of the byte-pins the product's own tests produced by EVALUATING the module,
 * never retyped), applies the rename table, and compares the result to what the
 * parts actually render.
 *
 * So a mistake in the rename TABLE reddens this, which a table of expected strings
 * could not do. A mistake in the UPSTREAM fixture does NOT - it is an input, read
 * out of a repository this suite cannot see, and the only check on it is
 * regenerating it. `upstream-classes.json` records the commit it came from for
 * exactly that reason.
 *
 * Order is not asserted: every utility sits at the same specificity, so the
 * cascade is decided by the stylesheet, not by the class attribute. The SET is
 * what decides a pixel, and the set is what is compared.
 */

/** The a1 role rename table (`packages/tokens/README.md`), as utility prefixes. */
const RENAME: Readonly<Record<string, string>> = {
  "bg-accent": "bg-primary",
  "bg-accent-hover": "bg-primary-hover",
  "border-accent": "border-primary",
  "text-on-accent": "text-primary-foreground",
  "text-accent-ink": "text-primary-ink",
  "shadow-hard": "shadow-lift",
  "border-line-strong": "border-border-strong",
  "border-line": "border-border",
  "bg-line-strong": "bg-border-strong",
  "text-text": "text-foreground",
  "text-text-secondary": "text-foreground-2",
  "text-text-muted": "text-muted",
  "border-text-muted": "border-muted",
  "text-danger": "text-destructive",
  "border-danger": "border-destructive",
  "shadow-[4px_4px_0_var(--text)]": "shadow-[4px_4px_0_var(--foreground)]",
};

/**
 * Changes that are NOT a rename, each with the reason it is not. Anything not
 * listed here has to map 1:1, and the test below proves each of these actually
 * fires - a departure that no longer applies is as much a lie as a missing one.
 */
const DEPARTURES: Readonly<Record<string, readonly (readonly [string, string, string])[]>> = {
  "sheet.content": [
    [
      "pb-[max(1rem,var(--safe-bottom))]",
      "pb-[max(1rem,var(--safe-bottom,0px))]",
      "the safe-area inset is the consumer's document-level plumbing and the tokens package deliberately does not carry it; without the fallback an undefined custom property makes the whole declaration invalid and the sheet loses its bottom padding entirely. Where the consumer DOES define it, the two spellings compute the same pixel.",
    ],
  ],
  "ribbon.band": [
    [
      "bg-primary",
      "bg-brand",
      "D8 splits identity from action: a band that announces the product is `brand`, a button is `primary`. The dark preset assigns the same colour to both, so no pixel moves.",
    ],
    [
      "shadow-[0_6px_18px_rgba(0,0,0,0.4)]",
      "shadow-band",
      "an arbitrary shadow with a literal colour cannot live in this package (the literal guard), and it is not any step of the existing ramp, so it became the `band` depth role with exactly this value.",
    ],
  ],
  "ribbon.track": [
    [
      "pile-marquee",
      "mq-marquee",
      "the upstream class name carries the product's own noun (D7), and ships here as `src/ribbon.css`.",
    ],
    [
      "text-primary-foreground",
      "text-brand-foreground",
      "the same identity/action split as the band.",
    ],
  ],
};

/** Utility-aware rename: variant prefixes are kept, arbitrary values are not split. */
function renameUtility(token: string): string {
  let depth = 0;
  let cut = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token[i];
    if (char === "[") depth++;
    else if (char === "]") depth--;
    else if (char === ":" && depth === 0) cut = i + 1;
  }
  const prefix = token.slice(0, cut);
  const base = token.slice(cut);
  return prefix + (RENAME[base] ?? base);
}

function expected(key: string, upstreamValue: string): string[] {
  const departures = DEPARTURES[key] ?? [];
  const applied = new Set<string>();
  const out = upstreamValue
    .split(/\s+/)
    .filter(Boolean)
    .map(renameUtility)
    .map((token) => {
      const swap = departures.find(([from]) => from === token);
      if (!swap) return token;
      applied.add(swap[0]);
      return swap[1];
    });
  // A departure that no longer applies is a stale excuse; say so loudly.
  for (const [from] of departures) {
    if (!applied.has(from)) {
      throw new Error(
        `${key}: declared departure "${from}" matched nothing in the upstream string`,
      );
    }
  }
  return out.sort();
}

const tokens = (value: string): string[] => value.split(/\s+/).filter(Boolean).sort();

/**
 * The upstream strings, GENERATED not typed.
 *
 * `fixtures/upstream-classes.json` is written by
 * `fixtures/extract-upstream.mjs <reference-repo> <commit>`, which reads them with
 * `git show` - four of the button strings and the input out of the byte-pins that
 * repo's own tests produced by EVALUATING the module, the rest out of the
 * components. The reference consumer is private, so THE SUITE CANNOT VERIFY THIS
 * FIXTURE: re-running the generator is the check, and the commit it was taken at is
 * recorded in the file so a regeneration against a different one is visible.
 */
const UPSTREAM: Readonly<Record<string, string>> = upstream.classes;

afterEach(cleanup);

/** The class attribute of the one element carrying `data-slot="<slot>"`. */
function slotClass(slot: string): string {
  const elements = document.querySelectorAll(`[data-slot="${slot}"]`);
  if (elements.length !== 1) {
    throw new Error(`expected exactly one [data-slot="${slot}"], found ${elements.length}`);
  }
  return elements[0]!.getAttribute("class") ?? "";
}

function renderSheet() {
  render(
    <Sheet defaultOpen>
      <SheetContent>
        <SheetTitle>Title</SheetTitle>
        <SheetDescription>Description</SheetDescription>
        <SheetBody>body</SheetBody>
      </SheetContent>
    </Sheet>,
  );
}

function renderToast() {
  render(
    <Toast open onDismiss={() => {}}>
      <ToastMessage>message</ToastMessage>
      <ToastAction>Undo</ToastAction>
    </Toast>,
  );
}

const CASES: readonly (readonly [keyof typeof UPSTREAM, () => string])[] = [
  ["button.primary", () => buttonVariants({ variant: "primary" })],
  ["button.primaryRounded", () => buttonVariants({ variant: "primaryRounded" })],
  ["button.secondary", () => buttonVariants({ variant: "secondary" })],
  ["button.dangerArmed", () => buttonVariants({ variant: "danger", armed: true })],
  ["button.dangerIdle", () => buttonVariants({ variant: "danger", armed: false })],
  ["button.ghost", () => buttonVariants({ variant: "ghost" })],
  [
    // Through a RENDER, not through the constant: a component that stopped applying
    // its own class string left the constant-based assertion green.
    "input.field",
    () => {
      render(<Input />);
      return slotClass("input");
    },
  ],
  [
    "label.micro",
    () => {
      render(<Label tone="micro">Last played</Label>);
      return slotClass("label");
    },
  ],
  [
    "sheet.overlay",
    () => {
      renderSheet();
      return slotClass("sheet-overlay");
    },
  ],
  [
    "sheet.content",
    () => {
      renderSheet();
      return slotClass("sheet-content");
    },
  ],
  [
    "sheet.handle",
    () => {
      renderSheet();
      return slotClass("sheet-handle");
    },
  ],
  [
    "sheet.title",
    () => {
      renderSheet();
      return slotClass("sheet-title");
    },
  ],
  [
    "sheet.description",
    () => {
      renderSheet();
      return slotClass("sheet-description");
    },
  ],
  [
    "sheet.body",
    () => {
      renderSheet();
      return slotClass("sheet-body");
    },
  ],
  [
    "toast.stack",
    () => {
      renderToast();
      return document.getElementById("toast-stack")?.getAttribute("class") ?? "";
    },
  ],
  [
    "toast.strip",
    () => {
      renderToast();
      return slotClass("toast");
    },
  ],
  [
    "toast.action",
    () => {
      renderToast();
      return slotClass("toast-action");
    },
  ],
  [
    "ribbon.outer",
    () => {
      render(<Ribbon items={["one", "two"]} />);
      return slotClass("ribbon");
    },
  ],
  [
    "ribbon.band",
    () => {
      render(<Ribbon items={["one", "two"]} />);
      return slotClass("ribbon-band");
    },
  ],
  [
    "ribbon.track",
    () => {
      render(<Ribbon items={["one", "two"]} />);
      return slotClass("ribbon-track");
    },
  ],
];

describe("the moved parts wear exactly the upstream utilities, renamed", () => {
  it("covers every moved string", () => {
    // Anchor: a table-driven suite that silently lost a row proves nothing.
    const cased = CASES.map(([key]) => key).sort();
    expect(cased).toHaveLength(20);
    expect(new Set(cased).size).toBe(20);
    // Every case is a fixture row, and the only fixture row that is NOT a case is
    // `button.secondaryBase` - a fragment three variants share, never rendered alone.
    expect(cased.filter((key) => !(key in UPSTREAM))).toEqual([]);
    expect(Object.keys(UPSTREAM).filter((key) => !cased.includes(key))).toEqual([
      "button.secondaryBase",
    ]);
    // …and the fixture is the one the generator recorded, at the recorded commit.
    expect(upstream.commit).toBe("ffb71a6656d006846290c9b21778a21fafaf209b");
    expect(upstream.files.length).toBe(7);
  });

  it("keeps the exported constants equal to what the elements actually wear", () => {
    // `inputClass` and `labelVariants` are public API - a consumer may use the
    // string directly on an element the library does not own.
    render(<Input />);
    expect(slotClass("input")).toBe(inputClass);
    cleanup();
    render(<Label tone="micro">Last played</Label>);
    expect(slotClass("label")).toBe(labelVariants({ tone: "micro" }));
  });

  for (const [key, actual] of CASES) {
    it(key, () => {
      const upstreamValue = UPSTREAM[key];
      // A missing fixture row would otherwise compare against `undefined` and throw
      // somewhere less legible than here.
      expect(upstreamValue, `${key} is not in upstream-classes.json`).toBeTypeOf("string");
      expect(tokens(actual())).toEqual(expected(key, upstreamValue!));
    });
  }
});

describe("the rename table itself", () => {
  it("carries no rename entry the upstream strings do not use", () => {
    // A stale rename entry is a rule nobody can see is dead. This does NOT claim
    // every upstream token is handled - a token with no entry is simply carried
    // through unchanged, which is the common case and the correct one.
    const handled = new Set([...Object.keys(RENAME)]);
    const declared = new Set(
      Object.values(DEPARTURES).flatMap((rows) => rows.map(([from]) => from)),
    );
    const stale = [...handled].filter(
      (from) =>
        !Object.values(UPSTREAM).some((value) => value.split(/\s+/).some((t) => t.endsWith(from))),
    );
    expect(stale, "rename entries that no upstream string uses").toEqual([]);
    expect([...declared].length).toBe(5);
  });

  it("names a reason for every departure", () => {
    for (const [key, rows] of Object.entries(DEPARTURES)) {
      for (const [from, to, reason] of rows) {
        expect(reason.length, `${key}: ${from} -> ${to}`).toBeGreaterThan(40);
      }
    }
  });
});

/**
 * D11 gave `cn` merge semantics, and merge semantics can DROP a class: twMerge
 * groups by its own knowledge of Tailwind, which does not include this design
 * system's custom theme names. A token silently eaten on the way through `cn` is
 * a pixel that moves for no reason anybody can see in a diff.
 */
describe("cn is a no-op on every string this package ships", () => {
  for (const [key, actual] of CASES) {
    it(key, () => {
      const value = actual();
      expect(cn(value)).toBe(value);
    });
  }

  it("still merges a real conflict, which is the point of having it", () => {
    expect(cn("bg-surface", "bg-overlay")).toBe("bg-overlay");
    expect(cn("min-h-hit", "min-h-0")).toBe("min-h-0");
  });
});

/**
 * The four NEW parts, pinned.
 *
 * These were not moved, so there is no upstream string to derive from and this IS a
 * restatement - deliberately. The reason it earns its place: without it, emptying
 * `badgeVariants`' base and all four tones, or the accordion trigger's whole class
 * string (losing `min-h-hit` AND `focus-visible:shadow-focus-ring` with it), left
 * the suite green. Measured, not imagined.
 *
 * The class rail is only half of it. `tailwind-compile.test.tsx` carries the other
 * half for the properties that actually matter: that every one of these utilities
 * COMPILES, and that every interactive element rendered anywhere in this package
 * clears the 44px tap floor in resolved pixels.
 */
const NEW_PARTS: readonly (readonly [string, () => void, string])[] = [
  [
    "card",
    () => render(<Card />),
    "flex flex-col gap-3 rounded-md border-2 border-border bg-surface p-4",
  ],
  ["card-header", () => render(<CardHeader />), "flex flex-col gap-1"],
  ["card-title", () => render(<CardTitle>t</CardTitle>), "font-display text-lg text-foreground"],
  [
    "card-description",
    () => render(<CardDescription>d</CardDescription>),
    "text-sm text-foreground-2",
  ],
  ["card-footer", () => render(<CardFooter />), "flex items-center gap-3"],
  [
    "badge",
    () => render(<Badge>b</Badge>),
    "inline-flex items-center gap-1 rounded-sm border-2 px-2 py-0.5 font-mono text-2xs font-bold uppercase tracking-label border-border-strong bg-surface text-foreground-2",
  ],
  [
    "badge-primary",
    () => render(<Badge tone="primary">b</Badge>),
    "inline-flex items-center gap-1 rounded-sm border-2 px-2 py-0.5 font-mono text-2xs font-bold uppercase tracking-label border-primary bg-primary-muted text-primary-ink",
  ],
  [
    "badge-destructive",
    () => render(<Badge tone="destructive">b</Badge>),
    "inline-flex items-center gap-1 rounded-sm border-2 px-2 py-0.5 font-mono text-2xs font-bold uppercase tracking-label border-destructive bg-destructive-muted text-destructive",
  ],
  [
    "badge-success",
    () => render(<Badge tone="success">b</Badge>),
    "inline-flex items-center gap-1 rounded-sm border-2 px-2 py-0.5 font-mono text-2xs font-bold uppercase tracking-label border-success bg-success-muted text-success",
  ],
  [
    "separator",
    () => render(<Separator />),
    "shrink-0 bg-border data-[orientation=horizontal]:h-0.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-0.5",
  ],
  ["accordion-item", () => renderAccordion(), "border-b-2 border-border"],
  [
    "accordion-trigger",
    () => renderAccordion(),
    "flex min-h-hit w-full items-center justify-between gap-3 py-3 text-left text-sm font-semibold text-foreground transition-colors hover:text-primary-ink focus-visible:outline-none focus-visible:shadow-focus-ring",
  ],
  ["accordion-content", () => renderAccordion(), "overflow-hidden pb-3 text-sm text-foreground-2"],
  ["label", () => render(<Label>l</Label>), "text-sm text-foreground-2"],
];

function renderAccordion() {
  render(
    <Accordion type="single" collapsible defaultValue="one">
      <AccordionItem value="one">
        <AccordionTrigger>trigger</AccordionTrigger>
        <AccordionContent>content</AccordionContent>
      </AccordionItem>
    </Accordion>,
  );
}

describe("the new parts wear the utilities they declare", () => {
  it("covers every slot the new parts render", () => {
    // Anchor: a table that lost rows would pass by asserting less.
    const slots = NEW_PARTS.map(([slot]) => slot);
    expect(new Set(slots).size).toBe(slots.length);
    expect(slots).toHaveLength(14);
  });

  for (const [slot, mount, classes] of NEW_PARTS) {
    it(slot, () => {
      mount();
      const name = slot.startsWith("badge") ? "badge" : slot;
      expect(tokens(slotClass(name))).toEqual(tokens(classes));
    });
  }
});

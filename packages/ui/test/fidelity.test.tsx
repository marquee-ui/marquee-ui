import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { buttonVariants } from "@/button";
import { cn } from "@/lib/utils";
import { inputClass } from "@/input";
import { labelVariants } from "@/label";
import { Ribbon } from "@/ribbon";
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
 * So a mistake in the rename TABLE reddens this too, which a table of expected
 * strings could not do.
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

function expected(key: string, upstream: string): string[] {
  const departures = DEPARTURES[key] ?? [];
  const applied = new Set<string>();
  const out = upstream
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
 * The upstream strings, at the read commit. The four button strings and the input
 * are the product's own byte-pins; the rest were read out of the components.
 */
const UPSTREAM = {
  "button.primary":
    "grid min-h-[46px] w-full place-items-center bg-accent px-4 text-sm font-bold text-on-accent shadow-hard transition-[transform,box-shadow] hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_var(--text)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-x-0 disabled:hover:translate-y-0 motion-reduce:transition-none",
  "button.primaryRounded":
    "grid min-h-hit w-full place-items-center rounded-md bg-accent px-4 text-sm font-bold text-on-accent shadow-hard hover:bg-accent-hover hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0",
  "button.secondary":
    "grid min-h-hit w-full place-items-center rounded-md border-2 px-4 text-sm font-semibold hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 border-line-strong text-text hover:border-text-muted",
  "button.dangerArmed":
    "grid min-h-hit w-full place-items-center rounded-md border-2 px-4 text-sm font-semibold hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 text-danger hover:border-danger border-danger",
  "button.dangerIdle":
    "grid min-h-hit w-full place-items-center rounded-md border-2 px-4 text-sm font-semibold hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 text-danger hover:border-danger border-line-strong",
  "button.ghost":
    "inline-flex h-11 items-center rounded-md border-2 border-line px-4 text-sm text-text-secondary transition-colors hover:border-line-strong hover:text-text",
  "input.field":
    "w-full min-h-hit rounded-md border-2 border-line bg-surface px-3 text-base text-text placeholder:text-text-muted focus:border-accent focus:outline-none",
  "label.micro": "font-mono text-3xs uppercase tracking-[0.14em] text-text-secondary",
  "sheet.overlay": "fixed inset-0 z-50 bg-scrim backdrop-blur-sm data-[state=closed]:opacity-0",
  "sheet.content":
    "fixed z-50 flex max-h-[85dvh] flex-col gap-3 bg-overlay p-4 shadow-lg focus:outline-none inset-x-0 bottom-0 w-full rounded-t-lg border-t-2 border-line pb-[max(1rem,var(--safe-bottom))] md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:w-[min(92vw,28rem)] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-lg md:border-2 md:pb-4",
  "sheet.handle": "mx-auto h-1 w-10 shrink-0 rounded-full bg-line-strong md:hidden",
  "sheet.title": "font-display text-lg text-text",
  "sheet.description": "text-sm text-text-secondary",
  "sheet.body": "-mx-4 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-4",
  "toast.stack":
    "pointer-events-none fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-md flex-col gap-2 md:bottom-8",
  "toast.strip":
    "pointer-events-auto flex items-center justify-between gap-3 border-2 border-line-strong bg-overlay px-4 py-2 text-sm text-text shadow-hard",
  "toast.action":
    "min-h-11 shrink-0 px-2 font-mono text-xs font-bold uppercase tracking-widest text-accent-ink",
  "ribbon.outer":
    "pointer-events-none absolute left-1/2 top-[calc(64px+2.62vw)] z-[4] w-[110vw] -translate-x-1/2",
  "ribbon.band": "-rotate-3 overflow-hidden bg-accent shadow-[0_6px_18px_rgba(0,0,0,0.4)]",
  "ribbon.track": "pile-marquee py-1.5 font-display text-sm text-on-accent",
} as const;

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
  ["input.field", () => inputClass],
  ["label.micro", () => labelVariants({ tone: "micro" })],
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
    expect(CASES.map(([key]) => key).sort()).toEqual(Object.keys(UPSTREAM).sort());
    expect(CASES).toHaveLength(20);
  });

  for (const [key, actual] of CASES) {
    it(key, () => {
      expect(tokens(actual())).toEqual(expected(key, UPSTREAM[key]));
    });
  }
});

describe("the rename table itself", () => {
  it("maps every upstream token that has no Marquee spelling", () => {
    // Every token in every upstream string either survives unchanged, is in the
    // rename table, or is a declared departure. Nothing is quietly dropped.
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

import { BODY_INK_ROLES } from "@marquee-ui/tokens";
import { describe, expect, it } from "vitest";
import { ALERT_TONES, alertVariants } from "@/alert";

/**
 * THE TONE TABLE, HELD TO THE ROLE CONTRACT.
 *
 * `tailwind-compile.test.tsx` proves each tone's utilities resolve to a role
 * variable. It cannot say whether that role is one ANYTHING MEASURES: `text-brand`
 * and `text-primary` compile exactly as well as `text-destructive`, and neither is
 * in the presets' 4.5:1 ink-on-ground matrix, so a tone painted in one would ship
 * a notice whose legibility no check in either package has ever looked at.
 *
 * `BODY_INK_ROLES` is that matrix's ink axis, imported rather than retyped, so this
 * file cannot fall behind a preset check that grows or shrinks.
 *
 * The base and the per-tone delta are computed from the variant function itself -
 * `cva` exposes no config to read back, and a table retyped here would be a copy
 * of the implementation asserting itself.
 */

/**
 * DERIVED from the part's own table, never retyped (layer 1, HIGH-2). A retyped
 * list of five covers exactly the five someone remembered: a SIXTH tone with a
 * disagreeing line, an ink outside the matrix and no story entered neither loop
 * and the whole suite stayed green. `SHIPPED_TONES` below is the one place the
 * axis is stated as a fact, and it is compared to the table rather than used in
 * its place.
 */
const TONES = Object.keys(ALERT_TONES) as (keyof typeof ALERT_TONES)[];

/** The axis this family ships, stated once. A sixth member has to come through here. */
const SHIPPED_TONES = ["default", "destructive", "success", "warning", "info"];

const classesFor = (tone: keyof typeof ALERT_TONES) =>
  alertVariants({ tone }).split(/\s+/).filter(Boolean);

/** Classes every tone carries: the drawing that is not the tone. */
const base = TONES.map(classesFor).reduce((a, b) => a.filter((c) => b.includes(c)));

/** What ONE tone adds on top of that. */
const deltaFor = (tone: keyof typeof ALERT_TONES) =>
  classesFor(tone).filter((c) => !base.includes(c));

const suffix = (token: string, prefix: string) =>
  token.startsWith(prefix) ? token.slice(prefix.length) : null;

describe("the alert's tone axis", () => {
  it("has a real base and a real delta to measure, over the whole shipped axis", () => {
    // Anchor: with an empty base every class would read as a tone, and with an
    // empty delta every assertion below would pass by having nothing to check.
    expect(base).toContain("border-2");
    expect(base).toContain("text-sm");
    expect(base).not.toContain("border-border");
    for (const tone of TONES) expect(deltaFor(tone), tone).toHaveLength(2);
    // …and the loops below run over the table the PART ships, so a sixth tone
    // cannot arrive without being named here first.
    expect(TONES).toEqual(SHIPPED_TONES);
  });

  it("lets a tone move colour and nothing else, and no two tones are the same", () => {
    // A tone is a VISUAL axis (rule 1): it may move colour and nothing else.
    for (const tone of TONES) {
      for (const token of deltaFor(tone)) {
        expect(
          suffix(token, "border-") !== null || suffix(token, "text-") !== null,
          `${tone}: "${token}" is not a colour`,
        ).toBe(true);
      }
    }
    expect([...new Set(TONES.map((t) => deltaFor(t).join(" ")))]).toHaveLength(TONES.length);
  });

  it("paints every tone's ink in a role the presets' contrast check covers", () => {
    const inks = new Map<string, string>();
    for (const tone of TONES) {
      const ink = deltaFor(tone)
        .map((token) => suffix(token, "text-"))
        .filter((role): role is string => role !== null);
      expect(ink, `${tone}: exactly one ink`).toHaveLength(1);
      inks.set(tone, ink[0]!);
    }
    const uncovered = [...inks].filter(
      ([, role]) => !(BODY_INK_ROLES as readonly string[]).includes(role),
    );
    expect(uncovered, "tone inks outside the 4.5:1 ink-on-ground matrix").toEqual([]);
  });

  it("moves the line and the ink together, and the line is a status role or the house line", () => {
    for (const tone of TONES) {
      const delta = deltaFor(tone);
      const line = delta.map((t) => suffix(t, "border-")).filter((r): r is string => r !== null);
      const ink = delta.map((t) => suffix(t, "text-")).filter((r): r is string => r !== null);
      expect(line, `${tone}: exactly one line colour`).toHaveLength(1);
      // Either the tone is a status, and then both halves are the SAME role - so a
      // red box can never carry green ink - or it is the neutral notice, drawn in
      // the house line and the house body ink.
      const paired = line[0] === ink[0];
      const neutral = line[0] === "border" && ink[0] === "foreground-2";
      expect(paired || neutral, `${tone}: line ${line[0]} with ink ${ink[0]}`).toBe(true);
    }
  });

  it("would notice an ink outside the matrix", () => {
    // The instrument's own reddening case, in the shape of the claim above.
    expect((BODY_INK_ROLES as readonly string[]).includes("destructive")).toBe(true);
    expect((BODY_INK_ROLES as readonly string[]).includes("brand")).toBe(false);
    expect((BODY_INK_ROLES as readonly string[]).includes("primary")).toBe(false);
  });
});

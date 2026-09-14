# As built

## DESIGN-LIB-a1: the repo foundation and the tokens package (2026-09-14)

Scope: steps 1, 2, 3 and 5 of DESIGN-LIB sub-slice a. No shadcn init, no registry,
no Storybook, no docs site, no components, no `LICENSE`, nothing published, nothing
pushed. Nothing in the consuming repo was changed; it was read only.

### What shipped

- pnpm workspace, node 22, pnpm 10.24.0 pinned, TypeScript strict with no `any`,
  vitest, eslint + prettier matching the consuming repo's settings, and a root
  `pnpm verify` = lint + typecheck + test + build.
- `packages/tokens` (`@marquee-ui/tokens`, `"private": true` until the licence is
  decided): the typed role contract, the fixed skeleton, `arcade` (dark, default)
  and `light`, the CSS and W3C DTCG emitters, the build checks, and the three faces
  with their OFL texts.

### Measurements, and what they corrected

**The display pads.** Generated with fontkit from `boldonse.woff2`, over printable
ASCII, against a `line-height: 1` line box:

|                            | value                                      | glyph                |
| -------------------------- | ------------------------------------------ | -------------------- |
| units per em               | 1000                                       |                      |
| typo ascender / descender  | 1.520em / -0.400em                         | `useTypoMetrics` set |
| line box at `leading-none` | 1.060em above / 0.060em ABOVE the baseline |                      |
| highest ink                | 1.299em                                    | `$`                  |
| deepest ink                | 0.300em                                    | `g`                  |
| cap overflow → pad         | 0.239em → **0.40em**                       |                      |
| descender overflow → pad   | 0.360em → **0.55em**                       |                      |

Four numbers reproduce what the consuming app documented before any of this existed
(1000 upm, 1.520/-0.400, the 1.060em line-box top, and 1.200em of cap ink over the
alnum set giving 0.140em of overflow), so the generator agrees with the measurement
that was taken on a device.

Two corrections fall out of it:

1. **The cap pad is 0.40em, not 0.30em.** Applying the same rule to the alnum-only
   coverage set reproduces 0.30em exactly, so 0.30em was right for capitals and
   digits. Over printable ASCII, `$` reaches 1.299em where `C` reaches 1.200em, and
   the pad has to cover the text a display face will actually be given.
2. **The descender pad is 0.55em, not 0.50em, and the -458 in the upstream comment
   is the FULL FONT bbox, not a letter.** No printable-ASCII glyph reaches it; the
   deepest is `g` at -300. 0.50em happened to cover 0.458em of imagined ink and
   happens not to cover 0.360em of real overflow plus the rounding allowance.

**Contrast.** Measured with culori's `wcagContrast` over the whole matrix (9 body
inks x 5 grounds + 2 ink-on-fill pairs = 47 comparisons per preset). Arcade fails
exactly one pair: `muted` (#858c62) on `overlay` (#22261a) at **4.36:1**, 0.14 short
of AA. It clears on every other ground (5.57 / 5.24 / 4.88 / 5.70). Shipped as a
recorded exception rather than a silent pass or a moved colour, because the package
must not move the consuming app's pixels. `light` ships no exceptions; its worst
pair is `muted` on `sunken` at 5.25:1.

`foreground-faint` is out of the 4.5:1 set by WCAG 1.4.3's exemption for inactive
components: it measures 3.26 / 3.06 / 2.85 / 2.55 / 3.33 and is documented upstream
as "AA-large / disabled only". The data roles are out of it too - they are graphics
paired with a numeral, not text.

**ΔE2000 floor = 25.** Measured while choosing it: two shades of the same acid
yellow (#e4ff3a / #e8ff50) are 1.45 apart, below the ~2.3 JND; the closest real pair
in the system, yellow against amber, is 30.83; Arcade's own primary against its
destructive is 63.83 and light's is 71.46. 25 sits an order of magnitude above a JND
and below the closest pair the system actually draws.

**Tailwind theme keys.** `--default-font-family`, `--default-mono-font-family` and
`--default-transition-duration` were verified against `tailwindcss` 4.x `theme.css`
before being emitted (`--default-font-family` is `--theme(--font-sans, initial)` and
preflight reads it), rather than assumed. Tailwind was installed for that read and
removed again: this package emits CSS and does not compile it. Proving the emitted
sheet through a real Tailwind compile belongs with the docs site, which needs the
dependency anyway.

**Font licences.** Each OFL text was pulled from that family's own upstream repo,
and its first line matches the `copyright` record inside the corresponding woff2
exactly. `test/fonts.test.ts` keeps the pairing honest.

### Consumers

Run at the commit point against the whole tree, since every file in it is new
(`git diff $(git hash-object -t tree /dev/null) HEAD -- 'packages/**'`). The
equivalent run "before writing code" was empty by construction: the repository did
not exist.

**85 exported names**, two of which are grep artefacts (`P` from a generic parameter,
`satisfies` from an `as const satisfies` clause). Every consumer of every one of them
is inside this repository - `src/index.ts`, the other modules, and `test/`.

**Nothing outside this repository consumes any of them.** The package is
`"private": true`, unpublished, unpushed, and referenced by no lockfile or workspace
anywhere. The one mention of `marquee-ui` in the consuming repo is a line in its own
planning doc, `docs/slices/DESIGN-LIB.md`; there is no code reference. The consume
step is a later sub-slice and is not this stream's.

**One naming note for whoever does that step:** the consuming app already has a
`.pile-marquee` class and a `--marquee-dur` custom property, for its ticker. They are
unrelated to the package name and do not collide (different namespace, and
`--marquee-dur` is deliberately not carried by this package), but the word will
appear twice in that codebase meaning two different things.

### Decisions

1. **Package name `@marquee-ui/tokens`, repo package `marquee-ui-repo`, private.**
   [V] D12 names the npm scope `marquee-ui`; the tokens package takes the scope.
2. **ΔE2000 floor 25.** [V] Evidence above.
3. **Role names that differ from upstream**, all recorded in
   `packages/tokens/README.md`: `--star-ghost` → `--scale-empty` and `--score-*` →
   `--scale-*` (D7, product word out); `--danger` → `--destructive` (shadcn);
   `--font-sans` → `--font-body`; `--shadow-hard` → `--shadow-lift`; `--border-w` →
   `--border-width`; `--accent` splits into `brand` and `primary`. [V]
4. **`foreground-faint` is not contrast-checked**, on WCAG 1.4.3's exemption for
   inactive components, rather than carried as five exceptions. [V]
5. **The skeleton is not per-preset** (D16): the type scale, spacing, radii, motion
   and the layout maxima live in `src/skeleton.ts` and no preset may move them. A
   preset owns colour, the faces and depth.
6. **`--marquee-dur` is not carried.** It is a component token, and the two upstream
   files disagree about it (16s vs 44s).
7. **DTCG `$value` is a string for every type.** The 2024 draft's `{value, unit}`
   dimension cannot express `clamp(2.5rem, 1.93rem + 3.37vw, 4.75rem)`, which is a
   real token here.
8. **The literal guard strips comments before scanning.** A colour in prose cannot
   paint a pixel, and the evidence for a threshold belongs next to the threshold.
9. **No JS/`.d.ts` build.** The package exports its TypeScript source and the two
   generated artefacts; a publishable build lands with the first publish, which is
   blocked on the licence decision.

### Guards, each proved by running its reddening mutation

All three ran in a DETACHED WORKTREE of the committed head `8c8039b`, the landing was
confirmed by grep before the run, and each was reverted with `git checkout --`.

| guard      | mutation                                                                                     | landed           | the red it produced                                                                                                                                                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| round trip | `"  --zz-probe: 1px;"` added to the `:root` role block in `src/emit/css.ts`, JSON untouched  | `css.ts:70`      | 5 tests red. `arcade: "--zz-probe" is declared in the stylesheet but absent from the JSON` (and the same for `light`); `pnpm build` exited non-zero with `FAIL [round-trip] ...` and `2 preset(s) did not publish.`                                     |
| brand      | `/* ported from thepile's locked token sheet */` added above `TypeStep` in `src/skeleton.ts` | `skeleton.ts:11` | `brand guard > ships no brand string of the consuming app` red with `packages/tokens/src/skeleton.ts: "thepile"`                                                                                                                                        |
| literal    | `export const FALLBACK_INK = "#f2f5e8";` added to `src/roles.ts`                             | `roles.ts:19`    | BOTH halves red: `finds no literal colour, font name or shadow outside src/presets/**` with `packages/tokens/src/roles.ts: a hex colour (#f2f5e8)`, and `finds no preset VALUE copied out of its preset` with `packages/tokens/src/roles.ts: "#f2f5e8"` |

The literal guard reddening on both halves is the point of having two: the generic
pattern and the runtime read of the presets' own values are independent instruments,
and each was watched firing.

## Layer 1 (reviewer, detached worktree of 89b8510, slot 7)

Baseline `pnpm test`: `Test Files 7 passed (7)` / `Tests 60 passed (60)`. `pnpm lint` exit 0, `pnpm typecheck` exit 0, `pnpm build` exit 0. 38 mutations run; every one reverted with `git checkout --` and the landing confirmed by grep first.

<!-- prettier-ignore-start -->

| file | test | mutation applied | red / GREEN | what it asserts now |
| --- | --- | --- | --- | --- |
| src/build.ts:66 | build.test.ts `builds Arcade with no failures and real output` | `pads` never assigned from `displayPads()` — build publishes `--display-cap-pad: 0em` / `--display-descender-pad: 0em` | **GREEN 60/60** | that `built.pads.capPad` matches `/^\d+(\.\d+)?em$/`, which `"0em"` satisfies. Nothing that a pad was measured |
| test/helpers/source-files.ts:12 | brand-guard + literal-guard, all 5 assertions | walker skips `src/emit` and `src/checks` (6 of 17 published files) | **GREEN 60/60** | that the files it happened to walk are clean. Both anchors pass on a floor of 8 with 17 files |
| test/helpers/source-files.ts:12 + src/emit/css.ts | same 5 | plant `const FALLBACK_INK = "#e4ff3a"; // thepile Pile Score` in `src/emit/css.ts`, then skip `emit/` | **GREEN 60/60** (red 3 with walker intact) | nothing — a real brand string *and* a real hex literal ship unseen |
| src/emit/css.ts:72 | none | delete the whole `@media (prefers-reduced-motion: reduce)` block | **GREEN 60/60** | nothing observes it |
| src/emit/css.ts:85 | none | emit no `--color-*` `@theme inline` mapping (`bg-surface`, `text-foreground` stop compiling) | **GREEN 60/60** | nothing — `declaredCssVars` skips inline blocks by design, so the round-trip is blind here |
| src/emit/css.ts:93 | none | comment out the whole `@theme inline reference` shadow/ease mapping | **GREEN 60/60** | nothing |
| src/emit/css.ts:29 | round-trip.test.ts `ships a @font-face for every face` | drop `font-style`, `font-weight`, `font-display: swap` from every `@font-face` | **GREEN 60/60** | only that the `url(...) format("woff2")` substring is present |
| src/tokens.ts:251 | none | drop `--default-font-family`, `--default-mono-font-family`, `--default-transition-duration` | **GREEN 60/60** | nothing, despite the 10-line docblock calling them load-bearing |
| src/tokens.ts:155-239 | none | emit no `radius`, `tracking`, `weight`, `layout` or `space` tokens at all | **GREEN 60/60** | nothing — including `--hit-min: 44px` |
| src/checks/contrast.ts:110 | none | delete the dead-exception **and** empty-reason loop entirely | **GREEN 60/60** | nothing; both branches are implemented and unproved |
| src/checks/contrast.ts:119 | none | `if (!exception.reason.trim())` → `if (false)` | **GREEN 60/60** | nothing |
| src/checks/contrast.ts:111 | none | `if (!seen.has(...))` → `if (false)` | **GREEN 60/60** | nothing |
| src/checks/contrast.ts:69 | none | non-finite-ratio branch → `if (false)` | **GREEN 60/60** | nothing |
| src/font-metrics.ts:71 | none | `USE_TYPO_METRICS` throw → `if (false)` | **GREEN 60/60** | nothing; the precondition of the whole pad formula |
| src/font-metrics.ts:102 | none | "no measurable ink" throw → `if (false)` | **GREEN 60/60** | nothing |
| src/presets/arcade.ts:110,117 | fonts.test.ts:39 `declares the family the preset names` | `family: "Boldonse"`→`"Bold"`, `"Space Grotesk"`→`"Space"` | **GREEN 60/60** | that the font's name *starts with* the preset's — a prefix passes, and the emitted CSS then names families no font has |
| src/emit/dtcg.ts:43 | none | duplicate-token-path throw removed | **GREEN 60/60** | nothing |
| src/resolve.ts:11 | none | undeclared-primitive throw removed | **GREEN 60/60** | nothing |
| src/tokens.ts:48 | none | `interpolateRoles` unknown-role throw removed | **GREEN 60/60** | nothing — a typo'd `{primar}` ships as a dead `var(--primar)` |
| test/helpers/source-files.ts:25 | brand-guard/literal-guard guard bodies | `sourceFiles()` → `return []` | red **2** (anchors only); the 3 guard bodies stay **GREEN** | the anchors catch it at file level; the guards themselves assert `[] == []` |
| test/helpers/source-files.ts:48 | literal-guard bodies | `stripComments()` → `return ""` | red **1** (anchor only); 2 guard bodies stay **GREEN** | same shape |
| src/tokens.ts:278 | round-trip + build | `buildTokens` drops the whole `theme` tier | red **1** (`gives the three size-only steps no line-height pair`) | round-trip stays green: both emitters read one list, so it is symmetric under any collapse |
| test/helpers/source-files.ts:6 | both guards | `repoRoot` off by one level (either direction) | red (2 **files**) | ENOENT at collection — but the runner prints `Tests 53 passed (53)`, **0 failed tests**; only the file line and stderr show it |
| src/checks/contrast.ts:58 | checks.test.ts, build.test.ts | `checkContrast` → `return []` | red 5 | `Arcade passes every check`, `light passes…`, `accepts Arcade's one recorded shortfall` all stay green (negative-only) |
| src/checks/distinctness.ts:28 | checks.test.ts, build.test.ts | `checkDistinctness` → `return []` | red 2 | instrument works |
| src/checks/contrast.ts:48 | checks.test.ts, build.test.ts | `contrastMatrix` → `results.slice(0, 1)` | red 8 | the 47-comparison count anchor fires |
| src/checks/contrast.ts:78 | checks.test.ts | stale-exception detection → `if (false)` | red 1 | proved |
| src/checks/contrast.ts:100 | checks.test.ts | rotting-exception detection → `if (false)` | red 1 | proved |
| src/emit/css.ts:113 | round-trip, build | `declaredCssVars` → `return []` | red 9 | proved |
| src/emit/dtcg.ts:53 | round-trip, build | `emitDtcg` → description-only document | red 7 | proved |
| src/emit/dtcg.ts:57 | round-trip, build | `declaredJsonVars` → `return []` | red 5 | proved |
| src/resolve.ts:14 | checks, build, literal-guard | `resolveColor` → one fixed `#808080` | red 8 | proved |
| src/font-metrics.ts:134 | font-metrics.test.ts | `padEm` → returns its input | red 4 | proved |
| src/font-metrics.ts:83 | font-metrics.test.ts | `halfLeading` sign flipped / forced to 0 | red 4 each | geometry is genuinely pinned |
| src/font-metrics.ts:106,109 | font-metrics.test.ts | `lineBoxTopEm` / `lineBoxBottomEm` sign flipped | red 4 / red 3 | proved |
| src/font-metrics.ts:157 | font-metrics.test.ts | `descenderPad` emits the **cap** pad | red 1 | proved |
| src/tokens.ts:41 | round-trip, build | `PRIMITIVE_PREFIX` `--mq-` → `--zz-` | red 4 | proved |
| src/emit/css.ts:69 / dtcg.ts:53 | round-trip, build | hand-add a line to either template | red 5 / red 6 | the round trip does catch both directions, as its docblock claims |
| src/presets/arcade.ts:66 | `pnpm build` | `foreground-2` → `olive-700` | build **exit 1**, 5 pairs named, `dist/tokens.css` unchanged | the publish gate is real |

<!-- prettier-ignore-end -->

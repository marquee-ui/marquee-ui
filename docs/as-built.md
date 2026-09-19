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
of AA. It cleared on every other ground (5.57 / 5.24 / 4.88 / 5.70).

**PALETTE-1 (2026-09-14, Ankit): fixed, not recorded.** The first instinct here was to
ship it as a recorded exception, on the reasoning that the package must not move the
consuming app's pixels. Ankit's call went the other way: the upstream app moved
`--text-muted` #858c62 -> **#888f65** (+3 per channel) and this package follows.
Re-measured here: **5.79 / 5.45 / 5.07 / 4.53 / 5.93** on background / surface /
raised / overlay / sunken, so the pair clears AA by 0.03 and every other ground gained
~0.2. **Arcade now ships ZERO exceptions**, and so does `light` (worst pair `muted` on
`sunken` at 5.25:1). The exception mechanism keeps all five of its rules and is proved
entirely through fixtures, including the positive case - an accurate, justified, real
exception must be ACCEPTED, or a check that simply refused every exception would
satisfy the other four.

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

### Decisions Ankit has taken (accepted, 2026-09-14)

1. **Role names follow shadcn wherever shadcn has a name.** The primary consumer of
   this library is an AI installing a component, so the names that already sit in
   every model's head win over names that are merely ours: `background`,
   `foreground`, `border`, `muted`, `primary`, `destructive`. Where shadcn has no name
   for the thing - the six-step `scale`, `shadow-lift`, `hit-min`, `display-cap-pad` -
   keep the closest popular convention rather than inventing vocabulary. This is what
   settles the rename table in `packages/tokens/README.md`.
2. **`@marquee-ui/tokens` as the package name, ΔE2000 25 as the distinctness floor,
   and the `foreground-faint` exemption from the 4.5:1 set all stand** as proposed.
3. **PALETTE-1: the 4.36:1 shortfall is FIXED, not recorded.** See the measurement
   above. The exception mechanism stays in full, with no preset using it.

### Decisions

1. **Package name `@marquee-ui/tokens`, repo package `marquee-ui-repo`.** ACCEPTED by
   Ankit. D12 names the npm scope `marquee-ui`; the tokens package takes the scope.
   Still `"private": true` until the licence is decided.
2. **ΔE2000 floor 25.** ACCEPTED by Ankit. Evidence above.
3. **Role names that differ from upstream**, all recorded in
   `packages/tokens/README.md`: `--star-ghost` → `--scale-empty` and `--score-*` →
   `--scale-*` (D7, product word out); `--danger` → `--destructive` (shadcn);
   `--font-sans` → `--font-body`; `--shadow-hard` → `--shadow-lift`; `--border-w` →
   `--border-width`; `--accent` splits into `brand` and `primary`. ACCEPTED by Ankit
   under the shadcn-names rule above.
4. **`foreground-faint` is not contrast-checked**, on WCAG 1.4.3's exemption for
   inactive components, rather than carried as five exceptions. ACCEPTED by Ankit.
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

### Acting on the layer-1 findings (fixes at `4491b90`)

Every mutation below is the reviewer's own, re-run in a DETACHED WORKTREE of the
committed fix head, landing confirmed by grep, reverted with `git checkout --`.
Baseline `Tests 90 passed (90)`.

<!-- prettier-ignore-start -->

| finding | mutation re-run | was | now |
| --- | --- | --- | --- |
| HIGH 1 | `pads` never assigned from `displayPads()` in `build.ts` | GREEN 60/60 | red 2 — `publishes MEASURED pads, not the shape of one`, `writes the same measured pads for the light preset` |
| HIGH 2 | walker skips `src/emit` and `src/checks` | GREEN 60/60 | red 3 + the walker itself throws `source walk does not match the published set … Missing: [checks/contrast.ts, checks/distinctness.ts, checks/index.ts, checks/types.ts, emit/css.ts, emit/dtcg.ts]` |
| HIGH 2b | plant `const FALLBACK_INK = "#e4ff3a"; // thepile Pile Score` in `src/emit/css.ts`, then skip `emit/` | GREEN 60/60 | red 3 — `Missing: [emit/css.ts, emit/dtcg.ts]`; the walk cannot be narrowed to hide the plant |
| HIGH 3 | light `scale-empty` back to `olive-400` | GREEN 60/60 | red 2 — `light passes every check, with no exceptions at all`, `builds light with no failures` |
| HIGH 4a | delete the `@media (prefers-reduced-motion: reduce)` block | GREEN 60/60 | red 1 — `zeroes both durations under prefers-reduced-motion` |
| HIGH 4b | emit no `--color-*` `@theme inline` mapping | GREEN 60/60 | red 1 — `maps every colour role into the colour namespace` |
| HIGH 4c | drop the whole `@theme inline reference` block | GREEN 60/60 | red 1 — `compiles the shadow and easing utilities without re-emitting the variables` |
| MED 5a | delete the dead-exception and empty-reason loop | GREEN 60/60 | red 2 — `fails an exception that names a pair the matrix never makes`, `fails an exception carrying no reason` |
| MED 5b | `if (!exception.reason.trim())` → `if (false)` | GREEN 60/60 | red 1 — `fails an exception carrying no reason` |
| MED 5c | `if (!seen.has(…))` → `if (false)` | GREEN 60/60 | red 1 — `fails an exception that names a pair the matrix never makes` |
| MED 6 | the new overstated-exception rule → `if (false)` | (hole) | red 1 — `fails an exception that records a ratio WORSE than the measured one` |
| MED 7 | `family: "Boldonse"`→`"Bold"`, `"Space Grotesk"`→`"Space"` | GREEN 60/60 | red 1 — `declares the family the preset names` |
| MED 8a | drop `--default-font-family`, `--default-mono-font-family`, `--default-transition-duration` | GREEN 60/60 | red 1 — `declares exactly the contract, no more and no less` |
| MED 8b | emit no `radius`, `tracking`, `weight`, `layout` or `space` tokens | GREEN 60/60 | red 1 — same test |
| MED 9 | drop `font-style`, `font-weight`, `font-display: swap` from every `@font-face` | GREEN 60/60 | red 1 — `ships every descriptor for every face, not just the src` |
| MED 10 | `assertUsesTypoMetrics` early-return | GREEN 60/60 | red 1 — `throws naming the face when it does not, because the formula assumes it` |
| LOW 16 | remove the `interpolateRoles`, `resolveColor` and `addToken` throws | GREEN 60/60 | red 3, one per throw |
| (mine) | remove the unparseable-colour guard in `contrastMatrix` | n/a | red 1 + the raw `TypeError: Cannot read properties of undefined (reading 'r')` it used to produce |

<!-- prettier-ignore-end -->

### Findings recorded rather than fixed

- **11, no corpus-level test-quality guard.** RECORDED. Worth porting before the
  component packages land, when there are stories and many more suites; against 11
  test files today it would find nothing these 18 mutations did not.
- **15, the block parser is foolable** by a multi-line `@theme\n inline {` prelude, a
  `--quote: "}"` value, or a value containing the text `@theme inline`. RECORDED, and
  none is reachable: the parser's only input is this package's own emitter, which
  produces neither. It gets hardened when it is first pointed at a stylesheet a human
  wrote.
- **17, a collection error reads as a clean `Tests` line** (`Tests 53 passed (53)`
  with two files failing at import). RECORDED. The exit code holds and `pnpm verify`
  reads it; the note is that the `Tests` line alone is not the verdict.
- **18, `writeResults` hardcodes `FONTS_DIR` while `buildPreset` takes `fontsDir`.**
  RECORDED. One caller, `main()`, always uses the package's own faces; a second fonts
  directory is a problem only if one is ever introduced, and the signature is already
  the half that is parameterised.
- **12, 13, 14, 16, 19: FIXED.** The padEm test retitled to say it is the alnum-set
  number; `AGENTS.md` corrected to say the brand guard reddens `pnpm test`, not
  `pnpm build`; `7.3:1` corrected to the measured `7.63:1`; the three throws proved;
  the `--safe-*` row added to the README's mapping table.

## Consumers (DESIGN-LIB-a2)

**Run 1, before writing code.** Empty by construction: the branch was created at
`c5e4539d` and the diff was empty, so no exported name was added or changed yet.
The one scan that was NOT vacuous is the outward one, and it was run:

```
$ git -C <reference repo> grep -l 'marquee-ui' ffb71a66 -- apps packages
(no hits)
$ git -C <reference repo> grep -l 'marquee-ui' ffb71a66
ffb71a66:STATUS.md
ffb71a66:docs/slices/DESIGN-LIB.md
ffb71a66:docs/slices/MOBILE-1.md
```

Three planning documents and no code reference anywhere. Nothing outside this
repository consumes anything in it; the consume step is a3's.

**Run 2, at the commit point** (re-run after the layer-1 fixes; the numbers below are
the second run). **77 exported names** added or changed under `packages/**`:

```
Accordion AccordionContent AccordionItem AccordionTrigger AlertDialog AsChildLink
Badge BadgeProps Button ButtonProps CallerClassWins Card CardContent
CardDescription CardFooter CardHeader CardTitle ChildScrolls Clickable Closed
ContentOnly CustomSeparator Danger DangerArmed Decorative Default Destructive
Disabled DismissesItself Empty ExplicitType Ghost HiddenTitle Horizontal Input
Label LabelProps MessageOnly Micro MicroAsHeading Multiple OneClaim Primary
PrimaryRounded Ribbon RibbonProps STORY_FILES ScannedFile Secondary Separator
Sheet SheetBody SheetClose SheetContent SheetDescription SheetOverlay SheetPortal
SheetTitle SheetTrigger Single Success Toast ToastAction ToastMessage ToastProps
Vertical WithAction WithMarker WithValue badgeVariants buttonVariants cn
inputClass labelVariants microLabelClass sourceFiles storyFiles
```

plus one outside `packages/**`: **`TEST_GLOB`**, exported from `vitest.config.ts`.

`grep -rln` was run for every one of them over `packages`, `.storybook`,
`vitest.config.ts` and `registry.json`.

- **39 distinct STORY names** across 42 stories (several files reuse `Default`).
  They are exports only because CSF makes them so, and their only consumers are
  `test/stories.test.tsx` and `test/tailwind-compile.test.tsx`, which compose every
  module.
- **`microLabelClass` is a grep artefact**, and the only one: it appears inside a
  string literal in `test/fixtures/extract-upstream.mjs`
  (`after(forms, "export const microLabelClass =", …)`), which is the marker that
  generator searches the reference source for. Nothing exports it here.
- **`TEST_GLOB`** is consumed by `vitest.config.ts` itself and by
  `packages/tokens/test/project-coverage.test.ts`, which is the point of it: one
  spelling for both projects' includes, and a test that every package with tests is
  named by one.
- **Every other name has at least one consumer inside this repository, and none has
  a consumer outside it.**

The surfaces this stream changed that a sibling reads, both inside the tokens
package and both this stream's own to change per the brief:

- `sourceFiles` gained a sibling, `storyFiles`, and its return type is now the named
  `ScannedFile[]` (the same shape it always returned). Consumers:
  `brand-guard.test.ts`, `literal-guard.test.ts`, `source-coverage.test.ts`. The
  brand guard now scans source AND stories; the literal guard deliberately still
  scans source only, because a story may legitimately paint a swatch.
- `--shadow-band` was ADDED to the emitted token contract, and three rows were added
  to `ON_FILL_PAIRS`, which the brief permits (adding; never renaming or removing).
  Consumers: `emitted-surface.test.ts`'s list and count, `checks.test.ts`'s matrix
  count (52 → 55), `packages/tokens/README.md`, and `ribbon.tsx`.

**0 CROSS. 1 NEW between the two runs (`microLabelClass`, the grep artefact above,
resolved). 0 UNOWNED.**

**Outward, re-run at the second commit point:** `git -C <reference repo> grep -l
'marquee-ui' ffb71a66 -- apps packages` still returns nothing.

## DESIGN-LIB-a2: the components as parts, Storybook, and the registry (2026-09-14)

Scope: step 4 of DESIGN-LIB sub-slice a, plus the Storybook and registry halves of
step 1. Ten part families, the stories that are also the tests, a shadcn registry
built and committed, the first real Tailwind compile of the emitted sheet, and a
CI workflow. No docs site, nothing published, no version bump, and nothing in the
consuming repo was changed - it was read only, at commit `ffb71a66`.

### What shipped

`packages/ui` (`@marquee-ui/ui`, `"private": true`), ten part families in shadcn's
lowercase file spelling, each a set of PARTS with `asChild` slots and `cva` for
visual axes only (D6):

| part      | moved or new              | primitive          | parts                                                                                                                               |
| --------- | ------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Button    | moved                     | Radix Slot         | `Button` + `buttonVariants`                                                                                                         |
| Input     | moved (`inputClass`)      | none               | `Input` + `inputClass`                                                                                                              |
| Label     | moved (`microLabelClass`) | Radix Label        | `Label` + `labelVariants` (`default`, `micro`)                                                                                      |
| Sheet     | moved                     | Radix Dialog       | `Sheet`, `SheetTrigger`, `SheetPortal`, `SheetOverlay`, `SheetContent`, `SheetTitle`, `SheetDescription`, `SheetBody`, `SheetClose` |
| Toast     | moved                     | none (body portal) | `Toast`, `ToastMessage`, `ToastAction`                                                                                              |
| Ribbon    | moved                     | none               | `Ribbon` + `src/ribbon.css`                                                                                                         |
| Card      | new                       | none               | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`                                                   |
| Accordion | new                       | Radix Accordion    | `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`                                                                |
| Badge     | new                       | Radix Slot         | `Badge` + `badgeVariants` (four tones)                                                                                              |
| Separator | new                       | Radix Separator    | `Separator`                                                                                                                         |

Also: `packages/ui/stories` (42 stories, 25 of them carrying a `play`),
`packages/ui/test` (8 suites),
`registry.json` + the built `packages/ui/r`, `.storybook/`,
`.github/workflows/verify.yml`, `cn` with merge semantics (D11), and one new token
role, `--shadow-band`.

### The fidelity mapping, per utility

No class string in this package was retyped. The upstream strings were read with
`git show ffb71a66:apps/web/src/components/ui/*` - the four button strings and the
input from the byte-pins that repo's own tests produced by EVALUATING the module -
and transliterated by a script through the a1 rename table.
`packages/ui/test/fidelity.test.tsx` carries the upstream strings and the table and
re-derives the expectation at run time, so a mistake in the TABLE reddens too; it
compares the utility SET rather than the string, because every utility sits at the
same specificity and the class attribute's order decides nothing.

| upstream utility                       | Marquee utility                              | where                      |
| -------------------------------------- | -------------------------------------------- | -------------------------- |
| `bg-accent`                            | `bg-primary`                                 | button, ribbon             |
| `text-on-accent`                       | `text-primary-foreground`                    | button, ribbon             |
| `shadow-hard`                          | `shadow-lift`                                | button, toast              |
| `hover:shadow-[4px_4px_0_var(--text)]` | `hover:shadow-[4px_4px_0_var(--foreground)]` | button                     |
| `hover:bg-accent-hover`                | `hover:bg-primary-hover`                     | button                     |
| `border-line-strong`                   | `border-border-strong`                       | button, toast              |
| `text-text`                            | `text-foreground`                            | button, form, sheet, toast |
| `hover:border-text-muted`              | `hover:border-muted`                         | button                     |
| `text-danger`                          | `text-destructive`                           | button                     |
| `hover:border-danger`                  | `hover:border-destructive`                   | button                     |
| `border-danger`                        | `border-destructive`                         | button                     |
| `border-line`                          | `border-border`                              | button, form, sheet        |
| `text-text-secondary`                  | `text-foreground-2`                          | button, form, sheet        |
| `hover:border-line-strong`             | `hover:border-border-strong`                 | button                     |
| `hover:text-text`                      | `hover:text-foreground`                      | button                     |
| `placeholder:text-text-muted`          | `placeholder:text-muted`                     | form                       |
| `focus:border-accent`                  | `focus:border-primary`                       | form                       |
| `pb-[max(1rem,var(--safe-bottom))]`    | `pb-[max(1rem,var(--safe-bottom,0px))]`      | sheet                      |
| `bg-line-strong`                       | `bg-border-strong`                           | sheet                      |
| `text-accent-ink`                      | `text-primary-ink`                           | toast                      |

**Three departures that are not a rename**, each declared in the test with its
reason, and each proved to actually fire:

| where           | from                                                                                              | to                                      | why                                                                                                                                                                                                                                                                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sheet.content` | `pb-[max(1rem,var(--safe-bottom))]`                                                               | `pb-[max(1rem,var(--safe-bottom,0px))]` | the safe-area inset is the consumer's document-level plumbing and a1 deliberately did not carry it. Without the fallback an undefined custom property makes the whole declaration invalid at computed-value time and the sheet loses its bottom padding outright. Where the consumer DOES define it, the two spellings compute the same pixel. |
| `ribbon.band`   | `bg-accent` -> `bg-primary` -> `bg-brand`; `shadow-[0_6px_18px_rgba(0,0,0,0.4)]` -> `shadow-band` |                                         | D8 splits identity from action, and a band that announces the product is identity. Arcade assigns the same yellow to both, so no pixel moves. The shadow could not stay: a literal colour outside `src/presets/**` fails the literal guard, and the value is not any step of the existing ramp.                                                |
| `ribbon.track`  | `pile-marquee` -> `mq-marquee`; `text-on-accent` -> `text-brand-foreground`                       |                                         | the upstream class name carries the product's own noun (D7). The keyframes and the class ship as `packages/ui/src/ribbon.css`, which `ribbon.tsx` imports and the registry installs beside it.                                                                                                                                                 |

### API changes a3 has to make at the call sites

These are the deliberate consequences of D6, not accidents. None of them moves a pixel.

| upstream                                                                         | Marquee                                                                                                               | note                                                                                                                                                       |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<Button href="/x">`                                                             | `<Button asChild><Link href="/x">…</Link></Button>`                                                                   | the library owns no router. The "no `type` on the link form" behaviour survives: the `asChild` branch never writes one.                                    |
| `<Button rounded>`                                                               | `<Button variant="primaryRounded">`                                                                                   | a boolean that is a no-op on three of four variants is a variant, not a flag.                                                                              |
| `<Sheet title=… hideTitle childScrolls role=…>`                                  | `<SheetContent>` with `<SheetTitle className="sr-only">`, with or without `<SheetBody>`, `role` passed to the content | the `role: undefined` bug the monolith had cannot recur: a part only spreads what the caller wrote.                                                        |
| `<Toast toast={{message, action}} onDismiss>`                                    | `<Toast open onDismiss><ToastMessage/><ToastAction/></Toast>`                                                         | replacing the message while open needs a changing `key`, because the timer is an effect.                                                                   |
| `data-testid="sheet-handle"` / `"sheet-body"`                                    | `data-slot="sheet-handle"` / `"sheet-body"`                                                                           | shadcn's convention. 3 and 5 hits respectively in the consuming repo at the read commit.                                                                   |
| `.pile-marquee`                                                                  | `.mq-marquee`, from `components/ui/ribbon.css`                                                                        | 13 hits in 5 files upstream.                                                                                                                               |
| the monolith spread `{"aria-describedby": undefined}` when it had no description | every `<SheetContent>` with no `<SheetDescription>` passes `aria-describedby={undefined}` itself                      | Radix warns otherwise, and a part cannot know whether a Description is among its children. Moves no pixel; three of the four sheet stories show the shape. |
| `<label className={microLabelClass}>` on a span                                  | `<Label tone="micro" asChild><span>…</span></Label>`                                                                  | or keep the class: `labelVariants({ tone: "micro" })` is exported.                                                                                         |

### Every UNVERIFIED claim in the brief, measured

**1. The literal guard reddens on a hex in a component file.** RUN, red, quoted below.

**2. The brand guard reddens on the product's noun in a story.** RUN, red, quoted
below. This needed the guard to be EXTENDED first: a1's walker only saw
`packages/*/src`, so a story was invisible to it. Stories are now a second checked
list (`STORY_FILES`), walked and compared the same way.

**3. The role utilities resolve to `var(--role)` in a real Tailwind 4 compile.**
CONFIRMED, and read directly rather than asserted: `bg-primary` compiles to
`background-color: var(--primary)`, `min-h-hit` to `min-height: var(--hit-min)`,
`text-3xs` to `font-size: var(--text-3xs)`, `font-display` to
`font-family: var(--font-display)`. One refinement to the brief's expected shape:
`shadow-lift` does NOT compile to `box-shadow: var(--shadow-lift)` - Tailwind 4
emits `--tw-shadow: var(--shadow-lift)` and a composite `box-shadow` that reads the
`--tw-*` chain. The assertion is written against what it actually emits.

**4. A `shadcn add` round trip yields files byte-identical to the sources.** RUN,
and it found two real defects before it was true:

- With no `target`, shadcn 4.21 wrote `src/components/ui/src/button.tsx` - it keeps
  the tail of the library's own path. Every file now carries an explicit `target`.
- `shadcn add` STRIPS A LEADING COMMENT BLOCK from a stylesheet, as a banner. Every
  other comment in the file survives. `ribbon.css` opened with its explanation, so
  the consumer's copy differed from the registry's content on arrival - which would
  make a `shadcn diff` drift check report drift forever, on a file nobody had
  touched. The explanation moved below the first rule and
  `test/registry.test.ts` holds the rule.

  After both fixes, all twelve files (ten `.tsx`, `ribbon.css`, `lib/utils.ts`)
  round-tripped IDENTICAL into a scratch consumer.

**5. `registryDependencies` resolve offline.** They do:
`"registries": { "@marquee": "./node_modules/@marquee-ui/ui/r/{name}.json" }` in the
consumer's `components.json` is read as a local file (proved by its ENOENT when the
file was missing, then by success once it was there). ⚠️ **But a top-level
`shadcn add @marquee/button` does NOT honour a local registry path** in 4.21: it
prefixes `https://ui.shadcn.com/r/` and 404s. The offline install is
`shadcn add ./node_modules/@marquee-ui/ui/r/<name>.json`, with the `registries`
entry present only so the `@marquee/utils` dependency resolves. **a3 must use the
path form.**

### The finding that was not in the brief

**`cn`'s merge semantics do not work on this design system's own token names, and
the failure is silent.** tailwind-merge groups a utility by its knowledge of
Tailwind's DEFAULT scales, so `min-h-hit`, `text-3xs`, `text-display`,
`tracking-label`, `shadow-lift`, `shadow-band`, `max-w-content` and the rest fall
outside every size-ish group and simply stop merging: `cn("min-h-hit", "min-h-0")`
returned `"min-h-hit min-h-0"`, both classes on the element, the stylesheet's order
deciding - which is the exact bug D11 exists to prevent, hiding inside the fix for
it. Colour groups are unaffected (they accept any word), which is why it is
invisible until a size, a shadow or a tracking value is the thing being overridden.

`cn` now uses `extendTailwindMerge` with the seven namespaces this system adds to,
and `test/merge-theme.test.ts` reads the names back out of `dist/tokens.css` and
checks the BEHAVIOUR - for every emitted name, overriding it with a stock utility
of the same namespace must leave exactly the override - so the list cannot fall
behind the emitter.

### Guards, each proved by running its reddening mutation

All ten ran in the COMMITTED tree at `e78d1b9d`, the landing was confirmed by grep
before the run was read (one did not land the first time - a prettier line break -
and the harness refused to read that run rather than report a green), and each was
reverted with `git checkout --`. `git status --short` is empty afterwards.

<!-- prettier-ignore-start -->

| guard | mutation | landed | the red it produced |
| --- | --- | --- | --- |
| literal (a2's extension to the new package) | `const FALLBACK_INK = "#f2f5e8";` in `src/card.tsx` | `card.tsx:4` | BOTH halves: `finds no literal colour, font name or shadow outside src/presets/**` with `"packages/ui/src/card.tsx: a hex colour (#f2f5e8)"`, and `finds no preset VALUE copied out of its preset` with `"packages/ui/src/card.tsx: \"#f2f5e8\""` |
| brand (a2's extension to STORIES) | `// ported from thepile's status chips` above `Default` in `stories/badge.stories.tsx` | `badge.stories.tsx:14` | `ships no brand string of the consuming app` with `"packages/ui/stories/badge.stories.tsx: \"thepile\""` |
| utility coverage | `tracking-label` -> `tracking-caps` in `badgeVariants` | `badge.tsx:17` | `compiles every one of them` with `expected [ 'tracking-caps' ] to deeply equal []` |
| registry staleness | `bg-border` -> `bg-border-strong` in `separator.tsx`, registry NOT rebuilt | `separator.tsx:24` | `carries the CURRENT bytes of every source it ships` with `separator: packages/ui/src/separator.tsx is stale` |
| fidelity | `border-border-strong` -> `border-border` on the toast strip | `toast.tsx:76` | `toast.strip` with `- "border-border-strong"` / `+ "border-border"` |
| merge theme | `spacing: ["hit"]` -> `spacing: []` in `cn` | `lib/utils.ts:30` | `--spacing-*` with `these --spacing-* names are missing from cn's theme list: expected [ 'hit' ] to deeply equal []` |
| stories as tests | `type={type ?? "button"}` -> `type={type}` in `Button` | `button.tsx:86` | `button/Primary` with `expect(element).toHaveAttribute("type", "button")`, received `null` |
| registry css rule | a leading `/* … */` prepended to `ribbon.css` | `ribbon.css:1` | TWO: `keeps no stylesheet's first token a comment`, and `ribbon: packages/ui/src/ribbon.css is stale` |
| preview fonts | `font-weight: 300 700` -> `400` in `.storybook/preview.css` | `preview.css:16` | `declares the same three faces, descriptor for descriptor` with `- "weight": "300 700"` / `+ "weight": "400"` |
| stories as tests (a11y) | `aria-hidden="true"` removed from the sheet handle | `sheet.tsx:73` | `sheet/Default` with `expect(element).toHaveAttribute("aria-hidden", "true")` |

<!-- prettier-ignore-end -->

Each red names the property that was mutated, not a neighbouring one.

### Decisions

1. **Stories run under jsdom through `composeStories`, not in Storybook's browser
   mode.** [V] The browser runner needs a Playwright chromium download in CI and on
   every contributor's machine, for assertions that are all DOM-shaped (roles,
   focus, attributes, portals). The one thing a browser adds that jsdom cannot is
   COMPUTED STYLE, and that is proved directly and more cheaply by
   `tailwind-compile.test.tsx`, which compiles these sources against the real
   emitted stylesheet and reads the declarations. So the two halves are split by
   instrument rather than merged into a slow one. The CI workflow needs no browser
   step. Revisit when visual regression is wanted, which is a different job again.
2. **The registry is built into `packages/ui/r`, not `public/r`.** [V] It has to be
   raw-fetchable from GitHub AND inside the package's `files` for the no-network
   install. One directory satisfies both, and two copies of the same JSON is a
   drift waiting to happen. Raw URL:
   `https://raw.githubusercontent.com/marquee-ui/marquee-ui/main/packages/ui/r/<name>.json`.
3. **`rounded` became a fifth variant, `primaryRounded`.** [V] It was a boolean that
   was a no-op on three of the four variants, and the upstream file says so itself.
4. **`microLabelClass` is a `tone` on `Label`, not an eleventh part** (D10), with
   `asChild` for the common case where the treatment is wanted on a heading rather
   than on a form label. `Label`'s `default` tone is not invented: it is
   `text-sm text-text-secondary`, the modal class of the consuming app's own
   standalone labels (5 occurrences at the read commit), transliterated.
5. **`Ribbon` is the one part family that is NOT parts.** The seamless loop's
   invariant is "the two halves are identical", and a children slot is precisely
   how that gets broken. What composes is the content: `items` and `separator`.
6. **`Separator` is meaningful by default.** Radix's `decorative` defaults to false
   and this part does not flip it, unlike shadcn's. The accessible answer should be
   the one a caller gets without reading the props. (The brief's assumption, and
   this stream's first draft, had it the other way round; the story caught it.)
7. **`Accordion` draws no chevron.** An icon is a dependency and a taste call, and
   the trigger is a slot with its own `data-state` for a marker to rotate on.
8. **`--shadow-band` was added to the token contract** (the brief allows ADDING an
   emitted name). Recorded in `packages/tokens/README.md`.
9. **`pnpm verify` is now lint -> typecheck -> BUILD -> test**, not build last: the
   component tests read the emitted stylesheet and the built registry, so those
   artefacts have to exist and be current before the tests can judge them. CI adds
   `git diff --exit-code -- packages/ui/r`, which is the real guard on a committed
   build artefact.
10. **`--leading-display-wrap` was added to the token contract, in the SKELETON.**
    [V] Found by the batch's cross-repo review, not by this stream, and it could not
    have been: the consuming app introduced the token after the commit this slice
    read. A sibling slice fixed 16 wrapped display headings with a
    `--leading-display-wrap: 1.6` declared in that app's own `@theme` block, which
    a3 REPLACES with this sheet - and this sheet emitted no `--leading-*` namespace
    at all, so the class would have compiled to nothing: no rule, no warning, no
    failing build, every one of those headings silently back on the step pair
    (1.1-1.2) that the fix existed to escape. The value is the app's measurement
    (worst-case ink 1.5357em on the 28px step, 1.6 chosen), carried rather than
    re-derived. Skeleton rather than preset because D8 fixes the type scale.
    `cn`'s merge map gained the `leading` namespace in the same commit, because
    `cn("leading-display-wrap", "leading-tight")` was returning both classes.
11. **`#toast-stack` keeps its id.** It is generic, it is not product vocabulary,
    and six references upstream cost nothing to keep working.

### A3 inputs

- **`--leading-display-wrap` is now PROVIDED by the sheet**, so a3 DELETES the
  consuming app's own declaration of it rather than keeping it: the emitted
  `@theme` block carries `--leading-display-wrap: 1.6` and Tailwind compiles
  `leading-display-wrap` to `line-height: var(--leading-display-wrap)` (measured -
  it also sets Tailwind's own `--tw-leading`, exactly as `shadow-lift` sets
  `--tw-shadow`). All 16 call sites keep their class unchanged. `cn`'s merge map
  covers the namespace, so `cn("leading-display-wrap", "leading-tight")` now
  resolves to the override instead of leaving both on the element.
  `packages/ui/test/fixtures/consumer-contract.css` is where any future utility of
  this kind goes: a utility a CONSUMER calls that no part here renders, and which
  therefore nothing else in this repository would notice disappearing.
- **Utilities the tokens package does not emit that a moved component needed:**
  only two, and both were resolved inside this repo. `--shadow-band` became a depth
  role; the marquee keyframes and `.mq-marquee` became `packages/ui/src/ribbon.css`,
  shipped as a registry file alongside `ribbon.tsx`.
- **Utilities the consuming app owns and this package does NOT provide:** `cut-6`,
  `cut-10`, `cut-14`, `cut-20`, `cap-safe`, `descender-safe`, `tap-link`,
  `card-lift`, `rail-bar`. None of the ten parts uses any of them, so they stay in
  the consuming app's `globals.css` for its own product components. `cap-safe` and
  `descender-safe` should be rewritten to read `var(--display-cap-pad)` /
  `var(--display-descender-pad)` when the app imports the token sheet - the values
  differ from the hardcoded pair (0.4/0.55 vs 0.3/0.5), which a1 already flagged.
- **`tracking-[0.14em]` in the micro label is not `tracking-label` (0.12em).** It was
  carried as the arbitrary value, unchanged, because changing it would move a pixel
  on ~23 files. Whether the two should converge is a design question, not a move.
- **Where the zero-diff proof should look:** every surface with a `Button`,
  `inputClass` or `microLabelClass` (the widest: ~30 forms and ~23 files), the game
  page and the landing hero for `Ribbon`, any sheet at 390 and at 768+ (the
  breakpoint switch is inside one class string), and the toast's action at desktop
  widths (its portal is what makes it clickable under a clip-path).
- **The offline install form is the PATH form**, see UNVERIFIED 5 above.

## Layer 1 (reviewer, detached worktree of fcd97957, r6)

Baseline in the reviewer's own detached worktree: `pnpm install --frozen-lockfile` Done in 1s; `pnpm build` completed; `pnpm test` **Test Files 16 passed (16), Tests 226 passed (226)**, exit 0; `pnpm lint` exit 0; `pnpm typecheck` exit 0; `pnpm build:registry` then `git diff --exit-code -- packages/ui/r` exit 0 (the committed registry was current).

28 collapse mutations run, **28 stayed GREEN**. Table verbatim:

<!-- prettier-ignore-start -->

| file | test | mutation applied | red / GREEN | what it asserts now |
| --- | --- | --- | --- | --- |
| src/input.tsx:9 | fidelity `input.field`, stories `input/*` | `className={cn(inputClass, className)}` → `cn(className)` | **GREEN** | that a string constant exists — not that `Input` wears it |
| src/label.tsx:38 | fidelity `label.micro` | `cn(labelVariants({tone}), className)` → `cn(className)` | **GREEN** | same: the variant table, never the element |
| src/label.tsx:24 | — | `default: "text-sm text-foreground-2"` → `""` | **GREEN** | nothing pins the `default` tone |
| src/card.tsx:17 | — | `Card` base class → `""` | **GREEN** | nothing |
| src/badge.tsx:17 | — | `badgeVariants` base → `""` | **GREEN** | nothing |
| src/badge.tsx:21-24 | — | all four tones → `""` | **GREEN** | nothing |
| src/accordion.tsx:42 | — | trigger class → `""` (loses `min-h-hit` and `focus-visible:shadow-focus-ring`) | **GREEN** | nothing |
| src/accordion.tsx:25,58 | — | item / content class → `""` | **GREEN** | nothing |
| src/separator.tsx:24 | — | class → `""` (invisible rule) | **GREEN** | nothing |
| src/toast.tsx:30 | — | `DEFAULT_DURATION_MS` 6000 → 60000 | **GREEN** | nothing; the only timer story passes `duration={150}` |
| src/ribbon.tsx:32 | — | `CHARS_PER_SECOND` 4.5 → 45 | **GREEN** | nothing — the "~45px/s" pace is unpinned |
| src/ribbon.tsx:43 | — | `MIN_HALF_CHARS` 600 → 6 | **GREEN (total)** | nothing |
| src/ribbon.tsx:40 | — | `DEFAULT_SEPARATOR` em-space+✦ → `" "` | **GREEN (total)** | nothing |
| src/ribbon.tsx:52 | — | drop the trailing separator (`join(sep) + sep` → `join(sep)`) | **GREEN** | nothing — the loop-seam rule the docblock explains |
| src/ribbon.tsx:74 | — | delete `style={{animationDuration}}` (falls back to the CSS `44s`) | **GREEN (total)** | nothing — the exact bug `ribbon.css`'s comment says the design avoids |
| src/lib/utils.ts:31 | merge-theme `--font-*` | `font: [...]` → `[]` | **GREEN** | that case cannot fail; stock tailwind-merge already merges `font-*` |
| presets/arcade.ts:81 | tokens `checks` | `primary-muted: lime-950` → `stone-200` (Badge tone=primary → ~1.3:1) | **GREEN (total)** | nothing checks `*-muted` as a ground |
| presets/arcade.ts:86 | tokens `checks` | `success-muted: green-950` → `green-400` (green on green) | **GREEN (total)** | nothing |
| test/stories.test.tsx:80 | all 42 story tests | `Story.play` → `Story.runPlay` (API-move simulation) | **GREEN (total)** | that 42 stories rendered; not that any `play` ran |
| test/stories.test.tsx:99 | `covers all ten part families` | delete 6 stories (3 Button variants + 3 Badge tones) | **GREEN (total)**, 220 tests | `>= 35` tolerates 7 vanishing stories |
| test/fidelity.test.tsx:156 | `sheet.title` | `UPSTREAM` row rewritten in the new spelling (`text-text`→`text-foreground`) | **GREEN (total)** | that the table agrees with itself |
| test/fidelity.test.tsx:157 | `sheet.description` | same, `text-text-secondary`→`text-foreground-2` | **GREEN (total)** | same |
| test/fidelity.test.tsx:307 | every `CASES` row | `expected(...)` → the actual (control) | **GREEN (total)** | expected — proves the comparison is the load-bearing line |
| test/storybook-preview.test.ts:23 | `descriptor for descriptor` | add `size-adjust: 105%; ascent-override: 92%` to the emitted face only | **GREEN**, 3/3 | 5 named descriptors; blind to every other one |
| packages/ui/r/registry.json | `has one file per item` | `name` → `marquee-ui-STALE` | **GREEN (total)** | the filename is in the directory listing |
| packages/ui/r/registry.json | same | `items: []` (shipped index advertises nothing) | **GREEN (total)** | same |
| test/fixtures/compile.css:6 | tailwind-compile (all) | `@source "../../src"` → a nonexistent dir | **GREEN (total)** | the directive is inert; Tailwind auto-detects anyway |
| vitest.config.ts:13,24 | — | add `packages/newpkg/test/orphan.test.ts` + `packages/tokens/test/orphan.test.tsx`, both `expect(1).toBe(2)` | **GREEN (total)**, 226/226 | neither file is collected at all |

<!-- prettier-ignore-end -->

### Acting on the layer-1 findings (fixes at `9621c494`)

Baseline before the fixes: `Test Files 16 passed (16)`, `Tests 226 passed (226)`.
After: **18 files, 261 tests.** Every mutation below is the reviewer's own or its
direct equivalent, re-run in the COMMITTED tree at `9621c494`, landing confirmed by
`grep` before the run was read, reverted with `git checkout --`, and `git status
--short` empty afterwards.

<!-- prettier-ignore-start -->

| GREEN row | what changed | the mutation re-run | now |
| --- | --- | --- | --- |
| `input.tsx` / `label.tsx` pinned on the constant | both `CASES` rows go through a RENDER and read the element's `data-slot` class, as the sheet and toast rows already did; a new case asserts the exported constant equals what the element wears, because the constant is public API | `className={cn(inputClass, className)}` → `cn(className)` | red **2** — `input.field` (`expected [] to deeply equal [ 'bg-surface', … ]`) and `keeps the exported constants equal to what the elements actually wear` |
| the four NEW parts had no class instrument (`label.default`, `card*`, `badge*`, `accordion*`, `separator`) | a 14-row slot table in `fidelity.test.tsx`, `describe("the new parts wear the utilities they declare")`, rendering each part and comparing the utility SET — plus the tap-floor test below, which is the observable half | `default: "border-border-strong bg-surface text-foreground-2"` → `""` | red **1** — `badge`, `expected [ 'border-2', … ] to deeply equal [ 'bg-surface', … ]` |
| `accordion.tsx` trigger class → `""` (loses `min-h-hit` **and** the focus ring) | the slot table above, and `tailwind-compile.test.tsx` now measures EVERY interactive element the stories render in RESOLVED PIXELS against a 44px floor (resolving `var(--hit-min)` and Tailwind's `calc(var(--spacing) * 11)` out of the compiled sheet) | trigger class → `""` | red **4** — `accordion-trigger` in the slot table, `measures every one of them at or above the floor` naming `button[data-slot=accordion-trigger] … -> 0px`, the focus-ring resolution, and the registry byte-compare |
| `DEFAULT_DURATION_MS` 6000 → 60000 | `test/tuned-constants.test.tsx`: fake timers, nothing at 5999ms, dismissed at 6000ms, and a second case for a caller-shortened duration | 6000 → 60000 | red **1** — `dismisses itself after six seconds by default, and not before` (`expected "vi.fn()" to be called 1 times, but got 0`) |
| `CHARS_PER_SECOND` 4.5 → 45, `MIN_HALF_CHARS` 600 → 6, the separator, the trailing separator, the deleted inline `animationDuration` | the same file, asserted as BEHAVIOUR rather than by reading the constants back: seconds-per-character measured across two different copies and pinned to 1/4.5, the half at ≥ 600 characters, the two halves identical, the seam token (`two\|one`), the em-space form, and `animationDuration` matching `/^\d+s$/` so the CSS fallback can never be what runs | 4.5 → 45 | red **1** — `holds one pace whatever the copy is` (`expected 0.0217 to be close to 0.2222, difference 0.2006, expected 0.005`) |
| `utils.ts` `font: [...]` is inert | RECORDED, not changed. See below. | — | — |
| `primary-muted` / `success-muted` are in no checked set | three rows added to `ON_FILL_PAIRS` in `packages/tokens/src/roles.ts` — `primary-ink`/`primary-muted`, `destructive`/`destructive-muted`, `success`/`success-muted` — because a status token draws its own ink on its own muted fill. Measured when added (arcade / light): 11.81 / 7.21, 5.43 / 5.38, 8.23 / 5.54. The matrix count anchor went 52 → 55. | `primary-muted: lime-950` → `olive-50` | red **2** — `Arcade passes every check, with no exceptions at all` and `accepts an exception that is accurate, justified and real` |
| `Story.play` → `Story.runPlay` left 226 green | plays are COUNTED: from the composed story objects before the run, and from inside each test after the play returns, both pinned at `DECLARED_PLAYS = 25` and asserted equal | `Story.play` → `Story.runPlay` | red **1** — `runs all 25 play functions, and knows if one stopped running` (`plays that actually executed: expected [] to deeply equal [ 'accordion/Single', …(24) ]`) |
| `>= 35` tolerated seven stories vanishing | `expect(seen).toHaveLength(42)`, exact | delete `Badge.Success` | red **1** — `expected [ … ] to have a length of 42 but got 41` |
| the `UPSTREAM` table is unverifiable, and two comments overstated what the suite checks | the 20 strings are now a GENERATED fixture, `test/fixtures/upstream-classes.json`, written by the committed `test/fixtures/extract-upstream.mjs <reference-repo> <commit>` which reads them with `git show`; the file records the commit and the seven source paths, and the suite asserts the recorded commit is the one this slice read. The docblock now says plainly that a mistake in the RENAME table reddens and a mistake in the FIXTURE does not — regenerating is its only check — and the rename-table test was retitled to what it actually asserts (no stale entry), not to what it did not (every token handled). | — (the fixture replaces the hand-typed table the mutation exploited) | — |
| the shipped `r/registry.json` is unchecked | two assertions: it is byte-identical to the root `registry.json`, and it is read as DATA (name, the eleven item names, every item has files, every referenced path exists) | `items: []` | red **2** — `ships an INDEX that is the root registry, byte for byte` and `advertises every item in that index, with its files` |
| `@source` is inert | the fixture now opens `@import "tailwindcss" source(none)` and lists `../../src` and `../../stories`, so this file decides what the compile can see. **This exposed a second, worse problem the reviewer's mutation had masked:** with auto-detection on, Tailwind was extracting candidates from the TEST FILE's own assertion strings, so `shadow-focus-ring` compiled only because the suite named it. That assertion moved to the form that actually ships, `focus-visible:shadow-focus-ring`. | `@source "../../src"` → `../../no-such-dir` | red **4** — every role-resolution test, `expected '' to contain 'var(--primary)'` first |
| a test file collected by no project | `vitest.config.ts` exports ONE glob spelling, `TEST_GLOB(pkg)` = `packages/<pkg>/test/**/*.test.{ts,tsx}`, used by both projects; and `packages/tokens/test/project-coverage.test.ts` asserts every package with a `test/` directory is named by a project, that every include carries both extensions, and that every project is named | plant `packages/newpkg/test/orphan.test.ts` and `packages/tokens/test/orphan.test.tsx`, both `expect(1).toBe(2)` | red **2** — the `.tsx` one now RUNS and fails (`expected 1 to be 2`), and `names every package that has tests` reports `expected [ 'newpkg' ] to deeply equal []` |
| the `@font-face` guard compares five named descriptors | it now normalises and compares the WHOLE block: every declaration, sorted, with the url reduced to its filename because the two sheets serve the same files from different paths on purpose. An in-suite case proves the comparison sees a descriptor that exists on one side only. | `size-adjust: 105%` added to the emitter, **and the sheet rebuilt** — the reviewer's own run mutated the emitter without rebuilding, and `dist/tokens.css` is the artefact the guard reads | red **1** — `declares the same three faces, every descriptor of each` |
| (M6, reasoned not proved) every runtime dependency was a `devDependency` | the eight runtime packages moved to `dependencies`; `registry.test.ts` validates the registry's declared ranges against THAT list, and a new test walks every shipped source's bare imports and demands each is a dependency or a declared peer | `clsx` demoted back to `devDependencies` | red **2** — `clsx is not a dependency of @marquee-ui/ui`, and `imported at runtime but not a dependency or a peer: expected [ 'clsx' ]` |
| (L7, reasoned not proved) the `AsChildLink` badge story shipped a ~24px tap target as the recommended pattern | the story carries `className="min-h-hit px-3"` and says why in its docblock; `badge.tsx` says a badge is sized as a LABEL and the caller owes the floor the moment `asChild` makes it a control | remove that `className` from the story | red **1** — `measures every one of them at or above the floor` |

<!-- prettier-ignore-end -->

**The M6 probe the reviewer asked for, run.** `pnpm pack` → a 21,948-byte tarball with
27 entries (`r/` and `src/`, no tests, no stories). Installed OUTSIDE the workspace
with `npm install ../marquee-ui-ui-0.0.0.tgz react@19 react-dom@19` into a bare
project: exit 0, and `createRequire().resolve` finds all ten of
`@radix-ui/react-{slot,dialog,accordion,label,separator}`,
`class-variance-authority`, `clsx`, `tailwind-merge`, `react`, `react-dom`. Then
`shadcn add ./node_modules/@marquee-ui/ui/r/sheet.json ./node_modules/@marquee-ui/ui/r/ribbon.json`
in that same project: exit 0, four files written, all four byte-identical to the
sources. So the no-network install path is proved end to end from a real tarball,
not from a workspace symlink. Logs under `$BATCH_SCRATCH/s2/`.

### Findings recorded rather than changed

- **L1, 17 of 42 stories assert only "did not throw".** RECORDED, and now bounded
  rather than open: the 25 that DO have a `play` are counted and pinned, and the
  visual-variant stories that do not are exactly the rows the new slot table and the
  tap-floor test cover from the other side. A `play` on `Badge.Success` could only
  restate its own args.
- **L4, three entries in `cn`'s theme list are inert.** RECORDED. `font`, and the
  `3xs`/`2xs`/`md` steps, are already merged by stock tailwind-merge, so those
  entries do nothing today. They are kept because the list is derived from what the
  emitter EMITS, not from what tailwind-merge happens to miss this release: dropping
  the inert ones would make the list a snapshot of another package's internals, and
  `merge-theme.test.ts` would then have to encode the same knowledge to stay honest.
  The reviewer confirmed the list is otherwise complete against all ten emitted
  namespaces and that no stock merge regressed.
- **The reviewer's control finding.** Every mutation to a file listed in
  `registry.json` also reddens `carries the CURRENT bytes of every source it ships`,
  because that test byte-compares sources to the committed JSON. That is the guard
  working, and it is why "GREEN" in the table above means "everything except that
  byte-compare".

## DESIGN-LIB-a3: publishable, and the faces moved out (2026-09-15)

Scope: steps 1-4 of the a3 slice, from the library side. Both packages are
publishable, `prepack` closes the stale-artefact hole, and the `@font-face`
rules left `tokens.css` because the consuming app measured what importing them
costs. Nothing was published (`npm whoami` is `E401` on this box; the first
publish is Ankit's) and nothing was pushed (the Actions-minutes freeze).

### What shipped

| commit    | what                                                                                                                                  |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `ed7f34c` | both packages `0.1.0`, `private` gone, `publishConfig.access: public`, `repository` with `directory`, and a `prepack` that builds     |
| `3f63bd7` | `dist/fonts.css`: the three `@font-face` rules as their own sheet, exported as `./fonts.css`, with the README rule and two new guards |

### `prepack`, and why each is the shape it is

- **tokens: `pnpm build`.** `dist/` is gitignored, so whatever the last build
  left is what `pnpm pack` would ship. Proved by `rm -rf packages/tokens/dist`
  then packing: the tarball came out with a freshly built `dist/`, including the
  `--leading-display-wrap` that a stale `dist` had been missing at session start.
- **ui: `pnpm -w build:registry && git diff --exit-code -- r`.** `r/` is a
  COMMITTED build artefact, so the risk is the opposite one: packing bytes that
  no longer match the sources. Proved by mutating `separator.tsx`
  (`bg-border` -> `bg-border-strong`) without rebuilding and running the script:
  **exit 1**, with the diff naming `packages/ui/r/separator.json` and the changed
  class inside its `content` string. Reverted; `git status --short` empty.

  ⚠️ `pnpm -w build:registry` is the spelling that works. `pnpm -w exec shadcn …`
  and `pnpm --filter marquee-ui-repo …` both fail from inside `packages/ui`
  ("Command \"shadcn\" not found", "No projects matched the filters").

### The faces: measured in the consumer, not argued

The a3 brief's risk 1 asked whether Next still emits the sheet's three woff2 as
build assets when the app loads the same families through `next/font`. It does,
and the precache makes it worse. Measured in the thepile worktree, `next build`
after `rm -rf .next`, with only the `@import` added:

|                                        | faces in `tokens.css` | faces in `fonts.css` |
| -------------------------------------- | --------------------- | -------------------- |
| `.next/static/media` woff2             | **6**                 | **3**                |
| `@font-face` blocks in the served CSS  | 9                     | 6                    |
| woff2 in the Serwist precache manifest | **6**                 | **3**                |
| duplicate bytes shipped                | **62,508**            | 0                    |

The duplicates were byte-identical to next/font's own hashed copies
(`boldonse.0d07dd86.woff2` beside `0d07dd86a15746ab-s.p.woff2`), declared at
`font-display: swap` against next/font's `optional`, and precached, so every PWA
install downloaded 61 KB of font it could never use.

So the faces are their own sheet and the import is opt-in. One sheet for both
presets, because `light.fonts` is `arcade.fonts` by re-export.

**A second finding the same probe produced**, and the reason a consumer must
re-declare after the import: the sheet sets `--default-font-family:
var(--font-body)`, and thepile never declared that key, so the LIBRARY's line won
and Tailwind's preflight got the literal `"Space Grotesk"` - a family the app
does not load, since `next/font` names its face uniquely and `fonts.css` is
deliberately skipped. Read out of the built CSS, not reasoned. The consumer now
declares `--default-font-family: var(--font-sans)` and
`--default-mono-font-family: var(--font-mono)` after the import; re-measured, both
resolve to thepile's stacks and the woff2 count stays 3.

### Guards, each proved by running its reddening mutation

Run in the COMMITTED tree at `3f63bd7`, landing confirmed by `grep` before the
run was read, reverted with `git checkout --`, `git status --short` empty after.

| guard                                      | mutation                                                                       | landed             | the red it produced                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------ | ------------------------------------------------------------------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| faces stay out of the token sheet          | `emitFontFaces(preset)` prepended back into `emitCss`'s output, `dist` rebuilt | `emit/css.ts:78`   | THREE, each naming the mutated property: `keeps the faces OUT of the token sheet, so an import cannot duplicate them` with `expected [ { …(5) }, { …(5) }, { …(5) } ] to deeply equal []`; `ships a @font-face for every face the preset names, in the faces sheet` with `expected '/* @marquee-ui/tokens - the faces the…' not to contain 'boldonse.woff2'`; `resolves the three faces` with `expected '/*! tailwindcss v4.3.3 | MIT License …' not to contain '@font-face'` |
| ui registry staleness (the `prepack` half) | `bg-border` -> `bg-border-strong` in `separator.tsx`, `r/` not rebuilt         | `separator.tsx:24` | `prepack` exit **1**, `git diff` naming `packages/ui/r/separator.json`                                                                                                                                                                                                                                                                                                                                                          |

⚠️ The faces guard was written once as `expect(arcadeCss).not.toContain("woff2")`
and **failed for the wrong reason**: the sheet's header comment says "Pads are
measured from the display woff2". It now asserts `not.toContain("url(")`, which
is the property that actually matters - a bundler emits an asset for every
`url()`, and emits nothing for prose.

### Decisions

1. **The faces are a separate `fonts.css`, not an option on `emitCss`.** [V] Risk
   1 offered this shape and the measurement chose it. An option would put the
   decision in every caller and leave the default wrong for the one consumer that
   exists. `emitCss` lost its unused `CssEmitOptions` parameter; `emitFontFaces`
   took it.
2. **One faces sheet, not one per preset.** Both presets name the same three
   faces, and `emitFontFaces(light)` is asserted equal to `emitFontFaces(arcade)`
   so a preset that diverges reddens rather than silently shipping the wrong file.
3. **`tailwind-compile.test.tsx` anchors on `--font-display: "Boldonse"` instead
   of `font-family: "Boldonse"`.** The family name still reaches the compile, now
   through the token, which is where it belongs; the test also asserts the compile
   contains NO `@font-face`, so the two halves cannot both drift.

### What a3's consumer half still needs from here

Nothing in this package. The tarballs
(`marquee-ui-tokens-0.1.0.tgz` 99,601 B, `marquee-ui-ui-0.1.0.tgz` 22,005 B) are
vendored in the thepile worktree under `vendor/marquee-ui/` with the flip
instructions beside them.

## DESIGN-LIB-d: Switch (2026-09-18)

Scope: the first catalogue ADDITION, in the order the consuming product's design
audit asks for it - its `/settings` row ships two boolean controls in two shapes,
and the pair of strings it drew them with says in its own docblock that "it goes
away when the library ships one". Nothing was published, nothing was pushed (the
Actions-minutes freeze), no version was bumped, and nothing in the consuming repo
was changed: it was read only, at commit `06cbb192`.

### What shipped

| file                                          | what                                                                                                                                                                                                            |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/ui/src/switch.tsx`                  | four parts - `Switch`, `SwitchInput`, `SwitchTrack`, `SwitchThumb` - and no state of any kind (6,823 B)                                                                                                         |
| `packages/ui/stories/switch.stories.tsx`      | 7 stories, 4 of them carrying a `play`                                                                                                                                                                          |
| `packages/ui/test/switch-drawing.test.tsx`    | 9 tests: the geometry in resolved pixels, the two triggers compared, and the state cascade observed                                                                                                             |
| `registry.json` + `packages/ui/r/switch.json` | the `switch` item, `target` `components/ui/switch.tsx`, `@marquee/utils` as its registry dependency (7,600 B)                                                                                                   |
| `packages/ui/src/index.ts`                    | the four parts and `SwitchProps`                                                                                                                                                                                |
| the declared lists                            | both lists in `packages/tokens/test/helpers/source-files.ts`, `stories.test.tsx`'s suites and its two counts, `tailwind-compile.test.tsx`'s two suite maps, `registry.test.ts`'s item list and its two counters |
| the stated count                              | `AGENTS.md`, `README.md` and `packages/ui/package.json`'s description say eleven part families                                                                                                                  |

No new dependency: `@radix-ui/react-slot` was already here for `asChild`, and
nothing else was needed. `pnpm test` goes from 267 tests in 18 files to **290 in
19** (+13 for the drawing suite, +9 story renders, +1 for the suite's own
`switch: has stories`). A new test helper, `packages/ui/test/helpers/story-suites.ts`,
is the single suites map both `stories.test.tsx` and `tailwind-compile.test.tsx`
now read (layer 1, MED-2).

The shape, in one line each:

```tsx
// the button host: the whole row is the control, `aria-checked` is the state
<Switch aria-checked={on} aria-label="…" onClick={…} className="w-full justify-between …">
  <span>Show adult artwork</span>
  <SwitchTrack><SwitchThumb /></SwitchTrack>
</Switch>

// the native host: a real checkbox, `:checked` is the state, same drawing
<Switch asChild>
  <label className="w-full justify-between …">
    <span>Notify me on this device</span>
    <SwitchInput name="notifications" checked={on} onChange={…} />
    <SwitchTrack><SwitchThumb /></SwitchTrack>
  </label>
</Switch>
```

### Measurements, and what they corrected

**1. What the tap floor actually selects, and why the track can never be the
control.** `tailwind-compile.test.tsx` takes
`button, a[href], input, select, textarea, [role="button"]` out of every rendered
story and resolves each one's height from the compiled sheet. So a
`button[role="switch"]` is measured as a `button` (the `[role=…]` arm is for
buttons, not for this part), and a native checkbox is measured as an `input` -
which settles the design question the brief left open: an `<input>` drawn as the
44x24 track is a **24px** control and fails the house rule, however tall the label
around it is. Measured by mutation: removing `min-h-hit` from the root produced
five offenders in that guard, one per story that renders a control. Hence the
root carries the floor, and the native host's input is an invisible overlay over
the row (which carries `min-h-hit` too, and means it).

**2. jsdom lays nothing out, so "the thumb's box moved" is not observable here in
any story.** Measured on this tree: for an element with a height in the sheet,
`getBoundingClientRect()` is `{x:0, y:0, width:0, height:0}` and
`offsetWidth`/`offsetHeight` are `0`, while `getComputedStyle(el).height` returns
the declared `16px`. The brief asked for a `play` that "asserts the thumb's
bounding box MOVED by the travel the track leaves it"; under this runner such a
play would be comparing zeroes, which is the exact shape of a test that cannot
fail. What replaced it is in the next two rows, and the real move stays where a
box can actually move: the consuming product's browser e2e.

**3. The cascade IS observable, once the layers come off.** jsdom applies a
stylesheet even though it lays nothing out - but Tailwind 4 emits every utility
inside `@layer utilities`, and jsdom implements no cascade layers: injecting the
compiled sheet as-is left the track at `position: static` and
`background-color: rgba(0, 0, 0, 0)`, with not one rule applied. Unwrapping the
`@layer` blocks (selectors and declarations untouched, and the test throws if
there are none to unwrap) makes the sheet behave as a browser's would, and then
the thumb's `translate` is `none` while the control is off and carries the
declared travel when it goes on. That is the half no class-name assertion can
make, and it is the defect class the consuming repo's own layer 1 found in the
strings this part replaces (a trigger rewritten to `group-hover:` left their
source test 4/4 green).

**4. jsdom 30 DOES support `:has(:checked)` in the cascade - what it does not do
is invalidate a computed style it has already handed out.** This entry said the
opposite for one day, and the correction is the measurement that matters. The
first probe read a computed value, set `input.checked = true` (a property, which
does not reflect to the attribute), read again, and saw no change - which is
indistinguishable from "the selector is unsupported" and was recorded as such.
Layer 1 ran the discriminator this slice had not: reading AFTER the click without
a read before it, the same compiled selector applies, and so does
`:has(:disabled)`. Both are observable against the REAL compiled sheet and the
real stories:

```
OFF  track bg = var(--overlay)      thumb translate = none
ON   track bg = var(--primary)      thumb --tw-translate-x = calc(var(--spacing)*5)
ON   root opacity (input disabled)  = 50%
```

So the native host's state IS observable in a rendered DOM here, and it is now
observed: `draws the NATIVE host from the checkbox's own state` reads the two
states from two RENDERS (`NativeCheckbox` and `NativeCheckboxOn`) rather than
from one element toggled in place, which sidesteps the stale-cache trap entirely
and needs no nudge. The click half - that a click on the row really does check
the box - is the `NativeCheckbox` play. **What genuinely cannot be observed here
is still only layout** (measurement 2).

**5. What Tailwind compiles each trigger to** (run against the real emitted
tokens sheet, and again inside the bare consumer):

| written                                  | compiled selector                                    | reaches                    |
| ---------------------------------------- | ---------------------------------------------------- | -------------------------- |
| `group-aria-checked/switch:bg-primary`   | `:is(:where(.group\/switch)[aria-checked="true"] *)` | any descendant of the root |
| `group-has-checked/switch:translate-x-5` | `:is(:where(.group\/switch):has(:checked) *)`        | any descendant of the root |
| `peer-checked:bg-primary`                | `:is(:where(.peer):checked ~ *)`                     | a FOLLOWING SIBLING only   |
| `has-disabled:opacity-50`                | `:has(:disabled)`                                    | the element itself         |

The third row is why the two hosts can now share one nesting: `peer-checked:` (the
spelling the consuming product uses) forces the thumb to be a sibling of the
input, and the ancestor-scoped pair does not - so the thumb sits inside the track
in BOTH hosts, and one drawing means one drawing.

**6. The roles, against the presets rather than against taste** (`wcagContrast`
over the resolved preset values; WCAG 1.4.11 asks 3:1 of a meaningful graphic):

| pair                                               | arcade      | light       |
| -------------------------------------------------- | ----------- | ----------- |
| thumb `muted` on track `overlay` (off)             | **4.53:1**  | **6.45:1**  |
| thumb `primary-foreground` on track `primary` (on) | **17.54:1** | **16.12:1** |
| off track fill vs on track fill                    | 13.72:1     | **1.13:1**  |
| track edge `border-strong` on `background`         | 1.82:1      | 1.80:1      |

The third row is the finding: **in the light preset the two track fills are 1.13:1
apart**, so a viewer who reads the fill alone cannot tell the states apart. The
state is therefore carried by the thumb having MOVED, in both presets and in no
colour at all, which is why the travel is what the guards measure and what the
consuming product's e2e clicks for. (The fourth row is the house line weight, a
preset decision this slice consumes and does not touch.)

**7. `storybook/test`'s `userEvent` cannot click inside a `<label>` under jsdom 30.** A click on anything inside a label is forwarded to the labelled control, and
forwarding makes it clone the pointer event: `TypeError: Failed to construct
'PointerEvent': member view is not of type Window`. Measured on a bare
`<label><span/><input/></label>` with nothing of this package in it, so it is the
environment and not the part; the element's own `click()` follows the platform's
activation path and works, and that is what the `NativeCheckbox` play uses, with
the error quoted beside it.

**8. The base is green only after a build.** `pnpm test` in a fresh worktree is
red on four files (`emitted-surface`, `merge-theme`, `storybook-preview`,
`tailwind-compile`) because `packages/tokens/dist` is gitignored build output;
after `pnpm build` it is 18 files / 267 tests passing. `pnpm verify` already
orders it that way (a2 D9); the bootstrap instruction in the brief did not.

### Every UNVERIFIED claim in the brief, measured

1. **"⚠️ UNVERIFIED how `tailwind-compile.test.tsx` reads a `role="switch"`
   button: run it and quote"** - quoted in measurement 1: it never looks at
   `role="switch"` at all, it matches the element as a `button`. The brief's
   conclusion (the track cannot be the control, the root carries the floor) is
   right, and now for the measured reason - which also extends to the native host,
   whose input the same selector catches.
2. **The brief's story requirement, "at least one `play` that toggles and asserts
   the thumb's bounding box MOVED"** - NOT SATISFIABLE in this repo, measurement 2.
   Corrected to arithmetic over the compiled sheet plus a cascade observation, and
   said out loud at the top of `switch-drawing.test.tsx` rather than only here.
3. **"a Radix `Switch` renders `button[role="switch"]` plus a hidden input inside a
   form, so host 2's native checkbox would take host 1's shape at consumption"** -
   NOT measured, because the decision did not rest on it: `@radix-ui/react-switch`
   cannot render a native `<input type="checkbox">` as the control at all, which is
   the consuming product's second host, so the "one part family" answer had to be
   a drawing either host composes whatever Radix's own root does. No dependency was
   added, so nothing about Radix's hidden input is claimed here in either direction.
4. **The consumer contract's geometry** (44x24 track, 16px thumb inset 2px, 20px of
   travel, `44 - 2*2 - 2*2 - 16`) - read at `06cbb192` and CONFIRMED, and it is the
   geometry this part ships, re-derived from the compiled stylesheet instead of from
   a class string.
5. **"the thumb a SIBLING element and never `::after`"** - half right, and the half
   that is wrong has a pixel consequence. In the consuming product the thumb is a
   sibling of the INPUT in the native host only; in the button host it is a CHILD of
   the track. That difference is not cosmetic: an absolutely-positioned element is
   laid out against its containing block's PADDING box, so the button host's
   `left-0.5` puts the thumb 2px inside the track's 2px border (4px from its outer
   edge, flush at the far end), while the native host's containing block is the
   wrapping `<span class="relative">`, whose padding box starts at the input's OUTER
   edge - so that thumb sits ON the border at rest and stops 4px short of flush when
   it travels. **The two hosts do not draw the same thing today**, by 2px at rest,
   and the difference is invisible to their source test (which compares class
   strings) and to their e2e (which measures the button host only, and whose own
   comment says "a device pass still owes the push row a look"). This part removes
   the difference by construction rather than by fixing it: with ancestor-scoped
   triggers the thumb is inside the track in both hosts, so there is one containing
   block, one inset and one travel. Derived from the source and the containing-block
   rule, not rendered - no command of that repo was run from here.
6. **The e2e arms** at `e2e/mobile-390.spec.ts` - present and as described: the
   thumb's move is asserted as `> 12` px of travel on a real click, with track and
   thumb resolved from INSIDE the clicked switch, transitions killed first. The
   consumption keeps that arm true unchanged; only the `data-testid`s have to ride
   along (see "thepile inputs").

### Guards, each proved by running its reddening mutation

Run in the COMMITTED tree (`4a58893`, then `af6ee6e` for the two that came after
the instrument was improved), landing confirmed by `grep` before the run was read,
reverted with `git checkout --`, `git status --short` empty after each. Two of them
were re-run at `d6e2289`, after the layer-1 fixes restructured the cascade suite
and changed the part: the travel arithmetic still reddens
(`expected 20 to be 24`), and the root's named group still reddens BOTH cascade
tests now instead of one (`expected 'var(--overlay)' to be 'var(--primary)'`,
twice).

<!-- prettier-ignore-start -->

| guard | mutation | landed | the red it produced |
| --- | --- | --- | --- |
| the travel is the track's arithmetic | track `h-6 w-11` -> `h-6 w-12`, travel untouched | `switch.tsx:58` | TWO: `draws a 44x24 track…` with `expected 48 to be 44`, and `travels exactly the width the track leaves it` with `expected 20 to be 24` |
| the on-state exists on both triggers | `group-aria-checked/switch:translate-x-5` -> `group-hover/switch:…` | `switch.tsx:78` | THREE: `expected null to be 20`; `thumb: no :checked-driven on-state: expected 2 to be 1`; `group-aria-checked/switch:translate-x-5 declares no --tw-translate-x in the compiled sheet` |
| the drawing is OFF while the control is off | an unconditional `translate-x-5` added to the thumb | `switch.tsx:78` | `sets the travel only while the control is on` with `expected 'var(--tw-translate-x) var(--tw-transl…' to be 'none'` - and NOTHING else noticed |
| the drawing follows the ROOT's state | `group/switch` removed from the root's class, every other class name unchanged | `switch.tsx:52` | `sets the travel only while the control is on` with `expected 'var(--overlay)' to be 'var(--primary)'` - again the only test that noticed |
| the tap floor is on the control | `min-h-hit` removed from the root | `switch.tsx:52` | TWO: this slice's `puts the tap floor on the row…` with `expected null to be 44`, and the package's own floor guard, `measures every one of them at or above the floor`, with 5 offenders |
| the registry cannot ship stale bytes | `border-border-strong` -> `border-border` in the track, `r/` not rebuilt | `switch.tsx:58` | `carries the CURRENT bytes of every source it ships` with `switch: packages/ui/src/switch.tsx is stale` |
| the thumb is inside the track | the story's drawing changed to two siblings | `switch.stories.tsx:15` | `switch/Off` with `expect(element).toContainElement(element)`, plus the play counter |
| the native control announces a switch | `role="switch"` removed from `SwitchInput` | `switch.tsx` (1 of 2 left) | `switch/NativeCheckbox` and `switch/InAForm`, both `Unable to find an accessible element with the role "switch" and name "Notify me on this device"` |
| the disabled rendering reaches both hosts | `has-disabled:cursor-not-allowed has-disabled:opacity-50` removed | `switch.tsx:52` | `dims the whole row when either host is disabled…` with `the root has no disabled treatment for a disabled descendant: expected +0 to be 2` |
| the native host really is a form control | `name="notifications"` removed from the form story | `switch.stories.tsx` | `switch/InAForm` with `expected null to be 'on'` |

<!-- prettier-ignore-end -->

Each red names the property that was mutated. One of them changed the code: the
cascade test's helper threw `TypeError: Cannot read properties of null` instead of
naming the utility that had vanished, which is a red that proves nothing, so it
now says `<utility> declares no <property> in the compiled sheet` and the mutation
was re-run against the committed fix.

## Layer 1 (reviewer, detached worktree of f64d1089, slot r6)

| file                                                                                         | test                                                                                                                                                                    | mutation applied                                                                                                     | red / GREEN                                                               | what it asserts now                                                                                                                           |
| -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/switch.tsx` → `test/switch-drawing.test.tsx`, `test/registry.test.ts`                   | travels exactly the width the track leaves it; changes the same properties by the same amounts; sets the travel only while the control is on; carries the CURRENT bytes | **M-A** delete `group-aria-checked/switch:translate-x-5` from `thumbClass`                                           | **red 4** (`expected null to be 20`)                                      | —                                                                                                                                             |
| `src/switch.tsx` → `test/switch-drawing.test.tsx`                                            | travels exactly …; sets the travel only while the control is on                                                                                                         | **M-B** `translate-x-5` → `translate-x-4` on both triggers                                                           | **red 2**                                                                 | —                                                                                                                                             |
| `src/switch.tsx` → `test/switch-drawing.test.tsx`, `test/tailwind-compile.test.tsx`          | sets the travel only while the control is on; compiles every one of them                                                                                                | **M-C** root group renamed `group/switch` → `group/switchx`, track/thumb class names byte-identical                  | **red 2** (`expected 'var(--overlay)' to be 'var(--primary)'`)            | the cascade test is the ONLY switch-drawing test that saw it: the other 3 class-name tests stayed green                                       |
| same                                                                                         | same                                                                                                                                                                    | **M-AF** root group renamed `group/switch` → `group` (still a real utility)                                          | **red 2**, same two, same message                                         | confirms M-C was not a fluke of an uncompilable name                                                                                          |
| `src/switch.tsx`                                                                             | (nothing)                                                                                                                                                               | **M-D** delete `relative` from `trackClass` — the thumb's positioning context                                        | **GREEN 86**                                                              | **FINDING.** Nothing observes that the thumb is positioned against the TRACK.                                                                 |
| `src/switch.tsx`                                                                             | (nothing)                                                                                                                                                               | **M-E** delete `relative` from `switchClass` — the overlay input's positioning context                               | **GREEN 86**                                                              | **FINDING.** Nothing observes that `absolute inset-0` resolves against the row.                                                               |
| `src/switch.tsx` → `test/switch-drawing.test.tsx`, `test/tailwind-compile.test.tsx`          | puts the tap floor on the row; measures every one of them at or above the floor                                                                                         | **M-F** delete `min-h-hit` from `switchClass`                                                                        | **red 2**                                                                 | —                                                                                                                                             |
| same                                                                                         | same                                                                                                                                                                    | **M-G** delete `min-h-hit` from `nativeInputClass`                                                                   | **red 2**                                                                 | —                                                                                                                                             |
| `src/switch.tsx`                                                                             | (nothing)                                                                                                                                                               | **M-H** delete `opacity-0` from `nativeInputClass`                                                                   | **GREEN 86**                                                              | **FINDING.** A visible native checkbox painted on top of the drawing is green.                                                                |
| `src/switch.tsx` → `test/stories.test.tsx`                                                   | switch/Off; switch/Disabled; runs all 29 play functions                                                                                                                 | **M-I** delete `role="switch"` from the button host                                                                  | **red 3** (`Unable to find an accessible element with the role "switch"`) | —                                                                                                                                             |
| `src/switch.tsx` → `test/stories.test.tsx`                                                   | switch/NativeCheckbox; switch/InAForm; runs all 29 play functions                                                                                                       | **M-J** delete `role="switch"` from `SwitchInput`                                                                    | **red 3**                                                                 | —                                                                                                                                             |
| `src/switch.tsx` → `test/switch-drawing.test.tsx`                                            | gives each trigger a selector only its own host can satisfy                                                                                                             | **M-K** strip EVERY `group-aria-checked/switch:` and `group-has-checked/switch:` token from track + thumb            | **red 3, but this test stayed GREEN**                                     | **FINDING.** All three of its loops iterate `triggered(...)`; with no on-state classes they run zero times and it passes asserting nothing.   |
| `src/switch.tsx` → `test/switch-drawing.test.tsx`                                            | dims the whole row when either host is disabled                                                                                                                         | **M-L** delete `disabled:cursor-not-allowed disabled:opacity-50`                                                     | **red 1** (`the root has no disabled treatment of its own`)               | —                                                                                                                                             |
| same                                                                                         | same                                                                                                                                                                    | **M-M** delete both `has-disabled:` spellings                                                                        | **red 1** (`expected +0 to be 2`)                                         | —                                                                                                                                             |
| `src/switch.tsx`                                                                             | (nothing)                                                                                                                                                               | **M-N** `type={type ?? "button"}` → `type={type}`                                                                    | **GREEN 62**                                                              | **FINDING.** The button host's form-submit guard has no story that puts it in a `<form>`.                                                     |
| `src/switch.tsx` → `test/stories.test.tsx`                                                   | switch/NativeCheckbox; switch/InAForm                                                                                                                                   | **M-O** `asChild` ignored (`if (false && asChild)`)                                                                  | **red 3** (`Found multiple elements with the role "switch"`)              | —                                                                                                                                             |
| `src/switch.tsx`                                                                             | (nothing)                                                                                                                                                               | **M-P** the `asChild` branch drops `className={classes}` entirely                                                    | **GREEN 86**                                                              | **FINDING (HIGH).** The label host's `group/switch`, `min-h-hit`, `relative`, focus ring and both disabled spellings are asserted by nothing. |
| `src/switch.tsx`                                                                             | (nothing)                                                                                                                                                               | **M-Q** delete `pointer-events-none` from `thumbClass`                                                               | **GREEN 71**                                                              | benign (a click on a child span reaches the button / is forwarded by the label); noted, not a finding                                         |
| `src/switch.tsx` → `test/stories.test.tsx`                                                   | switch/NativeCheckbox; switch/InAForm                                                                                                                                   | **M-Y** `type="checkbox"` → `type="text"`                                                                            | **red 3**                                                                 | —                                                                                                                                             |
| `stories/switch.stories.tsx` → `test/stories.test.tsx`                                       | switch/Off (`toContainElement`); runs all 29 play functions                                                                                                             | **M-R** `drawing` rewritten so `SwitchThumb` is a SIBLING of `SwitchTrack`                                           | **red 2**                                                                 | —                                                                                                                                             |
| `stories/switch.stories.tsx` → `test/stories.test.tsx`                                       | runs all 29 play functions                                                                                                                                              | **M-S** delete `Off`'s `play`                                                                                        | **red 1** (`expected … to have a length of 29 but got 28`)                | —                                                                                                                                             |
| `stories/switch.stories.tsx` → `test/stories.test.tsx`                                       | covers all eleven part families, with every story counted                                                                                                               | **M-T** delete the `On` story                                                                                        | **red 1** (`… to have a length of 49 but got 48`)                         | —                                                                                                                                             |
| `stories/switch.stories.tsx` → `test/stories.test.tsx`, `test/switch-drawing.test.tsx`       | switch/Off; sets the travel only while the control is on                                                                                                                | **M-AB** `aria-checked={on}` → `aria-checked={false}` (a trigger that cannot fire)                                   | **red 3** (`expected 'false' to be 'true'`)                               | —                                                                                                                                             |
| `registry.json` → `test/registry.test.ts`                                                    | 7 of the 14                                                                                                                                                             | **M-U** delete the `switch` item from `registry.json`                                                                | **red 7**                                                                 | —                                                                                                                                             |
| `packages/ui/r/switch.json` → `test/registry.test.ts`                                        | carries the CURRENT bytes of every source it ships                                                                                                                      | **M-V** one class edited inside the committed `content`                                                              | **red 1** (`switch: packages/ui/src/switch.tsx is stale`)                 | —                                                                                                                                             |
| `packages/tokens/test/helpers/source-files.ts` → brand-guard, literal-guard, source-coverage | 3 tests + 2 whole files                                                                                                                                                 | **M-AC** delete `packages/ui/src/switch.tsx` from `PUBLISHED_SOURCE_FILES`                                           | **red**, 3 files                                                          | —                                                                                                                                             |
| same                                                                                         | brand-guard, source-coverage                                                                                                                                            | **M-AD** delete `packages/ui/stories/switch.stories.tsx` from `STORY_FILES`                                          | **red**, 2 files                                                          | —                                                                                                                                             |
| `src/switch.tsx` → `packages/tokens/test/literal-guard.test.ts`                              | finds no literal colour …                                                                                                                                               | **M-AE** plant `[color:#ff00ff]` in `thumbClass`                                                                     | **red 1**                                                                 | the two tokens guards really do reach the new files                                                                                           |
| `test/tailwind-compile.test.tsx`                                                             | (nothing)                                                                                                                                                               | **M-AG** delete `switch: switchPart` from BOTH suite maps and the import                                             | **GREEN 100**                                                             | **FINDING.** The new part can leave the compile check and the 44px floor check silently.                                                      |
| `test/stories.test.tsx`                                                                      | (nothing)                                                                                                                                                               | **M-AH** delete the switch from the import, `SUITES`, the hardcoded family list and both counters (`29→25`, `49→42`) | **GREEN 99**                                                              | **FINDING.** All 7 stories and all 4 plays stop running with no anchor anywhere.                                                              |

(31 mutations, 22 red, 9 GREEN. The reviewer's own scope note: this repo has no
e2e layer and no build-served artefact, so there is no `OWED:` row; `pnpm build`
ran before every measurement because `packages/tokens/dist` is gitignored output
that four test files read.)

### Acting on the layer-1 findings (fixes at `d6e2289`)

Every GREEN row is closed by a change, and every change was re-reddened by
re-running the reviewer's own mutation against the fix.

| row                                                                                    | what changed                                                                                                                                                                                                                 | the red it now produces                                                                         |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **M-P** (HIGH-1: the `asChild` branch drops `className` -> 86 green)                   | the native host is now observed in a rendered cascade: `draws the NATIVE host from the checkbox's own state` reads both states from two renders, and `positions the drawing and the overlay…` reads the row's own `position` | `expected 'var(--overlay)' to be 'var(--primary)'` and `expected 'static' to be 'relative'`     |
| **M-D** (HIGH-2: `relative` off the track -> 86 green)                                 | the same positions test reads the track's computed `position`                                                                                                                                                                | `expected 'static' to be 'relative'`                                                            |
| **M-E** (HIGH-2: `relative` off the row -> 86 green)                                   | …and the row's                                                                                                                                                                                                               | `expected 'static' to be 'relative'`                                                            |
| **M-H** (MED-4: `opacity-0` off the overlay -> 86 green)                               | the native-host test reads the input's computed `opacity`, compared against what the sheet declares for `opacity-0` rather than a retyped `"0"`                                                                              | `expected '1' to be '0%'`                                                                       |
| **M-K** (MED-3: the selector test asserted nothing -> stayed green)                    | that test anchors its own subject before looping, and checks all FOUR trigger/element combinations instead of two                                                                                                            | `track: no aria-driven on-state: expected 0 to be greater than 0`                               |
| **M-N** (MED-5: the `type="button"` guard had no form -> 62 green)                     | a `ButtonInAForm` story whose play clicks the switch and watches for a submit that must not come, plus a `type` assertion in the new bare-`Switch` test                                                                      | `expect(element).toHaveTextContent()` on the submit counter, and `expected null to be 'button'` |
| **M-AG / M-AH** (MED-2: a part can leave both suite maps silently -> 100 and 99 green) | one `packages/ui/test/helpers/story-suites.ts` serves both files, and `stories.test.tsx` checks its keys against the story FILES on disk                                                                                     | `expected [ Array(10) ] to deeply equal [ Array(11) ]`                                          |
| **M-Q** (`pointer-events-none`, benign)                                                | left as it is: a click on the thumb reaches the button by bubbling and the label by forwarding, so the class is belt-and-braces. Recorded here so it is not re-run                                                           | -                                                                                               |

Two findings were code defects rather than missing tests, and both are fixed in
the part:

- **HIGH-3**: `role="switch"` requires `aria-checked`, and nothing wrote or
  demanded one. The button branch now writes `aria-checked={ariaChecked ?? false}` -
  not state, just what "off" is spelled as - and
  `announces off, and draws off, when the caller writes no state at all` pins it.
  Removing the default reddens with `expected null to be 'false'`.
- **HIGH-4**: `<Switch asChild aria-checked>` on a `<label>` lit the pill fully ON
  over an unchecked box while the row announced nothing - the exact disagreement
  the part's docblock claimed to make impossible. The `asChild` branch now STRIPS
  `aria-checked` (as it already refused to spread `role` and `type`), and
  `will not draw a state the row does not announce` pins it. Putting the attribute
  back reddens with `expected 'true' to be null`.

Recorded rather than fixed:

- **LOW-3, the forced-colors focus indicator.** `focus-visible:outline-none` plus a
  `box-shadow` ring leaves no focus indicator under `forced-colors: active`, and
  this part adds a second instance of the house spelling (`has-focus-visible:`).
  It is `accordion.tsx:42` byte for byte, so it is a library-level decision (an
  `outline: 2px solid transparent` companion, or a `forced-colors` media rule in
  the tokens sheet) and not one part's to take unilaterally. **Flagged to the
  orchestrator.**
- **The overlay input covers the row's text**, so the native host's row has no text
  selection and cannot carry a second interactive element. Inherent to the pattern
  and now stated in the part's docblock rather than discovered by a consumer.

### The gate

One run, at `210a576`, detached with a sentinel in `$BATCH_SCRATCH/s2/`:
`pnpm verify` **exit 0** in 16s (06:33:38 -> 06:33:54 IST, 2026-09-18), the
runner's own lines being `All matched files use Prettier code style!`, both
packages' `typecheck: Done`, `✔ Building registry.`,
`└ Storybook build completed successfully` and
`Test Files 19 passed (19)` / `Tests 290 passed (290)`. `git status --short` was
empty afterwards, so the committed `packages/ui/r` is what `build:registry`
produces.

### The pipeline, end to end

`pnpm pack` in both packages (`prepack` builds the registry and runs
`git diff --exit-code -- r`, so packing at all is the evidence that `r/` is
committed and current) -> `marquee-ui-ui-0.1.0.tgz` **26,396 B** (22,005 B at a3)
and `marquee-ui-tokens-0.1.0.tgz` 99,608 B -> `npm install` of both into a bare
project -> `shadcn add ./node_modules/@marquee-ui/ui/r/switch.json`:

```
✔ Created 2 files:
  - src/lib/utils.ts
  - src/components/ui/switch.tsx
```

`src/lib/utils.ts` is the `@marquee/utils` registry dependency resolving offline
through `components.json`'s `registries` map, and the target is
`components/ui/switch.tsx`, not `components/ui/src/switch.tsx`. The bytes:

```
installed bytes: 6823
installed === r/switch.json content: true
installed === packages/ui/src/switch.tsx: true
```

Then the installed copy compiled in the bare project's own Tailwind 4.3.3 against
the published `@marquee-ui/tokens/tokens.css`: all eleven utilities present,
including `.group\/switch`, both named-group state variants,
`.has-disabled\:opacity-50` and `.has-focus-visible\:shadow-focus-ring`, with the
travel rule reading
`:is(:where(.group\/switch)[aria-checked="true"] *) { --tw-translate-x: calc(var(--spacing) * 5); … }`
and a deliberately absent control name absent.

⚠️ **`shadcn add` needs a `tsconfig.json` in the consumer.** Without one, 4.21
fails with `Failed to load tsconfig.json. Couldn't find tsconfig.json` and writes
nothing - worth knowing before someone reads it as a registry problem. And the
alias the copy lands with is the consumer's own: with `aliases.utils` set to
`@/lib/utils` the file is byte-identical, and with it set to `src/lib/utils` the
import line is rewritten and the copy differs by exactly those two bytes.

### Decisions

1. **No Radix, and no new dependency.** [V] The native `button[role="switch"]` and
   the native `<input type="checkbox">` ARE the platform features here, and
   `@radix-ui/react-switch` can serve only the first of the consuming product's two
   hosts. A Radix root would also hold the state in React and reflect it, where
   this part holds none at all - which is the property the consumer's own docblock
   calls central, and the one a `style={{ translate }}` computed in a component
   breaks. `@radix-ui/react-slot` (already a dependency) covers `asChild`.
2. **One part family serves both hosts, and the drawing is what composes.** [V]
   `Switch` is the control and the hit area; `SwitchTrack` and `SwitchThumb` are
   the drawing; `SwitchInput` is the native control for the label host. Four parts,
   no `variant` prop that changes what is inside anything (D6).
3. **Both state triggers ride ONE named group on the root.** [V]
   `group-aria-checked/switch:` and `group-has-checked/switch:` are spelled out
   literally, twice, because Tailwind scans source text. Neither can fire in the
   other's host (a button has no `:checked` descendant; a label carries no
   `aria-checked`), and NAMED because the unnamed `group-has-checked:` would light
   up every switch inside any `.group` that happened to contain one checked box -
   a settings page with three switches and a hover group around it is exactly that
   page. The named form costs a longer class and removes the whole class of bug.
4. **The native host's input is an invisible overlay on the row, not the track.**
   [V] Measurement 1: an input drawn as the 44x24 track is a 24px control. As an
   overlay it keeps everything that made a native checkbox the right choice - focus,
   keyboard, the label's accessible name, its value in a `FormData`, `:checked` -
   and its hit box becomes the 44px row, which is what the person is pointing at.
   The cost is that its own focus ring is invisible, so the ring is drawn on the row
   (`has-focus-visible:shadow-focus-ring`, beside `focus-visible:` for the button
   host).
5. **No `cva`.** [V] `cva` is for visual axes, state is never one, and this part has
   no visual axis with a second value: one size, one tone, one geometry. A `size`
   axis with a single member is scaffolding, and a second size is a second travel
   arithmetic that no consumer has asked for. `Input` and `Card` are the precedent.
   The class strings stay module-private for the same reason - the parts are the API,
   and an exported string is a second one to keep honest.
6. **`role="switch"` on the native checkbox.** [V] Both hosts then announce the same
   thing, and a checkbox's checkedness maps to the switch state on its own, so the
   part writes no `aria-checked` that could disagree with the box.
7. **No `aria-hidden` on the drawing.** [V] The track and the thumb are empty
   elements with no role and no text, so they name nothing to hide; and the native
   host's focusable input lives inside the same row, where an `aria-hidden` ancestor
   would be a real violation. The consuming product's own `aria-hidden="true"` on
   its track can ride along as a `className`-free prop if it wants it.
8. **`disabled:opacity-50`, the house value, not the consumer's `opacity-60`.** [V]
   Two buttons here already dim at 50 and this part is new rather than moved, so the
   fidelity rule ("the tokens change name, the pixels do not") does not bind it. The
   consumption dims its settings switch 10% less than today; nothing else moves.
9. **The button branch writes `aria-checked="false"` when the caller writes
   nothing, and the `asChild` branch strips `aria-checked` entirely.** [V] Taken
   at layer 1 (HIGH-3, HIGH-4). The first is not state - `role="switch"` REQUIRES
   the attribute, so a missing one is a violation and a permanently-off drawing,
   and "off" is what a switch is until told otherwise. The second makes the part's
   central promise a property of the PART rather than of its stories: an
   `aria-checked` on a `<label>` announces nothing and would light the pill anyway.
   Both refusals are the same shape as `Button`'s `asChild` branch refusing to
   write `type`.
10. **The stated part count was updated where the package DESCRIBES itself**
    (`AGENTS.md`, `README.md`, `packages/ui/package.json`), and deliberately NOT in
    `label.tsx`'s "rather than as an eleventh part (D10)", which records a2's decision
    at the time it was taken - and whose bytes are frozen by the consuming repo's
    drift test, so a comment edit there is a re-sync that buys nothing.

### thepile inputs

What the consumption half needs when `0.1.1` publishes, in one list:

- `switch` goes into `CONSUMED` in `scripts/marquee-drift.test.ts`, and
  `components/ui/switch.tsx` arrives by `shadcn add` like the other six.
  ⚠️ Two things that command does that the six never warned about (DL7 layer 2, MED-2 and
  LOW-9): `shadcn add` also re-creates `src/lib/utils.ts` beside every item (this section's
  own pipeline proof printed `Created 2 files`), and thepile's `lib/utils.ts` is a DECLARED
  EXCLUSION whose `cn` is a plain join on purpose - so `git checkout -- apps/web/src/lib/utils.ts`
  before running the drift test, whose "adopt the copy and drop this entry" message names the
  wrong remedy for this cause (thepile's copy of the message now says so). And that test pins
  the NON-consumed set exactly, so the 0.1.1 bump and the `CONSUMED` edit land in ONE commit,
  or the arm is red between them.
- **`ContentSettings.tsx`**: the row becomes `<Switch>` itself - it is already a
  `button[role="switch"]` with `aria-checked`, `disabled` and an `aria-label`, so
  the row's own classes (`w-full justify-between rounded-md border-2 …`) pass
  through `className` and the drawing becomes `<SwitchTrack><SwitchThumb/></SwitchTrack>`.
  Keep `data-testid="switch-track"` / `"switch-thumb"` on those two parts: they
  spread props, and `e2e/mobile-390.spec.ts` resolves both from inside the clicked
  switch by exactly those ids. `min-h-hit`, `group` and the disabled treatment come
  from the part now and should be deleted from the row's own string; the `hover:`
  and the box are the page's and stay.
- ⚠️ **`ContentSettings.tsx` keeps passing `aria-checked={on}`** (it has real
  state); a host that passes none is drawn and announced OFF rather than silently
  broken. ⚠️ **`PushSettings.tsx` must NOT pass `aria-checked`** - the `asChild`
  branch drops it, deliberately, and the checkbox is the state.
- **`PushSettings.tsx`**: `<Switch asChild><label …>` with `<SwitchInput>` in place
  of the bare `<input className={`peer ${SWITCH_TRACK_CHECKED}`}>`, and the same
  `<SwitchTrack><SwitchThumb/></SwitchTrack>` after it. The wrapping
  `<span className="relative shrink-0">` goes: the thumb is inside the track now,
  which is what makes the two rows the same drawing (UNVERIFIED 5 - they are 2px
  apart today).
  ⚠️ And the label passes `w-full` (DL7 layer 2, MED-3, proved): the part's root is
  `inline-flex`, thepile's `cn` is a plain join that keeps both it and the host's `flex`, and
  the stylesheet's later rule (`inline-flex`) wins, so without a width the label shrinks to
  fit and `justify-between` has nothing to distribute. In this repo's Storybook tailwind-merge
  drops the conflict; in thepile every conflicting class a host passes resolves the opposite
  way from what a story shows.
- `switch-styles.ts` and `switch-styles.test.ts` are DELETED. Everything the test
  asserted survives, in the library: the platform-driven state (by the compiled
  selector AND by a cascade), the two hosts changing the same properties by the
  same amounts (compared by declaration, not by class string), the disabled
  rendering on both hosts, and `travel === trackW - 2*border - 2*inset - thumbW`
  (re-derived from the compiled sheet rather than from the strings). Its other two
  arms - that the two hosts share the off-state drawing, and that neither host
  spells a track of its own - stop being assertions and become true by
  construction: there is ONE track string and ONE thumb string, carrying both
  triggers, and a host that hand-typed a pill would not be using the part at all.
- `e2e/mobile-390.spec.ts`'s thumb-move arm keeps its GEOMETRY (same 44x24 track, same
  20px of travel, same `aria-checked` under it) and had lost its RESOLUTION: it found the
  switch by `[role="switch"]`, first in document order, and decision 6 puts that role on the
  push row's checkbox, which renders first (DL7 layer 2, HIGH-1, proved with the real parts
  against thepile's probe lines: track, thumb and `aria-checked` all read null). thepile's
  probe now resolves by identity (`[role="switch"][aria-label="Show adult game covers"]`),
  and the consumption keeps it so. It is also now the only instrument in either repo that can
  see the thumb move, so it should not be weakened.
- `selected-contrast.test.tsx`'s comment about the switch's ink stays true: the
  off thumb is `--muted` (4.53:1 on the track) and the on fill `--primary`.
- Two behaviours the consumption GAINS, and should be looked at on a device: the
  push row's control becomes the whole 44px row rather than a 44x24 box, and its
  focus ring moves from the input's own box to the row.

### Consumers

Both runs of the scan (`50130fa…` in place of `origin/next`, over `packages/**`
and `registry.json`), the script in `$BATCH_SCRATCH/s2/consumer-scan.sh`.

**Run 1, before any code** (`consumer-scan.1.txt`): the diff was empty, so scans 1-3
printed nothing; scan 4 enumerated the declared lists an eleventh family must
enter, which is what the run was for:

```
packages/ui/test/registry.test.ts:60:  it("declares the ten part families plus the one shared lib", …
packages/ui/test/registry.test.ts:142:    expect(checked).toBe(10);
packages/ui/test/registry.test.ts:210:    expect(compared).toBe(12);
packages/ui/test/stories.test.tsx:77:const DECLARED_PLAYS = 25;
packages/ui/test/stories.test.tsx:78:const DECLARED_STORIES = 42;
packages/ui/test/stories.test.tsx:105:  it("covers all ten part families, with every story counted", …
packages/ui/test/fidelity.test.tsx:19: * Six of the ten part families were lifted out of a real product…
AGENTS.md:51:- `packages/ui` - the ten part families, one file each…
```

⚠️ That run also corrected the scan itself: `git grep … -- 'packages/*/test'`
matches NOTHING in this repository and returns 0 quietly. The pathspec is spelled
`packages/ui/test packages/tokens/test`, and the empty output of the first spelling
was not evidence of anything.

**Run 2, at the commit point** (`consumer-scan.2.txt`): 12 exported names - the
four parts, `SwitchProps`, and the seven story exports. Every reader of every one
of them is inside this slice's own files (`index.ts`, `switch.stories.tsx`,
`switch-drawing.test.tsx`, `registry.json`). The one hit outside them,
`packages/tokens/src/presets/arcade.ts` for the story named `On`, is the word "On"
starting a comment, not a consumer. Scan 3 named `AGENTS.md`,
`source-files.ts`, `packages/ui/package.json`, `registry.test.ts` and
`registry.json` - all five updated in this diff.

**0 CROSS, 0 UNOWNED**, 12 names NEW between the two runs (the first ran against an
empty diff by construction). The batch's other stream is in a different repository.

**Run 3, after the layer-1 fixes** (`consumer-scan.3.txt`): four names more -
`NativeCheckboxOn` and `ButtonInAForm` (stories), and `STORY_SUITES` /
`storySuiteNames` from the new `packages/ui/test/helpers/story-suites.ts`. The two
readers of the shared map are exactly the two test files that used to keep their
own copies (`stories.test.tsx`, `tailwind-compile.test.tsx`), which is the point of
it. Scan 3 gained `packages/ui/test/switch-drawing.test.tsx` (it now names the
story file it renders). Still **0 CROSS, 0 UNOWNED**.

⚠️ A blind spot worth carrying: scan 3's stem arm looks for `./<stem>"` and
`../<stem>"` and so does NOT see `import * as x from "../stories/switch.stories.js"`,
which is how `stories.test.tsx` and `tailwind-compile.test.tsx` reach a new story
file. Both were found by reading the suite rather than by the scan, and the
declared-list arm (scan 4) is what actually covers them here.

## DESIGN-LIB-d: Breadcrumb and Pagination (2026-09-18)

Scope: the second catalogue addition, and the first MOVES since a2 - the consuming
product's design audit names `Breadcrumb` in the `should use` column of 10 rows and
`Pagination` of 9, more than any part that does not already ship (re-counted on the
thepile base: `awk -F'|' 'NF>4 {print $4}' docs/design-audit.md` piped through
`command grep -c -w`, which is the brief's number confirmed). Both are lifted out of
one component each, so the FIDELITY rule binds them: the tokens change name, the
pixels do not. Nothing was published, nothing was pushed (the Actions-minutes
freeze), no version was bumped, and nothing in the consuming repo was changed - it
was read only, with `git show`, at commit `f00ce14a`.

### What shipped

| file                                                  | what                                                                                                                                                                                                                           |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/ui/src/breadcrumb.tsx`                      | seven parts - `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbPageItem`, `BreadcrumbSeparator`, `BreadcrumbLink`, `BreadcrumbPage` (6,801 B)                                                                      |
| `packages/ui/src/pagination.tsx`                      | five parts - `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationEllipsis`, `PaginationLink` (4,954 B)                                                                                                             |
| `packages/ui/stories/breadcrumb.stories.tsx`          | 3 stories, 2 with a `play`                                                                                                                                                                                                     |
| `packages/ui/stories/pagination.stories.tsx`          | 3 stories, 3 with a `play`                                                                                                                                                                                                     |
| `packages/ui/test/nav-consumption.test.tsx`           | 15 tests: the consuming product's own six unit assertions, its three `data-testid` probes and its pager e2e resolution, run against the real parts                                                                             |
| `packages/ui/test/fixtures/extract-upstream-nav.mjs`  | the second upstream extractor: 13 class strings and 4 ARIA contracts, read with `git show`, markers checked for uniqueness                                                                                                     |
| `packages/ui/test/fixtures/upstream-nav-classes.json` | its output, recording the commit it was read at                                                                                                                                                                                |
| `packages/ui/test/fidelity.test.tsx`                  | the nav half: 12 cases over 13 fixture rows, the `cn` no-op loop over the same 12, a coverage anchor, the dropped-margin test, one DROP departure, and the stale-rename check now reading both fixtures (86 tests in the file) |
| `packages/ui/test/tailwind-compile.test.tsx`          | a new describe, 5 tests: the shrink/`min-width` pair and the pager's floor on BOTH axes, in resolved declarations                                                                                                              |
| `registry.json` + `packages/ui/r/*.json`              | the `breadcrumb` and `pagination` items, `@radix-ui/react-slot` as their dependency, `@marquee/utils` as their registry dependency                                                                                             |
| the declared lists                                    | both lists in `source-files.ts`, the shared suites map, `stories.test.tsx`'s two counts, `registry.test.ts`'s item list and its two counters                                                                                   |
| the stated count                                      | `AGENTS.md`, `README.md` and `packages/ui/package.json` say thirteen part families; `README.md` and `fidelity.test.tsx` say EIGHT of them were moved                                                                           |

No new dependency: `@radix-ui/react-slot` was already here, no Radix primitive exists
for either family, and the house glyph is the middot `·` as text, so no icon package.
`pnpm test` goes from **290 tests in 19 files to 344 in 20** (342 at `c6cd0c2b`; the layer-1
fix `59d54f1` added two, and the gate line below says 344; base measured at
`9c40f3ad`: `pnpm verify` exit 0 in 13.81 s, `Test Files 19 passed (19)`,
`Tests 290 passed (290)`).

The shape, in one line each:

```tsx
// the trail: the separator is INSIDE the item it precedes, and which ITEM part a
// step uses is what decides whether it may shrink
<Breadcrumb data-testid="breadcrumb">
  <BreadcrumbList>
    <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
    <BreadcrumbPageItem><BreadcrumbSeparator /><BreadcrumbPage>{name}</BreadcrumbPage></BreadcrumbPageItem>
  </BreadcrumbList>
</Breadcrumb>

// the pager: `pageWindow` stays with the collection, the label stays with the caller
<Pagination className="mt-2">
  <PaginationContent>
    <PaginationItem>
      {gap && <PaginationEllipsis />}
      <PaginationLink asChild isActive={p === current} aria-label={`Page ${p}`}>
        <Link href={href(p)}>{p}</Link>
      </PaginationLink>
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

### Measurements, and what they corrected

**1. `min-h-11` is not interchangeable with the house's `min-h-hit`, and the rename
table's silence about it is load-bearing.** Both resolve to 44px - the package's own
floor guard reads them identically, in pixels, out of the compiled sheet. But the
consuming product's unit test greps the LITERAL string
(`expect(link.className).toContain("min-h-11")`), so a part that spelled the floor the
house way would redden a repository this suite cannot run. Measured by mutation: with
`min-h-hit` in the link, `gives every tappable step the 44px floor` fails with
`expected 'inline-flex min-h-hit items-center un…' to contain 'min-h-11'` and the
package's resolved-pixel floor guard stays **green**. Same for the pager's
`min-h-11 min-w-11`.

**2. The pager's cells are 44px on two axes and the second one was measured nowhere.**
`tailwind-compile.test.tsx`'s floor guard collects
`min-height`/`height` only (its regex, line 268), which is the right instrument for
every control that shipped before this one. A page link is a box whose CONTENT is one
or two digits, so `min-w-11` is the half that makes it tappable, and deleting it left
that guard green: the new arm
(`gives the pager's cells the floor on BOTH axes, which no other guard reads`) is what
reddens, `the page you are on: min-width: expected [] to deeply equal [ 44 ]`. It
measures both link states, because a floor that moved with the state would be a floor
nobody has.

**3. `min-w-0` has to be on the ITEM, not on the page inside it** - and that is why
the one-line rule ships as two `li` parts rather than as a prop. A flex item's
automatic minimum size is its content, so the `<li>` must be allowed below its
content or the row overflows instead of the name truncating; the `<span>` inside is a
scroll container (`truncate` brings `overflow: hidden`) and can already shrink. The
brief said "the item and the page part carry the right flex classes"; the page part
carries `truncate text-foreground` and nothing else, and moving `min-w-0` onto it
would stop the truncation it exists for. Read as resolved declarations, the pair is
`flex-shrink: 0` on the linked item with no `min-width` at all, and `min-width: 0px`
on the current one with no `flex-shrink`.

**4. The separator's shape: what I claimed, and what the runner actually does.** The
first version of this part's docblock said a separator as its own list item "puts
FIVE items in a three-step trail" and would redden the consumer's trail-order test.
The reddening run for it reddened nothing but the byte guard, so the claim was
measured instead of argued (`$BATCH_SCRATCH/s2/separator-shapes.txt`, a two-step list
in this runner):

| separator shape                                 | `getAllByRole("listitem")` | raw `<li>` | the items' texts  |
| ----------------------------------------------- | -------------------------- | ---------- | ----------------- |
| inside the item (this part)                     | 2                          | 2          | `["a", "·b"]`     |
| a `<li>` NESTED inside the item (the mutation)  | 2                          | 3          | `["a", "·b"]`     |
| shadcn's `<li role="presentation" aria-hidden>` | 2                          | 3          | `["a", "b"]`      |
| a sibling `<li>` with no role and not hidden    | 3                          | 3          | `["a", "·", "b"]` |

So the item COUNT cannot tell the shapes apart: a nested `<li>` has no `listitem` role
at all and an `aria-hidden` sibling is excluded from the tree. What can tell them
apart is the item's own TEXT, which is what the consumer's `replace(/^·\s*/, "")` is
written for - and that is now asserted beside the strip
(`["Start", "·A section", "·The page you are on"]`), which reddens when the separator
moves out of its item. The reasons the shape is kept are the two that survive
measurement: one flex child per step, which is what the `shrink-0` rule was measured
against, and the glyph inside the text.

**5. The landmark name is CASE-SENSITIVE in the consumer's instrument, so shadcn's
default would have reddened it.** `getByRole("navigation", { name: "Breadcrumb" })`
matches the accessible name exactly; with the part's default lowercased to shadcn's
`"breadcrumb"`, three tests fail with
`Unable to find an accessible element with the role "navigation" and name "Breadcrumb"`.
The pager's is the same shape one step further: the e2e asks Playwright for
`{ name: "Pages" }`, which is case-insensitive but still a whole-string match, and
shadcn's `"pagination"` is a different word. Both parts therefore default to the
consumer's own spelling, and both let a caller rename the landmark (`aria-label` is
destructured with a default rather than spread, so a caller who passes none still
gets a named landmark).

**6. The base is green only after a build** (the Switch's measurement 8, unchanged and
re-confirmed here): `pnpm test` in a fresh worktree is red on four files until
`packages/tokens/dist` exists. `pnpm verify` orders it that way.

**7. jsdom lays nothing out, so no `play` here sees the truncation, the tap or a box.**
That is DL7's measurement in this same document (its measurement 2), not re-run; it is
why the two stories that exist to SHOW the one-line rule carry no `play`, and why the
geometry lives in the compiled-sheet arms instead.

### Every UNVERIFIED claim in the brief, measured

1. **"`<nav aria-label="Breadcrumb" data-testid="breadcrumb">` (the testid is the CALL
   SITE's to pass; the part spreads props)"** - the first half is right and the
   parenthesis is not, TODAY: the id is hard-coded in the component
   (`components/game/Breadcrumb.tsx:31`) and the single call site
   (`app/game/[slug]/page.tsx:522`) passes only `crumbs`. The part here does spread
   props, so the conclusion stands, but the consumption has to MOVE the id to the call
   site rather than keep it - and three e2e specs resolve by it
   (`e2e/seo.spec.ts:371`, `e2e/a11y.spec.ts:450`, `e2e/mobile-390.spec.ts:883`, all
   three line numbers confirmed at the base).
2. **"Pagination: `<nav aria-label="Pages">` (the call site adds `mt-2`)"** - WRONG,
   and the batch section says the same thing. `mt-2` is on the nav inside
   `components/hubs/HubPagination.tsx:34`, and all NINE call sites pass only
   `href` / `current` / `totalPages` (`[username]/[shelf]/[[...view]]/page.tsx:306`,
   `components/browse/BrowseListing.tsx:167`, `lib/genre-hub.tsx:133`,
   `lib/lists-hub.tsx:118`, `lib/members-hub.tsx:125`, `lib/platform-hub.tsx:123`,
   `lib/releases.tsx:204`, `lib/series-hub.tsx:119`, `lib/studio-hub.tsx:115`). Same
   for the per-link `aria-label={`Page ${p}`}`, which is the component's
   (`HubPagination.tsx:50`). Consequence for the consumption, in the checklist below:
   the margin and the two labels become the call site's, at nine sites, or the pager
   moves up 8px on every hub and `e2e/hubs.spec.ts:565` loses both its resolutions.
3. **The trail's class contract** (`ol` `flex items-center text-sm text-text-secondary`,
   link items `flex shrink-0 items-center`, the current item `flex min-w-0 items-center`,
   the separator `px-2 text-text-muted` before every item but the first, links
   `inline-flex min-h-11 items-center underline underline-offset-2 hover:text-text`,
   the page `truncate text-text` under `aria-current="page"`) - CONFIRMED byte for
   byte: those strings are what the extractor read into
   `upstream-nav-classes.json`, and the parts are compared against them through the
   rename table rather than against anything typed here.
4. **The pager's class contract** - CONFIRMED byte for byte, including the current /
   other pair (`border-accent text-text` against
   `border-line-strong text-text-secondary hover:border-accent hover:text-text`).
5. **"the item and the page part carry the right flex classes"** - half wrong, and the
   half that is wrong would cost the feature: measurement 3.
6. **"`pageWindow` (WHICH pages) stays in thepile's contracts package; the part is
   presentation"** - CONFIRMED: `HubPagination.tsx:1` imports it from
   `@thepile/contracts/pure`, and nothing about a window crossed into this package.
7. **"Roles, never thepile's names"** (five renames listed) - CONFIRMED, and the
   stronger result is that the a1 table needed NO new entry: every one of the 13
   upstream strings maps through the table as it stood, with `min-h-11`, `min-w-11`,
   `truncate`, `underline-offset-2` and the layout utilities carried through
   unchanged. The one change that is not a rename is the pager nav's `mt-2`, declared
   as a DROP with its reason (decision 4).
8. **"No Radix primitive exists for either; `@radix-ui/react-slot` covers `asChild`;
   NO new dependency and no icon package"** - CONFIRMED by construction: both families
   ship with `@radix-ui/react-slot` alone, which was already a dependency, and the
   glyph is text.
9. **"`Breadcrumb` on 10 rows and `Pagination` on 9"** - re-counted at the thepile
   base: 10 and 9.
10. **"`e2e/shots/manifest.ts:1013` (prose only)"** - CONFIRMED: line 1013 is the
    `/lists/page/[n]` exclusion's reason, which names `HubPagination` in a sentence and
    asserts nothing about it.

### Guards, each proved by running its reddening mutation

Run in the COMMITTED tree (`5e1f5634`, and the two that came after the correction at
`c6cd0c2b`), each landing confirmed by `git grep` before the run was read, each
reverted with `git checkout --` and `git status --short` empty afterwards. The runner
is `$BATCH_SCRATCH/s2/mutate.py`, the logs are in `$BATCH_SCRATCH/s2/mutations/`.

⚠️ Read one thing into every row below: **every source mutation also reddens
`carries the CURRENT bytes of every source it ships`**, because `packages/ui/r` was
not rebuilt. That is the registry guard doing its job (it is how a committed build
artefact is kept honest) and it is omitted from the table, which lists the reds that
NAME the mutated property.

<!-- prettier-ignore-start -->

| guard | mutation | landed | the red it produced |
| --- | --- | --- | --- |
| the moved set is the upstream set, renamed | `text-foreground-2` -> `text-muted` in the trail's list | `breadcrumb.tsx:44` | `breadcrumb.list`, the utility SETS compared |
| the floor keeps the spelling its consumer greps | link `min-h-11` -> `min-h-hit` | `breadcrumb.tsx:51` | TWO: `breadcrumb.link` (the set), and `gives every tappable step the 44px floor` with `expected 'inline-flex min-h-hit items-center un…' to contain 'min-h-11'`. The package's own pixel floor guard stayed GREEN, which is the finding |
| the glyph is part of the item's text | the separator moved out of the item in the CONSUMPTION render | `nav-consumption.test.tsx:79` | TWO: `renders the steps in trail order, as one list` with `expected [ 'Start', 'A section', …(1) ] to deeply equal [ 'Start', '·A section', …(1) ]`, and the separator count |
| the separator is inside the item, in the story a consumer copies | the separator moved out of the item in `breadcrumb/Trail` | `breadcrumb.stories.tsx:30` | `breadcrumb/Trail` with `expect(element).toContainElement(element)`, plus the play counter |
| the current step announces itself | `aria-current="page"` removed from `BreadcrumbPage` | `breadcrumb.tsx:135` | FOUR: `marks the step you are standing on as the current page`, `breadcrumb/Trail`, `breadcrumb/OneStep`, and the play counter |
| the landmark's name is the consumer's | the default `"Breadcrumb"` -> `"breadcrumb"` | `breadcrumb.tsx:40` | SIX: three consumption tests with `Unable to find an accessible element with the role "navigation" and name "Breadcrumb"`, both breadcrumb plays, and the play counter |
| only the step you are standing on may give way | the linked item's `shrink-0` -> `min-w-0` | `breadcrumb.tsx:46` | FOUR: `keeps the linked steps unshrinkable, so they cannot stack`; `breadcrumb.item`; and in resolved declarations `expected [] to deeply equal [ '0' ]` for `flex-shrink` plus the instrument's own anchor |
| the pager's cell is 44px on BOTH axes | `min-w-11` removed from the page link | `pagination.tsx:36` | THREE: `the page you are on: min-width: expected [] to deeply equal [ 44 ]`, `pagination.linkCurrent`, `pagination.linkOther` |
| the ink and the announcement come from ONE prop | `aria-current` decoupled from `isActive` | `pagination.tsx:112` | SIX: `resolves the pager by its landmark name and each page by its whole phrase`, all three pagination plays, the play counter, and `Window renders no [data-slot="pagination-link"][aria-current="page"]` |
| the pager decides no outer margin | `className="mt-2"` added back to the nav | `pagination.tsx:55` | TWO: `pagination.nav` with `expected [ 'mt-2' ] to deeply equal []`, and `leaves the pager's outer margin to the caller` with `expected 'mt-2' to be ''` |
| a part cannot leave the shared suites map | `breadcrumb` deleted from `STORY_SUITES` | `story-suites.ts:31` | SIX: `covers all thirteen part families`, the play counter, and all four of the new declaration arms, which stop finding anything to measure |
| a source cannot leave the declared walk | `packages/ui/src/pagination.tsx` deleted from `PUBLISHED_SOURCE_FILES` | `source-files.ts` | THREE, all naming it: `source walk does not match the declared set … Unexpected: [packages/ui/src/pagination.tsx]` |
| a story cannot stop being one | `export const SinglePage` -> `const SinglePage` | `pagination.stories.tsx` | TWO: `expected […(55)] to have a length of 57 but got 56` and the play counter at 34 of 35 |

<!-- prettier-ignore-end -->

One mutation proved nothing and is recorded as such: making `BreadcrumbSeparator`
render a nested `<li>` reddened only the byte guard, which is measurement 4 and the
reason this part's docblock and the consumption test's now say what the runner does
rather than what shadcn's shape suggested.

### The pipeline, end to end

`pnpm pack` in both packages (`prepack` builds the registry and runs
`git diff --exit-code -- r`, so packing at all is the evidence that `r/` is committed
and current) -> `marquee-ui-ui-0.1.0.tgz` **34,383 B** (26,396 B at the Switch) and
`marquee-ui-tokens-0.1.0.tgz` 99,608 B -> `npm install` of both into a bare project
(`package.json`, a `tsconfig.json`, and a `components.json` whose `registries` map
points at `./node_modules/@marquee-ui/ui/r/{name}.json`) -> two `shadcn add` runs:

```
✔ Created 2 files:                 ✔ Created 1 file:
  - src/lib/utils.ts                 - src/components/ui/pagination.tsx
  - src/components/ui/breadcrumb.tsx ℹ Skipped 1 file: (files might be identical…)
                                       - src/lib/utils.ts
```

The bytes, both items:

```
breadcrumb: installed bytes 6801, target components/ui/breadcrumb.tsx
  installed === r/breadcrumb.json content: True
  installed === packages/ui/src/breadcrumb.tsx: True      sha256 c4a8f5cb3fd9 (all three)
pagination: installed bytes 4954, target components/ui/pagination.tsx
  installed === r/pagination.json content: True
  installed === packages/ui/src/pagination.tsx: True      sha256 b4c4c38e6766 (all three)
packed r/registry.json === repo registry.json: True   (14 items)
```

⚠️ **What `shadcn add` does to a consumer's existing `lib/utils.ts`, measured** - a
refinement of DL7's MED-2, which said only that the file is re-created beside every
item. Three cases, run in the bare project:

| the consumer's `src/lib/utils.ts` | a plain `shadcn add`                                                                                                                           | with `--overwrite` |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| absent                            | created (`Created 2 files`)                                                                                                                    | created            |
| present and IDENTICAL             | silently skipped (`files might be identical`)                                                                                                  | rewritten          |
| present and DIFFERENT             | **prompts** `The file utils.ts already exists. Would you like to overwrite? (y/N)`, and with no TTY the file is left untouched (md5 unchanged) | clobbered          |

So the consuming product's declared exclusion - its own `cn` is a plain join, on
purpose - survives a plain `shadcn add`, and the `git checkout --` DL7 prescribes is
a belt rather than the load-bearing part. `--overwrite` is the flag that would break
it, and re-adding an item that has not changed needs exactly that flag.

### Decisions

1. **Both families ship as a MOVE, so the a1 rename table is the whole design.** [V]
   13 upstream class strings were read out of the consuming product with `git show`
   into a SECOND fixture (`upstream-nav-classes.json`) beside a2's, at its own commit:
   a fixture's only check is the commit it records, and one `commit` field cannot be
   honest about two different reads. `fidelity.test.tsx` applies the table and
   compares the SET, so a mistake in the TABLE reddens too.
2. **The ARIA contracts are read out of the consumer as well, not typed here.** [V]
   The landmark names, the test id and the per-link label template live in the same
   fixture's `contracts` map, and `nav-consumption.test.tsx` asserts the parts against
   them. For a moved part an accessible name is as much a consumer contract as a
   pixel, and measurement 5 is what a typo there costs.
3. **The one-line rule ships as TWO item parts, never as a prop.** [V]
   `BreadcrumbItem` cannot shrink; `BreadcrumbPageItem` is the only one that can. A
   `shrinkable` flag would move the decision to every call site, where applying it to
   three steps out of four is invisible - and the rule is a tap-target decision
   (UIA-12 upstream), not a look. Compose, do not configure (rule 1).
4. **The pager's nav drops the upstream `mt-2` and carries no class of its own.** [V]
   The gap between a pager and whatever it pages is the page's composition; a part
   that decides its own outer margin has decided its relationship to a sibling it does
   not own. Declared as a departure with its reason, so the ledger says the pixel
   moved to the caller rather than vanishing, and the consumption passes
   `className="mt-2"` at nine call sites for a zero-pixel move.
5. **No `cva` in either family.** [V] `cva` is for visual axes, and neither part has an
   axis with a second value: one size, one tone, one geometry. `isActive` is not an
   axis either - it is one fact with two halves (the ink and the announcement), which
   is why it is a boolean on the link rather than a variant, and why the part writes
   `aria-current` AFTER the caller's props: one passed to the PART cannot land without
   the border that belongs with it. ⚠️ **And that is as far as it reaches** (layer 1,
   HIGH-1, reproduced): Radix's `Slot` merges the CHILD's props over the slot's, so
   under `asChild` an `aria-current` on the child wins and the two halves can still be
   split. That is `asChild`'s own contract rather than a defect to fight with
   `cloneElement`, so it is pinned by a test and stated to the host instead of denied.
   `Input` and `Card` are the precedent; the class strings stay module-private.
6. **The landmark names are DEFAULTS, and `aria-label` is destructured rather than
   spread.** [V] A caller who passes none still gets a named landmark - an unnamed
   `nav` is a real a11y defect on a page with more than one - and a caller who passes
   their own wins, including `aria-label={undefined}` not being able to blank it by
   accident.
7. **`BreadcrumbEllipsis`, `PaginationPrevious` and `PaginationNext` are NOT shipped.**
   [V] YAGNI beats shadcn-name parity here: no consumer renders any of them, each
   would need an icon or a word this library has no vocabulary for (`Previous`/`Next`
   is COPY, and copy is the product's), and a part nobody composes is a part whose
   stories, floor and fidelity nothing checks. `PaginationEllipsis` IS shipped,
   because the gap dot in the window is exactly it (the audit's own row for
   `/browse/games` says so).
8. **The separator stays inside the item it precedes.** [V] Measurement 4: one flex
   child per step, which is what the `shrink-0` rule was measured against, and the
   glyph inside the item's text, which is what the consumer's leading-`·` strip reads.
   shadcn's sibling `<li role="presentation">` is the shape that was not taken.
9. **The per-link name stays with the caller.** [V] A page link reading "2" announces
   "2"; the consuming product labels every one `Page N` and its e2e resolves by that
   whole phrase. The part will not guess a name out of its child, because a guessed
   label is one that disagrees with the copy around it.
10. **The `count · owner` byline the audit files under `Breadcrumb` is NOT a
    breadcrumb.** [V] Read at the base: `app/[username]/likes/page.tsx:59-71` is a
    `<header>` with an `h1` and a `<p class="font-mono text-sm text-text-secondary">`
    reading `{total} games · <Link>{owner}</Link>`. The middot there joins two FACTS
    (a count and an attribution); a trail's middot separates two LEVELS, and there is
    no step you are standing on. Wrapping it in a `nav[aria-label="Breadcrumb"]` would
    announce a navigation landmark holding one link to a profile and put
    `aria-current="page"` on a count. What those four pages actually share is a
    duplicated HEADER - the audit's own words, "typed out four times with nothing
    shared but the class string" - which is a thepile component to extract, not a
    library part; the only piece here it would reuse is `Label tone="micro"` for the
    mono caption. Recorded for Ankit to overrule.
11. **`min-h-11` and `min-w-11`, not `min-h-hit`.** [V] Measurement 1. The house token
    and the upstream spelling resolve to the same 44px, and the consumer's instrument
    greps the string; a moved part keeps the spelling its consumer reads. If that ever
    reverses, the rename table is where the entry goes, and the fidelity suite is what
    fails first.
12. **The consuming product's own instruments are automated in this repo.** [V]
    `nav-consumption.test.tsx` restates the six unit assertions, the three testid
    probes and the pager e2e resolution against the real parts, because DL7's HIGH-1
    was exactly a moved role re-resolving a consumer's probe onto the wrong element and
    it was found by hand. Two of the six are class rails (the consumer's own comments
    say so) and the properties behind them are measured in resolved declarations
    instead; what this file measures is RESOLUTION.

### thepile inputs

What the consumption half needs when `0.1.1` publishes, in one list. Nothing here was
done: the consuming repo was read only.

- `breadcrumb` and `pagination` go into `CONSUMED` in `scripts/marquee-drift.test.ts`
  (with `switch`, from the Switch's own checklist), and the NON-consumed list in the
  same file - which pins the set exactly - loses them. ⚠️ That test also names
  `accordion, badge, card, separator, utils` as the deliberate remainder, so the
  `0.1.1` bump and both list edits land in ONE commit or the arm is red between them.
- **`components/game/Breadcrumb.tsx` KEEPS its file and its `crumbs` prop as a thin
  wrapper over the parts**, the same shape as `HubPagination` below and for the same
  reason: it owns what the parts deliberately do not - the `Crumb` loop, the S45b rule its
  docblock records (the visible trail and the `BreadcrumbList` node come from ONE
  `breadcrumbFor` call), and `data-testid="breadcrumb"` - and its body becomes the parts
  in the shape at the top of this section. The call site (`app/game/[slug]/page.tsx:522`)
  stays byte-identical. ⚠️ DL8 layer 2, HIGH-1: the first draft of this list DELETED the
  file two bullets above a promise that `Breadcrumb.test.tsx` "survives unchanged" - a test
  whose line 4 imports `./Breadcrumb` and whose six cases render `<Breadcrumb crumbs>`;
  deleting the file would have typechecked red and, resolved the loud way, moved all six
  assertions out of thepile's gate into a repo it never runs. The wrapper is what makes both
  halves true. Three things the WRAPPER carries, because they are the component's today and
  the library's parts do not know them:
  - `data-testid="breadcrumb"` on `<Breadcrumb>` (it spreads props). `e2e/seo.spec.ts:371`
    hit-tests the two links inside it, `e2e/a11y.spec.ts:450` EXCLUDES the trail's genre
    link from a tap-theft sweep by `a.closest('[data-testid="breadcrumb"]')`, and
    `e2e/mobile-390.spec.ts:883` walks UP from it to the shell. All three need the id on
    an ancestor of the links; the landmark is that ancestor.
  - nothing for the landmark's name: the part defaults to `"Breadcrumb"`, which is what
    `components/game/Breadcrumb.test.tsx`'s first assertion resolves by. Passing it
    again is harmless and passing a DIFFERENT one reddens that test.
  - the crumb loop picks `BreadcrumbPageItem` for `crumb.path === null` and
    `BreadcrumbItem` otherwise, and puts `<BreadcrumbSeparator />` inside the item for
    `index > 0`. Both halves are the UIA-12 invariant and the leading-`·` strip.
- **`components/game/Breadcrumb.test.tsx` survives unchanged.** All six of its
  assertions are run against the real parts here (`nav-consumption.test.tsx`), so the
  consumption should not need to touch it; if it does, that is a finding rather than a
  chore. ⚠️ Its test 5 greps `min-h-11` and its test 6 greps `shrink-0` - the two
  spellings measurement 1 and decision 11 are about.
- **`components/hubs/HubPagination.tsx` keeps its file and its props, as a thin
  wrapper**, or the nine call sites each gain three things. Recommended (and, after HIGH-1
  above, the SAME shape as the breadcrumb's): keep the
  wrapper, because it owns exactly what the library deliberately does not - the
  `pageWindow` call, the `return null` on an empty window, `className="mt-2"`, the
  `aria-label={`Page ${p}`}` per link and the gap test `p - pages[i-1] > 1` - and its
  body becomes the parts. That keeps `e2e/hubs.spec.ts:565`'s two resolutions
  (`{ name: "Pages" }` then `{ name: "Page 2", exact: true }`) and the nine call sites
  byte-identical. ⚠️ If the wrapper is dropped instead, all nine sites must pass the
  margin and the labels, and `e2e/hubs.spec.ts:565` is the test that fails first.
- ⚠️ **The pager's nav loses its `mt-2` unless the wrapper passes it** (decision 4).
  That is an 8px move on nine routes and it is the only pixel in this slice that is not
  zero by construction. ⚠️ DL8 layer 2, MED-3: no instrument on either side measures that
  margin - the library's arm is the inverse (the part carries no class), `e2e/hubs.spec.ts`
  resolves by name and never measures a box, and the shots manifest captures no `/[n]` page
  and no page-1 pager for series, studios or releases (they do not paginate on the seed).
  With the wrapper the margin is ONE site (`className="mt-2"` on the nav, exactly as today)
  and the drift test's byte identity says the part adds none; the nine-site gap exists only
  on the drop-the-wrapper path, which this list does not recommend. If that path is taken
  anyway, `e2e/hubs.spec.ts` needs a box arm first (the pager's `nav` at 1280 on
  `/platform/pc` starts 8px below the listing's last row).
- ⚠️ **`aria-current` on a page link comes from `isActive`** (decision 5). The upstream
  call passes `aria-current={p === current ? "page" : undefined}`; that becomes
  `isActive={p === current}` and the attribute is **deleted from the `Link`**. Passing
  it to `PaginationLink` is harmless (the part overrides it); leaving it ON THE CHILD
  is not - the child's wins, and the link is then announced as current while drawn as
  any other page. Same for `aria-label`: it goes on the `PaginationLink`, not on the
  `Link` inside it, or `e2e/hubs.spec.ts:565` resolves nothing and times out at 30s.
  Both measured at layer 1 (HIGH-1, MED-1) and pinned by `lets a child's own attributes
win under asChild`.
- `shadcn add` writes `src/lib/utils.ts` beside each item. Measured in the pipeline
  section above: identical is skipped, DIFFERENT prompts and leaves the file alone with
  no TTY, and only `--overwrite` clobbers it - so thepile's declared `utils` exclusion
  is safe, and the `git checkout -- apps/web/src/lib/utils.ts` DL7 prescribes is a
  belt, not the mechanism.
- ⚠️ **thepile's `cn` is a plain JOIN**, so a class a call site passes does not beat the
  part's own (DL7 MED-3). Nothing in these two families relies on a merge: the parts'
  strings and the classes the call sites pass do not collide (`mt-2` against a nav with
  no class, and nothing else).
- `e2e/shots/manifest.ts:1013` and the other two exclusions naming `HubPagination` are
  prose and stay as they are; `docs/design-audit.md`'s 19 `should use` cells are the
  backlog those rows came from and are `DESIGN-LIB-f`'s, route by route.
- Two behaviours the consumption GAINS, both from `asChild`: a step and a page link
  become the consumer's router `Link` wearing a part, rather than a part rendering an
  anchor, and the library never learns about the router.

### Consumers

Both runs of the scan (`9c40f3ad` in place of `origin/next`, over `packages/**` and
`registry.json`), the script in `$BATCH_SCRATCH/s2/consumer-scan.sh`.

**Run 1, before any code** (`consumer-scan.1.txt`): the diff was empty, so scans 1-3
printed nothing; scan 4 enumerated the declared lists and counters a twelfth and
thirteenth family must enter, which is what the run was for:

```
packages/ui/test/registry.test.ts:60:  it("declares the eleven part families plus the one shared lib"
packages/ui/test/registry.test.ts:143:    expect(checked).toBe(11);
packages/ui/test/registry.test.ts:211:    expect(compared).toBe(13);
packages/ui/test/stories.test.tsx:57:const DECLARED_PLAYS = 30;
packages/ui/test/stories.test.tsx:58:const DECLARED_STORIES = 51;
packages/ui/test/stories.test.tsx:91:    expect(storySuiteNames()).toHaveLength(11);
AGENTS.md:51 · README.md:19 · README.md:24 · packages/ui/package.json:4 · fidelity.test.tsx:19
```

All nine moved, and `README.md`/`fidelity.test.tsx` also carry "Six of the eleven …
were lifted out", which became EIGHT of the thirteen.

⚠️ That run also corrected the scan itself: with `set -eu` the script exits after scan
1 (a `git grep` with no hits returns 1), so scans 2-4 printed NOTHING and the empty
output was not evidence of anything. It runs under `set -u` now, and the finding is the
same shape as DL7's pathspec correction: a scan whose silence is indistinguishable
between "no consumers" and "did not run" is not an instrument.

**Run 2, at the commit point** (`consumer-scan.2.txt`): **20 exported names** - the
twelve parts, two `*Props` types and six story exports. Every reader of every one of
them is inside this slice's own files (`index.ts`, the two sources, the two story
files, `fidelity.test.tsx`, `nav-consumption.test.tsx`, `tailwind-compile.test.tsx`,
`registry.json`, `r/*.json`) plus `README.md` for the two family names, which this
diff updates. Two hits outside them, both prose rather than consumption: `Window`
matched a comment in `switch.stories.tsx` and a line of this document (jsdom's
`PointerEvent … not of type Window`), and `Trail` matched only this slice's own files.

Scan 2 printed nothing, which is the expected answer here rather than a silence: the
library owns no router, so a `*Path`/`*Href` helper appearing in this diff would itself
be the finding.

Scan 3 named nine files, each attributed to the touched file it names:
`source-files.ts` (both new sources and both new stories - the declared walk),
`fidelity.test.tsx`, `nav-consumption.test.tsx` and `extract-upstream-nav.mjs` (the
new fixture), `story-suites.ts` (`stories.test.tsx`, `tailwind-compile.test.tsx`),
`registry.test.ts` (`registry.json`, `r/registry.json`, `packages/ui/package.json`),
`upstream-nav-classes.json`, and two prose references - `extract-upstream.mjs`'s
docblock naming `fidelity.test.tsx` and `switch-drawing.test.tsx`'s naming
`tailwind-compile.test.tsx`. Nothing behavioural outside this slice.

**0 CROSS, 0 UNOWNED**, 20 names NEW between the two runs (run 1 ran against an empty
diff by construction). The batch's other stream is in a different repository.

## Layer 1 (reviewer, detached worktree of c6cd0c2b, slot r6)

33 mutations, **2 stayed GREEN**, 8 findings (1 HIGH / 2 MED / 5 LOW). The reviewer
ran `pnpm build` before `pnpm test` (the base needs it), took the baseline at
`Test Files 20 passed (20) / Tests 342 passed (342)`, applied every mutation as a
FULL `pnpm test` with `git status --short` confirmed empty between them, re-ran this
slice's own consumer scan (byte-identical to run 2) and its own independent sweep of
every counter a new family must enter, and removed its worktree. Its table, verbatim:

<!-- prettier-ignore-start -->

| file | test | mutation applied | red / GREEN | what it asserts now |
|---|---|---|---|---|
| src/breadcrumb.tsx | nav-consumption "names itself…", "links every step…", "puts the call site's test id…"; stories breadcrumb/Trail, breadcrumb/OneStep, "runs all 35 play functions" | M1 drop the `= NAV_LABEL` default on `Breadcrumb` | **red** (7 failed) | intact |
| src/pagination.tsx | nav-consumption "resolves the pager…"; stories pagination/Window, LastPage, SinglePage, "runs all 35 play functions" | M2 drop the `= NAV_LABEL` default on `Pagination` | **red** (6 failed) | intact |
| src/breadcrumb.tsx | nav-consumption "gives every tappable step the 44px floor"; fidelity `breadcrumb.link`; tailwind-compile "measures every one of them at or above the floor" + "gives every tappable step of the trail the floor, in pixels" | M3 `const linkClass = ""` | **red** (5 failed) | intact |
| src/breadcrumb.tsx | nav-consumption "keeps the linked steps unshrinkable"; fidelity `breadcrumb.item`; tailwind-compile "found the classes to measure…" + "lets only the step you are standing on give way" | M4 drop `shrink-0` from `itemClass` | **red** (5 failed) | intact |
| src/breadcrumb.tsx | fidelity `breadcrumb.currentItem`; tailwind-compile "lets only the step you are standing on give way" | M5 drop `min-w-0` from `pageItemClass` | **red** (3 failed) | intact |
| src/pagination.tsx | fidelity `pagination.linkCurrent` + `pagination.linkOther`; tailwind-compile "gives the pager's cells the floor on BOTH axes" | M6 drop **only** `min-w-11` from `linkClass` | **red**, message `the page you are on: min-width: expected [] to deeply equal [ 44 ]` | intact - the new min-WIDTH arm can fail |
| src/pagination.tsx | tailwind-compile "gives the pager's cells the floor on BOTH axes"; fidelity `pagination.linkOther` | M7 move `min-w-11` out of the base into `linkCurrentClass` only | **red**, message `every other page: min-width: expected [] to deeply equal [ 44 ]`; the current-page arm stayed green | intact - BOTH link states are measured independently |
| src/pagination.tsx | nav-consumption "resolves the pager…"; 3 pagination plays; tailwind-compile BOTH axes | M8 `const current = undefined` (never write `aria-current`) | **red** (7 failed) | intact |
| src/pagination.tsx | nav-consumption "resolves the pager…"; pagination/Window + LastPage plays; tailwind-compile BOTH axes | M9 drop `aria-current` from the **`asChild` branch only** | **red** (6 failed; SinglePage stayed green - it uses the non-asChild branch) | intact |
| src/breadcrumb.tsx | nav-consumption "hides the trail's separator and lets a caller replace the glyph" | M10 drop `aria-hidden="true"` from `BreadcrumbSeparator` | **red** (1 failed) | intact, but no story `play` sees it |
| src/breadcrumb.tsx | nav-consumption "hides the trail's separator…", "renders the steps in trail order" | M11 `{children}` instead of `{children ?? SEPARATOR}` | **red** (2 failed) | intact |
| test/nav-consumption.test.tsx | "renders the steps in trail order, as one list" | M12 rebuild `Trail` in shadcn's shape (separator in a sibling `<li role="presentation" aria-hidden>`) | **red**, `expected [ 'Start', 'A section', …(1) ] to deeply equal [ 'Start', '·A section', …(1) ]` | the **corrected** docblock is exactly right: the strip assertion stays green, the item-TEXT assertion is the one that holds the shape |
| test/fidelity.test.tsx | "covers every moved string" (nav) | M13 empty `NAV_CASES` | **red** (1 failed; 24 tests vanished, 342 -> 318) | the anchor caught it |
| test/fidelity.test.tsx | the 12 nav rows | M14 `expectedUnion` returns `[]` | **red** 11/12; **`pagination.nav` stayed GREEN** | see LOW-1 |
| test/fidelity.test.tsx | every slot-read row in the file | M15 `slotClass` returns `""` | **red** (40 failed) | intact; the `cn is a no-op` nav rows and `pagination.nav` stayed green (`cn("") === ""`) |
| test/fixtures/upstream-nav-classes.json | fidelity `pagination.nav` | M16 change the upstream `pagination.nav` string so the declared DROP no longer matches | **red**, `Error: pagination.nav: declared departure "mt-2" matched nothing in the upstream string` | a stale DROP departure throws by name |
| test/fixtures/upstream-nav-classes.json | fidelity `pagination.nav` | M17 add a SECOND utility beside the dropped one (`"mt-2 border-line-strong"`) | **red**, `expected [] to deeply equal [ 'border-border-strong' ]` | the DROP cannot hide a second dropped utility |
| test/tailwind-compile.test.tsx | all 5 tests of the new describe | M18 `declaredValues` returns `[]` | **red** (5 failed) | no vacuous pass; every test carries a positive read |
| test/tailwind-compile.test.tsx | all 5 tests of the new describe | M19 `slotTokens` returns `[]` | **red** (5 failed) | intact |
| test/tailwind-compile.test.tsx | the whole file | M20 anchor the floor-guard regex to `(?:^\|[;\s])(?:min-height\|height)` | **GREEN** (342 passed) | nothing currently scores its 44px off a `line-height` substring - see LOW-3 |
| test/tailwind-compile.test.tsx | 12 tests across 3 describes | M21 `rule()` returns `""` | **red** (12 failed) | intact |
| stories/breadcrumb.stories.tsx | stories "runs all 35 play functions, and knows if one stopped running" | M22 delete `Trail`'s `play` | **red** (1 failed) | intact |
| stories/breadcrumb.stories.tsx | stories "covers all thirteen part families…", "runs all 35 play functions…" | M23 delete the `OneStep` story | **red** (2 failed) | intact |
| test/helpers/story-suites.ts | stories "covers all thirteen…", "runs all 35…"; tailwind-compile's 4 nav-reading tests | M24 remove `breadcrumb` from `STORY_SUITES` | **red** (6 failed) | the shared map + `storySuiteNames()` anchor works; note the two sweep tests ("compiles every one of them", "measures every one of them at or above the floor") stayed green by simply measuring less |
| packages/tokens/test/helpers/source-files.ts | source-coverage x3, brand-guard, literal-guard | M25 remove `packages/ui/src/breadcrumb.tsx` from `PUBLISHED_SOURCE_FILES` | **red** (3 failed + 2 files errored) | intact |
| packages/tokens/test/helpers/source-files.ts | source-coverage x2, brand-guard | M26 remove `packages/ui/stories/pagination.stories.tsx` from `STORY_FILES` | **red** (2 failed + 1 file errored) | intact |
| registry.json | registry.test x7 | M27 delete the `breadcrumb` registry item | **red** (7 failed) | the 13/15 counters and the byte-for-byte index all fire |
| src/breadcrumb.tsx | nav-consumption x3, breadcrumb plays x2, "runs all 35…" | M28 `NAV_LABEL = "breadcrumb"` (shadcn's lowercase) | **red** (7 failed) | the case-sensitivity claim in the docblock is true and instrumented |
| test/fixtures/upstream-nav-classes.json | nav-consumption "reads its names out of the fixture…", "lets the caller rename either landmark" | M29 delete the `breadcrumb.navLabel` contracts key | **red** 2/13; **3 name-resolving tests stayed GREEN** | see MED-2 |
| test/fixtures/upstream-nav-classes.json | nav-consumption "reads its names out of the fixture…" | M29b change `pagination.linkLabel` to a WRONG value (`"Pages ${p}"`) | **red** 1/13 (anchor only); the other 12 stayed GREEN | the anchor is the sole check on a wrong fixture value - by design, stated in the file |
| test/fixtures/upstream-nav-classes.json | nav-consumption x4 | M29c delete the `pagination.linkLabel` key | **red** 4/13, `TypeError: Cannot read properties of undefined (reading 'replace')` | a missing template key is loud |
| test/fixtures/upstream-nav-classes.json | nav-consumption x2 | M29d delete the `breadcrumb.testId` key | **red** 2/13, `Unable to find an element by: [data-testid="undefined"]` | a missing test-id key is loud |
| src/pagination.tsx | fidelity `pagination.nav` + "leaves the pager's outer margin to the caller, and passes it through" | M30 give the pager's `<nav>` a `className="mt-2"` of its own | **red** (3 failed) | the DROP is guarded from both sides |
| src/pagination.tsx | nav-consumption "resolves the pager…" + "derives the current page's announcement…"; pagination/Window + SinglePage plays | M31 make `PaginationLink` guess its own `aria-label` from the child, after the caller's props | **red** (6 failed); `pagination/LastPage` stayed green (it resolves by index, never by name) | intact |
| test/fidelity.test.tsx | "carries no rename entry the upstream strings do not use" | M32 add an unused RENAME entry | **red**, `rename entries that no upstream string uses: expected [ 'text-nowhere' ] to deeply equal []` | intact |
| src/breadcrumb.tsx | nav-consumption "marks the step you are standing on as the current page"; both breadcrumb plays; "runs all 35…" | M33 drop `aria-current="page"` from `BreadcrumbPage` | **red** (5 failed) | intact |

<!-- prettier-ignore-end -->

**Mutations run: 33. Stayed GREEN: 2** - M20, which was a deliberate probe for the
latent regex hazard of LOW-3 rather than the collapse of a claim, and the
`pagination.nav` fidelity row of LOW-1, which compares `[]` to `[]` by construction.
Its two scans found no consumer and no declared list this slice's own runs missed.

### Acting on the layer-1 findings (fixes at `59d54f13`)

**Every finding was reproduced here before it was acted on** - a probe in this
worktree that printed the child's `aria-current` as `"page"` on a link wearing
`border-border-strong`, the child's `aria-label` as `"Go to two"`, and the empty
`aria-label` attribute as `""`.

- **HIGH-1 (taken, as a narrowing plus an instrument).** Radix's `Slot` merges the
  CHILD's props over the slot's, so `aria-current` written after `{...props}` beats a
  prop passed to `PaginationLink` and NOT an attribute on the child - and `asChild` is
  the branch a real app uses. The docblock called that disagreement impossible, which
  is the class-B shape exactly. ⚠️ The code did NOT change: stripping a child's own
  attribute would fight `asChild`'s contract (the caller's element is the caller's) and
  would need `cloneElement` machinery no part in this package has. What changed is that
  the claim now says how far it reaches, and the behaviour is PINNED by a test rather
  than promised away - `lets a child's own attributes win under asChild, which is the
caller's to get right`, which asserts the name resolution the consumer would lose AND
  the announcement/ink split. The rule for a host is one line in the checklist: pass
  `isActive`, and write neither `aria-current` nor `aria-label` on your child.
- **MED-1 (taken, same place).** The same merge order reaches the per-link name; said
  in `pagination.tsx`'s own docblock and covered by the same new test.
- **MED-2 (taken).** The ARIA contracts are read through `contract()`, which throws on
  a missing or empty key. Measured: with `breadcrumb.navLabel` deleted, the file now
  fails to load at all (`upstream-nav-classes.json has no contract for
breadcrumb.navLabel`, 329 tests collected instead of 344) where before three
  name-resolving tests went GREEN with `{ name: undefined }` silently dropping the
  filter.
- **LOW-2 (taken).** `aria-label={value || ""}` shipped an unnamed landmark, because a
  default parameter fires only on `undefined`. Both landmarks now fall back on any
  falsy label, with `never ships an unnamed landmark, whatever falsy label a caller
computes` behind it.
- **LOW-3 (taken).** The older floor guard's property read is anchored, so `height`
  cannot match inside `line-height:`. Re-proved that the guard still FIRES after the
  anchor rather than only that it stayed green: removing `min-h-11` from the trail's
  link reddens `measures every one of them at or above the floor` with four offenders.
- **LOW-4 (taken).** The pager's floor comment now gives the reason that holds for it
  (fidelity: the rename table carries no entry, so `min-h-hit` reddens two fidelity
  rows) instead of borrowing the trail's "the consumer's tests grep the literal", which
  is substantiated for the trail only.
- **LOW-5 (taken).** The separator's `aria-hidden` is now asserted in the story a
  consumer copies as well as in the consumption suite; dropping it reddens both.
- **LOW-1 (recorded, not changed).** The `pagination.nav` fidelity row compares `[]`
  to `[]` and cannot fail today. It is kept because it is the ledger entry for the
  dropped utility, and the property is carried by two arms that DO fail: `leaves the
pager's outer margin to the caller` and the stale-departure throw. It stops being
  vacuous the moment the upstream nav grows a second utility. It is not evidence for
  anything and is named here so nobody counts it.

Re-reddened after the fixes (the same protocol, at `59d54f13`, logs in
`$BATCH_SCRATCH/s2/mutations/`): the `asChild` branch collapsed to a plain anchor
(7 red, including the new test and the package floor guard seeing a 0px link); the
inactive ink swapped for the active one (`expected 'flex min-h-11 min-w-11 items-center j…' to contain 'border-border-strong'`);
the falsy-label fallback reverted to a default parameter
(`Unable to find an accessible element with the role "navigation" and name "Breadcrumb"`);
a contracts key deleted (the file throws by name); `min-h-11` removed after the regex
anchor (`gives every tappable step the 44px floor`, `breadcrumb.link`, both floor arms);
and the separator's `aria-hidden` removed (the consumption test AND the `Trail` play).

### The gate

One run, at `13ca059a`, detached with a sentinel in `$BATCH_SCRATCH/s2/`:
`pnpm verify` **exit 0** in **15.67 s** (11:41:27 IST, 2026-09-18), the runner's own
lines being `All matched files use Prettier code style!`, both packages'
`typecheck: Done`, `✔ Building registry.`,
`└ Storybook build completed successfully` and
`Test Files 20 passed (20)` / `Tests 344 passed (344)` (from 19 / 290 at the base).
`git status --short` was empty afterwards, so the committed `packages/ui/r` is what
`build:registry` produces. No push, no publish, no version bump: the freeze holds and
both families ride the post-freeze `0.1.1` with the Switch.

## DESIGN-LIB-d: Alert (2026-09-19)

Scope: the third §3-d addition, and the second NEW family (the Switch's shape, not
the nav families'): nothing was lifted, so the fidelity fixture does not bind and
the house drawing is DERIVED and recorded below. Nothing was published, nothing was
pushed (the Actions-minutes freeze), no version was bumped, and nothing in the
consuming repo was changed: it was read only, at commit `d6675756`.

### What shipped

| file                                         | what                                                                                                                                                                  |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/ui/src/alert.tsx`                  | three parts - `Alert`, `AlertTitle`, `AlertDescription` - one `cva` tone axis, and no state (4,269 B)                                                                 |
| `packages/ui/stories/alert.stories.tsx`      | 9 stories, 5 of them carrying a `play`                                                                                                                                |
| `packages/ui/test/alert-tone.test.tsx`       | 5 tests: the tone table held to the presets' own ink-on-ground matrix                                                                                                 |
| `packages/ui/test/tailwind-compile.test.tsx` | 5 new tests in resolved declarations, and two helpers HOISTED to module scope so a second family reads declarations without a second copy                             |
| `registry.json` + `packages/ui/r/alert.json` | the `alert` item, `target` `components/ui/alert.tsx`, `@marquee/utils` as its registry dependency                                                                     |
| `packages/ui/src/index.ts`                   | the three parts, `alertVariants` and `AlertProps`                                                                                                                     |
| the declared lists                           | both lists in `packages/tokens/test/helpers/source-files.ts`, `story-suites.ts`, `stories.test.tsx`'s two counts, `registry.test.ts`'s item list and its two counters |
| the stated count                             | `AGENTS.md`, `README.md`, `packages/ui/package.json` and `fidelity.test.tsx`'s docblock say fourteen part families                                                    |

No new dependency: `@radix-ui/react-slot` (for `asChild`) and
`class-variance-authority` (for the tone axis) were both already here, and the
registry item declares the same two `Badge` does. `pnpm test` goes from **20 files /
344 tests** at the base (`c472dd16`, `pnpm verify` exit 0, measured first) to **21 /
364**: +5 for the tone suite, +5 for the declaration arms, +9 story renders and +1
for the suite's own `alert: has stories`.

The shape, in one line each:

```tsx
// the notice with a headline: the box's ink reaches both parts
<Alert tone="destructive">
  <AlertTitle>We could not confirm that account</AlertTitle>
  <AlertDescription>Nothing was changed.</AlertDescription>
</Alert>

// the notice that ARRIVES: the role is the caller's, always
<Alert role="status">That link has expired.</Alert>

// the action is a CHILD, because the box is a flex column
<Alert tone="destructive" role="status">
  <AlertDescription className="text-foreground">Scheduled for deletion.</AlertDescription>
  <Button variant="secondary" onClick={keep}>Keep my account</Button>
</Alert>

// the single-sentence notice that wants to stay a paragraph
<Alert asChild><p role="status">We will not guess, so every game comes in unplayed.</p></Alert>
```

### Measurements, and what they corrected

**1. The drawing, derived from eight boxed notices rather than from shadcn.** Read
with `git show` at `d6675756`, every boxed notice the consuming product draws:

| site                                           | the box                                                                     | line          | ink                          |
| ---------------------------------------------- | --------------------------------------------------------------------------- | ------------- | ---------------------------- |
| `settings/steam/page.tsx:66-70` (tone ternary) | `rounded-md border-2 p-3 text-sm` + `role="status"`                         | danger / line | danger / secondary           |
| `settings/steam/page.tsx:282`                  | `max-w-content rounded-md border-2 border-line p-3 text-sm`                 | line          | secondary                    |
| `settings/steam/page.tsx:328` (`Fix`)          | the same string                                                             | line          | secondary                    |
| `settings/steam/ImportPreview.tsx:141`         | the same string                                                             | line          | secondary                    |
| `settings/DangerZone.tsx:90`                   | `flex max-w-content flex-col gap-3 rounded-md border-2 p-4`, holds a Button | danger        | `text-text` on the inner `p` |
| `settings/DangerZone.tsx:113`                  | the same, holds an input and a button                                       | line-strong   | secondary                    |
| `app/login/page.tsx:52-54`                     | `rounded-md border-2 p-3 text-sm` + `role="status"`                         | danger        | secondary                    |
| `components/game/VolatilityBanner.tsx:42`      | `mt-4 rounded-md border-2 bg-black/50 px-3 py-2 text-sm leading-snug`       | line-strong   | white                        |

The invariant across all eight is `rounded-md border-2 … text-sm` and nothing else.
`p-3` is six of the eight (`px-3 py-2` counted with them); `p-4` is the two that
STACK. So the part is the stack at the majority padding: `flex flex-col gap-2
rounded-md border-2 p-3 text-sm`. `gap-2` is the one value between the house's two
(`CardHeader`'s `gap-1` for a title/description pair and `Card`'s `gap-3` between
regions), because this family has no header/content split and one gap has to serve
both. Everything else in that table is the PAGE's: `max-w-content` on four of them
is a column decision, `mt-4` on the banner is a margin, and `bg-black/50` is a
literal this package may not ship at all (rule 2).

**2. The tone axis is LIFTED, both branches, from the only site that has one.**
`settings/steam/page.tsx:68` is already a ternary:
`notice.tone === "bad" ? "border-danger text-danger" : "border-line text-text-secondary"`.
Through a1's rename table that is exactly `destructive: "border-destructive
text-destructive"` and `default: "border-border text-foreground-2"`, which is the
table this part ships, extended to the three remaining status roles. The line and
the ink move TOGETHER because that ternary moves them together; the two sites that
want a danger line with neutral ink (`login/page.tsx:54`, `DangerZone.tsx:90`) pay
one `className` each, which is where a deliberate softening belongs.

**3. `warning` and `info` cost nothing to ship, and that is measured rather than
argued.** All four status roles are already in `BODY_INK_ROLES`, so the presets'
own build check has always measured them against every ground. Run here
(`contrastMatrix`, `$BATCH_SCRATCH/s2/contrast-probe.ts`), ink on ground, floor 4.5:

| ink         | arcade: background / surface / raised / overlay | light: background / surface / raised / overlay |
| ----------- | ----------------------------------------------- | ---------------------------------------------- |
| destructive | 6.41 / 6.03 / 5.61 / **5.02**                   | 5.91 / 6.26 / 6.45 / 6.54                      |
| success     | 11.33 / 10.65 / 9.92 / 8.86                     | 5.84 / 6.17 / 6.36 / 6.45                      |
| warning     | 11.19 / 10.53 / 9.80 / 8.76                     | 6.45 / 6.82 / 7.03 / 7.13                      |
| info        | 12.25 / 11.52 / 10.73 / 9.58                    | 6.30 / 6.66 / 6.87 / 6.96                      |

The tightest pair in the whole table is `destructive` on `overlay` at 5.02, which
clears. So a five-tone table is not a guess about future consumers: it is the four
roles the contract already publishes and already checks, plus the neutral. What a
tone may NOT be is a role outside that matrix - `text-brand` and `text-primary`
compile exactly as well and are measured by nothing - which is what
`alert-tone.test.tsx` holds the table to, by importing `BODY_INK_ROLES` rather than
retyping it.

The LINE owes no floor and deliberately so: the notice's meaning is its sentence,
never its border, and the house's own `--border` sits at 1.82:1 on `background`
(the Switch's measurement 6, row 4) as a decision. WCAG 1.4.11 reaches a graphic
that is the SOLE carrier of information, and a box around a sentence never is.

**4. Which utility wins when a consumer passes a second one - measured, because
the reference consumer's `cn` is a plain JOIN.** Tailwind 4 emits utilities in its
own theme order, not in source order (proved by reversing the candidate list and by
compiling the pair alone: `$BATCH_SCRATCH/s2/order-probe/`). The order that matters:

```
 3  border-border          border-color: var(--border)
 4  border-border-strong   border-color: var(--border-strong)
11  text-destructive       color: var(--destructive)
12  text-foreground-2      color: var(--foreground-2)
```

Both overrides the consumption actually needs therefore WIN under a plain join:
`className="border-border-strong"` beats the part's `border-border`, and
`className="text-foreground-2"` beats a `destructive` tone's ink. In this repo
tailwind-merge resolves the same two the same way, so a story shows what a call
site gets. This is DL7's MED-3 asked in the other direction and answered.

**5. The bare `p[role=alert].text-sm.text-danger` is a FORM MESSAGE, and the
evidence is in a file that renders both.** `ImportPreview.tsx` has the boxed notice
at `:141` and a bare message at `:238`, and `ImportPreview.test.tsx:327,342` resolve
the BARE one by `getByRole("alert")`. The bare form is seven call sites
(`LoginForm.tsx:113,169`, `ContentSettings.tsx:99`, `DeveloperSettings.tsx:112,228`,
`DangerZone.tsx:96,140`) plus that one, and shares with a notice only `text-sm`: no
border, no radius, no padding, no box. Making it an `Alert` would put a box around
every field error on eight surfaces - a visible redesign, not a move - and would
make `getByRole("alert")` ambiguous in any render that holds both. It is a future
`Form` family's, which is the orchestrator's read, now with the measurement.

**6. A thepile instrument already asserts this part's central decision, and it was
not in the brief.** `VolatilityBanner.test.tsx:83-90`, "is a plain explanation: no
alert role, no icon, nothing to dismiss", runs `expect(screen.queryByRole("alert"))
.toBeNull()` with a comment recording it as S31 decision 2. A library `Alert` that
wrote `role="alert"` by default would redden that test at the consumption, on a
notice whose whole design is that it is NOT a hazard sign. Independent evidence for
decision 2, found by reading the 37 role-resolving files rather than by reasoning.

### Every UNVERIFIED claim in the brief, measured

1. **"at the thepile base 21 files resolve a notice by `getByRole("alert"|"status")`"** -
   WRONG, and the brief flagged the second half of it. Measured at `d6675756`:
   `git grep -l -E 'ByRole\("(alert|status)"' -- 'apps/web/src/**' 'e2e/**'` returns
   **37 files**, not 21. Of those 37, the ones that resolve a BOXED notice are
   **one**: `app/login/page.test.tsx:82`. Every other boxed notice is resolved by a
   `data-testid`, not by a role, and every other `ByRole("alert"|"status")` in the 37
   resolves a bare form message, a toast, a sheet's own status line or a live count.
   The enumeration is the checklist below; 21 was neither the file count nor the
   boxed-notice count.
2. **"`Dialog` / `AlertDialog`, measured FIRST and built only if the measurement says
   so"** - measured, and it says no. The next section is the whole answer.
3. **The orchestrator's audit counts** (`Dialog` 6, `AlertDialog` 2, `Alert` 7,
   `Sheet` 1, counted at `fe02e183`) - re-counted at `d6675756` with the same
   command: **identical**. Read them as ROUTES, not mentions: `-c` counts matching
   lines, one row per route, and `/lists/[id]` is in both the `Dialog` and the
   `AlertDialog` count.
4. **"the orchestrator counted TEN non-test importers of `components/ui/sheet`"** -
   re-counted at `d6675756`: **10**, listed in the next section.
5. **"`DiscardGuard.tsx:62`, `ListManage.tsx`, by hand"** as the `role="alertdialog"`
   set - INCOMPLETE. There are **three** source sites, not two: the third is
   `LogForm.tsx:938`, and it is the one that most looks like this family (see the
   next section).
6. **"`cva` for the tone axis only"** and **"the roles exist: `destructive`,
   `success`, `warning`, `info`"** - confirmed, and the roles are not merely present:
   all four are in `BODY_INK_ROLES`, so all four are already inside the contrast
   check. Measurement 3.
7. **"the 44px floor does not apply to a non-interactive `Alert`"** - confirmed by
   the instrument rather than by reading it: `tailwind-compile.test.tsx`'s floor
   guard selects `button, a[href], input, select, textarea, [role="button"]`, and an
   `Alert` renders none of them, so it is exempt by construction. The `WithAction`
   story puts a real `Button` inside one, which DOES reach that guard - proved by
   replacing it with a bare `<button className="text-sm">`, which produced
   `measures every one of them at or above the floor: expected [ Array(1) ] to deeply equal []`.

### The Dialog / AlertDialog measurement, and the answer

**No `Dialog` family and no `AlertDialog` family ships.** The audit's six `Dialog`
rows and two `AlertDialog` rows resolve to `Sheet` and `SheetContent
role="alertdialog"`, which already exist. Measured at `d6675756`:

- **Every modal in the product is a `Sheet`.** Ten non-test importers of
  `components/ui/sheet"`: `lists/AddToListSheet`, `lists/ListManage`,
  `lists/YourLists`, `log/LogModal`, `play/DiaryEntryCard`,
  `profile/ProfileOverflowMenu`, `pwa/IOSInstallSheet`, `reports/ReportSheet`,
  `shell/LogSheet`, `tiers/RankInTierSheet`. And there is no other modal mechanism
  at all: `git grep -E '<dialog|showModal|createPortal' -- 'apps/web/src/**'` returns
  two hits, both `components/ui/toast.tsx`. No native dialog, no second portal.
- **There is no centred-at-every-width dialog to serve.** `SheetContent` is a bottom
  sheet below 768 and a centred dialog from `md:` up, which is the shape every one
  of those ten wants.
- **Row by row.** `/lists/[id]`'s `Dialog` (the edit) and `AlertDialog` (the delete
  confirm) are `ListManage.tsx`, already a `Sheet` twice, one of them already
  `<SheetContent role="alertdialog">` at `:154`. The five `Dialog for ReportFlag`
  rows are `ReportFlag.tsx:19-20,123`, which dynamically imports `ReportSheet` - a
  `Sheet`. The remaining three are PROPOSALS for things that are not modals today:
  `ShareDoor.tsx` is a plain `<button>`, `AboutMeGrid.tsx` is an inline editor, and
  `/settings`'s `AlertDialog` row is `DangerZone.tsx:113`, an inline boxed panel -
  i.e. an **`Alert` with a form inside**, which is this family. Each is a redesign
  for `DESIGN-LIB-f`, and each would be a `Sheet` when taken, because the product has
  ONE modal shape and shipping a second would give it two.
- **The two non-Sheet `role="alertdialog"` sites are not dialogs, and a dialog
  family would break them.** `DiscardGuard.tsx:62` (`DiscardConfirm`) and
  `LogForm.tsx:938` (the duplicate-day confirm) are rendered INSIDE a still-mounted
  sheet, deliberately, and both docblocks say why: "rendered OVER a still-mounted
  form. Unmounting the form to show this would destroy the very draft the guard
  exists to protect", and "Save's own slot, not an overlay: the draft behind it is
  what the question is about". A Radix `AlertDialog` portals to the body and mounts
  a second focus trap inside the first, which is exactly what those two exist to
  avoid. They are not a gap; they are a shape a dialog family would be wrong for.
  ⚠️ `LogForm.tsx:938`'s box is `flex flex-col gap-2 border-2 border-line-strong
bg-raised p-3` - an `Alert` wearing `role="alertdialog"`, drawing-wise, and now
  composable as one. That is an observation for `DESIGN-LIB-f`, not a promise: it
  takes focus and answers a question, which is more than this family claims.

A second `@radix-ui/react-dialog`-based family was therefore never reached, and no
second Radix dialog dependency was considered.

### Guards, each proved by running its reddening mutation

Run in the COMMITTED tree (`9dae9e8`, and the one that came after the rename at
`b623409`), each landing asserted by the runner BEFORE the run was read (the new
text present AND the old text gone, or it throws), each reverted with
`git checkout --` and `git status --short` empty afterwards - also asserted, per
mutation. The runner is `$BATCH_SCRATCH/s2/mutate.py`, the inputs are
`mutations-{a,b,c}.json`, the logs are in `$BATCH_SCRATCH/s2/mutations/`.

⚠️ Read one thing into every SOURCE row below: **it also reddens `carries the
CURRENT bytes of every source it ships`**, because `packages/ui/r` was not rebuilt.
That is the registry guard doing its job and it is omitted from the table, which
lists the reds that NAME the mutated property. Row 14 is that guard on its own.

<!-- prettier-ignore-start -->

| guard | mutation | landed | the red it produced |
| --- | --- | --- | --- |
| the tone moves the line and the ink together | `destructive` ink -> `text-foreground-2` | `alert.tsx` | TWO: `moves the line and the ink together…` with `destructive: line destructive with ink foreground-2: expected false to be true`, and `resolves every tone's line AND ink…` with `Destructive: ink: expected [ 'var(--foreground-2)' ] to deeply equal [ 'var(--destructive)' ]` |
| a tone's ink is a role the contrast check covers | `success` ink -> `text-primary` | `alert.tsx` | THREE, the first naming it: `tone inks outside the 4.5:1 ink-on-ground matrix: expected [ [ 'success', 'primary' ] ] to deeply equal []` |
| the house line weight | `border-2` -> `border-4` | `alert.tsx` | `draws the house line weight and the house radius, in pixels` with `expected [ 4 ] to deeply equal [ 2 ]` |
| the part decides no width | `max-w-content` added to the base | `alert.tsx` | `decides no width, no outer margin and no tap floor` with `expected [ 'var(--content-max)' ] to deeply equal []` |
| the tone reaches the prose | `AlertDescription` given `text-foreground-2` | `alert.tsx` | `lets the tone reach the prose AND the headline…` with `expected [ 'var(--foreground-2)' ] to deeply equal []` |
| the headline is a weight, not a second colour | `AlertTitle` given `text-foreground` | `alert.tsx` | the same test, `expected [ 'var(--foreground)' ] to deeply equal []` |
| the part writes no live region | `role="status"` added to `Alert` | `alert.tsx` | TWO: `alert/NotALiveRegion` and the play counter |
| `asChild` really slots | `asChild ? Slot : "div"` -> `"div"` | `alert.tsx` | TWO: `alert/AsChildParagraph` and the play counter |
| the headline stays out of the heading outline | `AlertTitle`'s `div` -> `h3` | `alert.tsx` | TWO: `alert/Default` and the play counter |
| a part cannot leave the shared suites map | `alert` deleted from `STORY_SUITES` | `story-suites.ts` | SEVEN: `covers all fourteen part families` with `expected [ 'accordion', 'badge', …(11) ] to deeply equal [ Array(14) ]`, the play counter, and all five declaration arms, which stop finding anything to measure |
| a source cannot leave the declared walk | `packages/ui/src/alert.tsx` deleted from `PUBLISHED_SOURCE_FILES` | `source-files.ts` | TWO whole FILES, both naming it: `source walk does not match the declared set … Unexpected: [packages/ui/src/alert.tsx]` |
| a story cannot stop being one | `export const Warning` -> `const Warning` | `alert.stories.tsx` | `covers all fourteen part families…` with `expected […(64)] to have a length of 66 but got 65` |
| a control inside a notice still owes the floor | the `WithAction` story's `Button` -> a bare `<button className="text-sm">` | `alert.stories.tsx` | the package's own floor guard, `measures every one of them at or above the floor`, with `expected [ Array(1) ] to deeply equal []` |
| the registry cannot ship stale bytes | `border-border` -> `border-border-strong`, `r/` not rebuilt | `alert.tsx` | `carries the CURRENT bytes of every source it ships` with `alert: packages/ui/src/alert.tsx is stale` |

<!-- prettier-ignore-end -->

Two things the mutations changed or recorded:

- One red UNDER-NAMED what it covered. `lets the tone reach the prose: the
description declares no ink of its own` also asserts the TITLE's ink, and the
  title mutation reddened it with a message about `var(--foreground)` under a name
  that said "description". Renamed to `lets the tone reach the prose AND the
headline: neither declares an ink`, committed at `b623409`, and the mutation
  re-run against the rename.
- Mutation 10's secondary red proves nothing by name: with `alert` gone from the
  suites map, the five declaration arms die with
  `TypeError: Cannot destructure property 'default' of 'storiesImport' as it is undefined`
  rather than saying which suite vanished. The red that PROVES the guard is
  `covers all fourteen part families`, in `stories.test.tsx`, and it names it
  exactly. Recorded rather than fixed: the fix belongs in the shared `slotTokens`
  helper, which the nav families' four arms share, and narrowing it for one family
  would leave the other four with the same shape.

### The pipeline, end to end

`pnpm pack` in both packages (`prepack` is `pnpm -w build:registry && git
diff --exit-code -- r`, so packing at all is the evidence that `r/` is committed and
current) -> `marquee-ui-ui-0.1.0.tgz` **38,315 B** (34,383 B at the nav families,
26,396 at the Switch) and `marquee-ui-tokens-0.1.0.tgz` 99,608 B -> `npm install` of
both into a bare project (`package.json`, a `tsconfig.json`, and a `components.json`
whose `registries` map points at `./node_modules/@marquee-ui/ui/r/{name}.json`) ->
`shadcn add ./node_modules/@marquee-ui/ui/r/alert.json`:

```
✔ Created 2 files:
  - src/lib/utils.ts
  - src/components/ui/alert.tsx
```

The bytes:

```
alert: installed bytes 4269, target components/ui/alert.tsx
  installed === r/alert.json content: True
  installed === packages/ui/src/alert.tsx: True      sha256 09304d0943aa (all three)
packed r/registry.json === repo registry.json: True   (15 items)
npm deps the item asked for, and that landed: @radix-ui/react-slot@^1.3.3, class-variance-authority@^0.7.1
```

Then the installed copy compiled in the bare project's own Tailwind 4 against the
published `@marquee-ui/tokens/tokens.css`, with `@source "./components"` so the only
candidates are the installed file itself: **all eighteen utilities present**,
including every tone's pair, with
`.border-warning { border-color: var(--warning) }` and
`.text-info { color: var(--info) }` resolving to the role variables rather than to
copies, and a deliberately absent name (`border-not-a-role`) absent.

### Decisions

1. **The role is the CALLER's, and the part writes none.** [V] `status` (polite) and
   `alert` (assertive) are semantics, not a look, and the same drawing carries both
   in the wild. Measured: of the eight boxed notices in the consuming product, two
   carry `role="status"` and six carry no role at all, so a part that wrote one by
   default would add six live regions to pages that render a hint at load - and
   `VolatilityBanner.test.tsx:83` asserts `queryByRole("alert")` is null on exactly
   such a notice, by a decision of its own. The tone cannot decide it either:
   announcing is about WHEN a notice arrives, not what colour it is, so a
   `destructive` box rendered with the page is not assertive and a `default` one
   that appears after an action is worth announcing. Tone-to-role would be wrong in
   both directions. `NotALiveRegion` pins it, with a role'd sibling as the anchor.
2. **The tone moves the line AND the ink together, to the SAME role.** [V]
   Measurement 2: lifted from the one site in the product that has a tone axis,
   both branches. A red box with green ink is then unspellable. `default` is the
   only asymmetric member (the house line with the house body ink), because there
   is no "neutral" status role and there should not be.
3. **Five tones, which is the four STATUS roles plus the neutral.** [V]
   Measurement 3: every one is already in the presets' ink-on-ground matrix, so
   this is not a guess about future consumers - it is the set the contract already
   publishes and already checks. `Badge`'s four are the precedent for a tone table
   wider than one consumer's use, and unlike a PART an unused tone costs one line
   and one story, with no floor, no fidelity and no registry item. `primary` is
   deliberately absent: it is not a status, and `info` is the neutral-positive.
4. **`AlertTitle` and `AlertDescription` declare no ink.** [V] The tone reaches the
   prose, which is what makes a destructive notice destructive all the way down,
   and the headline is a WEIGHT (`font-semibold`, the accordion trigger's) rather
   than a second colour that could disagree with the tone. `CardContent` is the
   precedent for a part that names a slot and carries nothing.
5. **`AlertTitle` is a `<div>`, not a heading.** [V] A notice is not a section, and
   a heading here enters every screen reader's document map and the page outline.
   No consumer renders one; `asChild` can be added to the title the day one
   composes a notice that really is a section.
6. **The part caps no width, sets no outer margin and carries no tap floor.** [V]
   The nav families' decision 4 applied again: a part that caps its own line length
   has decided the column it sits in. Four of the eight notices carry
   `max-w-content` and one carries `mt-4`; all five are the page's. The floor is
   `Badge`'s rule - a notice is not a control, and the moment it holds one the
   CALLER owes that control the floor, which `Button` already has.
7. **The action is a CHILD, and there is no `AlertAction`.** [V] The box is a flex
   column, so a `<Button>` inside it stacks under the prose, which is exactly
   `DangerZone.tsx:90`. `ToastAction` exists because it does something - it
   dismisses the toast it lives in - and an alert has no state to change, so a twin
   here would be a part that only re-declares a class. Rule 1: composition.
8. **`asChild` on the root, and on neither of the other two.** [V] The
   single-sentence notice in the consuming product is a `<p role="status">`, and
   `asChild` keeps it one; the title and the description have no host a caller has
   been measured to want. ⚠️ Not both at once: `<AlertDescription>` inside an
   `asChild` `<p>` is a `<p>` inside a `<p>`, which the parser does not keep. Said
   in the docblock and in the story.
9. **`alertVariants` is exported; the class strings are not otherwise reachable.**
   [V] The three `cva` parts (`Button`, `Badge`, `Label`) all export their variants
   function, and `alert-tone.test.tsx` needs it to hold the table to the role
   contract. The Switch kept its strings private because it has no `cva` at all,
   which is the same rule and not a different one.
10. **The two declaration helpers in `tailwind-compile.test.tsx` were HOISTED, not
    copied.** [V] `slotTokens` and `declaredValues` lived inside the nav families'
    describe; a second family needed them, and a second copy is how two maps
    disagree (the Switch's layer-1 MED-2 is exactly that defect). The move is pure:
    the block was dedented and relocated above the floor guard, with no edit to its
    body, and the nav arms were re-run green before anything was added.
11. **The stated part count was updated where the package DESCRIBES itself**
    (`AGENTS.md`, `README.md`, `packages/ui/package.json`) and in
    `fidelity.test.tsx`'s docblock, whose "Eight of the thirteen" is a live ratio
    rather than a record of a past decision - the Switch's decision 10 distinction.

### thepile inputs

What the consumption half needs when `0.1.1` publishes, in one list. Nothing here
was done: the consuming repo was read only, at `d6675756`, and every bullet below
was checked against that tree with `git show` before it was written.

- `alert` goes into `CONSUMED` in `scripts/marquee-drift.test.ts`, and
  `components/ui/alert.tsx` arrives by `shadcn add`. ⚠️ **That test pins the
  NON-consumed set exactly** - at `d6675756` it is `accordion, badge, card,
separator, utils` - so the `0.1.1` bump and the list edits land in ONE commit, or
  the arm is red between them. ⚠️ **And this is now a FOUR-item bump**: `switch`,
  `breadcrumb`, `pagination` and `alert` all publish in `0.1.1`, and each of the
  three earlier checklists says the same thing about the same two lists. Whoever
  takes the bump edits both lists once, for all four.
- **`settings/steam/page.tsx:64-74`**: `<Alert role="status" tone={notice.tone === "bad" ? "destructive" : "default"} data-testid="steam-link-notice">{notice.message}</Alert>`.
  Zero pixels move: measurement 2 is that ternary. Keep `role="status"` (the part
  writes none) and keep the testid - `e2e/steam-import.spec.ts:309` resolves it by
  `getByTestId`, not by role.
- **`settings/steam/page.tsx:282` and `:328` (`Fix`), and
  `settings/steam/ImportPreview.tsx:141`**: `<Alert className="max-w-content">`,
  default tone, no role (they have none today). The `max-w-content` is the page's
  now (decision 6) and must be passed, or the line length changes on three notices.
  `Fix` keeps its `testId` prop; `e2e/steam-import.spec.ts` resolves
  `steam-library-private`, and `ImportPreview.test.tsx` and that spec resolve
  `steam-cooldown`.
- **`settings/DangerZone.tsx:90`**: `<Alert tone="destructive" className="max-w-content gap-3">` holding
  `<AlertDescription role="status" className="text-foreground">` and the existing
  `<Button>`. Three classes are the caller's here and each has a reason: the width
  (decision 6), the `gap-3` (the part's gap is 2, so a stacking notice that wants
  the old 12px says so), and the `text-foreground` (the tone's ink is destructive,
  this paragraph is `text-text` today). ⚠️ `role="status"` stays on the inner
  paragraph, where it is today, not on the box.
- **`settings/DangerZone.tsx:113`**: `<Alert className="max-w-content gap-3 border-border-strong">`.
  Measurement 4 is why that last class works: Tailwind emits `border-border-strong`
  AFTER `border-border`, so it wins even though thepile's `cn` is a plain JOIN and
  merges nothing. Without it the panel's line goes from `--border-strong` to
  `--border`, which is the one visible change in this list if it is forgotten.
- **`components/game/VolatilityBanner.tsx:42`**: `<Alert className="mt-4 border-border-strong bg-black/50 px-3 py-2 leading-snug text-white" data-testid="volatility-banner">`,
  keeping the inner `<span className="block max-w-prose">`. Four of those are the
  page's by decision 6 and one, `bg-black/50`, is a literal the library may not ship
  at all (rule 2) - it is the art backdrop's scrim and belongs to the page.
  ⚠️ **It must NOT be given a role.** `VolatilityBanner.test.tsx:83-90` asserts
  `queryByRole("alert")` is null, `queryByRole("button")` is null and there is no
  `svg`, and its comment records that as S31 decision 2. The part writes none, so
  the test survives untouched - that is measurement 6 and it is the strongest
  single reason for decision 1.
- **`app/login/page.tsx:52-56`**: `<Alert role="status" tone="destructive" className="text-foreground-2">`.
  ⚠️ The `className` is load-bearing and measurement 4 is why it works: this notice
  has a danger LINE and secondary INK, the tone gives it both in destructive, and
  `text-foreground-2` compiles after `text-destructive` so the caller's wins under a
  plain join. Without it `login/page.test.tsx:82` still passes (it reads text, not
  colour) and the sentence turns red - a pixel no instrument on either side would
  catch.
- **The bare `p[role="alert"].text-sm.text-danger` stays exactly as it is**, at all
  eight sites (`LoginForm.tsx:113,169`, `ContentSettings.tsx:99`,
  `DeveloperSettings.tsx:112,228`, `DangerZone.tsx:96,140`,
  `ImportPreview.tsx:238`). It is a form message, not a notice (measurement 5), and
  wrapping it would box every field error and make `getByRole("alert")` ambiguous
  wherever a render holds both. A future `Form` family's.
- **The one role-resolved boxed notice in the whole product is
  `app/login/page.test.tsx:82`** (`getByRole("status")` →
  `/scheduled for deletion/i`). It survives unchanged as long as the consumption
  keeps `role="status"` on that box, which the bullet above does. Every other boxed
  notice is resolved by `data-testid`: `steam-link-notice`, `steam-playtime-hidden`,
  `steam-library-private`, `steam-cooldown`, `volatility-banner` - all five keep
  their id on the `<Alert>` itself, which spreads props.
  Swept mechanically rather than by eye: exactly **two** elements in
  `apps/web/src/**/*.tsx` carry a `role` within four lines of a `className`
  containing `border-2`, and they are those two - both `status`, **zero `alert`**.
  So the remaining 36 of the 37 `ByRole("alert"|"status")` files resolve something
  that is NOT a boxed notice, and nothing in them is this family's business.
- `shadcn add` writes `src/lib/utils.ts` beside each item; the nav families'
  pipeline section measured all three cases, and thepile's declared `utils`
  exclusion survives a plain add (only `--overwrite` clobbers it).
- Two behaviours the consumption GAINS: every boxed notice becomes one string in one
  place, so a ninth cannot be drawn slightly differently by hand; and a notice may
  now be `success`, `warning` or `info` without anyone inventing a class - the
  colours are the contract's and are already measured against both presets.

### Consumers

Both runs of the scan (`c472dd16` in place of `origin/next`, over `packages/**` and
`registry.json`), the script in `$BATCH_SCRATCH/s2/consumer-scan.sh`. The shell
`grep` here is a ugrep wrapper, so every arm that becomes a verdict uses
`command grep` or `git grep -F`.

**Run 1, before any code** (`consumer-scan.1.txt`): the diff was empty, so scans 1-3
printed nothing; scan 4 is what the run was for - the declared lists and counters a
fourteenth family has to enter, read off the tree rather than off the brief:

```
AGENTS.md:51 the thirteen part families · README.md:19,24 · packages/ui/package.json:4
packages/ui/test/fidelity.test.tsx:36   Eight of the thirteen part families
packages/ui/test/registry.test.ts:60    declares the thirteen part families plus the one shared lib
packages/ui/test/registry.test.ts:145   expect(checked).toBe(13)
packages/ui/test/registry.test.ts:213   expect(compared).toBe(15)
packages/ui/test/stories.test.tsx:57    const DECLARED_PLAYS = 35
packages/ui/test/stories.test.tsx:58    const DECLARED_STORIES = 57
packages/ui/test/stories.test.tsx:91    expect(storySuiteNames()).toHaveLength(13)
```

All eight moved in this diff (to 40 / 66 / 14 / 14 / 16), and each one was PROVED
to be load-bearing by a mutation rather than assumed: the suites map, the declared
walk and the story export are rows 10, 11 and 12 of the guard table.

**Run 2, at the commit point** (`consumer-scan.2.txt`): **14 exported names** - the
three parts, `alertVariants`, `AlertProps`, and the nine story exports. Every reader
of every one of them is inside this slice's own files (`alert.tsx`, `index.ts`,
`alert.stories.tsx`, `alert-tone.test.tsx`, `registry.json`). Six names collide with
story exports in OTHER story files (`Default`, `Destructive`, `Success`, `Warning`,
`Info`, `WithAction`) and one with a `cva` key in `button.tsx`; a story module is its
own namespace and a variant key is not an export, so none of those is a consumer.
Scan 2 (route/registry contracts) printed the one new item and its target. Scan 3
named `source-files.ts`, `story-suites.ts`, `registry.test.ts`, `fidelity.test.tsx`
and `nav-consumption.test.tsx` / `switch-drawing.test.tsx` - all read, and the only
one this diff CHANGES the behaviour of is `tailwind-compile.test.tsx`, whose two
hoisted helpers the nav arms share (decision 10; those four arms were re-run green
after the move, before anything new was added).

**0 CROSS, 0 UNOWNED**, 14 names NEW between the two runs (the first ran against an
empty diff by construction). The batch's other streams are in a different
repository, and nothing in this one was edited outside this slice's own surface.

**Run 3, after the layer-1 fixes** (`consumer-scan.3.txt`): **15 names**, one more -
`ALERT_TONES`, the tone table exported as data to close HIGH-2. Its readers are the
part itself and the two test files that now derive their tables from it, which is
the whole point of it. That run is also what caught the one thing the fixes left
crooked: the symbol was exported from `alert.tsx` but missing from
`packages/ui/src/index.ts`, so the registry COPY and the package's public surface
disagreed about it. Added, and the suite re-run.

⚠️ The blind spot the Switch recorded still applies and still needed reading rather
than scanning: scan 3's stem arm looks for `./<stem>"` and `../<stem>"`, so it does
NOT see `import * as alert from "../../stories/alert.stories.js"`, which is how
`story-suites.ts` reaches a new story file. Scan 4 - the declared lists - is what
covers it here, which is why that arm exists.

## Layer 1 (reviewer, detached worktree of 9dae9e8a, slot r6)

| file                                         | test                                                                              | mutation applied                                                                                                        | red / GREEN                                                                      | what it asserts now                                                                                                            |
| -------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| src/alert.tsx                                | alert-tone "paints every tone's ink in a role the presets' contrast check covers" | M1 `info: text-info` → `text-brand`                                                                                     | red                                                                              | `AssertionError: tone inks outside the 4.5:1 ink-on-ground matrix: expected [ [ 'info', 'brand' ] ] to deeply equal []` — real |
| src/alert.tsx                                | alert-tone "moves the line and the ink together…"                                 | M2 `destructive: text-destructive` → `text-success`                                                                     | red                                                                              | `AssertionError: destructive: line destructive with ink success` — real                                                        |
| src/alert.tsx                                | alert-tone anchor + "ships exactly the five tones, and nothing decides structure" | M3 `p-6` added to the `warning` tone                                                                                    | red (2)                                                                          | a structure class inside a tone is seen — real                                                                                 |
| src/alert.tsx                                | alert-tone, 4 of 5                                                                | M4 all five tones collapsed to `border-border text-foreground-2` (the degeneracy the brief asked about)                 | red (4)                                                                          | empty delta / base swallowing a tone is caught by the anchor — real                                                            |
| test/alert-tone.test.tsx                     | alert-tone, 4 of 5                                                                | M5 `deltaFor` → `.filter(() => false)`                                                                                  | red (4)                                                                          | instrument collapse caught                                                                                                     |
| test/alert-tone.test.tsx                     | alert-tone, 4 of 5                                                                | M6 `base` → `[]`                                                                                                        | red (4)                                                                          | instrument collapse caught                                                                                                     |
| test/alert-tone.test.tsx                     | alert-tone, 3 of 5                                                                | M7 `TONES` → `["default"]`                                                                                              | red (3)                                                                          | shrinkage caught by the anchor; **"ships exactly the five tones" stayed GREEN**                                                |
| src/alert.tsx                                | alert-tone, 3 of 5                                                                | M8 the `info` tone deleted from the source                                                                              | red (3) `info: expected [] to have a length of 2`                                | a vanishing tone is caught; **"ships exactly the five tones" stayed GREEN** (an empty delta counts as a unique member)         |
| src/alert.tsx                                | **whole suite**                                                                   | M39 a SIXTH tone `muted: "border-border-strong text-brand"` added (line/ink disagree, ink outside the matrix, no story) | **GREEN 364/364**                                                                | see HIGH-2                                                                                                                     |
| src/alert.tsx                                | tailwind-compile "decides no width, no outer margin and no tap floor"             | M9 `max-w-prose` on the base                                                                                            | red @ `:492` `expected [ '65ch' ] to deeply equal []`                            | max-width arm is real                                                                                                          |
| src/alert.tsx                                | same                                                                              | M10 `min-h-hit`                                                                                                         | red @ `:491` `[ 'var(--hit-min)' ]`                                              | min-height arm is real                                                                                                         |
| src/alert.tsx                                | same                                                                              | M11 `m-4`                                                                                                               | red @ `:493`                                                                     | margin arm is real                                                                                                             |
| src/alert.tsx                                | same                                                                              | M12 `mt-4`                                                                                                              | red @ `:494`                                                                     | margin-top arm is real                                                                                                         |
| src/alert.tsx                                | same                                                                              | M36 `mx-auto`                                                                                                           | **GREEN 25/25** (and **364/364** full suite)                                     | see MED-1                                                                                                                      |
| src/alert.tsx                                | same                                                                              | M37 `mb-4`                                                                                                              | **GREEN 25/25**                                                                  | see MED-1                                                                                                                      |
| src/alert.tsx                                | same                                                                              | M38 `w-96`                                                                                                              | **GREEN 25/25**                                                                  | see MED-1                                                                                                                      |
| src/alert.tsx                                | tailwind-compile "lets the tone reach the prose…"                                 | M13 `AlertDescription` gains `text-foreground`                                                                          | red @ `:479`                                                                     | decision 4 (prose) is real                                                                                                     |
| src/alert.tsx                                | same                                                                              | M14 `AlertTitle` gains `text-brand`                                                                                     | red @ `:482`                                                                     | decision 4 (headline colour) is real                                                                                           |
| src/alert.tsx                                | same                                                                              | M15 `font-semibold` removed from `AlertTitle`                                                                           | red @ `:483` `expected [] to not deeply equal []`                                | the positive anchor is real                                                                                                    |
| src/alert.tsx                                | tailwind-compile "draws the house line weight and the house radius"               | M16 `border-2`→`border`                                                                                                 | red `[1]` vs `[2]`                                                               | real                                                                                                                           |
| src/alert.tsx                                | same                                                                              | M17 `rounded-md`→`rounded-lg`                                                                                           | red `var(--radius-lg)` vs `var(--radius-md)`                                     | real                                                                                                                           |
| src/alert.tsx                                | same                                                                              | M18 `p-3`→`p-4`                                                                                                         | red `[16]` vs `[12]`                                                             | real                                                                                                                           |
| src/alert.tsx                                | tailwind-compile "resolves every tone's line AND ink…"                            | M19 `success: text-success`→`text-warning`                                                                              | red `Success: ink: expected [ 'var(--warning)' ]…`                               | real                                                                                                                           |
| test/tailwind-compile.test.tsx               | same                                                                              | M20b the `TONES` table collapsed to **zero rows**                                                                       | **GREEN 25/25** (identical to baseline)                                          | see MED-2                                                                                                                      |
| test/tailwind-compile.test.tsx               | 9 tests across BOTH declaration describes                                         | M21 `declaredValues` → always `[]`                                                                                      | red (9)                                                                          | the anchors do catch a dead reader                                                                                             |
| test/tailwind-compile.test.tsx               | 9 tests across BOTH declaration describes                                         | M22 `slotTokens` → `[]`                                                                                                 | red (9)                                                                          | the anchors do catch a dead reader                                                                                             |
| stories/alert.stories.tsx                    | tailwind-compile "measures every one of them at or above the floor"               | M23 `WithAction`'s `<Button>` → `<button className="p-1">`                                                              | red `+ "button[data-slot=-] \"Keep my account\" -> 0px"`                         | **the `WithAction` story does reach the 44px floor guard**                                                                     |
| src/alert.tsx                                | stories "alert/NotALiveRegion"                                                    | M24 part writes `role="status"` by default                                                                              | red `expected […(3)] to have a length of 1 but got 3`                            | decision 2 anchored for the unconditional case                                                                                 |
| src/alert.tsx                                | stories "alert/NotALiveRegion"                                                    | M25 part writes `role="alert"` by default                                                                               | red `TestingLibraryElementError: Found multiple elements with the role "alert"`  | ditto                                                                                                                          |
| src/alert.tsx                                | **whole suite**                                                                   | M26 part writes `role={tone === "destructive" ? "alert" : undefined}`                                                   | **GREEN 364/364** (after `pnpm build:registry`)                                  | see HIGH-1                                                                                                                     |
| src/alert.tsx                                | **whole suite**                                                                   | M35 part writes `aria-live="polite"` on every notice                                                                    | **GREEN 364/364** (after `pnpm build:registry`)                                  | see HIGH-1                                                                                                                     |
| stories/alert.stories.tsx                    | stories "covers all fourteen part families…"                                      | M27 `export const Info` → `const Info`                                                                                  | red `to have a length of 66 but got 65`                                          | real                                                                                                                           |
| stories/alert.stories.tsx                    | stories "runs all 40 play functions…"                                             | M28 `play:` → `xplay:` (all five)                                                                                       | red `to have a length of 40 but got 35`                                          | real                                                                                                                           |
| test/helpers/story-suites.ts                 | stories ×2 + tailwind-compile ×5                                                  | M29 `alert` removed from `STORY_SUITES`                                                                                 | red (7)                                                                          | the shared map is checked against disk — a part cannot leave quietly                                                           |
| src/alert.tsx                                | stories "alert/Default"                                                           | M33 `AlertTitle` renders `<h3>`                                                                                         | red `expected <h3 data-slot="alert-title" …> to be null`                         | "a notice is not a section" is anchored                                                                                        |
| stories/alert.stories.tsx                    | stories "alert/WithAction"                                                        | M34 `await userEvent.click(action)` deleted                                                                             | **GREEN 82/82**                                                                  | see LOW-1                                                                                                                      |
| src/alert.tsx                                | **whole suite**                                                                   | M40 `flex flex-col gap-2` removed from the base                                                                         | **GREEN 364/364**                                                                | see MED-3                                                                                                                      |
| registry.json                                | registry.test ×7                                                                  | M30 the `alert` item removed                                                                                            | red (7) incl. `expected 13 to be 14`, `expected […(15)] to deeply equal […(14)]` | counters and the `r/` listing are real                                                                                         |
| registry.json                                | registry "targets the consumer's own component directory…"                        | M31 `target` → `components/ui/src/alert.tsx`                                                                            | red, names the item and the path                                                 | real                                                                                                                           |
| packages/tokens/test/helpers/source-files.ts | tokens walk ×3                                                                    | M32 `packages/ui/src/alert.tsx` dropped from `PUBLISHED_SOURCE_FILES`                                                   | red (3 files)                                                                    | the declared-list gate works                                                                                                   |

Pasted verbatim from the reviewer's report (`$BATCH_SCRATCH/r6/report.md`). Every
mutation was confirmed landed by a `grep` of the mutated line before the run, and
every tree confirmed clean after the revert. M26/M35/M39/M40 each ALSO reddened
`carries the CURRENT bytes of every source it ships` before `pnpm build:registry`
was re-run - that red names the stale build artefact rather than the property under
test, so all four were re-read post-rebuild, which is the state committed here.

### Acting on the layer-1 findings (fixes at `5bd2381`)

Ten findings, ten closed in code or in the record. Every one the reviewer proved
GREEN was RE-RUN against the fix, in the committed tree, with the runner asserting
the mutation landed before the run was read (`$BATCH_SCRATCH/s2/mutations-d.json`
and `-e.json`, logs beside the others). The full suite goes 364 -> **365**: one new
test, the flex column.

<!-- prettier-ignore-start -->

| finding | what changed | the mutation that was GREEN, re-run |
| --- | --- | --- |
| **HIGH-1** a tone-conditional `role` and a blanket `aria-live` both stayed green | `NotALiveRegion` is a `render:` of THREE boxes - one announced, two quiet, one of the quiet ones `destructive` so a tone-conditional role has something to decide on - and the play reads `role`, `aria-live` and `aria-atomic` as ATTRIBUTES off the quiet boxes rather than counting roles | `role={tone === "destructive" ? "alert" : undefined}` -> `expected <div role="alert" …> to be null`; `aria-live="polite"` -> `expected 'polite' to be null` |
| **HIGH-2** a sixth tone with a disagreeing line, an ink outside the matrix and no story stayed green | the table is exported as `ALERT_TONES` and fed to `cva`, and BOTH tables derive from it: `alert-tone.test.tsx` iterates its keys and compares them to one stated `SHIPPED_TONES`, `tailwind-compile.test.tsx` compares its story list to the same keys | `muted: "border-border-strong text-brand"` -> FOUR, naming it twice: `expected [ 'default', 'destructive', …(4) ] to deeply equal [ …(3) ]` and `tone inks outside the 4.5:1 ink-on-ground matrix: expected [ [ 'muted', 'brand' ] ] to deeply equal []` |
| **MED-1** the width/margin arm read 2 of ~8 property spellings | the arm loops an 18-name `LAYOUT` list (every `margin-*`, `margin-inline*`, `margin-block*`, `width`, `min-width`, `max-width`, the logical pair) with the property in each assertion's message, plus a positive read of `padding` as the instrument's own anchor | `mx-auto` -> `margin-inline: expected [ 'auto' ] to deeply equal []`; `mb-4` -> `margin-bottom: …`; `w-96` -> `width: …` |
| **MED-2** the compiled-declaration tone table tolerated zero rows | closed by the same derivation as HIGH-2: the anchor `it` now compares the table's story names to `Object.keys(ALERT_TONES)` | the first row commented out -> `expected [ 'destructive', 'success', …(2) ] to deeply equal [ 'default', 'destructive', …(3) ]` |
| **MED-3** deleting `flex flex-col gap-2` was green everywhere | a new test, `is the flex column both docblocks say it is`, reads `display`, `flex-direction` and `gap` in resolved declarations - the column is the REASON there is no `AlertAction` part and the owner of the gutter, so it is a behaviour and not decoration | the base's `flex flex-col gap-2` removed -> `expected [] to deeply equal [ 'flex' ]` |
| **MED-4** `NotALiveRegion` drew a notice wrapping two notices | `render:` instead of `args.children`, so `meta.component` no longer wraps it; the play asserts three boxes, which is what the docblock now says | covered by HIGH-1's two above |
| **LOW-1** `WithAction`'s post-click assertion held with the click deleted | the story is a `render:` over a module `fn()` the play clears and then asserts was called once - a click that does not happen is now a red | the `userEvent.click` line deleted -> `expected "spy" to be called 1 times, but got 0 times` |
| **LOW-2** "ships exactly the five tones" did not | renamed to `lets a tone move colour and nothing else, and no two tones are the same`, which is what it asserts; the axis size moved to the anchor, where HIGH-2's derivation makes it real | the same `muted` row above reddens the anchor by name |
| **LOW-3** no as-built section | written before the review landed and committed at `fb72878`; the reviewer read `9dae9e8`, which predates it |
| **LOW-4** the width departure and the unspellable line/ink pair were silent | both are now in the PART's docblock, under "two departures a call site pays for", where a consumer reading the copied file sees them - the checklist below had them, the shipped file did not | not a code change |

<!-- prettier-ignore-end -->

The reviewer's own clean list is worth carrying forward: the hoist was verified
byte-identical, the intersection derivation degenerates only UPWARD (which is what
HIGH-2 was), `BODY_INK_ROLES` really is the contrast matrix's ink axis and both
presets carry `contrastExceptions: []`, and the `WithAction` story really does
reach the package's 44px floor guard (`button[data-slot=-] "Keep my account" -> 0px`
when its `Button` is swapped for a bare one).

One thing it recorded that is NOT closed and should not be: `Alert` stays out of
`fidelity.test.tsx`'s `NEW_PARTS` rail. It is a NEW family, the fixture does not
bind, and every property the rail would pin is read from the compiled stylesheet
instead - including, now, the flex column that was the one gap.

### The gate

One run, at `8f5dbcf`, detached with a sentinel in `$BATCH_SCRATCH/s2/`:
`pnpm verify` **exit 0** in 22s (07:56:30 -> 07:56:52 IST, 2026-09-19), the runner's
own lines being `All matched files use Prettier code style!`, both packages'
`typecheck: Done`, `✔ Building registry.`,
`└  Storybook build completed successfully` and
`Test Files 21 passed (21)` / `Tests 365 passed (365)` (from 20 / 344 at the base).
`git status --short` was empty afterwards, so the committed `packages/ui/r` is what
`build:registry` produces. One further commit followed the gate - `ALERT_TONES`
added to `packages/ui/src/index.ts`, found by the third consumer scan - and
`pnpm lint`, `pnpm typecheck` and `pnpm test` (21 / 365) were re-run green on it.
No push, no publish, no version bump: the freeze holds and this family rides the
post-freeze `0.1.1` with the Switch and the two navigation families.

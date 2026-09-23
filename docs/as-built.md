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
- **`settings/DangerZone.tsx:90`**: `<Alert tone="destructive" className="max-w-content gap-3 p-4">` holding
  `<AlertDescription role="status" className="text-foreground">` and the existing
  `<Button>`. Four classes are the caller's here and each has a reason: the width
  (decision 6), the `gap-3` (the part's gap is 2, so a stacking notice that wants
  the old 12px says so), the `p-4` (the part's base is `p-3`, six of the eight
  derived notices; these two panels are the `p-4` pair measurement 4 counted, and
  the first draft of this list dropped it, so both would have shrunk 4px a side:
  DL9 layer 2, HIGH-1), and the `text-foreground` (the tone's ink is destructive,
  this paragraph is `text-text` today). ⚠️ `role="status"` stays on the inner
  paragraph, where it is today, not on the box.
- **`settings/DangerZone.tsx:113`**: `<Alert className="max-w-content gap-3 p-4 border-border-strong">`
  (the `p-4` for the reason the bullet above gives). ⚠️ `e2e/mobile-390.spec.ts:1852-1854`
  resolves THIS panel by `section` → `div.rounded-md` and measures its right edge;
  it survives because `Alert` without `asChild` renders a `div` carrying `rounded-md`,
  and it would resolve `null` under `asChild` (the helper's `box(null)` is `NaN` and
  the arm then drops silently, its own comment says), so `asChild` stays off here
  (DL9 layer 2, LOW-3).
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
  `steam-library-private`, `steam-cooldown`, `volatility-banner` - four keep
  their id on the `<Alert>` itself, which spreads props, and `steam-playtime-hidden`
  STAYS on the wrapper `div` at `steam/page.tsx:281` that holds the notice AND the
  import form beside it: `e2e/steam-import.spec.ts:267` resolves the whole screen
  through that id, and moving it onto the notice would re-scope the locator to one
  paragraph (DL9 layer 2, MED-2).
  Swept mechanically rather than by eye: exactly **three** elements in
  `apps/web/src/**/*.tsx` carry a `role` within four lines of a `className`
  containing `border-2` - `login/page.tsx:53`, `settings/steam/page.tsx:66` and
  `DangerZone.tsx:91`, the inner paragraph one line under the `:90` box, which the
  first count missed (DL9 layer 2 re-ran the sweep, LOW-2) - all `status`,
  **zero `alert`**.
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

## DESIGN-LIB-d: Form (2026-09-19)

Scope: the fourth §3-d addition, and the THIRD NEW family (the Switch's and
`Alert`'s shape): nothing was lifted, so the fidelity fixture does not bind and
the drawing is DERIVED and recorded below. Nothing was published, nothing was
pushed (the Actions-minutes freeze), no version was bumped, and nothing in the
consuming repo was changed: it was read only, at commit `e66bc793`.

The family is the WIRING, not a look. Its four classes are trivial; the reason it
exists is three attributes the consuming product almost never writes.

### What shipped

| file                                         | what                                                                                                                                                                  |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/ui/src/form.tsx`                   | five parts - `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage` - one `useId`, no `cva` (16,782 B after layer 1)                                |
| `packages/ui/stories/form.stories.tsx`       | 8 stories, all 8 carrying a `play`                                                                                                                                    |
| `packages/ui/test/form-wiring.test.tsx`      | 25 tests: the claims that exist across renders or across the contract, which a one-field story cannot state                                                           |
| `packages/ui/test/tailwind-compile.test.tsx` | 6 new tests in resolved declarations, appended; the hoisted helpers were reused, not copied                                                                           |
| `registry.json` + `packages/ui/r/form.json`  | the `form` item, `target` `components/ui/form.tsx`, and the registry's FIRST cross-item dependency (`@marquee/label`)                                                 |
| `packages/ui/src/index.ts`                   | the five parts and `FormItemProps`                                                                                                                                    |
| the declared lists                           | both lists in `packages/tokens/test/helpers/source-files.ts`, `story-suites.ts`, `stories.test.tsx`'s two counts, `registry.test.ts`'s item list and its two counters |
| the stated count                             | `AGENTS.md`, `README.md`, `packages/ui/package.json` and `fidelity.test.tsx`'s docblock say fifteen part families                                                     |

No new dependency: `@radix-ui/react-slot` was already here and `@radix-ui/react-label`
arrives through the `label` item the new one now depends on. `pnpm test` goes from
**21 files / 365 tests** at the base (`8c9d31a`, `pnpm verify` exit 0, measured
first) to **22 / 405**, which is +40, all measured by running each file alone:
**+25** in the new `form-wiring.test.tsx` (its four `it.each` blocks expand),
**+9** in `stories.test.tsx` (8 story renders plus the suite's own
`form: has stories`) and **+6** in `tailwind-compile.test.tsx`'s new describe
block. It was 392 before layer 1; the thirteen tests added in response to the
findings are the difference.

The shape, in one line each:

```tsx
// the 29-of-30 case: a label, a control, and a message that is not there yet
<FormItem invalid={!!error}>
  <FormLabel>Email</FormLabel>
  <FormControl><Input type="email" autoComplete="email" /></FormControl>
  <FormMessage>{error}</FormMessage>
</FormItem>

// a standing hint, wired only because it was composed
<FormItem>
  <FormLabel tone="micro">Add a comment</FormLabel>
  <FormControl><textarea className="min-h-hit …" /></FormControl>
  <FormDescription>Markdown is not supported.</FormDescription>
</FormItem>

// a second description the caller owns goes on FormControl, never on the child
<FormControl aria-describedby="shared-note"><Input /></FormControl>
```

### Measurements, and what they corrected

All read with `git show` at the thepile base `e66bc793`; every command is quoted
so a later stream can re-run it rather than trust the number.

**1. The gap this family closes, in three numbers.** The product announces its
errors and associates almost none of them.

| what                                                         | command                                                                                                                                                                  | count                 |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| field messages, `p[role="alert"]` carrying `text-danger`     | `git grep -n 'role="alert"' $T -- 'apps/web/src/**/*.tsx' \| command grep -v '\.test\.' \| command grep -c text-danger`                                                  | **30**                |
| …of those, carrying an `id` at all                           | the same, then `command grep -c ' id='`                                                                                                                                  | **1**                 |
| `aria-describedby` / `aria-invalid` lines, non-test          | `git grep -n -E 'aria-describedby\|aria-invalid' $T -- 'apps/web/src/**/*.tsx' \| command grep -v '\.test\.'`                                                            | **15**                |
| …of those, real field wiring rather than a Radix suppression | read, not counted: 9 are `<SheetContent aria-describedby={undefined}>` and 2 pass a `describedBy` prop through (layer 2 LOW-1, batch DL10: the first count said 8, so 5) | **4**, across 3 sites |
| `htmlFor=` ATTRIBUTES, non-test                              | `git grep -h -o -E 'htmlFor=[{"]' $T -- 'apps/web/src/**/*.tsx' \| command wc -l`                                                                                        | **14**                |
| …of those, a hand-typed string LITERAL                       | `git grep -h -o -E 'htmlFor="[^"]+"' $T -- …`; the other 3 are `SLIDER_ID`, `TagInput`'s `id`, `ReportSheet`'s `id`                                                      | **11**                |
| `aria-invalid` anywhere in the product                       | one line, `app/pile/page.tsx:115`                                                                                                                                        | **1**                 |

⚠️ The first draft of this table said **15** `htmlFor` and **12** literals, from
`git grep -n 'htmlFor' … | grep -v '\.test\.'` - which counts LINES, and the
fifteenth is a COMMENT at `ImportPreview.tsx:314` mentioning `<label htmlFor>`.
Layer 1 could not reproduce 15 and was right; the rows above grep the ATTRIBUTE
rather than the word. The two entries in this table that are CLASSIFICATIONS
rather than greps - "field message" and, in measurement 2, "field wrapper" - are
marked as such, because a classification cannot carry a command: the reproducible
raw numbers beside them are 37 non-test `role="alert"` occurrences and, tree-wide,
75 bare `gap-1` against 39 `gap-1.5`.

So the single field in the whole product with a complete association is
`pile/page.tsx:98-127`, and it is hand-written: `id="pile-input"`,
`aria-describedby={problem ? "pile-problem" : "pile-hint"}`,
`aria-invalid={problem ? true : undefined}`. Every other field either wraps its
control in the `<label>` (which buys the name and nothing else) or points a
hand-typed `htmlFor` at a hand-typed `id`. The other 29 messages are announced
and are not reachable from the control that produced them.

**2. The drawing, derived from twelve field wrappers.**
`git grep -h -o -E '<label className="[^"]*"' $T -- 'apps/web/src/**/*.tsx' | sort | uniq -c`:

| wrapper                                                                                   | count |
| ----------------------------------------------------------------------------------------- | ----- |
| `<label className="flex flex-col gap-1.5">`                                               | 6     |
| `<label className="flex flex-col gap-1 text-sm text-text-secondary">`                     | 5     |
| `<label className="flex flex-col gap-1 text-xs text-text-muted">`                         | 1     |
| (the five `flex min-h-hit items-center justify-between` rows are switch rows, not fields) | 5+1   |

A 6/6 tie between `gap-1.5` and `gap-1`, so it is not broken by majority. It is
broken by the SKELETON: 6px is off the house's 4px spacing grid, which
`AGENTS.md` names as a thing no preset may move, and the package's whole existing
gap vocabulary is `gap-1` / `gap-2` / `gap-3` (`command grep -rn -oE 'gap-[0-9.]+'
packages/ui/src` -> 2 / 4 / 7, no other value). `CardHeader`'s `gap-1` is the
precedent for a label-and-prose pair. A NEW family is not held to the fidelity
rule (the Switch's decision 8), so this is a 2px decision on six call sites and
not a regression; a caller that wants the old gutter writes `gap-1.5`.

`text-sm` sits on the ITEM, which is what 5 of the 12 wrappers already do
(`text-sm` on the label element itself), and the parts carry only their INK -
`Alert`'s arrangement with the two axes swapped. The message is `text-sm` at 21
of its 30 sites and `text-xs` at 9, so the majority is on the item and the nine
pay a `className`.

**3. `text-muted` and `text-destructive` are both already measured.** Both are in
`BODY_INK_ROLES`, so both are inside the presets' 4.5:1 ink-on-ground check on
every ground in both presets. `form-wiring.test.tsx` holds the family to that by
importing the list rather than retyping it, with `primary` and `brand` as the
negative anchors - the point `Alert`'s tone suite makes, applied to a family with
no `cva` to read a table out of.

**4. THE MEASUREMENT THAT DECIDED THE CONTRACT: a dangling `aria-describedby` is
an axe finding at CRITICAL impact.** shadcn's `form.tsx` names the description id
unconditionally and the message id when invalid. Run here against axe-core 4.12.1
(`$BATCH_SCRATCH/s2/axe-describedby-probe.mjs`, jsdom, three DOMs):

| the control's `aria-describedby`        | axe violations | axe incomplete                         |
| --------------------------------------- | -------------- | -------------------------------------- |
| names one id, which resolves            | none           | none                                   |
| names one id, which resolves to nothing | none           | **`aria-valid-attr-value` (critical)** |
| names two, one resolving and one not    | none           | none                                   |

So the bad case is precisely "a field with no description, while it is valid" -
which is 29 of the product's 30 fields, almost all of the time - and the bad case
disappears the moment ONE named id resolves. That is why this family names an id
only when the element carrying it is rendered, and why `FormMessage` renders on
`invalid` rather than on having children: the attribute and the element cannot
then disagree in either direction.

⚠️ Read the row above for exactly what it says. axe reports it as INCOMPLETE
("needs review"), not as a violation, so a gate that asserts only on `violations`
would not go red on it. The impact it carries is `critical` and the DOM is wrong
either way; the claim here is not that any gate catches it today.

**5. The message's role is decided the OPPOSITE way from `Alert`'s, and the
evidence is one-sided.** All 30 of the product's field messages write
`role="alert"`; none writes `role="status"` or nothing. Its own testing doctrine
names the case in `docs/03-testing.md`: "A live region (`role="alert"` for errors,
`aria-live` for quiet updates) wraps anything that changes after a user action
without moving focus - form errors, …". And the argument that kept the role OFF
`Alert` - that six of its eight boxed notices are on the page from the start, so a
default role would make live regions out of hints - cannot reach this part, which
renders nothing at all until the field is invalid. 22 component test files and 2
e2e specs resolve one of those messages by `getByRole("alert")`
(`git grep -l -E 'ByRole\("alert"' $T -- 'apps/web/src/**' 'e2e/**'` -> **24
files**), so a part that dropped the role would redden 24 files at the
consumption for nothing.

**The ambiguity the brief asked about, answered in a render.** A screen holding an
`Alert` AND a `FormMessage`: `getByRole("alert")` resolves the FORM MESSAGE and
only it. `Alert` writes no role (DL9 decision 1) and no boxed notice in the
product passes `role="alert"` - re-swept at this base, three elements carry a role
within four lines of a `border-2` className (`login/page.tsx:53`,
`settings/steam/page.tsx:66`, `DangerZone.tsx:91`) and all three are `status`.
The two parts therefore fit together rather than competing, and the
`BesideANotice` story pins it with both on screen at once.

**6. A live region inserted with its text is unreliably announced - and that rule
does NOT reach this part.** The product records it twice, in comments citing
A11Y-2 and WCAG 4.1.3 (`ProfileEditForm.tsx:112-121`, `FacePicker.tsx:400-402`):
"ALWAYS RENDERED and empty until there is something to say, because a live region
inserted together with its text is unreliably announced." It was tempting to make
`FormMessage` always-rendered on that authority and call it a fix for 30 sites.
It is not one: both of the product's always-rendered regions are `role="status"`,
i.e. POLITE, which is where the pre-existing-region rule bites. `role="alert"` is
specified as an assertive live region and its insertion is what AT act on, so the
30 conditional messages are not defective and always-rendering them would buy
nothing and cost a 4px gap under every field in the product. Recorded because the
first draft of this record claimed the fix.

### The Table measurement, and the answer

**No `Table` family ships.** The audit's six rows do not resolve to tabular data,
and three of them are already the right element.

The product has no table semantics at all. At `e66bc793`,
`git grep -n -E '<table|<thead|<tbody|<th |role="table"|role="grid"|role="row"|role="cell"|role="columnheader"' $T -- 'apps/web/src/**/*.tsx'`
prints **nothing**. Row by row:

| audit row                                                    | what it actually is                                                                                                                                                                                                 | wants `<table>`?                                                                                                                                                      |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transparency/page.tsx:228-270`                              | `TunableTable` is a `<div>` of `TunableRow`s; each row is a live value, a label, the engine's key and a hand-written PROSE sentence with an optional caveat, and it is `flex-col` under 640 and `sm:flex-row` above | No. One entity per row, prose in the second column, and a layout that COLLAPSES to a stack - which a table cannot do. It is named `Table` and is a list of paragraphs |
| `game/[slug]/page.tsx:757`                                   | already a `<dl>` with `<dt>`/`<dd>` in a 2-column grid                                                                                                                                                              | No. Already correct                                                                                                                                                   |
| `admin/reports/page.tsx:85`                                  | already a `<dl>` with `<dt>`/`<dd>`                                                                                                                                                                                 | No. Already correct                                                                                                                                                   |
| `members/**`'s cells (`MemberRow.tsx`)                       | already a `<dl>`, and its own docblock calls the counts "DATA CELLS"; it is deliberately STATIC so the card's stretched-link overlay keeps the tap                                                                  | No. Already correct, and a grid role would change hit-testing                                                                                                         |
| `developers/page.tsx:116-121`                                | a `<ul>` of `<li>`, each a `<code>` path and a prose summary                                                                                                                                                        | No. A list whose second column is prose about the first                                                                                                               |
| `settings/**`'s token list (`DeveloperSettings.tsx:200-224`) | a `<ul>` of `<li>` rows, each carrying a real `<button>` (Revoke)                                                                                                                                                   | No. Interactive rows, not cells                                                                                                                                       |

So the six rows resolve to **a `dl`-shaped family or to nothing**, and three of
them are already drawing `<dl>` by hand, and the tree holds **13 `<dl>`
openings across 8 non-test files** (`git grep -h -o '<dl' $T -- 'apps/web/src/**/*.tsx' | command wc -l`;
`-l` then `command grep -vc '\.test\.'` for the files). A `DescriptionList` / data-cell family is therefore a real candidate for a
later slice - the game page's Details treatment is quoted by `MemberRow` in its
own comment, so the pattern is already being copied - but it is NOT a `Table`, it
is not what the audit rows asked for, and it is not this slice's. Nothing ships.

### Guards, each proved by running its reddening mutation

**37 mutation runs** in all - 30 numbered guard mutations, which is the table
below with three of its rows carrying three runs each, plus 7 re-runs that
verified the layer-1 fixes (`L1a`-`L1g`, the reviewer's own collapses turned
back on the fixed tests plus the play-counter claim). Run against the COMMITTED
tree (`143331dc`, the four that postdate the fix at `75c254d9`, one at
`02bb0815` and six at `de2acaa`), each one asserted to have LANDED before the run
was read (new text present and, where it is a replacement, the old text gone, or
the runner throws), each reverted with `git checkout --` with `git status --short`
asserted empty afterwards, per mutation. Runner `$BATCH_SCRATCH/s2/mutate.py`,
inputs `mutations-{a,b,c}.json`, logs in `$BATCH_SCRATCH/s2/mutations/`.

⚠️ **THE FIRST PASS OF ALL THIRTEEN SOURCE MUTATIONS PROVED NOTHING, AND LOOKED
LIKE IT HAD.** The runner called `pnpm exec vitest run --reporter=basic`; this
vitest cannot load that reporter, so every run died at startup with exit 1 and
zero tests collected, and the runner reported thirteen guards as reddened. A
failure that proves nothing is indistinguishable from one that proves something.
The runner now asserts the output contains `Test Files` - i.e. that a run
happened at all - before it will count a red, and every row below is from the
re-run.

⚠️ Read one thing into every SOURCE row: **it also reddens `carries the CURRENT
bytes of every source it ships`**, because `packages/ui/r` was not rebuilt. That
is the registry guard doing its job; it is omitted from the table, which lists the
reds that NAME the mutated property.

<!-- prettier-ignore-start -->

| guard | mutation | landed | the red it produced |
| --- | --- | --- | --- |
| an id is named only when its element rendered | describedBy names `descriptionId` unconditionally | `form.tsx` | `form/Default` and `form/Invalid`, both with `aria-describedby names "…-description", which resolves to nothing`, plus the play counter |
| the control is marked invalid | `aria-invalid` line deleted | `form.tsx` | `form/Invalid`, `form/DescribedAndInvalid` and `names the message only on the field that is invalid` |
| the label reaches the control | `htmlFor` dropped from `FormLabel` | `form.tsx` | EIGHTEEN, incl. all six field stories on `getByLabelText` and `gives every item its own id…` |
| the message is a live region | `role="alert"` dropped | `form.tsx` | `form/Invalid`, `form/BesideANotice` and `names the message only on the field that is invalid` |
| the message renders iff invalid | `if (!field.invalid) return null` deleted | `form.tsx` | `form/ValidWithMessageComposed` and `names the message only on the field that is invalid` |
| the item's gutter is the 4px grid | `gap-1` -> `gap-2` | `form.tsx` | `is the 4px-grid column the docblock says it is`, `expected [ 8 ] to deeply equal [ 4 ]` |
| the item owns the type size | `text-sm` dropped from the item | `form.tsx` | `owns the type size, and the control overrides it with the 16px floor` |
| the description's ink is a measured role | `text-muted` -> `text-foreground-2` | `form.tsx` | TWO: `paints the description and the message in exactly those two` and `resolves the description's and the message's ink to the role's own variable` |
| the field decides no width | `max-w-content` added to the item | `form.tsx` | `decides no width, no outer margin and no tap floor` (the arm is now `declares exactly the properties the stack needs, and nothing else` - layer 1, MED-3) |
| two fields cannot collide | `useId()` replaced by the constant `"field"` | `form.tsx` | `gives every item its own id, and every part of an item the same one` |
| a part outside its item fails loudly | the throw replaced by an empty field object | `form.tsx` | FOUR, one per part: `FormLabel/FormControl/FormDescription/FormMessage throws when it is not inside a FormItem` |
| the wiring outranks the caller's props | `{...props}` moved after the wiring, caller's describedby restored | `form.tsx` | SIXTEEN, every field story |
| the control slot carries no drawing | `className="rounded-md border-2"` added to the `Slot` | `form.tsx` | `puts no drawing at all on the control slot` — ⚠️ see below, this row is the FIX, not the first run |
| a child cannot take the id | `"id"` removed from the refused list | `form.tsx` | `refuses a child that sets its own id, rather than losing the wiring to it` |
| a child cannot take the describedby | `"aria-describedby"` removed from the refused list | `form.tsx` | `refuses a child that sets its own aria-describedby…` |
| a child cannot take the invalid flag | `"aria-invalid"` removed from the refused list | `form.tsx` | `refuses a child that sets its own aria-invalid…` |
| a caller's own describedby is kept | the merge replaced by `field.describedBy` | `form.tsx` | `keeps the caller's id in front of the family's, and both still resolve` |
| a part cannot leave the shared suites map | `form` deleted from `STORY_SUITES` | `story-suites.ts` | SIXTEEN: `covers all fifteen part families` plus all six declaration arms, which stop finding anything to measure |
| a source cannot leave the declared walk | `packages/ui/src/form.tsx` deleted from `PUBLISHED_SOURCE_FILES` | `source-files.ts` | THREE whole FILES (`brand-guard`, `literal-guard`, `source-coverage`), all naming `walks exactly the published set, by path` |
| a story cannot stop being one | `export const Disabled` -> `const Disabled` | `form.stories.tsx` | `covers all fifteen part families…` and the play counter |
| a control inside a field still owes the floor | the textarea story's `min-h-hit` deleted | `form.stories.tsx` | the package's own floor guard, `measures every one of them at or above the floor` |
| the item declares its registry dependency | `@marquee/label` dropped from the item | `registry.json` | THREE: `resolves every registry dependency inside this registry`, `carries the title, description and both dependency lists…`, `ships an INDEX that is the root registry, byte for byte` |
| the registry's item list is exact | `"form"` deleted from `registry.test.ts`'s list | `registry.test.ts` | `declares the fifteen part families plus the one shared lib` |
| a wrapped part is still the field's part | the walk put back to one level | `form.tsx` | `finds a description and a message inside a fragment` and `finds them inside a plain element wrapper` |
| a part is not descended INTO | the walk recurses through parts as well | `form.tsx` | the same two |
| one of each part | `count > 1` -> `count > 99` | `form.tsx` | FOUR: `refuses a second <FormLabel/FormControl/FormDescription/FormMessage>` |
| exactly one control | `counts.control !== 1` -> `> 99` | `form.tsx` | `refuses an item with no control at all, whose label points at nothing` |
| the label cannot be `asChild` | the refusal made unreachable | `form.tsx` | `refuses <FormLabel asChild>, which would put ``for`` on something that is not a label` |
| the part's own owned props are refused | the refused list emptied | `form.tsx` | TWO: `refuses id / aria-invalid on FormControl itself` |
| the item's whitelist is exact | `px-3`, `max-h-40`, `border-t-2` each added to the item | `form.tsx` | `declares exactly the properties the stack needs, and nothing else`, three separate runs - the four properties the old blacklist let through |
| the play counters catch an UNATTACHED play | the `typeof Story.play` read renamed to `runPlay` | `stories.test.tsx` | `runs all 48 play functions, and knows if one stopped running` - the half of that docblock's claim that IS true |

<!-- prettier-ignore-end -->

**One guard could not fail, and the mutation is what found it.** `puts no drawing
at all on the control slot` was written as
`expect(slotTokens(…, '[data-slot="form-control"]')).toEqual(slotTokens(…, "input"))`.
`Slot` MERGES its className into the child's and its `data-slot` REPLACES the
child's, so both selectors resolve the SAME element and the assertion compared a
class list to itself. It stayed green with `rounded-md border-2` added to the
slot. It now compares against `Input`'s own exported `inputClass`, and the re-run
is the row above.

**And chasing that one turned up a real defect in the part.** Writing the
caller-merge test with `aria-describedby` on the CHILD rather than on
`<FormControl>` produced `expected [ 'shared-note' ] to have a length of 2 but got
1`: Radix `Slot` gives the child's props precedence, so a child's own
`aria-describedby` does not merge, it REPLACES - and a child's own `id` would
replace the generated one and leave the label's `for` pointing at an element that
does not exist. A broken label, invisible on screen, in the one part whose whole
job is that association. `FormControl` now throws on all THREE attributes it writes,
naming `FormControl` as where they belong, and the three refusals are rows in
the table. Fixed at `75c254d9`; `aria-invalid` was added to the list at
`02bb0815` on the weaker argument, stated in the test: it cannot dangle, but it
can announce a control invalid inside a field that renders no message and
describes nothing, and one rule is easier to keep than two thirds of one.

### The pipeline, end to end

`pnpm pack` in both packages (`prepack` is `pnpm -w build:registry && git diff
--exit-code -- r`, so packing at all is the evidence that `r/` is committed and
current) -> `marquee-ui-ui-0.1.0.tgz` **51,909 B** (38,315 at `Alert`, 34,383 at
the nav families, 26,396 at the Switch) and `marquee-ui-tokens-0.1.0.tgz` 99,608 B
-> `npm install` of both into a bare project (`package.json`, a `tsconfig.json`,
and a `components.json` whose `registries` map points at
`./node_modules/@marquee-ui/ui/r/{name}.json`) ->
`shadcn add ./node_modules/@marquee-ui/ui/r/form.json`:

```
✔ Created 3 files:
  - src/lib/utils.ts
  - src/components/ui/label.tsx
  - src/components/ui/form.tsx
```

**Three files, not two, and that is the thing this run existed to prove.** This is
the registry's first CROSS-ITEM dependency: `form` declares `@marquee/label` and
the CLI resolved it through the same `registries` map and installed `label.tsx`
beside it. The bytes:

Re-run at the final head, AFTER the layer-1 fixes, so these are the bytes that
ship rather than the bytes that were reviewed:

```
form:  installed bytes 16782, target components/ui/form.tsx
  installed === r/form.json content === packages/ui/src/form.tsx: True
                                                    sha256 fd1e611a6e04 (all three)
label: installed bytes 1539, target components/ui/label.tsx
  installed === r/label.json content === packages/ui/src/label.tsx: True
                                                    sha256 75fed6913ca9 (all three)
packed r/registry.json === repo registry.json: True  (16 items)
npm deps the two items asked for, and that landed:
  @radix-ui/react-label@^2.1.15, @radix-ui/react-slot@^1.3.3,
  class-variance-authority@^0.7.1, clsx@^2.1.1, tailwind-merge@^3.7.0
```

⚠️ **The cross-part import is RELATIVE on purpose, and this run is why.** The
installed copy carries `import { Label } from "./label";` unchanged, and `./label`
resolves to the file the CLI put beside it. The house spelling `@/label` would
have shipped verbatim into the consumer, where `@/` is the app's own `src` and
nothing resolves it: `shadcn` rewrites `@/lib/utils` because `components.json`
names that alias, and it has no reason to touch any other `@/` path. Relative is
the one spelling correct in BOTH trees, and `moduleResolution: "Bundler"` in this
repo and in a Next app both take it extensionless.

Then the installed copy compiled in the bare project's own Tailwind 4 against the
published `@marquee-ui/tokens/tokens.css`, `@source "./components"` so the only
candidates are the two installed files:

```
gap-1             gap: var(--spacing)
text-sm           font-size: var(--text-sm); line-height: …
text-muted        color: var(--muted)
text-destructive  color: var(--destructive)
flex-col          flex-direction: column
```

Both inks resolve to the ROLE variable in the consumer, not to a copy. Three
utilities are deliberately ABSENT there - `min-h-hit`, `border-2`, `rounded-md` -
because they are `Input`'s and `Input` was not installed, which is the negative
control alongside the invented `text-not-a-role`.

### Decisions

1. **The family is the WIRING; the drawing is incidental.** [V] Measurement 1: the
   product announces 30 errors and associates one. So the parts exist to carry
   `htmlFor`, `id`, `aria-describedby` and `aria-invalid`, and every test here
   resolves an id back to the element carrying it rather than asserting the
   attribute is present.
2. **`aria-describedby` names ONLY the ids whose elements rendered.** [V] The one
   real departure from shadcn's contract, and measurement 4 is the reason rather
   than taste: upstream's unconditional description id leaves every valid field
   with no description carrying a reference that resolves to nothing, which axe
   reports at critical impact, and that is 29 of the product's 30 fields almost
   all of the time.
3. **Composition is detected by reading the item's own `children`, not by a second
   prop and not by an effect.** [V] An effect (Radix's own `Form` does this) does
   not run on the server, so a server-rendered error would ship its HTML with no
   wiring and acquire it at hydration - and one of the product's two forms with
   real wiring is a server component with a `method="get"` form that needs no JS
   at all. A second boolean prop has a footgun the other way: forgetting it leaves
   a description drawn and unannounced, silently. Reading `children` tracks what
   actually rendered, including `{hint && <FormDescription>…}`. Its cost is stated
   in the docblock and it is the family's one call-site rule: the parts are DIRECT
   children.
4. **`FormMessage` renders iff `invalid`, not iff it has children.** [V] It is
   what makes decision 2 safe in both directions: whenever `aria-describedby`
   names the message id, the element is in the document, and whenever it does not,
   there is nothing on screen to point at. The caller drives the prop and the
   text from one `error`.
5. **`FormMessage` writes `role="alert"`; `Alert` writes no role.** [V]
   Measurement 5: 30 of 30, the product's own testing doctrine names form errors
   as the case, and the argument that kept the role off `Alert` (a default role
   would make live regions out of hints) cannot reach a part that renders nothing
   until the field is invalid. It is a DEFAULT, not a lock - written before the
   caller's props, so a genuinely polite message can say `role="status"`.
6. **`FormControl` is a pure `Slot`, and it REFUSES a child carrying any of the
   three attributes it writes.** [V] Taken after the mutation pass, not designed
   in.
   `Slot` gives the child precedence, so those two spellings replace the wiring
   instead of merging with it, and the `id` case is a label pointing at nothing
   with no symptom on screen. Both belong on `FormControl`, where the describedby
   merges in front of the family's ids, and the error message says so. This is
   the Switch's decision 9 in a different costume: the part's central promise has
   to be a property of the PART.
7. **No `Form` root and no `FormField`.** [V] The consuming product's forms are
   plain `<form>`s with server actions, and the context this family needs is
   per-FIELD. A `<form>` with a class would be a part that only re-declares a
   class, which is the `AlertAction` that was not written (rule 1).
8. **No `cva`.** [V] There is no visual axis with a second value: one size, one
   ink per part. The Switch's decision 5 and `Input`/`Card`'s precedent. It is
   also why the ink check here reads the rendered class list instead of a tone
   table - there is no table to import.
9. **`FormLabel` composes `Label`, which makes this the registry's first
   cross-item dependency.** [V] The brief's instruction and shadcn's own shape.
   The alternative is re-drawing `Label`'s string in a second place, which is
   exactly what the library exists to stop. The import is RELATIVE (`./label`),
   which the pipeline section proves is the only spelling correct in both trees.
10. **The item's gutter is `gap-1`, not the product's `gap-1.5`.** [V]
    Measurement 2: a 6/6 tie broken by the 4px spacing grid, which is skeleton,
    and by the package having no off-grid gap anywhere. Six call sites move 2px.
11. **A part used outside a `FormItem` throws.** [V] The quiet version is a label
    with no `for` and a control with no ARIA - which is the state this family was
    written to replace, and it looks entirely normal on screen.
12. **The stated part count was updated where the package DESCRIBES itself**
    (`AGENTS.md`, `README.md`, `packages/ui/package.json`) and in
    `fidelity.test.tsx`'s docblock, whose "Eight of the fifteen" is a live ratio.
    `fidelity.test.tsx`'s `NEW_PARTS` table is NOT touched: a new family is not
    fidelity-asserted, which is `Alert`'s closure and stands here too.

### thepile inputs

What the consumption half needs when `0.1.1` publishes, in one list. Nothing here
was done: the consuming repo was read only, at `e66bc793`, and **every bullet was
checked against that tree with `git show` before it was written**, with the
command beside any count.

- `form` goes into `CONSUMED` in `scripts/marquee-drift.test.ts`, and
  `components/ui/form.tsx` arrives by `shadcn add`. ⚠️ **That test pins BOTH
  lists exactly**, read at `e66bc793`: `CONSUMED` is
  `["button", "input", "label", "sheet", "toast", "ribbon"]` and the arm right
  under it asserts the complement is exactly
  `["accordion", "badge", "card", "separator", "utils"]`, with `toEqual` and not
  a subset matcher. So five new items in the shipped index redden that arm the
  moment `0.1.1` lands, whether or not anyone consumes them - the bump and both
  list edits are ONE commit, or the arm is red between them. ⚠️ **And this is now a FIVE-item bump**:
  `switch`, `breadcrumb`, `pagination`, `alert` and `form`. Whoever takes the bump
  edits both lists once, for all five. ⚠️ `shadcn add form.json` writes **three**
  files, not two: `lib/utils.ts`, `label.tsx` AND `form.tsx`, because `form`
  depends on the `label` item. **⚠️ CORRECTED (batch DL14, s1 ran it): it writes TWO and
  SKIPS `label.tsx`** (`Skipped 1 file: (files might be identical …) - src/components/ui/label.tsx`);
  the CLI compares the consumed copy's bytes itself, so there is one file fewer to revert. thepile's `lib/utils.ts` is a DECLARED EXCLUSION
  whose `cn` is a plain join on purpose, so `git checkout -- apps/web/src/lib/utils.ts`
  after the add - and `components/ui/label.tsx` is ALREADY CONSUMED, so the add
  will rewrite it with the identical registry bytes and that is a no-op only if
  the consumed copy is current.
- ⚠️ **`form-styles.test.ts` is the instrument to keep green, and this family does
  not touch it.** Read at the base: it pins `inputClass`, `primaryButtonClass`,
  `secondaryButtonClass`, `dangerButtonClass(true|false)` and `microLabelClass` to
  be EXACTLY what the registry copies produce (`inputClass` from
  `components/ui/input`, the rest from `buttonVariants` / `labelVariants`), plus
  the rename table resolving to the same literals, plus `form-styles.ts` having no
  imports at all. A `Form` family survives it untouched **because `FormLabel`
  composes `Label` and `FormControl` adds no class**: neither `labelVariants` nor
  `inputClass` changes, so all six pinned strings are byte-identical. The one
  thing that would break it is a consumption that re-draws a label or a field
  inside the new parts instead of passing `<Input>` / `<Label>` through.
  ⚠️ **The brief's note that `git grep -l 'form-styles' -- apps/web/src scripts`
  prints FOUR files is WRONG.** Re-run at `e66bc793` it prints **42**
  (`git grep -l 'form-styles' $T -- apps/web/src scripts | command wc -l`); on the
  main clone's stale working tree it prints 40. Neither is four. The number
  matters because it is how big the blast radius of a change to that module is.
- **The 30 bare messages become `<FormMessage>`**, and the wrapper `<label>`
  becomes `<FormItem>` + `<FormLabel>` + `<FormControl>`. Two things move with
  each: `role="alert"` comes from the part now and should be DELETED from the call
  site (leaving it is harmless - it is written before the caller's props - but it
  is then stated twice), and `text-sm` comes from the item, so the **nine** sites
  at `text-xs` (`PushSettings:271`, `AddGameRow:133`, `AddToListSheet:116`,
  `ListForm:118`, `ListItemsEditor:116`, `ListManage:111`, `ListProgress:277`,
  `GameActions:536`, `RankInTierSheet:125`) must pass `className="text-xs"` on the
  item or nine messages grow 2px.
- ⚠️ **The 24 files that resolve a message by role must keep resolving one.**
  `git grep -l -E 'ByRole\("alert"' $T -- 'apps/web/src/**' 'e2e/**'` -> 22
  component test files (`LoginForm`, `ContentSettings`, `DeveloperSettings`,
  `PushSettings`, `ImportPreview`, `VolatilityBanner`, `AddGameRow`,
  `AddToListSheet`, `ListForm`, `ListItemsEditor`, `ListManage`, `ListProgress`,
  `LogModal`, `DiaryEntryCard`, `PlayForm`, `AboutMeGrid`, `FacePicker`,
  `FavoritesPicker`, `ProfileEditForm`, `GameActions`, `RankInTierSheet`,
  `TierEditor`) plus `e2e/outbox.spec.ts` and `e2e/pile-card.spec.ts`. They all
  survive: the part writes the same role on the same kind of element. ⚠️ The one
  to read before touching is `VolatilityBanner.test.tsx:83-90`, which asserts
  `queryByRole("alert")` is NULL - it is a boxed notice, not a field message, and
  nothing in this family goes near it.
- **⚠️ CORRECTED (batch DL14): `app/pile/page.tsx` CANNOT be the first consumption on 0.1.1.** It is a
  Server Component and this file had no `"use client"` at 0.1.1 while importing `createContext`; the
  orchestrator composed exactly this field in a detached-worktree build and `next build` exited 1
  (the error is quoted once, under "DESIGN-LIB-d: Avatar" › "The client boundary: four parts a
  Server Component could not import"). The directive is on the library's `next` since DL14 and
  reaches thepile with LIB-VENDOR-0.1.2. **Ankit decided (2026-09-21): `/pile` stays hand-written and takes
  no Form family** (its docblock refuses client JavaScript on purpose, and its hand-written field is the one
  this family was derived from; thepile's `docs/design-audit.md` `/pile` cell records it). The first consumption was
  `/login` (`LoginForm.tsx`, a client component; `docs/slices/DESIGN-LIB-f-login-form.md`). What
  follows stands as the shape of the `/pile` consumption once 0.1.2 lands:
  **`app/pile/page.tsx:98-127` is the one field that already has the whole
  contract**, hand-written: `id`,
  `aria-describedby` switching between `pile-problem` and `pile-hint`, and
  `aria-invalid`. Taken, it becomes `<FormItem invalid={!!problem}>` with a
  `<FormDescription>` and a `<FormMessage>`, and the generated ids replace
  `"pile-input"` / `"pile-problem"` / `"pile-hint"`. ⚠️ **It is a SERVER
  component** - no `"use client"`, a `method="get"` form - which is why the
  invalid state is a prop and not an effect (decision 3). ⚠️ And its hint carries
  `max-w-prose` (DESKTOP-1's fix: without it the hint set 1216px at 1280), which
  the part does NOT supply: the description must keep it as a `className`.
- **`app/onboarding/OnboardingForm.tsx:98,103`**: its `username-hint` is an
  ALWAYS-RENDERED `<span role="status">` that is empty until the check answers,
  and it carries `min-h-[1.25rem]` to stop the form jumping. Both stay the
  caller's: `<FormDescription role="status" className="min-h-[1.25rem] text-xs">`.
  The part writes no role on a description precisely so this site keeps working
  (measurement 6).
- **`components/profile/FacePicker.tsx:373,395,405`** is the same shape twice over
  and is the one site where the two parts meet: a bare `role="alert"` message at
  `:395` AND an always-rendered `role="status"` description at `:405` that the
  button points at by `aria-describedby`. Its control is a `<button>`, not a
  field, so it is a `FormControl` host only if the consumption wants it to be -
  and `FormControl` will accept a `<button>`, it slots anything.
- ⚠️ **The family REFUSES five compositions, loudly, at render.** A consumption
  that trips one takes the route down rather than degrading, which is the point
  (the quiet version of every one is a label pointing at nothing). They are: a
  part outside a `FormItem`; a second part of any kind in one item; an item with
  no `FormControl`; `<FormLabel asChild>`; and `id` / `aria-describedby` /
  `aria-invalid` on `FormControl` or on its child. Read that list before wrapping
  a form, not after.
- ⚠️ **No call site may put `id`, `aria-describedby` or `aria-invalid` on the
  control itself.**
  `FormControl` throws (decision 6). Enumerated by the REFUSAL PREDICATE (all three
  attributes), not by `id` alone (layer 2 HIGH-1, batch DL10: the first draft listed
  three `id` sites and omitted the two sites the checklist most invites). At `e66bc793`
  the sites that would hit it if wrapped naively are: by `id`, `pile/page.tsx:103`
  (`id="pile-input"`), `comments/CommentForm.tsx:71` (`id="comment-body"`),
  `DeveloperSettings.tsx:144` (`id="token-name"`), `log/LogForm.tsx:705`
  (`<TagInput id="log-tags">`, a ninth `LogForm` id that pairs no `htmlFor`) and the
  eight `LogForm` fields at `:650-903` that pair `htmlFor` with a literal id; by
  `aria-describedby`, `onboarding/OnboardingForm.tsx:98`
  (`aria-describedby="username-hint"` on the input, the bullet above) and
  `profile/FacePicker.tsx:373` (`aria-describedby={confirming ? "face-confirm" : undefined}`
  on the button: `undefined` passes, then the FIRST tap that arms the confirm makes it
  a string and `FormControl` throws on re-render, so a wrapped button takes the route
  down in the one state it exists for). Each drops its hand-typed attribute and lets
  the item generate one; a conditional description moves onto `FormDescription`. No
  product site sets `aria-invalid` on a control today. Verify with
  `git grep -n -E 'aria-describedby=|aria-invalid=| id="' -- '<the file>'` at the base
  before wrapping any of them.
- **Two behaviours the consumption GAINS**: 29 messages become reachable from the
  field that produced them, which is the actual accessibility change; and a form
  rendered twice on one page stops being a source of duplicate ids, because
  `useId` replaces twelve hand-typed literals.
- **What it does NOT gain, and should not be sold as**: the messages are already
  announced. This does not fix "the error is not read out" - it fixes "you cannot
  get from the field to the error".

### Consumers

Both runs of the scan (`8c9d31a` in place of `origin/next`, over `packages/**`
and `registry.json`), the script in `$BATCH_SCRATCH/s2/consumer-scan.sh`. The
shell `grep` here is a ugrep wrapper, so every arm that becomes a verdict uses
`command grep` or `git grep -F`.

**Run 1, before any code** (`consumer-scan.1.txt`): the diff was empty, so scans
1-3 printed nothing; scan 4 is what the run was for - the declared lists and
counters a fifteenth family has to enter, read off the tree rather than off the
brief:

```
AGENTS.md:51 the fourteen part families · README.md:19,24 · packages/ui/package.json:4
packages/ui/test/fidelity.test.tsx:36    Eight of the fourteen part families
packages/ui/test/fidelity.test.tsx:685   expect(slots).toHaveLength(14)
packages/ui/test/registry.test.ts:60     declares the fourteen part families plus the one shared lib
packages/ui/test/registry.test.ts:146    expect(checked).toBe(14)
packages/ui/test/registry.test.ts:214    expect(compared).toBe(16)
packages/ui/test/stories.test.tsx:57     const DECLARED_PLAYS = 40
packages/ui/test/stories.test.tsx:58     const DECLARED_STORIES = 66
packages/ui/test/stories.test.tsx:91     expect(storySuiteNames()).toHaveLength(14)
```

That run found **one counter the brief did not name**:
`fidelity.test.tsx:685`'s `expect(slots).toHaveLength(14)`. It was read before
being moved, and it is deliberately NOT moved: `NEW_PARTS` is the table of slots
LIFTED out of the consuming product, a new family is not fidelity-asserted, and
`Alert` is absent from it for the same reason. The seven that did move went to
15 / 15 / 16 / 17 / 48 / 74 / 15, and each was proved load-bearing by a mutation
rather than assumed - rows 17 through 22 of the guard table.

**Run 2, at the commit point** (`consumer-scan.2.txt`): **14 exported names** -
the five parts, `FormItemProps`, and the eight story exports. Every reader of
every one of them is inside this slice's own files (`form.tsx`, `index.ts`,
`form.stories.tsx`, `form-wiring.test.tsx`, `tailwind-compile.test.tsx`,
`registry.json`). Five names collide with story exports in OTHER story files
(`Default`, `Disabled`, `Described`, `Invalid`, `Textarea`) and one with a `cva`
key in `button.tsx`; a story module is its own namespace and a variant key is not
an export, so none of those is a consumer. The `Described` hit inside `form.tsx`
is the substring in `ariaDescribedBy`, not a reader.

Scan 2 printed the one new item, its path and its target. Scan 3 named
`source-files.ts`, `story-suites.ts`, `registry.test.ts`, `fidelity.test.tsx`,
`alert-tone.test.tsx`, `nav-consumption.test.tsx`, `switch-drawing.test.tsx` and
`fixtures/extract-upstream.mjs` - all read. The only one this diff changes the
behaviour of is `tailwind-compile.test.tsx`, and the change is ADDITIVE: a new
describe block appended at the end, with the two hoisted helpers (`slotTokens`,
`declaredValues`) REUSED and not copied, and not one line of the nav or alert
arms touched. That is `Alert`'s decision 10 collecting its dividend - the second
family to need those helpers paid nothing.

**0 CROSS, 0 UNOWNED**, 14 names NEW between the two runs (the first ran against
an empty diff by construction). The batch's other streams are in a different
repository, and nothing in this one was edited outside this slice's own surface.

⚠️ The blind spot the Switch and `Alert` both recorded still applies: scan 3's
stem arm looks for `./<stem>"` and `../<stem>"`, so it does NOT see
`import * as form from "../../stories/form.stories.js"`, which is how
`story-suites.ts` reaches a new story file. Scan 4 - the declared lists - is what
covers it, which is why that arm exists.

## Layer 1 (reviewer, detached worktree of 75c254d9, slot r6)

Thirteen findings: **1 HIGH** (already closed, independently, before the report
landed), **4 MED** and **8 LOW** (its LOW-8 is three collapse facts with no
defect behind them, counted as one). Its full report is `$BATCH_SCRATCH/r6/report.md`. Its
baseline on the committed head was `pnpm build` exit 0, `pnpm lint` exit 0,
`pnpm typecheck` exit 0, `vitest run` 22 files / 392 tests, exit 0.

⚠️ **The branch head moved while the review ran, and the reviewer said so
itself.** It reviewed `75c254d9`; the branch was at `9c8daea` when it reported.
`02bb0815` had already landed its HIGH-1 in the same shape, reached
independently from the stream's own mutation pass. The reviewer re-checked that
nothing in those three commits touches anything another finding names, so every
MED and LOW stood at `9c8daea` and every one is answered below. The as-built
prose and the gate are, by construction, unreviewed by it.

⚠️ It also recorded one fact about this repo worth keeping: **`pnpm exec vitest
run` in a fresh worktree is RED until `pnpm build` has run** (`ENOENT …
packages/tokens/dist/fonts.css`, 5 files). Test-before-build is not a verdict
here, which is why `pnpm verify` orders them that way.

### The collapse / no-op mutation table, verbatim

| file                                  | test                                                                         | mutation applied                                                                                                         | red / GREEN                                                                                                                                | what it asserts now                                                                                                                                                                                                |
| ------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `test/form-wiring.test.tsx`           | gives every item its own id, and every part of an item the same one          | `describedIds` helper → `() => []`                                                                                       | **GREEN** (`Tests 2 failed \| 10 passed`)                                                                                                  | only that two controls have distinct non-empty ids and each label points at its own; the whole "…and so does each item's description and message" section (resolution + containment) loops over nothing            |
| `test/form-wiring.test.tsx`           | names the message only on the field that is invalid                          | `describedIds` → `() => []`                                                                                              | red                                                                                                                                        | —                                                                                                                                                                                                                  |
| `test/form-wiring.test.tsx`           | keeps the caller's id in front of the family's, and both still resolve       | `describedIds` → `() => []`                                                                                              | red                                                                                                                                        | —                                                                                                                                                                                                                  |
| `test/form-wiring.test.tsx`           | gives every item its own id, and every part of an item the same one          | `field()` fixture drops `<FormDescription>` and `<FormMessage>`                                                          | **GREEN**                                                                                                                                  | same as above: with no describable parts composed, `described` is `[[],[]]` and every describedby assertion is vacuous                                                                                             |
| `test/form-wiring.test.tsx`           | renders all four without throwing once they are inside one                   | `field()` fixture drops two of the four parts                                                                            | **GREEN**                                                                                                                                  | that a render of two parts did not throw; it never observes that four parts exist                                                                                                                                  |
| `test/form-wiring.test.tsx`           | renders all four without throwing once they are inside one                   | body → `expect(() => render(<div />)).not.toThrow()`                                                                     | **GREEN** (`Tests 12 passed`)                                                                                                              | that rendering a bare `<div>` does not throw. It is the positive anchor for the four loud-throw cases and it observes none of the parts                                                                            |
| `test/form-wiring.test.tsx`           | names the message only on the field that is invalid                          | fixture drops the two parts                                                                                              | red                                                                                                                                        | —                                                                                                                                                                                                                  |
| `test/form-wiring.test.tsx`           | paints the description and the message in exactly those two                  | fixture drops the two parts                                                                                              | red                                                                                                                                        | —                                                                                                                                                                                                                  |
| `test/form-wiring.test.tsx`           | paints the description and the message in exactly those two                  | `painted()` helper → `() => []`                                                                                          | red                                                                                                                                        | —                                                                                                                                                                                                                  |
| `test/form-wiring.test.tsx`           | names them, and the instrument can tell a covered role from an uncovered one | `const inks = ["muted","destructive"]` → `[]`                                                                            | **GREEN** (`Tests 12 passed`)                                                                                                              | only the two NEGATIVE arms (`primary`/`brand` are not body inks). The positive half - that `muted` and `destructive` ARE measured - is carried entirely by the literal, and an empty literal passes                |
| `test/form-wiring.test.tsx`           | refuses a child that sets its own id / aria-describedby                      | `.toThrow("<FormControl>'s child must not set …")` → `.toThrow()`                                                        | **GREEN**                                                                                                                                  | that _some_ throw happened - which `Children.only` also produces. The message string is the only thing tying the red to this guard; it is present, so this row is a no-defect confirmation that it is load-bearing |
| `test/form-wiring.test.tsx`           | `%s` throws when it is not inside a FormItem                                 | `.toThrow("<name> must be rendered inside a <FormItem>.")` → `.toThrow()`                                                | **GREEN**                                                                                                                                  | as above; the specific message is what distinguishes the context throw from any other                                                                                                                              |
| `test/form-wiring.test.tsx`           | gives every item its own id…                                                 | delete `expect(target, "resolves").not.toBeNull()`                                                                       | **GREEN**                                                                                                                                  | the following `toContainElement` still rejects a null, so this row is a no-defect note                                                                                                                             |
| `test/stories.test.tsx`               | all 91 (15 suite arms + 74 stories + 2 counters)                             | `await Story.play({canvasElement})` deleted, `ran.push(id)` kept                                                         | **GREEN** (`Test Files 1 passed (1)` / `Tests 91 passed (91)`)                                                                             | that 74 stories RENDER. All 48 plays - including this family's 8, which carry the entire ARIA-wiring proof - assert nothing, and both counters still agree                                                         |
| `test/stories.test.tsx`               | all 91                                                                       | `await Story.play(…)` → `await (Story as …).runPlay?.(…)` (the exact rename the file's own docblock names as the threat) | **GREEN** (`Tests 91 passed (91)`)                                                                                                         | same. `ran` records that the line after the call was reached, not that the call did anything                                                                                                                       |
| `test/stories.test.tsx`               | covers all fifteen part families, with every story counted                   | `storySuiteNames()` → `Object.keys(STORY_SUITES).sort()` instead of reading the directory                                | **GREEN** (`Tests 91 passed (91)`)                                                                                                         | a tautology (`keys === keys`) plus `length === 15`. The "checked against the FILES" property lives entirely inside that helper. (Mitigated: the same drift reddens `packages/tokens` - see the `t17` row)          |
| `test/tailwind-compile.test.tsx`      | all 6 new field arms                                                         | `declaredValues()` → `() => []`                                                                                          | red (17 failed / 15 passed)                                                                                                                | — the field block's instrument is load-bearing, including the `decides no width…` arm, which its own `gap` anchor catches                                                                                          |
| `test/tailwind-compile.test.tsx`      | all 6 new field arms                                                         | `slotTokens()` → `() => []`                                                                                              | red (17 failed / 15 passed)                                                                                                                | —                                                                                                                                                                                                                  |
| `test/tailwind-compile.test.tsx`      | decides no width, no outer margin and no tap floor                           | `LAYOUT` list (20 properties) → `["min-height"]`                                                                         | **GREEN** (`Tests 32 passed`)                                                                                                              | that the item declares no `min-height`. The completeness of the list is pinned by nothing (see MED-3)                                                                                                              |
| `test/tailwind-compile.test.tsx`      | puts no drawing at all on the control slot                                   | `expect(control).toEqual(inputClass.split(" "))` → `expect(control.length).toBeGreaterThan(0)`                           | **GREEN** (`Tests 32 passed`)                                                                                                              | that the control wears at least one class. The equality is the arm's entire strength - and it does hold (see `s06`)                                                                                                |
| `test/registry.test.ts`               | resolves every registry dependency inside this registry                      | `expect(checked).toBe(16)` → `toBeGreaterThanOrEqual(0)`                                                                 | **GREEN** (`Tests 14 passed`)                                                                                                              | the per-dependency namespace/resolution assertions only; the new `16` is a hand-typed magic number whose only job is to notice a dependency list shrinking - which the stream's own `M21` proves it does           |
| `test/registry.test.ts`               | carries the CURRENT bytes of every source it ships                           | `expect(compared).toBe(17)` → `toBeGreaterThanOrEqual(0)`                                                                | **GREEN** (`Tests 14 passed`)                                                                                                              | the per-file byte compare only; same note                                                                                                                                                                          |
| `tokens/test/helpers/source-files.ts` | walks exactly the declared stories, by path                                  | remove `"packages/ui/stories/form.stories.tsx"` from `STORY_FILES`                                                       | red (`Tests 2 failed \| 96 passed`, + `brand-guard.test.ts` fails at collection with `Unexpected: [packages/ui/stories/form.stories.tsx]`) | — the second declared list is guarded in the direction the stream did not mutate (it only ran the `PUBLISHED_SOURCE_FILES` side, `M18`)                                                                            |
| `test/fidelity.test.tsx`              | —                                                                            | not mutated: the diff changes one word of a docblock (`fourteen`→`fifteen`) and no assertion                             | n/a                                                                                                                                        | verified by reading the diff; `Form` is derived, not moved, so the fidelity fixture correctly does not bind it, and "Eight of the fifteen" keeps the 8 right                                                       |

### And the source-side probes it ran that the stream's 23 did not, verbatim

| mutation to `packages/ui/src/form.tsx`                           | red / GREEN                                                | reading                                                                                                                |
| ---------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| item class gains `px-3`                                          | **GREEN** (221 passed)                                     | `padding-inline` is not in `LAYOUT`                                                                                    |
| item class gains `py-2`                                          | **GREEN** (221 passed)                                     | `padding-block` is not in `LAYOUT`                                                                                     |
| item class gains `border-t-2`                                    | **GREEN** (221 passed)                                     | `border-top-width` is not in `LAYOUT`                                                                                  |
| item class gains `max-h-40`                                      | **GREEN** (221 passed)                                     | `max-height` is not in `LAYOUT`                                                                                        |
| item class gains `p-3`                                           | red - `decides no width, no outer margin and no tap floor` | `padding` is listed                                                                                                    |
| item class gains `mx-auto`                                       | red - same arm                                             | every margin spelling is listed                                                                                        |
| `FormControl`'s `Slot` gains `className="shadow-lift"`           | red - `puts no drawing at all on the control slot`         | confirms the `75c254d9` fix reddens for a class NOT already inside `inputClass`, not only by tailwind-merge reordering |
| `FormDescription` loses `id={field.descriptionId}`               | red ×7 (5 plays + the wiring test + the play counter)      | —                                                                                                                      |
| `composedParts` returns `{description:true,message:true}` always | red ×4 (`Default`, `Invalid`, the merge test, the counter) | the OVER-naming direction is guarded                                                                                   |
| `role="alert"` → `role="status"`                                 | red ×4                                                     | —                                                                                                                      |

### What was done about each finding

Every one of the ten was PROVED by the reviewer with a run, and every one is
FIXED rather than recorded, at `de2acaa`. Six new guards were added with it and
each was proved by its own reddening mutation (rows 24-29 of the guard table
above), taking the stream's mutation count from 23 to **29**.

| finding                                                                                                                               | verdict                                       | what changed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HIGH-1** `aria-invalid` is the third `Slot` child-precedence attribute and is unguarded                                             | fixed at `02bb0815`, BEFORE the report landed | The stream's own mutation pass reached it independently: the refusal list is `["id", "aria-describedby", "aria-invalid"]` and the `it.each` covers three. The reviewer confirmed the shape matched and closed it with no action.                                                                                                                                                                                                                                                                                                                    |
| **MED-1** the part walk is one level deep while the id/ARIA context is not, so a fragment or a wrapper silently drops the association | fixed                                         | `composedParts` became `countParts`, which descends the WHOLE element tree and stops at a part, because a part's children are content. The reviewer's exact failing case - the field invalid, the error on screen with a resolvable id, `describedby: null` - is now one of three new tests, with a negative anchor so the walk cannot pass by saying yes to everything.                                                                                                                                                                            |
| **MED-2** two of the same part silently duplicates an id                                                                              | fixed                                         | `FormItem` refuses a second part of any kind. The worst case it names - two `<FormControl>`s giving two inputs the same id, the label reaching only the first - has its own test.                                                                                                                                                                                                                                                                                                                                                                   |
| **MED-3** the `LAYOUT` blacklist says "every spelling" and lets `px-3`, `py-2`, `border-t-2` and `max-h-40` through                   | fixed, by inversion                           | A blacklist of properties cannot be complete. The arm is now a WHITELIST: every property the item's classes declare, as a set, equal to the five the stack needs. All four of the reviewer's green mutations now redden (mutations L1d-L1f, re-run). ⚠️ **The `Alert` block above it still carries the original list and the "every spelling" comment.** That arm is `Alert`'s behaviour, not this slice's, so it was left alone and is reported to the orchestrator rather than edited here.                                                       |
| **MED-4** the play counters do not catch the case their own docblock names                                                            | fixed as a DOC correction, not a reshape      | Measured both readings. The counters DO catch `composeStories` no longer ATTACHING `play` - renaming the `typeof Story.play` read reddens `runs all 48 play functions` (mutation L1g, run). They do NOT catch the CALL being renamed or deleted, which is the reviewer's mutation and which the docblock's sentence claims. No self-counting mechanism inside a file defends that file against being edited to lie about itself. The docblock now says exactly which half it buys. The machinery is CONSUMED by this slice, so it was not reshaped. |
| **LOW-1** "the parts carry only their INK" is false of `FormLabel`                                                                    | fixed                                         | The sentence now says the description and the message, and says why the label is different: it composes `Label`, whose tones are a size AND an ink, which is `Label`'s contract to state.                                                                                                                                                                                                                                                                                                                                                           |
| **LOW-2** `FormLabel asChild` writes `for` onto a non-label element                                                                   | fixed                                         | Refused, with a message pointing at `<Label asChild>` outside the field. It is the lie `label.tsx`'s own docblock says `asChild` exists to avoid.                                                                                                                                                                                                                                                                                                                                                                                                   |
| **LOW-3** a `FormItem` with no `FormControl` renders a label pointing at nothing                                                      | fixed                                         | The same arity guard as MED-2: exactly one `FormControl`, or it throws.                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **LOW-4** props on `FormControl` itself are dropped silently, the opposite policy to the child-side throw                             | fixed                                         | `id` and `aria-invalid` are refused on the part's own props too. `aria-describedby` stays the one exception and merges, which the docblock now states as an exception rather than leaving implied.                                                                                                                                                                                                                                                                                                                                                  |
| **LOW-5** `<FormMessage />` with no children, while invalid, names an empty element                                                   | recorded, not fixed                           | Not a dangling id, so the axe argument survives. The alternative - rendering on having children rather than on `invalid` - is exactly what decision 4 rejects, because it lets the attribute and the element disagree. An invalid field whose message says nothing is the caller's omission and it is visible on screen.                                                                                                                                                                                                                            |
| **LOW-6** not every measurement in the docblock reproduces                                                                            | fixed                                         | It was right: **14** `htmlFor` attributes and **11** literals, not 15 and 12. The old command counted LINES and the fifteenth is a comment at `ImportPreview.tsx:314` mentioning `<label htmlFor>`. Corrected in `form.tsx` and in measurement 1, which now greps the attribute; the two entries that are CLASSIFICATIONS rather than greps are marked as such, with their reproducible raw numbers beside them.                                                                                                                                    |
| **LOW-7** a new cross-family coupling the consumer scan cannot see                                                                    | recorded                                      | `tailwind-compile.test.tsx` now pins the control slot's class list to `Input`'s exported `inputClass`, so **a change to `input.tsx` reddens an arm titled for the `Form` family**. That is the coupling working as intended - the slot must add nothing - but whoever next touches `Input` should read this line rather than hunt a `Form` regression. It is also a name the consumer scan structurally cannot find: the diff CONSUMES it rather than exporting it.                                                                                 |
| **LOW-8** three collapse facts with no defect behind them                                                                             | fixed anyway                                  | All three were cheap to close and each was a test that named more than it observed: the `inks` list is anchored at length 2, `renders all four…` now counts the five slots it renders instead of passing against `render(<div />)`, and the collide test anchors `[1, 2]` describedby ids before looping over them. Re-run under the reviewer's own collapses (L1a-L1c), all three now redden.                                                                                                                                                      |

Two things the reviewer noted that are deliberate and stay:

- **The throws happen during render**, so a composition mistake takes a route
  down rather than degrading. That is decision 11 and it is the family's whole
  posture: the quiet version of every one of these is a label pointing at
  nothing, which looks entirely normal on screen. The five new refusals are all
  of that shape.
- **`isValidElement(child)` in `FormControl` is unreachable** after
  `Children.only`, which throws for anything that is not a single element. Left:
  it is the type narrowing that lets `child.props` be read without a cast, so
  removing it would trade a dead branch for an assertion.

### The gate

One run, at `96950d9`, detached with a sentinel in `$BATCH_SCRATCH/s2/`:
`pnpm verify` **exit 0** in 23s (11:19:42 -> 11:20:05 IST, 2026-09-19), the
runner's own lines being `All matched files use Prettier code style!`, both
packages' `typecheck: Done`, `✔ Building registry.`,
`└ Storybook build completed successfully` and
`Test Files 22 passed (22)` / `Tests 405 passed (405)` (from 21 / 365 at the
base `8c9d31a`, whose own `pnpm verify` was measured green first).
`git status --short` was empty afterwards, so the committed `packages/ui/r` is
exactly what `build:registry` produces.

⚠️ Docs commits followed that run, this section among them, so the gated tree
and the branch head differ by `docs/as-built.md` alone. Rather than quote a run
that predates the head, `pnpm verify` was run AGAIN, in full, on the final
commit - the same exit 0 and the same 22 / 405 - because this gate takes 23
seconds and an unverified head is not worth saving them. Nothing outside `docs/`
changed between the two, and `docs/` is read by `prettier --check` and by no
test: `source-files.ts` walks `packages/*/src` and `packages/*/stories` only.

No push, no publish, no version bump: the freeze holds, and this family rides
the post-freeze `0.1.1` with the Switch, the two navigation families and
`Alert` - a FIVE-item bump.

### Consumers, run 3

After the layer-1 fixes (`consumer-scan.3.txt`, at `96950d9`): **the same 14
exported names**, unchanged. Everything the fixes added is module-private -
`countParts`, the `PartCounts` type and the five refusals all live inside
`form.tsx` and none is exported - so the package's public surface is identical
to run 2's, which is the shape a bug-fix pass should have. Scan 3's list is
unchanged too. Still **0 CROSS, 0 UNOWNED**.

One name this scan structurally CANNOT see, recorded because layer 1 found it by
reading (LOW-7): **`inputClass`**. The diff CONSUMES it rather than exporting it,
and scan 1 only enumerates what a diff ADDS to the exported surface. It now pins
the control slot's class list exactly, so a change to `input.tsx` reddens an arm
titled for the `Form` family. That is the coupling doing its job - the slot must
add nothing - but it is a cross-family edge, and the next person to touch `Input`
should read this line rather than hunt a `Form` regression.

### Post-report: the Alert arm

⚠️ **This section and the commit it describes are UNREVIEWED by layer 1**, which
ran at `75c254d9` and reported before any of it existed. Everything above in this
slice's record stands as reviewed; this does not.

The stream's report closed with a REQUEST rather than an edit: `Alert`'s own
`decides no width, no outer margin and no tap floor` carried the same `LAYOUT`
blacklist the `Form` family copied from it, and the same "Every SPELLING, not two
of them" comment, and layer 1 had PROVED that list incomplete. The orchestrator
granted the request back, on the ground that the library repo is this stream's
whole fence for the batch, no other stream touches it, and the arm is a test
instrument with no product effect - so leaving a hole that has been proved is
shipping it on purpose.

**What changed** (`368a4484`, `packages/ui/test/tailwind-compile.test.tsx`, one
file, no source touched): the eighteen-property blacklist became a WHITELIST of
the eleven properties the notice box declares, in the shape the `Form` arm took at
`de2acaa`. Each of the eleven is derivable from the box's own class string rather
than transcribed from a run - `flex` gives display, `flex-col` flex-direction,
`gap-2` gap, `rounded-md` border-radius, `border-2` border-width plus the
border-style Tailwind emits with it, `p-3` padding, `text-sm` font-size and
line-height, and the default tone's `border-border` / `text-foreground-2`
border-color and color. The arm keeps its NAME, because the name is still exactly
what it proves and two records point at it. The comment now says what the arm
does and why the blacklist could not work: a blacklist refuses only what someone
predicted, a whitelist refuses everything nobody authorised.

**The reddening, run.** Five mutations to `packages/ui/src/alert.tsx`, applied to
the committed tree, each asserted to have LANDED before the run was read and each
reverted with `git status --short` empty afterwards
(`$BATCH_SCRATCH/s2/mutations-h.json`, logs beside it). The four that layer 1
proved the old list let through, and `mx-auto` as a regression check on the one it
did catch:

| mutation to the notice box | old blacklist | now                                             |
| -------------------------- | ------------- | ----------------------------------------------- |
| `px-3`                     | GREEN         | red - `decides no width…`, `+ "padding-inline"` |
| `py-2`                     | GREEN         | red - the same arm, `+ "padding-block"`         |
| `border-t-2`               | GREEN         | red - the same arm, `+ "border-top-width"`      |
| `max-h-40`                 | GREEN         | red - the same arm, `+ "max-height"`            |
| `mx-auto`                  | red           | red - still                                     |

The red, in full, for the first: `expected [ 'border-color', …(11) ] to deeply
equal [ 'border-color', …(10) ]`, with `+ "padding-inline"` as the difference -
which names the property, not merely the arm. (Every source row also reddens
`carries the CURRENT bytes of every source it ships`, because `packages/ui/r` was
not rebuilt; that is the registry guard and it is omitted here as it is from the
table above.)

That takes the slice's mutation runs from 37 to **42**.

**The gate**, re-run in full at `368a4484`, detached with a sentinel: `pnpm verify`
**exit 0** in 12s (11:27:49 -> 11:28:01 IST, 2026-09-19), the runner's own lines
being `All matched files use Prettier code style!`, both packages'
`typecheck: Done`, `✔ Building registry.`,
`└ Storybook build completed successfully` and
`Test Files 22 passed (22)` / `Tests 405 passed (405)` - the same counts as
before, which is the point: inverting a guard's shape added no test and changed no
behaviour. `git status --short` empty before and after.

### Reconciler closures (batch DL10, layer 2)

Docs-only, on the library's `next` after the stream's head `847aa578`. HIGH-1: the
consumption checklist's refusal bullet now enumerates by the refusal predicate and
names `OnboardingForm.tsx:98`, `FacePicker.tsx:373` and `LogForm.tsx:705`. LOW-1: the
real-wiring count is 4 across 3 sites (9 Radix suppressions, not 8). LOW-2: the
`CommentForm` and `DeveloperSettings` line numbers were the neighbouring lines (`:71`
and `:144`, not `:72` and `:141`). LOW-3: the record's last stated gate was at
`368a4484`; the stream's head `847aa578` (one docs commit later) also ran `pnpm verify`
exit 0, `22 passed (22)` / `405 passed (405)`, recorded in its report and not here until
now. This closure commit is docs; `pnpm exec prettier --check docs/as-built.md` is its
check.

## DESIGN-LIB-d: DescriptionList (2026-09-20)

Scope: the fifth §3-d addition, and the FOURTH NEW family (the Switch's, `Alert`'s
and `Form`'s shape): nothing was lifted, so the fidelity fixture does not bind and
the drawing is DERIVED and recorded below. Nothing was published, nothing was
pushed (the Actions-minutes freeze), no version was bumped, and nothing in the
consuming repo was changed: it was read only, at commit `f8385c6d`.

Two families were MEASURED FIRST and neither ships. Their tables come before the
one that does, because they are what chose it.

The family that ships is the CONTENT MODEL, not a look. HTML fixes all four of its
elements, which is why it has no `asChild` anywhere - and the one composition the
brief asked for is the one the product's own record says is a WCAG failure.

### The ToggleGroup measurement, and the answer

**No `ToggleGroup` family ships.** Its six audit rows are all NAVIGATION, and
Radix's part is a radio group or a toolbar. Adopting it at any of the six would
trade a link for a radio.

The audit's count reproduces at the thepile base `f8385c6d`
(`awk -F'|' '{print $4}' docs/design-audit.md | command grep -c -w ToggleGroup`
-> **6**; `ScrollArea` 6, `Tabs` 5, `Avatar` 5).

**First, what Radix's part actually renders**, measured rather than recalled:
`@radix-ui/react-toggle-group@1.1.19` + `react@19.3.0` under jsdom 29.1.1,
`$BATCH_SCRATCH/s2/radix-probe/probe.mjs`, output in
`$BATCH_SCRATCH/s2/radix-dom-probe.txt`:

| composed as                                  | the root                               | each item                                                                                              |
| -------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `type="single"`, `Item asChild` + `<a href>` | `<div role="radiogroup" tabindex="0">` | `<a href="…" type="button" role="radio" aria-checked="true" tabindex="-1" data-radix-collection-item>` |
| `type="single"`, default items               | `<div role="radiogroup" tabindex="0">` | `<button type="button" role="radio" aria-checked>`                                                     |
| `type="multiple"`                            | `<div role="toolbar" tabindex="0">`    | `<button type="button" aria-pressed data-state>`                                                       |

⚠️ **The brief's reading of Radix is wrong in the direction that matters.** It says
"a `role="group"` of `aria-pressed` buttons". Neither `role="group"` nor
`aria-pressed` appears under `type="single"`, which is the type the audit prescribes
by name at `:376` and `:385`: it is `role="radiogroup"` + `role="radio"` +
`aria-checked`. `aria-pressed` arrives only with `type="multiple"`, whose root is
`role="toolbar"`. The correction makes the verdict stronger, not weaker: a radio is
a narrower claim than a toggle, and it is a worse fit for a link.

Three further measured facts (`$BATCH_SCRATCH/s2/radix-togglegroup-keyboard.txt`):

- **The items are not tab stops.** After mount every item is `tabindex="-1"` and the
  ROOT is `tabindex="0"`; the active item becomes `tabindex="0"` only once focus
  enters the group. So a row of six sort links collapses to one tab stop reached by
  arrow keys.
- **A caller's `aria-current` survives and sits BESIDE the radio state.** Passing
  `aria-current="true"` on the `asChild` anchor produced
  `role="radio" aria-checked="true" aria-current="true"` on one element: two state
  models on one control, saying "this option is checked" and "this is the current
  page".
- **Navigation still works.** The click is not cancelled (`defaultPrevented` false
  at the anchor's own listener, and jsdom then logged
  `Not implemented: navigation to another Document`, which is the default action
  running). That is the one thing the part does not break.

Row by row, read at the thepile base:

| audit row                                                                                | what it actually is                                                                                                                                                                                                                                                                                                           | wants the part?                                                                  |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `:333` `/backlog`, three chip rows (`Shelf.tsx:62,84,104`)                               | three `<nav aria-label="Sort"/"Outcome"/"Paused">` of `next/link`, `aria-current={… ? "true" : undefined}`, each `href` a different URL                                                                                                                                                                                       | No. Each chip is a distinct URL and the state IS the current page                |
| `:340` `/browse`, eight path chips (`browse/page.tsx:141-153`)                           | `<nav aria-label="More ways to browse"><ul>` of eight `<li><Link>`; **no selected state of any kind** - no `aria-current`, no active class                                                                                                                                                                                    | No. There is no state to model: a toggle group over eight links would invent one |
| `:341` `/browse/games`, `FacetRow` + `FilterBar`'s `Chip`                                | `<nav aria-labelledby>` of `Chip` = `<Link aria-current={active ? "true" : undefined}>`; `FilterBar.tsx:18-26` states the subtree's rule: "**a crawler that does not run scripts has to be able to walk this, which rules out a button-driven control**", and "there is no client URL-state layer anywhere in this app today" | No, and this is the row that makes it a house rule rather than a preference      |
| `:368` `/studios`, the A-Z strip (`studios/page.tsx:102-115`)                            | `<nav aria-label="Studios by letter"><ul>` of `<Link>`; **no selected state**, and a letter with nothing behind it is deliberately not a link at all                                                                                                                                                                          | No. Same as `/browse`                                                            |
| `:376` `/[username]/[shelf]`, `SortChips` (+ `DoorTab`, where the audit asks for `Tabs`) | `SortChips.tsx:37-52` is `<nav aria-label="Sort">` of `<Link aria-current>`; `Door.tsx:70-76`'s docblock already decided this case in code: "`aria-current` rather than `aria-selected`, **because this is a set of links and not a `tablist`: the selected one IS the current page**"                                        | No. The house decision is recorded in the source, with its reason                |
| `:385` `/[username]/reviews`, `SortChips`                                                | the same component, second mount                                                                                                                                                                                                                                                                                              | No. Same                                                                         |

So: **6 of 6 are anchors whose selected state is the current URL.** Two of the six
carry no state at all. The tree's own split is measured, not asserted -
`git grep -n -E 'aria-pressed=' $T -- 'apps/web/src/**/*.tsx' | command grep -v '\.test\.'`
prints **12 lines in 10 files**, and every one of them is a real toggle (a like
heart, Follow, a reorder switch, a face-set picker, the tier dealer); the same grep
for `aria-current=` prints **19 lines**, of which **3** are not attributes at all
(`FacetRow.tsx:63` a `querySelector`, `HubTabs.tsx:27` a docblock, `TierEditor.tsx:463`
a JSX comment), leaving **16**. The product already knows the difference.

**And the counter-example was looked for, outside the six rows.** The one site in the
tree whose semantics are toggle-shaped is `TierEditor.tsx:469-485`: a `role="group"`
holding two `aria-pressed` buttons for Board / Deal mode. It is not an audit row, and
Radix cannot draw it either - its own comment at `:459-465` explains why it is
`aria-pressed` and not `aria-current="page"` ("no page changes") and not
`role="tablist"` ("which owes roving arrow keys and `aria-controls`"), and the pair is
mutually exclusive, which Radix spells `type="single"`, i.e. `role="radiogroup"`, not
`role="group"` + `aria-pressed`. `type="multiple"` would permit both on and both off.
So even the one candidate wants neither of the part's two shapes. Nothing ships.

### The ScrollArea measurement, and the answer

**No `ScrollArea` family ships.** Radix's part hides the native scrollbar with the
byte-for-byte content of the house's own `rail-bar` utility and then draws its own
in the space - and the house rule, in Ankit's words in `globals.css`, is that there
is no bar at any width. Below the bar, three further blockers each independently
disqualify it at a named site.

**What Radix's part renders**, measured the same way
(`@radix-ui/react-scroll-area@1.2.18`):

```
<div style="position: relative; --radix-scroll-area-corner-width: 0px; …">
  <style> [data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;…}
          [data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}
  <div data-radix-scroll-area-viewport style="overflow-x: scroll; overflow-y: hidden;">
    <div style="min-width: 100%; display: table;">
      …content
  <div data-orientation="horizontal" data-state="visible" style="position: absolute; bottom: 0; …">
```

Set that `<style>` beside `globals.css:431-436`:

```css
@utility rail-bar {
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}
```

Both halves, for the reason both records give independently: Chromium and Firefox
honour `scrollbar-width`, WebKit honours the pseudo-element. **Radix's part already
implements the house rule and then undoes it**, which is the answer to the brief's
question in one line: the only consumer that wants exactly this part's semantics is
one that wants the drawn bar, and the house has none.

And composing no `ScrollAreaScrollbar` is not the way out, because that is not a
cosmetic choice:

```
=== ScrollArea with no Scrollbar part composed ===
  <div data-radix-scroll-area-viewport style="overflow-x: hidden; overflow-y: hidden;">
```

Structural, not a jsdom layout artefact - the source says so. `dist/index.mjs:121-122`
is `overflowX: context.scrollbarXEnabled ? "scroll" : "hidden"`, and `:151-158` is
the `ScrollAreaScrollbar`'s own mount effect calling `onScrollbarXEnabledChange(true)`.
**The viewport scrolls on an axis if and only if a scrollbar for that axis is
mounted.** So the part either draws the bar the house hides, or it stops scrolling.

Row by row:

| audit row                                               | what it actually is                                                                                                                                                                                                                                                                                    | wants the part?                                                                                                                                                                                                |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `:333` `/backlog`, `ShelfSwitcher.tsx:40`               | `-mx-4 overflow-x-auto px-4 py-2 md:mx-0 md:px-0`, and MOBILE-1 measured the row at **347px inside 358** after the `px-3`->`px-2` fix: its own comment says "there is no edge-fade affordance here and no scroll-into-view on mount: **nothing scrolls**"                                              | No. The measured answer at this site is that it is not a scroller                                                                                                                                              |
| `:341` `/browse/games`, `FacetRow.tsx:96`               | `overflow-x-auto overscroll-contain` + a `mask-image` right-edge fade + `[scrollbar-width:none] [&::-webkit-scrollbar]:hidden`, and **`md:overflow-x-visible`**: from `md` the row WRAPS and stops being a scroller                                                                                    | No, twice. The fade is the affordance the house rule leaves it, and Radix writes `overflow` as an INLINE STYLE, which no `md:` variant can override                                                            |
| `:343` `/developers`, `page.tsx:59`                     | a `<pre className="overflow-x-auto …">` holding one curl line                                                                                                                                                                                                                                          | No. A `<pre>` is already the element; wrapping it adds a `display:table` div between the code and its box                                                                                                      |
| `:386` `/[username]/tier/[slug]`, `TierRow.tsx:60`      | `flex snap-x gap-2 overflow-x-auto pb-1 [scroll-padding-inline-start:1rem] md:gap-2.5 **md:overflow-x-visible** md:pb-0`, five times over                                                                                                                                                              | No. Same inline-style blocker, plus the strip's children are `snap-x` items and Radix inserts a `min-width:100%; display:table` wrapper between the scroller and them                                          |
| `:394` `/home`, `Section.tsx:108`'s `RAIL` + `Rail.tsx` | `rail-bar flex snap-x gap-3 overflow-x-auto …` on a `<ul>` in a SERVER component, and `Rail.tsx:15-21` finds that scroller **by id rather than by a ref**, as a stated budget decision: "a ref would put a client boundary around the `<ul>`, which would drag twelve server-rendered cards across it" | No, and this is the most expensive row. Radix's part IS the client boundary that decision exists to avoid, on both `/` and `/home`, which `perf-budgets.json` budgets equal "precisely so they cannot diverge" |
| `:401` `/tiers/new`, `PoolBuilder.tsx:191`              | `flex max-h-[50dvh] flex-col gap-1 overflow-y-auto overscroll-contain`, the result list of a hand-built combobox                                                                                                                                                                                       | No. The audit's own answer for this row is `Command`, not `ScrollArea`: the defect is the missing combobox semantics, and the scroller is the one part of it that already works                                |

The house rule's blast radius, re-measured:
`git grep -n -E 'overflow-x-auto|overflow-auto|overflow-y-auto' $T -- 'apps/web/src/**/*.tsx' | command grep -v '\.test\.'`
-> **18 lines in 15 files** (the brief's number reproduces; DL10's 16 was by a
pattern it did not record). Of those, `git grep -n -oE 'md:overflow-[a-z-]+'` finds
**3** (`FacetRow.tsx:96`, `TierRow.tsx:60`, `TierRow.tsx:249`) that turn the scroller
OFF from `md` up through a Tailwind variant, which an inline `style` cannot lose to.
And `docs/03-testing.md:95-98` requires `overflow-*-auto` AND `overscroll-contain`
on every scrollable region that is not in a sheet - a rule written about the native
property. Nothing ships.

⚠️ Neither verdict is "Radix is wrong". Both parts are correct implementations of
semantics this product does not have: it has no pressed-state option group over
navigation, and no drawn scrollbar. The audit's twelve cells are what should move,
and that is the reconciler's grep, not this stream's edit.

### What shipped

| file                                                    | what                                                                                                                                                                                               |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/ui/src/description-list.tsx`                  | four parts - `DescriptionList`, `DescriptionItem`, `DescriptionTerm`, `DescriptionDetails` - two `cva` axes, no `asChild`, no context beyond two markers (20,324 B after layer 1; 14,515 B before) |
| `packages/ui/stories/description-list.stories.tsx`      | 6 stories, all 6 carrying a `play`                                                                                                                                                                 |
| `packages/ui/test/description-list-structure.test.tsx`  | 22 tests: the refusals and the axis pairs, which one composition cannot state                                                                                                                      |
| `packages/ui/test/tailwind-compile.test.tsx`            | 8 new tests in resolved declarations, appended; `slotTokens` / `declaredValues` / `rootVars` / `lengthPx` reused, not copied                                                                       |
| `registry.json` + `packages/ui/r/description-list.json` | the `description-list` item, `target` `components/ui/description-list.tsx`, one npm dep (`class-variance-authority`) and one registry dep (`@marquee/utils`)                                       |
| `packages/ui/src/index.ts`                              | the four parts, the two `cva` functions and four Props types                                                                                                                                       |
| the declared lists                                      | both lists in `packages/tokens/test/helpers/source-files.ts`, `story-suites.ts`, `stories.test.tsx`'s two counts and its suite length, `registry.test.ts`'s item list and its two counters         |
| the stated count                                        | `AGENTS.md`, `README.md`, `packages/ui/package.json` and `fidelity.test.tsx`'s docblock say sixteen part families                                                                                  |

No new dependency: `class-variance-authority` was already here and no Radix
primitive is involved at all - this is the first family since `Card` with no
`@radix-ui/*` dependency of any kind, which is a consequence of decision 3 rather
than a goal. `pnpm test` goes from **22 files / 405 tests** at the base
(`b2e24fd3`, `pnpm verify` measured green first) to **23 / 453**, which is +48,
each measured by running the file alone: **+33** in the new
`description-list-structure.test.tsx`, **+7** in `stories.test.tsx` (6 story
renders plus the suite's own `description-list: has stories`) and **+8** in
`tailwind-compile.test.tsx`'s new describe block. It was 442 at the reviewed head
`41f243a6`; the eleven tests the layer-1 fixes brought are the difference.

`fidelity.test.tsx:685`'s `expect(slots).toHaveLength(14)` is deliberately NOT
moved, and neither is its `NEW_PARTS` table: that is the set of slots LIFTED out
of the consuming product, a new family is not fidelity-asserted, and `Alert` and
`Form` are both absent from it for the same reason. Its docblock's "Eight of the
sixteen" IS moved, because that is a live ratio.

The shape, in one line each:

```tsx
// the bordered cell grid: the list owns the grid, the item owns one cell
<DescriptionList className="grid grid-cols-2 gap-px border-2 border-border bg-border">
  <DescriptionItem className="bg-surface px-3 py-2.5">
    <DescriptionTerm>Developer</DescriptionTerm>
    <DescriptionDetails className="text-sm font-medium text-foreground">Studio Nine</DescriptionDetails>
  </DescriptionItem>
</DescriptionList>

// the term beside its detail, baselines aligned
<DescriptionItem layout="inline">…</DescriptionItem>

// a prose term, where the micro-caps treatment would be wrong
<DescriptionTerm tone="plain" className="font-semibold text-foreground">…</DescriptionTerm>

// a door: the link goes INSIDE the dd, and it owes the 44px floor
<DescriptionDetails><a href="…" className="min-h-hit …">128</a></DescriptionDetails>
```

### Measurements, and what they corrected

All read with `git show` at the thepile base `f8385c6d`; every command is quoted so
a later stream can re-run it rather than trust the number.

**1. There are eight `<dl>`s, and the brief's count reproduces.**

```
git grep -n -E '^\s*<dl(\s|>|$)' $T -- 'apps/web/src/**/*.tsx' | grep -v '\.test\.'
```

-> **8 in 8 files**: `[username]/reckoning/[year]/page.tsx:201`,
`admin/reports/page.tsx:85`, `game/[slug]/page.tsx:757`,
`settings/steam/ImportPreview.tsx:214`, `transparency/page.tsx:460`,
`components/game/ScoreBlock.tsx:227`, `components/profile/Ledger.tsx:223`,
`components/profile/MemberRow.tsx:171`. The batch table's correction of DL10's
"13 openings" stands: `git grep -h -o '<dl'` still prints **13**, and the
difference is four comment lines plus one line matched twice.

⚠️ **A second count in the same family does NOT reproduce, and the pattern is
why.** All four numbers below are non-test, i.e. every command ends
`| command grep -v '\.test\.'`, which the first draft of this paragraph did not
restate (layer 1, LOW-4.1). `git grep -h -o -E '<dt(\s|>)'` prints 9 and
`<dd(\s|>)` prints 11, because `(\s|>)` cannot match a tag whose attributes start
on the NEXT line - `git grep` is line-based - and `Ledger.tsx` and `ScoreBlock.tsx`
both write `<dt\n  className={cn(`. With `<dt\b` it is **11 `<dt` lines and 12
`<dd` lines, one of the latter a docblock mention at `MemberRow.tsx:25`**, so 11
and 11 elements. ⚠️ WITHOUT the filter the same four commands give 9 / 12 / 11 /
**13**, the extra `<dd` hit being a second docblock mention at
`MemberRow.test.tsx:94` - which is why the filter is now stated rather than
implied. The conclusion (11 and 11 elements) is the same either way. All
per-SOURCE: four of the eight sites render theirs inside a `.map()`, so the
rendered counts are higher.

**2. The structural finding, and it is 8 of 8: every site wraps its pair in a
`<div>`.** Read one by one, not grepped, because the wrapper is three of them a
component away:

| site                               | the `dl`'s own classes                                                                                 | the group wrapper                                                                               | the `dt`                                                                                 | what the `dd` holds                                             |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `game/[slug]/page.tsx:757` Details | `grid grid-cols-2 gap-px overflow-hidden rounded-md border-2 border-line bg-line`                      | `<div className="bg-surface px-3 py-2.5 last:odd:col-span-2">`                                  | `font-mono text-3xs uppercase tracking-wide text-text-muted`                             | a string, `text-sm font-medium text-text`                       |
| `MemberRow.tsx:171`                | `col-span-2 grid grid-cols-3 border-2 border-line`                                                     | `<div className={CELL}>` (`border-r-2 … last:border-r-0`)                                       | `CELL_LABEL`: `font-mono text-[0.55rem] uppercase tracking-[0.14em] text-text-muted`     | a count, `font-mono text-[1.05rem] font-bold tabular-nums`      |
| `Ledger.tsx:223`                   | `grid grid-cols-[repeat(10,minmax(0,1fr))] gap-[2px]`, inside a `border-2 border-line bg-line` wrapper | `<div>` per cell, via a local `Cell` component                                                  | `font-mono uppercase leading-[1.5]` + three measured sizes/trackings + `text-text-muted` | a figure **and an `<a className="absolute inset-0">`**          |
| `reckoning/[year]/page.tsx:201`    | `grid grid-cols-2 gap-2`                                                                               | `<div className="flex flex-col gap-1 border-2 border-line bg-surface p-3">`, via a local `Fact` | `microLabelClass`                                                                        | a value span and a note span                                    |
| `ImportPreview.tsx:214`            | `grid grid-cols-2 gap-3`, **plus `aria-live="polite"`**                                                | `<div className="rounded-md border-2 border-line p-3">`                                         | `font-mono text-xs uppercase tracking-label text-text-muted`                             | `font-display text-2xl`                                         |
| `ScoreBlock.tsx:227`               | `flex flex-col gap-2`                                                                                  | `<div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">`, via a local `RawFigure`    | `font-mono text-3xs uppercase tracking-wide text-text-muted`                             | a figure span and a hint span, `flex flex-1 …`                  |
| `transparency/page.tsx:460`        | `flex flex-col gap-4`                                                                                  | `<div className="flex flex-col gap-1">`                                                         | `text-reading font-semibold text-text` - **not micro-caps at all**                       | a paragraph, `text-reading leading-relaxed text-text-secondary` |
| `admin/reports/page.tsx:85`        | `pt-2`                                                                                                 | `<div className="flex gap-2 break-words">`                                                      | `text-text-muted`, plain                                                                 | `text-text`                                                     |

⚠️ **The batch table's split into "bordered cell grid" (3) and "stacked list" (5)
does not survive the read, and neither does the axis it proposed.** Sorting the
same eight three ways:

- **the LIST's layout**: a grid at 5 (`game`, `MemberRow`, `Ledger`, `reckoning`,
  `ImportPreview` - the table put the last two in the stacked bucket), a flex
  column at 2, bare at 1. Column counts 2, 3, 10, 2, 2. **Eight sites, eight
  strings, no two equal.**
- **the GROUP's arrangement**: term OVER detail at 6, term BESIDE it at 2
  (`ScoreBlock`, `admin/reports`) - and `transparency`, which the table called a
  stacked list, is one of the six that stack.
- **the BORDER**: gridlines drawn by a gap over a coloured backdrop at 2, a border
  per cell at 3, none at 3.

So "bordered grid vs stacked list" conflates a LIST property with a GROUP one, and
the list property has eight values. The axis the measurement does support is the
GROUP's arrangement, 6 against 2, and it is the one that shipped. **The list
decides no layout**, which is `FormItem`'s "decides no width" one level up.

**3. The term is spelled FIVE ways, not four, and the fifth breaks the tie.** The
batch table's (c) names four; `Ledger.tsx`'s is a fifth and it is three values by
breakpoint. As tracking: `tracking-wide` (0.025em) twice, `tracking-[0.14em]`
twice, `tracking-label` (0.12em) once, plus the ledger's `0.06em` / `0.08em` /
`0.14em`. As size: `text-3xs` (0.6rem) three times, `text-[0.55rem]`,
`text-xs`, plus the ledger's four. **There is no majority on the string.** There is
one on the shape - `font-mono` + `uppercase` + a small size + positive tracking -
and one on the INK: applying `fidelity.test.tsx`'s rename table
(`text-text-muted` -> `text-muted`, `text-text-secondary` -> `text-foreground-2`),
6 of the 8 terms are `text-muted`, 1 is `text-foreground-2` and 1 is
`text-foreground`. ⚠️ Five of that six are FLAT; the sixth, `Ledger.tsx:158`, is
`accent ? "text-accent-ink" : "text-text-muted"`, i.e. muted in its default arm and
the primary ink on the two accented cells (layer 1, LOW-4.2 - the first draft
counted it without saying so). The 6/8 conclusion stands; the shape of the sixth
did not. So the tie is broken by the SKELETON exactly as `FormItem`'s
`gap-1` was: `tracking-label` is the only one of the five that is a NAME,
`--tracking-label` exists for this treatment, `Badge` already uses it, and
`text-3xs` is the majority of the same set.

**4. THE MEASUREMENT THAT DECIDED AGAINST COMPOSING `Label`.** `microLabelClass`
in the consuming product is
`font-mono text-3xs uppercase tracking-[0.14em] text-foreground-2`, which is
byte-identical to this package's `labelVariants({ tone: "micro" })` - it is the
consumed registry copy. So `Label tone="micro"` IS the house micro-label, and
composing it looked obviously right. Two measurements say no:

| the question                          | measured                                                                                                                                                                                            | consequence                                                                                                                               |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| is the ink the same?                  | `labelVariants.micro` ends `text-foreground-2`; 5 of the 6 micro-caps terms are `text-muted` (the 6th is `reckoning`, the one site that already uses `microLabelClass`)                             | wrong at five sites, and each would pass an overriding `text-*` - the two-colour trap `micro-label.ts` and `MemberRow.tsx:80` both record |
| what does `Label` cost a server page? | `@radix-ui/react-label@2.1.15`'s `dist/index.mjs` opens `"use client"` (`head -2`), and 7 of the 8 `<dl>` sites are server components (`head -1 \| grep -c 'use client'` -> 1, `ImportPreview.tsx`) | a static cell would buy a client boundary for four utilities                                                                              |

`DescriptionTerm` therefore states the treatment itself, in the muted ink, and the
difference is asserted rather than left as prose
(`does NOT reuse Label's micro tone, and the difference is the ink`). ⚠️ Writing that
arm properly - it did not import `labelVariants` at first, which is layer 1's MED-3.2 -
showed the two sets differ by TWO members, not one: the colour AND the tracking,
because `labelVariants.micro` still carries the literal `tracking-[0.14em]` where this
family uses the named `tracking-label`. The colour is this family's decision; the
tracking is `Label`'s to fix, it is a CONSUMED behaviour this batch, and it is the one
REQUEST this slice returns rather than an edit.

**5. `asChild` on the detail is the composition the family must REFUSE, and the
brief's own citation says so.** The row asks for "`asChild` where a `dd` carries a
link (`Ledger.tsx:11-16`)". Read those lines:

> ⚠️ ONE `<dl>`, AND THE LINKS LIVE INSIDE THE `dd`s. A `div` inside a `dl` may
> hold only `dt`/`dd`, so an anchor as its third child is a real WCAG 1.3.1
> failure (axe `definition-list`) - which is exactly what `e2e/profile.spec.ts`
> reported when the four-cell version of this was first written the other way.

`<DescriptionDetails asChild><a/></DescriptionDetails>` renders the anchor IN PLACE
OF the `dd`, i.e. as the group's second child - which is that failure. The link
belongs INSIDE the `dd`, which is what the ledger does. And the same argument
reaches every part: HTML's `dl` content model fixes the list as a `dl`, the group
as a `div`, the term as a `dt` and the detail as a `dd`, so **there is no legal
`asChild` anywhere in this family**. Both parts refuse it with a message naming
where the child belongs.

**6. The consuming product already hand-wrote this family's central guard, per
site.** `Ledger.test.tsx:34-48`:

```
it("is ONE definition list whose every child holds nothing but a dt and a dd", …
  expect([...cell.children].map((c) => c.tagName)).toEqual(["DT", "DD"]);
```

with its own comment, "The rule, stated as the rule: dt, dd, and nothing else. A
layout wrapper here is the same WCAG 1.3.1 failure as a stray anchor." That is the
best evidence the shape is right: the product wrote the assertion because it had
no part to put it in. It also fixes the ORDER as load-bearing at the call site -
`:237` resolves the `dt` as the `dd`'s `previousElementSibling` - which is why the
item refuses a detail before its term rather than only counting them.

**7. `Children.toArray` does not flatten fragments, and a test found it.**
Measured on React 19.3.0: it flattens arrays and drops falsy children, and keeps a
fragment as ONE element whose `type` is the fragment symbol. The first draft of
this family read children through it and refused
`<><DescriptionTerm/><DescriptionDetails/></>`, a legal group. The walk now
descends fragments and ONLY fragments - a fragment renders no element, an element
between the group and its pair is invalid - which is the one place this family's
walk is deliberately narrower than `Form`'s, whose MED-1 fix descends through
element wrappers too. Both are right in their own tree.

### Guards, each proved by running its reddening mutation

**21 mutation runs**, one per guard, all against the COMMITTED head `879da4d2`,
each asserted to have LANDED before the run was read (the new text present and,
for a replacement, the old text gone, or the runner refuses to read it), each
reverted with `git checkout --` and `git status --short` asserted empty afterwards,
per mutation. Runner `$BATCH_SCRATCH/s2/mutate.py`, input `mutations-a.json`, logs
in `$BATCH_SCRATCH/s2/mutations/`.

The runner carries DL10's correction forward: **a red is counted only when the
output contains a `Test Files` line**, i.e. that a run happened at all. DL10's
first pass counted thirteen startup crashes as thirteen reddened guards. Every row
below reports that line.

⚠️ Read one thing into every SOURCE row: **it also reddens `carries the CURRENT
bytes of every source it ships`**, because `packages/ui/r` was not rebuilt. That is
the registry guard doing its job; it is omitted from the table, which lists the
reds that NAME the mutated property.

<!-- prettier-ignore-start -->

| # | guard | mutation | landed in | the red it produced |
| --- | --- | --- | --- | --- |
| M01 | the item refuses a stray child | the `else { throw }` branch made unreachable | `description-list.tsx` | TWO: `refuses an anchor beside the pair…` and `refuses a component child too…` (3 failed / 439) |
| M02 | a part outside its parent throws | `requireContext` made a no-op | `description-list.tsx` | FIVE: all three `%s throws, naming the parent it needs` arms, `a term inside a LIST but outside an item still throws`, and the baseline (5 failed / 437) |
| M03 | a group needs a term AND a detail | the arity floor made unreachable | `description-list.tsx` | `refuses a group with no detail, and a group with no term` (2 failed / 440) |
| M04 | every term before every detail | the order check made unreachable | `description-list.tsx` | `refuses a detail before its term, which is the one ORDER the model fixes` |
| M05 | `asChild` is refused | `refuseAsChild` made a no-op | `description-list.tsx` | TWO: `DescriptionTerm refuses it, naming the element` and `DescriptionDetails refuses it, which is the composition the brief asked for` |
| M06 | the walk descends a fragment | the `Fragment` branch made unreachable | `description-list.tsx` | `counts through a fragment and drops a falsy child, so a conditional part is fine` |
| M07 | the term's ink is the MUTED role | `text-muted` -> `text-foreground-2` (i.e. `Label`'s micro ink) | `description-list.tsx` | THREE, incl. `expected [ 'var(--foreground-2)' ] to deeply equal [ 'var(--muted)' ]` and `does NOT reuse Label's micro tone, and the difference is the ink` (4 failed / 438) |
| M08 | the tracking is the NAMED token | `tracking-label` -> `tracking-[0.14em]` | `description-list.tsx` | TWO: `the term is the house micro-label, in resolved values` and `micro is the default, and plain declares nothing at all` |
| M09 | the stack's gutter is the 4px grid | `gap-1` -> `gap-2` | `description-list.tsx` | TWO, incl. `expected [ 'flex', 'flex-col', 'gap-2' ] to deeply equal [ 'flex', 'flex-col', 'gap-1' ]` |
| M10 | the inline layout aligns baselines | `items-baseline` dropped | `description-list.tsx` | SEVEN, incl. the `Inline` story's own play and `declares exactly the properties each layout needs` (7 failed / 435) |
| M11 | the list decides no layout | `cn("grid grid-cols-2", className)` added to the `dl` | `description-list.tsx` | `gives every part a data-slot, and the list none of its own classes`, `expected 'grid grid-cols-2' to be null` |
| M12 | the detail decides no ink | `cn("text-foreground", className)` added to the `dd` | `description-list.tsx` | `the detail contributes nothing either…`, `expected [ 'text-foreground' ] to deeply equal []` |
| M13 | `plain` really is empty | `plain: ""` -> `plain: "text-muted"` | `description-list.tsx` | `micro is the default, and plain declares nothing at all`, `expected 'text-muted' to be ''` |
| M14 | the list refuses a bare `dt`/`dd` | the mixing check made unreachable | `description-list.tsx` | `refuses a bare dt or dd, which would mix the two content-model forms` |
| M15 | the term IS a `dt` | `<dt` -> `<p` | `description-list.tsx` | FIFTEEN: all six story plays, the play counter (`expected [ … (47) ] to deeply equal [ … (53) ]`) and the whole structure file's role reads (15 failed / 427) |
| M16 | a part cannot leave the shared suites map | `"description-list"` deleted from `STORY_SUITES` | `story-suites.ts` | TEN: `covers all sixteen part families…`, the play counter and all eight declaration arms, which stop finding anything to measure |
| M17 | a source cannot leave the declared walk | `packages/ui/src/description-list.tsx` deleted from `PUBLISHED_SOURCE_FILES` | `source-files.ts` | THREE in `published source coverage`, all naming `walks exactly the published set, by path` |
| M18 | a story file cannot either | `packages/ui/stories/description-list.stories.tsx` deleted from `STORY_FILES` | `source-files.ts` | TWO, naming `walks exactly the declared stories, by path` |
| M19 | a story cannot stop being one | `export const Composed` -> `const Composed` | `description-list.stories.tsx` | TWO: `covers all sixteen part families…` and the play counter |
| M20 | a link inside a `dd` still owes the floor | the `LinkedFigure` story's `min-h-hit` deleted | `description-list.stories.tsx` | the package's own floor guard: `expected [ 'a[data-slot=-] "128" -> 0px' ] to deeply equal []` |
| M21 | the registry's item list is exact | `"description-list"` deleted from `registry.test.ts`'s list | `registry.test.ts` | `declares the sixteen part families plus the one shared lib` |

<!-- prettier-ignore-end -->

**21 red, 0 GREEN, 0 no-run.** Two things worth saying about that rather than
leaving it to read as luck. M15 is the cheap check that the plays observe the
ELEMENT and not a class: turning the `dt` into a `p` reddens all six of them plus
every role read in the structure file, which is what a family whose deliverable is
the content model should do. And M11/M12/M13 are the three arms that assert a part
declares NOTHING - the kind of claim that is usually vacuous - so each one has a
mutation that gives it something to find.

### The pipeline, end to end

`pnpm pack` in both packages (`prepack` is
`pnpm -w build:registry && git diff --exit-code -- r`, so packing at all is the
evidence that `r/` is committed and current) -> `marquee-ui-ui-0.1.0.tgz`
**65,759 B** (62,046 before the layer-1 fixes; 51,909 at `Form`, 38,315 at `Alert`,
26,396 at the Switch) and `marquee-ui-tokens-0.1.0.tgz` 99,608 B, unchanged -> `npm install` of both into a
bare project (`package.json`, `tsconfig.json` with `@/*` -> `./src/*`, an
`app.css`, and a `components.json` whose `registries` map points at
`./node_modules/@marquee-ui/ui/r/{name}.json`) ->
`shadcn add ./node_modules/@marquee-ui/ui/r/description-list.json`:

```
✔ Created 2 files:
  - src/lib/utils.ts
  - src/components/ui/description-list.tsx
```

Two, not three: unlike `form`, this item declares no cross-item dependency beyond
`@marquee/utils`.

Re-run at the final head, AFTER the layer-1 fixes, so these are the bytes that ship
rather than the bytes that were reviewed (`$BATCH_SCRATCH/s2/pipeline/bare3`):

```
description-list: installed bytes 20324, target components/ui/description-list.tsx
  installed === r/description-list.json content === packages/ui/src/description-list.tsx: True
                                                    sha256 5833910d8e09 (all three)
utils: installed bytes 1649, target lib/utils.ts
  installed === r/utils.json content === packages/ui/src/lib/utils.ts: True
                                                    sha256 78a6fb4e43d8 (all three)
packed r/registry.json === repo registry.json: True  (17 items)
npm deps the item asked for, and that landed:
  class-variance-authority@^0.7.1, clsx@^2.1.1, tailwind-merge@^3.7.0
```

14,515 B at the reviewed head, 20,324 B here: the eleven fixes are five guards and
two docblocks that state WHY each one exists, and the reviewer's own words are why
that is spent rather than saved - both HIGHs were compositions "axe-core 4.12.1 rates
`serious` / WCAG 1.3.1, one of them reachable by the most ordinary React conditional
there is."

⚠️ **The first run of this proof FAILED, and the finding is about the consumer's
`components.json`, not the registry.** The installed copy came back 2 bytes larger
and a different sha, and the diff was one line: `@/lib/utils` -> `src/lib/utils`.
The bare project's `aliases.utils` had been written as the bare path `src/lib/utils`
rather than `@/lib/utils`, and `shadcn` rewrote the import to match it, exactly as
it is documented to. The control that settles it: **`form.json`, recorded
byte-equal in DL10, is byte-UNEQUAL in that same project, in the same one line.**
So the equality this section claims is conditional and the condition is worth
stating - a consumer whose `utils` alias is `@/lib/utils` (which is the reference
consumer's) gets the registry's bytes verbatim; one that spells it as a bare path
gets one rewritten import. Re-run with the alias a real consumer has, all three
copies agree.

Then the installed copy compiled in the bare project's own Tailwind 4 against the
published `@marquee-ui/tokens/tokens.css`, `@source "./src/components"`:

```
font-mono         font-family: var(--font-mono)
text-3xs          font-size: var(--text-3xs)          --text-3xs       0.6rem
uppercase         text-transform: uppercase
tracking-label    letter-spacing: var(--tracking-label)  --tracking-label 0.12em
text-muted        color: var(--muted)                 --muted          var(--mq-olive-600)
flex-col          flex-direction: column
gap-1             gap: var(--spacing)
flex-wrap         flex-wrap: wrap
items-baseline    align-items: baseline
gap-2             gap: calc(var(--spacing) * 2)
text-not-a-role   (ABSENT)
border-2          (ABSENT)
```

Every utility resolves to the ROLE's own variable in the consumer, not to a copy
of its value, and the two negative controls are absent.

⚠️ **One utility compiled that the part does not render, and it is this repo's own
recorded trap one step further out.** `min-h-hit` resolves in the consumer
(`min-height: var(--hit-min)`), because the part's DOCBLOCK names it - "A control
inside a `dd` owes `min-h-hit` FROM THE CALLER" - and Tailwind's source scan reads
comments. `AGENTS.md` records the same mechanism inside the test fixture ("a test
can conjure the thing it is testing"); here a shipped source's prose conjures one
rule in someone else's stylesheet. Harmless - one unused rule - but it means a
"does the consumer get this utility?" check cannot be answered by compiling a file
that mentions it. `text-not-a-role` and `border-2` are the controls that hold.

### Decisions

1. **The family is the CONTENT MODEL; the drawing is secondary.** [V] HTML's `dl`
   admits bare `dt`/`dd` groups or `<div>`-wrapped ones and never both, all 8
   product sites use the wrapper form, and the ledger records shipping an axe
   `definition-list` failure by getting it wrong. So the parts exist to make the
   valid composition the only available one, and every test here reads the DOM
   structure and the computed roles rather than a class.
2. **No `asChild`, anywhere.** [V] Measurement 5: the content model fixes all four
   elements, and the one `asChild` that looks useful - a linked `dd` - is exactly
   the failure above. Refused at render on both parts a caller would reach for,
   with the message naming where the child belongs. This is `Form`'s LOW-2 in a
   different costume, applied to a whole family rather than one part.
3. **No Radix, and no primitive at all.** [V] There is nothing to control: no
   state, no focus management, no portal. This is the first family since `Card`
   with no `@radix-ui/*` dependency, and it is a consequence of decision 1 rather
   than a target.
4. **The list decides no layout.** [V] Measurement 2: eight sites, eight strings,
   column counts 2/3/10/2/2. A `cva` with eight values is not an axis. `FormItem`'s
   "decides no width" one level up, and the arm that proves it is the same shape -
   the rendered class list equals the caller's string exactly.
5. **The group's arrangement IS an axis, with two values.** [V] Measurement 2: 6
   stack, 2 inline. `stack` is `flex flex-col gap-1` (two of the six write exactly
   that; the other four get it from block flow) and `inline` is
   `flex flex-wrap items-baseline gap-2`. Both gaps are on the 4px grid, which is
   what broke both ties - `gap-y-0.5` at `ScoreBlock` is 2px and off it, the same
   tie-break `FormItem` made against `gap-1.5`.
6. **It is a `cva` and not two class strings a caller appends, for the CONSUMER's
   sake.** [V] The reference consumer's `cn` is a plain join, not a tailwind-merge
   (its `lib/utils.ts` is a declared exclusion from this registry), so a caller's
   `flex-row` over a part that says `flex-col` leaves both on the element with the
   stylesheet's order deciding - a trap that repository records twice and that has
   shipped a wrong colour once. Mutually exclusive variant strings cannot do it.
7. **The term's `micro` tone is the DEFAULT, and it is not `Label`'s.** [V]
   Measurement 4: 6 of 8 terms are micro-caps, so `micro` defaults where `Label`'s
   is opt-in; and `labelVariants.micro` differs in the INK, which is wrong at 5 of the
   6 - plus `@radix-ui/react-label` is a client module against 7 server-component
   sites. The difference is an assertion, not a sentence, and the assertion is what
   corrected this decision's own first wording: the two sets differ by TWO members, the
   colour and the tracking (`Label` carries a `tracking-[0.14em]` literal), not by one.
8. **`plain` declares nothing at all.** [V] The two non-micro terms disagree with
   each other, so there is no second treatment to name; an empty variant lets each
   pass its own single `text-*` with nothing to fight. It is the one shape that
   answers decision 6's trap for a site the axis does not cover.
9. **The detail carries no ink.** [V] 2 sites `text-foreground`, 1
   `text-foreground-2`, 5 inherit while styling the figure inside. No majority,
   and what varies is the content of the `dd`, not the `dd`.
10. **The walk descends fragments and only fragments.** [V] Measurement 7: a
    fragment renders no element so a group may be written as one; an element
    between the group and its pair is invalid so it must be refused, not walked
    through. Deliberately narrower than `Form`'s walk, which descends element
    wrappers because there the wrapper is legal.
11. **The list refuses a bare `dt`/`dd` and nothing else; the ITEM does the real
    refusing.** [V] Three of the eight sites factor a group into a component
    (`Cell`, `RawFigure`, `Fact`), and a component is not an element - refusing an
    unrecognised child type at the list would reject all three while proving
    nothing. A bare `dt`/`dd` there is always the mixing error, so that one is
    knowable and refused. What the component renders is checked inside the item,
    where the check can see it. Both halves have a test.
12. **A composition mistake takes the route DOWN.** [V] `Form`'s decision 11 and
    the same reasoning: the quiet version of every refusal here is an invalid
    `<dl>` - a label with no value, a link beside the pair - and every one of them
    looks entirely normal on screen. The product found its own instance with an
    axe sweep rather than by looking.
13. **The `dd`'s UA 40px indent is left to Tailwind's preflight.** [V] Not an
    oversight: `BreadcrumbList` renders an `<ol>` with no `list-none` and
    `PaginationContent` a `<ul>` with no `p-0`, so relying on preflight is the
    package's existing posture rather than a new bet. Stated in the docblock, with
    what a consumer who turns preflight off owes.
14. **The stated part count moved where the package DESCRIBES itself**
    (`AGENTS.md`, `README.md`, `packages/ui/package.json`) and in
    `fidelity.test.tsx`'s docblock ratio. `fidelity.test.tsx:685`'s
    `toHaveLength(14)` and its `NEW_PARTS` table are NOT touched: a new family is
    not fidelity-asserted, which is `Alert`'s closure and `Form`'s, and stands here.

### thepile inputs

What the consumption half needs when `0.1.1` publishes, in one list. Nothing here
was done: the consuming repo was read only, at `f8385c6d`, and **every bullet was
checked against that tree with `git show` / `git grep` before it was written**, with
the command beside any count.

- `description-list` goes into `CONSUMED` in `scripts/marquee-drift.test.ts`, and
  `components/ui/description-list.tsx` arrives by `shadcn add`. ⚠️ **That test pins
  BOTH lists exactly** (read at the base): `CONSUMED` is
  `["button", "input", "label", "sheet", "toast", "ribbon"]` (`:49`) and the arm at
  `:98` asserts the complement is exactly
  `["accordion", "badge", "card", "separator", "utils"]`, with `toEqual` and its own
  comment saying why it is not a subset matcher. Re-read at `f8385c6d` rather than
  carried over from DL10. So new items in the shipped index redden that arm the moment
  `0.1.1` lands whether or not anyone consumes them - the bump and both list edits
  are ONE commit, or the arm is red between them. ⚠️ **It is now a SIX-item bump**:
  `switch`, `breadcrumb`, `pagination`, `alert`, `form` and `description-list`.
  ⚠️ `shadcn add description-list.json` writes **two** files, `lib/utils.ts` and
  `description-list.tsx`; thepile's `lib/utils.ts` is a DECLARED EXCLUSION whose
  `cn` is a plain join on purpose, so `git checkout -- apps/web/src/lib/utils.ts`
  after the add.
- ⚠️ **`Ledger.test.tsx` is the instrument to read first, and it is the one that
  already tests this family's contract.** At the base it holds
  `it("is ONE definition list whose every child holds nothing but a dt and a dd")`
  with `expect([...cell.children].map((c) => c.tagName)).toEqual(["DT", "DD"])`,
  `expect(container.querySelectorAll("dl")).toHaveLength(1)`,
  `expect(container.querySelectorAll("dd > a")).toHaveLength(9)`, at `:38`
  `expect(cells).toHaveLength(10)` (the fifth instrument, which layer 1 added to this
  list), and, at `:236-237`, a `dt` resolved as
  `dd[data-testid=…].previousElementSibling`. All five survive a
  consumption unchanged - the parts render exactly that DOM - and the last one is
  why the item refuses a detail before its term rather than only counting them.
- ⚠️ **`Ledger`'s `dt` and `dd` are the one site that must pass
  `tone="plain"`.** Its term is not the default micro string: it is
  `font-mono uppercase leading-[1.5]` plus THREE measured size/tracking pairs by
  breakpoint (`text-[0.5rem] tracking-[0.06em]` / `text-[0.55rem]
tracking-[0.08em]`, `md:` variants, then one size at `xl`), every one of them
  measured against a named overflow in `e2e/profile.spec.ts`'s sweep, and
  `Ledger.test.tsx:240-249` pins them with `className.toContain`. Passing the
  default `micro` would put a second `font-size` and a second `letter-spacing` on
  the element - the exact join-not-merge trap `Ledger.tsx:150-158` is written
  around. `tone="plain"` plus its existing string, and every `toContain` still
  holds.
- **The other seven sites take the default.** Five change the term's ink by one
  step (`text-text-muted` is `text-muted`, which is what `micro` carries, so they
  change nothing), `reckoning` moves from `microLabelClass`'s
  `text-foreground-2` to `text-muted` and from `tracking-[0.14em]` to
  `tracking-label` (0.14em -> 0.12em), `game/[slug]` and `ScoreBlock` move from
  `tracking-wide` to `tracking-label` (0.025em -> 0.12em, the visible one), and
  `ImportPreview` from `text-xs` to `text-3xs` (12px -> 9.6px). ⚠️ **Those last
  three are the shots-visible changes of a consumption and they are NOT zero-diff.**
  A consumption slice owes a prediction and a capture, not a claim that nothing
  moves.
- ⚠️ **And the ITEM's layout axis moves geometry at five of the eight sites, on at
  least six filmed screens** (batch DL11 layer 2, MED-1; the data is measurement 2's
  table, the enumeration was missing). `stack` is `flex flex-col gap-1`, and four of
  the six stack sites are block-flow wrappers with NO row gap (`game/[slug]:769`,
  `MemberRow`'s `CELL`, `ImportPreview:215,221`, `Ledger`'s `Cell`), so each gains 4px
  between `dt` and `dd`; `RawFigure:87` is `gap-x-2 gap-y-0.5` where `inline` is
  `gap-2`, so 2px becomes 8px down. Only `transparency:462` and `Fact:108` already
  write `flex flex-col gap-1`. "The other four get the same result from block flow"
  above is true of the DIRECTION and false of the gap. The prediction a consumption
  owes is therefore the term's ink and tracking AND these gaps, and the shots it names
  before the run include `members`, `members-signed-in`, `game`, `game-distribution`,
  `profile` and `settings-steam`.
- ⚠️ **The testids all live on the parts' own props and pass through `{...props}`,
  so every one keeps resolving.** Measured, by the exact testid rather than the
  substring (`git grep -l -E '(data-testid="X"|getByTestId\("X"\)|\[data-testid="X"\])' $T -- 'apps/web/src/**' 'e2e/**' 'scripts/**'`):
  `member-played` **4** files, `member-rated` **3**, `member-reviews` **5**,
  `profile-stats` **7**, `steam-import-split` **3**, `steam-split-backlog` **3**,
  `steam-split-played` **3**, `rejected` **2**, `score-median` **2**,
  `score-mean` **2**, `follow-counts` **4**. ⚠️ The brief's `rejected` is the one
  to be careful with: a bare `git grep -c rejected` matches **38** files because it
  is an English word, and 2 is the number that is about the `<dl>`. Three of the
  eleven sit on a `dt` or a `dd` rather than on the list
  (`member-played`/`-rated`/`-reviews` on `dd`s, `score-median`/`-mean` on the
  figure inside the `dd`, and `score-median-label`/`-mean-label` on the `dt`s,
  asserted at `ScoreBlock.test.tsx:112`), so the props pass-through is what keeps
  them - which every story play exercises, since five of the six pass a `className`
  and the structure file asserts the `data-slot`s survive beside them.
- ⚠️ **The family REFUSES eight compositions, loudly, at render, and the consumption
  has to be read against the FULL PREDICATE and not one clause of it** (DL10's layer-2
  HIGH-1 was a checklist enumerated by fewer clauses than the predicate had; the first
  draft of THIS bullet listed six when the code had seven, omitting the list's own
  mixing refusal, which layer 1's MED-5 caught). `command grep -c "throw new Error"
packages/ui/src/description-list.tsx` -> **9** throw sites for **8** refusals (the
  arity floor is one site reporting two conditions). They are:

  1. a part outside its parent - including a part inside a PART, which is HIGH-2's fix;
  2. any child of an item that is not a term, a detail, a `script` or a `template`;
  3. an item with no term;
  4. an item with no detail;
  5. a detail before a term;
  6. a bare `dt` or `dd` as a direct child of the list (the two content-model forms mixed);
  7. non-whitespace TEXT as a direct child of the list or of an item (HIGH-1's fix);
  8. `asChild` on any of the four parts, or `role` on the term or the detail.

  Against the eight sites at `f8385c6d`, by the predicate:
  - (2) is the one with a live hazard, and it has exactly one instance:
    **`Ledger.tsx:206-212`'s `{href && <Link className="absolute inset-0" />}` is
    inside the `dd` already** (`{href && (` is `:206`, `<Link` itself `:207`, its
    `className` `:210` and the `</dd>` `:213`), so it PASSES - and it passes because
    the product already fixed it. A consumption that "tidies" that link out to the
    cell level takes the route down, which is the point. ⚠️ **(2) also fires on an
    intrinsic `<dt>` or `<dd>` inside a `<DescriptionItem>`** (layer 1, MED-5), so a
    half-finished refactor that swaps the wrapper for `<DescriptionItem>` but leaves
    the pair as raw tags takes the route down too. That is correct behaviour and it is
    the single most likely way to trip this family during a consumption, so read it
    before wrapping, not after.
  - (3), (4) and (5): all eight sites are one `dt` then one `dd`, checked in
    measurement 2's table, so none trips. ⚠️ But (3) and (4) are RUNTIME conditions
    (layer 1, MED-5): the product's SIX conditional groups (`reckoning:202-212` holds four,
    `ScoreBlock:231` two; DL11 layer 2 LOW-4) are safe only because both guards are `!== null` or object
    truthiness. A guard that is a bare NUMBER is the same edge as (7).
  - (6): none of the eight has a bare `dt`/`dd` as a direct child of its `<dl>`; all
    eight wrap. ⚠️ And the guard is BOUNDED: a component at list level that returns a
    bare pair is genuinely mixed, genuinely invalid, and is NOT caught - decision 11
    records why walking component output is refused, and layer 1 established that axe
    does not catch that case either (`invalidChildrenEvaluate` flattens the roleless
    `div` and then sees only `DT`/`DD`). It is a rule only a validator sees.
  - (7): no site trips it today, and the reason it exists is that the shortest React
    conditional produces it. `{count && <DescriptionDetails>{count}</DescriptionDetails>}`
    with `count === 0` renders a literal `0` beside the pair; the message says to write
    `{count !== 0 && …}`.
  - (8): no site can trip it, because no site uses this family yet; it exists for the
    consumption itself, which is when someone will reach for `asChild` on a linked `dd`
    (measurement 5) or for `role` on a cell.
  - (1): the three component-factored sites (`Cell`, `RawFigure`, `Fact`) must return a
    `DescriptionItem`, not a bare `<div>` with the parts inside, or the parts throw for
    want of the item's context. That is the one shape change a consumption owes beyond
    swapping tags, and the `Composed` story is what it copies.

- ⚠️ **`ImportPreview.tsx:214`'s `aria-live="polite"` is the caller's and stays
  the caller's.** It goes on `<DescriptionList aria-live="polite">`; the family
  neither writes nor strips it, which is the `Live` story. `ImportPreview` is also
  the ONE client component of the eight, so it is the only site where the family's
  lack of a Radix dependency buys nothing - and the only one where it would have
  cost nothing either.
- **What the consumption GAINS**: one refusal in place of the per-site
  `["DT","DD"]` assertion the product would otherwise owe eight times over (it has
  written it once, for the ledger); and the micro-label term stated once instead of five ways.
- **What it does NOT gain, and should not be sold as**: the eight lists are already
  valid `dl`s today. This does not fix a live accessibility defect - the product
  fixed its one - it stops the next one, and it removes four of the five spellings.

### Consumers

Both runs of the scan (`b2e24fd3` in place of `origin/next`, over `packages/**` and
`registry.json`), the script in `$BATCH_SCRATCH/s2/consumer-scan.sh`, in the shape
the DL10 `Form` stream recorded. The shell `grep` here is a ugrep wrapper, so every
arm that becomes a verdict uses `command grep` or `git grep -F`.

**Run 1, before any code** (`consumer-scan.1.txt`): the diff was empty, so scans
1-3 printed nothing; scan 4 is what the run was for - the declared lists and
counters a sixteenth family has to enter, read off the tree rather than off the
brief:

```
AGENTS.md:51 the fifteen part families · README.md:19,24 · packages/ui/package.json:4
packages/ui/test/fidelity.test.tsx:36    Eight of the fifteen part families
packages/ui/test/fidelity.test.tsx:685   expect(slots).toHaveLength(14)
packages/ui/test/registry.test.ts:60     declares the fifteen part families plus the one shared lib
packages/ui/test/registry.test.ts:147    expect(checked).toBe(16)
packages/ui/test/registry.test.ts:215    expect(compared).toBe(17)
packages/ui/test/stories.test.tsx:69     const DECLARED_PLAYS = 48
packages/ui/test/stories.test.tsx:70     const DECLARED_STORIES = 74
packages/ui/test/stories.test.tsx:103    expect(storySuiteNames()).toHaveLength(15)
```

⚠️ **One count in the brief does not reproduce: `registry.json` has 16 items, not 17.** The row says "`registry.json` 17 items"; `node -e 'console.log(require("./registry.json").items.length)'`
prints **16** at `b2e24fd3`. 17 is `registry.test.ts:215`'s `compared`, which counts
FILES - `utils` ships two. The two numbers move together but they are not the same
number, and a stream that trusted 17 would have set the item list one short. After
this slice: **17 items, 18 files, 17 registry dependencies**. Everything else in the
brief's counter list reproduced exactly, including the two line numbers.

**Run 2, at the commit point** (`consumer-scan.2.txt`): **16 exported names** - the
four parts, four Props types, two `cva` functions, and the six story exports. Every
reader of every one of them is inside this slice's own files
(`description-list.tsx`, `index.ts`, `description-list.stories.tsx`,
`description-list-structure.test.tsx`, `tailwind-compile.test.tsx`,
`registry.json`). `Default` collides with a `cva` key in `button.tsx` and with nine
other story files' own `Default`; a story module is its own namespace and a variant
key is not an export, so neither is a consumer. The `LinkedFigure` hit inside
`description-list.tsx` is the docblock naming the story, not a reader.
`Inline` / `Live` / `Prose` / `Composed` / `Default` in `tailwind-compile.test.tsx`
are real readers, by story name, and they are this slice's own new arms.

Scan 2 printed the one new item, its path and its target. Scan 3 named
`source-files.ts`, `story-suites.ts`, `registry.test.ts`, `fidelity.test.tsx`,
`stories.test.tsx`, `tailwind-compile.test.tsx` - all mine and all edited - plus
five files I did NOT touch: `breadcrumb.tsx` and `pagination.tsx`, which name
`fidelity.test.tsx` in their docblocks, and `badge.tsx`, `switch.tsx` and
`breadcrumb.stories.tsx`, which name `tailwind-compile.test.tsx` in theirs
(attributed by re-running the scan's own arm per changed file). They are REVERSE
references - files that point at a test I edited - and both edits are additive: one
docblock word in `fidelity.test.tsx` (`fifteen` -> `sixteen`, no assertion), and a
new describe block appended at the end of `tailwind-compile.test.tsx` with the four
hoisted helpers REUSED and not copied and not one line of the nav, alert or field
arms touched. So none of the four parts is held to anything different. That is
`Alert`'s decision 10 collecting its dividend a third time.

`git diff --stat b2e24fd3...HEAD` is **14 files, +1218 / -10**, and every one of
the fourteen is in the "What shipped" table.

**0 CROSS, 0 UNOWNED**, 16 names NEW between the two runs (the first ran against an
empty diff by construction). The batch's other stream is in a different repository,
and nothing in this one was edited outside this slice's own surface.

⚠️ The blind spot the Switch, `Alert` and `Form` all recorded still applies: scan
3's stem arm looks for `./<stem>"` and `../<stem>"`, so it does NOT see
`import * as descriptionList from "../../stories/description-list.stories.js"`,
which is how `story-suites.ts` reaches a new story file. Scan 4 - the declared
lists - is what covers it, which is why that arm exists.

**The audit cells this slice's decisions touch, for the reconciler's §6 grep.** Two
verdicts and one shipped family, so three lists, all at the thepile base
`f8385c6d` in `docs/design-audit.md`:

- `ToggleGroup` **does not ship**: cells at `:333`, `:340`, `:341`, `:368`, `:376`,
  `:385`.
- `ScrollArea` **does not ship**: cells at `:333`, `:341`, `:343`, `:386`, `:394`,
  `:401`.
- `DescriptionList` **ships**, and no audit cell names it, because the audit's
  answer for these rows was `Table` (refused in DL10) or nothing. The cells whose
  CURRENT text points at the `<dl>` sites, which the shipped family is now the
  answer for, are the three DL10's `Table` table already resolved to "already a
  `<dl>`" - `game/[slug]:757`, `admin/reports:85` and `members/**`'s
  `MemberRow.tsx` - plus the five sites measurement 2 adds
  (`reckoning:201`, `ImportPreview:214`, `transparency:460`, `ScoreBlock:227`,
  `Ledger:223`). ⚠️ Naming the SHIPPED family's cells and not only the refused
  ones is DL10's MED-1: that batch grepped only the refused family and left the
  shipped one's consumers unnamed.

## Layer 1 (reviewer, detached worktree of 41f243a6, slot r6)

**Thirteen findings: 2 HIGH, 6 MED, 4 LOW** (its LOW-4 is four record-hygiene items
counted as one). Its full report is `$BATCH_SCRATCH/r6/report.md`. Its baseline on the
committed head was `pnpm build` exit 0, `pnpm lint` exit 0, `pnpm typecheck` exit 0,
`pnpm exec vitest run` 23 files / 442 tests exit 0 - and it re-read the branch head at
the end of the review (`git rev-parse s/design-lib-d-dl` -> `41f243a6`, **unmoved**), so
every finding is against the head as it stands. The as-built prose below and the gate are,
by construction, unreviewed by it.

**Both HIGHs are accepted and FIXED, and both were real accessibility defects in a family
whose whole stated purpose is to prevent them.** It settled the axe question from
axe-core 4.12.1's own evaluator source rather than from memory, which is why the two are
HIGH rather than arguable.

⚠️ It also found the one thing I most needed found: **two of my own tests asserted
comparisons they never made** (MED-3), and one of them - `does NOT reuse Label's micro
tone` - would have passed unchanged on the day decision 7's premise died. That is the
failure class this repo calls "a guard that cannot fail", in the arm I wrote to defend my
own decision.

### The collapse / no-op mutation table, verbatim

| file                                       | test                                                                         | mutation applied                                                                                     | red / GREEN                                                                                                                                           | what it asserts now                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------ | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stories/description-list.stories.tsx`     | all six plays + `runs all 54 play functions`                                 | `groupsOf` collapsed to `() => []`                                                                   | red (`Test Files 1 failed \| 22 passed (23)`, `Tests 7 failed \| 435 passed (442)`)                                                                   | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `stories/description-list.stories.tsx`     | all six plays                                                                | `expectRoles` collapsed to an empty async fn                                                         | **GREEN** (`Test Files 23 passed (23)`, `Tests 442 passed (442)`)                                                                                     | nothing the rest of the suite does not already observe. `groupsOf` has already thrown unless each group's element children are exactly `DT,DD`, and jsdom derives `term`/`definition` from the tag name alone, so the six role reads are a restatement. The one thing that COULD redden them - an explicit `role=` on the `dt`/`dd` - is a composition the family allows (probe P10, MED-1) and no story or test writes it.                                                            |
| `stories/description-list.stories.tsx`     | all six plays                                                                | `groupsOf`'s "child is not a group" throw made unreachable (its `return` kept)                       | **GREEN** (`Tests 442 passed (442)`)                                                                                                                  | the `dt`/`dd` pairing, the parent identity and the text content of each group. The structural refusal inside the helper cannot fire in this suite: no story composes a non-group child, because the source refuses one.                                                                                                                                                                                                                                                                |
| `stories/description-list.stories.tsx`     | all six plays                                                                | `groupsOf`'s `shape !== "DT,DD"` throw made unreachable                                              | **GREEN** (`Tests 442 passed (442)`)                                                                                                                  | as above; the `DT,DD` shape is pinned by `description-list-structure.test.tsx:55` and by `getByRole`, not by this throw.                                                                                                                                                                                                                                                                                                                                                               |
| `stories/description-list.stories.tsx`     | all six plays                                                                | **every one of the six `play` bodies emptied** (`return;` as the first line), stories and plays kept | **GREEN** (`Test Files 23 passed (23)`, `Tests 442 passed (442)`)                                                                                     | **nothing at all.** `stories.test.tsx` records that `play` was CALLED, not that it asserted anything - its own docblock at `:59-68` says so - so all six plays of a family whose stated deliverable is the content model can be reduced to no-ops with the gate green.                                                                                                                                                                                                                 |
| `stories/description-list.stories.tsx`     | `description-list/Default`                                                   | the `Default` play's body emptied                                                                    | **GREEN** (`Tests 442 passed (442)`)                                                                                                                  | nothing; the single-story form of the row above.                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `test/tailwind-compile.test.tsx`           | the new describe block                                                       | `declaredProperties` collapsed to `() => []`                                                         | red (`Tests 2 failed \| 440 passed (442)`: `declares exactly the properties the term needs`, `…each layout needs`)                                    | **`the detail contributes nothing either: the figure inside it is what varies` stays GREEN** - `expect(declaredProperties(details)).toEqual([])` reads the same from a dead instrument as from an empty part.                                                                                                                                                                                                                                                                          |
| `test/tailwind-compile.test.tsx`           | the new describe block                                                       | `slotTokens` collapsed to `() => []` (shared helper)                                                 | red (`Tests 24 failed \| 418 passed (442)`; 7 of the 8 new arms redden, including the block's own anchor `found the classes to measure…`)             | **the eighth, `the detail contributes nothing either`, stays GREEN** - both of its assertions are `toEqual([])`. The FILE is anchored; that arm is not.                                                                                                                                                                                                                                                                                                                                |
| `test/tailwind-compile.test.tsx`           | the new describe block                                                       | `declaredValues` collapsed to `() => []` (shared helper)                                             | red (`Tests 18 failed \| 424 passed (442)`: `found the classes…`, `the term is the house micro-label`, `the group's two layouts…`)                    | GREEN and observing nothing through this helper: `the list contributes nothing`, `the detail contributes nothing either`, `declares exactly the properties the term needs`, `plain really is empty`, `declares exactly the properties each layout needs`.                                                                                                                                                                                                                              |
| `test/tailwind-compile.test.tsx`           | the new describe block                                                       | `rootVars` collapsed to `() => new Map()` (shared helper)                                            | red (`Tests 10 failed \| 432 passed (442)`: incl. `the term is the house micro-label`, `the group's two layouts are two different resolved drawings`) | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `test/description-list-structure.test.tsx` | `%s throws, naming the parent it needs` (×3)                                 | the `it.each` table emptied                                                                          | **GREEN — and `Tests 439 passed (439)`, three fewer than the baseline's 442**                                                                         | nothing. Three named tests vanish in silence: no counter in this file or anywhere in the gate notices a test case leaving it (`stories.test.tsx`'s two counters count STORIES, `registry.test.ts`'s count ITEMS).                                                                                                                                                                                                                                                                      |
| `test/description-list-structure.test.tsx` | the same three                                                               | `.toThrow(\`<${part}> must be rendered inside a <${parent}>.\`)`weakened to a bare`.toThrow()`       | GREEN (`Tests 442 passed (442)`)                                                                                                                      | **the message IS load-bearing, and I proved it rather than reasoning it.** Paired with `requireContext` made a no-op: with the specific messages, 4 arms redden (`Tests 4 failed \| 18 passed (22)`); with the bare `.toThrow()`, only 3 (`Tests 3 failed \| 19 passed (22)`) - the `DescriptionItem` arm goes green, because `<DescriptionItem>x</DescriptionItem>` then throws the ARITY error instead and a bare matcher accepts it. The test's own comment at `:78-79` is correct. |
| `test/description-list-structure.test.tsx` | `renders, and renders the content model` (the file's stated positive anchor) | the test body emptied                                                                                | GREEN (`Tests 442 passed (442)`)                                                                                                                      | nothing, and that is acceptable: four other arms in the same file (`but a part's OWN children are content`, `allows several terms then several details`, `counts through a fragment`, `does NOT refuse a component child`) render the parts successfully and read the resulting DOM, so the negative arms stay anchored without it.                                                                                                                                                    |
| `test/description-list-structure.test.tsx` | the two `asChild` arms                                                       | the `{ asChild: true }` fixture emptied to `{}`                                                      | red (`Tests 2 failed \| 440 passed (442)`)                                                                                                            | fixture is load-bearing.                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `test/description-list-structure.test.tsx` | `renders, and renders the content model` + `gives every part a data-slot…`   | `valid()` drops its `<DescriptionDetails>`                                                           | red (`Tests 2 failed \| 440 passed (442)`)                                                                                                            | fixture is load-bearing.                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

### And the source-side probes it ran that my M01-M21 did not, verbatim

| mutation to `packages/ui/src/description-list.tsx`                                                        | red / GREEN                                                                                                                                                                              | reading                                                                                                                                                                                                                                                            |
| --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| the DETAIL's element: `<dd` -> `<p` (M15 mutated only the `dt`)                                           | red (`Tests 13 failed \| 429 passed (442)`)                                                                                                                                              | the detail's element identity is covered, by both files and all six plays.                                                                                                                                                                                         |
| the LIST's element: `<dl>…</dl>` -> `<section>…</section>`                                                | red (`Tests 11 failed \| 431 passed (442)`)                                                                                                                                              | covered. ⚠️ My FIRST attempt changed only the opening tag and was a `Transform failed` crash that still printed a `Test Files` line - exactly DL10's miscount. Scored `NO-RUN(crash)` and re-run with the tags matched.                                            |
| the GROUP's element: the item's `<div>…</div>` -> `<span>…</span>`                                        | red (`Tests 9 failed \| 433 passed (442)`)                                                                                                                                               | covered.                                                                                                                                                                                                                                                           |
| `refuseAsChild`'s predicate narrowed to `(props as …).asChild === true`                                   | **GREEN** (only `carries the CURRENT bytes of every source it ships`)                                                                                                                    | nothing pins the predicate's shape.                                                                                                                                                                                                                                |
| `refuseAsChild`'s `!== undefined` clause dropped (`if ("asChild" in props)`)                              | **GREEN** (byte guard only)                                                                                                                                                              | ditto. Only `asChild={true}` is ever tested; `asChild={false}`, `asChild={undefined}` and "present with any other value" are unspecified by the suite. (By render: `asChild={false}` THROWS, `asChild={undefined}` renders and emits no attribute - probes P1/P2.) |
| `elementChildren`'s `if (!isValidElement(child)) continue;` made unreachable                              | **GREEN** (byte guard only)                                                                                                                                                              | **the suite says nothing whatsoever about non-element children.** No test and no story renders a string or number child of a list or an item. This is the instrument-side proof of HIGH-1.                                                                         |
| the term's ink `text-muted` -> `text-primary` (a role the arm's own negative anchor calls NOT a body ink) | red (`Tests 4 failed \| 438 passed (442)`) **but `paints the term in a role the presets measure for contrast` stays GREEN**                                                              | that arm never reads the term. It asserts only facts about `BODY_INK_ROLES` (`length > 2`, contains `muted`, not `primary`, not `brand`). Its name is a claim about `DescriptionTerm` that its instrument cannot see.                                              |
| `label.tsx`'s `micro` tone made byte-identical to `DescriptionTerm`'s micro                               | red (`Tests 2 failed \| 440 passed (442)`: `label.micro` in `fidelity.test.tsx` + the byte guard) **but `does NOT reuse Label's micro tone, and the difference is the ink` stays GREEN** | that arm never imports `labelVariants`. It would pass unchanged on the day `Label`'s micro tone became the same string, i.e. on the day decision 7's premise died.                                                                                                 |
| `{...props}` moved BEFORE `data-slot` on the `dl`                                                         | **GREEN** (byte guard only)                                                                                                                                                              | the spread order is unpinned in either direction (a caller CAN overwrite every `data-slot` - probe P11 - which is the package-wide posture, `card.tsx` etc. all spread last).                                                                                      |
| the item accepts a nested `DescriptionItem` as if it were a term                                          | **GREEN** (byte guard only)                                                                                                                                                              | nothing tests that a nested item inside an item is refused (it is - probe P9 - by the stray-child arm, untested for that input).                                                                                                                                   |
| `terms += 1` -> `terms = 1`                                                                               | **GREEN** (byte guard only)                                                                                                                                                              | not a finding: the counter is only read as zero / non-zero and interpolated into the message, where 1 is still right for the tested case.                                                                                                                          |
| `requireContext` no-op **with** the record's specific messages                                            | red (`Test Files 1 failed (1)`, `Tests 4 failed \| 18 passed (22)`)                                                                                                                      | pairs with the row above to prove the message load-bearing.                                                                                                                                                                                                        |
| **spot-check of the record's own table**: M11 (`cn("grid grid-cols-2", className)` on the `dl`)           | red (`Tests 2 failed \| 440 passed (442)`: `gives every part a data-slot, and the list none of its own classes` + byte guard) - reproduces the record                                    | **but the arm literally named `the list contributes nothing: every class on the dl is the caller's` stays GREEN**, see MED-6.                                                                                                                                      |
| **spot-check**: M12, M14, M06                                                                             | red, each reddening exactly the one arm the record names (`the detail contributes nothing either`; `refuses a bare dt or dd…`; `counts through a fragment…`), 2 failed / 440 each        | 4 of the record's 21 spot-checked, 4 reproduce. I did not re-run the other 17.                                                                                                                                                                                     |

### What was done about each finding

Every one of the thirteen was PROVED by the reviewer with a run. **Eleven are FIXED**
at `99f7a3c3`, two are recorded with the reason. Eleven new guards came with the
fixes and **each was proved by its own reddening mutation** (`L1a`-`L1k`, run against
the committed head `99f7a3c3`, logs in `$BATCH_SCRATCH/s2/mutations/`, input
`mutations-b.json`), taking this slice's mutation count from 21 to **32**. The
structure file goes 22 -> 33 tests and the suite 442 -> **453**.

<!-- prettier-ignore-start -->

| finding | verdict | what changed |
| --- | --- | --- |
| **HIGH-1** a text or number child walks past both guards and produces the `definition-list` violation the family exists to stop | fixed | `elementChildren` became `walkChildren`/`walked`, which surfaces text as well as elements, and BOTH the list and the item now refuse any non-whitespace text node. The item's message names the cause, because the reviewer's concrete case is a React idiom rather than a slip: `{count && <DescriptionDetails>{count}</DescriptionDetails>}` with `count === 0` renders the literal `0`, so the message says "use `{count !== 0 && …}`". Four tests, and whitespace-only is an explicit NEGATIVE anchor (`L1k` reddens it), because JSX emits whitespace and refusing it would make the family unusable. |
| **HIGH-2** neither context is ever reset, so a term or an item nested inside a detail renders a `dt` inside a `dd` | fixed | `DescriptionTerm` and `DescriptionDetails` wrap their children in a `NotInsideAPart` that clears BOTH contexts, so a part reached without a re-provision throws the existing "must be rendered inside a" message. Clearing rather than refusing by element is what keeps the one LEGAL nesting working - a `dd` may hold flow content, so `<dd><dl>…</dl></dd>` is valid and the inner list re-provides both contexts - and that composition is its own test, with the inner `dt`'s parent chain asserted to reach a `dl`, which is what axe's `dlitem` check walks. Four tests. |
| **MED-1** a `role` prop destroys the term/definition association and nothing observes it | fixed, BOTH halves | `role` is refused on the term and the detail, because the reviewer's point is precisely that nothing structural can see it: `role="presentation"` leaves the DOM reading `DT,DD`, so `groupsOf` AND the consuming product's own `["DT","DD"]` assertion both still pass. It is NOT refused on the list (the consuming product puts `aria-live` there) or the item. And the second half: **`expectRoles` is DELETED from the stories rather than kept.** It could not fail - jsdom derives the roles from the tag name and `groupsOf` has already pinned the tags - and with `role` now refused it cannot fail even in principle. The stories' docblock says which half it buys and points at the structure file for the reads that work. |
| **MED-2** `asChild` refused on two of four parts while the docblock, decision 2 and a describe name all said four | fixed | `refuseAsChild` is now called from all four parts. Chosen over narrowing the three sentences because it is four lines and it matches decision 12; the reviewer noted React 19 drops the unknown prop silently, so there was not even a stray attribute to notice. Two tests, two mutations (`L1e`, `L1f`). |
| **MED-3.1** `paints the term in a role the presets measure for contrast` never reads the term | fixed | The ink role is now DERIVED from `descriptionTermVariants({tone:"micro"})` instead of typed as `"muted"`, anchored at exactly one colour utility. `L1h` is the reviewer's own mutation (`text-muted` -> `text-primary`) re-run: the arm now reddens with `expected [ 'var(--primary)' ] to deeply equal [ 'var(--muted)' ]`, where it was GREEN. |
| **MED-3.2** `does NOT reuse Label's micro tone` never imports `labelVariants` | fixed | It imports `labelVariants` and compares the two sets both ways. `L1i` is the reviewer's own mutation (`Label`'s micro made byte-identical) re-run: the arm now reddens with `expected [] to include 'text-muted'`, where it was GREEN. ⚠️ Writing it turned up a fact the record had not stated: the two sets differ by TWO members, not one - the colour AND the tracking, because `labelVariants.micro` still carries the literal `tracking-[0.14em]` where this family uses the named `tracking-label`. The test says so, and `Label` is a CONSUMED behaviour this batch, so it is flagged to the orchestrator rather than edited. |
| **MED-6** the compile arm named "the list contributes nothing" is GREEN under M11 | fixed | It read the `Live` story, whose caller string is `grid grid-cols-2 gap-3`, so `cn` merged the injected `grid grid-cols-2` away. It reads `Prose` (`flex flex-col gap-4`) now, where an injected grid cannot hide. `L1j` is M11 re-run and **both** arms redden. |
| **LOW-2** the list's mixing message names a condition the code does not test, and a component at list level bypasses the guard | fixed, and the LIMIT recorded | The message now says what was CHECKED ("this family draws the `<div>`-wrapper form … and the two forms may not be mixed in one list") rather than inferring that mixing occurred. The bypass is NOT closed and the code says why in a comment: closing it means walking component output, which decision 11 refuses for a stated reason. The reviewer's own probe P15 adds the part that matters - axe cannot see that case either - so the guard protects a rule only a validator catches. Recorded, not chased. |
| **LOW-3** the item refuses script-supporting elements, which the content model permits | fixed | `script` and `template` are skipped in the item's walk. The reviewer's sharper point was that the message claimed an axe `definition-list` failure that does not apply to those two, since axe skips anything not exposed to a screen reader; allowing them makes the message true again. One test, one mutation (`L1g`). |
| **LOW-4.1** the `<dt`/`<dd` count paragraph does not restate its own filter | fixed | It now names the `command grep -v '\.test\.'` filter, and the second docblock mention at `MemberRow.test.tsx:94` that the unfiltered `<dd` count includes. |
| **LOW-4.2** "6 of the 8 terms are `text-muted`" counts `Ledger`'s, which is conditional | fixed | Measurement 3 now says 5 flat plus `Ledger`'s `accent ? "text-accent-ink" : "text-text-muted"` (`Ledger.tsx:158`), which is the muted ink in its default arm. The 6/8 conclusion stands; the shape of the sixth did not. |
| **LOW-4.3** "the link opens at `:206`" - `{href && (` is `:206`, `<Link` is `:207` | fixed | The thepile-inputs bullet now gives `:207`. |
| **MED-4** the six story plays are removable wholesale with the gate green | **recorded, not fixed** - the reviewer's own option (a) | It is `stories.test.tsx:59-68`'s documented hole, not a new mechanism: that file records that `play` was CALLED, not that it asserted anything, and no self-counting mechanism inside a file defends it. Giving `stories.test.tsx` a per-play assertion count is a SHARED-file reshape that every one of the sixteen families would inherit, which is out of a one-family slice's scope and is a REQUEST rather than an edit. What is true and worth saying plainly: **this family's structural coverage rests on `description-list-structure.test.tsx`, not on its plays.** The plays are the workbench and the thing a consumer copies. |
| **MED-5** the refusal enumeration is six in the record, five in the test file, seven in the code | fixed, and the count is now **eight** | The record's list omitted the list's own bare-`dt`/`dd` mixing refusal - the one `M14` proves - and the test file's docblock said five. Both corrected, and the fixes above add two more (text at either level, `role`), so `command grep -c "throw new Error" packages/ui/src/description-list.tsx` is now **nine** throw sites for **eight** refusals by the record's own splitting convention. The thepile-inputs bullet is rewritten against the full predicate, and the reviewer's two extra clauses are in it: refusal (2) also fires on an intrinsic `<dt>`/`<dd>` inside an item, so a half-finished refactor takes the route down; and (3)/(4) are runtime conditions, safe at the product's two conditional sites only because both guards are `!== null` rather than a number - the same edge as HIGH-1. |
| **LOW-1** the `it.each` table can be emptied and three named tests vanish | **recorded, not fixed** | Nothing in this repo counts test CASES (`stories.test.tsx`'s counters count STORIES, `registry.test.ts`'s count ITEMS), and the corpus guard that would catch it (`scripts/test-quality.test.ts`) is in the consuming repo, not here. Recorded so it is not rediscovered; a library-side corpus guard is a REQUEST, not this slice's. |

<!-- prettier-ignore-end -->

**Two probe results the reviewer reported as unpinned, and what I did with each.**
It found `refuseAsChild`'s predicate unpinned in both directions (narrowing it to
`=== true`, or dropping the `!== undefined` clause, both stay GREEN) and established
by render that `asChild={false}` THROWS while `asChild={undefined}` renders. I left
the predicate as it is and did not add a test for it: `asChild` is not in any part's
props type, so TypeScript refuses all three spellings and the throw exists only for
a JavaScript caller, for whom "present at all" is the honest reading of the mistake.
Recorded rather than pinned, because pinning `asChild={false}` throws would be
specifying a case no caller can reach in a typed tree. It also found `{...props}`
spread order unpinned and a `data-slot` therefore overwritable - that is the
package's posture across all sixteen families (`card.tsx`, `breadcrumb.tsx` and the
rest all spread last), so it is not this slice's to change either.

**One number in the record the reviewer could not reproduce, and it stands
unverified by it**: `22 files / 405 tests` at the base `b2e24fd3`. It needs a second
detached worktree plus an install and a build, which it judged not worth the run;
it verified the arithmetic instead (405 + 37 = 442). I measured it myself at the top
of this slice, before touching anything - `pnpm verify` at `b2e24fd3`,
`Test Files 22 passed (22)` / `Tests 405 passed (405)` - and that measurement is a
claim from one run in one worktree, not two.

### Consumers, run 3

After the layer-1 fixes (`consumer-scan.3.txt`, at `99f7a3c3`): **the same 16
exported names**, byte-identical to run 2's list (`diff` of the two scans' name
lists is empty). Everything eleven fixes added is module-private - `walkChildren`,
`walked`, the `Walked` type, `refuseRole` and `NotInsideAPart` all live inside
`description-list.tsx` and none is exported - which is the shape a bug-fix pass
should have. Scan 3's file list is unchanged too. Still **0 CROSS, 0 UNOWNED**.

⚠️ **One NEW cross-family edge the scan structurally cannot see, and it is the fix
for MED-3.2 that created it**: `description-list-structure.test.tsx` now imports
**`labelVariants`** from `label.tsx`, so a change to `Label`'s `micro` tone reddens
an arm titled for the `DescriptionList` family. That is the coupling working as
intended - the arm exists to notice the day decision 7's premise dies - but scan 1
only enumerates what a diff ADDS to the exported surface, and this diff CONSUMES the
name. It is `Form`'s LOW-7 in the same shape (that slice pinned `inputClass` the same
way), and whoever next touches `Label` should read this line rather than hunt a
`DescriptionList` regression. `Label` itself is untouched: `git diff --stat
b2e24fd3...HEAD -- packages/ui/src/label.tsx` is empty.

⚠️ And one REQUEST rather than an edit, found by writing that arm:
`labelVariants.micro` carries the literal `tracking-[0.14em]` where the house has a
`--tracking-label` token at 0.12em, which `Badge` and this family both use by name.
`Label` is a CONSUMED behaviour this batch, so it was not changed; the test states
the two-member difference rather than asserting a one-member one, and the
orchestrator has it.

### The audit cells this slice's three verdicts touch, for the reconciler's §6 grep

All measured at the thepile base `f8385c6d` in `docs/design-audit.md`. Field 4 of a
pipe-split row IS the "should use" column, proved against the header at `:330`
(`route | components used now | should use | why | cost | seen at 390 | seen at 1280`).

| verdict                     | command                             | cells                                                                                                                           |
| --------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `ToggleGroup` does NOT ship | `awk -F'                            | ' '{print $4}' docs/design-audit.md \| command grep -c -w ToggleGroup` -> **6**                                                 | `:333` /backlog · `:340` /browse · `:341` /browse/games · `:368` /studios · `:376` /[username]/[shelf]/[[...view]] · `:385` /[username]/reviews/[[...view]]                                                |
| `ScrollArea` does NOT ship  | the same with `ScrollArea` -> **6** | `:333` /backlog · `:341` /browse/games · `:343` /developers · `:386` /[username]/tier/[slug] · `:394` /home · `:401` /tiers/new |
| `DescriptionList` SHIPS     | `awk -F'                            | ' 'NF>4 && $4 ~ /dl`-shaped family/ {print NR": "$2}'` -> **3**                                                                 | `:344` /game/[slug] · `:353` /members · `:388` /admin/reports - all three already ask for it by description ("… or a later `dl`-shaped family (DL10: no `Table` family ships …)"), so they can now name it |

⚠️ **All TEN of the ToggleGroup / ScrollArea mentions are UNANNOTATED today.** Three
of those cells DO carry a refusal note, but for a DIFFERENT family: `:343` is DL10's
"no `Table` family ships", `:376` and `:386` are DL9's "no `Dialog` family". So no
cell records either of this batch's two decisions yet.

The house practice to copy is already in the file, measured the same way: all **6**
`Dialog` mentions and all **6** `Table` mentions carry their refusal inline, with the
batch that took it. That is what these ten want.

⚠️ And the five `<dl>` sites whose ROUTE cells do not mention the family yet, so the
grep for the SHIPPED family's consumers is not just the three above:
`reckoning:201`, `ImportPreview:214`, `transparency:460`, `ScoreBlock:227`,
`Ledger:223`. Naming the shipped family's cells and not only the refused ones is
DL10's MED-1, where that batch grepped only the refused family and left the shipped
one's consumers unnamed.

### The gate

One run, at `2fe27d71`, in the FOREGROUND (this gate is 13 seconds; the detached
sentinel shape the thepile streams use buys nothing here and slot 2 has no stack to
contend for): `pnpm verify` **exit 0** in 13s (07:26:13 -> 07:26:26 IST, 2026-09-20),
the runner's own lines being `All matched files use Prettier code style!`, both
packages' `typecheck: Done`, `✔ Building registry.`,
`└ Storybook build completed successfully` and
`Test Files 23 passed (23)` / `Tests 453 passed (453)` - from 22 / 405 at the base
`b2e24fd3`, whose own `pnpm verify` was measured green first, before anything was
touched. `git status --short` was empty before and after, so the committed
`packages/ui/r` is exactly what `build:registry` produces.

⚠️ One docs commit follows that run - this section - so the gated tree and the branch
head differ by `docs/as-built.md` alone. `docs/` is read by `prettier --check` and by
no test (`source-files.ts` walks `packages/*/src` and `packages/*/stories` only), and
`pnpm exec prettier --check docs/as-built.md` passes at the head. Unlike DL10 I have
NOT re-run the whole gate for the docs commit, and say so here rather than quote a run
that postdates it.

No push, no publish, no version bump: the freeze holds, and this family rides the
post-freeze `0.1.1` with the Switch, the two navigation families, `Alert` and `Form` -
a SIX-item bump.

### Reconciler closures (batch DL11, layer 2)

Layer 2 (max, both repositories, concurrent with thepile's merged gate) read this record against the
eight sites and the parts. Closed here, by the reconciler: **MED-1**, the consumption checklist's
shots-visible list enumerated by the term's treatment and omitted the item's layout axis (the bullet
above, under "thepile inputs"); **LOW-3**, the source docblock in `description-list.tsx` cited the
`<dl>` lines (`ScoreBlock:227`, `admin/reports:85`) for wrapper classes that live at `:87` in both
files, corrected (a comment, re-gated by the library's `pnpm verify` at the closure head); **LOW-4**,
"two conditional groups" was six, corrected above. **Recorded, not closed** (the next library
stream's first item): **LOW-6**, the list's mixed-content guard refuses only a bare `dt`/`dd` at list
level; an INTRINSIC non-item child (`typeof child.type === "string"`, an `<hr />` or a `<span>`
between groups) is knowably invalid and is exactly what axe's `only-dlitems` reports, so the guard
can widen to every intrinsic element that is not `dt`/`dd`, with a reddening test that renders an
`<hr />` inside a list. Layer 2's HIGH-1 was thepile's (two audit cells for the same `MemberRow`
`<dl>` on the followers/following routes still prescribing a `Separator` inside the list; closed in
thepile's audit).

## LIB-VENDOR-0.1.1: `@marquee-ui/ui` 0.1.1, vendored into thepile by `file:` (2026-09-20)

Batch DL12, stream s1, branch `s/lib-vendor-0.1.1` from `next` @ `cd32dd5`. The whole diff in this
repository is the version line, this block and the README record: **no `src`, no `r/`, no `tokens`**.
The consuming half lives in thepile's `docs/slices/LIB-VENDOR-0.1.1.md`.

### What the bump carries

Six part families shipped here since `ui@0.1.0` (`8ad765011828ad18a2e7ede6060ed5b154a418cd`) and
this is the version that makes them installable:

| item               | family            | landed                   |
| ------------------ | ----------------- | ------------------------ |
| `switch`           | `Switch`          | DESIGN-LIB-d, 2026-09-18 |
| `breadcrumb`       | `Breadcrumb`      | DESIGN-LIB-d, 2026-09-18 |
| `pagination`       | `Pagination`      | DESIGN-LIB-d, 2026-09-18 |
| `alert`            | `Alert`           | DESIGN-LIB-d, 2026-09-19 |
| `form`             | `Form`            | DESIGN-LIB-d, 2026-09-19 |
| `description-list` | `DescriptionList` | DESIGN-LIB-d, 2026-09-20 |

`git diff --stat ui@0.1.0 HEAD -- packages/ui/r` is those six plus the index and nothing else
(`7 files changed, 218 insertions(+)`), so the eleven items `0.1.0` already shipped are
**byte-identical to the tag** - which is what lets thepile's `scripts/marquee-drift.test.ts` keep its
six installed copies untouched across the bump and red only on the item LIST.

**`pnpm -w build:registry` after the bump leaves `packages/ui/r` byte-unchanged** (`git diff --stat
-- packages/ui/r` empty). The built index does not carry the package version, so the version line is
the entire code diff and there is no rebuilt `r/` riding this commit.

**Sixteen part families still.** The index holds 17 items; `utils` is the `cn` helper, not a family.
So `package.json`'s `"sixteen part families"` description is true at this head and was not touched.

### `@marquee-ui/tokens` does NOT bump with it

`git diff --stat tokens@0.1.0 HEAD -- packages/tokens` (`tokens@0.1.0` = `99ea141f`) is one file,
`packages/tokens/test/helpers/source-files.ts`, and that package's `files` is `["dist","fonts","src"]`

- `test/` is not shipped. Nothing a consumer receives has moved, so tokens stays `0.1.0` and thepile
  keeps consuming it from the registry at `^0.1.0`. **One tarball is vendored downstream, not two.**

### The packed tarball, as measured

```
$ pnpm --filter @marquee-ui/ui pack --pack-destination …/thepile-LIB-VENDOR-0.1.1/vendor/marquee-ui/
$ stat -c %s marquee-ui-ui-0.1.1.tgz ; sha256sum marquee-ui-ui-0.1.1.tgz
65840
d7b8989da179703195750bec6a1f21b687c8c1092d90c567f70a6c663ff9609b
```

|                                         | `ui@0.1.0`'s tarball (a3) | this one  |
| --------------------------------------- | ------------------------- | --------- |
| bytes                                   | 22005                     | **65840** |
| `r/` item files (excl. `registry.json`) | 11                        | **17**    |
| `src/` modules (`.ts`/`.tsx`)           | 12                        | **18**    |

`files` was ALREADY `["r","src"]` at `ui@0.1.0` (read from `git show
ui@0.1.0:packages/ui/package.json`), so the tarball's shape did not change and the 22005 → 65840 is
content. It is ~3x for six families on eleven because **every family's bytes are in the tarball
twice**: once as the source module under `src/`, once inlined into its registry item's `content`
string under `r/`. That duplication is by design - a registry item has to be self-contained for
`shadcn add` to write it with no network - and `Form`, `Pagination` and `DescriptionList` are three of
the largest modules in the package. Stated because the number otherwise reads like an accident.

**The packed `package.json`'s `@marquee-ui/tokens` specifier, READ from the tarball rather than
predicted:**

```
$ tar -xzOf marquee-ui-ui-0.1.1.tgz package/package.json | …
version: 0.1.1
devDeps @marquee-ui/tokens: "0.1.0"
```

`workspace:*` was rewritten to the exact `0.1.0`, as expected. ⚠️ Worth being precise about, because
the DL12 composition was not: `packages/ui/package.json:33` names tokens in **`devDependencies`**,
not `dependencies`. A devDependency is never installed for a consumer, so the rewritten specifier
cannot reach thepile's resolution at all; thepile gets `@marquee-ui/tokens` from its own direct
`^0.1.0` dependency. The read is recorded because it was asked for, not because it is load-bearing.

### `prepack`'s stale-registry refusal, proved live again

The same instrument a3 recorded, re-run at this head because a version bump is exactly when a stale
`r/` would ship. Run in a **detached worktree** of the committed bump (`c99b71e`), never in the
branch tree, so the revert is "delete the worktree" rather than a `git checkout --` in a tree
somebody else reads:

| mutation                                                                              | landed                                                          | the red                                                                                                                                                                 |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bg-border` → `bg-border-strong` in `packages/ui/src/separator.tsx`, `r/` not rebuilt | `separator.tsx:24`, confirmed by `grep` before the run was read | `pnpm run prepack` exit **1**, the `git diff --exit-code -- r` output naming `packages/ui/r/separator.json` and carrying `bg-border-strong` inside its `content` string |

So the tarball above cannot be bytes that disagree with `src/`.

### The README consumer lines (DL12 composition (e)): none remains

Ankit's 2026-09-15 call was that a README line addressed to a CONSUMER speaks `npm`/`npx`, not
`pnpm`, because the consumer's package manager is not ours. Re-checked at this head:

```
$ git grep -n pnpm -- README.md 'packages/*/README.md'
README.md:34            "so a story that stops working reddens `pnpm test`"
README.md:66,67,68      pnpm install / pnpm verify / pnpm storybook
README.md:75            "Node 22, pnpm 10.24.0, TypeScript strict…"
packages/tokens/README.md:9   pnpm build     # measures the faces… writes dist/
packages/tokens/README.md:80  "measured 2026-09-14 (`pnpm build` prints it)"
```

Every one of the five is a CONTRIBUTOR line: `README.md:66-75` sit under `## Working in this repo`,
`:34` describes this repo's own Storybook-as-test-suite, and both `packages/tokens/README.md` hits
are about building this package's `dist/`. The two consumer-facing command lines, `README.md:40` and
`:43` under `## Installing a component`, already say `npx`. **Nothing to fix; recorded rather than
edited.**

⚠️ One adjacent finding, NOT fixed here because it is outside this stream's fence (consumer command
lines only) and is the orchestrator's to place: `README.md:61` still says
**"Packages stay `"private": true` until their first publish."** That is now false - `packages/ui`
and `packages/tokens` both dropped `private` at `ed7f34c` and `0.1.0` of each is resolvable from the
registry (thepile's `pnpm-lock.yaml` carries a `sha512` `resolution.integrity` for both, not a
`file:` link). Only the repo root is still `"private": true`. One line, one batch, somebody's fence.
CLOSED by the DL12 reconciler at the merge head: `README.md:61` now says both packages are public since
`0.1.0` and only the root is private (layer 2 LOW-6).

### The two a3 follow-ups this bump does NOT do [V]

- **LOW-2**, `ui`'s `prepack` breaks a git-URL install (`git diff --exit-code` needs a git checkout,
  which an `npm install <git-url>` tarball extraction is not). Recorded, not done: the fix changes
  `packages/ui`'s shipped `package.json`, so it belongs to a bump whose job is that, and doing it
  inside this one would put a behaviour change under a version number whose entire claim is "the six
  items, and nothing else".
- **LOW-3**, the tokens TS entry. Recorded, not done: it would change the shipped bytes of
  `@marquee-ui/tokens`, which deliberately does not bump in this batch.

### The gate

`pnpm verify` at the library head, foreground (the run is seconds and there is no stack to contend
for): **exit 0**, 12s, the runner's own lines being `All matched files use Prettier code style!`,
both packages' `typecheck: Done`, `✔ Building registry.`,
`└  Storybook build completed successfully` and `Test Files  23 passed (23)` /
`Tests  453 passed (453)` - the same 23 / 453 as DL11's closure head, which is the expected
number: this bump adds no source, no story and no test. `git status --short` empty before and after
the run, so the committed `packages/ui/r` is exactly what `build:registry` produces at `0.1.1`.

The run above was re-taken AFTER this section was written, so the gated tree IS the branch head
(this is 13 seconds; there is no reason to quote a run that predates its own record, as DL11 had to).

No push, no `npm publish`, no git tag: the freeze holds. The tag `ui@0.1.1` is the publish's act and
is Ankit's to make; thepile's `vendor/` tarball exists only until he does.

## DESIGN-LIB-d-choice: the choice controls (2026-09-20)

Batch DL13, stream s2, branch `s/design-lib-d-choice` from `next` @ `f5df7fb9`. Three parts, in
the order the brief set them: DL11 layer 2's **LOW-6** first, then the two families MEASURED
before either was built, then what shipped. Nothing was published, nothing was pushed (the
Actions-minutes freeze), no version was bumped, and the consuming repository was read only, at
`50f8a22c`.

### LOW-6: the list's mixed-content guard, widened

Recorded, not closed, by batch DL11's layer 2: `DescriptionList` refused only a bare `dt`/`dd` at
list level, so an INTRINSIC non-item child between the groups - an `<hr />`, a `<span>` of prose -
rendered an invalid `<dl>` in silence.

**The rule is axe's own, read rather than recalled** (`axe-core@4.12.1`,
`node_modules/.pnpm/axe-core@4.12.1/node_modules/axe-core/axe.js:25875-25905`, `onlyDlitemsEvaluate`):
it first flattens every child that is a `DIV` with a null role into that div's OWN children, then
pushes any remaining `nodeType === 1` child that `_isVisibleToScreenReaders` and whose tag is not
`DT`/`DD` (or that carries an explicit role outside `['definition','term','list']`) onto `badNodes`.
`only-dlitems` is impact `serious`, and its own pass message names the allowed set:
`"dl element only has direct children that are allowed inside; <dt>, <dd>, or <div> elements"`.

So the widening is bounded by that evaluator rather than by taste. Refused now: every intrinsic
element at list level except `div`, `script` and `template`. `div` is the content model's other
legal form and is the one axe flattens; `script` and `template` are the "optionally intermixed"
script-supporting elements both forms admit, and axe skips them because neither is exposed to a
screen reader (the same reason `DescriptionItem` already skips them). A COMPONENT child is still
not refused, which is decision 11 unchanged: three product sites factor a group into a component.

Test-first, and the red was run and read before the code moved:

```
 FAIL  |ui| packages/ui/test/description-list-structure.test.tsx > the list refuses the one child
   it can know is wrong > refuses an intrinsic element between the groups, which axe calls only-dlitems
AssertionError: expected [Function] to throw an error
 ❯ packages/ui/test/description-list-structure.test.tsx:255:9
 Test Files  1 failed (1)
      Tests  1 failed | 34 passed (35)
```

Two tests, not one: the refusal (`<hr>`, `<span>`, `<p>`) and the BOUND stated positively - a
hand-written `<div>` wrapper and a `<template>` at list level still render - so the widening cannot
creep into the three shapes axe passes. The suite goes 453 -> 455.

### The RadioGroup measurement, and the answer

**A `RadioGroup` family SHIPS, for the two sites the audit names - and the three sites
it does NOT name cannot take it, for a reason the platform decides rather than this
package.** Everything below was read at the thepile base `50f8a22c`; every command is
quoted so a later stream re-runs it rather than trusts the number.

The audit's count reproduces (`awk -F'|' '{print $4}' docs/design-audit.md | command grep
-c -w RadioGroup` -> **8**; `Checkbox` **6**). Its 8 rows are **two** components: seven
of them name `ReportSheet.tsx:142`'s twelve guideline radios, because `ReportFlag` is
mounted on seven routes (`git grep -n -F '<ReportFlag'` -> **7 lines**: the six route
pages plus `ListProgress.tsx:289`), and the eighth is `/settings/profile`'s face grid.

**First, what the tree actually holds**, non-test, at the base:

| grep (all `| command grep -v '\.test\.'`) | result |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `git grep -n -F 'type="radio"' -- 'apps/web/src/**/*.tsx'` | **1 source line**, `ReportSheet.tsx:142`, rendered 12 times |
| `git grep -n -E 'role="radiogroup"'` | **4 lines in 3 files**: `ReportSheet:107`, `ShelfPicker:85`, `ShelfPicker:105`, `GameActions:427` |
| `git grep -n -E 'role="radio"'` | **3 lines**: `ShelfPicker:92`, `ShelfPicker:116`, `ShelfSlot:30` - all on `<button>` |
| `git grep -n -E 'getByRole\("(radio)"' -- 'e2e/**'` | **~55 lines in 20 spec files**, and **every one of them resolves a ShelfPicker/ShelfSlot BUTTON** |

⚠️ **That last row is the finding the audit's column cannot show.** The product has TWO
single-choice families: one built from native radios (one source line, twelve elements,
zero e2e instruments) and one built from `button[role="radio"][aria-checked]` (three
source lines, three groups, essentially the whole e2e suite). The audit names only the
first. So the invariant was enumerated mechanically rather than site by site, which is
what turned up rows 3-5 below.

**Second, what the platform does, measured rather than recalled** (`$BATCH_SCRATCH/s2/probe/`,
jsdom 30.0.1 + `@testing-library/user-event`, the probe files removed after the run):

| P   | question                                                    | measured                                                                                                                                             |
| --- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | do two radios sharing a `name` exclude each other in jsdom? | yes; `FormData` reads back the checked one's `value`                                                                                                 |
| P2  | is a radio group ONE tab stop?                              | yes - `user.tab()` went `before -> input[value=a] (the CHECKED one) -> after`, skipping the other two, while their `tabIndex` property still reads 0 |
| P3  | do the arrow keys move the selection?                       | yes - `{ArrowDown}` on the checked radio left `{a:false, b:true}` and focus on `b`                                                                   |
| P4  | does clicking an ALREADY-CHECKED radio fire `change`?       | **no** (0 events). The same click on an already-checked CHECKBOX fires **1**                                                                         |

P2 and P3 are why this family needs no roving-tabindex code and no key handler: the two
behaviours Radix's `RadioGroup` implements in React arrive from the shared `name`, and
they are ASSERTABLE here, which the Switch's geometry never was. **P4 is the blocker for
three sites**, below.

**Third, what axe says about the group's shape** (`axe-core@4.12.1`, run under jsdom over
four hand-built shapes plus two controls, `$BATCH_SCRATCH/s2/probe/probe2.mjs`):

- `ul[role="radiogroup"] > li > (a + label > input[type=radio])` - the report sheet's own
  shape - **no violation**; `label`, `aria-allowed-role`, `aria-allowed-attr`,
  `aria-required-attr` and `nested-interactive` all PASS.
- the same with a `div` root and `div` rows - identical result.
- `fieldset > legend + label > input` - no violation (and no ARIA rule applies at all).
- a label holding a visually-hidden radio and an `<img alt="Use the bear face">` - no
  violation; the name comes off the `alt`. **Control**: the same with `alt=""` fires
  `label`, impact **critical**, so the harness can fail.
- ⚠️ **`aria-required-children` never runs on a radiogroup**, including on the negative
  control `div[role="radiogroup"]` holding two plain `<button>`s, where it came back
  `inapplicable` rather than `passes`. The reason is in the source: the rule's matcher is
  `ariaRequiredChildrenMatches` (`axe.js:28338`), which returns `!!requiredOwned(role)`,
  and `requiredOwned` (`:23449`) reads `standards.ariaRoles[role].requiredOwned` from the
  table at `:14353` - where `radiogroup` (`:14706`) declares `type`, `allowedAttrs`,
  `superclassRole` and `accessibleNameRequired: false`, and **no `requiredOwned` at all**.
  So "axe is happy" is not evidence that a radiogroup owns radios, in either direction.
- ⚠️ and the same table says **`accessibleNameRequired: false`** for radiogroup, which is
  why this family's name refusal (decision 3) is deliberately STRICTER than axe.

Row by row, one row per SITE:

| site                                                                             | what it actually is                                                                                                                                                                                                                                                            | wants the part?                                                                                                                                                                         |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ReportSheet.tsx:104-155` (**7 of the 8 audit rows**, 7 routes)                  | `ul[role="radiogroup"][aria-label]` of twelve `li > (Link + label[htmlFor] > input[type=radio][name=groupId] + span)`; the box is `size-4 shrink-0 accent-accent`, the selected state a `border-accent` on the LABEL from React state, both the link and the label `min-h-hit` | **Yes, exactly.** Native radios, one shared `name`, selection committed by a separate Send. The one thing it hand-writes that the part would own: the `useId` name and the group's role |
| `FacePicker.tsx:319-352` (**the 8th row**, `/settings/profile`)                  | `ul[data-testid="face-grid"]` of eight `li > button[type=button][aria-pressed][aria-label="Use the X face"]`, no group role, no roving focus, the selected state `ring-2 ring-accent ring-offset-[3px]` on the 64px `img`, and **each tap is an immediate save**               | **Yes, structurally** - and with two costs this record names rather than hides (below). It is the site the "indicator may be ABSENT" composition exists for                             |
| `ShelfPicker.tsx:85` the Shelf segment (**not an audit row**)                    | `div[role="radiogroup"][aria-label="Shelf"]` of four `button[role="radio"][aria-checked]`                                                                                                                                                                                      | **No.** P4: a re-tap has to be able to CLEAR, and a checked native radio fires no `change`                                                                                              |
| `ShelfPicker.tsx:105` the Outcome pills (**not an audit row**)                   | the same, four pills, and its own comment at `:119-124` states the rule: "Re-tapping the selected one clears it, because the outcome is optional and so has to be un-sayable, and there is no other way back out of a mis-tap"                                                 | **No**, and the source says why before this measurement did                                                                                                                             |
| `GameActions.tsx:427` + `ShelfSlot.tsx:28` the save slots (**not an audit row**) | `div[role="radiogroup"][aria-labelledby]` of four `ShelfSlot` `button[role="radio"]`; `selectShelf` (`:358-384`) sets `clearing = saved.shelf === value` and writes `null`, with a toast and an Undo, and every tap is a server mutation                                       | **No**, twice: the clear, and P3 - arrow-key traversal CHECKS as it moves, so one keypress per slot would be one mutation per slot                                                      |
| `FacePicker.tsx:299-315` the 4-chip style strip                                  | `div[role="group"]` of `aria-pressed` buttons                                                                                                                                                                                                                                  | **Out of scope**: the audit's answer for it is `Tabs`, not this family                                                                                                                  |

So **2 of 6 want the part, 3 cannot have it, 1 is another family's.** And the three that
cannot are not a gap in this family: a set of options that can be emptied by re-tapping
the chosen one is not a radio group in any implementation - `@radix-ui/react-radio-group`
refuses it the same way, because it models the same platform semantics. They are toggles
with a shared exclusivity rule, and they already say so in their own source.

⚠️ **What a FacePicker consumption costs, named now so nobody discovers it later.** (1) The
role changes from `button` to `radio` and `aria-pressed` becomes `checked`, which is 8
assertions in `FacePicker.test.tsx` (`:78`, `:151`, `:157`, `:184`, plus `getByRole("button",
{ name: "Use the X face" })` at `:131`, `:148`, `:184`) and one in
`e2e/profile-edit.spec.ts:167`. (2) P3: because the arrow keys CHECK as they move, and each
selection there is an immediate `onSave`, arrow-keying across the row of eight would write
eight faces in turn. That is the radio pattern's own behaviour (WAI-ARIA APG), not a defect
in this part - but it is a behaviour change at that site, and it is the consumption's call
whether the grid becomes radios or stays buttons. **[V]**

### The Checkbox measurement, and the answer

**A `Checkbox` family SHIPS, and one family serves all seven sites**, because seven of
seven are the same three lines of markup.

The audit's 6 rows are **four components at seven mount points**, and the source count is
lower than both: `git grep -n -F 'type="checkbox"' -- 'apps/web/src/**/*.tsx' | command
grep -v '\.test\.'` prints **6 lines in 5 files**, of which one -
`app/settings/PushSettings.tsx:261` - is the SWITCH's native host and belongs to that
family, not this one. The remaining five lines are `LogForm.tsx:247` (inside `CheckRow`,
mounted three times at `:692` Spoilers, `:719` Played on, `:747` Replay),
`ListForm.tsx:97` Ranked and `:110` Private, `PlayForm.tsx:159` Replay, and
`OnboardingForm.tsx:171` consent. **Five sources, seven rendered rows.**

**The row is BYTE-IDENTICAL at all five, and that is the measurement this family stands
on.** `git grep -n -F 'flex min-h-hit items-center justify-between gap-3 text-sm
text-text'` prints exactly those five lines, each a `<label>`, each holding
`<span className="flex flex-col">LABEL<span className="text-xs text-text-secondary">SUB</span></span>`
and then the box. `OnboardingForm.tsx:150-151`'s own comment names it as a pattern:
"The row is the house checkbox pattern (`components/lists/ListForm.tsx`): a 44px label the
whole width of which is the target."

| site                                            | what it actually is                                                                                                                                                                                                                                                                                                                                               | wants the part?                                                                                                                                                                  |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LogForm.tsx:247` `CheckRow` -> `:692` Spoilers | the house row; controlled (`checked` + `onChange`); box `h-6 w-6 accent-accent`                                                                                                                                                                                                                                                                                   | Yes                                                                                                                                                                              |
| the same `CheckRow` -> `:719` Played on         | the same component, second mount                                                                                                                                                                                                                                                                                                                                  | Yes                                                                                                                                                                              |
| the same `CheckRow` -> `:747` Replay            | the same component, third mount, sublabel swapped by state                                                                                                                                                                                                                                                                                                        | Yes                                                                                                                                                                              |
| `ListForm.tsx:87-102` Ranked                    | the house row, hand-written; controlled                                                                                                                                                                                                                                                                                                                           | Yes                                                                                                                                                                              |
| `ListForm.tsx:104-115` Private                  | the same, hand-written a second time in one file                                                                                                                                                                                                                                                                                                                  | Yes                                                                                                                                                                              |
| `PlayForm.tsx:153-164` Replay                   | the same, hand-written a third time in a third file                                                                                                                                                                                                                                                                                                               | Yes                                                                                                                                                                              |
| `OnboardingForm.tsx:153-188` consent            | the house row, and the box is the HOUSE box: `peer h-6 w-6 appearance-none rounded-sm border-2 border-line-strong bg-surface checked:border-accent checked:bg-accent` with a SIBLING `<svg data-testid="consent-tick">` at `stroke-on-accent opacity-0 peer-checked:opacity-100`, in a `span.relative.grid.place-items-center`; uncontrolled, no `defaultChecked` | **Yes, and it is the DERIVATION**: MOBILE-3 item 2 replaced the browser's box here deliberately, and its comment says why the tick is a sibling element and never `input::after` |

So the drawing has a direction rather than a majority: six rows draw the browser's box
themed with `accent-color`, one draws the house box, and the one is the NEWEST and was a
deliberate design fix whose comment calls the browser box the defect. The family draws the
house box, and a consumption changes the other six visibly (recorded under "thepile inputs").

**Does `Form`'s field family already compose this row? No, and the reason is structural
rather than stylistic.** Read at this package's own `form.tsx`: `FormItem` renders a
`<div className="flex flex-col gap-1 text-sm">`, `FormLabel` writes `htmlFor={controlId}`
unconditionally, and `FormItem` throws unless it holds exactly one `FormControl`. The
checkbox row is a `<label>` that WRAPS its control, is a ROW rather than a stack, and
distributes with `justify-between`. Putting it in a `FormItem` would mean the label stops
wrapping the input - and the wrapping is the whole point, because it is what makes the
44px row the tap target rather than the 24px box. So this family owns the row, exactly as
`Switch` owns its own row, and `Form` stays the family for a stacked label-over-control
field. Nothing composes them today and nothing needs to.

### What shipped

| file                                                          | what                                                                                                                                                                                       |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/ui/src/checkbox.tsx`                                | four parts - `Checkbox`, `CheckboxInput`, `CheckboxBox`, `CheckboxIndicator`. No `cva`, no `asChild`, no context, no dependency at all (7,269 B installed)                                 |
| `packages/ui/src/radio-group.tsx`                             | five parts - `RadioGroup`, `RadioGroupItem`, `RadioGroupInput`, `RadioGroupCircle`, `RadioGroupIndicator`. One context (the shared `name`), `asChild` on the group only (9,722 B)          |
| `packages/ui/stories/checkbox.stories.tsx`                    | 7 stories, 5 with a `play`                                                                                                                                                                 |
| `packages/ui/stories/radio-group.stories.tsx`                 | 7 stories, 6 with a `play` - including the two the platform gives free: one tab stop per group, and the arrow keys moving the checked radio                                                |
| `packages/ui/test/choice-structure.test.tsx`                  | 17 tests after layer 1: the refusals, the generated group name, the empty-name and role refusals, and the mark that REPLACES rather than joins                                             |
| `packages/ui/test/choice-drawing.test.tsx`                    | 11 tests after layer 1: the geometry in resolved pixels, the overlay's COVERING, the selectors the triggers produce, and the cascade                                                       |
| `packages/ui/test/helpers/compiled-sheet.ts`                  | the compiled-stylesheet instrument as a MODULE rather than a third hand-copy (decision 12)                                                                                                 |
| `packages/ui/test/entry-point.test.ts`                        | layer 1's HIGH-2, closed for all eighteen families: the package's `exports["."]` barrel read against the part files on disk                                                                |
| `registry.json` + `packages/ui/r/{checkbox,radio-group}.json` | two items, targets `components/ui/checkbox.tsx` and `components/ui/radio-group.tsx`; one npm dep between them (`@radix-ui/react-slot`, already here)                                       |
| `packages/ui/src/description-list.tsx`                        | LOW-6's widened guard and its docblock, and nothing else                                                                                                                                   |
| the declared lists                                            | both lists in `packages/tokens/test/helpers/source-files.ts`, `story-suites.ts`, `stories.test.tsx`'s two counts and its suite length, `registry.test.ts`'s item list and its two counters |
| the stated count                                              | `AGENTS.md`, `README.md`, `packages/ui/package.json` and `fidelity.test.tsx`'s docblock say eighteen part families                                                                         |

`pnpm test` goes from **23 files / 453 tests** at the base `f5df7fb9` (measured green
first, and only after `pnpm build` - without the tokens' `dist` the base is 5 files red,
which is the environment and not the tree) to **25 / 494** at the reviewed head, and to
**26 / 504** after the layer-1 fixes. Each part measured by running the file alone:
**+4** in `description-list-structure.test.tsx` (2 for LOW-6, 2 more at layer 1), **+16**
in `stories.test.tsx` (14 story renders plus the two new suites' `has stories`), **+11**
in the new `choice-drawing.test.tsx`, **+17** in the new `choice-structure.test.tsx` and
**+3** in the new `entry-point.test.ts`.

`fidelity.test.tsx:685`'s `toHaveLength(14)` and `:326`'s `toBe(20)` are deliberately NOT
moved: those are the slots and the strings LIFTED out of the consuming product, and a
derived family is not fidelity-asserted (`Alert`'s closure, `Form`'s, `DescriptionList`'s).
Its docblock's "Eight of the eighteen" IS moved, because that is a live ratio.

### Measurements, and what they corrected

The two family tables above are the measurement. What follows is what the WORK
corrected, in the order it was found.

**1. The brief's counter list reproduces except in one place, and the exception is the
same one DL11 recorded.** `registry.json` holds **17** items at the base, not "seventeen
items in eighteen files" read as one number: 17 items, 18 files (`utils` ships two), which
is `registry.test.ts:215`'s `compared`. After this slice: **19 items, 20 files, 19 registry
dependencies**. `DECLARED_PLAYS` 54 -> **65**, `DECLARED_STORIES` 80 -> **94**,
`storySuiteNames()` 16 -> **18**.

**2. A bare `group` cannot appear in a story, and it cost the first draft of one.**
`TwoInAGroup` wrapped two rows in a `.group` box to show that the named trigger does not
leak - and `tailwind-compile.test.tsx`'s `compiles every one of them` went red with
`["group"]`: a marker class emits no rule, so the guard that every rendered class exists in
the sheet is exactly right to refuse it. The story is `TwoRows` now and says so, and the
scoping is asserted where it can be SEEN - on the selector, `.group\/checkbox` (M16).

**3. jsdom drops a `border-color` whose value is an unresolved `var()`, and it nearly
bought a vacuous assertion.** Measured while writing the NoDrawing arm: with the compiled
sheet in the document, `border-top-color` reads `rgb(255, 255, 255)` on BOTH the checked
and the unchecked tile, because `border-primary` emits the `border-color` SHORTHAND.
`background-color` and Tailwind's own `--tw-ring-color` are longhand/custom properties and
survive. So that arm reads the ring's custom property, and the `.not.toBe` between the two
tiles is what would have caught it either way. The Switch's file already only ever read
`background-color` and `--tw-translate-x`; now the reason is written down.

**4. A read resolved by POSITION measured the wrong row, and the test said the part was
broken.** The radio cascade arm took `container.querySelector('[data-slot="radio-group-circle"]')`
and the `Chosen` story checks its SECOND option, so the read was of an unchecked circle
and the red claimed the fill never arrives. It resolves by identity now
(`container.querySelector("input:checked")`, then that row's drawing), which is the
repository's own rule in the one place a radio group makes it easy to break.

**5. What jsdom CAN observe about a radio group, which decided what the plays assert.**
P1-P4 in the RadioGroup measurement above. Two of them are the reason this family needs no
code: `user.tab()` enters a three-radio group at the checked radio and leaves after ONE
stop, and `{ArrowDown}` moves the checked radio. Both are asserted in the `Keyboard`
story's play - unlike the Switch's 20px of travel, which jsdom cannot see at all.

**6. The packed tarball is 78,083 B, and it is NOT the `0.1.1` thepile vendors.** The
version line stays `0.1.1` per the brief, so `next` now carries an unreleased tree whose
version string equals a published-and-vendored one. Nothing in this repository can notice
that; the consuming repo's `vendor/` tarball is fixed bytes and its drift test pins the
CONSUMED set, so nothing is broken today. It is recorded as decision 13 because the next
person to pack from `next` gets different bytes under the same number.

### Guards, each proved by running its reddening mutation

**26 mutation runs**, one per guard, all against the COMMITTED head `b2e2fb1c` in a
DETACHED worktree (`../mutate-choice`), never in the working tree. Each was asserted to
have LANDED before the run was read (the new text present AND the old text gone, or the
runner refuses to read it), each reverted with `git checkout -- .` with `git status
--short` asserted empty before and after. Runner `$BATCH_SCRATCH/s2/mutate.py`, input
`mutations.json`, logs in `$BATCH_SCRATCH/s2/mutations/`. A red counts only when the
output contains a `Test Files` line - i.e. that a run happened at all (DL10's correction,
carried forward).

⚠️ Read one thing into every SOURCE row: it ALSO reddens `carries the CURRENT bytes of
every source it ships`, because `packages/ui/r` is not rebuilt inside the mutation. That
is the registry guard doing its job; the tables below list the reds that NAME the mutated
property.

<!-- prettier-ignore-start -->

| # | guard | mutation | landed in | the red it produced |
| --- | --- | --- | --- | --- |
| M01 | LOW-6: the list refuses every other intrinsic element | the new `if` made unreachable | `description-list.tsx` | `refuses an intrinsic element between the groups, which axe calls only-dlitems` (2 failed / 494) |
| M02 | LOW-6's BOUND: a `div` wrapper stays legal | `"div"` removed from `LIST_LEVEL_INTRINSICS` | `description-list.tsx` | `leaves the OTHER legal shapes alone: a div wrapper, and the script-supporting pair` |
| M03 | `Checkbox` refuses `asChild` | `refuseAsChild`'s test made unreachable | `checkbox.tsx` | `Checkbox refuses it, naming the element and the reason` |
| M04 | `RadioGroupItem` refuses `asChild` | the same, in the other file | `radio-group.tsx` | `RadioGroupItem refuses it too` |
| M05 | the group refuses to render unnamed | the name check made unreachable | `radio-group.tsx` | `refuses to render without one, which is stricter than axe on purpose` |
| M06 | the name may sit on an `asChild` CHILD | `if (!asChild) return false` -> `return false` | `radio-group.tsx` | FIVE, incl. `takes it from aria-label, from aria-labelledby, or from an asChild child`, `but the GROUP takes it…`, the `AsAList` play and the play counter (5 failed / 484) |
| M07 | each group generates its OWN name | `name ?? generated` -> `name ?? "radio"` | `radio-group.tsx` | `gives TWO groups on one page two different names, which is what keeps them apart` |
| M08 | the input refuses a `name` of its own | the check made unreachable | `radio-group.tsx` | `refuses a name on the INPUT, which would split one group in two` |
| M09 | a radio outside its group throws | the context check made unreachable | `radio-group.tsx` | `throws outside a group rather than rendering an ungrouped radio` |
| M10 | a caller's mark REPLACES the house tick | `{children ?? <path/>}` -> both rendered | `checkbox.tsx` | THREE: `draws the house tick, and only the caller's mark when there is one`, the `CustomMark` play and the play counter |
| M11 | the part IS a native checkbox | `type="checkbox"` -> `type="text"` | `checkbox.tsx` | NINE, incl. all five checkbox plays by their own names (`checkbox/Default`, `/Disabled`, `/InAForm`, `/CustomMark`, `/TwoRows`) - the cheap check that the plays observe the ELEMENT and not a class (9 failed / 485) |
| M12 | the tap floor is on the INPUT | `min-h-hit` dropped from the overlay | `checkbox.tsx` | THREE: `measures every one of them at or above the floor` (the package's own floor guard), `puts the tap floor on the INPUT, which is why the box may be 24px`, and `gives both families the SAME overlay input` |
| M13 | the drawn box is 24px | `size-6` -> `size-5` | `checkbox.tsx` | TWO, incl. `puts the tap floor on the INPUT…` |
| M14 | one control in two shapes: the RADIUS is the only difference | `rounded-sm` -> `rounded-full` on the box | `checkbox.tsx` | `draws one control in two shapes: the same box, at a different radius` |
| M15 | the mark follows `:checked`, not hover | `group-has-checked/checkbox:` -> `group-hover/checkbox:` | `checkbox.tsx` | TWO: `leaves the checkbox's mark unpainted…` and `reaches the drawing through a :checked descendant of the row` |
| M16 | the trigger is scoped to its OWN named group | `group-has-checked/checkbox:` -> the UNNAMED `group-has-checked:` | `checkbox.tsx` | THREE, incl. `reaches the drawing through a :checked descendant of the row, in both families` - the only place the scoping can be seen |
| M17 | the mark's ink is the one the fill guarantees | `stroke-primary-foreground` -> `stroke-primary` | `checkbox.tsx` | `paints the mark in the ink the fill guarantees` |
| M18 | the dot's ink, likewise | `bg-primary-foreground` -> `bg-primary` | `radio-group.tsx` | the same arm, from the other family |
| M19 | the focus ring is on the ROW, for a DESCENDANT | `has-focus-visible:` -> `focus-visible:` | `radio-group.tsx` | `puts the focus ring and the disabled dimming on the ROW, not on the box` |
| M20 | the dot is unpainted while the radio is off | `opacity-0` dropped | `radio-group.tsx` | `does the same for the radio, from the same trigger` |
| M21 | both families share ONE overlay string | `inset-0` -> `inset-1` in one of them | `radio-group.tsx` | `gives both families the SAME overlay input, by declaration and not by name` |
| M22 | a caller's own drawing is lit by the row's group | the `NoDrawing` tile's ring classes deleted | `radio-group.stories.tsx` | `lights a CALLER's own drawing when the item composes no circle at all` |
| M23 | a source cannot leave the declared walk | `packages/ui/src/checkbox.tsx` deleted from `PUBLISHED_SOURCE_FILES` | `source-files.ts` | THREE in the tokens' published-source coverage, incl. `walks exactly the published set, by path` |
| M24 | a part cannot leave the shared suites map | `checkbox` deleted from `STORY_SUITES` | `story-suites.ts` | TWO: `covers all eighteen part families…` and the play counter |
| M25 | the registry's item list is exact | `"radio-group"` deleted from the list | `registry.test.ts` | `declares the eighteen part families plus the one shared lib` |
| M26 | a story cannot stop being one | `export const Keyboard` -> `const Keyboard` | `radio-group.stories.tsx` | TWO: the story counter and the play counter |

<!-- prettier-ignore-end -->

**26 red, 0 GREEN, 0 no-run.** Three of them are worth more than a row. M11 is the check
that the plays observe the ELEMENT rather than a class: turning the input into a text
field reddens every one of the five checkbox plays by name. M16 is the only instrument in
either repository that can see the difference between `group-has-checked/checkbox:` and
`group-has-checked:` - the named and unnamed forms render identically and differ only in
which boxes some OTHER `.group` can light up. And M02 exists because a widened guard needs
its BOUND proved as well as its reach: without that row, "refuses every intrinsic element"
could have quietly grown to refuse the `div` the content model is built out of.

### The pipeline, end to end

`pnpm pack` in both packages (`prepack` is `pnpm -w build:registry && git diff
--exit-code -- r`, so packing at all is the evidence that `r/` is committed and current)
-> `marquee-ui-ui-0.1.1.tgz` **78,083 B** (65,759 at `DescriptionList`'s 0.1.0) and
`marquee-ui-tokens-0.1.0.tgz` 99,608 B, unchanged -> `npm install` of both into a bare
project (`package.json`, a `tsconfig.json` whose `@/*` is `./src/*`, an `app.css`, and a
`components.json` whose `registries` map points at `./node_modules/@marquee-ui/ui/r/{name}.json`
and whose `aliases.utils` is `@/lib/utils`, which DL11 measured to be the load-bearing
spelling) -> `shadcn add` of both items in one command:

```
✔ Created 3 files:
  - src/lib/utils.ts
  - src/components/ui/checkbox.tsx
  - src/components/ui/radio-group.tsx
```

```
checkbox: installed bytes 7269, target components/ui/checkbox.tsx
  installed === r/checkbox.json content === packages/ui/src/checkbox.tsx: True
                                                    sha256 0ebbc670d93a (all three)
radio-group: installed bytes 9722, target components/ui/radio-group.tsx
  installed === r/radio-group.json content === packages/ui/src/radio-group.tsx: True
                                                    sha256 edba63243613 (all three)
utils: installed bytes 1649, target lib/utils.ts   sha256 78a6fb4e43d8 (all three)
packed r/registry.json === repo registry.json: True  (19 items)
npm deps that landed: @radix-ui/react-slot@^1.3.3, clsx@^2.1.1, tailwind-merge@^3.7.0
```

Three files, not four: `checkbox` declares no npm dependency at all (it is the second
family after `Card` with none), and `radio-group` asks only for the `Slot` that `asChild`
on the group needs.

Then the INSTALLED copies compiled in the bare project's own Tailwind 4 against the
published `@marquee-ui/tokens/tokens.css`, `@source "./src/components"`:

```
min-h-hit                              min-height: var(--hit-min)          --hit-min          44px
size-6                                 width/height: calc(var(--spacing) * 6)
rounded-sm                             border-radius: var(--radius-sm)     --radius-sm        6px
rounded-full                           border-radius: var(--radius-full)
border-border-strong                   border-color: var(--border-strong)  --border-strong    var(--mq-olive-800)
bg-surface                             background-color: var(--surface)    --surface          var(--mq-olive-925)
stroke-primary-foreground              stroke: var(--primary-foreground)   --primary-foreground var(--mq-olive-950)
bg-primary-foreground                  background-color: var(--primary-foreground)
group-has-checked/checkbox:bg-primary  background-color: var(--primary)    --primary          var(--mq-lime-500)
group-has-checked/radio:opacity-100    opacity: 100%
has-focus-visible:shadow-focus-ring    --tw-shadow: var(--shadow-focus-ring)
has-disabled:opacity-50                opacity: 50%
text-not-a-role                        (ABSENT)
border-4                               (ABSENT)
```

Every utility resolves to the ROLE's own variable in the consumer rather than to a copy of
its value, both named state triggers compile under their own group names, and the two
negative controls are absent.

⚠️ One number to carry: `--radius-sm` is **6px** in this preset, not Tailwind's default
`0.125rem`. `choice-drawing.test.tsx` asserts the square's corner through `lengthPx`
rather than by spelling a value, which is why it did not have to know that - and the first
draft, which DID spell `"0.125rem"`, was red the moment it ran.

### Decisions

1. **Both families ship, and the audit's eight `RadioGroup` rows are TWO sites.** [V]
   Seven of the eight are one component mounted on seven routes. The two that want the
   part are the report sheet (twelve native radios) and the face grid; the rest of the
   product's single-choice controls are decision 2.
2. **Three sites are refused, and the platform decides it rather than this package.** [V]
   `ShelfPicker`'s two groups and `GameActions`' save slots are `button[role="radio"]`
   sets whose re-tap CLEARS the choice, and P4 measured that a click on an already-checked
   native radio fires no `change` event at all. `@radix-ui/react-radio-group` would refuse
   them for the same reason, because it models the same semantics. They are not a gap in
   this family and they are not this slice's to change.
3. **The input is an invisible 44px overlay on the row, and the drawing is a separate
   element.** [V] `Switch`'s decision 4, applied twice. The alternative - the input drawn
   as the box, which is what the product does - is a 24px control, and this package's own
   floor guard renders every story and measures every `input`, so the overlay is the only
   shape in which the floor is a fact rather than a hope about label click-forwarding.
4. **So the radio circle is DRAWN, although the product has no drawn radio anywhere.** [V]
   This is the one place the derivation ran out, and it is a consequence of decision 3
   rather than a preference: an invisible input cannot also be the browser's circle. The
   drawing is taken from the one house control the product does draw - `OnboardingForm`'s
   checkbox box - so the consumption of `ReportSheet` replaces twelve browser circles with
   twelve house ones. That sheet is closed in every shot, so nothing filmed moves.
5. **The circle IS the box, at a different radius, and that is an assertion.** [V]
   `choice-drawing.test.tsx` strips the `border-radius` declaration from both class lists
   and requires the remainder to be EQUAL. A house that draws its two choice controls
   differently by accident reddens; a house that changes both together does not.
6. **No `cva` in either family.** [V] `cva` is for visual axes, state is never one, and
   neither family has an axis with a second value. The composition a `variant` would have
   been - an option with no drawing at all - is made by composing no `RadioGroupCircle`,
   which is AGENTS.md rule 1 exactly.
7. **No `asChild` on either ROW, and `asChild` on the GROUP.** [V] The row must be a
   `<label>` wrapping its input: that is what names the control with no `id` to keep in
   sync and what makes the whole 44px row the target, so `asChild` there is refused with a
   message rather than dropped silently (React 19 drops an unknown prop without a trace).
   The group has no such constraint and two real sites draw their options as a `<ul>` with
   tests that resolve the `<li>`s, so it takes a `Slot`.
8. **The group owns the shared `name`, generated with `useId` when the caller has none.**
   [V] This is the reason `RadioGroup` is a part at all rather than a `div` with a role: a
   radio with no shared name is not in a group, and twelve of them are twelve independent
   controls that can all be checked at once. `RadioGroupInput` refuses a `name` of its own
   (`FormControl`'s precedent) and throws outside a group.
9. **The group refuses to render without an accessible name, deliberately stricter than
   axe.** [V] `axe-core@4.12.1` has `accessibleNameRequired: false` for the role and does
   not run `aria-required-children` on it at all, so no automated check in either
   repository would catch an unnamed radiogroup. All four in the consuming product name
   themselves; this makes the fifth impossible to forget. The refusal reads the caller's
   props AND, under `asChild`, the child's - which is the arm M06 proves.
10. **The house box, not the browser's, at all seven checkbox sites.** [V] Six of the
    seven draw `accent-color` on the UA box today and one draws the house box; the one is
    the newest and MOBILE-3's own comment calls the browser box the defect it fixed. So
    the direction is the derivation, and a consumption changes six rows visibly. There is
    no `native` variant: an axis whose second value is the thing the house decided against
    is a defect with a prop attached.
11. **The INPUT throws outside its row in both families; the DRAWING parts do not.** [V]
    ⚠️ Rewritten at layer 1 (LOW-2), because the first version drew the line between the
    two families and the line is not there. An orphan `CheckboxBox` or `SwitchTrack` is
    visible on the first click - it never lights up, in the story, in the workbench, in
    review - so it is left alone, which is `Switch`'s posture. An orphan `CheckboxInput`
    is the other kind, and it is the kind `Form` and `DescriptionList` throw for: an
    `absolute inset-0 opacity-0` control with no accessible name, absorbing taps over
    whichever ancestor happens to be positioned. Both inputs throw now;
    `RadioGroupInput`'s also carries the group's `name`, which is a second reason.
12. **The compiled-sheet instrument became a MODULE, and the other two copies are a
    REQUEST rather than an edit.** `switch-drawing.test.tsx` and
    `tailwind-compile.test.tsx` each carry their own copy of the same forty lines; a third
    would be the defect this package already paid for once (the story-suites map, layer 1
    of the Switch, MED-2). This slice's fence names the test files it may write and those
    two are not among them, so the new file uses the module and the other two are left
    exactly as they are. **REQUEST to the orchestrator: one later stream moves both onto
    `test/helpers/compiled-sheet.ts`**, which is a mechanical extraction that the Switch's
    fourteen assertions prove. ⚠️ One thing that stream must not re-derive (layer 1,
    LOW-3): `tailwind-compile.test.tsx`'s copy resolves BOTH `calc()` operand orders where
    the first edition of the module resolved one. The module resolves both now and the
    anchor test reads both back, so the move cannot silently narrow it.
13. **No version bump, and the packed `0.1.1` is NOT the `0.1.1` thepile vendors.** [V]
    The version line is untouched per the brief; this pack is 78,083 B against the vendored
    tarball's fixed bytes. Nothing breaks today - the consuming repo pins a tarball and its
    drift test pins the CONSUMED set - but `next` now holds an unreleased tree whose version
    string is already published, so the next bump should go straight to `0.1.2` and carry
    both of these with the six already waiting.
14. **The stated count moved where the package DESCRIBES itself** (`AGENTS.md`,
    `README.md`, `packages/ui/package.json`, and `fidelity.test.tsx`'s ratio) and NOT in
    `fidelity.test.tsx`'s two assertions, which count the slots and the strings LIFTED out
    of the product. A derived family does not move them: `Alert`'s closure, `Form`'s and
    `DescriptionList`'s, all three standing.

### thepile inputs

What the consumption half needs when these two publish (decision 13: with the next bump,
`0.1.2`). Nothing here was done - the consuming repo was READ ONLY, at `50f8a22c` - and
every bullet was checked against that tree with `git show` / `git grep` before it was
written, with the command beside any count.

**Before any of it, the role-string scan** (layer 2 MED-3; thepile's `stream.md` §3 carries it as
scan 4 since DL13): every part here computes a role, and a spec or test that resolves a control by
`getByRole("<role>")` or `[role="<role>"]` consumes the role a swap adds, removes or DISPLACES,
which no symbol, path or route scan can see. Per implicit role a site loses and per role a part
writes: `git grep -n 'getByRole("<role>"' -- e2e apps packages` and
`git grep -n '\[role="<role>"\]' -- e2e apps packages`. The computed roles, stated because the
package answers the question both ways: `CheckboxInput` is `input[type="checkbox"]` and writes NO
role (implicit `checkbox`, unchanged from every site it replaces); `RadioGroupInput` is
`input[type="radio"]` and writes NO role (implicit `radio`; the face grid's `button` becomes
`radio`, the [V] below); `RadioGroup` writes `role="radiogroup"`; `SwitchInput`, by contrast,
writes `role="switch"` over a checkbox, which is what broke `e2e/push.spec.ts`'s four `checkbox`
locators in DL13.

**Both families, once.** `checkbox` and `radio-group` go into `CONSUMED` in
`scripts/marquee-drift.test.ts`, and the two files arrive by `shadcn add`. ⚠️ That test pins
THREE things, and this paragraph is restated at thepile's DL13 merge head `5e4d961b` (layer 2
HIGH-1: the first edition described the test at `50f8a22c`, which the sibling stream rewrote
the same batch): `CONSUMED` (`:56`) is SEVEN names, `switch` included, and the consumption
makes it nine; the exact complement (`:123`) is TEN names, `accordion, alert, badge, breadcrumb,
card, description-list, form, pagination, separator, utils`, and it does NOT move at the bump
(nineteen index items minus nine consumed is the same ten), so editing it is what reddens the
arm; and the arm at `:210-240` pins a PER-ITEM map of each consumed item's declared runtime
dependencies (`byItem`, DL12 layer 2 MED-4's fix), which gains `checkbox: []` and
`radio-group: ["@radix-ui/react-slot"]` with no `apps/web/package.json` edit, because `:20`
already declares the slot. The bump and those two edits are ONE commit, or the `CONSUMED` arm
is red between them. ⚠️ `shadcn add` also writes `lib/utils.ts`, and thepile's copy is a
DECLARED EXCLUSION whose `cn` is a plain join on purpose, so `git checkout --
apps/web/src/lib/utils.ts` after the add.

⚠️ **And the plain join is the trap that bit the Switch, in the same place.** The part's
row is `inline-flex`; every one of the seven product rows is `flex ... justify-between`.
thepile's `cn` does not merge, so both land and the stylesheet's later rule (`inline-flex`)
wins - which shrinks the label to fit and leaves `justify-between` nothing to distribute.
~~**Every consuming row passes `w-full`** (DL7 layer 2, MED-3, proved on the Switch).~~
⚠️ **STRUCK (DL18 layer 2, LOW-5): `w-full` is needed only where the row is NOT a flex item,
and measured inert twice where it is.** The shrink above is real on the Switch's DL7 sites,
where the row sits in ordinary block flow and `inline-flex` sizes it to its content - that is
the case the rule was proved on, and it still holds there. But a row that is itself a FLEX
ITEM has its outer display blockified by its parent (`inline-flex` computes to `flex`) and its
width set by the parent's layout, so `w-full` adds nothing: DL17's onboarding consent row read
**358 / 358 px** with and without it, and DL18's report-sheet radio row **310 / 310 px**
(both measured by the consuming streams on built pages, relayed here, not re-measured by this
block). So: a row that is a flex item needs nothing; a row that is not one passes `w-full`.

**Checkbox, site by site.** All seven keep their own row classes through `className`;
`min-h-hit`, the named group, the focus ring and the disabled treatment come from the part
and should be deleted from the row's own string.

- `components/log/LogForm.tsx:241-253` (`CheckRow`, three mounts at `:692`, `:719`, `:747`):
  the `<label>` becomes `<Checkbox className="w-full justify-between text-sm text-text">`,
  the `<input>` becomes `<CheckboxInput checked={checked} onChange={…} />`, and
  `<CheckboxBox><CheckboxIndicator/></CheckboxBox>` replaces the bare box. One edit, three
  rows.
- `components/lists/ListForm.tsx:87-102` and `:104-115`: the same, twice, hand-written.
- `components/play/PlayForm.tsx:153-164`: the same, a third file.
- `app/onboarding/OnboardingForm.tsx:153-188`: the same, and it LOSES the most code - the
  `span.relative.grid.place-items-center`, the hand-drawn `appearance-none` box and the
  sibling svg are all the part now. ⚠️ **Keep `data-testid="consent-tick"` on
  `<CheckboxIndicator>`**: it spreads props, and `e2e/mobile-390.spec.ts` resolves the tick
  by that id (`git grep -l consent-tick` -> `OnboardingForm.tsx`, `e2e/mobile-390.spec.ts`).
  ⚠️ And the input stays UNCONTROLLED with no `defaultChecked`: the file's own comment says
  opt-in means the ABSENCE of a tick is the answer, and the action reads `=== "on"`.
- **The instruments that must stay green**, all read at the base:
  `components/lists/ListForm.test.tsx` (`getByRole("checkbox", { name: /ranked|private/i })`
  at `:18`, `:19`, `:29`, `:50`, `:51`, and `getAllByRole("checkbox")` at `:81`),
  `components/log/LogModal.test.tsx` (`:105` `played on`, `:247`/`:323` `replay`),
  `e2e/lists.spec.ts:117,203`, `e2e/mobile-390.spec.ts:2141,2217`,
  `e2e/log-modal.spec.ts` (nine `getByRole("checkbox", …)` lines), `e2e/first-run.spec.ts:66`.
  **Every one of them resolves by ROLE and accessible name, and both survive**: the part is
  a native checkbox in a wrapping label, which is what those queries read.
  ⚠️ `apps/web/src/app/settings/PushSettings.test.tsx:111` also says
  `getByRole("checkbox")` and is NOT this family's - it is the Switch's native host.
- ⚠️ **Six of the seven rows change visibly**: they draw the browser's box themed with
  `accent-color` today and will draw the house box (decision 10). Of the seven, exactly
  ONE is filmed: `onboarding` (a screen in `e2e/shots/manifest.ts`), and that is the row
  that already draws the house box, so it should be near-zero-diff. The other six live
  inside sheets - `LogForm` in the log modal, `ListForm` in the list sheet, `PlayForm` in
  the play sheet - which no shot opens. **A consumption owes a prediction and a capture
  anyway**, because "no shot opens it" is a claim about the manifest at one sha.

**RadioGroup, site by site.**

- `components/reports/ReportSheet.tsx:104-155`: `<ul role="radiogroup" aria-label=…>`
  becomes `<RadioGroup asChild aria-label="Which rule does it break?">` around the same
  `<ul>`, so the `<li>`s and the deep-link `<Link>` beside each label are untouched; each
  `<label htmlFor>` becomes ~~`<RadioGroupItem className="w-full flex-1 …">`~~
  `<RadioGroupItem className="flex-1 …">` (⚠️ `w-full` STRUCK, DL18 layer 2 LOW-5: the row is
  a flex item of the `<li>`, so `flex-1` sizes it and `w-full` was measured inert, 310 / 310 px;
  the reason and the one case it still applies are at the Checkbox paragraph above), each `<input>`
  becomes `<RadioGroupInput value={guideline.value} checked={selected} onChange={…} />`,
  and the drawing becomes `<RadioGroupCircle><RadioGroupIndicator/></RadioGroupCircle>`.
  **`useId` and `name={groupId}` and every `id`/`htmlFor` pair GO**: the group owns the
  name and the label wraps its input.
  ⚠️ **The selected ROW's border can stop being React state**: `:130-139` draws
  `border-accent` from `chosen === guideline.value`, and `has-checked:border-primary` on
  the item draws the same thing from the platform. The `chosen` state is still needed for
  the Send button's `disabled`, so this is a simplification of the ROW and not of the
  component. Keep the file's own comment about a border-and-ink treatment rather than an
  accent FILL - that decision is thepile's and this family does not touch the row's colours.
  ⚠️ Keep `data-testid="report-sheet"` and `"report-send"`: `ReportFlag.test.tsx`,
  `e2e/reports.spec.ts`, `e2e/admin.spec.ts` and `e2e/tags.spec.ts` all resolve them.
  **Instruments**: `ReportFlag.test.tsx:148-159` is the one that names this family
  (`getByRole("radiogroup")`, `getAllByRole("radio")` with `toHaveLength(GUIDELINES.length)`,
  and `getByLabelText(guideline.heading)` per rule) plus `:169-173`; `e2e/reports.spec.ts`
  resolves every rule by `getByLabel("…")` (`:108`, `:119`, `:164`, `:201`). All of them
  survive: the label still wraps the input, so `getByLabelText` still finds it.
  ⚠️ **Twelve browser circles become twelve house circles** (decision 4). The sheet is
  closed in all seven of its routes' shots.
- `components/profile/FacePicker.tsx:319-352`, and this one is a DECISION rather than a
  mechanical swap [V]. `<RadioGroup asChild aria-label="Face">` around the existing `<ul>`
  keeps `data-testid="face-grid"`, the `grid-cols-[repeat(4,4rem)]` track count and the
  `<li>`s that `e2e/profile-edit.spec.ts:138-159` measures; each `<li>`'s `<button>` becomes
  `<RadioGroupItem>` holding a `<RadioGroupInput>`, an `sr-only` name and the same `<img>`,
  whose ring moves from `selected ? … : …` to `group-has-checked/radio:ring-2` and is then
  drawn by the platform. **What it costs**: the role changes from `button` to `radio` and
  `aria-pressed` becomes `checked`, which is `FacePicker.test.tsx:78,131,148,151,157,184`
  and `e2e/profile-edit.spec.ts:167`; and arrow-key traversal CHECKS as it moves (P3), so
  with each selection an immediate `onSave` a person arrowing across the row writes eight
  faces. `settings-profile` IS a filmed screen, so this one owes a prediction.
- **Not this family**: `ShelfPicker.tsx:85` and `:105`, `GameActions.tsx:427` +
  `ShelfSlot.tsx:28` (decision 2), and `FacePicker.tsx:299-315`'s style strip, which the
  audit answers with `Tabs`.
- ⚠️ **The e2e suite's `getByRole("radio")` - 51 lines across 21 spec files (layer 2 re-measured; the first edition said about 55 across 20) - resolves
  ONLY those refused sites**, so a consumption of this family cannot break any of them, and
  a green suite is not evidence that the report sheet's radios still work. `ReportFlag.test.tsx`
  and `e2e/reports.spec.ts` are the only instruments that cover what changes.

**What the consumption GAINS**: the seven checkbox rows stop being five copies of one
markup; the report sheet loses a `useId`, twelve `id`s, twelve `htmlFor`s and a React-held
selected border; and a radio group can no longer be built without a shared name or an
accessible name. **What it does NOT gain, and should not be sold as**: none of these sites
is broken today. Six checkbox rows change how they are drawn and twelve radios do, which
is a house decision, not a fix.

### Consumers

The library's own scan (`f5df7fb9` in place of `origin/next`, over `packages/**` and
`registry.json`), the script in `$BATCH_SCRATCH/s2/consumer-scan.sh`. The shell `grep`
here is a ugrep wrapper, so every arm that becomes a verdict uses `command grep` or
`git grep -F`.

⚠️ **Run 1 was not run as a script before the code, and saying so is the point.** Its
content - the declared lists and counters a seventeenth and eighteenth family have to
enter - was read off the BASE tree file by file as each was edited, and it is arm 4 of the
script above, which reads the same lists at any sha. The one thing a mechanical run-1 would
have caught and this did not is nothing: every counter in the brief's list was opened and
checked, and the one that did not reproduce is recorded in "Measurements" (1).

**Run 2, at the commit point** (`$BATCH_SCRATCH/s2/consumer-scan.2.txt`): **31 exported
names** - the nine parts, ten Props types, the fourteen story exports and the helper
module's `loadCompiledSheet` / `CompiledSheet`. Every reader of every one of them is
inside this slice's own files (`checkbox.tsx`, `radio-group.tsx`, `index.ts`, the two
story files, `choice-structure.test.tsx`, `choice-drawing.test.tsx`,
`helpers/compiled-sheet.ts`, `registry.json`). Four hits are NOT readers and are attributed
rather than waved away:

- `Checkbox` "read" by `switch.stories.tsx` and `switch-drawing.test.tsx` is the Switch's
  own `NativeCheckbox` story NAME, and by `radio-group.tsx` is the word `CheckboxInput` in
  a docblock;
- `Checked`, `Default`, `Disabled`, `InAForm` collide with nine other story files' own
  story names and with the word "Checked" in `switch.tsx`'s prose. A story module is its own
  namespace and a story name is not an import.

Scan 2 printed the two new items and their targets (`items 17 -> 19`). Scan 3 named
`AGENTS.md`, `README.md`, `registry.test.ts`, `choice-structure.test.tsx` and
`checkbox.stories.tsx` - all mine and all edited - plus four files I did NOT touch:
`breadcrumb.tsx` and `pagination.tsx`, whose docblocks name `fidelity.test.tsx`;
`ribbon.css`, whose comment names `registry.test.ts`; and `description-list.stories.tsx`,
which names `description-list.tsx`. All four are REVERSE references, and all three of my
edits to those files are additive: one docblock word in `fidelity.test.tsx`
(`sixteen` -> `eighteen`, no assertion), two counters and one list entry in
`registry.test.ts`, and the LOW-6 lines in `description-list.tsx`. So no part is held to
anything different.

`git diff --name-only f5df7fb9...HEAD` is **24 files** (⚠️ the first draft of this line
said 18, from counting the "What shipped" table rather than running the command - corrected
by running it): the twelve in that table, the four `r/` files the registry build rewrites,
the `description-list.tsx`/`description-list-structure.test.tsx` pair from LOW-6, the four
counter files (`fidelity.test.tsx`, `registry.test.ts`, `stories.test.tsx`,
`story-suites.ts` - three of them already in the table's last two rows), plus `AGENTS.md`,
`README.md`, `packages/ui/package.json` and this record.

**0 CROSS, 0 UNOWNED**, 31 names NEW. ⚠️ And **0 consumers in thepile, by construction**:
nothing there can consume an item that is not in a published bump, this batch's thepile
stream consumes the Switch rather than these, and the two families' names appear nowhere
in that tree at `50f8a22c` except as audit prescriptions. That is said rather than assumed.

**Run 3, after the layer-1 fixes** (`consumer-scan.3.txt`): **one name more, and it is not
a name.** `X` appears because `entry-point.test.ts`'s own docblock says
"Every `export function X` / `export const X` in one published source file", and the scan
reads added lines rather than a parsed module. Nothing else moved: the layer-1 fixes added
no export (`refuseRole` and `CheckboxContext` are module-private, and the new test file
exports nothing). Scan 3 gained `checkbox.tsx`, `radio-group.tsx` and `entry-point.test.ts`

- the two parts now name `choice-drawing.test.tsx` in their docblocks, which is the same
  reverse-reference shape as `breadcrumb.tsx` naming `fidelity.test.tsx`. Still **0 CROSS, 0
  UNOWNED**.

⚠️ The blind spot every previous family recorded still applies: scan 3's stem arm looks
for `./<stem>"` and `../<stem>"`, so it does not see
`import * as checkbox from "../../stories/checkbox.stories.js"`, which is how
`story-suites.ts` reaches a new story file. Arm 4 - the declared lists - is what covers it,
which is why that arm exists.

**The audit cells this slice's verdicts touch, for the reconciler's §6 grep.** Both
families SHIP, so the cells that prescribe them are now answered rather than refused, and
three sites the audit never named are refused. At `50f8a22c` in `docs/design-audit.md`:

- `RadioGroup` **ships**: cells at `:353` (`/game/[slug]`), `:384` (`/[username]`), `:385`
  (`/[username]/[shelf]`), `:386` (`/[username]/about`), `:390` (`/[username]/list/[slug]`),
  `:393` (`/[username]/review/[slug]`), `:395` (`/[username]/tier/[slug]`) - all seven
  naming `ReportSheet.tsx:142` - and `:399` (`/settings/profile`), the face grid.
- `Checkbox` **ships**: cells at `:353`, `:357` (`/lists`), `:358` (`/lists/[id]`), `:384`,
  `:401` (`/diary`), `:406` (`/onboarding`).
- **Refused, and named in no audit cell at all**: `ShelfPicker.tsx:85` and `:105`, and
  `GameActions.tsx:427` + `ShelfSlot.tsx:28`. They are drawn on `/game/[slug]` (`:353`)
  and inside the log sheet on `/[username]` (`:384`), so those two rows' text is where a
  reconciler would add the verdict - the audit's `should use` column names neither today.

## Layer 1 (reviewer, detached worktree of 87fdf70, slot r6)

**Ten findings: 2 HIGH, 4 MED, 4 LOW**, plus three OWED to an instrument this package does
not have. Its full report is `$BATCH_SCRATCH/r6/report.md`. Its baseline on the committed
head was `pnpm -r build` exit 0, `pnpm exec vitest run` **25 files / 494 tests exit 0**,
`pnpm typecheck` exit 0, `pnpm lint` exit 0 and `pnpm build:registry` exit 0 with
`git status --short` empty after it - and it re-read the branch head at the end
(`git rev-parse s/design-lib-d-choice` -> `87fdf70…`, **unmoved**), so every finding is
against the head as it stands. It also checked that `b2e2fb1c..87fdf70` is
`docs/as-built.md` alone, which is what makes the 26 mutations evidence about the same
code artifact it reviewed. The as-built prose below and the gate are, by construction,
unreviewed by it.

**Both HIGHs are accepted and FIXED, and both are the same failure in two places: a claim
this record makes in prose that no instrument could see.** The families' whole justification
for an invisible overlay input is that the 44px floor becomes a FACT rather than a hope
about label click-forwarding - and the floor guard reads `min-height` and nothing else, so
an input that kept `min-h-hit` and lost `inset-0` measured 44 and was 13px wide, with every
play green. And `packages/ui/src/index.ts` IS `@marquee-ui/ui` (`exports["."]`), and both
families could be deleted from it at 25 files / 494 tests and `typecheck` exit 0.

⚠️ It also found the thing I would not have: **`tailwind-compile.test.tsx:352-354` says in
its own comment that it reads one axis**, and I cited that file as the instrument that makes
the overlay's hit box measured. The guard was doing exactly what it says; the docblock I
wrote around it was the lie.

### The collapse / no-op mutation table, verbatim

<!-- prettier-ignore-start -->

| file | test | mutation applied | red / GREEN | what it asserts now |
| --- | --- | --- | --- | --- |
| choice-drawing.test.tsx | puts the tap floor on the INPUT, which is why the box may be 24px | **`inset-0` deleted from `inputClass` in BOTH families** (checkbox.tsx:71, radio-group.tsx:79) | **GREEN** | that the input's class list declares `min-height:44px` — not that the input covers anything. Suite: `Tests 1 failed \| 493 passed (494)`, the one red being the byte digest |
| tailwind-compile.test.tsx | every interactive element clears the 44px tap floor › measures every one of them at or above the floor | same | **GREEN** | the max of `min-height`/`height` over the class list. It never reads `inset`, `position` or any width, so a non-covering overlay measures 44 |
| choice-drawing.test.tsx | puts the tap floor on the INPUT… | **`absolute` deleted from `inputClass` in BOTH families** | **GREEN** | same. `Tests 1 failed \| 493 passed (494)`, byte digest only |
| tailwind-compile.test.tsx | measures every one of them at or above the floor | same | **GREEN** | same |
| (no touched test file) | — | **both `Checkbox` and `RadioGroup` export blocks deleted from `packages/ui/src/index.ts`** (the package's `exports["."]`) | **GREEN** | nothing. `Test Files 25 passed (25) / Tests 494 passed (494)`, `pnpm typecheck EXIT=0` |
| registry.test.ts | declares the eighteen part families…; carries the title, description… | same | **GREEN** | the registry item list and the per-item `r/*.json`, which do not read `index.ts` |
| helpers/source-files.ts → source-coverage.test.ts | walks exactly the published set, by path | same | **GREEN** | that `index.ts` EXISTS and is >100 B with the word `export` in it — not what it exports |
| stories.test.tsx + radio-group.stories.tsx | all 6 radio plays, and `runs all 65 play functions` | **the whole `{drawing}` (`RadioGroupCircle`+`RadioGroupIndicator`) deleted from the shared `Rules`** | **GREEN** — `0 RED / 114 green` in stories.test.tsx | the radio plays observe role, name, `name` attr, checkedness, tab order and FormData; none observes the drawing. (Caught, but only by choice-drawing.test.tsx) |
| choice-drawing.test.tsx | gives both families the SAME overlay input | `opacity-0` → `sr-only` in BOTH families (the spelling checkbox.tsx:66 forbids by name) | red — **but by one incidental clause** | reddens solely on `…join(" ")).toContain("opacity: 0%")`; the `toEqual` arm still passes because both sides changed together |
| description-list-structure.test.tsx | refuses an intrinsic element between the groups… | `if (!LIST_LEVEL_INTRINSICS.has(child.type))` → `if (false)` | red | ✓ |
| description-list-structure.test.tsx | leaves the OTHER legal shapes alone… | `LIST_LEVEL_INTRINSICS` → `new Set([])` | red | ✓ the bound is non-vacuous |
| description-list-structure.test.tsx | refuses an intrinsic element… | allow-set widened to `["div","script","template","hr","span","p"]` | red | ✓ |
| description-list-structure.test.tsx | does NOT refuse a component child… | `if (typeof child.type !== "string") continue` → `if (false) continue` | red (22 red) | ✓ |
| choice-structure.test.tsx | Checkbox refuses it, naming the element and the reason | checkbox `refuseAsChild` condition → `if (false)` | red | ✓ |
| choice-structure.test.tsx | RadioGroupItem refuses it too | radio-group `refuseAsChild` condition → `if (false)` | red | ✓ |
| choice-structure.test.tsx | refuses to render without one, which is stricter than axe | `if (named(props))` → `if (true)` | red | ✓ |
| choice-structure.test.tsx | gives TWO groups on one page two different names | `name ?? generated` → `name ?? "shared"` | red | ✓ |
| choice-structure.test.tsx | refuses a name on the INPUT | `if ("name" in props)` → `if (false)` | red | ✓ |
| choice-structure.test.tsx | throws outside a group rather than rendering an ungrouped radio | `useContext(…)` → `useContext(…) ?? { name: "orphan" }` | red | ✓ |
| choice-structure.test.tsx | gives every part a data-slot and puts the caller's class after the family's | `cn(rowClass, className)` → `cn(className)` | red | ✓ (+3 collateral in choice-drawing) |
| choice-structure.test.tsx | …same | `data-slot="checkbox-box"` → `"checkbox-boxx"` | red (+11 collateral) | ✓ |
| choice-structure.test.tsx | draws the house tick, and only the caller's mark | `{children ?? <path/>}` → both rendered | red | ✓ |
| choice-structure.test.tsx | draws the house tick… | `aria-hidden="true"` deleted from `CheckboxIndicator` | red | ✓ |
| choice-structure.test.tsx | fixes the input's type in both families (+4 more) | radio `type="radio"` → `type="text"` | red (5 red + 10 collateral incl. all 6 radio plays) | ✓ the plays observe the ELEMENT |
| choice-structure.test.tsx | but the GROUP takes it…; takes it from aria-label… | `role="radiogroup"` deleted from `Host` | red | ✓ |
| choice-structure.test.tsx | …same two | `Host = asChild ? Slot : "div"` → `"div"` | red | ✓ |
| choice-drawing.test.tsx | puts the tap floor on the INPUT; gives both families the SAME overlay | `min-h-hit` deleted from checkbox `inputClass` | red (+ tailwind-compile floor guard) | ✓ the floor guard DOES measure these inputs |
| choice-drawing.test.tsx | …same | `min-h-hit` deleted from radio `inputClass` | red (+ floor guard) | ✓ |
| choice-drawing.test.tsx | puts the tap floor…; draws one control in two shapes | `size-6` → `size-5` on the box | red | ✓ |
| choice-drawing.test.tsx | paints the mark in the ink…; reaches the drawing through a :checked descendant; leaves the checkbox's mark unpainted | `group-has-checked/checkbox:` → the UNNAMED `group-has-checked:` | red | ✓ only place the scoping is visible |
| choice-drawing.test.tsx | puts the focus ring and the disabled dimming on the ROW | `has-focus-visible:` → `focus-visible:` | red | ✓ |
| choice-drawing.test.tsx | paints the mark in the ink the fill guarantees | `stroke-primary-foreground` → `stroke-primary` | red | ✓ |
| choice-drawing.test.tsx | …same, other family | radio `bg-primary-foreground` → `bg-primary` | red | ✓ |
| choice-drawing.test.tsx | does the same for the radio, from the same trigger | `opacity-0` deleted from the radio indicator | red | ✓ |
| choice-drawing.test.tsx | draws one control in two shapes: the same box, at a different radius | circle `border-border-strong` → `border-border` (**one side only**) | red | ✓ the cross-family arm detects a substitution on one side |
| choice-drawing.test.tsx | …same | box `bg-surface` → `bg-raised` (**one side only**) | red | ✓ |
| choice-drawing.test.tsx | …same | `overflow-hidden` ADDED to the box only (**one side only**) | red | ✓ it detects an addition too |
| choice-drawing.test.tsx | …same | circle `rounded-full` → `rounded-sm` | red | ✓ |
| choice-drawing.test.tsx | lights a CALLER's own drawing when the item composes no circle | `group-has-checked/radio:ring-primary` deleted from the NoDrawing tile | red | ✓ |
| helpers/compiled-sheet.ts | 8 of 10 choice-drawing tests | `rule()` → `() => ""` | red | ✓ |
| helpers/compiled-sheet.ts | the 3 cascade tests | `flattened()`'s `at.replaceWith(at.nodes)` made unreachable | red | ✓ |
| helpers/compiled-sheet.ts | the 2 selector tests | `selectorsOf()` → `() => []` | red | ✓ |
| helpers/compiled-sheet.ts | 4 geometry tests | `declaredValues()` → `() => []` | red | ✓ |
| stories.test.tsx | runs all 65 play functions, and knows if one stopped running | one `play:` renamed to `noplay:` in checkbox.stories.tsx | red | ✓ DECLARED_PLAYS is anchored |
| stories.test.tsx | covers all eighteen part families…; the play counter | `export const CustomMark` → `const CustomMark` | red | ✓ DECLARED_STORIES is anchored |
| helpers/story-suites.ts | covers all eighteen part families…; the play counter | `checkbox,` deleted from `STORY_SUITES` | red | ✓ anchored on the FILES, not a retyped list |
| helpers/story-suites.ts | …same | `"radio-group": radioGroup,` deleted | red | ✓ |
| tokens helpers/source-files.ts | walks exactly the published set, by path (+2) | `packages/ui/src/checkbox.tsx` deleted from `PUBLISHED_SOURCE_FILES` | red | ✓ |
| tokens helpers/source-files.ts | walks exactly the declared stories, by path (+1) | `radio-group.stories.tsx` deleted from `STORY_FILES` | red | ✓ |
| registry.test.ts | declares the eighteen part families… (+5) | `"name": "checkbox"` → `"checkboxx"` in registry.json | red | ✓ |
| registry.test.ts | ships an INDEX…; carries the title, description and both dependency lists | one word changed in radio-group's registry description | red | ✓ |
| checkbox.stories.tsx | checkbox/Default, /Disabled, /InAForm, /TwoRows + the play counter | `<CheckboxInput …/>` deleted from `Row` | red | ✓ |
| radio-group.stories.tsx | radio-group/NoDrawing + the play counter | the `sr-only` name deleted from the NoDrawing tile | red | ✓ |
| radio-group.stories.tsx | radio-group/InAForm + the play counter | `name="reason"` deleted from the InAForm `Rules` | red | ✓ |
| checkbox.stories.tsx | checkbox/InAForm + the play counter | `name="ranked"` deleted from the InAForm `Row` | red | ✓ |
| fidelity.test.tsx | — | (the slice's only change to this file is one docblock word, `sixteen`→`eighteen`; it backs no assertion) | n/a | nothing; the "eighteen" in AGENTS.md, README.md, package.json and this docblock is guarded by no test |

<!-- prettier-ignore-end -->

**Its score: 8 GREEN rows across 3 distinct subjects, 40 red.** Its own summary of what the
26 mutations in this record were worth: it reproduced 23 of them exactly or as the
equivalent collapse from the other side, every one red on the named test, and covered the
other three with adjacent collapses that reddened the same arms - "26 red, 0 GREEN is not
overstated".

### What was done about each finding

**All ten are FIXED** at `94a5c560`. Twelve new guards came with the fixes and **each was
proved by its own reddening mutation** (`L1a`-`L1l`, run against that committed head in the
same detached worktree, logs in `$BATCH_SCRATCH/s2/mutations/`, input `mutations-b.json`),
taking this slice's mutation count from 26 to **38**. The suite goes 494 -> **504** and 25
files -> **26**.

<!-- prettier-ignore-start -->

| finding | verdict | what changed | the mutation that proves it |
| --- | --- | --- | --- |
| HIGH-1 · the overlay's covering is unguarded | FIXED | `choice-drawing.test.tsx` gains `makes the input COVER the row, which is the claim the floor rests on`: `position: absolute` and the `inset` shorthand resolved to 0 out of the compiled sheet, in BOTH families, plus `opacity: 0%` and no `display` of its own. ⚠️ The first draft asked for four inset LONGHANDS and got null from every class - `inset-0` emits the shorthand - which is in the test's comment now. The `checkbox.tsx` docblock stops claiming the floor guard measures the hit box | **L1a** (`inset-0` deleted, checkbox) and **L1b** (`absolute` deleted, radio): each `3 failed / 501`, naming the new arm. **L1c** (`opacity-0` -> `sr-only`): same |
| HIGH-2 · the public entry point is unguarded | FIXED | a new `packages/ui/test/entry-point.test.ts`, and it closes the hole for ALL EIGHTEEN families rather than the two: it WALKS `packages/ui/src` on disk (not a list anyone maintains), parses every `export function` / `export const`, and requires the barrel to expose each one - and the reverse, that the barrel exports nothing no source declares | **L1d** (one family's `Checkbox` export removed): `re-exports every value each part file exports, by name`. **L1e** (a `Checkbox as Ghost` re-export added): `exports nothing that no part file declares` |
| MED-1 · `aria-label=""` satisfies the name refusal | FIXED | the check is a non-empty TRIMMED string now, not a present attribute. The dangling-`aria-labelledby` half is not checkable at render (the element is not in a document yet) and is said out loud in the docblock rather than implied away | **L1f** (`filled` -> `!== undefined`): `refuses an EMPTY aria-label, which is how an untitled group arrives` |
| MED-2 · `<fieldset><legend>` is refused although the docblock offers it | FIXED | `hasAccessibleName` accepts a `<legend>` element child when the `asChild` host is a `<fieldset>`, which is the native named group and is what the reviewer's own accname read resolved | **L1g** (the fieldset arm made unreachable): `takes a <legend>, which is the fieldset shape its own props docblock advertises` |
| MED-3 · an `asChild` child's own `role` replaces `radiogroup` | FIXED | a `refuseRole` in `DescriptionList`'s shape, reading the part's props AND the `asChild` child's. `<RadioGroup asChild><ul role="list">` was a named LIST of radios belonging to nothing, with the name refusal satisfied | **L1h** (`refuseRole` made unreachable): `refuses a role, on the part and on an asChild child` |
| MED-4 · LOW-6's stated bound is false in both directions | FIXED, both halves | the guard now copies axe's FLATTEN one level: a hand-written `<div>` at list level may hold `dt`, `dd`, `script` and `template` and nothing else intrinsic, so `<div><hr /></div>` - a real `only-dlitems` failure the first edition passed - takes the route down. And the docblock stops saying "exactly the three that check passes": it is a deliberate SUPERSET bounded by the content model, and the two shapes axe exempts and this refuses (`role="term"`, `hidden`) are now an assertion instead of a sentence | **L1i** (the flatten made unreachable): `flattens a hand-written div one level, because axe's only-dlitems does`. **L1j** (`span` added to the allowed set): `is a deliberate SUPERSET of what axe flags, not a copy of it` |
| LOW-1 · six radio stories can lose their whole drawing, plays green | RECORDED, not changed | true and already caught: deleting `{drawing}` from the shared `Rules` reddens seven arms in `choice-drawing.test.tsx` (`slots()` throws on the missing `data-slot`), so nothing can ship without it. The narrower fact is worth the line: **the radio plays assert role, name, the shared `name`, exclusivity, tab order, arrow keys and `FormData` - and nothing about what is drawn.** A green story suite is evidence about the semantics, and the drawing is the other file's to hold |
| LOW-2 · decision 11 argues the no-context call from the wrong part | FIXED | `CheckboxInput` throws outside a `Checkbox` now, exactly as `RadioGroupInput` does. The split decision 11 describes is real but it is INPUT vs DRAWING, not family vs family: an orphan drawing part is an unlit box anyone can see, an orphan input is an unnamed invisible control absorbing taps over whatever ancestor happens to be positioned. Decision 11's text is rewritten to say that | **L1k** (the throw made unreachable): `and the CHECKBOX's input throws outside its row for the same kind of reason` |
| LOW-3 · the extracted helper resolves one calc operand order, the copy it will replace resolves two | FIXED | the module resolves both, so the later stream that moves `tailwind-compile.test.tsx` onto it cannot silently lose a shape, and the anchor test reads both back | **L1l** (the second regex removed): `found a real drawing to measure, and a sheet to measure it in` |
| LOW-4 · a pre-existing false comment about the same evaluator | FIXED | `description-list.tsx:136` said axe's `only-dlitems` has `validRoles: ['definition','term','listitem']`; the constant is `ALLOWED_ROLES = ['definition','term','list']` (`axe.js:25876`). One word, in a file this slice already has open, and the file no longer carries two descriptions of one evaluator that disagree |

<!-- prettier-ignore-end -->

**OWED, and it is owed to a browser rather than to this tree** (no Playwright here, and
jsdom lays nothing out). All three are the same class - a geometric fact about a 44px
overlay - and the consuming repository is where they can be measured, on the consumption
slice:

1. the overlay input's real rendered tap box at 390px;
2. two stacked rows where a caller shortens one below 44px with `h-8` or `min-h-0`: does
   the input's `min-h-hit` overflow onto the next row's top edge and steal its taps?
3. an interactive child INSIDE a `Checkbox` row - a link, a button - which the
   `absolute inset-0` input would occlude. ⚠️ Half of this one is closed rather than owed,
   and by a record that already existed: the **Switch's** own thepile-inputs list says
   "the overlay input covers the row's text, so the native host's row has no text selection
   and cannot carry a second interactive element", which makes it a known property of the
   pattern rather than a discovery. Both new families' docblocks say it now, and both point
   at the composition that answers it - the deep link OUTSIDE the label, which is the
   `AsAList` story and the report sheet's own shape. What is still owed is the measurement:
   nothing here can show the occlusion, only describe it.

⚠️ And one thing the reviewer noted that is worth carrying rather than closing: it ran the
route-contract scan (arm 2) that this record does not mention at all, and it found one hit,
`housePath` - a local `const` in `choice-structure.test.tsx`. This repository has no routes,
so that arm is a no-op here; saying so is better than omitting it.

### The gate

One run, at the branch head, detached with a sentinel in `$BATCH_SCRATCH/s2/` as the
thepile streams do (this gate is under half a minute and contends with nothing, so the
shape is habit rather than need): `pnpm verify` **exit 0**, read from `verify.exit` and not
from an appended echo. Three times on 2026-09-20 - 23:14:51 -> 23:15:07 IST at `8a68e3a`,
23:15:37 -> 23:16:00 IST at `282c8bc5`, and once more at the FINAL head after this record
was finished - with the same exit and the same lines every time:
`All matched files use Prettier code style!`, both packages' `typecheck: Done`,
`✔ Building registry.`, `└ Storybook build completed successfully`, and
`Test Files 26 passed (26)` / `Tests 504 passed (504)` - from 23 / 453 at the base
`f5df7fb9`, whose own suite was measured green first (and only after `pnpm build`: without
the tokens' `dist` the base is 5 files red for environmental reasons alone, which is worth
knowing before anyone reads a base run as a finding).

`git status --short` was empty before and after, so the committed `packages/ui/r` is
exactly what `build:registry` produces at this head.

⚠️ It was re-run on purpose rather than once, and the last time AFTER this record was
finished, so the gated tree is the branch head and not one docs commit behind it. That is
affordable here and it is not in the thepile streams: twenty-three seconds against
twenty-five minutes. Nothing but this file has moved between the runs - `docs/` is read by
`prettier --check` and by no test (`source-files.ts` walks `packages/*/src` and
`packages/*/stories` only) - and the stream's report carries the final run's own wall
clock, which is the one number a record cannot state about a run that postdates it.

No push, no `npm publish`, no git tag, no version bump: the freeze holds, and these two
families ride the post-freeze bump with the six already waiting - which makes it an
EIGHT-item bump, and `0.1.2` rather than `0.1.1` (decision 13).

### Reconciler closures (batch DL13, layer 2)

Layer 2 (max, both repositories, concurrent with thepile's merged gate) read this record against
the nine thepile sites, the vendored Switch and the sibling stream's rewrite of
`scripts/marquee-drift.test.ts`. Closed here, by the reconciler: **HIGH-1**, the "thepile inputs"
paragraph on the drift test described it at `50f8a22c`, one pin short and with a complement that
does not move (restated above at `5e4d961b`); **MED-3**, `SwitchInput` writes `role="switch"` and
the two inputs here write none, with no rule stating it (the role-string scan and the computed
roles, above); **LOW-6**, "about 55 lines across 20 spec files" was 51 across 21. **Recorded, not
closed** (the next library stream's first items): **LOW-4**, "byte-identical to `Switch`'s
`nativeInputClass`" is prose with no instrument, since `test/choice-drawing.test.tsx:136-143`
compares the two new inputs and never reaches `switch-input` (add the Switch's slot to that arm);
**LOW-7**, `packages/ui/src/radio-group.tsx:229` throws on `name={undefined}` where
`refuseAsChild` guards with `!== undefined`, reachable only through a spread; and decision 12's
REQUEST, `test/switch-drawing.test.tsx` and `test/tailwind-compile.test.tsx` onto
`test/helpers/compiled-sheet.ts` (keep both `calc()` operand orders). Layer 2's HIGH-1 in thepile
was this same paragraph, seen from the consuming side.

## DESIGN-LIB-d: Avatar (2026-09-21)

Batch DL14, stream s2, branch `s/design-lib-d-avatar` from the library's `next` @ `0b56bf49`. Four
items in the order the brief fixed them - the client boundary alone and first, the compiled-sheet
move, then DL13 layer 2's LOW-4 and LOW-7 - then `Tabs` and `Avatar` MEASURED before either was
built, then the one that ships. Nothing was published, nothing was pushed (the Actions-minutes
freeze), no version was bumped, and the consuming repository was read only, at `8a2dc618`.

The base's own numbers, run first: `pnpm verify` exit 0, **26 files / 504 tests**, which is what
the brief predicted.

### The client boundary: four parts a Server Component could not import

**This is a shipping defect, not a tidy, and it was RUN rather than reasoned.** The orchestrator
vendored this package's `form.tsx` into thepile at `d69b5df6`, composed it in an existing Server
Component page, and `pnpm --filter @thepile/web build` exited 1:

```
You're importing a component that needs createContext. This React Hook only works in a Client
Component. To fix, mark the file (or its parent) with the "use client" directive.
```

naming `src/components/ui/form.tsx:2:1`. Four files here were in that state - `form.tsx`,
`checkbox.tsx`, `radio-group.tsx`, `description-list.tsx`, all four importing `createContext` and
`useContext` from `react` - while three others (`accordion`, `sheet`, `toast`) carried the
directive. The rule existed and nothing held anyone to it.

**`description-list.tsx` takes the directive, and that was the DECISION the brief left open.** Its
docblock promised the opposite ("7 of the 8 `<dl>` sites are server components. A static cell
should not buy a client boundary"), so the question was whether its two contexts - `{ inList: true }`
/ `{ inItem: true }` markers for the misuse throws - can be replaced by something a server module
can do. They cannot, and the measurement is the test file rather than an opinion:
`test/description-list-structure.test.tsx` has **seven** arms that exist only because of them
(`:73-94`, three bare parts plus "a term inside a LIST but outside an item"; `:565-613`, three
"a part inside a part" cases), and two of those classes are unreachable without context:

- a part rendered at the TOP LEVEL has no parent to walk it, so nothing can observe it at all;
- a `<DescriptionTerm>` at any depth inside a `<DescriptionDetails>` is caught because
  `NotInsideAPart` CLEARS the context, and a walk sees direct children only - decision 10 refuses
  to walk a part's children, which is what lets a link live inside a `dd`.

**The alternative was worked out and rejected on a measured counter-example.** Cloning each direct
part child with a marker prop catches the bare part and the nested one, and REFUSES the three
product sites that factor a group into a component (`Ledger`'s `Cell`, `ScoreBlock`'s `RawFigure`,
`reckoning`'s `Fact`): their `DescriptionItem` is rendered from inside a component, so there is no
child for a parent to clone. Dropping the contexts would have kept the file a server module and
silently deleted five guard arms. The file opens with the directive, its reason 2 is retired IN
PLACE rather than deleted (the cost sentence still stands as a cost), and the family docblock now
says what the boundary buys.

**The guard, `test/client-boundary.test.ts`.** Every `packages/ui/src/*.tsx` whose `react` import
names `createContext`, `useContext`, `useState`, `useEffect`, `useRef`, `useLayoutEffect`,
`useReducer` or `useSyncExternalStore` opens with `"use client"`. `useId` is deliberately NOT in
the set: React serves it on the server, which is how a server-rendered label and its input agree on
an id at all. `import type { … } from "react"` is skipped whole and an inline `type X` member is
dropped, or `card.tsx` would read like `toast.tsx`.

⚠️ **Its third arm found something the brief did not predict, and the first draft of that arm was
WRONG.** "A file with no hooks must not carry the directive" reported `accordion.tsx` and
`sheet.tsx` - both correct files. Measured: `@radix-ui/react-accordion`, `@radix-ui/react-dialog`
and `@radix-ui/react-label` all open their ESM entry with `"use client"`; `@radix-ui/react-separator`
and `@radix-ui/react-slot` do not. So the arm resolves the wrapped dependency's own entry and reads
ITS first bytes, rather than carrying a list. The assertion was fixed; it was not weakened.

Both directions were RUN, on the committed head `32f3705`:

| mutation                                                     | run                                       | red                                                                                                                                                          |
| ------------------------------------------------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| the guard, against the BASE (before the fix)                 | `vitest run test/client-boundary.test.ts` | **red 2** - `opens every hook-importing file` naming all four files with the hooks each imports, and the entitlement arm naming `accordion.tsx`, `sheet.tsx` |
| `"use client";` stripped from `form.tsx`                     | same                                      | **red 1** - `[ "packages/ui/src/form.tsx (imports createContext, useContext)" ]`                                                                             |
| `"use client";` prepended to `card.tsx` (no hooks, no Radix) | same                                      | **red 1** - `does not spend the boundary on a file that is entitled to none`, `[ 'card.tsx' ]`                                                               |

### The compiled-sheet move (DL13 decision 12's REQUEST)

`test/switch-drawing.test.tsx` and `test/tailwind-compile.test.tsx` each carried their own copy of
the postcss compile, the `:root` scan and the length resolver; both now read
`test/helpers/compiled-sheet.ts`. **163 lines of duplicated instrument removed** (`+173 / -336`
across the three files). Both `calc()` operand orders survive, because the module already handled
both where `switch-drawing`'s copy handled one - `choice-drawing.test.tsx:83-84` is the arm that
says so, and it is untouched.

`CompiledSheet` gains one member, `has(name)`, which is the class-name set
`tailwind-compile`'s "compiles every one of them" arm reads. It is NOT `rule(name) !== ""`: a class
whose rule body is empty compiles and would read as absent. Two facts the deleted copies held and
the module's docblock did not moved with them - the measured "not one rule applied" before
flattening, and the two UNLAYERED `.mq-marquee` rules whose precedence flattening inverts.

**Proved load-bearing, on the committed head `524b7b0`**: `lengthPx` made to return `null` for every
value (mutation confirmed landed by `grep`) reddens **20 tests across all three readers**
(`choice-drawing`, `switch-drawing`, `tailwind-compile`), where the tree is green.

### LOW-4 and LOW-7, the two DL13 layer-2 findings

**LOW-4.** `checkbox.tsx:80` says its overlay-input string is "byte-identical to `Switch`'s
`nativeInputClass`, deliberately", and `test/choice-drawing.test.tsx:136-143` compared the checkbox's
slot to the radio's and never reached `switch-input`: the sentence had no instrument, and
`switch.tsx` could have been edited alone. The arm takes all three slots now, the Switch's off its
NATIVE host story (`NativeCheckbox`, the one that renders an `<input>` rather than a
`button[role=switch]`), and it carries a non-emptiness anchor so three empty lists cannot satisfy it.

Reddening run, committed head `982c4b7`: `z-10` planted in `switch.tsx`'s `nativeInputClass` alone
(mutation confirmed landed at `:85`) →
`AssertionError: switch-input vs checkbox-input: expected [ …(6) ] to deeply equal [ …(5) ]`, the
diff naming `+ "z-10"`.

**LOW-7.** `radio-group.tsx:229` refused a `name` with `"name" in props`, which reports a spread
carrying `name: undefined` as PRESENT - so a caller who destructured `name` off their own props and
spread the rest got a message telling them to move a name they never wrote. It guards with
`props.name !== undefined` now, which is `refuseAsChild`'s own form eleven screens up in the same
file. Red-first, before the fix: the new arm
(`lets a SPREAD whose name is undefined through, and gives it the group's`) threw
`<RadioGroupInput> does not take "name": …` from `radio-group.tsx:232`. Its positive half is the
point - the radio comes out carrying the GROUP's name - and the existing arm that refuses a REAL
name stayed green.

### The Tabs measurement, and the answer

**No `Tabs` family ships.** The audit's five rows reproduce at the thepile base `8a2dc618`
(`awk -F'|' '{ if ($4 ~ /Tabs/) print NR": "$2 }' docs/design-audit.md` → `:357`, `:381`, `:385`, `:399`, `:401`).

| audit row                                | what it actually is                                                                                                                                                                                                                                                                                                                                                                                                                 | wants the part?                                                                                                                                       |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `:357` `/lists`                          | `HubTabs.tsx:48-70`: `<nav aria-label="Lists and tier lists">` of TWO `next/link`, `aria-current={current ? "page" : undefined}`, `data-testid="hub-tab-*"`, the active one `-mb-0.5 border-b-2 border-accent`. Its docblock `:13-18` decided it in code: "**A URL, NOT STATE, and that is a cacheability decision rather than a style one** … a tab held in `?tab=` would make each route depend on `searchParams` and go dynamic" | No. Each tab is a distinct ISR route, and the state IS the current page                                                                               |
| `:381` `/tiers/boards`                   | the SAME component, second mount - which is the whole reason it exists ("this strip is the door, and it sits on BOTH pages so the pair is symmetric")                                                                                                                                                                                                                                                                               | No. Same                                                                                                                                              |
| `:385` `/[username]/[shelf]/[[...view]]` | `Door.tsx:77-101` `DoorTab`: a `next/link` with `aria-current={selected ? "page" : undefined}`. Its docblock `:70-76` already answered this row in code: "`aria-current` rather than `aria-selected`, **because this is a set of links and not a `tablist`: the selected one IS the current page**"                                                                                                                                 | No. The house decision is recorded in the source, with its reason                                                                                     |
| `:401` `/diary`                          | `ShelfSwitcher.tsx:29-56`: `<nav aria-label="Your library">` of five shelf `Pill`s, an `aria-hidden` middot and Diary, every one a `next/link` with `aria-current`, `px-2` a MOBILE-1 measurement with its own e2e                                                                                                                                                                                                                  | No. Five sibling routes; `usePathname()` is reading the URL, not holding a selection                                                                  |
| `:399` `/settings/profile`               | `FacePicker.tsx:299-315`: a `div[role="group"][aria-label="Face styles"]` of FOUR `aria-pressed` buttons that switch `ids` in React state (`setSet`, `setPage(0)`) and refill ONE `ul[data-testid="face-grid"]` at `:318-346`                                                                                                                                                                                                       | **No - and for a different reason from the other four.** This one IS tab-shaped: four chips, one region. What refuses it is arithmetic, not semantics |

**So four of five are anchors whose selected state is the current URL**, which is DL11's ToggleGroup
verdict one row over, and the house has already written it down twice in its own source.

**The fifth is the one worth stating carefully, because the orchestrator's read [V] and this record
agree on the verdict and not on the reason.** `/settings/profile`'s strip is the product's one
in-page selector, and `role="tablist"` is a defensible reading of it: four chips selecting which set
fills one panel. What it would cost is written down in the tree already, at
`components/tiers/TierEditor.tsx:458-468` - the nearest precedent, a `role="group"` of two
`aria-pressed` mode buttons, which refused the same role for the same reason: "`aria-pressed` rather
than `aria-current="page"` (no page changes) and rather than a `role="tablist"` (which owes roving
arrow keys and `aria-controls`, and the Board panel is not a tabpanel that exists in both states)".
For the face picker the panel DOES exist in both states, so that last clause does not carry - but
the roving tab stop and the `aria-controls` do, and the change from `aria-pressed` to
`aria-selected` is a product decision about how that control announces itself. **One site, four chips, and a semantics change the product has not taken
is not a family.** If `/settings/profile` ever wants `tablist`, this is the row that says so, and it
should arrive as a product decision first. Nothing ships; the reconciler corrects the five cells.

### The Avatar measurement, and the answer

The audit's five rows (`:362` `/members`, `:371` `/search`, `:384` `/[username]`, `:387`
`/[username]/followers`, `:402` `/feed`) plus two by `same as` (`:363` `/members/[page]`, `:388`
`/[username]/following`) = **seven cells over eleven drawn faces**, read at `8a2dc618`.

`components/profile/Avatar.tsx` has NINE call sites, each one read:

| site                                              | size             | what wraps it                                                                                           |
| ------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------- |
| `app/[username]/[shelf]/[[...view]]/page.tsx:194` | 28               | INSIDE a `<Link data-testid="shelf-owner">` that also holds the owner's name                            |
| `app/[username]/about/page.tsx:90`                | 28               | a flex row; the link is its SIBLING                                                                     |
| `app/[username]/list/[slug]/page.tsx:167`         | 28               | same shape                                                                                              |
| `app/[username]/tier/[slug]/page.tsx:106`         | 28               | same shape                                                                                              |
| `app/[username]/page.tsx:542`                     | 64 (the default) | the player card's header grid; no link                                                                  |
| `components/profile/FacePicker.tsx:283`           | 96               | the preview; no link                                                                                    |
| `components/profile/MemberRow.tsx:113`            | 56               | INSIDE the card's `<Link … className="… after:absolute after:inset-0">`, beside the name                |
| `components/profile/NetworkStrip.tsx:146`         | 34               | a `<span role="img" aria-label={"@"+handle} className="-mr-2 inline-flex rounded-full ring-2 ring-bg">` |
| `components/search/StartSomewhere.tsx:127`        | 34               | a `<span className="-mr-2.5 inline-flex rounded-full ring-2 ring-bg">` inside an `aria-hidden` strip    |

Two hand-drawn siblings and one grid make it eleven:

| face                                           | box                                                            | edge                                                                           | badge                                                                                                         |
| ---------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `home/Byline.tsx:92-111` `MemberGlyph`         | `h-[26px] w-[26px]`                                            | `border` (1px)                                                                 | none, by its decision 4 ("26px is under the 28 floor, and the handle is the very next thing in the sentence") |
| `shell/TopBar.tsx:163-190`                     | `h-9 w-9` (36) on a gradient wrapper with `group-hover:ring-2` | NONE on the `<img>`                                                            | none, by the same decision 4                                                                                  |
| `profile/FacePicker.tsx:338-347` the face grid | `h-16 w-16`                                                    | `border-2`, `border-accent ring-2 ring-accent ring-offset-[3px]` when selected | none                                                                                                          |

**Three measurements decided the family, and two of them contradict the brief's read [V].**

**1. No size axis.** Eleven faces, **SEVEN** boxes - 26, 28, 34, 36, 56, 64, 96 - and two of the
pairs are two pixels apart, each pair from two components that each explain in their own docblock
why theirs is what it is. A `cva` with seven arbitrary values is not a visual axis; it is one
product's measurements wearing a `size` prop, and `DescriptionList` refused the identical shape for
the identical reason ("eight product sites, eight layouts. A `cva` with eight values is not an
axis"). **And the size could not have been left to `className` either**, which is the fact that
closes the question: the reference consumer's `cn` is a plain JOIN, not a tailwind-merge - a
declared exclusion from this registry whose own docblock says "a caller's `className` does NOT beat
a variant's. Two same-specificity utilities on one element are resolved by the STYLESHEET's order" -
so `<Avatar size="sm" className="h-[34px] w-[34px]">` would leave BOTH on the element. A size a
consumer needs has to be reachable, and the only spelling that is reachable here is the caller's own.

**2. One shape, not two, and the product's own bug is the argument.** `Avatar.tsx` sizes the `<img>`
itself on the keyed branch and the WRAPPER on the default branch. Its docblock `:50-61` records
what that cost: when the shared constant carried `h-full w-full`, the keyed branch emitted
`h-16 w-16 shrink-0 h-full w-full` on one element - same specificity, `h-full` later in the sheet -
so every uploaded and every picked face was sized by its container instead of by its prop, and it
was invisible to a `toContain` assertion, to an e2e that read only `src`, and to a screenshot suite
whose fixtures never draw that branch. Here the root ALWAYS carries the box and the image is ALWAYS
`h-full w-full`, so the fork does not exist to get wrong.

**3. No Radix, and it was PROBED.** `@radix-ui/react-avatar@1.2.6` + `react@19.3.0` under jsdom
(`$BATCH_SCRATCH/s2/radix-probe/probe.mjs`):

```
=== dist opens with
"\"use client\";\n"
=== SSR (renderToString), which is what an ISR page ships
<span class="root"><span class="fb">N</span></span>
=== after mount, image NOT loaded
<span class="root"><span class="fb">N</span></span>
img count: 0
```

**`renderToString` emits no `<img>` at all**, and after mount with the image unloaded the DOM still
holds zero. Its `Image` is a load-status state machine that paints nothing until the browser has the
bytes. That is fatal here three ways: nine of the eleven faces are on SERVER-rendered pages whose
HTML is what a crawler and a screenshot suite read; `Avatar.test.tsx:60`'s "never renders a bare
letter any more: every member is an image" would be false BY CONSTRUCTION, since Radix's server
output is exactly a letter on a circle - the placeholder PROF-6 retired by design-gate decision 2;
and the product has no loading state to model at all, because `defaultFaceKey(username)` always
yields a URL. The brief asked whether Image/Fallback buys anything a site wants: **nothing any of
the eleven wants, and it removes something all nine server ones need.**

**4. `asChild` is on the root only, and NOT for the reason the brief gave.** The read [V] was
"`asChild` where a site wraps the face in a link". Measured: **zero of the eleven** want it. The two
sites whose face sits inside a link (`:194`, `MemberRow:113`) have the link wrapping the face AND
the name, so the link is the face's PARENT and not the face's element; the two ring sites want a
wrapper that the root now simply IS. `asChild` ships on the root anyway because a face that is
itself a link is the obvious general composition and the house rule asks for it - and the
`AsChildLink` story carries `h-11` for a reason the package enforces: the 44px floor guard resolves
every `a[href]` a story renders against the compiled sheet, so a 26px avatar-as-link would redden
the suite here rather than ship as a 26px tap target. It is REFUSED on the image (a void element has
no child to give its props to: `asChild` there renders the caller's element and no image at all) and
on the mark (its position and its `aria-hidden` ARE the part).

### What shipped

`packages/ui/src/avatar.tsx`, 9,767 B, three parts and one `cva`:

- **`Avatar`** - `relative inline-flex shrink-0 @container`, plus `asChild`. No box: the caller's.
- **`AvatarImage`** - `h-full w-full rounded-full bg-surface object-cover` + `avatarImageVariants({ edge })`.
  `alt` defaults to `""` and stays the caller's; `src` is required by the TYPE rather than by a
  throw, because an `<img>` with no `src` draws the browser's broken-image glyph, and this package
  throws for the misuse whose failure is QUIET.
- **`AvatarBadge`** - the corner mark: `absolute -right-[4%] -bottom-[4%] grid h-2/5 w-2/5
place-items-center rounded-full border-2 border-border-strong bg-surface
text-[length:var(--avatar-mark-size,17cqw)] leading-none` (in THAT order: `leading-none` after the
  `text-[length:…]`, the reason is the `cn` paragraph below; and `17cqw`, not the first draft's `20cqw`), with `aria-hidden="true"` written AFTER the caller's
  props so it cannot be turned off (`RadioGroupInput`'s `name` is placed the same way).

**The one visual axis is the EDGE**, three values with a measured site each: `default` `border-2`
(ten of the eleven faces), `thin` `border` (the 26px byline glyph, whose docblock calls the
proportion "the design, not an accident"), `none` (the top bar's, whose ring is its wrapper's).
`none` declares NOTHING rather than `border-0`, and the drawing test reads that difference as
`null` vs `0`.

⚠️ **`leading-none` was never on the mark at all until layer 1, and the mechanism is worth the
paragraph.** This package's own `cn` IS a tailwind-merge, and tailwind-merge's `font-size` group
CONFLICTS with `leading` - because `text-sm` sets a line-height as well as a size - so the
`text-[length:…]` written after `leading-none` DELETED it. Measured with the package's own `cn`:
`cn("bg-surface leading-none text-[length:var(--avatar-mark-size,17cqw)]")` returns
`"bg-surface text-[length:var(--avatar-mark-size,17cqw)]"`. The reviewer's M16 - "delete
`leading-none`" - came back GREEN, and instrumenting that GREEN is what found the class had never
shipped. The two are ordered the other way round now. It is `AGENTS.md`'s "`cn` carries a theme
list" one group over: the names this system ADDS fall outside tailwind-merge's groups, and the names
it does not can fall INSIDE one you did not think about.

**`--avatar-mark-size` is the family's central decision and it is the plain-join constraint again.**
The mark's type is the only thing that must know the face's box, and a `text-*` passed through
`className` would sit BESIDE the part's rather than replace it. So the part declares
`font-size: var(--avatar-mark-size, 17cqw)` - exactly one declaration - the root opens a container,
and a caller moves the value with one custom property on the root
(`className="[--avatar-mark-size:0.95rem]"`) with nothing to fight.

⚠️ **`17cqw` is the MEDIAN of the five measured sites, and the first draft said `20cqw` because it
is a round number** (layer 1, MED-2). The reference product's five marks are 0.206, 0.198, 0.171,
0.170 and 0.158 of their face, smallest face first - a ratio that FALLS as the face grows, which no
single number reproduces - so four of the five sat below the round 20 and the paragraph defending it
contained the numbers contradicting it. It is a median now and it is described as one. What the
default buys is a mark that is proportional rather than inherited at a size nobody picked; every
site that cares sets the var, which is what the seam is for.

⚠️ **And the seam is a route AROUND the collision, not an immunity to it** (layer 1, LOW-6): a
caller who moves the VALUE writes one declaration and has nothing to fight; a caller who writes a
second `text-*` on the mark anyway is back in the same trap.

⚠️ **The bound on `@container`, and the first edition of this paragraph was wrong in both halves**
(layer 1, MED-1). It said the containment was a no-op here and that the drawing test asserted it.
Neither is true. `container-type: inline-size` applies inline-size containment, so the root's inline
size stops reading its contents: a root the caller never sized COLLAPSES TO ZERO where, without
`@container`, it would have fallen back to the image's intrinsic width. That is not a regression the
family introduces - an unsized root is already drawing an image at `h-full w-full` of nothing - but
it does make the mistake silent rather than merely wrong. And nothing here can catch it: jsdom lays
nothing out and this package has no browser runner, so the drawing test's arm is about the CLASS
LIST (the part declares no box), not about a rendered width. So it is stated as the caller's
contract instead: **`<Avatar>` owes a box**, and all seven stories carry one.

Seven stories (`Default`, `NoBadge`, `Named`, `Edges`, `MarkSize`, `AsChildLink`, `Stack`), every one
with a `play`. `DECLARED_STORIES` 94 → **101**, `DECLARED_PLAYS` 65 → **72**. The face in every story
is a 1x1 transparent gif as a `data:` URI: the stories are the tests, and a test that fetches is a
test that can fail for the weather.

### The guards, and the runs that reddened them

`test/avatar-drawing.test.tsx` re-derives every number from the COMPILED sheet through
`helpers/compiled-sheet.ts`; `test/avatar-structure.test.tsx` holds the two refusals. There is no
state cascade to measure - this family has no state - which is why the drawing file has two halves
where `switch-drawing.test.tsx` has three.

⚠️ **THE RUNS BELOW ARE BARE `pnpm test`, AND THE FIRST EDITION OF THIS TABLE WAS NOT** (layer 1,
MED-3). Every count here was one short, because the runs were `pnpm exec vitest run <subset>` - a
filter I chose rather than the runner's verdict, which is the failure CLAUDE.md names by name. The
row every one of them omitted is `registry.test.ts > carries the CURRENT bytes of every source it
ships`, the byte digest that fires on ANY edit to a registered source. That omission was not
cosmetic: it is exactly the instrument that made five deletions look "caught" when nothing but the
digest saw them (HIGH-2, below). The whole table was re-run at `05aade7` with bare `pnpm test`, each
mutation confirmed landed by a `grep` on the mutated line before the run was read, and the tree
`git status --short`-clean after every revert. Driver and raw output:
`$BATCH_SCRATCH/s2/mutate.py`, `mutate2.py`, `mutations-gate.txt`.

The baseline for every row is `Test Files 29 passed (29) / Tests 540 passed (540)`.

<!-- prettier-ignore-start -->

| mutation | Test Files | Tests | the arms that caught it |
| --- | --- | --- | --- |
| **M-1** the image sizes itself (`h-full w-full` → `h-16 w-16`) | 3 failed \| 26 passed | **5 failed** \| 535 passed | `puts the box on the ROOT's caller and NONE on the part`, `keeps the story's own box on the root`, `avatar/Default`, the play counter, the byte digest |
| **M-2** the root stops opening a container (`@container` dropped) | 2 failed \| 27 passed | **2 failed** \| 538 passed | `opens the container that fallback is measured against`, the byte digest |
| **M-3** the mark's type becomes a literal (the seam → `text-[0.68rem]`) | 3 failed \| 26 passed | **4 failed** \| 536 passed | `carries exactly ONE font-size on the mark, and it is the seam`, `avatar/MarkSize`, the counter, the byte digest |
| **M-4** the mark stops being square (`w-2/5` → `w-1/2`) | 2 failed \| 27 passed | **2 failed** \| 538 passed | `gives the mark one square box on the diagonal, at 40% of the face`, the byte digest |
| **M-5** the mark stops writing `aria-hidden` | 3 failed \| 26 passed | **4 failed** \| 536 passed | `keeps the mark hidden even when the caller asks for it not to be`, `avatar/Default`, the counter, the byte digest |
| **M-6** `edge: "none"` declares `border-0` instead of nothing | 2 failed \| 27 passed | **2 failed** \| 538 passed | `resolves the edge axis to three different widths, one of them nobody's`, the byte digest |
| **M-7** the face stops being an `<img>` (`<img alt>` → `<span aria-label>`) | 3 failed \| 26 passed | **5 failed** \| 535 passed | `lets a SPREAD whose asChild is undefined through`, `avatar/Default`, `avatar/Named`, the counter, the byte digest |
| **M-8** the image loses its ground (`bg-surface`) | 2 failed \| 27 passed | **2 failed** \| 538 passed | `cuts the mark out of the face, and paints a ground under a transparent one`, the byte digest |
| **M-9** the mark loses its cut-out edge (`border-2 border-border-strong`) | 2 failed \| 27 passed | **2 failed** \| 538 passed | same arm, the byte digest |
| **M-10** the mark stops centring its glyph (`place-items-center`) | 2 failed \| 27 passed | **2 failed** \| 538 passed | same arm, the byte digest |
| **M-11** the mark loses its line-height (`leading-none`) | 2 failed \| 27 passed | **2 failed** \| 538 passed | same arm, the byte digest |
| **M-12** the root loses its display (`inline-flex`) | 2 failed \| 27 passed | **2 failed** \| 538 passed | same arm, the byte digest |
| **C-1** `"use client"` stripped from `form.tsx` | 2 failed \| 27 passed | **2 failed** \| 538 passed | `opens every hook-importing file with "use client"`, the byte digest |
| **C-2** a directive `card.tsx` is not entitled to | 2 failed \| 27 passed | **2 failed** \| 538 passed | `does not spend the boundary on a file that is entitled to none`, the byte digest |
| **C-3** `checkbox.tsx` rewritten to `import * as React` + `React.createContext`, directive deleted | 2 failed \| 27 passed | **2 failed** \| 538 passed | `opens every hook-importing file with "use client"`, the byte digest. **This is layer 1's HIGH-1, re-run against the fix: it was GREEN 528/528 before it** |
| **R-1** `z-10` planted on `switch.tsx`'s `nativeInputClass` alone | 2 failed \| 27 passed | **2 failed** \| 538 passed | `gives all THREE families the SAME overlay input, by declaration and not by name`, the byte digest |
| **R-2** `radio-group`'s guard back to bare `"name" in props` | 2 failed \| 27 passed | **2 failed** \| 538 passed | `lets a SPREAD whose name is undefined through, and gives it the group's`, the byte digest |

<!-- prettier-ignore-end -->

⚠️ **M-6 was run TWICE, and both times the first attempt is the one worth recording.** In the
original pass a `replace` matched nothing - prettier had reformatted the line - and the suite came
back `134 passed`, which is exactly what a guard that cannot fail looks like; the `grep -c` that
gates every mutation printed `0`, so the green was discarded rather than believed. In the re-run the
same pattern missed again for the same reason, the driver printed
`!! PATTERN NOT FOUND - mutation NOT applied, result discarded`, and it was re-applied against the
line as prettier writes it. That check is the whole of the difference between a red and a lie.

Two assumptions in the first draft of the drawing test were WRONG and were corrected to what the
sheet says, not the other way round: `rounded-full` compiles to `var(--radius-full)` (a token, at
`9999px`), so "is it a circle" is read as a resolved length over 1000 exactly as
`choice-drawing.test.tsx` reads the radio's; and `h-full w-full` emits `height`/`width` only, no
`min-*`, so the image's floors are asserted absent rather than 100%.

### The pipeline, end to end

`pnpm pack` in both packages (`prepack` is `pnpm -w build:registry && git diff --exit-code -- r`, so
packing at all is the evidence that `r/` is committed and current) → `marquee-ui-ui-0.1.1.tgz`
**90,710 B** (78,083 at the choice families' head) and `marquee-ui-tokens-0.1.0.tgz` 99,608 B,
unchanged → `npm install` of both into a bare project → `shadcn add`:

```
✔ Created 2 files:
  - src/lib/utils.ts
  - src/components/ui/avatar.tsx
```

```
avatar: installed bytes 9767, target components/ui/avatar.tsx
  installed === r/avatar.json content === packages/ui/src/avatar.tsx: True
                                                    sha256 568fcfad7f06 (all three)
utils: installed bytes 1649, target lib/utils.ts   sha256 78a6fb4e43d8 (all three)
packed r/registry.json === repo registry.json: True  (20 items)
npm deps that landed: @radix-ui/react-slot@^1.3.3, class-variance-authority@^0.7.1,
                      clsx@^2.1.1, tailwind-merge@^3.7.0
```

⚠️ The add is by LOCAL PATH (`shadcn@4.21.0 add -y -o ./node_modules/@marquee-ui/ui/r/avatar.json`),
which is DL13's step-1 form. A `components.json` `registries` map spelled
`{"@marquee": "./node_modules/@marquee-ui/ui/r/{name}.json"}` and an item named `@marquee/avatar`
resolved to `https://ui.shadcn.com/r/./node_modules/…` and 404'd - recorded so the next stream does
not spend the round trip.

Then the INSTALLED copy compiled in the bare project's own Tailwind 4 against the published
`@marquee-ui/tokens/tokens.css`, `@source "./components"`:

```
@container                                   container-type: inline-size
text-[length:var(--avatar-mark-size,20cqw)]  font-size: var(--avatar-mark-size,20cqw)   --avatar-mark-size ?
h-2/5                                        height: calc(2 / 5 * 100%)
w-2/5                                        width: calc(2 / 5 * 100%)
-right-[4%]                                  right: calc(4% * -1)
-bottom-[4%]                                 bottom: calc(4% * -1)
rounded-full                                 border-radius: var(--radius-full)          --radius-full 9999px
border-border-strong                         border-color: var(--border-strong)         --border-strong var(--mq-olive-800)
bg-surface                                   background-color: var(--surface)           --surface var(--mq-olive-925)
object-cover                                 object-fit: cover
shrink-0                                     flex-shrink: 0
place-items-center                           place-items: center
leading-none                                 --tw-leading: 1; line-height: 1
h-full                                       height: 100%
w-full                                       width: 100%
text-not-a-role                              (ABSENT)
border-9                                     (ABSENT)
```

`--avatar-mark-size ?` is not a gap: the seam is UNDEFINED on purpose, which is what makes the
`17cqw` fallback the default (the excerpt above prints `20cqw`: it was captured at `220f5ad`, before layer 1's MED-2 moved the default; the mechanism is what it shows, not the number). Every other utility resolves to the ROLE's own variable in the
consumer rather than to a copy of its value, and both negative controls are absent.

### Decisions

1. **`description-list.tsx` buys a client boundary rather than dropping its guards.** [V] Seven test
   arms, two of them unreachable without React context, against a bundle cost on eight `<dl>` sites
   that have not been written yet. Ankit may prefer the other trade; the alternative is named above
   and the docblock's reason 2 is retired in place rather than deleted so the cost stays visible.
2. **No `Tabs` family.** Four rows are `aria-current` link strips the house has already ruled on
   twice in its own source; the fifth is one site whose adoption is a product decision about how it
   announces itself.
3. **`Avatar` declares no size.** Seven boxes over eleven faces, and the consumer's `cn` is a join,
   so a `className` override is not an escape hatch. The caller owns the box and the image fills it.
4. **One shape, always the root.** The two-shape original shipped a sizing bug that four instruments
   missed; the family makes it unrepresentable.
5. **Native `<img>`, no Radix, no new dependency.** [V] Probed, above.
6. **The mark's type is a custom property, not a prop and not a context.** A context would have made
   this file a client module on the day item (1) was fixed - nine of eleven sites are server
   components - and a prop would have to be passed twice. `--avatar-mark-size` is one declaration
   either way.
7. **`AvatarBadge` is not `Badge` with a rounded corner.** `Badge` is a micro-caps status token with
   a tone axis and a tap-floor note; this is a ~40%-of-a-circle mark with no type of its own.
8. **No version bump.** [V] `0.1.1` stands; this family rides LIB-VENDOR-0.1.2 with the six already
   waiting and with the client-boundary fix, which is what makes 0.1.2 the gate for `/pile`'s Form
   consumption and for Checkbox's and RadioGroup's thepile halves.

### thepile inputs

**Nothing in thepile changed this batch.** This section is the checklist the consumption owes, in
the Switch's shape, with every count read HIT BY HIT rather than by `grep -c`.

**The instruments the consumption must keep green**, enumerated at `8a2dc618` over
`apps/web/src/**/*.test.tsx` and `e2e/*.spec.ts`:

- `data-testid="avatar-image"` - **16 assertions and 1 comment**, all on the family this part
  replaces. `Avatar.test.tsx:19,43,54` (the three branches' `src`); `FacePicker.test.tsx:136,171,188,503`
  (the 96 preview, reached through `<Avatar>`); `e2e/members.spec.ts:395,409,431` (one per row, the
  `src` per handle) plus the comment at `:61` explaining why the locator is row-scoped;
  `e2e/profile-edit.spec.ts:54,72,84,111,195,206` (including `:54`'s
  `boundingBox().height ≈ 96`, the arm that exists because the two-shape sizing bug was invisible
  to everything else). **Every one of them resolves a face this family replaces.** The testid is the
  consumption's to keep: the part writes `data-slot="avatar-image"` and spreads the caller's props,
  so a wrapper keeps `data-testid` with no library change.
- `data-testid="avatar-initial-badge"` - **11 assertions**. `Avatar.test.tsx:30,48,57,110`;
  `Byline.test.tsx:61` (the glyph has NO badge - the arm that pins decision 4);
  `e2e/members.spec.ts:435`; `e2e/profile-edit.spec.ts:53,117,123,170,211`, of which `:123` reads the
  badge's own `boundingBox()`. All resolve the mark `AvatarBadge` replaces.
- `data-testid="member-glyph"` - **5 assertions, 1 comment, 1 selector constant**.
  `Byline.test.tsx:23,35,45`; `FeedItem.test.tsx:106,107` (the row has exactly one glyph and no other
  `img`); `e2e/feed.spec.ts:287` (a comment) and `:300`, where `COVER_IMG` is
  `img:not([data-testid="member-glyph"])` - **a glyph that stopped carrying that testid would make
  every feed row's cover count wrong**, which is the one instrument here that fails in a direction
  nobody would read as an avatar change.
- `data-testid="top-bar-avatar-image"` - **4 assertions**, `TopBar.test.tsx:184,205,222,249`. A
  SEPARATE testid for a separate face; `:184` asserts the string is ABSENT before hydration, so it
  is a substring assertion on rendered HTML and not a locator.
- `data-testid="face-option"` - `FacePicker.test.tsx:33` (the helper every grid arm goes through).
  The grid is DL13's `RadioGroup` site, so this one is shared with that consumption.

**`Avatar.test.tsx`'s seven arms, mapped:**

| arm                                                                                                              | the part's, or the consumption's?                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `:16` draws the DEFAULT face: `/avatar/pixel/nova.svg`, `alt=""`, not the media domain                           | **consumption** for the URL (`defaultFaceKey` + `mediaUrl` are product data), **part** for `alt=""`, which `avatar.stories.tsx`'s `Default` play asserts                                                                                                                                                                                                                                                                              |
| `:27` the initial in a badge, `aria-hidden`, `h-2/5 w-2/5`, `-right-[4%] -bottom-[4%]`                           | **part**, and it becomes a RESOLVED assertion rather than four `toContain`s: `avatar-drawing.test.tsx` reads the square box and the equal offsets out of the compiled sheet                                                                                                                                                                                                                                                           |
| `:40` a PICKED face, and NO badge                                                                                | **consumption**: which branch renders a mark is the product's rule (decision 3, "you chose it, it is you"), and the part makes the mark optional by composition                                                                                                                                                                                                                                                                       |
| `:51` an UPLOADED avatar from the media host, no badge                                                           | **consumption**, same                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `:60` never a bare letter: every member is an image                                                              | **both.** The product's half is that `avatarKey` always resolves; the part's half is that the face is an `<img>` and not a `background-image`, which the `Default` play asserts and M-7 reddened                                                                                                                                                                                                                                      |
| `:68` every size in the map sizes all three branches the same, and the keyed branch carries NO `h-full`/`w-full` | ⚠️ **this arm is about a fork that no longer exists.** With one shape the box is on the root at every size and the image is always `h-full w-full`, so the arm's second half becomes untrue BY DESIGN. The consumption rewrites it as "the root carries the caller's box at every size"; it must not be deleted, and the part's own `puts the box on the ROOT's caller` is the half that moves here                                   |
| `:99` the badge scales with the face, thinner-bordered at the two small sizes                                    | **consumption.** Five mockup values, non-linear; they arrive as `[--avatar-mark-size:…]` on the root per size, and the thinner border at 28/34 is a `border-[1.5px]` the caller passes - which COLLIDES with the part's `border-2` under thepile's join `cn`, so this one needs the consumption to pick: pass the mark a `border` seam, or accept 2px at the two small sizes. **Named here as the one open collision, not resolved.** |

**The two siblings and the grid, DECIDED - the consumption's call, with the part's allowance stated:**

- `home/Byline.tsx` `MemberGlyph` (26px, 1px edge, no mark) → ~~**takes the part**~~ (⚠️ MEASURED OUT, thepile DL19, see below):
  `<Avatar className="h-[26px] w-[26px]"><AvatarImage src={…} edge="thin"/></Avatar>`. The `edge`
  axis exists FOR this face. Its `data-testid="member-glyph"` rides on `AvatarImage`'s prop spread,
  which keeps `FeedItem.test.tsx:106` and `e2e/feed.spec.ts:300` green with no library change.
- `shell/TopBar.tsx:163-190` (36px, gradient ring wrapper, no edge, no mark) → ~~**takes the part**~~ (⚠️ MEASURED OUT, thepile DL19, see below):
  the gradient span IS `<Avatar className="h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br …">`
  and the `<img>` is `<AvatarImage edge="none" className="bg-raised"/>`. ⚠️ `bg-raised` over the
  part's `bg-surface` is a second `background-color` on one element under a join `cn`; the
  consumption either drops it (the wrapper's gradient is already behind the face) or the part owes a
  ground seam. **The part allows the composition; it does not allow the override.**
  ⚠️ **BOTH SIBLINGS MEASURED OUT (thepile batch DL19, 2026-09-23; `docs/slices/DESIGN-LIB-f-shell-faces.md` there), and
  neither is a library defect.** The glyph: `SearchInput` is its ONE client consumer, so the part's client bytes
  (this module plus `class-variance-authority`) join `/search`'s first load and put it 1.1 to 1.2 kB OVER its budget
  in every form tried on four builds (root + root, root + image-only, the top bar untouched + root, image-only with
  the box as inline declarations); it stays hand-drawn until that budget is raised, the consuming product's
  decision. The top bar: the image-only form (`AvatarImage edge="none" ground="raised"` inside the untouched
  gradient span, the FacePicker form above) draws a 1px accent ring at the rim - the part's `rounded-full`
  softens the image's edge and the span's gradient shows through it (122 of 1,936 pixels, max channel delta 89,
  `border-radius` 0 → 9999px the one style that moved) - and the shell pays +2.8 kB gzipped on EVERY page (this
  module, a chunk carrying `@radix-ui/react-slot`, the root layout re-split), which the product's
  `perf-budget.mjs` cannot see because it counts no root-layout chunk. The ring's mechanism is a part that
  rounds itself inside a caller's clip; a radius seam on `AvatarImage` would close the ring and not the
  bytes, so it is recorded here and not taken. The `ground` axis the bullet above asked for shipped at 0.1.3
  (DESIGN-LIB-d-command §1) and stands; the `className="bg-raised"` override it warned against is no longer
  what a consumer would write.
- `profile/FacePicker.tsx:318-347` the face grid → **takes `AvatarImage` and NOT `Avatar`**: there
  is no mark and no positioning to establish, and DL13 already gave the `<li>` to
  `RadioGroupItem` + `RadioGroupInput`. The selected ring is
  `group-has-checked/radio:*` on the image - a DIFFERENT utility name from the part's own
  `border-border-strong`, so those do not collide - which is the composition
  `radio-group.tsx`'s docblock already names ("`group-has-checked/radio:ring-2` on an avatar").
- `profile/NetworkStrip.tsx:146` and `search/StartSomewhere.tsx:127` → the two ring wrappers
  BECOME the root: `<Avatar role="img" aria-label={"@"+handle} className="-mr-2 ring-2 ring-bg">`,
  which is the `Stack` story exactly. Two components that today do not import each other stop
  disagreeing about an idiom.

**The shots-visible list** - every screen that films a face, ids confirmed present in
`e2e/shots/manifest.ts` at `8a2dc618`: `search` (`:125`), `profile` (`:239`), `member-lists`
(`:297`), `member-tier-lists` (`:307`), `followers-public` (`:404`), `feed` (`:423`), `members`
(`:437`), `members-signed-in` (`:458`). **Eight.** The consumption is a pixel change on all eight if
the 28px badge's border moves, and a pixel change on none of them if the checklist's two collisions
are resolved by composition rather than by override. No prediction is made here: the reconciler
measures on the merged tree.

**The drift test.** `scripts/marquee-drift.test.ts` compares each INSTALLED copy against the
vendored tarball's `r/`, which is `@marquee-ui/ui` **0.1.1** and therefore does not contain this
item at all. At the DL14 merge head its `CONSUMED` list gains `form` (s1's route), and possibly
`alert` - so it is seven at this stream's base (`button, input, label, sheet, toast, ribbon,
switch`) and eight or nine at the merge head, and the docblock's "seven are installed" / "the nine
that have no thepile call site" move with it. `avatar` joins neither list this batch: it is not in
the vendored tarball, so the item count the drift test reads ("SEVENTEEN ship") is the TARBALL's and
does not move either. It moves when LIB-VENDOR-0.1.2 lands, and that is the commit where `avatar`
becomes installable in thepile at all.

### Consumers

**Run 1, before any code**, was the scan script against an EMPTY diff, so it printed zero names by
construction and is recorded as what it is. The enumeration that did the work at that point was by
hand, over the surface the brief named:

- the four `src/*.tsx` files the directive touches are named by `registry.json`, their own
  `packages/ui/r/*.json`, `packages/ui/r/registry.json`, `packages/tokens/test/helpers/source-files.ts`
  and `docs/as-built.md` - so `pnpm build:registry` is a REQUIRED step of that commit, not a tidy
  after it (`registry.test.ts`'s `carries the CURRENT bytes of every source it ships` is the arm);
- `avatar` collides with no exported name in the package (`git grep -i -w avatar` over `packages`,
  `registry.json`, `README.md`, `AGENTS.md` printed three PROSE hits and no symbol);
- `"use client"` is read by nothing in `packages/` but the three files that carry it.

**Run 2, at the commit point** (`220f5ad`, diff `0b56bf49...HEAD`), full output in
`$BATCH_SCRATCH/s2/scan-run2.txt`:

- **Scan 1, exported symbols: 14 names.** Seven are the family's (`Avatar`, `AvatarImage`,
  `AvatarBadge`, `avatarImageVariants`, and the three `*Props`), and every reader of each is inside
  `packages/ui/{src,stories,test}` plus `registry.json` and `packages/ui/r/`. Seven are STORY names
  (`Default`, `NoBadge`, `Named`, `Edges`, `MarkSize`, `AsChildLink`, `Stack`); `Default` and
  `AsChildLink` are also story names in other families' modules, which is not a collision - the
  suites map is keyed by module and `stories.test.tsx` ids are `${family}/${story}`.
- **Scan 2, the entry point**: `src/index.ts` +9, and `entry-point.test.ts` walks `src` on disk, so
  the new file's exports are checked by it without an edit.
- **Scan 3, the path-naming lists**: `source-files.ts` +2 (the source and the story),
  `story-suites.ts` +2, `registry.json` +15. All three are the lists that redden until a new file is
  declared; that edit IS the review, per `AGENTS.md`.
- **Scan 4, role/aria strings**: `aria-hidden="true"` (new, the mark), `aria-label="Nova's profile"`
  (the `AsChildLink` story), `aria-label="Rules"` (the LOW-7 arm), `aria-checked="true"` (moved text
  in `switch-drawing.test.tsx`, unchanged). None of them is a string any thepile spec resolves,
  because nothing in thepile consumes this family yet.
- **Scan 5, tests naming a touched path**: `registry.json`, which `registry.test.ts` reads as data.
- **CROSS: 0. UNOWNED: 0. NEW between the runs: 14**, in the trivial sense that run 1's diff was
  empty; nothing in run 2 was outside the by-hand enumeration above.

## Layer 1 (reviewer r6, detached worktree of 163ab5d7, marquee-ui, no database)

**Thirteen findings: 2 HIGH, 3 MED, 8 LOW**, over **58 mutations**. Its full report is
`$BATCH_SCRATCH/r6/report.md`. Its baseline on the committed head was `pnpm test`
**29 files / 528 tests**, `pnpm typecheck` exit 0 and `pnpm lint` exit 0, and it re-read the branch
head at the end (`git rev-parse s/design-lib-d-avatar` -> `163ab5d7…`, **unmoved**), so every
finding is against the head as it stood. The as-built prose and the gate are, by construction,
unreviewed by it.

**Both HIGHs are accepted and FIXED, and both are the same failure in two shapes: an instrument that
could not see the thing its docblock said it saw.**

⚠️ **And instrumenting one of them found a defect neither of us was looking for.** HIGH-2's fifth
deletable class was `leading-none` on the mark - and the arm written to catch it went red against
the UNMUTATED tree, because this package's `cn` is a tailwind-merge whose `font-size` group
conflicts with `leading`, so the `text-*` written after it had been deleting it since the family was
written. The class had never been on the element. A GREEN mutation row is not only a weak test; it
is sometimes a live bug wearing one.

**What changed, per finding:**

| finding                                                                                                                            | disposition                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **HIGH-1** `client-boundary.test.ts` blind to `import * as React` + `React.createContext`, which is upstream shadcn's own spelling | **FIXED.** The parser reads the namespace form too, and a nine-row table exercises its bounds (multi-line, no-space braces, aliases, `type`-only, `useId`, namespace) instead of describing them. The reviewer's own C3 re-run is row **C-3** above: **red 2** where it was GREEN 528/528                                                                                                                                                                                            |
| **HIGH-2** five classes on `avatar.tsx` deletable with the suite green, four docblocked as load-bearing                            | **FIXED.** A new arm, `cuts the mark out of the face, and paints a ground under a transparent one`, reads the image's `background-color`, the mark's `border-width`/`border-color`/`place-items`/`line-height` and the root's `display`. Rows **M-8**…**M-12**                                                                                                                                                                                                                       |
| **MED-1** the `@container` note claimed a no-op the drawing test proved; neither was true                                          | **FIXED, as prose.** The containment's real consequence is stated (an unsized root collapses to zero, silently) and the false claim is deleted from both `avatar.tsx` and this record. **Not** fixed with a story: a deliberately-broken avatar is a bad thing for a consumer to copy, and the contract - `<Avatar>` owes a box - is the honest artefact instead                                                                                                                     |
| **MED-2** `20cqw` is a number someone liked, and the paragraph defending it held the numbers contradicting it                      | **FIXED.** The default is `17cqw`, the median of the five measured sites, and it is described as a median of a ratio that falls with size rather than as a rule                                                                                                                                                                                                                                                                                                                      |
| **MED-3** every recorded red was one short; the runs were `vitest run <subset>`, not the gate                                      | **FIXED.** All seventeen re-run with bare `pnpm test` at `05aade7`; the table above is that run, with the byte-digest row named in every one                                                                                                                                                                                                                                                                                                                                         |
| **LOW-1** the barrel's `type` re-exports unguarded (a pre-existing hole my diff enlarged by three names)                           | **FIXED.** `entry-point.test.ts` gains a SOURCE scan of `index.ts`, the only instrument that can see a compile-time-only name. The reviewer's M25 now reddens, naming all three                                                                                                                                                                                                                                                                                                      |
| **LOW-2** `has()` has no instrument and its stated failure mode is unreachable on this tree                                        | **FIXED, as prose.** The docblock says it is defensive, records the probe (no class in the sheet has an empty body), and no longer claims "the difference is real"                                                                                                                                                                                                                                                                                                                   |
| **LOW-3** `compiled-sheet.ts`'s "latent today" is false                                                                            | **FIXED.** The comment points at `choice-drawing.test.tsx:84`, which pins it                                                                                                                                                                                                                                                                                                                                                                                                         |
| **LOW-4** a `$BATCH_SCRATCH` path shipped inside `r/avatar.json` to every consumer                                                 | **FIXED.** The citation is gone from the source; the probe's result stays there and its path stays here, in the record, which does not ship                                                                                                                                                                                                                                                                                                                                          |
| **LOW-5** two more product nouns in a file that ships verbatim                                                                     | **FIXED.** Generalised to "a stat cell, an inline figure, a labelled fact"                                                                                                                                                                                                                                                                                                                                                                                                           |
| **LOW-6** "a `var()` cannot be fought that way" overstates the seam                                                                | **FIXED.** It is a route around the collision, not an immunity                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **LOW-7** `flattened()`'s no-`@layer` throw has never been shown able to fire                                                      | **RECORDED, not fixed.** Pre-existing, moved by this diff rather than written by it, and defensible as a tripwire. Naming it is the honest cost                                                                                                                                                                                                                                                                                                                                      |
| **LOW-8** a bare `pnpm test` on a cold tree silently SKIPS the four sheet-reading files                                            | **RECORDED, not fixed, and it is the one worth carrying forward.** `pnpm verify` builds first, so the gate is safe - but a stream that runs `pnpm test` before `pnpm -r build` gets `13 skipped` / `11 skipped` / `8 skipped` and a green-looking run in which the entire new drawing file asserted nothing. The fix belongs in `loadCompiledSheet` (a hard failure when the tokens stylesheet is unresolvable) or in `AGENTS.md`, and it is a REQUEST rather than this slice's edit |

**On the three judgement calls the reviewer was asked to attack**, it agreed with all three verdicts
and improved two of the reasons. It confirmed there is no server-safe construction that keeps
`DescriptionList`'s seven guard arms (all four parts READ the context, so a provider/cell split does
not help; a module-scope depth counter is unsafe under concurrent rendering; and Next's loader reads
the IMPORT, not the call, so a dev-only guard does not help either). It confirmed the no-size-axis
decision and pointed out that `AvatarImage`'s `src: string` shows the family will use the type
system for a contract while the missing box gets nothing - which is MED-1's finding from the other
end. And on the mark's font it separated the mechanism (well tested) from the number (not measured),
which is MED-2.

### The collapse / no-op mutation table, verbatim

<!-- prettier-ignore-start -->

| file | test | mutation applied | red / GREEN | what it asserts now |
| --- | --- | --- | --- | --- |
| src/avatar.tsx | opens the container that fallback is measured against | M1 drop `@container` from the root | red 2 | — |
| src/avatar.tsx | puts the box on the ROOT's caller and NONE on the part | M2 root gains `h-10 w-10` | red 2 | — |
| src/avatar.tsx | puts the box on the ROOT's caller… / keeps the story's own box | M3 image `h-full w-full` → `h-4 w-4` | red 3 | — |
| src/avatar.tsx | carries exactly ONE font-size on the mark / avatar/MarkSize / the counter | M4 seam → `text-xs` | red 4 | — |
| src/avatar.tsx | gives the mark one square box on the diagonal | M5 `-right-[4%] -bottom-[4%]` → positive | red 2 | — |
| src/avatar.tsx | gives the mark one square box on the diagonal | M6 `h-2/5` → `h-1/2` | red 2 | — |
| src/avatar.tsx | resolves the edge axis to three different widths / avatar/Edges / the counter | M7 `edge.thin` collapsed onto `edge.default` | red 4 | — |
| src/avatar.tsx | resolves the edge axis to three different widths | M8 `edge.none` `""` → `border-0` | red 2 | — |
| src/avatar.tsx | draws both circles with the same corner | M9 mark `rounded-full` → `rounded-md` | red 2 | — |
| src/avatar.tsx | draws both circles with the same corner, and the face with object-fit | M10 drop `object-cover` | red 2 | — |
| src/avatar.tsx | (none) | M11 drop `bg-surface` from the image | **GREEN** (only the registry byte digest) | nothing observes the image's ground |
| src/avatar.tsx | avatar/Stack / the counter | M12 drop `shrink-0` from the root | red 3 | — |
| src/avatar.tsx | avatar/NoBadge / avatar/AsChildLink / the counter | M13 drop `relative` from the root | red 4 | — |
| src/avatar.tsx | (none) | M14 drop `inline-flex` from the root | **GREEN** (only the registry byte digest) | nothing observes the root's display |
| src/avatar.tsx | (none) | M15 drop `grid place-items-center` from the mark | **GREEN** (only the registry byte digest) | nothing observes the glyph being centred |
| src/avatar.tsx | (none) | M16 drop `leading-none` from the mark | **GREEN** (only the registry byte digest) | nothing observes the mark's line-height |
| src/avatar.tsx | (none) | M17 drop the mark's `border-2 border-border-strong` | **GREEN** (only the registry byte digest) | nothing observes the cut-out edge |
| src/avatar.tsx | keeps the mark hidden even when the caller asks for it not to be | M18 `aria-hidden` written BEFORE the spread | red 2 | — |
| src/avatar.tsx | refuses it on the image / refuses it on the mark | M19 `refuseAsChild` made a no-op | red 3 | — |
| src/avatar.tsx | lets a SPREAD whose asChild is undefined through, in both parts | M20 guard back to bare `"asChild" in props` | red 2 | — |
| src/avatar.tsx | avatar/Default / the counter | M21 `alt = ""` default removed | red 3 | — |
| src/avatar.tsx | measures every one of them at or above the floor / avatar/AsChildLink / the counter | M22 `asChild` made a no-op (`Host` always `"span"`) | red 4 | — |
| src/avatar.tsx + r/avatar.json | (none) | **M23 combined M11+M14+M15+M17 with the registry re-synced** | **GREEN 29 files / 528 tests passed** | five classes, four of them docblocked as load-bearing, deletable in silence |
| src/index.ts | re-exports every value each part file exports, by name | M24 the whole avatar export block deleted | red 1 | — |
| src/index.ts | (none) | **M25 only the three `type Avatar*` re-exports deleted** | **GREEN 528 passed + typecheck exit 0** | the barrel's type surface is unguarded |
| test/helpers/story-suites.ts | covers all nineteen part families / the counter | M26 `avatar` removed from `STORY_SUITES` | red 2 | — |
| packages/tokens/test/helpers/source-files.ts | walks exactly the published set / the declared stories / +2 | M27 both avatar paths removed | red 4 | — |
| stories/avatar.stories.tsx | avatar/Default / the counter | M28 `AvatarBadge` deleted from `Default` | red 2 | — |
| stories/avatar.stories.tsx | avatar/NoBadge / the counter | M29 `AvatarImage` deleted from `NoBadge` | red 2 | — |
| stories/avatar.stories.tsx | covers all nineteen… / the counter | M30 the whole `Edges` story deleted | red 2 | — |
| stories/avatar.stories.tsx | runs all 72 play functions | M31 `Stack`'s play deleted, story kept | red 1 | — |
| registry.json | 7 registry arms | M32 the `avatar` item removed | red 7 | — |
| packages/ui/r/avatar.json | has one file per item / current bytes / title+deps | M33 the built item file deleted | red 3 | — |
| test/stories.test.tsx | covers all nineteen… / runs all 65 play functions | M34 both counters rolled back to 101→94, 72→65 | red 2 | — |
| src/avatar.tsx | opens the container / keeps the story's box / 5 plays / the counter | M35 root `data-slot` renamed (every root lookup misses) | red 9 | — |
| test/avatar-drawing.test.tsx | 4 arms incl. its own anchor | M36 `fraction()` collapsed to a constant `0.4` | red 4 | — |
| test/avatar-drawing.test.tsx | 6 arms incl. its own anchor | M37 `bare()` returns three empty class lists | red 6 | — |
| test/avatar-drawing.test.tsx | resolves the edge axis to three different widths | M38 `imageAt()` returns `[]` for every edge | red 1 | — |
| src/avatar.tsx | carries exactly ONE font-size / avatar/MarkSize / the counter | M39 default `20cqw` → `5cqw` | red 4 | — |
| src/avatar.tsx | carries exactly ONE font-size / avatar/MarkSize / the counter | M40 the `20cqw` fallback dropped entirely | red 4 | — |
| src/form.tsx | opens every hook-importing file with "use client" | C1 the directive removed | red 2 | — |
| src/button.tsx | does not spend the boundary on a file that is entitled to none | C2 a directive it is not entitled to | red 2 | — |
| src/checkbox.tsx | (none) | **C3 `import * as React` + `React.createContext`, directive deleted** | **GREEN** (only the registry byte digest) | the guard cannot see a namespace import |
| src/checkbox.tsx + r/checkbox.json | (none) | **C3b same as C3 with the registry re-synced** | **GREEN 29 files / 528 tests passed** | shadcn's own import spelling defeats the guard |
| src/checkbox.tsx | opens every hook-importing file with "use client" | C4 MULTI-LINE hook import, directive removed | red 2 | — |
| src/checkbox.tsx | opens every hook-importing file with "use client" | C5 directive written `'use client';` | red 2 | — |
| src/checkbox.tsx | opens every hook-importing file with "use client" | C6 hooks imported under aliases (`createContext as mk`) | red 2 | — |
| test/client-boundary.test.ts | found real sources, and the predicate partitions them / arm 3 | C7 `moduleEntry()` always returns null | red 2 | — |
| test/client-boundary.test.ts | found real sources, and the predicate partitions them / arm 3 | C8 `needsBoundary()` collapsed to `[]` | red 2 | — |
| test/helpers/compiled-sheet.ts | (none) | **H1 `has()` reverted to `rule(name) !== ""`** | **GREEN 528 passed** | the stated difference has no instrument, and no class in the sheet has an empty body (probed: `[]`) |
| test/helpers/compiled-sheet.ts | 4 selector arms in switch-drawing / choice-drawing | H2 `selectorsOf()` collapsed to `[]` | red 4 | — |
| test/helpers/compiled-sheet.ts | choice-drawing: found a real drawing to measure | H3 `lengthPx` loses the second `calc()` operand order | red 1 (`expected null to be 24`) | — |
| test/helpers/compiled-sheet.ts | (none) | **H4 `flattened()` loses its no-`@layer` throw** | **GREEN 528 passed** | a tripwire that has never been shown able to fire |
| test/helpers/compiled-sheet.ts | 53 arms across 4 files | H5 `rule()` always returns `""` | red 53 | — |
| src/radio-group.tsx | lets a SPREAD whose name is undefined through, and gives it the group's | R1 guard reverted to bare `"name" in props` | red 2 | — |
| src/switch.tsx | gives all THREE families the SAME overlay input | R2 `nativeInputClass` drifts from the checkbox's | red 2 | — |
| src/avatar.tsx | as-built M-1 verbatim (`h-full w-full` → `h-16 w-16`) | as-built records **red 4** | red **5** | the omitted row is `carries the CURRENT bytes of every source it ships` |
| src/avatar.tsx | as-built M-3 verbatim (seam → `text-[0.68rem]`) | as-built records **red 3** | red **4** | same |
| src/avatar.tsx | as-built M-7 verbatim (`<img alt>` → `<span aria-label>`) | as-built records **red 4** | red **5** | same |

<!-- prettier-ignore-end -->

## LIB-VENDOR-0.1.2: `@marquee-ui/ui` 0.1.2, two carry-ins before the pack (2026-09-21)

Batch DL15, stream s1, branch `s/lib-vendor-0.1.2` from `next` @
`f960fea9604b2a888916227403c80c72f81f4ba3`. Four commits here: LOW-8's named cold-tree failure,
REQUEST A's focus outline, the version line, and this block. The consuming half lives in thepile's
`docs/slices/LIB-VENDOR-0.1.2.md`.

### What the bump carries

Three part families and one directive shipped since `ui@0.1.1` (`c99b71e`), plus the two carry-ins
this stream did first:

| item                                                                                              | family                           | landed                     |
| ------------------------------------------------------------------------------------------------- | -------------------------------- | -------------------------- |
| `avatar`                                                                                          | `Avatar`                         | DESIGN-LIB-d, 2026-09-21   |
| `checkbox`                                                                                        | `Checkbox`                       | DESIGN-LIB-d-choice, 09-20 |
| `radio-group`                                                                                     | `RadioGroup`                     | DESIGN-LIB-d-choice, 09-20 |
| `"use client"` on four parts (`form`, `description-list`, `accordion`, and the choice pair's own) | -                                | DL13/DL14                  |
| LOW-8                                                                                             | `test/helpers/compiled-sheet.ts` | this stream                |
| REQUEST A                                                                                         | `Switch`, `Accordion`            | this stream                |

`git diff --stat c99b71e HEAD -- packages/ui/src packages/ui/r packages/ui/package.json` at the bump
is **17 files changed, 958 insertions(+), 18 deletions(-)**. Of the nine items thepile consumes
(`scripts/marquee-drift.test.ts`) exactly TWO moved: `form` (+2, the directive only) and `switch`
(REQUEST A's focus classes). `dependencies` is unchanged at eight names, so the consumer's lockfile
moves by the tarball's integrity alone.

**Twenty items, nineteen families**, read from the shipped index rather than assumed:
`packages/ui/r/registry.json` holds 20 items and `packages/ui/r` holds 21 files (the 20 plus the
index). Minus `utils` - the `cn` helper, not a family - that is nineteen, so `package.json`'s
`"nineteen part families"` description was already true at `f960fea` and the bump does not touch it.
⚠️ The DL15 composition (g) said "22 items in 23 files" and flagged it UNVERIFIED; the read is 20
and 21, and thepile's drift complement is therefore ELEVEN names, not fourteen.

**`pnpm build:registry` after the version line leaves `packages/ui/r` byte-unchanged** (`git status
--short` prints `packages/ui/package.json` alone): the built index does not carry the package
version, so the version line is the whole of that commit. The registry DID move in REQUEST A's
commit - `r/switch.json` and `r/accordion.json`, rebuilt and committed beside their sources.

### LOW-8: the cold tree's sheet-reading tests, and what was actually wrong

⚠️ **Two claims in the record this fixes were wrong, and both were measured rather than argued.**

1. `as-built.md:6106` says a bare `pnpm test` on a cold tree gives "`13 skipped` / `11 skipped` /
   `8 skipped` and a green-looking run". **The run is not green.** Measured in a detached worktree
   of `f960fea` with no `packages/tokens/dist`, the four sheet-readers alone:

   ```
   $ pnpm exec vitest run --project ui \
       packages/ui/test/{switch-drawing,choice-drawing,avatar-drawing,tailwind-compile}.test.tsx
    ❯ |ui| packages/ui/test/avatar-drawing.test.tsx    (9 tests  | 9 skipped)
    ❯ |ui| packages/ui/test/switch-drawing.test.tsx   (13 tests | 13 skipped)
    ❯ |ui| packages/ui/test/choice-drawing.test.tsx   (11 tests | 11 skipped)
    ❯ |ui| packages/ui/test/tailwind-compile.test.tsx (40 tests | 40 skipped)
    Test Files  4 failed (4)
         Tests  73 skipped (73)                                          # exit 1
   ```

   So the defect is the REPORTING, not the exit code: `Tests 73 skipped (73)`, nothing failed and
   nothing passed, is the same test-level line a deliberate `it.skip` prints. The counts are
   13 / 11 / **9** / **40** = 73; "8" had moved and the 40 was never in the record at all. The whole
   suite on the same tree is `Test Files 7 failed | 23 passed (30)` / `Tests 1 failed | 452 passed |
73 skipped (526)` - the other three are `merge-theme`, `storybook-preview` and the tokens
   package's `emitted-surface`, all on the same missing `dist/`.

2. The mechanism, which the composition marked UNVERIFIED: not a missing fixture and not a swallowed
   skip. `loadCompiledSheet` is awaited from a `beforeAll`, and the compile throws
   `CssSyntaxError: tailwindcss: …/compile.css:1:1: Package path ./tokens.css is exported from
package …/@marquee-ui/tokens, but no valid target file was found (see exports field …)`. vitest
   attributes a `beforeAll` throw to the FILE and marks every test inside it skipped. So: an
   `@import` that resolved to nothing, named by a manifest key rather than by the build step.

⚠️ **And the DL15 row's own command is a no-op.** `pnpm --filter @marquee-ui/ui test` exits **0**
with no output: `packages/ui` has no `test` script, the runner is the ROOT's `vitest run`. The
repro command is `pnpm test`, or `pnpm exec vitest run --project ui <files>`.

**The fix**: `loadCompiledSheet` resolves every `@import` in the fixture BEFORE the compile - a bare
specifier through `createRequire(fixture).resolve` (which honours the same `exports` map Tailwind
walks), a relative one through `existsSync` - and throws `merge-theme.test.ts:17-19`'s own named
error otherwise. One guard in the shared helper, so all four readers inherit it.

| run (cold, `packages/tokens/dist` absent, detached worktree)                                                  | what the runner said                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| at `f960fea`, before                                                                                          | `CssSyntaxError: tailwindcss: … Package path ./tokens.css is exported from package … but no valid target file was found (see exports field …)`                                                                                                                                                                                                                                                                                                 |
| at `8004ae1f`, after                                                                                          | `Error: the compile fixture's `@import "@marquee-ui/tokens/tokens.css"`resolves to nothing. The tokens stylesheet is BUILT output, so a cold checkout has none: run`pnpm build`(or`pnpm --filter @marquee-ui/tokens build`) before `pnpm test`. Every test in this file reports as SKIPPED rather than failed - that is vitest's handling of a `beforeAll` throw and this guard does not change it - so this message is what tells you which.` |
| the relative arm, proved separately: `src/ribbon.css` moved aside in the same detached worktree, tokens BUILT | `Error: the compile fixture's `@import "../../src/ribbon.css"` resolves to nothing: /…/packages/ui/src/ribbon.css is missing. …`                                                                                                                                                                                                                                                                                                               |
| warm, same sha                                                                                                | `Test Files 4 passed (4)` / `Tests 73 passed (73)` - the guard does not fire on a built tree                                                                                                                                                                                                                                                                                                                                                   |

The tests still report as `skipped` rather than `failed`: that is vitest's handling of a `beforeAll`
throw and it is not the helper's to change. What the fix buys is the MESSAGE beside the count.
`AGENTS.md` gained the one line it had nowhere: a bare `pnpm test` needs `pnpm build` first.

⚠️ **The reader count moved inside this slice, so the record says it as a command, not a number.**
`focus-outline.test.tsx` is a FIFTH reader, added by the next commit, so the cold run is `4 failed` /
`73 skipped` at `f960fea` and **`5 failed` / `80 skipped`** at the head (layer 1, LOW-2, confirmed in
its own cold worktree). `git grep -l loadCompiledSheet packages/ui/test` is the list. `AGENTS.md`
also gained the second line it had nowhere: `pnpm --filter @marquee-ui/ui test` is a no-op.

### REQUEST A: the focus indicator survives forced colors

The verdict this closes is thepile's `docs/slices/FOLLOWUPS-3.md:260-320` - the Switch measured in a
real browser under `emulateMedia({ forcedColors: "active" })`, with transitions disabled: the part
read `outline-style: none` and `box-shadow: none`, i.e. **no visible focus indicator at all**, while
a plain `button` beside it under the consumer's house rule kept its 2px solid outline.
`AccordionTrigger` carried the identical `focus-visible:outline-none focus-visible:shadow-focus-ring`
pair. `command grep -rn 'outline-none' packages/ui/src` finds four hits at the base, the other two
being `input.tsx:6` and `sheet.tsx:67` (below).

⚠️ **THAT SWEEP WAS THE WRONG ONE, AND IT MISSED TWO PARTS.** `outline-none` is only one of two
routes to "no indicator under forced colors". The other is "the focusable element is `opacity-0` and
the row draws only a shadow", which needs no opt-out at all - and which is precisely what the
Switch's LABEL host was. Layer 1 (HIGH-1) found it on `checkbox.tsx:77` and `radio-group.tsx:121`,
**two of the three items this very bump adds to the registry**, by the project's own instrument. The
sweep that finds it is the second one, and both now live in the guard rather than in a grep:
`command grep -rno 'shadow-focus-ring' packages/ui/src` and, for each hit, whether an outline is
declared under the SAME variant. See "The known gaps" below.

**What changed**: `focus-visible:outline-none` → `focus-visible:outline-2
focus-visible:outline-offset-2 focus-visible:outline-primary` on both sites, plus the
`has-focus-visible:` triple on the switch row, because the label host's focused element is the
`opacity-0` `SwitchInput` and the row is what carries the indicator. **The shadow ring is kept** on
every one of them: the outline is the half that survives forced colors, the shadow is the dark inner
separator that makes the ring readable over cover art.

**What Tailwind v4 emits, READ from the compiled sheet rather than typed** (the composition's guess
was right, and the guard asserts the emitted spelling, never a typed `solid`):

| class                                    | declarations                                                 | selector                                            |
| ---------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------- |
| `focus-visible:outline-2`                | `outline-style: var(--tw-outline-style); outline-width: 2px` | `.focus-visible\:outline-2:focus-visible`           |
| `focus-visible:outline-offset-2`         | `outline-offset: 2px`                                        | `.focus-visible\:outline-offset-2:focus-visible`    |
| `focus-visible:outline-primary`          | `outline-color: var(--primary)`                              | `.focus-visible\:outline-primary:focus-visible`     |
| `has-focus-visible:outline-2`            | the same two                                                 | `.has-focus-visible\:outline-2:has(:focus-visible)` |
| `focus-visible:outline-none` (what went) | `--tw-outline-style: none; outline-style: none`              | `.focus-visible\:outline-none:focus-visible`        |

`outline-width: 2px` alone says nothing - a 2px outline whose style resolved to `none` paints
exactly as much as no outline - so the guard also reads the sheet's own
`@property --tw-outline-style { syntax: "*"; inherits: false; initial-value: solid; }` and asserts
the initial value is `solid`.

**`test/focus-outline.test.tsx`**, seven tests over three hosts (the button Switch, the label
Switch, the AccordionTrigger), every class name read off the RENDERED story and never typed (the
fixture's `source(none)` rule). Per host and variant: the declared `outline-width` and
`outline-offset` resolve to 2px, `outline-style` is declared as `var(--tw-outline-style)`, nothing
in the same list declares `outline-style: none`, a `box-shadow` is still declared, and every
variant-prefixed class is checked against the SELECTOR the sheet gave it, so a prefix that compiled
to something else cannot pass by its name.

⚠️ **It reads the sheet rather than a computed style.** Two reasons, and only the first is settled.

**Settled: jsdom does not resolve `var()`.** An applied declaration reads back as its literal text -
the control returns `min-height: var(--hit-min)`, not `44px` - so `outline-style` could never be read
as `solid` from a computed style whatever else jsdom did, because `solid` lives in an `@property`
initial value. That alone justifies the sheet for the STYLE.

**Unreconciled: whether jsdom APPLIES the `:focus-visible` rules it parses.** Layer 1 (MED-1)
measured `outline-width: 2px` at the shipping sha and called the claim below false. Re-run twice in
the author's worktree at the same sha, with a control, it does not reproduce:

```
sheet has the rule text: true          injected sheet cssRules count: 303
CONTROL min-height (min-h-hit, no variant): var(--hit-min)      <- the sheet IS applying
matches(:focus-visible)=true active=true
FOCUSED outline-style=none width=16px color=rgba(0, 0, 0, 0) offset=0 box-shadow=
  kept selector: .focus-visible\:shadow-focus-ring:focus-visible
  kept selector: .focus-visible\:outline-2:focus-visible
rules whose selector mentions focus-visible: 9
```

jsdom parsed and KEPT the nine `:focus-visible` rules, the element matches and is
`document.activeElement`, an unvariant utility on the same element reaches it - and the focused root
still computes `outline-style: none`, `outline-width: 16px` and an EMPTY `box-shadow`. Both reads
are recorded because neither could be reproduced against the other, and the disagreement does not
change the instrument: the sheet is what every other geometry claim in this package is read from.
⚠️ **The earlier wording here - "a `getComputedStyle` assertion would have passed against anything" -
is withdrawn**: it generalised one environment's read into a law about jsdom.

**The browser half is OWED and is not claimed here**: whether the outline actually PAINTS under
`forced-colors: active` needs a real engine, and that is the consuming product's e2e.

**The four reddening mutations, RUN at the shipping sha `3d45465`, each landing `grep`-confirmed and
each restored with `git checkout --`** (`git status --short` empty before and after every one):

| mutation                                                             | red                  | the assertion message                                                                                                                                                          |
| -------------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `focus-visible:outline-none` restored on `switch.tsx`, the rest kept | 1 failed / 92 passed | `'Switch (button host)' … AssertionError: a class under this variant still declares outline-style: none: expected [ 'none', 'var(--tw-outline-style)' ] to not include 'none'` |
| the same on `accordion.tsx`                                          | 2 failed / 91 passed | the same message on `'AccordionTrigger'`, **plus** `fidelity.test.tsx > accordion-trigger`                                                                                     |
| `has-focus-visible:outline-none` added to the switch row             | 1 failed / 92 passed | the same message on `'Switch (label host, focus lands on th…')` - the half a `focus-visible:`-only guard would have missed                                                     |
| `accordion.tsx` reverted to the BASE pair entirely                   | 2 failed / 91 passed | `AssertionError: no class under this variant declares an outline-width: expected null to be 2`                                                                                 |

**One consumer found by the gate and not by the scan**: `packages/ui/test/fidelity.test.tsx:661`
pins `accordion-trigger`'s EXACT class list (`NEW_PARTS`), so the outline reddened it as
`expected [ 'flex', …(16) ] to deeply equal [ 'flex', …(14) ]`. The list was updated in the same
commit; it is the third instrument on the same change, and the switch host has no such row.

### `Checkbox` and `RadioGroupItem` had the same defect, and it is FIXED here

Layer 1's HIGH-1, reproduced with the guard this slice added. `checkbox.tsx:77` and
`radio-group.tsx:121` are the same construction as the Switch's label host:

```
"group/checkbox relative inline-flex min-h-hit cursor-pointer items-center gap-3 has-focus-visible:shadow-focus-ring has-disabled:…"
"group/radio    relative inline-flex min-h-hit cursor-pointer items-center gap-3 has-focus-visible:shadow-focus-ring has-disabled:…"
```

a `<label>` row with a real input inside it at `opacity-0`, and the ring drawn on the ROW because -
`checkbox.tsx:72`'s own words - "the input's own ring is invisible at `opacity-0`". So the UA's
default outline is invisible too and the row's ENTIRE focus indicator is a `box-shadow`, which
`forced-colors: active` drops. **A keyboard user in forced-colors mode gets no focus indicator at
all**, which is verbatim the failure recorded above for the Switch. Both parts are among the three
items `0.1.2` adds, so this bump is the release that first makes the defect installable.

**FIXED here, on a widened fence.** Both files were outside LIB-VENDOR-0.1.2's fence, so the finding
was handed back rather than edited; the orchestrator widened the fence to cover them (2026-09-21
~18:55 IST) on the reasoning that the cut's intent was _"every part with the Switch's forced-colors
hole rides the fix BEFORE the pack"_, and that shipping 0.1.2 with a `KNOWN_GAPS` entry for two
brand-new families is not the bump's claim. Both `rowClass` strings now carry
`has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary`
beside the shadow ring, `r/checkbox.json` and `r/radio-group.json` are rebuilt, `HOSTS` gains both
label hosts and **`KNOWN_GAPS` is empty**.

**The reddening run, at the pre-fix head `18ebac8`, both entries dropped so ONE red names both:**

```
$ pnpm exec vitest run --project ui packages/ui/test/focus-outline.test.tsx          # exit 1
AssertionError: a part draws its focus ring with a box-shadow and no outline, so it has NO
indicator under forced-colors: active. Add the outline trio under the same variant, or declare it
in KNOWN_GAPS with a reason: expected [ …(2) ] to deeply equal []
- []
+ [
+   "checkbox.tsx (has-focus-visible): outline-width null",
+   "radio-group.tsx (has-focus-visible): outline-width null",
+ ]
 Test Files  1 failed (1)   Tests  1 failed | 8 passed (9)
```

**And the expiry assertion fired for real, which is the half that could not be predicted.** Applying
the fix with the two entries still in place reddened this file by itself:
`AssertionError: checkbox.tsx now declares an outline under has-focus-visible: delete its
KNOWN_GAPS entry, the defect it excuses is fixed: expected 2 to be null`. The entries were deleted
by the commit that fixed the parts because the guard refused the alternative - which is what
"the excuse dies with the fix" has to mean to be worth writing.

**And the instrument that found it stays.** `focus-outline.test.tsx` no longer trusts its
hand-written `HOSTS` table for completeness (layer 1 MED-3: a length anchor pins a table against
SHRINKING, never against being INCOMPLETE - which is exactly how these two sat green). A second
describe block DERIVES the set from the sources: every `packages/ui/src/*.tsx` whose class strings
declare a `box-shadow` under a focus variant is enumerated, and each must declare an
`outline-width` under the SAME variant. It also pins the exact ring-site set
(`accordion.tsx (focus-visible)`, `checkbox.tsx (has-focus-visible)`,
`radio-group.tsx (has-focus-visible)`, `switch.tsx` under both), so a part that starts or stops
drawing a ring moves a list somebody has to read. `KNOWN_GAPS` survives EMPTY, with its reason for
existing: the next part that must ship short has somewhere honest to say so, and the entry will
expire the same way.

Both arms reddened before they shipped, run in a detached worktree of `f3721e9`:

| mutation                                                                  | red                 | the assertion message                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `checkbox.tsx`'s `KNOWN_GAPS` entry deleted (the gap goes unnamed)        | 1 failed / 8 passed | `a part draws its focus ring with a box-shadow and no outline, so it has NO indicator under forced-colors: active … expected [ Array(1) ] to deeply equal []`                                                                                        |
| the FIX applied to `checkbox.tsx` while its entry is still declared       | 1 failed / 8 passed | `checkbox.tsx now declares an outline under has-focus-visible: delete its KNOWN_GAPS entry, the defect it excuses is fixed: expected 2 to be null` - and this row stopped being a mutation an hour later, when the granted fix made it fire for real |
| `ringSites()` collapsed to `[]`                                           | 1 failed / 8 passed | `no part declares a focus ring at all: the walk found nothing: expected 0 to be greater than or equal to 4`                                                                                                                                          |
| `accordion.tsx` reduced to a shadow-only ring (a ring site with no entry) | 2 failed / 7 passed | the derived arm AND the `AccordionTrigger` row, `no class under this variant declares an outline-width`                                                                                                                                              |

And layer 1's two GREEN rows on `under()` are closed, re-run at `f3721e9` and now RED (MED-2):
`selectorsOf` rewriting every `:focus-visible` to `:has(:focus-visible)` fails 4 tests, and weakening
`VARIANTS["has-focus-visible"]` to the plain pseudo fails 3. `toContain` is `endsWith` now, because
`":has(:focus-visible)"` CONTAINS `":focus-visible"` and the two are different selectors - a row's
indicator that fires on any DESCENDANT's focus is not the same behaviour as its own.

### What moved the tarball, and what did not

The layer-1 GUARD commit touches `AGENTS.md`, `packages/ui/test/focus-outline.test.tsx` and
`test/helpers/compiled-sheet.ts` only, and `files` is `["r","src"]`. Re-packed to a scratch directory
at that head and compared: **92751 bytes, sha256
`09f05aa6a3d8333e0027bc7101114894334d82fbb11855e19b1e05cb8620024a`, byte-identical to the first
pack.** So `pnpm pack` is deterministic across a test-and-docs-only commit - checked, not assumed.

The HIGH-1 FIX commit is different and does move it: `src/checkbox.tsx`, `src/radio-group.tsx` and
their two rebuilt `r/*.json` are all inside `files`. The tarball is re-packed at the final head and
its size and sha256 are recorded in the consuming repo's slice doc and vendor README.

### `input.tsx:6` and `sheet.tsx:67`: measured, recorded, NOT edited [V]

The DL15 row asked for `input.tsx` under the same instrument if it cost under ten minutes. It did
(one probe, ~3 min). The field's focus indicator, read off the rendered `Input` story:

```
focus:border-primary  -> "border-color: var(--primary)"            .focus\:border-primary:focus
focus:outline-none    -> "--tw-outline-style: none; outline-style: none"
declared outline-width = null       box-shadow values = []       border-color values = ["var(--primary)"]
```

So the field's ENTIRE focus indicator is a border colour: nothing declares an outline width and
nothing declares a shadow. Under `forced-colors: active` the UA forces border colours to the system
palette, so the focused and unfocused borders resolve to the same value and the field has no
distinguishable indicator - the same defect the Switch had, by a third route. **The declarations are
measured; the forced-colors consequence is reasoned from the mechanism FOLLOWUPS-3 measured for the
shadow, not observed in a browser.** Not fixed here: `input.tsx` is outside this stream's fence and
the change moves the focused look of every field in every consumer, which is Ankit's call.
**Follow-up, in tier with `input.tsx:6`'s entry in the DL15 composition.**

`sheet.tsx:67`'s `focus:outline-none` is NOT the same defect and needs nothing: it sits on the Radix
dialog surface, a programmatically focused container with no keyboard target, which is Radix's own
pattern.

⚠️ **OBSERVED IN A BROWSER since (batch DL16, 2026-09-22; layer 2 HIGH-1).** The consequence this section calls
"reasoned, not observed" was measured by FOLLOWUPS-5's layer 1 on thepile's built app: `/login`'s email field under
`forced-colors: active` reads `outline-style: none`, and the `focus:border-primary` fallback is flattened by the mode
too, so every text field in that product has NO focus indicator there (ten non-test sites carry the class). **The fix
can only originate HERE**: thepile's `components/ui/form-styles.ts:36` is pinned byte-equal to this file's `input.tsx:6`
by its `form-styles.test.ts`, and its drift test byte-compares the `input` copy against `r/input.json`. Ankit's [V]
above is therefore the decision that unblocks both repos (in-tier: every field's focused look), and the widened
`ringSites()` sweep (DESIGN-LIB-d-select, item 2) stays blind to the `focus:` variant until it is taken.

### The packed tarball, as measured

```
$ pnpm --filter @marquee-ui/ui pack --pack-destination …/thepile-LIB-VENDOR-0.1.2/vendor/marquee-ui/
$ stat -c %s marquee-ui-ui-0.1.2.tgz ; sha256sum marquee-ui-ui-0.1.2.tgz
92751
09f05aa6a3d8333e0027bc7101114894334d82fbb11855e19b1e05cb8620024a
```

|                                         | `ui@0.1.1`'s tarball | this one  |
| --------------------------------------- | -------------------- | --------- |
| bytes                                   | 65840                | **92751** |
| `r/` item files (excl. `registry.json`) | 17                   | **20**    |
| `src/` modules (`.ts`/`.tsx`)           | 18                   | **21**    |

`files` is still `["r","src"]`, so the shape did not change and 65840 → 92751 is content: three
families, each carried twice (once as the source module, once inlined into its registry item's
`content` string, because a registry item has to be self-contained for an offline `shadcn add`).
The tarball carries **no** `.test.`, `.spec.` or `stories` file - checked, because thepile's
`scripts/test-quality.test.ts` walks from ITS repo root and a vendored tarball that were ever
unpacked would put its tests in that corpus (DL12's reviewer finding).

**The packed `package.json`'s `@marquee-ui/tokens` specifier, READ from the tarball:**

```
$ tar -xzOf marquee-ui-ui-0.1.2.tgz package/package.json | …
version: 0.1.2
devDeps @marquee-ui/tokens: "0.1.0"
files: ["r","src"]
deps: @radix-ui/react-accordion @radix-ui/react-dialog @radix-ui/react-label @radix-ui/react-separator @radix-ui/react-slot class-variance-authority clsx tailwind-merge
```

`workspace:*` rewritten to the exact `0.1.0` again, and again in `devDependencies`, which a consumer
never installs - so it cannot reach thepile's resolution. The eight `dependencies` are unchanged
from 0.1.1, which is what keeps thepile's `declares every dependency` arm green across the bump.

### `@marquee-ui/tokens` does NOT bump with it (DL12 decision 1, re-measured)

`git diff --stat tokens@0.1.0 HEAD -- packages/tokens/src` prints **nothing**. Over the whole
package it is two files, `test/docs-headers.test.ts` and `test/helpers/source-files.ts`, and that
package's `files` is `["dist","fonts","src"]` - `test/` is not shipped. Nothing a consumer receives
has moved, so tokens stays `0.1.0`, thepile keeps consuming it from the registry at `^0.1.0`, and
**ONE tarball is vendored downstream, not two.**

### `prepack`'s stale-registry refusal, proved live again

Re-run at the bump commit `c9115f7`, in a **detached worktree**, because the mutation lives in
`packages/ui/src/**`:

| mutation                                                                                   | landed                                                               | the red                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `border-border-strong` → `border-border` in `packages/ui/src/switch.tsx`, `r/` not rebuilt | `switch.tsx` trackClass, confirmed by `grep` before the run was read | `pnpm run prepack` exit **1**, the `git diff --exit-code -- r` output naming `packages/ui/r/switch.json` and carrying `border-border` inside its `content` string. **No tarball was written** (`ls packages/ui/*.tgz` → none) |

So the 92751 bytes above cannot be bytes that disagree with `src/`.

### The two a3 follow-ups this bump does NOT do [V]

- **LOW-2**, `ui`'s `prepack` breaks a git-URL install. **Taken: NO**, agreeing with the
  orchestrator's read. This bump DOES touch `packages/ui/package.json`, so the fence would have
  allowed it, and it is still the wrong commit: under the freeze the only install anyone performs is
  the vendored tarball, which `pnpm pack` writes from a git checkout where `git diff --exit-code`
  works; and 0.1.2's claim is "the three families, the directive, the two carry-ins", which a
  lifecycle-script change is not. It stays recorded for the bump whose job it is.
- **LOW-3**, the tokens TS entry. Recorded, not done: it would change the shipped bytes of
  `@marquee-ui/tokens`, which deliberately does not bump.

### The gate

`pnpm verify` at the library head, foreground: **exit 0**, the runner's own lines being
`All matched files use Prettier code style!`, both packages' `typecheck: Done`,
`✔ Building registry.`, `└  Storybook build completed successfully` and
`Test Files 31 passed (31)` / `Tests 555 passed (555)`. `git status --short` empty before and after,
so the committed `packages/ui/r` is exactly what `build:registry` produces at `0.1.2`.

That is **+1 file / +13 tests** on DL14's closure (30 / 542), all of it this stream's
`focus-outline.test.tsx`: 7 tests at the bump, 9 after layer 1's derived arm, 13 after HIGH-1's fix
added both label hosts to `HOSTS`.

⚠️ **One red on the way there, and it is the library's own rule working.** The first verify after the
fix failed `packages/tokens/test/brand-guard.test.ts > ships no brand string of the consuming app`,
naming `packages/ui/src/checkbox.tsx` and `radio-group.tsx`: the new docblocks cited the consuming
product's slice doc by NAME, which `AGENTS.md`'s "No product vocabulary" rule forbids in shipped
source. Both now say "the consuming product's own browser measurement". The `switch.tsx` docblock
written earlier never named it, which is why this did not surface at the bump. Two earlier runs are worth recording because each was a
real finding rather than a flake: `JSX.Element` in the new test's type annotation failed
`packages/ui typecheck` with `TS2503: Cannot find namespace 'JSX'` under this repo's React 19 JSX
transform (now `ReactElement`), and `fidelity.test.tsx`'s pinned class list reddened as described
above.

No push, no `npm publish`, no git tag: the freeze holds. The tags `ui@0.1.1` (at `c99b71e`) and
`ui@0.1.2` (at `c9115f7`) are the publish's act and are Ankit's to make; thepile's `vendor/` tarball
exists only until he does.

## DESIGN-LIB-d-select: the client boundary the walks could not see, LOW-2, and the Select measurement (2026-09-22)

Batch DL16's library stream. Three items, each its own commit, and the third one ships nothing on
purpose. Base `1fd163d`; no push, no tag, no publish (the freeze).

### 1. The identity walk across a client boundary, MEASURED

**The finding, before this stream existed.** The orchestrator's DL16 probe vendored the 0.1.2
registry copies of `avatar.tsx` and `description-list.tsx` into a detached thepile worktree and
composed both families in a Server Component page. `pnpm --filter @thepile/web build` **exited 1 at
prerender**, and the message was this family's own:

```
Error: <DescriptionItem> may hold only <DescriptionTerm> and <DescriptionDetails>: a div inside a
dl is a group, and any third child makes the list invalid (axe `definition-list`).
```

for a group holding **exactly one** term and **exactly one** detail. The same composition inside one
`"use client"` island built, exit 0.

**What `child.type` actually is, read rather than reasoned.** This stream instrumented the probe
worktree's copy of the walk - `typeof`, `String()`, `$$typeof`, `$$id`, `$$async`, `name`,
`displayName`, own keys, prototype keys, and the identity comparison itself - made the refusal a
`console.log` so one build would report every child of both compositions, and rebuilt
(`$BATCH_SCRATCH/s2/probe.run5.log:47-56`; two earlier builds were type errors in the
instrumentation, `probe.run3/run4`, and are not readings). One page, one build, the SAME three-cell
`<dl>` composed twice: once directly in the Server Component, once inside a `"use client"` island.

| composed in               | `typeof child.type` | `$$typeof`   | own keys                            | `name` / `displayName` / `$$id` / `$$async` | `child.type === DescriptionTerm` |
| ------------------------- | ------------------- | ------------ | ----------------------------------- | ------------------------------------------- | -------------------------------- |
| the Server Component      | `"object"`          | `react.lazy` | `["$$typeof", "_payload", "_init"]` | all four **undefined**                      | **false**                        |
| one `"use client"` island | `"function"`        | (none)       | `["length", "name", "prototype"]`   | `name` = `"t"`, the minified export         | **true**                         |

So an element a Server Component creates reaches the client module as a **client reference, which
React hands over as its LAZY wrapper**. It is not the module's export, `===` is false against every
part, and - the half that decides the whole item - **the wrapper keeps NO marker of its own**: the
four identity fields read as `undefined` (they are absent from the log's JSON, which is
`JSON.stringify` dropping undefined), and the own-key set is React's three private lazy fields. The
only public thing on it is `$$typeof === Symbol.for("react.lazy")`.

⚠️ **That three-key set is the PRODUCTION flight client's**, which is the build the probe
measured; `lazy()` under this repo's React **19.3.0** DEVELOPMENT build adds a fourth,
`_debugInfo` - read off the installed copy with `node -e`, not assumed (layer 1, LOW-2). `$$typeof`
is identical in both, and it is the only thing either guard reads.

**Option (B) therefore has nothing to stand on and is not taken.** A boundary-safe marker would have
to be something the element KEEPS across the boundary; the reading says the element keeps three
React-internal keys and nothing else. A static property on the part (`DescriptionTerm.__part`) is on
the module's export, which is exactly the object that does not arrive. Resolving `_payload`/`_init`
by hand is React's private lazy protocol and suspends. Nothing measured supports (B).

**So (A): the island IS the family's Server-Component form, and the MESSAGE is what changes.**

- `description-list.tsx` refuses a lazy-typed child with its own throw, naming the boundary and the
  island instead of naming an invalid `<dl>` the caller did not write. Its docblocks say so in both
  places the old cost sentence lived (the directive note, and the retired reason 2 at the term's
  tone block): the cost is not "a static cell is a client component", it is **"a Server Component
  cannot compose these parts at all"**.
- `form.tsx` **does not fail the same way**, and that is this stream's correction to its own brief
  (which reasoned the failure from the code). Measured in jsdom with the shape the build produced:
  `countParts` does not refuse an unrecognised child, it **RECURSES INTO** it - a part is found at
  any depth by design - so a `<FormControl>` created on the server side is never refused and never
  counted, and the caller is told `<FormItem> must hold exactly one <FormControl>` about a field
  holding exactly one. That throw now carries the cause, **and only when a child really crossed**;
  a field that simply forgot its control must not send the next reader hunting for a boundary that
  is not there. Its docblock carries the rule as the family's second one.

**Neither change refuses a composition that rendered before.** In `description-list.tsx` a lazy
child was already refused (with the wrong reason); in `form.tsx` the walk still walks through it,
which `test/form-wiring.test.tsx` pins with a deliberate `lazy()` decoration beside a real control.

**The guard, and its reddening run.** `lazy()` is the public API that produces exactly the measured
object, so the tests state the boundary's own shape rather than a stand-in for it; the wrapper never
resolves, because the item throws while walking its children, before React renders one. Run, not
argued, in the working tree with the source untouched:

| test file                                  | arm                                                                                 | before the fix                                                                                                                                          |
| ------------------------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `test/description-list-structure.test.tsx` | "throws a message naming the boundary, for a group that IS one term and one detail" | RED: `expected '<DescriptionItem> may hold only <Desc…' to contain 'React lazy wrapper'` - the jsdom instrument reproduced the BUILD's message verbatim |
| `test/form-wiring.test.tsx`                | "tells the caller about the boundary, not about a control they did write"           | RED: `expected '<FormItem> must hold exactly one <For…' to contain 'React lazy wrapper'`                                                                |

Both red firsts name the property under test, and the description-list red is the exact string the
Next build printed - which is what makes the jsdom arm evidence about the build and not only about
jsdom. Each has a negative twin in the same describe (an ordinary stray child still reads as a stray
child; a control-less field still reads as control-less), so the split is pinned from both sides.

**What `test/client-boundary.test.ts` guards, and what it does not.** It guards the **DIRECTIVE**:
a part file that imports a client-only React hook and does not open with `"use client"` is a file
the consumer's framework refuses to build, and that file holds every part to it. It says nothing
about **the WALKS** - a file can carry the directive correctly, as both of these do, and still hold
a comparison that cannot survive the boundary the directive creates. DL14 closed the first hole;
this item closes the second, and they are different behaviours in the same file. `client-boundary`
is untouched here and stays green (`form.tsx` still imports `createContext`/`useContext`/`useId`).

### 2. LOW-2 (DL15 layer 2): `ringSites()` reads an outline as well as a shadow

`ringSites()` pushed a site only when a token under the variant declared a `box-shadow`, so a part
shipping `focus-visible:outline-none` and **no** shadow contributed no site at all and was invisible
to both arms - blind in the one direction a forced-colors sweep exists to look.

Red-first exactly as layer 2 prescribed, in a **detached worktree of `1fd163d`**
(`/home/ankit/Code/marquee-ui-low2`, installed and built):

| step                                                                       | `pnpm exec vitest run --project ui test/focus-outline.test.tsx` |
| -------------------------------------------------------------------------- | --------------------------------------------------------------- |
| base + a scratch part carrying only `focus-visible:outline-none`           | **13 passed** - layer 2's ⚠️ UNVERIFIED prediction, CONFIRMED   |
| the same tree, predicate widened to "a `box-shadow` OR an `outline-style`" | **2 failed / 11 passed**, both naming the scratch part          |

The red is the red that was predicted, in both arms: the exact-set anchor gained
`"low2-probe.tsx (focus-visible)"`, and the invariant reported
`["low2-probe.tsx (focus-visible): outline-width null"]` under its own forced-colors message. **The
five shipping sites did not move**, which is how the widening is known to be a widening rather than
a change of subject; the anchor list (`:333-339` at the base, `:365-371` at this head after the new docblock) is re-read and unchanged.

**`focus:` does NOT become a third variant, and the cost was measured rather than guessed.** Two
readings in the same worktree:

- `focus: ":focus"` added to `VARIANTS` **alone changed nothing**. The token walk only reads a class
  string that already contains a `focus-visible:` token, so `input.tsx:6` and `sheet.tsx:67` - whose
  strings carry `focus:` and nothing else - are never collected. A one-line change that looks like
  it widens the sweep is inert.
- With the regex widened as well, the sweep gained exactly `input.tsx (focus)` and
  `sheet.tsx (focus)`, both `outline-width null`.

So admitting the variant costs two `KNOWN_GAPS` entries, and neither is this slice's to write:
`input.tsx`'s ring is Ankit's open [V] from DL15 and `sheet.tsx`'s is a decided non-target. Both
readings are in the file's own docblock, so the next stream does not re-derive them.

### 3. The Select measurement, and the answer

**No `Select` family ships.** The audit's four rows at thepile's DL16 base
(`awk -F'|' '{ if ($4 ~ /Select/) print NR": "$2 }' docs/design-audit.md` → `:353`, `:384`, `:397`,
`:401`), every site read:

| audit row               | what it actually is                                                                                                                                                                                                                                                                                 | wants the part?                                                                                                   |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `:353` `/game/[slug]`   | `log/LogForm.tsx:794-812`, Platform: `<select id="log-platform" autoComplete="off" value onChange className={cn(inputClass, "mt-1")}>` under `<label className={labelClass} htmlFor="log-platform">`, "Any" + the platforms. `"use client"`, in the log sheet the root layout mounts on every route | **No.** `inputClass` IS this package's `Input` string (below), so the house treatment is already on it, from here |
| `:384` `/[username]`    | `log/LogForm.tsx:825-846`, Edition: the same shape, conditional on `editions.length > 0`, with an `__other` sentinel option that flips the field to free text                                                                                                                                       | **No.** Same string, same file; the sentinel is product logic no part can hold                                    |
| `:401` `/diary`         | `play/PlayForm.tsx:120-131`, Platform: inside a wrapping `<label className={labelClass}>` (implicit association, no `htmlFor`), `className={inputClass}`. `"use client"`                                                                                                                            | **No.** Same string again                                                                                         |
| `:397` `/admin/reports` | `app/admin/reports/page.tsx:231-245`: a **Server Component**, `<select name="underReason" defaultValue="" className="min-h-hit rounded border border-line bg-raised px-3 text-sm text-text">` inside `<form action={resolveReportAction}>` at `:219`; the page's own 1px chrome                     | **No**, and it is the row that decides the shape of the answer - see below                                        |

**The measurement that makes it a refusal rather than a deferral.** thepile's `inputClass`
(`apps/web/src/components/ui/form-styles.ts`) is **byte-identical** to this package's
`packages/ui/src/input.tsx:6` (`cmp` of the two lines at the two base shas: identical), and that
equality is not a coincidence a drift could eat - thepile's `form-styles.test.ts` asserts every
string in that module is exactly what the registry copy produces. So three of the four sites already
draw **this library's own field treatment**, through the constant the product shares between its
`<input>`s and its `<select>`s. A `NativeSelect` part would be `<select className={cn(inputClass,
className)}>`: `Input` with a different tag, adding nothing any site is missing. The ladder stops at
rung 2.

**And the three answers, each refused on a measured ground rather than on taste:**

- **Radix.** `@radix-ui/react-select` is **not** a dependency of this package today (its
  `dependencies` are the four Radix primitives `accordion`, `dialog`, `label`, `separator`, plus
  `react-slot`, `cva`, `clsx`, `tailwind-merge`), so it would be a NEW one - on a sheet the root
  layout mounts on every route. The product's own dated verdict on exactly this trade is
  `docs/slices/FIDELITY.md:34-49` (2026-07-28): a native control stays on every platform and every
  surface, because replacing it costs 15-40 kB of script under a hard per-URL
  `resource-summary:script:size` budget and gives up the OS picker, locale formatting,
  VoiceOver/TalkBack and desktop keyboard entry. And `/admin/reports` submits **without client JS**:
  a Radix select is a client module, so that page - a Server Component - would have to buy an island
  for a control that today needs nothing, which is item 1 of this very slice arriving a second time.
- **A native `NativeSelect` family in the Checkbox/RadioGroup shape.** Those two families exist for
  a measured reason: the browser's own `accent-color` box is not the house's box, so the part draws
  it. A `<select>`'s counterpart of that is `appearance: none` plus a drawn chevron - and **no site
  in the product does that today**; all four keep the platform arrow, which is the same posture
  `FIDELITY.md` takes on the date field. Drawing it is a product decision nobody has taken, which is
  the Tabs answer's `/settings/profile` row again: _a semantics or a painting change the product has
  not taken is not a family._
- **No family.** Taken. The four cells should say what is true: the three client sites carry the
  house field string already, and `/admin/reports`' 1px chrome is a page-level inconsistency (the
  audit's own note: it is the only page drawing `rounded border border-line`, and its six remedy
  buttons bypass `Button` too), to be fixed when that page is consumed - not by a new family.

None of the four sites has a defect a part would close: each clears the 44px floor (`min-h-hit` in
all four class strings), each is labelled (two explicitly by `htmlFor`, two implicitly by a wrapping
`<label>`), and each submits or handles a value. Nothing ships; the reconciler corrects the four
cells. If the product ever decides to draw its own chevron, **this is the row that says so**, and it
should arrive as a product decision first.

⚠️ For the record, the brief's claim that "a `select` is in the 44px floor's selector list" is
**true** (`tailwind-compile.test.tsx:215`,
`'button, a[href], input, select, textarea, [role="button"]'`) - it was checked because it would
have been load-bearing had a part shipped, and it is recorded here so the next stream does not
re-check it.

### The pipeline, end to end

`packages/ui/package.json` still says **nineteen** and `registry.json` still has **20 items** (19
families + `utils`, read: `node -e 'console.log(require("./registry.json").items.length)'` → `20`).
Nothing in `README.md`, `AGENTS.md`, `registry.test.ts` (`:60`), `stories.test.tsx` (`:97`) or
`fidelity.test.tsx` (`:36`) moves, because no part was added - the counts were re-read at the base
rather than quoted, which is the check the "Adding a part" steps exist for.

What DID move through the pipeline is the registry's bytes: `description-list.tsx` and `form.tsx`
changed, so `pnpm build:registry` ran and `packages/ui/r/description-list.json` and `r/form.json`
are committed with them. `registry.test.ts`'s "carries the CURRENT bytes of every source it ships"
is the arm that makes that a required step rather than a tidy-up, and it is green.

`pnpm verify` at the head, detached under the batch's gate lock: **exit 0**, the runner's own
lines being `All matched files use Prettier code style!`, both packages' `typecheck: Done`,
`✔ Building registry.`, `└  Storybook build completed successfully` and **`Test Files 31 passed
(31)` / `Tests 562 passed (562)`**, in 2.6 minutes. `git status --short` was EMPTY after it, so the
committed `packages/ui/r` is exactly what `build:registry` produces at this head.

That is **+7 tests on 31 unchanged files** against **31 / 555** at the base - the base number
MEASURED in the detached worktree at `1fd163d` rather than quoted from an earlier section. The
seven: 2 arms in `description-list-structure.test.tsx` and 3 in `form-wiring.test.tsx` for item 1,
then layer 1's two (a third `form-wiring` arm for MED-1's ambiguity, and `focus-outline`'s
both-disjuncts arm for MED-2). `focus-outline.test.tsx` went from 13 to 14: LOW-2 itself widened a
predicate rather than adding an arm, which is exactly why its red had to be run in a detached
worktree to exist at all - and why layer 1 was right that it needed one live arm of its own. The `+5` is exactly this stream's: 2 arms in
`description-list-structure.test.tsx` and 3 in `form-wiring.test.tsx`. `focus-outline.test.tsx`
stays at 13 - LOW-2 widened a predicate rather than adding an arm, which is why its red had to be
run in a detached worktree to exist at all.

### Decisions

1. **[V] The island is the family's Server-Component form (option A), not a boundary-safe marker
   (option B).** The reason is the reading, not a preference: the element keeps `$$typeof`,
   `_payload` and `_init` and nothing else, with `name`, `displayName`, `$$id` and `$$async` all
   undefined, so there is no marker to compare instead. Ankit may veto in the other direction only
   by accepting React-internal lazy resolution inside a part, which suspends.
2. **[V] The two walks are corrected in their MESSAGES only, and `form.tsx`'s addition is
   conditional.** No composition that rendered before changes. The boundary sentence is appended to
   exactly one throw - the one a boundary can actually cause - because a hint that fires on an
   unrelated failure is a worse instrument than no hint.
3. **[V] `focus:` does not become a third `VARIANTS` entry.** Measured cost: two `KNOWN_GAPS`
   entries, one of which is Ankit's own open decision from DL15.
4. **[V] No `Select` family ships**, on the measurement above. The four audit cells are the
   reconciler's to correct.

### thepile inputs

Nothing in thepile moves this batch for any of the three items; these are the inputs the next
consumption needs, each count read hit by hit with the command that produced it, at thepile
`next` @ `4d36dd30`:

- **The 0.1.2 copies vendored in thepile do NOT carry item 1's messages.** They are the 0.1.2 bytes;
  these corrections are unreleased on the library's `next` and arrive with the 0.1.3 bump. Until
  then a thepile Server Component composing either family fails with the OLD message - which is the
  reason this write-up exists rather than only the fix.
- **Every audit cell prescribing `DescriptionList` on a Server-Component site carries a false
  premise until it says "inside one island".** Eight rows name it
  (`awk -F'|' '{ if ($4 ~ /DescriptionList/) print NR": "$2 }' docs/design-audit.md` → `:353`
  `/game/[slug]`, `:362` `/members`, `:382` `/transparency`, `:384` `/[username]`, `:387`
  `/[username]/followers`, `:392` `/[username]/reckoning/[year]`, `:397` `/admin/reports`, `:400`
  `/settings/steam`). Their existing parenthetical already says the family is a client module since
  DL14; what it does not say is that the parts cannot be composed from the server side AT ALL, which
  is the difference between "buys a boundary" and "does not build".
- **Six rows name a `Form*` part** (`awk -F'|' '{ if ($4 ~ /FormItem|FormControl|FormLabel|FormMessage|FormDescription/) print NR": "$2 }'`
  → `:358` `/lists/[id]`, `:360` `/login`, `:393` `/[username]/review/[slug]`, `:399`
  `/settings/profile`, `:406` `/onboarding`, `:407` `/pile`) and carry the same premise. `/login`
  and `/onboarding` already compose the parts inside client components, so they are unaffected in
  fact; the cells are what need to say why.
- **Four rows name `Select`** (`:353`, `:384`, `:397`, `:401`, the awk above) and should say that
  the three client sites already carry this package's `Input` string through
  `components/ui/form-styles.ts`, and that `/admin/reports` keeps its native control.
- `form-styles.test.ts` is the guard that keeps thepile's `inputClass` equal to this package's, and
  it is the reason the Select answer is a refusal rather than a deferral. It is not touched.

### Recorded for the next library stream (DL16 layer 2 and the reconciler, 2026-09-22)

- **MED-4, FIXED here by the reconciler**: the boundary docblock at `description-list.tsx:387-390` (and one line in
  `form.tsx`) had `$typeof`/`$id` where the code and React spell `$$typeof`/`$$id`; the spelling was in the rebuilt
  `r/description-list.json` too. Corrected in both files, `pnpm build:registry`, the library's `pnpm verify` re-run.
- **MED-2, the Alert family's rule carries half of what its two thepile call sites now establish.** `alert.tsx:17-24`
  says a notice on the page from the start is not a live region and "pass the role when the notice ARRIVES"; thepile's
  `/login` notice DOES arrive (a soft navigation, measured) and takes no role either, because a region inserted together
  with its content is not announced reliably, while `/settings/steam`'s does not arrive (a document navigation,
  measured). The rule text should say both halves: a role belongs on a region that exists, empty, before its content
  does. The copy is consumed (`alert` in thepile's `CONSUMED`), so the docblock change rides the 0.1.3 bump and
  re-adds the copy.
- **s1's REQUEST 1 (DESIGN-LIB-f-members-avatar)**: `AvatarImage` owes a `ground` axis and `AvatarBadge` an `edge` axis;
  both values sit in a `cva` BASE today, unreachable by a plain-join consumer, which is why thepile's wrapper holds
  `--raised` and the 1.5px mark edge by inline declarations. Red-first through `avatar-drawing.test.tsx`.
- With the messages of item 1 and the widened sweep of item 2, these are the 0.1.3 bump's.

### Consumers

**Run 1, before any code**, was the scan script against an EMPTY diff, so it printed zero names by
construction and is recorded as what it is. The enumeration that did the work was by hand, over the
surface the brief named:

- the two `src/*.tsx` files are named by `registry.json`, their own `packages/ui/r/*.json`,
  `packages/ui/r/registry.json`, `packages/tokens/test/helpers/source-files.ts` (`:53`, `:54`, and
  their stories at `:86`, `:87`) and `docs/as-built.md` - so `pnpm build:registry` is a REQUIRED
  step of item 1's commit and not a tidy-up after it;
- `form.tsx` is named BY NAME inside `test/client-boundary.test.ts`, in its docblock and in a live
  assertion (`expect(client).toContain("form.tsx")`) - the one consumer that would notice if the
  file stopped importing its hooks, which it does not;
- `ringSites()` is local to `focus-outline.test.tsx` (three hits, all in that file:
  `git grep -n -F 'ringSites' -- packages`), so LOW-2's predicate has no reader outside it;
- the counts are named in eight places (`README.md` ×2, `AGENTS.md:51`, `package.json:4`,
  `registry.test.ts:60`, `stories.test.tsx:97`, `fidelity.test.tsx:36`), re-read at the base and
  moved by nothing here because no part shipped.

**Run 2, at the commit point** (diff `1fd163d...HEAD`), full output in
`$BATCH_SCRATCH/s2/scan-run2.txt` and `scan-run2b.txt`:

- **Scan 1, exported symbols: ZERO.** The diff adds no export at all. `REACT_LAZY` and
  `crossedAClientBoundary` are module-scope in each of the two files and deliberately not exported:
  a part file is what the registry copies into a consumer, so a private helper is the whole of it.
  `entry-point.test.ts` (which walks `src` on disk) is green, and the registry's `files[0].content`
  is the same bytes.
- **Scan 3, the path-naming lists:** no movement. `source-files.ts`, `story-suites.ts`,
  `registry.test.ts`'s item list and `registry.json` are all unchanged, because no file was added or
  removed. The seven touched paths are the two sources, their two `r/` items and three test files.
- **Scan 4, role/aria strings: none.** The diff writes no `role=`, `aria-*` or `data-slot=` in
  `src` or `test` (`git diff … | command grep -E '^[+-].*(role=|aria-|data-slot=)'` over
  `packages/ui/src packages/ui/test` prints nothing), so no spec anywhere resolves on a string this
  stream moved.
- **Scan 5, tests naming a touched path:** two hits, both read. `form.tsx` →
  `test/client-boundary.test.ts` (above, green). `description-list.tsx` →
  `test/form-wiring.test.tsx`, which is this stream's own new docblock citing the other family by
  name; it is prose, not a consumer.
- **CROSS: 0. UNOWNED: 0. NEW between the two runs: 0** - run 2 found nothing the by-hand
  enumeration had not already named, which is the first time in this doc's nine sections that is
  true, and it is because the diff exports nothing.

## Layer 1 (reviewer r6, detached worktree of dc9d7b6, marquee-ui, no database)

**Five findings: 0 HIGH, 2 MED, 3 LOW**, over **14 mutations**, of which **3 stayed GREEN** and
each of those three is fixed below. Its full report is `$BATCH_SCRATCH/r6/report.md`. Its baseline
on the committed head was `pnpm test` **31 files / 560 tests**, `pnpm typecheck` exit 0, `pnpm lint`
exit 0, and `pnpm build:registry` + `git status --short` EMPTY (the committed `r/` is what the
sources produce). The table is its own, verbatim:

| file                        | test                                                                                                            | mutation applied                                                                     | red / GREEN                                                                                                                      | what it asserts now                                                                                                        |
| --------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| src/description-list.tsx    | description-list-structure: "throws a message naming the boundary, for a group that IS one term and one detail" | deleted the whole `if (crossedAClientBoundary(child.type)) throw …` block            | red                                                                                                                              | - (red reason: `expected '<DescriptionItem> may hold only <Desc…' to contain 'React lazy wrapper'`)                        |
| src/description-list.tsx    | description-list-structure: "still names the ordinary third child as a third child"                             | `crossedAClientBoundary` → `return true`                                             | red (22 failed in the file)                                                                                                      | -                                                                                                                          |
| src/form.tsx                | form-wiring: "tells the caller about the boundary, not about a control they did write"                          | `seen.boundary` → `false` in the throw's ternary                                     | red                                                                                                                              | -                                                                                                                          |
| src/form.tsx                | form-wiring: **"does not offer the boundary as an explanation when no child crossed one"**                      | `crossedAClientBoundary` → `return true`                                             | **GREEN** (28 passed)                                                                                                            | only that a field whose children are ALL recognised parts gets no boundary sentence - it never reaches the predicate       |
| src/form.tsx                | whole suite under the same mutation                                                                             | `crossedAClientBoundary` → `return true`                                             | 1 failed / 559 passed - and the one red is `registry.test.ts` "carries the CURRENT bytes", a byte digest that fires for ANY edit | no behavioural test in the repo sees this predicate collapse                                                               |
| src/form.tsx                | form-wiring: "leaves a legal field with a lazy child of its OWN alone"                                          | the walk `throw`s on a lazy child instead of flagging                                | red                                                                                                                              | -                                                                                                                          |
| test/focus-outline.test.tsx | both invariant arms                                                                                             | added `packages/ui/src/r6-low2-probe.tsx` carrying only `focus-visible:outline-none` | red **2 failed / 11 passed**, `r6-low2-probe.tsx (focus-visible): outline-width null`                                            | reproduces the stream's LOW-2 claim exactly                                                                                |
| test/focus-outline.test.tsx | both invariant arms                                                                                             | same scratch part + predicate reverted to box-shadow-only                            | **GREEN 13 passed**                                                                                                              | confirms LOW-2 was a real blindness at the base                                                                            |
| test/focus-outline.test.tsx | whole suite                                                                                                     | **deleted the `                                                                      |                                                                                                                                  | … "outline-style" …` disjunct** (the whole LOW-2 fix), no scratch part                                                     | **GREEN 31 files / 560 tests** | the widening has ZERO live coverage |
| test/focus-outline.test.tsx | whole file                                                                                                      | deleted the `box-shadow` disjunct instead (outline-style only)                       | **GREEN 13 passed**                                                                                                              | the pre-existing half is equally uncovered                                                                                 |
| test/focus-outline.test.tsx | whole file                                                                                                      | `focus: ":focus"` added to `VARIANTS` alone                                          | GREEN 13                                                                                                                         | verifies claim 5a: inert, as the as-built says                                                                             |
| test/focus-outline.test.tsx | both invariant arms                                                                                             | `VARIANTS` + the token regex both widened for `focus:`                               | red 2 failed / 11 passed, adding exactly `input.tsx (focus)` and `sheet.tsx (focus)`, both `outline-width null`                  | verifies claim 5b exactly                                                                                                  |
| test/focus-outline.test.tsx | "finds every part that draws a focus ring, and knows which ones are short"                                      | `ringSites()` → `return []`                                                          | red (`expected 0 to be greater than or equal to 4`)                                                                              | -                                                                                                                          |
| test/focus-outline.test.tsx | **"gives every focus ring an outline beside it, or names it as a known gap"**                                   | `ringSites()` → `return []`                                                          | **GREEN**                                                                                                                        | nothing - it iterates an empty list; it leans entirely on its sibling arm's `>= 4` anchor (pre-existing shape, documented) |

### What each GREEN row cost, and what changed

**MED-1 (GREEN row 4, and the whole-suite row under it): the boundary sentence fired for a `lazy()`
child that had crossed nothing, and the arm written to catch that could not see it.** The negative
arm held only RECOGNISED parts (`FormLabel`, `FormMessage`), which `countParts` matches in its
`if/else if` chain - so the walk never reached the `else` where the predicate lives, and collapsing
`crossedAClientBoundary` to `return true` left all 28 tests green. Meanwhile the source comment
claimed "both halves are pinned in test/form-wiring.test.tsx", which was false. Two changes, and the
second is the more important one:

- the arm now holds an unrecognised **non-lazy** child (a `<div>` wrapper), which is the only
  composition that makes the predicate RUN and answer `false`. Reddening mutation RUN in a detached
  worktree of the committed head `bef07c6`: `crossedAClientBoundary` → `return true` →
  `AssertionError: expected '<FormItem> must hold exactly one <For…' not to contain 'React lazy
wrapper'`, **1 failed / 28 passed** - the same mutation the reviewer ran to a full green;
- **the message stops asserting what it cannot know.** The reviewer is right that a deliberate
  `lazy()` beside a missing control sets the same flag, and that nothing reachable from userland
  separates the two (React's own flight client discriminates a client reference by this same
  `$$typeof`). So the sentence now names BOTH readings - "either a part created in a SERVER
  component … or a `lazy()` of your own, which is legal here and is NOT the cause" - which is the
  form `description-list.tsx`'s message already had, and a third arm pins it.

**MED-2 (GREEN rows 9 and 10): the LOW-2 widening shipped with no live coverage.** Deleting the
`outline-style` disjunct left the WHOLE SUITE green at 31 files / 560 tests, and the `box-shadow`
half was identically uncovered. The reason is structural rather than careless: on the shipping tree
every ring site declares both, so from outside the predicate's two halves are indistinguishable, and
the only thing that had ever exercised the widening was a scratch part in a worktree that no longer
exists. The predicate is now a named function `declaresARing()`, and one arm feeds it the two halves
SEPARATELY - tokens read off a rendered host (this file's rule) and split by what the compiled sheet
says each one declares. Both mutations RUN at `bef07c6`: deleting the outline disjunct →
`AssertionError: the outline half of the predicate is dead: expected false to be true`; deleting the
shadow disjunct → `the shadow half of the predicate is dead`. **1 failed / 13 passed** each way.

**The third GREEN row ("gives every focus ring an outline beside it" survives `ringSites()` → `[]`)**
was pre-existing and is fixed in passing, because it is one line: the arm now anchors its own sweep
(`expect(sites.length).toBeGreaterThanOrEqual(4)`) instead of leaning on its sibling's. Mutation RUN:
`ringSites()` returning `[]` now reddens BOTH arms - `no part declares a focus ring at all` and
`the sweep found no ring site at all` - where it used to redden one.

**LOW-1** (the as-built cited `:332-338` for an anchor list the new docblock had pushed to
`:365-371`) is corrected below in §2. **LOW-2** is a real correction to a recorded fact: the own-key
set `["$$typeof", "_payload", "_init"]` is the PRODUCTION flight client's, and `lazy()` under this
repo's React **19.3.0** development build adds a fourth, `_debugInfo` - read off the installed copy
(`node -e` on `packages/ui`'s `react`), not assumed. The guard reads `$$typeof` alone, which is
identical in both, but the sentence now says which build it describes. **LOW-3**: the shipped
`description-list.tsx` docblock cited `$BATCH_SCRATCH/s2/probe.run5.log`, a session-scoped path that
would be copied into every consumer's tree by the registry and read by none of them; it now points
at `docs/as-built.md`, which is what `form.tsx`'s equivalent already did.

Nothing the reviewer raised was declined.

## DESIGN-LIB-d-command: the two Avatar axes, the Alert rule's second half, and the `Command` measurement (2026-09-22)

Batch DL17, stream s2, on the library's `next` at `a4040016`. thepile is read-only throughout, at
`1533f084` (`next`, the commit carrying the DL17 table), by `git -C … show <sha>:<path>` - no file
in that tree moves for any of the three items. Under the push freeze: three LOCAL commits on
`s/design-lib-d-command`, no tag, no publish, and `packages/ui/package.json`'s version line stays
`0.1.2`. Everything here is the 0.1.3 bump's.

### 1. The two Avatar axes, measured at the consumer

**s1's REQUEST 1 (`DESIGN-LIB-f-members-avatar`, DL16), and the defect is one defect wearing two
costumes.** `avatarImageVariants` hard-coded `bg-surface` in its `cva` BASE and `AvatarBadge` had no
`cva` at all, its `border-2 border-border-strong bg-surface` inside a literal class string. Neither
value is reachable by a consumer whose `cn` is a plain JOIN - a `className` lands BESIDE the part's
class and the emitted stylesheet's order picks the winner - so thepile's wrapper
(`apps/web/src/components/profile/Avatar.tsx`, read at `1533f084`) holds both as inline STYLE
declarations, and says so in its own two docblocks:

| the wrapper's line | what it writes                                                                      | why, in its own words                                                                                                                                                                                                                                                                                            |
| ------------------ | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `:101` → `:129`    | `GROUND` = `{ backgroundColor: "var(--raised)" }` on **every** face it draws        | "`bg-surface` … is `--surface`, `#12140c`, which is also `MemberRow.tsx`'s card … taking the part's value would sink every face into the card behind it … A `bg-raised` CLASS loses (`.bg-surface` is emitted after `.bg-raised`, measured), so it is a declaration **until the library grows a `ground` axis**" |
| `:83` → `:143`     | `MARK_EDGE` = `1.5px` on the **28 and 34** faces only, as `style={{ borderWidth }}` | "Below 56 the badge is an ~11-14px circle and the part's 2px border eats the letter, so the two small faces get 1.5px … `AvatarBadge` has no `edge` axis (`AvatarImage` does, and this is the same gap on the other part), which is REQUEST 1"                                                                   |

Every line number above was read at `1533f084` and is as the DL17 table states it.

**The mark's geometry, computed from the consumer's own two maps** (`SIZE` `:37-46`, `MARK_SIZE`
`:68-74`) and the part's `h-2/5`, because the choice of thin value turns on it and nothing in the
record had the arithmetic. Rem is converted at a 16px root, which is this package's own convention
(`compiled-sheet.ts`'s `lengthPx` multiplies rem by 16):

| face | mark ø (40%) | mark font-size  | interior ø at 2px | interior ÷ glyph at 2px | at 1.5px | at 1px |
| ---- | ------------ | --------------- | ----------------- | ----------------------- | -------- | ------ |
| 28   | 11.2px       | 0.36rem 5.76px  | 7.2px             | **1.25**                | 1.42     | 1.60   |
| 34   | 13.6px       | 0.42rem 6.72px  | 9.6px             | **1.43**                | 1.58     | 1.73   |
| 56   | 22.4px       | 0.6rem 9.6px    | 18.4px            | 1.92                    | -        | -      |
| 64   | 25.6px       | 0.68rem 10.88px | 21.6px            | 1.99                    | -        | -      |
| 96   | 38.4px       | 0.95rem 15.2px  | 34.4px            | 2.26                    | -        | -      |

So "the 2px ring eats the letter" is a real discontinuity and not a taste note: the three large
faces sit at 1.9-2.3 interior-to-glyph and the two small ones at 1.25-1.43. **It also shows the 1px
alternative is arguable**, because 1px is what brings the two small marks NEAREST the proportion the
three large ones draw (1.60 and 1.73). It is recorded and not taken; the reason is decision 1 below.

**What shipped.** `avatarImageVariants` gains `ground` (`surface` the default, `raised`) and
`bg-surface` LEAVES the base, so exactly one ground lands on the element at either value.
`AvatarBadge` gains `avatarBadgeVariants`, a new exported `cva` carrying the whole of its old literal
plus `edge` (`default` `border-2`, `thin` `border-[1.5px]`), and `AvatarBadgeProps` gains that
axis's `VariantProps`. `avatarBadgeVariants` is exported and re-exported from `src/index.ts`, which
is not optional: `entry-point.test.ts` walks `packages/ui/src` on disk, parses every
`export const` out of every part file and requires the barrel to expose each one.

**TWO values on the mark's axis and not the image's three.** The image's `edge` is three values
because three sites measure three (2px on ten faces, 1px on the 26px byline glyph, none on the top
bar's gradient ring). The mark's sites measure two, and there is no site with no edge at all -
the edge is what CUTS the mark out of the face it overhangs, so a `none` would be a value nobody
has drawn. The family's own rule ("one measured site each, rather than a number") is what decides
the count, in both directions.

**`thin` is 1.5px on the mark and 1px on the image, on purpose**, and the drawing test asserts both
in ONE arm so the asymmetry is met rather than found. `thin` means "the small-face treatment" on
each part; the parts are at different scales (the mark is 40% of the face), so one shared number
would be a number neither site drew. The part's docblock says it, at length, because a reader who
meets only one of the two will otherwise read the other as a typo.

### 2. The Alert rule's second half

DL16 layer 2's MED-2. `alert.tsx` said a notice on the page from the start is not a live region and
to "pass the role when the notice ARRIVES" - one of the two ways to write a region nobody hears.
Both thepile sites were re-read at `1533f084` rather than taken from the DL16 note, and both
establish the missing half in their own source:

- **`app/login/page.tsx` is the product's ONE `<Alert>` site, and it carries BOTH halves.** (Layer 1
  MED-2 and LOW-3 are exactly this: the first draft of both this bullet and the docblock said "two
  sites", and the second of them is not an `Alert` at all. At `1533f084`,
  `git grep -ln 'from "@/components/ui/alert"' -- apps/web/src` prints `app/login/page.tsx` and
  nothing else.) It renders `<Alert tone="destructive" className="text-text-secondary">` with NO
  role, and its comment `:55-89` is careful about WHY in a way the first draft got backwards: its
  own ⚠️ says **"AND THIS NOTICE DOES ARRIVE, SO 'IT IS THERE FROM FIRST PAINT' IS NOT THE REASON
  (layer 1 caught exactly that sentence here, and it was false)"** - both routes to the URL are
  `router.push` + `router.refresh()` from `"use client"` components, instrumented on the built page
  as same-document with 0 load events. The reason it declines is the half the library was missing:
  "the region would be inserted TOGETHER with its sentence, and 'a live region inserted together
  with its content is unreliably announced' … **A region that announces has to EXIST, empty, before
  the text does**". The first-paint sentence is the TYPED-OR-RELOADED path, a second reason, which
  is what makes one site enough. Its unit arm `page.test.tsx:88-100` ("puts no live region on that
  notice, in any spelling") is the instrument.
- **`app/settings/steam/page.tsx:63-92` is the other measurement and is NOT this part**: it renders a
  raw `<p data-testid="steam-link-notice" className="rounded-md border-2 p-3 text-sm …">`, and only
  CITES `components/ui/alert.tsx:17-24` as the rule it is following. Its navigation is measured -
  every writer of `?link=` is a DOCUMENT navigation, instrumented through
  `e2e/steam-import.spec.ts:302-313` (a `window` marker gone afterwards, 3 document load events, the
  surviving navigation entry `{"name":".../settings/steam?link=rejected","type":"navigate"}`) - so
  it is the pure first-paint case. Its comment already points forward at this edit: "a
  soft-navigated notice earns a role only when the region exists, empty, before its content does
  (DL16 layer 2, MED-2)".

So the rule now says both: a role belongs on a region that exists, EMPTY, before its content does;
a region inserted together with its sentence is one mutation nothing was watching, and a
conditionally mounted `<Alert role="status">` is that case wearing the other case's fix. It names
the shape that does work - an always-mounted, usually `sr-only` region whose TEXT changes, with
`<Alert>` beside it as the visible half - and says `role` on THIS box is right only when the box is
already mounted and empty before the notice is written into it. Docblock only: no class, no prop, no
element, no test moved (scan 5 found nothing pinning the text).

### 3. The `Command` measurement, and the answer

**No `Command` family ships.** The audit's three rows reproduce at thepile `1533f084`
(`awk -F'|' '$4 ~ /Command/ { print NR": "$2 }' docs/design-audit.md` → `:358`, `:371`, `:410`), and
all three sites were read in full - including `AddGameRow.tsx`, which the composition marked unread:

| audit row                                                                       | what it actually is                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | wants the part?                                                                                                                                                                              |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `:371` `/search` ("the whole input + grouped results")                          | `components/search/SearchInput.tsx`, 568 lines, `"use client"`. It is a RESULTS PAGE, not a popup: `<input type="search" autoFocus aria-label="Search games">` (`:369-385`) and then FOUR permanent groups - Games as a `<ul className="grid grid-cols-3 … md:grid-cols-6">` of `next/link`, then Players, Lists and Tier lists as `<ul>`s of link rows - each under its own `<h2>` (`ResultGroup`, `:101-108`). Arrow keys move a highlight (`onKeyDown` `:280-292`) and Enter NAVIGATES. An always-mounted `sr-only` `<p role="status">` at `:359` carries the announcement | **No.** There is no popup whose expanded state the input owns and no value an option could set: activating a result navigates. And the source already recorded the blocking fact - see below |
| `:358` `/lists/[id]` (`AddGameRow`)                                             | `components/lists/AddGameRow.tsx`, 182 lines, `"use client"`. A debounced picker (250 ms, a request token, a three-phase `idle/searching/answered` machine) over `/api/search`: `<input type="search" aria-label="Search games to add" className={inputClass}>` (`:115-131`), a `role="alert"` for the add failure, two `role="status"` phase lines, and results as a `<ul>` of full-width `<button>`s whose click performs a DURABLE server write (`submitDurable("list-add", …)`) and then clears the query                                                                 | **No.** Its results are COMMANDS, not options: picking one does not become the field's value, it writes a row and empties the box                                                            |
| `:410` `/tiers/new` (`CommandInput + CommandList + CommandItem + CommandEmpty`) | `app/tiers/new/PoolBuilder.tsx`, 281 lines, `"use client"`. The SAME picker, and its docblock says so ("The picker is `AddGameRow`'s, which is `QuickLog`'s … this is a copy of its behaviour, not an improvement on it"): `aria-label="Search games to rank"` `:172`, two `role="status"` counts `:180,185`, a `<ul>` of `<button>`s, a `role="alert"` `:252`. A pick appends to a pool held in component state                                                                                                                                                              | **No.** Same shape, same reason, and the pick is one of MANY (a pool of up to `itemMax`), which is not a combobox's one-value contract at all                                                |

**The blocking fact at `/search` is already in thepile's own source, with the axe rule named.**
`SearchInput.tsx:433-440`: "aria-CURRENT, not aria-selected: these are links in a page-level results
grid, and `aria-selected` is only allowed on option/row/tab roles, so on an `<a>` it is invalid ARIA
(axe: aria-allowed-attr, critical)". A `cmdk`-shaped `Command` makes its items `role="option"` inside
a `role="listbox"`; **a link is not an option**, so taking the contract means the results stop being
links - and these links are what a crawler follows to `/game/<slug>`, what open-in-new-tab uses, and
what the local a11y scan walks. That is a product decision nobody has taken, which is the Tabs
answer's `/settings/profile` row and the Select answer's chevron row for the third time:
_a semantics change the product has not taken is not a family._

**The mirror holds at the other two.** Their results are `<button>`s that ACT. `role="option"` on a
button is the same defect as `aria-selected` on a link, one role over, and neither site has arrow-key
navigation today - every result is a real tab stop at `min-h-hit`, which is the shape a list of
commands already has in the platform. So the Checkbox/RadioGroup-shaped answer (parts carrying
`role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant` and a `listbox` of
`option`s, no `cmdk`) has **no site that wants the contract and can take it**: one is a page of
links, two are lists of commands.

**What a new dependency would cost, measured rather than reasoned.** `cmdk` appears **zero times** in
thepile's `pnpm-lock.yaml` and `apps/web/package.json` at `1533f084`, and it is not among this
package's eight dependencies (`@radix-ui/react-accordion`, `-dialog`, `-label`, `-separator`,
`-slot`, `class-variance-authority`, `clsx`, `tailwind-merge`), so it is new in BOTH repos - and 07
§10.2 says a dependency is read by a human, never auto-merged. `/search` is the route that decides
it: **111.1 kB / 112.5 kB, 1.4 kB headroom (1.3%)** at DL16's merged gate, read out of that gate's
own `pnpm perf:budget` block rather than quoted (`$BATCH_SCRATCH`'s DL16 `gate0/verify.log:222`; the
ceiling is `perf-budgets.json`'s `"/search/page": 115200` = 112.5 KiB, checked at `1533f084`). No
combobox library fits under 1.4 kB. The other two routes are NOT budgeted (that gate's build printed
`/lists/[id]` 150 kB and `/tiers/new` 108 kB of first-load JS, and `perf-budget: 15 route(s) within
budget` lists neither), so there the cost is the dependency and the semantics, not a ceiling.

**And the house treatment is already on two of the three, from here.** `AddGameRow`'s input is
`className={inputClass}` and `PoolBuilder`'s two are `${inputClass} min-h-hit`, and thepile's
`inputClass` is **byte-identical** to this package's `input.tsx:6` (`cmp` of the two lines with
leading indent stripped, at the two base shas: identical) - the same finding the Select measurement
made one family over. `/search`'s field is the one that departs: `w-full min-h-[48px] … pl-10 pr-12
… focus:border-accent` (`:384`), i.e. `Input` plus a taller box and two pads for a leading `⌕` glyph
and a trailing 44px clear button, spelled in thepile's own alias token names (not resolved here). If
`/search` is ever consumed it is `Input` + a `className`, and the 48px is a decision somebody owes a
reason for, since 44 is the floor.

**One thing the measurement found that is NOT a library answer.** `AddGameRow` and `PoolBuilder`
share two class strings **byte for byte** - the results list
(`flex max-h-[50dvh] flex-col gap-1 overflow-y-auto overscroll-contain`) and the result row
(`flex min-h-hit w-full items-center gap-3 rounded-md px-2 py-1 text-left hover:bg-raised
disabled:opacity-50`), `cmp`'d at `1533f084` - plus a near-copy of the debounce, the request token
and the phase machine. None of it is a Marquee part: the row holds `GameCover`, the machine is the
product's S35 rule, the endpoint is `/api/search`, the `max-h-[50dvh]` is one product's measurement,
and no `buttonVariants` value is this row (four of the five are centred blocks and the fifth,
`ghost`, is sized to its text; none is a full-width LEFT-aligned row and none uses a hover GROUND -
they change a border and an ink). If
anything is shared there it is a thepile component over `/api/search`, and that is thepile's call to
take, not this package's. Recorded so the reconciler's cells can say it.

Nothing ships for item 3; the reconciler corrects the three cells. If the product ever decides its
search results should be a listbox rather than a page of links, **this is the row that says so**, and
it arrives as a product decision first.

### The guards, and the runs that reddened them

Both new arms of `avatar-drawing.test.tsx` were written FIRST and run RED against the base's sources
in this worktree, before either axis existed (`$BATCH_SCRATCH/s2/red-item1.log`). Each red names the
property the arm is about, which is the half that matters:

| arm                                                                             | mutation (the base, i.e. the axis absent)            | red / green                  | the assertion message                                               |
| ------------------------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------- |
| "resolves the ground axis to two grounds, with the old value still the default" | `bg-surface` still in the `cva` BASE, no `ground`    | **red**, 2 failed / 9 passed | `expected [ 'var(--surface)' ] to deeply equal [ 'var(--raised)' ]` |
| "resolves the MARK's edge axis to the two widths its own sites measure"         | `border-2` still a literal, no `avatarBadgeVariants` | **red**, same run            | `expected 2 to be 1.5`                                              |

Both are resolved-VALUE assertions read out of the compiled stylesheet, never class names, and the
mark arm additionally pins `imageAt("thin")` at 1px in the same expression so the two `thin`s cannot
silently converge.

**⚠️ AND AS FIRST WRITTEN BOTH ARMS WERE BLIND TO THE DEFECT THE AXES EXIST TO REMOVE.** Found by
running the mutation rather than by reading, in a detached worktree of the committed head `6caae60`:

| mutation (the leftover the axis is supposed to prevent)             | the arms as first written | the arms as they ship                                                                                               |
| ------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `bg-surface` put BACK in `avatarImageVariants`' base, `ground` kept | **GREEN**, 11 passed      | **red**, 1 failed / 10 passed: `expected [ 'var(--surface)', 'var(--raised)' ] to deeply equal [ 'var(--raised)' ]` |
| `border-2` put BACK in `avatarBadgeVariants`' base, `edge` kept     | **GREEN**, 11 passed      | **red**, 1 failed / 10 passed: `expected [ '2px', '1.5px' ] to deeply equal [ '1.5px' ]`                            |

The reason is the instrument, not the assertion: this package's own `cn` IS a real tailwind-merge,
so a base that keeps `bg-surface` beside a `bg-raised` variant is resolved before anything renders
and the rendered element is perfect. **The consumer these axes are for is the one whose `cn` is a
plain JOIN** - which is the whole reason thepile writes inline declarations in the first place - and
that consumer is handed the variant function's OUTPUT, both classes in it, with the stylesheet's
order picking. So each arm now also resolves `avatarImageVariants({ ground })` /
`avatarBadgeVariants({ edge })` UNMERGED against the compiled sheet, where a leftover is a second
declaration. `alert-tone.test.tsx:36` already read its axis that way; the helper says so by name and
quotes both GREEN runs, so the next reader does not re-derive it.

The registry's byte guard is the other required step, and it was proved rather than assumed: with
`r/avatar.json` reverted to the base's bytes in the same detached worktree,
`registry.test.ts` reddens **1 failed / 13 passed** with
`AssertionError: avatar: packages/ui/src/avatar.tsx is stale: expected 'import { Slot } from
"@radix-ui/react…' to be 'import { Slot } from "@radix-ui/react…'`.

### The pipeline, end to end

No part was added, so **nothing in `AGENTS.md`, `README.md`, `packages/ui/package.json`,
`registry.test.ts` (`:60`), `stories.test.tsx` (`:97`) or `fidelity.test.tsx` (`:36`) moves**: the
counts are still **nineteen** families and **20** registry items, re-read at the base rather than
quoted. What DID move through the pipeline:

- `src/index.ts` gained `avatarBadgeVariants`, because `entry-point.test.ts` requires the barrel to
  expose every `export const` a part file declares. (The DL17 table's fence conditions `index.ts` on
  item 3 shipping; item 1's new export is what actually moves it. Noted as a fence widening, not a
  breach of anyone's ownership - no sibling stream touches this repo this batch.)
- `stories.test.tsx`'s `DECLARED_STORIES` 101 → **103** and `DECLARED_PLAYS` 72 → **74**, for the two
  new stories (`Ground`, `MarkEdge`). Both have plays; `story-suites.ts` needed no edit because
  `avatar` is already in the shared map and `storySuiteNames()` reads the directory.
- `pnpm build:registry` ran for BOTH source edits, and `packages/ui/r/avatar.json` and
  `r/alert.json` are committed with them. `registry.test.ts`'s "carries the CURRENT bytes of every
  source it ships" is what makes that a required step rather than a tidy-up, and its red is quoted
  in the guards section above. `packages/ui/r/registry.json` did not change - no item was added or
  renamed.

### Decisions

1. **`AvatarBadge`'s `thin` edge ships 1.5px, not 1px, and not a refusal of the non-integer.** [V]
   The axis exists so the consumer can DELETE an inline declaration; 1px would close the request by
   moving a drawing the product measured, which is not the library's call, and refusing the
   non-integer would leave the declaration in place and close nothing. The cost is stated in the
   part's own docblock: how 1.5px lands on a device pixel is the browser's, and on a `rounded-full`
   element it is anti-aliased rather than snapped - jsdom lays nothing out and this package has no
   browser runner, so the guard asserts the DECLARED width and nothing about the screen. The
   arithmetic that makes 1px arguable is in §1's table, recorded for Ankit rather than acted on.
2. **The mark's axis carries two values, the image's three.** [V] One measured site each, in both
   directions; there is no site that draws a mark with no edge, and inventing `none` would be a
   `cva` value with nothing behind it.
3. **No `Command` family ships**, and no `cmdk`. [V] One site is a page of LINKS whose own source
   records the axe rule that forbids the listbox semantics; two are lists of COMMANDS whose results
   act rather than set a value; the dependency is new in both repos; and `/search` has 1.4 kB of
   headroom. The Checkbox/RadioGroup-shaped alternative was tested against each site and has no
   taker.
4. **`alert.stories.tsx`'s `Announced` docblock still carries the half-rule** ("A notice that ARRIVES
   gets a role from its caller"). It is outside this stream's fence and it is not WRONG - the story
   demonstrates the prop pass-through - so it was left, and is raised as a one-line prose follow-up
   rather than edited.

### thepile inputs

- **At the 0.1.3 bump the wrapper drops BOTH inline declarations.**
  `components/profile/Avatar.tsx` loses `GROUND` (`:101`, written at `:129`) for
  `<AvatarImage ground="raised">`, and loses `MARK_EDGE` (`:83`, written at `:143`) for
  `<AvatarBadge edge={size < 56 ? "thin" : undefined}>` or the equivalent map. Nothing on screen
  moves: `raised` is the same `var(--raised)` and `thin` is the same 1.5px.
- **That is TWO thepile tests in the SAME commit, and the second is not obvious.**
  `Avatar.test.tsx:193-196` reads the VENDORED copy's SOURCE TEXT (DL16 decision 16), so it sees
  0.1.2's `avatar.tsx` until the bump and reddens with it; and the drift test reddens for the bytes.
  Neither can be fixed before the copy moves.
- **Two thepile comments cite `alert.tsx:17-24` by LINE** - `login/page.test.tsx:89` and
  `settings/steam/page.tsx:65-67` - and item 2 makes the rule longer, so both citations go stale
  when the copy is re-added at the bump. They are prose, in files this stream must not touch; the
  bump's stream owns them.
- **Nothing for item 3.** The three audit cells (`docs/design-audit.md` `:358`, `:371`, `:410`) are
  the reconciler's to correct, with §3's table as the reason per row.
- **The 0.1.3 bump reddens THREE drift items in thepile, not one** (DL17 layer 2, LOW-1): `avatar` for
  the two axes, and `description-list` and `checkbox` for the two relayed docblocks below, whose
  `r/*.json` this stream rebuilt. thepile's `scripts/marquee-drift.test.ts` pins all twelve copies
  byte for byte, so the bump's stream re-adds three items in the same commit as the bump. One nit
  for that pass: `description-list.tsx`'s replacement text says both old numbers "came to point at
  unrelated prose"; at thepile `70796720` `MemberRow.tsx` is 171 lines, so `:171` is its closing brace.
  ⚠️ **THREE is wrong too, and it is FIVE**: measured against the 0.1.2 TARBALL rather than the
  commit range at the bump itself, in § "LIB-VENDOR-0.1.3" below. `alert` and `form` also differ.

### Relayed citations (DL17)

Two thepile streams found stale thepile citations inside THIS package's docblocks. They ship
verbatim to every consumer through `r/*.json` and are byte-pinned on the thepile side, so neither
stream could fix its own finding: only the library can, and only at the 0.1.3 bump. Both are
docblock text, no behaviour, and both now name a FILE AND A SYMBOL rather than a line - a line
number is exactly what rotted, inside one batch.

- **s1's LOW-1, `description-list.tsx`.** `MemberRow:171` (the 3-column grid with a border per
  cell) and `MemberRow.tsx:80` (one of the two records of the plain-join `cn` two-`text-*` trap)
  both moved at DL17: the consuming product factored that `<dl>` into
  `components/profile/MemberStats.tsx`, a `"use client"` island on this family, whose
  `<DescriptionList>` carries the grid and whose `CELL` const draws the per-cell edge, and whose
  "NO `CELL_LABEL` HERE" docblock restates the trap. Read read-only at
  `a62bc3c7690e33233556c48089f495ff1cb60ffc`; `MemberRow.tsx` now renders `<MemberStats>` and its
  `:80` is prose about the follow-button slot. (`docs/as-built.md:3774`'s table cell also names
  `MemberRow.tsx:80`; that is a DL-era measurement recorded with its date and is left as history.)
- **s3's LOW-6, `checkbox.tsx`.** `OnboardingForm.tsx:171-173`, cited as "the consuming product's
  own house box", was **wrong at the base as well as now**: at `1533f084` those three lines are the
  display-name `FormItem`, and the box was `:229`'s
  `h-6 w-6 … rounded-sm border-2 border-line-strong bg-surface` on the `usageConsent` input. At
  `cb3d415c2783ca445e7d0e5949abb5fd8135a6c5` that row renders `Checkbox`, `CheckboxInput`,
  `CheckboxBox` and `CheckboxIndicator`, so the treatment's own source is now a consumer of the
  part. The docblock names the row by its `name`, which does not move.

`pnpm build:registry` re-ran for both, so `r/description-list.json` and `r/checkbox.json` carry the
new bytes (`registry.test.ts`'s "carries the CURRENT bytes" is why that is a required step, not a
tidy-up). Scan 5 over the two touched sources: **no test pins either docblock's bytes** - the
`.test.ts*` files naming them (`source-files.ts`'s walk, `form-wiring`, `choice-drawing`,
`client-boundary`, `focus-outline`) read paths and rendered output, not comments; the only
byte-level consumer is `registry.test.ts` through `r/`. Probe run after the edit, before the gate:
`Test Files 31 passed (31)` / `Tests 567 passed (567)`, exit 0.

**This is a declared FENCE WIDENING**, not a breach: the fence's write list named `avatar.tsx`,
`alert.tsx` and `r/**`, and this adds the two docblocks (no code in either file - the diff is
comment lines only, checked). No sibling stream touches this repo this batch.

### Consumers

**Run 1, before any code** (`$BATCH_SCRATCH/s2/scan-run1.txt`), was the scan script against an EMPTY
diff and printed zero names by construction; it is recorded as what it is. The enumeration that did
the work was by hand over the surface the brief named
(`$BATCH_SCRATCH/s2/scan-run1-byhand.txt`): `avatar.tsx` and `alert.tsx` are named by
`registry.json`, their own `r/*.json`, `packages/tokens/test/helpers/source-files.ts` (`:46`, `:47`,
and their stories at `:79`, `:80`) and `registry.test.ts`'s item list (`:64`, `:65`), so
`pnpm build:registry` is a REQUIRED step of each commit; the counts live in eight places, re-read at
the base and moved by nothing here.

**Run 2, at the commit point** (diff `a4040016...HEAD`, full output in
`$BATCH_SCRATCH/s2/scan-run2.txt`):

- **Scan 1, exported symbols: seven names.** `avatarBadgeVariants` is the one that is NEW; its only
  reader is `src/index.ts`, and that reader is compulsory (`entry-point.test.ts`). `AvatarImage`,
  `AvatarBadge` and `AvatarBadgeProps` changed signature; `AvatarBadgeProps` is read by
  `entry-point.test.ts`'s type arm, which reads the barrel's source text. `Ground` and `MarkEdge`
  are the two new STORY exports, consumed through `story-suites.ts` by both `stories.test.tsx` (the
  two counters) and `tailwind-compile.test.tsx` (the compile check and the 44px floor) - neither
  needed an edit, because the map is keyed by part and read off the directory.
- **Scan 3, tests naming a touched path:** eleven hits, all read; the only real consumers are
  `avatar-drawing.test.tsx` (this stream's), `entry-point.test.ts` and `registry.test.ts`. The rest
  are basename collisions on `index` (`packages/*/package.json`, `form-wiring.test.tsx`,
  `tailwind-compile.test.tsx`), which name no avatar and no alert symbol.
  ⚠️ **In THIS repo the scan-3 snippet the brief carries is too NARROW, and its `scripts` pathspec
  is dead.** There is no `scripts/` directory here, but `git grep` does not error on it: measured at
  this head, the loop returns byte-identical output with and without it (the same one file, both
  ways), so dropping it changes nothing. The real loss is the file set. Run as written
  (`'*.test.ts' '*.test.tsx' '*.spec.ts' scripts`) it returns **one** file,
  `packages/ui/test/entry-point.test.ts`, because this package's consumers-by-path are not tests:
  they are the registry items and the shared helpers. Re-run over `'*.test.ts' '*.test.tsx' '*.ts'
'*.json'` it returns **nine** - `packages/tokens/package.json`,
  `packages/tokens/test/helpers/source-files.ts`, `packages/ui/package.json`,
  `packages/ui/r/{alert,avatar,registry}.json`, `packages/ui/test/entry-point.test.ts`,
  `packages/ui/test/helpers/story-suites.ts`, `registry.json` - every one already named above, and
  the same nine r6 got independently. Recorded so the next library stream widens the pathspec
  instead of trusting the count.
- **Scan 4, role/aria strings: four hits, all PROSE.** `role="status"` and `role="alert"` appear only
  inside `alert.tsx`'s docblock, one removed line and three added. No element in the diff writes,
  removes or displaces a role, so nothing resolves differently.
- **Scan 5, class-string literals:** the load-bearing one is `bg-surface`, which this diff MOVES out
  of a `cva` base. It is pinned in four other files - `emitted-surface.test.ts`,
  `choice-drawing.test.tsx`, `fidelity.test.tsx`, `fixtures/upstream-classes.json` - and **none of
  them names avatar at all** (`choice-drawing.test.tsx:340` mentions the word in a comment about a
  composition), so the move has exactly one consumer and it is this stream's own arm.
  `bg-raised` and `border-[1.5px]` are pinned by nothing.
- **CROSS: 0** (no sibling stream touches this repo this batch). **UNOWNED: 0.** **NEW between the
  two runs: 3** - `avatarBadgeVariants`, `Ground`, `MarkEdge`, all of them this stream's own
  additions, and the barrel requirement behind the first was already found by hand in run 1.

## Layer 1 (reviewer r6, detached worktree of af0353608a580a8fc2c3a47e86ec6f46491a3945, marquee-ui, no database)

**6 findings: 0 HIGH, 2 MED, 4 LOW**, over **22 mutations**, of which **5 stayed GREEN** - three
fixed below, two recorded with their reason. Its full report is `$BATCH_SCRATCH/r6/report.md`. Its
baseline on the untouched committed head was `pnpm test` **31 files / 566 tests** (exit 0),
`pnpm typecheck` `packages/tokens: Done` + `packages/ui: Done` (exit 0), `pnpm lint`
`All matched files use Prettier code style!` (exit 0), and `pnpm build:registry` followed by
`git status --short` **EMPTY** - the committed `r/` is byte-for-byte what the sources produce.
Re-confirmed after its last revert: `31 passed (31)` / `566 passed (566)`, `git status --short`
empty. It re-ran scans 1, 2, 3 and 5 independently and found **0 names this section's list misses**.
The table is its own, verbatim:

| file                                       | test                                                                            | mutation applied                                                               | red / GREEN                                                                                                                                                                                                          | what it asserts now                                                                                                                                                                                       |
| ------------------------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/ui/src/avatar.tsx`               | `avatar-drawing` "resolves the ground axis…" + `stories` `avatar/Ground`        | drop `ground` from `avatarImageVariants({ edge, ground })`                     | red — `AssertionError: expected [ 'var(--surface)' ] to deeply equal [ 'var(--raised)' ]` (+ `expected [ 'h-full', 'w-full', …(5) ] to include 'bg-raised'`); 3 failed / 132 passed                                  | —                                                                                                                                                                                                         |
| `packages/ui/src/avatar.tsx`               | `avatar-drawing` "resolves the MARK's edge axis…" + `stories` `avatar/MarkEdge` | `avatarBadgeVariants({ edge })` → `avatarBadgeVariants({})`                    | red — `AssertionError: expected 2 to be 1.5 // Object.is equality` (+ `… to include 'border-[1.5px]'`); 3 failed / 132 passed                                                                                        | —                                                                                                                                                                                                         |
| `packages/ui/test/avatar-drawing.test.tsx` | both new arms                                                                   | `tokensOf` collapsed to `() => []`                                             | red — `expected [] to deeply equal [ 'var(--raised)' ]` and `expected [] to deeply equal [ '1.5px' ]`; 2 failed / 9 passed                                                                                           | —                                                                                                                                                                                                         |
| `packages/ui/src/avatar.tsx`               | `avatar-drawing` (whole file)                                                   | delete EVERY `border-border-strong` — image `default`, image `thin`, mark base | **GREEN** in `avatar-drawing.test.tsx` (11 passed). Gate: 3 failed / 563 passed, the only behavioural catcher being `avatar/MarkEdge` `… to include 'border-border-strong'`                                          | the file still asserts both border WIDTHS (2/1.5/1/null) and that the two marks agree with each other; it asserts nothing about the ink existing — all three `border-color` lines are `[] === []` (MED-1) |
| `packages/ui/src/avatar.tsx`               | `avatar-drawing` ×2 + `stories` `avatar/Ground`                                 | drop `ground: "surface"` from `avatarImageVariants`' `defaultVariants`         | red — `expected [] to deeply equal [ 'var(--surface)' ]` (twice) + `… to include 'bg-surface'`; 4 failed / 131 passed                                                                                                | —                                                                                                                                                                                                         |
| `packages/ui/src/avatar.tsx`               | `avatar-drawing` ×2 + `stories` `avatar/MarkEdge`                               | `avatarBadgeVariants`' `defaultVariants` → `{}`                                | red — `expected null to be 2 // Object.is equality` (twice) + `… to include 'border-2'`; 4 failed / 131 passed                                                                                                       | —                                                                                                                                                                                                         |
| `packages/ui/src/avatar.tsx`               | `avatar-drawing` "resolves the ground axis…"                                    | put `bg-surface` BACK in `avatarImageVariants`' base, keep the axis            | red — `expected [ 'var(--surface)', 'var(--raised)' ] to deeply equal [ 'var(--raised)' ]`; gate 2 failed / 564 passed. `avatar/Ground` stayed GREEN                                                                 | reproduces the stream's claim exactly; the story's `not.toContain("bg-surface")` is blind to it (this package's `cn` merges)                                                                              |
| `packages/ui/src/avatar.tsx`               | `avatar-drawing` "resolves the MARK's edge axis…"                               | put `border-2` BACK in `avatarBadgeVariants`' base, keep the axis              | red — `expected [ '2px', '1.5px' ] to deeply equal [ '1.5px' ]`; gate 2 failed / 564 passed. `avatar/MarkEdge` stayed GREEN                                                                                          | reproduces the stream's claim exactly; same blindness in the story                                                                                                                                        |
| `packages/ui/src/avatar.tsx`               | (none)                                                                          | `AvatarBadgeProps`' `VariantProps<…>` → `{ edge?: unknown }`                   | **GREEN** in `pnpm test` (565 passed, registry byte guard only). `pnpm typecheck` red — `src/avatar.tsx(288,43): error TS2322: Type 'unknown' is not assignable to type '"default" \| "thin" \| null \| undefined'.` | no test observes the axis is typed; `tsc` is the whole instrument (LOW-4)                                                                                                                                 |
| `packages/ui/src/index.ts`                 | `entry-point` "re-exports every value each part file exports, by name"          | drop `avatarBadgeVariants` from the barrel                                     | red — `expected [ Array(1) ] to deeply equal []`; 1 failed / 565 passed                                                                                                                                              | —                                                                                                                                                                                                         |
| `packages/ui/r/alert.json`                 | `registry` "carries the CURRENT bytes of every source it ships"                 | revert to the base's bytes                                                     | red — `AssertionError: alert: packages/ui/src/alert.tsx is stale: expected 'import { Slot } from "@radix-ui/react…' to be 'import { Slot } from "@radix-ui/react…'`; 1 failed / 13 passed                            | —                                                                                                                                                                                                         |
| `packages/ui/src/avatar.tsx`               | `avatar-drawing` "cuts the mark out of the face…"                               | delete `leading-none` from `avatarBadgeVariants`' base                         | red — `expected [] to include '1'`; gate 2 failed / 564 passed                                                                                                                                                       | —                                                                                                                                                                                                         |
| `packages/ui/src/avatar.tsx`               | `avatar-drawing` "cuts the mark out of the face…"                               | move `leading-none` BEFORE `text-[length:…]` (the docblock's own claim)        | red — `expected [] to include '1'`; gate 2 failed / 564 passed                                                                                                                                                       | —                                                                                                                                                                                                         |
| `packages/ui/src/avatar.tsx`               | (none)                                                                          | stop destructuring `ground`; leave it in `{...props}`                          | **GREEN** — 565 passed / 1 failed (registry byte guard only); `pnpm typecheck` `Done`. Probe: `<img … class="… bg-raised" ground="raised" src="/f.svg">`                                                             | nothing asserts the variant props stay off the DOM; the class list is still correct, so every class-based arm passes (LOW-1)                                                                              |
| `packages/ui/src/avatar.tsx`               | `avatar-drawing` + `stories` + `tailwind-compile`                               | `raised: "bg-raised"` → `"bg-raisedd"`                                         | red — `expected [] to deeply equal [ 'var(--raised)' ]`, `… to include 'bg-raised'`, `expected [ 'bg-raisedd' ] to deeply equal []`; 5 failed                                                                        | —                                                                                                                                                                                                         |
| `packages/ui/stories/avatar.stories.tsx`   | `stories` `avatar/Ground`                                                       | delete all three `await expect(…)` in the `Ground` play                        | **GREEN** — `Test Files 31 passed (31)` / `Tests 566 passed (566)`                                                                                                                                                   | the story still RENDERS (a throw in render would redden) and still counts toward `DECLARED_PLAYS`; it asserts nothing about the ground (LOW-2)                                                            |
| `packages/ui/stories/avatar.stories.tsx`   | `stories` `avatar/MarkEdge`                                                     | delete all five `await expect(…)` in the `MarkEdge` play                       | **GREEN** — `Test Files 31 passed (31)` / `Tests 566 passed (566)`                                                                                                                                                   | same; and this is the deletion that removes the family's only guard for `border-border-strong` (MED-1)                                                                                                    |
| `packages/ui/stories/avatar.stories.tsx`   | `stories` "runs all 74 play functions…"                                         | delete the `play:` key from `Ground`                                           | red — `stories whose play was composed: expected [ … ] to have a length of 74 but got 73`; 1 failed / 565 passed                                                                                                     | —                                                                                                                                                                                                         |
| `packages/ui/stories/avatar.stories.tsx`   | `stories` counters ×2                                                           | delete the whole `Ground` story                                                | red — `expected [ … ] to have a length of 103 but got 102` and `… to have a length of 74 but got 73`; 2 failed / 563 passed                                                                                          | —                                                                                                                                                                                                         |
| `packages/ui/stories/avatar.stories.tsx`   | `stories` "covers all nineteen part families…"                                  | ADD a story (`ReviewerProbe`), leave `DECLARED_STORIES` at 103                 | red — `expected [ 'accordion/Single', …(103) ] to have a length of 103 but got 104`; 1 failed / 566 passed                                                                                                           | —                                                                                                                                                                                                         |
| `packages/ui/stories/avatar.stories.tsx`   | `stories` `avatar/Ground`                                                       | remove `ground="raised"` from the `Ground` render                              | red — `expected [ 'h-full', 'w-full', …(5) ] to include 'bg-raised'`; 2 failed / 122 passed                                                                                                                          | —                                                                                                                                                                                                         |
| `packages/ui/stories/avatar.stories.tsx`   | `stories` `avatar/MarkEdge`                                                     | remove `edge="thin"` from the `MarkEdge` render                                | red — `expected [ 'absolute', '-right-[4%]', …(15) ] to include 'border-[1.5px]'`; 2 failed / 122 passed                                                                                                             | —                                                                                                                                                                                                         |

### What each GREEN row cost, and what changed

**MED-1 (GREEN row 4): the ink assertions were three compare-two-empties, and the family could lose
its ring colour entirely with the drawing file fully green.** Three arms in `avatar-drawing.test.tsx`
compared one part's `border-color` to another's, and `sheet.declaredValues` answers `[]` for a
property nobody declares - so `[] === []` passed. Deleting EVERY `border-border-strong` from
`avatar.tsx` (the image's `default` and `thin` edges and the mark's base) left the file whose own
docblock says it reads "every number the drawing is MADE of" at **11 passed**, and the only
behavioural catcher in the whole gate was this diff's own new story play, itself a class-name
assertion and itself deletable (LOW-2). Fixed: the ink is pinned ONCE, to a new module constant
`RING_INK = ["var(--border-strong)"]`, and all three arms read it. The value was **measured off the
compiled sheet, not typed** - the probe asserted `["PROBE"]` and read back
`expected [ 'var(--border-strong)' ] to deeply equal [ 'PROBE' ]`. The property the comparisons were
reaching for - that the mark's ink and the face's are ONE role - is now the shared constant itself,
and the docblock on it carries the finding.

**LOW-1 (GREEN row 14): nothing observed that the variant props are kept off the DOM.** `ground` and
`edge` are stripped from the element only by being destructured out of `...props`. Leaving `ground`
in the spread shipped
`<img data-slot="avatar-image" … class="… bg-raised" ground="raised">` to every registry consumer -
an invalid attribute plus React's "does not recognize the prop" warning - with `pnpm test` at **565
passed** (the one red being the registry BYTE digest, which fires for any edit) and `pnpm typecheck`
`Done`. Fixed: a new arm in `avatar-structure.test.tsx`, "keeps the variant props OFF both elements,
which only the destructure does", which anchors `bg-raised` and `border-[1.5px]` **positively first**

- so an arm whose render silently drew nothing cannot pass on two absences - and then reads both
  attributes back off both elements. **Its reddening mutation was RUN**, in the detached worktree
  `/home/ankit/Code/mq-probe-s2` at the committed head `cffc1a09`, and the red is the one predicted:
  `AssertionError: image keeps ground off the DOM: expected 'raised' to be null`, **1 failed / 4
  passed**. That worktree was `git reset --hard` back to `cffc1a09` immediately after, with
  `git status --short` empty.

**MED-2 and LOW-3 (not GREEN rows - factual, and both corrected in `cffc1a0`).** `alert.tsx`'s new
docblock, which ships verbatim to every consumer through `r/alert.json`, said the rule was "measured
at the reference product's two sites". There is exactly ONE `<Alert>` site at thepile `1533f084`
(`git grep -ln 'from "@/components/ui/alert"' -- apps/web/src` → `app/login/page.tsx` alone);
`/settings/steam` renders a raw `<p data-testid="steam-link-notice">` and only CITES the rule. And
`/login` carries BOTH halves by itself, so the honest sentence is "one site, both paths", plus a
second non-`Alert` notice that took the same decision. The as-built bullet had the same error
backwards: it cited "the notice is there at first paint" as the REASON the role was dropped, which
is the sentence `login/page.tsx:63-65` flags in its own ⚠️ - **"AND THIS NOTICE DOES ARRIVE, SO 'IT
IS THERE FROM FIRST PAINT' IS NOT THE REASON (layer 1 caught exactly that sentence here, and it was
false)"**. Both now say it the one way round the source supports: `/login` arrives by soft navigation
and declines because the region is inserted with its sentence; first paint is the typed-or-reloaded
path, a second reason.

**LOW-2 (GREEN rows 16 and 17): RECORDED, not fixed.** Deleting all three `await expect(…)` in the
`Ground` play, and all five in `MarkEdge`, each leave the gate at `31 passed (31)` / `566 passed
(566)`. This is the documented limitation of `stories.test.tsx:57-73` - `DECLARED_PLAYS` counts plays
that exist and RAN, not plays that assert, and "no self-counting mechanism inside a file can defend
that file against being edited to lie about itself". It is pre-existing for all 74 plays, and the
counters do catch the two structural cases (removing the `play:` key, removing the story). MED-1's
fix removed the one thing that made it matter here: `MarkEdge` was the family's ONLY guard for the
mark's border ink, and `RING_INK` is now that guard, in the file that reads resolved values.

**LOW-4 (GREEN row 9): RECORDED.** Widening `AvatarBadgeProps`' `VariantProps` to `unknown` leaves
`pnpm test` at 565 passed and is caught by `pnpm typecheck` alone
(`src/avatar.tsx(288,43): error TS2322`). `entry-point.test.ts`'s type arm reads the barrel's source
text for the type NAME and cannot see its shape. `tsc` is the whole instrument and it is in the gate;
this is recorded so nothing in this doc credits a test with it.

Nothing the reviewer raised was declined.

### The gate

**ONE run, detached under a batch gate token, read from its sentinel**
(`$BATCH_SCRATCH/s2/verify.exit`), at head `72f8cfaa6a8f67a786c87e9164a3a77399d1dc5b` -
the head with both docs commits and the relayed citations on it. **Exit 0**, in **16 s** wall clock
(a warm tree: `node_modules` and the Storybook cache were already there; the same gate cold at the
0.1.2 bump took 2.6 minutes). The runner's own lines:
`All matched files use Prettier code style!`, `packages/tokens typecheck: Done` +
`packages/ui typecheck: Done`, `packages/tokens build: wrote 5 files`, `✔ Building registry.`,
`└  Storybook build completed successfully`, and
**`Test Files 31 passed (31)` / `Tests 567 passed (567)`**.

`git status --short` was EMPTY before the gate and after it - and the gate runs `build:registry`
itself, so that empty status is the proof that the committed `packages/ui/r` is byte-for-byte what
these sources produce, including the two docblocks this stream re-cited.

That is **+5 tests on 31 unchanged files** against the base (`a4040016`, 31 / 562, measured at
DL16's own closure above): four for the two new axes (two drawing arms, two story plays) and one for
layer 1's LOW-1 structure arm. No file was added to the suite, because every new arm belongs to a
file that already existed.

Pre-gate, bare and repo-wide, each read from its OWN exit rather than from a filter: `pnpm lint`
exit 0, `pnpm typecheck` exit 0.

No push, no tag, no `npm publish`, no PR: the freeze holds, and `packages/ui/package.json` is still
`0.1.2`. Everything on this branch belongs to the 0.1.3 bump, including the two re-citations, which
cannot reach thepile before it.

## LIB-VENDOR-0.1.3: `@marquee-ui/ui` 0.1.3, the two axes and two error paths reach a consumer (2026-09-22)

Batch DL18, stream s2, branch `s/lib-vendor-0.1.3` from `next` @ `6227d64`. Three commits here: the
`Announced` story's docblock, the version line, and this block. The consuming half lives in thepile's
`docs/slices/LIB-VENDOR-0.1.3.md`, and the two halves are ONE stream this time.

### What the bump carries - measured against the 0.1.2 TARBALL, not against the commit range

⚠️ **The commit range and the pack disagree, and the pack is what a consumer receives.**
`git diff --stat c9115f7 HEAD -- packages/ui/src packages/ui/r packages/ui/package.json` is
**14 files changed, 313 insertions(+), 60 deletions(-)** and names SEVEN sources
(`alert`, `avatar`, `checkbox`, `description-list`, `form`, `index.ts`, `radio-group`). But 0.1.2 was
packed at `0b135c1`, which is four commits PAST the bump commit `c9115f7`, so HIGH-1's fix to
`checkbox.tsx` and `radio-group.tsx` is already inside the 0.1.2 tarball. Every `r/*.json` of that
tarball compared by `cmp` against `packages/ui/r` at `6227d64`:

```
differ:    alert.json  avatar.json  checkbox.json  description-list.json  form.json
identical: the other 15 items AND registry.json          (5 of 21 files)
```

**FIVE items differ**, `radio-group` among the identical ones. The consuming product pins all twelve
of its copies byte for byte and consumes all five of these, so **the bump reddens FIVE of its drift
byte arms**. ⚠️ **The DL17 record above, the "thepile inputs" bullet of DESIGN-LIB-d-command and the
DL18 cursor all say THREE**; they counted the commits they knew of (the two axes and the two relayed
citations), and `form`'s and `alert`'s moves are DL16's and DL17's, in the same range. Corrected in
place here; the "thepile inputs" bullet is left as the dated reading it was.

| item               | `content` B     | CODE B (comment lines dropped) | what moved                                                            | landed                          |
| ------------------ | --------------- | ------------------------------ | --------------------------------------------------------------------- | ------------------------------- |
| `alert`            | 5,616 → 7,407   | 1,294 → 1,294                  | **docblock only**: the role rule's second half                        | `6caae60`, `cffc1a0`            |
| `checkbox`         | 10,094 → 10,674 | 3,224 → 3,224                  | **docblock only**: a relayed citation                                 | `72f8cfa`                       |
| `description-list` | 25,295 → 29,346 | 8,784 → 9,667                  | `crossedAClientBoundary` + a throw, **error path only**               | `265d871`, `a404001`, `72f8cfa` |
| `form`             | 16,797 → 20,765 | 5,237 → 6,210                  | the same walk in `countParts` + a longer message, **error path only** | `265d871`, `a404001`            |
| `avatar`           | 11,269 → 14,471 | 2,535 → 2,873                  | **the two axes**                                                      | `97758ea`                       |

⚠️ DL17's record gave `description-list` as 25,225. That is the string's LENGTH IN CHARACTERS; the
BYTES are 25,295. Both are stated once, here, so neither is repeated as the other.

The two axes, read out of the tarball rather than out of the diff: `avatarImageVariants` loses
`bg-surface` from its `cva` BASE and gains `ground: { surface: "bg-surface", raised: "bg-raised" }`
(default `surface`); `AvatarBadge` gains `avatarBadgeVariants` with
`edge: { default: "border-2", thin: "border-[1.5px]" }` (default `default`) and its literal string
moves into that base. **Both defaults reproduce the 0.1.2 drawing**, so a consumer that names no
value is byte-identical at the bump - which is the whole reason the axes could ship separately from
the consumption that wanted them.

`src/` moves in exactly those five files plus `index.ts` (`+avatarBadgeVariants`, one export line);
`src/lib` is identical. **LOW-2's widened `ringSites()` sweep (`c1f6c9a`) is in the range and is NOT
in the pack**: `files` is `["r","src"]` and the sweep lives in `packages/ui/test/`, so it reaches no
consumer. It is recorded here so the range and the tarball are not confused again.

### The packed tarball, as measured

```
$ pnpm --filter @marquee-ui/ui pack --pack-destination …/thepile-LIB-VENDOR-0.1.3/vendor/marquee-ui/
$ stat -c %s marquee-ui-ui-0.1.3.tgz ; sha256sum marquee-ui-ui-0.1.3.tgz
103191
f7425339d4df9527d8788a7dcb85d386dcb1478110945b30f907d57f74c146d0
```

|                                         | `ui@0.1.2`'s tarball                     | this one   |
| --------------------------------------- | ---------------------------------------- | ---------- |
| bytes                                   | 92751 → 93771 (repacked at HIGH-1's fix) | **103191** |
| `r/` json files (incl. `registry.json`) | 21                                       | **21**     |
| `src/` modules (`.ts`/`.tsx`)           | 21                                       | **21**     |

`files` is unchanged, no item and no module arrives, so 93771 → 103191 is CONTENT: two docblocks,
two error paths and one family's two axes, each carried twice (once as the source module, once
inlined into its registry item's `content`, because an item has to be self-contained for an offline
`shadcn add`). The tarball carries **no** `.test.`, `.spec.` or `stories` file - counted, not
assumed (`tar -tzf | grep -cE '\.(test|spec)\.|stories'` → **0**), because the consuming repo's
corpus guard walks from ITS repo root.

**The packed `package.json`, READ from the tarball:**

```
$ tar -xzOf marquee-ui-ui-0.1.3.tgz package/package.json | …
version: 0.1.3
files: ["r","src"]
devDeps @marquee-ui/tokens: "0.1.0"
deps: @radix-ui/react-accordion @radix-ui/react-dialog @radix-ui/react-label
      @radix-ui/react-separator @radix-ui/react-slot class-variance-authority clsx tailwind-merge
```

`workspace:*` is rewritten to the exact `0.1.0` again, in `devDependencies`, which a consumer never
installs - so it cannot reach the consuming app's resolution. The eight `dependencies` are unchanged
from 0.1.2, which is what keeps the consumer's `declares every dependency` arm green across the bump.

### `@marquee-ui/tokens` does NOT bump with it (DL12 decision 1, re-measured a third time)

```
$ git diff --stat tokens@0.1.0 HEAD -- packages/tokens/src
(nothing)
```

Nothing a consumer receives has moved, so tokens stays `0.1.0` and **ONE tarball is vendored
downstream, not two.**

### `pnpm build:registry` after the version line: `r/` byte-unchanged

```
$ pnpm build:registry && git status --short
✔ Building registry.
 M packages/ui/package.json
```

The built index does not carry the package version, so the version line is the whole of that commit

- the same read as at 0.1.2, now taken at 0.1.3 as well rather than carried over.

### `prepack`'s stale-registry refusal, proved live again

Re-run at the bump commit `5976422`, in a **detached worktree**, because the mutation lives in
`packages/ui/src/**`:

| mutation                                                                                                          | landed                                                   | the red                                                                                                                                                                                                                   |
| ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bg-surface` → `bg-sunken` in `AvatarBadge`'s new `cva` base (`packages/ui/src/avatar.tsx:239`), `r/` not rebuilt | confirmed by `grep -n bg-sunken` before the run was read | `pnpm run prepack` exit **1**, the `git diff --exit-code -- r` output naming `packages/ui/r/avatar.json` and carrying `bg-sunken` inside its `content` string. **No tarball was written** (`ls packages/ui/*.tgz` → none) |

So the 103191 bytes above cannot be bytes that disagree with `src/`. Mutation reverted with
`git checkout --`, `git status --short` empty, worktree removed.

### The `Announced` story's docblock

DESIGN-LIB-d-command's follow-up 4, the one `src`-adjacent edit of this bump and the only reason
`stories/` is touched at all. The story's docblock carried the FIRST half of `alert.tsx`'s role rule
("a notice that ARRIVES gets a role from its caller") and stopped there, which reads as if a
conditionally mounted `<Alert role="status">` would be announced - the exact case `alert.tsx:24-40`
added a warning about. The sentence now says arriving is half of it and that a role announces
nothing unless the region is in the document, empty, before its text is, and it names what the story
actually demonstrates: the prop reaching the box. The story's `args`, its `play` and its assertions
are untouched.

Stories are not in `files`, so this does not move the tarball; it moves the docs site and nothing
else. ⚠️ **AND NO TEST OBSERVES IT, WHICH IS WORTH SAYING BECAUSE THE OBVIOUS SENTENCE IS WRONG**
(layer 1 MED-1, proved rather than argued): `stories.test.tsx` composes and renders every story, so
it is easy to write that a docblock edit "rides the existing suite". It does not. Deleting the added
paragraph leaves `Test Files 31 passed (31)` / `Tests 567 passed (567)`; deleting the ENTIRE
`Announced` docblock leaves the same 567, and `prettier --check` and `eslint` both pass a
160-character comment line. **The only instrument that reads this prose is
`packages/tokens/test/brand-guard.test.ts`, and only for brand vocabulary** - inserting the
consuming product's name into the paragraph reddens `ships no brand string of the consuming app`,
and nothing else can tell the rule from its opposite. So the probes below are evidence that the
STORY still renders and that the prose carries no product noun, and are evidence about nothing else:
`Test Files 2 passed (2)` / `Tests 129 passed (129)` over `stories.test.tsx` + `alert-tone.test.tsx`,
and `brand-guard.test.ts` `2 passed`.

### The granted widening: `RadioGroup`'s checked dot under `forced-colors: active`

**A DECLARED FENCE WIDENING**, relayed from the consuming product's RadioGroup stream and granted by
the orchestrator: `packages/ui/src/radio-group.tsx`'s `indicatorClass`, one new guard under
`packages/ui/test/`, and `r/radio-group.json` rebuilt - which re-packs the tarball.

**What was wrong, measured downstream rather than reasoned here.** The consumer hashed each circle's
own pixels on three builds: the native radio it replaced was distinguishable checked vs unchecked
(`74d5812fdd5244c9` / `08c39d972b02379c`), DL17's shipped `Checkbox` is distinguishable
(`5694feb3aab7a489` / `41a0a4c610a63659`), and this family's circle on the part hashed **IDENTICAL
both ways** (`d91108c431a92623`). So the consumption introduced a regression on every route that
mounts it, which is why it is not deferred the way `input.tsx:6` is.

**The mechanism, and why only this family had it.** Forced colors is not a palette swap: the UA
collapses every paint into two system colours, a FOREGROUND (`color`, `stroke`, `border-color`,
`outline-color`) forced to `CanvasText` and `background-color` forced to `Canvas`. The dot was
`bg-primary-foreground` inside a circle that goes `bg-primary` on checked, so both became `Canvas`
and the dot vanished into its own circle. `Checkbox` escapes because its tick is an SVG `stroke`;
`Switch` because its thumb MOVES and geometry is not forced at all. **`RadioGroup` was the only
family in the package signalling state in `background-color` alone.**

**The fix is one token**: `forced-colors:border-4` on `indicatorClass`. On a `size-2` box that is a
SOLID disc rather than a ring - 8px box, `border-box` sizing from preflight, 4px of border on every
side meeting in the middle - so the mode draws what the native control draws, in the user's own ink.
Read from the emitted sheet rather than typed:

```
@media (forced-colors: active) {
  .forced-colors\:border-4 { border-style: var(--tw-border-style); border-width: 4px; }
}
```

⚠️ **Scoped to the media query because the NORMAL drawing must not move**: outside it the class
string is byte-for-byte what it was, which is the constraint the widening carried (the consumer's
measurement table and its e2e arm are written against the current dot).

**`test/forced-colors-state.test.tsx`**, three arms, the invariant DERIVED over every part rather
than listing this one: an element REVEALED by a checked state (`opacity-0` flipped to `opacity-100`
under a checked variant) must paint with something the mode keeps - a foreground width or a stroke -
or declare its own treatment inside a real `@media (forced-colors: active)` block. It reads the
COMPILED SHEET, never a class name, because `stroke-primary-foreground` and `bg-primary-foreground`
are one character apart and land in different buckets. `KNOWN_GAPS` ships empty with the same expiry
device `focus-outline.test.tsx` uses.

**Red first, then green, and the mutation pass found two holes in the guard itself:**

| mutation (detached worktree of the committed head)             | red / GREEN                     | the message                                                                                                                                                                                                   |
| -------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| the fix reverted (the defect restored)                         | red 1/3                         | `a part reveals an element on checked whose only paint is a background … INVISIBLE`, naming `radio-group.tsx: … paints background-color ["var(--primary-foreground)"] and nothing the mode keeps`             |
| `forced-colors:border-4` → `border-0`                          | **GREEN** → **FIXED** → red 1/3 | a width of zero is not a paint: it compiles, lands in the media block, declares `border-width`, and paints nothing. `paints()` now resolves a width through the sheet's length reader and requires > 0        |
| the `forced-colors:` prefix dropped (unconditional `border-4`) | **GREEN**                       | correct, not a hole: an unconditional foreground border DOES survive the mode. It violates the other half of the widening - the normal drawing must not move - which the consumer's table pins, not this file |
| the site walk collapsed to `[]`                                | red 2/3                         | `no part reveals anything on checked: the walk found nothing: expected 0 to be greater than or equal to 2`                                                                                                    |
| `FOREGROUND_PAINT` gains `background-color`, fix removed       | **GREEN** → **FIXED** → red 1/3 | the bucket cut IS the expectation, so it is anchored on the predicate's behaviour rather than by asserting the table against itself: `a background counts as a foreground: the bucket cut is gone`            |
| `paints()`'s width check collapsed to declared-only            | **GREEN**                       | carried by the sibling suites: `sheet.declared` is pinned many times over by `avatar-drawing`, `switch-drawing` and `choice-drawing`, and a broken reader reddens there (DL15's layer 1 measured 8 tests)     |

⚠️ **AND A THIRD HOLE, WHICH LAYER 2 FOUND AFTER THIS STREAM'S OWN MUTATION PASS HAD CLOSED TWO**
(DL18 layer 2, MED-3). The guard landed after r6's review, so layer 2 was the first reviewer to
probe it, and it proved the guard green where it must be red. The shared helper files every rule
under its class name WHATEVER media query or state selector wraps it, so the guard's flat read
counted a border declared under any prefix as a paint - and the clause that looked for
`@media (forced-colors: active)` never decided anything, because the flat read had already said
yes. Reproduced here in a detached worktree of `d591120` before any change, each of these left the
guard at `Tests 3 passed (3)`: `forced-colors:border-4` → `hover:border-4`; → `print:border-4`; →
`text-primary-foreground`; `border-none` added beside the fix.

**The emitted shapes, read before the rewrite:** `forced-colors:border-4` is a bare `.class` rule
inside `@media (forced-colors: active)`; `print:border-4` a bare rule inside `@media print`;
`hover:border-4` is `.hover\:border-4:hover`, a pseudo on the selector; `border-none` is a
top-level `--tw-border-style: none; border-style: none`.

**The fix is in the guard, not the helper.** Every declaration is now PLACED by walking the emitted
css with postcss: `unconditional` (a bare `.class` rule under no media query and no state
selector), `forced` (a bare `.class` rule inside `@media (forced-colors: active)` and nothing else)
or `conditional` (anything else). Only the first two can save a revealed element. The style half
resolves `--tw-border-style` against the element's own tokens before the registered initial value,
so a `border-none` beside a border kills it; `color` alone is out of the paint set, a dot having no
text; and movement is out of the invariant, since an invisible thing that moves is still
invisible. The helper is untouched - its flat view is right for the geometry its other readers
measure. Two anchors pin the placement itself: a `hover:` utility the package really ships
(`button.tsx`'s `hover:border-border-strong`) must not read as unconditional, and the fix must read
as `forced` and NOT as `unconditional`.

**Every mutation, run in a detached worktree of the committed head `3dab7ea`, landing confirmed by
`grep`, restored with `git checkout --`:**

| mutation                                                              | before (d591120) | after (3dab7ea) | what reddens                                                                                                                                                                                      |
| --------------------------------------------------------------------- | ---------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `forced-colors:border-4` → `hover:border-4`                           | GREEN 3/3        | **red 2 of 3**  | the invariant, `radio-group.tsx: revealed on checked, paints background-color ["var(--primary-foreground)"] and nothing the mode keeps`, and `the fix is not placed under forced colors`          |
| → `print:border-4`                                                    | GREEN 3/3        | **red 2 of 3**  | the same two                                                                                                                                                                                      |
| → `text-primary-foreground`                                           | GREEN 3/3        | **red 2 of 3**  | the same two                                                                                                                                                                                      |
| `border-none` added beside the fix                                    | GREEN 3/3        | **red 1 of 3**  | the invariant alone: the fix still compiles and places as `forced`, and the style resolution is what refuses it                                                                                   |
| the fix removed                                                       | red              | **red 2 of 3**  | the invariant, naming `radio-group.tsx` as above - still reddens                                                                                                                                  |
| `savedUnderForcedColors` collapsed to `false`                         | GREEN 3/3        | **red 2 of 3**  | the invariant, and `the fix is not placed under forced colors`                                                                                                                                    |
| every declaration placed `unconditional` (the OLD flat view restored) | -                | **red 2 of 3**  | the two ANCHORS: `the walk placed nothing conditional` and `a hover: rule reads as unconditional`. The invariant itself PASSES here - that is MED-3 reproduced, and exactly why the anchors exist |

⚠️ **One more finding on the way, in the hardened file's own first version**: its instrument anchor
counted declarations placed `forced`, and the only forced-colors rule in the package IS the fix, so
removing the fix also reported a broken instrument. An anchor that fires on a defect reports the
defect as a broken reader, so it now counts only the placements that exist whatever any one fix
does (`unconditional` > 100, `conditional` > 10), and the test-1 arm stays green under every
defect mutation above.

**The tarball does NOT move, and that is measured, not argued.** Since the packed head `a885aea`
the only files changed are `packages/ui/test/forced-colors-state.test.tsx` and this document;
`git diff --stat a885aea HEAD -- packages/ui/r packages/ui/src packages/ui/package.json` prints
nothing, and a re-pack at `8f28657` into a scratch directory hashes
`bdb07c212963b7af53227115191cd29538ca2e3d934a71c0994c8d5eaffd31a8`, byte-identical to the one the
consumer vendored. So the consumer's tarball, lockfile and copies all stand. `pnpm verify` at
`8f28657`: **exit 0**, `Test Files 32 passed (32)` / `Tests 570 passed (570)` - the same counts as
at `a885aea`, because MED-3 rewrote the guard's three tests rather than adding any - with
`git status --short` empty around it.

`pnpm verify` at the new head `a885aea`: **exit 0**, `Test Files 32 passed (32)` / `Tests 570 passed
(570)` - +1 file / +3 tests on this bump's own earlier 31 / 567, all of it this guard -
`git status --short` empty before and after, so the committed `r/` is what `build:registry` produces.

**The tarball is therefore RE-PACKED**, over the same filename: **104309 bytes** (was 103191), sha256
`bdb07c212963b7af53227115191cd29538ca2e3d934a71c0994c8d5eaffd31a8`. `files`, the 21 `r/` json files,
the 21 `src/` modules, the eight `dependencies` and the zero test/spec/stories files are all
unchanged; the delta is one source, one registry item and nothing else. The consuming repo has no
`radio-group` copy installed, so its drift test is **16/16** against the new registry with no re-add

- run, not assumed.

### Two things measured here and deliberately NOT fixed

- **`description-list.tsx:210-212`'s replacement text overstates by one word.** It says both old
  thepile citations "came to point at unrelated prose"; `MemberRow.tsx` is **171 lines** at thepile
  `3f37191c` (measured this session, `wc -l`), so `:171` is its closing BRACE, not prose. `:80` is
  prose, so the sentence is half right. Not fixed: `packages/ui/src/**` is outside this stream's
  fence, and an edit there moves `description-list`'s shipped bytes and re-packs the tarball whose
  five-item measurement this whole slice rests on. For the next bump, with the number.
- **The DESIGN-LIB-d-command "thepile inputs" bullet's THREE.** Corrected in place with a two-line
  forward pointer and NO deletion (the diff's `-` side over that bullet is empty, checked) - a
  **declared FENCE WIDENING**, the fence having named a new block in this
  file rather than an edit to an old one. The bullet's own reasoning is left standing as the dated
  reading it was; leaving it uncorrected is how a number gets repeated as fact, which is the failure
  this file exists to stop.

## DESIGN-LIB-d-disclosure: the `Collapsible` measurement, and `Textarea` (2026-09-23)

Batch DL19, stream s2, on the library's `next` at `f28d56e` (32 files / 570 tests, re-measured at
this base by `pnpm build && pnpm test` before anything moved). thepile is read-only throughout, at
`d67eab8f` (`next`, the commit carrying the DL19 table; `git diff --stat 1f7ab1ad d67eab8f` names
`docs/slices/DESIGN-LIB.md` and nothing else, so every source below reads as it does at the DL18
head), by `git -C … show <sha>:<path>`. Under the push freeze: LOCAL commits on
`s/design-lib-d-disclosure`, no tag, no publish, and `packages/ui/package.json`'s version line stays
`0.1.3`. Whatever ships here rides the 0.1.4 bump.

Every probe below ran in a DETACHED worktree of the base (`../marquee-ui-s2-probe`, `pnpm install
--frozen-lockfile` and the tokens build), as a scratch test plus a scratch source file naming the
probed classes - the compile fixture is `source(none)`, so a class nobody names does not compile and
a probe has to name it in a source directory, never in a test string (AGENTS.md). Outputs under
`$BATCH_SCRATCH/s2/probe/`, the probe sources themselves under `probe/src/`.

### 1. The `Collapsible` measurement, and the answer

**No `Collapsible` family ships.** The audit's three rows reproduce at thepile `d67eab8f`
(`awk -F'|' '$4 ~ /Collapsible/ {print NR}' docs/design-audit.md` → `:350`, `:353`, `:393`), and
every site was read in full, plus the fourth disclosure no row names:

| audit row                                 | what it actually is                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | wants the part?                                                                                                                                                            |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `:350` `/browse/games` ("More platforms") | `components/browse/FilterBar.tsx`, NO directive, a Server Component. `<details open={tailIsActive} className="flex flex-col gap-1">` `:153`, `open` computed on the server (`:121`, its comment `:149-152`); `<summary id={TAIL_LABEL_ID} className="w-fit min-h-11 cursor-pointer list-inside rounded-md px-3 py-3 text-sm text-text-secondary transition-colors hover:text-text">` `:157-162`; the tail `FacetRow` of anchors `:163-172`. The why is `:95-103` and `:154-156` ("giving it `display:flex` would silently remove it")                                                                                                                              | **No.** Its summary is drawn as the bar's third quiet control, beside the chips and the Clear link it sits among, not as a disclosure                                      |
| `:353` `/game/[slug]` (the breakdown)     | `components/game/ScoreBlock.tsx`, NO directive. `BreakdownDisclosure` `:183-274`: `<details data-testid="rating-breakdown" className="max-w-[34rem] rounded-md border-2 border-line-strong bg-surface">` `:209-212`, `<summary data-testid="rating-breakdown-summary" className="min-h-11 cursor-pointer list-item px-3 py-3 font-mono text-xs uppercase tracking-label text-text-secondary hover:text-text">` `:213-220` ("`list-item` keeps the native disclosure triangle, so no `flex` here", `:214-215`), the panel `<div>` `:221-269`. `ScoreBlock.test.tsx:623-634` reads the SOURCE for `"use client"`, `useState` and `onClick` and requires none of them | **No.** Same reason, and the panel is the one content wrapper among all the sites                                                                                          |
| `:393` `/[username]/review/[slug]`        | `components/review/SpoilerShield.tsx`, `"use client"` `:1`, **74 lines**. A ONE-WAY reveal: `revealed` state `:13` and no way back; the content stays in the DOM under `aria-hidden="true" inert className="select-none blur-sm"` `:62` for the SSR permalink; a `<button className="absolute inset-0 …">` `:65-71`; focus moved INTO the revealed content `:35-37` (A11Y-2). TWO consumers: `review/ReviewBody.tsx:26` and the permalink's own `SpoilerContext` (`app/[username]/review/[slug]/page.tsx:182-189`), which wraps the COMMENT THREAD                                                                                                                 | **No - it is not a disclosure.** A disclosure closes again, announces `aria-expanded`, and hides its content from assistive tech while closed; this does none of the three |
| (no row) the log sheet's Details          | `components/log/LogForm.tsx:183-225`, `Section`, inside a `"use client"` form: a hand-built `<button aria-expanded aria-controls={open ? id : undefined}>` whose panel is conditionally RENDERED (`{open && …}` `:218`), with React state behind it. Its stated reason for not being `<details>` (`:183-184`, "jsdom does not implement summary toggling") is measured FALSE below                                                                                                                                                                                                                                                                                 | **No.** A client disclosure with state is `Accordion`'s shape, not a native one's                                                                                          |

**The Radix answer, measured rather than reasoned.** `@radix-ui/react-collapsible` 1.1.20 is already
in this repository's store (a dependency of `@radix-ui/react-accordion` 1.2.20, not of this
package), and its `dist/index.mjs` opens with `"use client";`. Rendered to static markup with a tail
anchor inside, the way the server would serve it (`$BATCH_SCRATCH/s2/probe/probe-out3.txt`):

```
closed:     <div data-state="closed"><button type="button" aria-expanded="false" data-state="closed">More platforms</button><div data-state="closed" id="radix-_R_0_" hidden=""></div></div>
open:       <div data-state="open"><button type="button" aria-controls="radix-_R_0_" aria-expanded="true" data-state="open">More platforms</button><div data-state="open" id="radix-_R_0_"><a href="/x?platform=23">PC-98</a></div></div>
forceMount: <div data-state="closed"><button type="button" aria-expanded="false" data-state="closed">More platforms</button><div data-state="closed" id="radix-_R_0_"><a href="/x?platform=23">PC-98</a></div></div>
```

So it fails all three of row 350's conditions on the served bytes: it is a client module; closed, the
anchor is **not in the HTML at all**, which is the crawler condition and the thing
`e2e/browse-filters.spec.ts:209` asserts (`platform=23` in the body, closed or not); and the only way
to put it back, `forceMount`, serves the tail with **no `hidden`**, i.e. visibly OPEN until hydration
hides it. Its trigger is a `<button>`, and the same spec's `:202` asserts the bar's served HTML
carries no `<button` at all.

**The native answer: what a `<details>`/`<summary>`/`<div>` family would draw.** Measured in the same
worktree (`probe-out.txt`, `probe-out2.txt`): a part with no directive and no hooks renders `<details
open="">` from a plain `open` prop and keeps a closed tail's anchors in the markup (`renderToStaticMarkup`,
both shapes), so it passes all three conditions by construction. The question is what it DRAWS:

- **The two `<details>` share nothing** (`flex flex-col gap-1` against a bordered opaque panel), and
  only one site has a content wrapper at all.
- **The two summaries share SIX tokens, not two** - `min-h-11 cursor-pointer px-3 py-3
text-text-secondary hover:text-text` (the composition's "`min-h-11 cursor-pointer` and nothing
  else" is wrong, class B, corrected here) - and those six are not a disclosure treatment. They are
  the product's QUIET-CONTROL pair: 12 single-line class strings in 10 files carry the 44px floor
  plus `text-text-secondary` plus `hover:text-text` (`git grep -E 'min-h-(11|hit)'` over
  `apps/web/src/**/*.tsx` less tests, filtered for both inks; list at
  `$BATCH_SCRATCH/s2/probe/quiet-control-lines.txt`). Two are the summaries; the other ten are
  four `Link`s, four `button`s and two named class constants (`FollowButton.tsx:118`,
  `Door.tsx:20`), each read - FilterBar's own Clear link `:197` among them, while its `Chip`
  `:82-83` wears the same pair split across two `cn` arguments. Each summary is drawn to match its NEIGHBOURS, and the other FIVE
  tokens on each (a chip's `w-fit rounded-md text-sm transition-colors` against the house micro-label's
  `font-mono text-xs uppercase tracking-label`) disagree.
- **The library's own disclosure is drawn differently again.** `AccordionTrigger` is `flex … w-full
justify-between text-sm font-semibold text-foreground hover:text-primary-ink`, NO marker (it is
  `flex`), and the house ring. A native family would be a second disclosure idiom beside `Accordion`
  with a second look, or the same look imposed on two sites whose drawing is a product decision
  (MOBILE-3, quoted in row 350: the native marker kept, "replacing it is a design call").

**The one thing a family could REFUSE, and why this library cannot.** Both files name one hazard in
their own comments: a `display` on the `<summary>` silently drops the marker. A class string cannot
refuse it and a part might - so it was measured:

```
cn("list-item", "flex")        -> "flex"             this package's own cn: the marker's display is DISCARDED
cn("list-item", "grid")        -> "grid"
cn("!list-item", "flex")       -> "!list-item flex"  kept both; .\!list-item emits display: list-item !important
compiled order, RAW sheet:    .block 7398 < .flex 7433 < .grid 7466 < .inline-flex 7571 < .list-item 7618
```

So a `CollapsibleTrigger` carrying `list-item` would GUARD the marker under thepile's plain-join `cn`
(`list-item` is emitted after `block`, `flex`, `grid` and `inline-flex`, the displays a layout reaches
for, so it wins over those - though NOT over `table` or `table-cell`, which come after it, layer 1
LOW-6) and would silently STRIP it
under the `cn` this registry ships (tailwind-merge puts both in one group and keeps the last) - one
part, opposite behaviour, decided by which `utils.ts` the consumer has. Only `!list-item` holds in
both, and an `!important` display in a part forbids the product the one call MOBILE-3 reserved for
it. And the marker does not need a part to keep it: Tailwind's preflight in this very sheet declares
`summary { display: list-item; }` (compiled line 112-113), so every summary keeps its triangle until
somebody writes a display on it; `ScoreBlock`'s explicit `list-item` is the plain-join guard above,
already in place, and `FilterBar` rests on preflight and says so.

**Two smaller things the measurement found.** The 44px floor sweep does not see a `<summary>`
(`tailwind-compile.test.tsx:215`, `'button, a[href], input, select, textarea, [role="button"]'`), so
a shipped trigger would have needed that selector widened to be guarded at all. And **LogForm's
reason is false against its own test runner**: a click on a `<summary>` toggles `open` in thepile's
jsdom **29.1.1** and in this repository's **30.0.1** alike (`probe/jsdom-summary.cjs`, run against
each installed copy: `{"before":false,"afterNative":true,"afterDispatched":false}` for both, the
second click closing it again; the 29.1.1 run is this stream's alone - layer 1's brief forbade it to
execute anything under thepile, and it reproduced the 30.0.1 half), and `user-event` clicks toggle it too, though its Enter and Space do
not (`probe-out2.txt`). It changes nothing here - `Section` is a stateful client disclosure either
way - and it is thepile's comment, recorded for the reconciler rather than edited.

**The answer.** The sites already draw the treatment, the treatment they share is the product's
quiet-control pair rather than a disclosure's, and the one refusal a family could make is one this
registry's own `cn` would silently undo: _a part with nothing to draw is a rename_ (the Select
answer), and _a guard the consumer's `cn` can invert is not a guard_. Nothing ships for item 1.
**The reconciler corrects three cells**: `:350`'s and `:353`'s `Collapsible` phrases (the native
`<details>` stays; no family ships, this section), and `:393`'s "Collapsible for SpoilerShield" with
its why cell ("the same mechanism with the state handled" is false against the file: a one-way
reveal, not a disclosure). If the product ever decides to draw its own marker, **this is the row
that says so**, and it arrives as a product decision first.

### 2. The `Textarea` measurement, and what shipped

**A `Textarea` family ships**: one part, `Textarea`, and its string, `textareaClass`. The audit's
column names two rows (`awk -F'|' '$4 ~ /Textarea/ {print NR}'` → `:393` CommentForm, `:399`
ProfileEditForm); the tree has SIX `<textarea>` sites (`git grep -n '<textarea' -- 'apps/web/src/**/*.tsx'`
at `d67eab8f`, less `ui/form.tsx:30`, a comment), every one read, all six in `"use client"` files:

| site                                 | class string                                                                                                                                                                                                       | rows | vertical pad |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- | ------------ |
| `lists/ListForm.tsx:77-84`           | `` `${inputClass} py-2` `` (`:83`)                                                                                                                                                                                 | 3    | `py-2`       |
| `play/PlayForm.tsx:168-175`          | `` `${inputClass} py-2` `` (`:174`)                                                                                                                                                                                | 3    | `py-2`       |
| `profile/ProfileEditForm.tsx:80-88`  | `` `${inputClass} min-h-[88px] py-2` `` (`:87`)                                                                                                                                                                    | 3    | `py-2`       |
| `log/LogForm.tsx:656-669` (review)   | `cn(inputClass, "mt-1 min-h-32 py-2")` (`:668`)                                                                                                                                                                    | 5    | `py-2`       |
| `log/LogForm.tsx:909-918` (notes)    | `cn(inputClass, "mt-1 py-2")` (`:917`)                                                                                                                                                                             | 2    | `py-2`       |
| `comments/CommentForm.tsx:70-84`     | its own: `min-h-[88px] w-full rounded-md border-2 border-line bg-surface p-3 text-base text-text placeholder:text-text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2` (`:83`) | 3    | `p-3`        |
| this package, `form.stories.tsx:179` | raw `<textarea className="min-h-hit w-full rounded-md border-2 border-border bg-surface p-3 text-base …">` in the Form family's `Textarea` story                                                                   | 3    | `p-3`        |

thepile's `inputClass` (`components/ui/form-styles.ts:35-36`) is byte-identical to this package's
`input.tsx:5-6` (`diff` of the two string lines, leading indent stripped: identical), and
`form-styles.test.ts` pins it to the vendored copy, so five of six sites draw **this package's
field** plus a pad they each add by hand.

**The measurement that makes it a part and not the Select answer again.** On a `<select>`,
`inputClass` is COMPLETE: the control centres its one line itself, so a `NativeSelect` would have
been `Input` with another tag. On a `<textarea>` it is not. Read out of the compiled sheet
(`probe-out.txt`):

```
inputClass tokens, padding-block declared:   []
inputClass tokens, padding-top declared:     []
inputClass tokens, padding-inline declared:  ["calc(var(--spacing) * 3)"]
preflight: *, ::after, ::before, ::backdrop, ::file-selector-button { … margin: 0; padding: 0; … }
```

So the field string alone draws a textarea whose first line is FLUSH against the top border, and
every site in both repositories pays for that by hand, in two values: `py-2` five times, `p-3` twice
(CommentForm and this package's own story - the one a consumer copies). A part owns that pad once.
That is something to draw, which is the line the Select answer drew ("a part with nothing to draw is
a rename").

**Which pad, measured rather than voted.** An `Input` centres its line in the `min-h-hit` box, so its
text sits `(44 - 2 * 2 - 16 * 1.55) / 2` = **7.6px** under the top border (`--hit-min: 44px`,
`--text-base: 1rem` and `--text-base--line-height: 1.55` from the emitted `tokens.css`, and the 2px
of `border-2`, whose compiled rule declares a LITERAL `border-width: 2px` rather than the
`--border-width` token - layer 1 LOW-8; the test reads the declared value, so it follows whichever). `py-2` is 8px, 0.4px off, the spacing-grid step nearest it; the story's `p-3` is 12px,
4.4px off. So `py-2` - the five sites' value - is also the one that starts a textarea's first line
where the input above it starts its text, and the part takes it; the story's `p-3` was the outlier,
and moves (below).

**Three things measured and NOT drawn, because the platform or the sheet already does them:**

- **Resize.** Preflight declares `textarea { resize: vertical; }` (compiled line 156-157), so a
  `w-full` field already cannot be dragged wider than its column. No utility owed.
- **The floor.** `min-h-hit` rides in from `inputClass`, and the 44px sweep's selector already names
  `textarea` (`tailwind-compile.test.tsx:215`). With the pad, even `rows={1}` is 44.8px.
- **A height.** `rows` decides it. ⚠️ And a taller `min-h-*` in `className` is a TRAP for a plain-join
  consumer: this package's `cn` merges a caller's `min-h-32` over `min-h-hit` (measured:
  `cn(textareaClass, "min-h-32")` keeps `min-h-32` and drops `min-h-hit`, `probe-out6.txt`), but the compiled sheet
  emits `.min-h-11` 8868 < `.min-h-32` 8929 < `.min-h-[88px]` 9036 < `.min-h-hit` 9082
  (`probe-out5.txt`), so under a join the field's 44px floor WINS and the caller's floor is dead. The
  part's docblock says "prefer `rows`" for exactly this. No `field-sizing: content` either: no site
  auto-grows, and that is a behaviour the product has not taken.

**The one site that must NOT take the part yet: CommentForm, and why it is a measurement.** Its
departure is not only the pad and the pre-a4 alias names (`border-line`, `text-text`,
`placeholder:text-text-muted`): it is the ONE textarea whose keyboard focus keeps an OUTLINE -
thepile's shared ring (`app/globals.css:602-606`, `outline: 2px solid var(--accent)`, `summary` and
`textarea` both in its selector) plus its own restatement - where `inputClass` kills the outline with
`focus:outline-none` and leaves a border colour, which is **Input's open forced-colors [V]** (this
file, "`input.tsx:6` and `sheet.tsx:67`", observed on thepile's `/login` in DL16 layer 2's HIGH-1).
And the outline cannot be kept by passing CommentForm's classes to the part, in either `cn`:

```
.focus\:outline-none:focus          { --tw-outline-style: none; outline-style: none }   emitted at 25871
.focus-visible\:outline:focus-visible { outline-style: var(--tw-outline-style); outline-width: 1px }  26200
cn(inputClass, "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2")
  -> "… focus:border-primary focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
```

On a keyboard focus both selectors match, so the `var()` the outline reads is the `none` the other
rule set on the same element (read from the sheet; the paint is not observed here); and this
package's `cn` drops `focus-visible:outline` outright. So moving CommentForm onto `Textarea` today is
a forced-colors regression for the one field that does not have the defect. It waits for Input's
[V], and when that is taken in `input.tsx`, `Textarea` inherits the fix with no edit of its own -
which is why `textareaClass` is BUILT on `inputClass` rather than copied from it.

**What shipped.**

- `packages/ui/src/textarea.tsx`: `textareaClass` = `` `${inputClass} py-2` ``, importing
  `inputClass` from `./input` (the `form.tsx` → `./label` shape), and `Textarea`, a
  `<textarea data-slot="textarea">` over `cn(textareaClass, className)` with every prop spread. No
  directive and no hook, so a Server Component can render it (`client-boundary.test.ts` walks it and
  agrees); no `asChild`, because a textarea's element IS its semantics (`Input` has none either).
- `packages/ui/stories/textarea.stories.tsx`: `Default`, whose play types two lines through Enter and
  reads `"first line\nsecond line"` back - the one behaviour that makes it not an `Input`.
- `packages/ui/stories/form.stories.tsx`: the Form family's `Textarea` story composes the part
  (imported as `TextareaField`, because that file already exports a story named `Textarea`), so the
  story a consumer copies now draws `px-3 py-2` where it drew `p-3`. No consumer renders that story.
- `registry.json`: the `textarea` item, `target` `components/ui/textarea.tsx`, `registryDependencies`
  `@marquee/utils` and `@marquee/input` (the import is real, and a consumer who adds `textarea` gets
  the `input` copy it reads). `packages/ui/r/textarea.json` and `r/registry.json` rebuilt and
  committed.

### The guards, and the runs that reddened them

`test/textarea-drawing.test.tsx`, FIVE arms as they ship (four at `341f9e9`; layer 1 rewrote arm 2
and added arm 5, see its section), every value read off the compiled sheet from a RENDERED story or
the part's own export: (1) anchors - both fields render, their class lists DIFFER, `declaredValues`
answers a positive read, and the input declares no vertical padding (the premise of the arithmetic);
(2) the textarea declares EXACTLY the field's declarations, each keyed by the state it applies under
(`& { … }`, `&:focus { … }`, `&::placeholder { … }`, from the compiled rules' own selectors), in BOTH
directions, with `padding-block` the only extra property; (3) the rendered pad is the grid step
nearest the input's inset, derived from `min-height`, `border-width`, `font-size`, the `line-height`
fallback and `--spacing`; (4) the pad is in `textareaClass` UNMERGED, exactly once, with no
`padding` / `padding-top` / `padding-bottom` beside it - the plain-join consumer's string, because
this package's own `cn` would merge a leftover away before the rendered arms could see it (the
d-command block's lesson); (5) `data-slot="textarea"`, and a caller's `className` lands LAST with the
field's string intact before it. Beside it: the Form family's `Textarea` play pins its control's
classes to `textareaClass`, and `registry.test.ts` derives every item's `registryDependencies` from
its sources' own imports.

**Red first, in the working tree, before the pad existed** (`textareaClass = inputClass`,
`$BATCH_SCRATCH/s2/red-textarea.log`): `Tests 2 failed | 2 passed (4)`, and each red names the pad:

| arm                                                                  | red message                                                           |
| -------------------------------------------------------------------- | --------------------------------------------------------------------- |
| "starts its first line where an Input puts its text…"                | `AssertionError: the rendered pad: expected [] to deeply equal [ 8 ]` |
| "carries that pad exactly once in the string a plain-join consumer…" | `AssertionError: expected [] to have a length of 1 but got +0`        |

The derived `8` in the first message is the arithmetic above coming out of the sheet, not a typed
number. Then `` `${inputClass} py-2` `` → `Tests 4 passed (4)` (`green-textarea.log`).

**Then every guard the part stands on, reddened in a DETACHED worktree of the committed head**
(`../marquee-ui-s2-mut` at `341f9e9`, `pnpm install --frozen-lockfile` + the tokens build; each
mutation confirmed LANDED by its own diff before the run, and `git checkout -- .` after; logs
`$BATCH_SCRATCH/s2/mut-M*.log`, the driver `mutate.sh` beside them):

| id  | mutation                                                                | run over                                | red / GREEN                    | the assertion that reddened                                                                                                                                                                                                                                |
| --- | ----------------------------------------------------------------------- | --------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1  | `textareaClass = inputClass` (the pad gone)                             | `textarea-drawing`                      | **red**, 2 failed / 2 passed   | `the rendered pad: expected [] to deeply equal [ 8 ]`; `expected [] to have a length of 1 but got +0`                                                                                                                                                      |
| M2  | `` `${inputClass} p-3 py-2` `` (the story's pad left beside the part's) | `textarea-drawing`                      | **red**, 3 failed / 1 passed   | `the textarea's padding-inline is not the field's: expected [] to deeply equal [ 'calc(var(--spacing) * 3)' ]` (this package's `cn` merged `px-3` away); `a second padding: expected [ 'calc(var(--spacing) * 3)' ] to deeply equal []` (the UNMERGED arm) |
| M3  | `` `${inputClass} py-3` `` (a pad, the wrong one)                       | `textarea-drawing`                      | **red**, 1 failed / 3 passed   | `the rendered pad: expected [ 12 ] to deeply equal [ 8 ]`                                                                                                                                                                                                  |
| M4  | `border-2` → `border` inside the textarea's string only                 | `textarea-drawing`                      | **red**, 1 failed / 3 passed   | `the textarea's border-width is not the field's: expected [ '1px' ] to deeply equal [ '2px' ]`                                                                                                                                                             |
| M5  | `min-h-hit` dropped from the textarea's string only                     | `textarea-drawing` + `tailwind-compile` | **red**, 2 failed / 42 passed  | the floor sweep: `textarea[data-slot=form-control] "" -> 0px` and `textarea[data-slot=textarea] "" -> 0px` (both stories, the Form one through `FormControl`); `the textarea's min-height is not the field's`                                              |
| M6  | a comment added to `textarea.tsx`, `r/` NOT rebuilt                     | `registry`                              | **red**, 1 failed / 13 passed  | `textarea: packages/ui/src/textarea.tsx is stale`                                                                                                                                                                                                          |
| M7  | the barrel's `textarea` line deleted                                    | `entry-point`                           | **red**, 1 failed / 3 passed   | `"packages/ui/src/textarea.tsx: textareaClass"`, `"packages/ui/src/textarea.tsx: Textarea"` missing                                                                                                                                                        |
| M8  | `textarea` deleted from `STORY_SUITES`                                  | `stories` + `tailwind-compile`          | **red**, 2 failed / 162 passed | the suite map against the files on disk (19 keys, 20 names); `stories whose play was composed: … to have a length of 75 but got 74`                                                                                                                        |

M3 reddens arm 3 alone, by design: arm 4 asks that the pad be there ONCE and agree with the rendered
one, and a wrong single pad does both - the VALUE is arm 3's. Nothing here stayed green; the collapse
pass over the new files is layer 1's.

### The pipeline, end to end

AGENTS.md "Adding a part", all nine steps, each re-read at the base rather than taken from the
brief's line numbers (they held: `registry.test.ts:60` and `:151`, `README.md:19,24`,
`packages/ui/package.json:4`, `AGENTS.md:51`):

1. `packages/ui/src/textarea.tsx` - no `cva` (there is no visual axis) and no `asChild` (above).
2. `packages/ui/stories/textarea.stories.tsx`, one story (`Default`), with a play.
3. `packages/tokens/test/helpers/source-files.ts`: both paths, in order.
4. `packages/ui/src/index.ts`: `Textarea` and `textareaClass` (`entry-point.test.ts` requires every
   `export const` / `export function` of a part file; M7 above is its red).
5. `story-suites.ts` gains `textarea`; `stories.test.tsx` `DECLARED_STORIES` 103 → **104**,
   `DECLARED_PLAYS` 74 → **75**, the family count 19 → **20** (the arm's title and its
   `toHaveLength`).
6. `registry.test.ts`: the item list gains `textarea` and its title says twenty; the
   `registryDependencies` count 20 → **22** (the item names two); the compared-files count 21 → **22**.
7. `registry.json` (the item, explicit `target`), then `pnpm build:registry`, which wrote
   `r/textarea.json` and rewrote `r/registry.json`; both committed. (Formatted BEFORE the build:
   `r/registry.json` is asserted byte-equal to the root file.)
8. "nineteen" → "twenty" in `README.md` (`:19`, and `:24`, whose list gains `Textarea`),
   `packages/ui/package.json:4`'s description and `AGENTS.md:51` - and in
   `packages/ui/test/fidelity.test.tsx:36`'s docblock ("Eight of the twenty part families were lifted
   out of a real product"), a prose count the brief's list did not name but `git grep -i nineteen`
   does; comment-only, and `Textarea` is not one of the eight (it was not lifted from a thepile
   `components/ui` file, so `fidelity.test.tsx` has nothing to pin for it: its field IS `Input`'s,
   which that file already pins).
9. `pnpm verify` - below.

The version line stays `0.1.3`. `Textarea` rides the 0.1.4 bump.

### Decisions

1. **No `Collapsible` family ships**, native or Radix. [V] Radix serves a closed tail without its
   anchors and a `<button>` trigger (measured); a native family would draw only the product's
   quiet-control pair, and the one refusal it could make is inverted by this registry's own `cn`.
2. **`Textarea` ships.** [V] `inputClass` is complete on a `<select>` and INCOMPLETE on a
   `<textarea>` (no vertical pad; preflight zeroes it), so every site hand-writes the missing half in
   two values; the part owns it once.
3. **The pad is `py-2`, not the story's `p-3`.** [V] Five of six product sites, and the spacing-grid
   step nearest the 7.6px at which an `Input` centres its text; `p-3` is 4.4px off it. This moves the
   Form story's drawn pad by 4px on each block edge (no consumer renders that story).
4. **`textareaClass` is built ON `inputClass`**, not a copy, with `@marquee/input` as a registry
   dependency. One definition of the field: Input's open forced-colors [V] is decided in `input.tsx`
   for both parts, and nothing here pre-empts it.
5. **No `field-sizing`, no `resize`, no height.** Preflight already makes a textarea
   `resize: vertical`; no site auto-grows; `rows` sets the height, and the docblock warns that a
   plain-join caller's `min-h-*` loses to `min-h-hit` by emitted order (measured).
6. **CommentForm is a HOLD, not a consumer**, until Input's ring [V] is taken - the measurement is §2.
7. **`fidelity.test.tsx:36`'s prose count moved** with the others. A declared fence note: the brief
   names the counters "where the package describes itself", and a docblock count is one; no assertion
   in that file moved.
8. **`registry.test.ts` gains an arm, not only counters**: every item's `registryDependencies` is
   DERIVED from its sources' imports and compared per item (layer 1, MED-3). A declared fence
   widening - the fence names that file's counters - taken because the count alone let a consumer
   install a `textarea` copy whose `./input` resolves to nothing, and it covers `form` → `label`, the
   pre-existing instance, at no extra cost.
9. **`focus-outline.test.tsx`'s `focus:` inventory names `textarea.tsx`** (layer 1, LOW-10), a
   docblock paragraph and no assertion: the sweep walks literals and `Textarea` draws Input's ring by
   interpolation, so Input's [V], taken anywhere but inside `inputClass`, would miss it. A declared
   comment-only fence widening.
10. **Input's own `className` merge stays unguarded** (layer 1's X1, GREEN at 576/576 with
    `cn(inputClass)` in `Input`). Pre-existing, in a part file outside this fence; `Textarea`'s arm 5 is
    the shape an `Input` arm would take. Raised for the next library stream, not fixed.

### thepile inputs

- **Arrival.** `Textarea` reaches thepile only through a LIB-VENDOR-0.1.4 slice: 0.1.3 is vendored
  (`vendor/marquee-ui/`, byte-pinned by `scripts/marquee-drift.test.ts`) and 0.1.4 is unreleased. The
  bump carries one NEW item (`textarea`, and `r/registry.json` changes with it), so thepile's drift
  test reddens at the bump ITSELF, before any copy is installed (⚠️ corrected by the reconciler, DL19
  layer 2 LOW-3; the first edition said it gains an entry only once the copy is installed): its
  exact-complement arm (`scripts/marquee-drift.test.ts:156-167` at thepile `7cc04ecd`, seven
  non-consumed names) reads the shipped index and sees an eighth, and its self-count arm's `NUMBER`
  map has no entry for 21 and its regex cannot read a hyphenated count word (a replica of both
  expressions against this head's `r/registry.json`: complement `false`, shipped 21). So
  LIB-VENDOR-0.1.4 edits the arm and its lists in ONE commit with the bump, then installs the copy
  (`shadcn add` from the vendored tarball's `r/textarea.json`, into `components/ui/textarea.tsx`);
  the copy imports `./input`, which thepile already has. Nothing in this slice predicts a screenshot.
- **The five sites that can take it**, each `"use client"`, each `inputClass` plus a pad the part
  now carries: `lists/ListForm.tsx:83`, `play/PlayForm.tsx:174`, `profile/ProfileEditForm.tsx:87`
  (plus `min-h-[88px]`), `log/LogForm.tsx:668` (plus `mt-1 min-h-32`) and `:917` (plus `mt-1`).
- **⚠️ Two of those extras are already dead, and the part does not change that.** Under thepile's
  plain-join `cn`, `min-h-32` (`LogForm.tsx:668`) and `min-h-[88px]` (`ProfileEditForm.tsx:87`) sit
  beside `inputClass`'s `min-h-hit` TODAY, and in THIS package's sheet `min-h-hit` is emitted after
  both (8929, 9036 < 9082), so if thepile's sheet orders them the same way the field's 44px wins at
  both sites. It is invisible, because `rows` already exceeds both floors (5 rows at this package's
  1.55 leading: 144px against 128; 3 rows: 94.4px against 88). **Unmeasured on thepile's built page**:
  the consumption slice reads the resolved `min-height` at the two sites and decides whether the
  extras go (they are dead) or become `rows`.
- **CommentForm (`comments/CommentForm.tsx:83`) HOLDS** until Input's forced-colors [V] is taken (§2):
  it is the product's one textarea whose keyboard focus keeps an outline, and neither `cn` can keep it
  once the field string's `focus:outline-none` is on the element.
- **The instruments a consumption slice re-runs**, read at `d67eab8f`: `CommentForm.test.tsx:154-155`
  (`tagName` TEXTAREA, `id` `comment-body` - the part spreads both), `LogModal.test.tsx:1189` (the
  dialog's `input, select, textarea` walk) and `:1240` (`maxlength` 2000 on "private notes"),
  `components/ui/form-styles.test.ts` (pins `inputClass` to the copy; a `textareaClass` literal there
  would be that module's choice), `e2e/log-modal.spec.ts:431` (the review field `toBeInViewport`),
  `e2e/profile-edit.spec.ts:39` (`getByLabel("Bio")`), `e2e/reflow.spec.ts:123` (the control
  selector names `textarea`), and every `getByLabel("Your review")` (`account`, `admin`, `comments`,
  `home`, `log-modal`, `rate-limit`, `review-likes`, `reviews` specs), which resolve through the
  site's own `<label htmlFor>`, not through the part.
- **For the reconciler, from item 1**: the three `Collapsible` cells (`:350`, `:353`, `:393`, §1);
  and `log/LogForm.tsx:183-184`'s comment ("jsdom does not implement summary toggling") is false
  against thepile's own jsdom 29.1.1, measured - a thepile comment, reported rather than edited.
- **For the reconciler, from item 2**: `:393`'s "Textarea … for CommentForm" becomes the HOLD above,
  and `:399`'s "Textarea" for ProfileEditForm names the part at the 0.1.4 bump.

### Consumers

**Run 1, before any code** (`$BATCH_SCRATCH/s2/scan-run1.txt`): the scan script against an EMPTY
diff, zero names by construction, recorded as what it is. The enumeration that did the work was by
hand over the surface this slice was going to touch (`scan-run1-byhand.txt`): `inputClass` is read
by `input.tsx`, `index.ts`, `fidelity.test.tsx:19,342`, `tailwind-compile.test.tsx:12,543` and the
fixture extractor (`checkbox.tsx:96` and `radio-group.tsx:142` declare their OWN module-local
`inputClass`, a name collision, not a reader); `form.stories.tsx` is named by `source-files.ts` and
`story-suites.ts`; the Form story's raw textarea string is pinned nowhere but itself; no file in
`packages/` held a `<summary>`, a `<details>` or `list-item`.

**Run 2, at the commit point** (diff `f28d56e...341f9e9`, `scan-run2.txt` and `scan-run2-byhand.txt`):

- **Scan 1, exported symbols: three names.** `Textarea` and `textareaClass` are NEW; their readers are
  `index.ts` (compulsory), the two stories, the drawing test and `registry.json` - and, because the
  script's greps exclude `packages/ui/r/**`, three it did not print (layer 1, LOW-9): `README.md`'s
  prose list and the built `r/registry.json` and `r/textarea.json`. `Default` is a new STORY export;
  its other 18 hits are the other families' own `Default` stories, the four drawing and compile tests
  that compose them, one comment word in `button.tsx:84` and that word's built copy in
  `r/button.json` - name collisions, not consumers. The textarea one is consumed through
  `story-suites.ts`.
- **Scan 3, files naming a touched path:** eleven, all read: `packages/tokens/package.json` (its own `./src/index.ts` export,
  a basename collision) and `packages/ui/package.json` (its `index.ts` export and its description), `source-files.ts`, `index.ts`,
  the two story files, `client-boundary.test.ts` (matched on `package.json`, which it reads for each
  dependency; it also walks every part file on disk, so it saw `textarea.tsx` and passed: no hook,
  no directive owed), `entry-point.test.ts`, `registry.test.ts`,
  `textarea-drawing.test.tsx`, `registry.json`. ⚠️ The scan's relative-import arm spells `./<stem>"`
  and this package's story modules are imported as `…/<stem>.js"` from another directory, so it MISSES
  `story-suites.ts`; the by-hand run names it and its three readers (`stories.test.tsx`,
  `tailwind-compile.test.tsx`, itself), all of which moved or were run above. ⚠️ The same `.js`
  shape hid `source-files.ts`'s THREE readers from this section (layer 1, LOW-9):
  `packages/tokens/test/source-coverage.test.ts`, `brand-guard.test.ts` (which now scans
  `textarea.tsx` and `textarea.stories.tsx` for brand strings) and `literal-guard.test.ts` (which
  scans `textarea.tsx` for literals). All three passed at every head here, and layer 1's C4/C5 show
  each reads the lists.
- **Scan 4, role/aria strings: none in the diff's source.** The Form story's raw `<textarea>` became
  the part's `<textarea>`: implicit role `textbox` before and after, and at `341f9e9` nothing in
  `packages/` resolved a `textbox` by role. The diff DID add `data-slot="textarea"`, a styling and
  test hook the role/aria regex does not match, and at `341f9e9` it had no reader (layer 1, LOW-1);
  arm 5 now reads it, and the same arm is the one `getByRole("textbox", { name: "Notes" })` in the
  package.
- **Scan 5, class strings.** The part's one new class is `py-2` inside a template literal; it is pinned
  by no test or JSON as a textarea's (its three hits are the toast's upstream fixture string and two
  prose lines of `tailwind-compile.test.tsx`). The REMOVED Form-story string is pinned nowhere.
- **CROSS: 0** (no sibling stream touches this repository this batch). **UNOWNED: 0.** **NEW between
  the two runs: 3** - `Textarea`, `textareaClass` and the `Default` story, all this stream's own.

**Run 3, after layer 1's fixes** (diff `f28d56e...2780335`, `scan-run3.txt`, `diff`ed against run 2):
the only moves are this stream's own - `focus-outline.test.tsx` joins the changed files (its
docblock), `form.stories.tsx` joins `textareaClass`'s readers (its play's pin), and scan 4 and 5 pick
up arm 5's `aria-label="Notes"` and `className="probe-caller"`, both test props. No new exported
symbol, no new CROSS, nothing UNOWNED.

## Layer 1 (reviewer r6, detached worktree of ec0fe45863f2873f495aecc5b281c48623986f11, marquee-ui, no database)

**14 findings: 0 HIGH, 4 MED, 10 LOW**, over **42 mutations**, of which **17 stayed GREEN** where
they aimed: eleven kept the whole suite (or, for I3, the whole file) green - P4, P5, P16, P12, P6,
P8, X1 (a parity probe on `Input`), I3, S1, S2, C2 - three kept the arms under test green while
another file reddened (P15, I3b, I4), S3 kept its play green, and I7 and I8 are green by design. Its full report is
`$BATCH_SCRATCH/r6/report.md`. Its baseline on the untouched committed head was `pnpm test`
**33 files / 576 tests** (exit 0), `pnpm lint` `All matched files use Prettier code style!`,
`pnpm typecheck` `packages/tokens typecheck: Done` + `packages/ui typecheck: Done`, and
`pnpm build:registry` followed by `git status --short` **EMPTY**. It rebuilt the registry after every
source mutation, because without it the "is stale" byte check reddens every source edit for the
wrong reason and hides a GREEN (its first pass, superseded, read P4-P6 red exactly that way). The
table is its own, verbatim:

| file                                         | test                                                                     | mutation applied                                                                            | red / GREEN                                                                                                                                                                                                                                                                   | what it asserts now                                                                                                                                                                                                                           |
| -------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| src/textarea.tsx                             | textarea-drawing arm 2 "declares every property Input's field declares…" | P1: ` focus:outline-none` dropped from the textarea's string only                           | red (575/1)                                                                                                                                                                                                                                                                   | `the textarea's --tw-outline-style is not the field's: expected [] to deeply equal [ 'none' ]` (the predicted red, and it names the property)                                                                                                 |
| src/textarea.tsx                             | arm 2                                                                    | P2: ` focus:border-primary` dropped                                                         | red                                                                                                                                                                                                                                                                           | `the textarea's border-color is not the field's: expected [ 'var(--border)' ] to deeply equal [ 'var(--border)', 'var(--primary)' ]`                                                                                                          |
| src/textarea.tsx                             | arm 2                                                                    | P3: `placeholder:text-muted` → `placeholder:text-foreground`                                | red                                                                                                                                                                                                                                                                           | `the textarea's color is not the field's: expected [ 'var(--foreground)', …(1) ] to deeply equal [ 'var(--foreground)', 'var(--muted)' ]`                                                                                                     |
| src/textarea.tsx                             | all 4 arms, whole suite                                                  | P4: rest border and focus border swapped (`border-primary … focus:border-border`)           | **GREEN** (576/576)                                                                                                                                                                                                                                                           | Arm 2 compares a per-property multiset of values. It cannot see WHICH selector or state carries which value, so a field that is primary at rest and grey on focus passes                                                                      |
| src/textarea.tsx                             | all 4 arms, whole suite                                                  | P5: rest ink and placeholder ink swapped (`text-muted … placeholder:text-foreground`)       | **GREEN** (576/576)                                                                                                                                                                                                                                                           | Same state-blindness: the `::placeholder` condition is not observed                                                                                                                                                                           |
| src/textarea.tsx                             | all 4 arms, whole suite                                                  | P16: `focus:border-primary` → `hover:border-primary`                                        | **GREEN** (576/576)                                                                                                                                                                                                                                                           | The "focus declaration" can move to any variant, so the docblock's "both focus declarations" is not asserted                                                                                                                                  |
| src/textarea.tsx                             | textarea-drawing, all 4 arms                                             | P15: `focus:outline-none` → `focus-visible:outline-none`                                    | **GREEN** in textarea-drawing. The suite went red only in `focus-outline.test.tsx` (`expected [ …(6) ] to deeply equal [ …(5) ]`; `a part draws its focus ring with a box-shadow and no outline…`), because a literal `focus-visible:` string entered that file's source walk | Not the red predicted for this arm. Arm 2 is variant-blind here too, and the red that did fire mis-describes the site ("box-shadow and no outline")                                                                                           |
| src/textarea.tsx                             | whole suite                                                              | P6: `data-slot="textarea"` → `data-slot="field"`                                            | **GREEN** (576/576)                                                                                                                                                                                                                                                           | Nothing selects `[data-slot="textarea"]`                                                                                                                                                                                                      |
| src/textarea.tsx                             | stories.test `textarea/Default`, `form/Textarea`, the play counter       | P7: `{...props}` not spread                                                                 | red (573/3)                                                                                                                                                                                                                                                                   | `Unable to find an element with the placeholder text of: Anything worth remembering`; `Found a label with the text of: Add a comment, however no form control was found associated to that label`. The drawing arms stayed green, as expected |
| src/textarea.tsx                             | whole suite                                                              | P8: `className` not merged (`cn(textareaClass)`)                                            | **GREEN** (576/576)                                                                                                                                                                                                                                                           | No test passes a `className` to `Textarea`                                                                                                                                                                                                    |
| src/input.tsx (parity probe)                 | whole suite                                                              | X1: the same on `Input` (`cn(inputClass)`)                                                  | **GREEN** (576/576)                                                                                                                                                                                                                                                           | Pre-existing: `Input`'s className merge is unguarded too                                                                                                                                                                                      |
| src/textarea.tsx                             | arms 3, 4                                                                | P9: `pt-2 pb-2` in place of `py-2`                                                          | red (574/2)                                                                                                                                                                                                                                                                   | `the rendered pad: expected [] to deeply equal [ 8 ]`; `expected [] to have a length of 1 but got +0`. The drawing is identical, so these arms pin the `padding-block` SPELLING (over-specific, not vacuous)                                  |
| src/textarea.tsx                             | arms 3, 4                                                                | P10: `pt-2` only                                                                            | red                                                                                                                                                                                                                                                                           | Same two messages. The second one does not name the property                                                                                                                                                                                  |
| src/textarea.tsx                             | arm 2                                                                    | P11: `leading-6` added to the textarea                                                      | red                                                                                                                                                                                                                                                                           | `the textarea's line-height is not the field's: expected [ 'calc(var(--spacing) * 6)', …(1) ] to deeply equal [ Array(1) ]`                                                                                                                   |
| src/textarea.tsx                             | all 4 arms, whole suite                                                  | P12: `font-mono resize-none` added to the textarea                                          | **GREEN** (576/576)                                                                                                                                                                                                                                                           | Arm 2 is ONE-directional: Input's properties must be a subset of the textarea's. A property only the textarea declares (font-family, resize) is invisible                                                                                     |
| src/textarea.tsx                             | all 4 arms + both plays                                                  | P13: `<textarea` → `<input`                                                                 | red (569/7)                                                                                                                                                                                                                                                                   | `expected one textarea, the story rendered 0` (4 arms); `expected 'INPUT' to be 'TEXTAREA'` (both plays)                                                                                                                                      |
| src/textarea.tsx                             | arms 3, 4                                                                | P14: the component renders `cn(inputClass, className)` while the export keeps the pad       | red                                                                                                                                                                                                                                                                           | `the rendered pad: expected [] to deeply equal [ 8 ]`; `the handed pad: expected [ 8 ] to deeply equal []`                                                                                                                                    |
| src/textarea.tsx                             | arm 4 only                                                               | P17: `${inputClass} pt-3 py-2`. The package's `cn` merges `pt-3` away on the element        | red, arm 4 alone (575/1)                                                                                                                                                                                                                                                      | `a second padding-top: expected [ 'calc(var(--spacing) * 3)' ] to deeply equal []`. Arms 1-3 stay GREEN by design: the unmerged read is the only thing that sees it                                                                           |
| src/textarea.tsx                             | stories.test `textarea/Default`                                          | P18: Enter keydown `preventDefault`ed                                                       | red                                                                                                                                                                                                                                                                           | `expect(element).toHaveValue(first line…` (the play is live on its one behaviour)                                                                                                                                                             |
| src/textarea.tsx                             | client-boundary.test.ts                                                  | P19: a `useState` with no directive                                                         | red                                                                                                                                                                                                                                                                           | `opens every hook-importing file with "use client": expected [ Array(1) ] to deeply equal []`                                                                                                                                                 |
| test/textarea-drawing.test.tsx               | all 4 arms                                                               | I1: `drawn()` returns `[]`                                                                  | red, 4/4                                                                                                                                                                                                                                                                      | `expected 0 to be greater than 5`; `expected 0 to be greater than 8`; `expected [ null, null, null, 4 ] to not include null`; `the handed pad: expected [ 8 ] to deeply equal []`                                                             |
| test/textarea-drawing.test.tsx               | arms 1, 2                                                                | I2: `propertiesOf()` returns `[]`                                                           | red, arms 1-2 (arms 3-4 do not use it)                                                                                                                                                                                                                                        | `expected [] to deeply equal ArrayContaining{…}`; `expected 0 to be greater than 8`                                                                                                                                                           |
| test/textarea-drawing.test.tsx               | arm 2                                                                    | I3: arm 2's `textarea` read from `inputs.Default, "input"`                                  | **GREEN** (whole file 4/4)                                                                                                                                                                                                                                                    | Arm 2 compares Input to itself. There is no in-arm anchor that it read a textarea                                                                                                                                                             |
| test/textarea-drawing.test.tsx               | arms 1, 2                                                                | I3b: `drawn(…, "textarea")` returns the INPUT story's classes (global)                      | **GREEN** arms 1, 2; red arms 3, 4                                                                                                                                                                                                                                            | Arm 1's "found both fields rendered" only checks `length > 5`, so it cannot tell a textarea from an input                                                                                                                                     |
| test/helpers/compiled-sheet.ts               | arms 1, 2                                                                | I4: `declaredValues` returns `[]`                                                           | **GREEN** arms 1, 2; red arms 3, 4 (52 red suite-wide)                                                                                                                                                                                                                        | Arm 2 compares `[]` to `[]` for all 13 properties. Arm 1's "a sheet that can answer" anchors `rule()`, not `declaredValues()`, and its padding premise is a negative that a blind reader passes                                               |
| test/textarea-drawing.test.tsx               | arm 3                                                                    | I5: the `lineHeightPx` fallback regex never matches                                         | red                                                                                                                                                                                                                                                                           | `Error: unexpected line-height shape: var(--tw-leading, var(--text-base--line-height))`                                                                                                                                                       |
| test/textarea-drawing.test.tsx               | arm 3                                                                    | I6: `lineHeightPx` returns 0                                                                | red                                                                                                                                                                                                                                                                           | `the rendered pad: expected [ 8 ] to deeply equal [ 20 ]`                                                                                                                                                                                     |
| test/textarea-drawing.test.tsx               | arm 3                                                                    | I7: `lineHeightPx` returns `1.5 × font`                                                     | GREEN                                                                                                                                                                                                                                                                         | Tolerance by design: any leading that puts the inset in [6, 10) px rounds to 8. The arm pins the grid step, not the inset                                                                                                                     |
| test/textarea-drawing.test.tsx               | arm 4                                                                    | I8: `handed` read from the RENDERED list, plus P17                                          | GREEN                                                                                                                                                                                                                                                                         | Confirms the UNMERGED read is what catches P17. The arm is not vacuous                                                                                                                                                                        |
| stories/textarea.stories.tsx                 | stories.test `textarea/Default`                                          | S1: all three `expect`s of the play deleted (`userEvent.type` kept)                         | **GREEN** (576/576)                                                                                                                                                                                                                                                           | The play types and asserts nothing. Plays are counted, their assertions are not                                                                                                                                                               |
| stories/textarea.stories.tsx                 | play counter                                                             | S4: `play` renamed away                                                                     | red                                                                                                                                                                                                                                                                           | `stories whose play was composed: … to have a length of 75 but got 74`                                                                                                                                                                        |
| stories/form.stories.tsx                     | whole suite                                                              | S2: the Form `Textarea` story reverted to the old raw `p-3` `<textarea>`                    | **GREEN** (576/576)                                                                                                                                                                                                                                                           | Nothing pins the Form story to the part. The Form `Default` story has `expect(control).toEqual(inputClass.split(" "))`, and `Textarea` has no equivalent                                                                                      |
| stories/form.stories.tsx                     | stories.test `form/Textarea`                                             | S3: `expect(control.tagName).toBe("TEXTAREA")` deleted                                      | GREEN                                                                                                                                                                                                                                                                         | The remaining expects (describedby, `for`) do not depend on the element being a textarea                                                                                                                                                      |
| test/helpers/story-suites.ts                 | stories.test                                                             | C1: `textarea` removed from `STORY_SUITES`                                                  | red                                                                                                                                                                                                                                                                           | `expected [ 'accordion', 'alert', …(17) ] to deeply equal [ …(18) ]` + the play counter 74 ≠ 75                                                                                                                                               |
| registry.json (+ r/ rebuilt)                 | registry.test                                                            | C2: textarea's `@marquee/input` → `@marquee/label`                                          | **GREEN** (576/576)                                                                                                                                                                                                                                                           | Only a global COUNT guards the dependency on `input`                                                                                                                                                                                          |
| registry.json (+ r/ rebuilt)                 | registry.test                                                            | C3: `@marquee/input` dropped                                                                | red                                                                                                                                                                                                                                                                           | `expected 21 to be 22`: the count, which does not name the missing dependency                                                                                                                                                                 |
| packages/tokens/test/helpers/source-files.ts | source-coverage, brand-guard, literal-guard                              | C4: `textarea.tsx` removed from `PUBLISHED_SOURCE_FILES`                                    | red                                                                                                                                                                                                                                                                           | `Unexpected: [packages/ui/src/textarea.tsx]` (source-coverage 3 tests, plus brand-guard and literal-guard failing at file level)                                                                                                              |
| packages/tokens/test/helpers/source-files.ts | source-coverage, brand-guard                                             | C5: the story removed from `STORY_FILES`                                                    | red                                                                                                                                                                                                                                                                           | `Unexpected: [packages/ui/stories/textarea.stories.tsx]`                                                                                                                                                                                      |
| src/index.ts                                 | entry-point.test                                                         | C6: the `Textarea, textareaClass` export removed                                            | red                                                                                                                                                                                                                                                                           | `re-exports every value each part file exports: expected [ …(2) ] to deeply equal []`                                                                                                                                                         |
| test/stories.test.tsx                        | stories.test                                                             | C7: `DECLARED_STORIES` 104 → 103                                                            | red                                                                                                                                                                                                                                                                           | `expected [ 'accordion/Single', …(103) ] to have a length of 103 but got 104`                                                                                                                                                                 |
| test/registry.test.ts                        | registry.test                                                            | counters exercised through C2/C3 (and P1-P19 via the "is stale" arm before the rebuild)     | see C2/C3                                                                                                                                                                                                                                                                     | `checked` 22 and `compared` 22 are live, but only as counts                                                                                                                                                                                   |
| test/fidelity.test.tsx                       | n/a                                                                      | not mutated: the diff is a prose count only ("Eight of the twenty"), and no assertion moved | n/a                                                                                                                                                                                                                                                                           | Unchanged                                                                                                                                                                                                                                     |

### What each GREEN row cost, and what changed

Every fix below was re-run against its own mutation in a DETACHED worktree of the fix commit
`2780335` (`../marquee-ui-s2-mut`, the same driver, the registry rebuilt for C2), each mutation's
diff confirmed before the run, `git status --short` empty after (logs `$BATCH_SCRATCH/s2/mut-R-*.log`):

| layer-1 row(s)   | finding       | what changed                                                                                                                                                                                                            | the re-run, at `2780335`                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P4, P5, P16, P15 | MED-1         | arm 2 no longer pools a property's values: it compares `<state> { <property>: <value> }` strings built from each compiled rule's OWN selector (the class written as `&`, enclosing at-rules other than `@layer` kept)   | **red**, 1 failed / 4 passed, each: `a field declaration the textarea lacks, or makes in another state` - P4 names `& { border-color: var(--border) }` and `&:focus { border-color: var(--primary) }`, P5 `& { color: var(--foreground) }` and `&::placeholder { color: var(--muted) }`, P16 `&:focus { border-color: var(--primary) }`, P15 `&:focus { --tw-outline-style: none }` and `&:focus { outline-style: none }` |
| P12              | MED-2         | the same arm runs BOTH ways: what the textarea declares beyond the field must be exactly `["padding-block"]`                                                                                                            | **red**: `what the textarea declares beyond the field: expected [ Array(3) ] to deeply equal [ 'padding-block' ]` - the array is `font-family`, `padding-block`, `resize`                                                                                                                                                                                                                                                 |
| C2               | MED-3         | `registry.test.ts` "declares exactly the registry dependencies its sources import", derived per item from `./<name>` and `@/lib/utils` imports                                                                          | **red**: `textarea: expected [ '@marquee/label', '@marquee/utils' ] to deeply equal [ '@marquee/input', '@marquee/utils' ]`; and the pre-existing instance, `form`'s `@marquee/label` swapped for `@marquee/input`: `form: expected [ '@marquee/input', '@marquee/utils' ] to deeply equal [ '@marquee/label', '@marquee/utils' ]`                                                                                        |
| P8               | MED-4         | arm 5: `<Textarea className="probe-caller">`, the caller's class LAST and the field's string intact before it                                                                                                           | **red**: `the caller's class, last: expected 'py-2' to be 'probe-caller'`                                                                                                                                                                                                                                                                                                                                                 |
| X1               | MED-4 (scope) | NOT fixed: `Input`'s own merge, a part file outside this fence - decision 10                                                                                                                                            | not re-run                                                                                                                                                                                                                                                                                                                                                                                                                |
| P6               | LOW-1         | arm 5 reads `data-slot`                                                                                                                                                                                                 | **red**: `expected 'field' to be 'textarea'`                                                                                                                                                                                                                                                                                                                                                                              |
| S2               | LOW-2         | the Form `Textarea` play pins its control's classes to `textareaClass.split(" ")`                                                                                                                                       | **red**, 2 failed: `expected [ 'min-h-hit', 'w-full', …(10) ] to deeply equal [ 'w-full', 'min-h-hit', …(11) ]` and the executed-plays counter                                                                                                                                                                                                                                                                            |
| S1, S3           | LOW-3         | NOT fixed: a deleted `expect` in a play is invisible to a suite that counts plays, not assertions - `stories.test.tsx:48-65` states it as the package's standing limit. The drawing file does not depend on either play | not re-run                                                                                                                                                                                                                                                                                                                                                                                                                |
| I3, I3b, I4      | LOW-4         | arm 1 asserts the two lists DIFFER and makes a positive `declaredValues` read; arm 2 no longer reads `declaredValues` at all and requires a non-empty extra                                                             | I3 **red** (`what the textarea declares beyond the field: expected [] to deeply equal [ 'padding-block' ]`); I3b **red**, 4 failed, arm 1 first: `the textarea's classes are the input's`; I4 **red**, arm 1: `expected [] to have a length of 1 but got +0`                                                                                                                                                              |
| P9, P10, M1      | LOW-5         | the "exactly once" assertion carries a message                                                                                                                                                                          | I4's run shows it: `padding-block declarations: expected [] to have a length of 1 but got +0`                                                                                                                                                                                                                                                                                                                             |
| (doc)            | LOW-6, 7, 8   | §1: `list-item` wins over `block`/`flex`/`grid`/`inline-flex`, NOT over `table`/`table-cell`; the offsets are the RAW sheet's; §2: the arithmetic's 2px is `border-2`'s literal, not `--border-width`                   | prose; the conclusions they sat under do not move                                                                                                                                                                                                                                                                                                                                                                         |
| (doc)            | LOW-9         | Consumers: README and the `r/` copies under scan 1, `Default`'s 18th hit, `source-files.ts`'s three readers under scan 3                                                                                                | prose                                                                                                                                                                                                                                                                                                                                                                                                                     |
| (reasoned)       | LOW-10        | `focus-outline.test.tsx`'s `focus:` inventory names `textarea.tsx` as the interpolated third site - decision 9                                                                                                          | docblock only                                                                                                                                                                                                                                                                                                                                                                                                             |
| I7               | by design     | arm 3 pins the GRID STEP, not the inset: any leading that puts the inset in [6, 10) px rounds to 8, which is the claim                                                                                                  | recorded                                                                                                                                                                                                                                                                                                                                                                                                                  |
| I8               | confirmation  | the unmerged read is what catches P17 - arm 4 is load-bearing, not vacuous                                                                                                                                              | recorded                                                                                                                                                                                                                                                                                                                                                                                                                  |

The file now has **five** arms and the suite **578** tests (+2 on 576: arm 5, and the registry arm).

### The gate

**ONE run, detached, read from its sentinel** (`$BATCH_SCRATCH/s2/verify.exit`), at head
`7062eb50f66236dfdcbf56e7e0591aff93337ddf` - both items, layer 1's fixes and their record. **Exit 0**,
in **13 s** wall clock (a warm tree: `node_modules` and the Storybook cache already there). The
runner's own lines: `All matched files use Prettier code style!`, `packages/tokens typecheck: Done` +
`packages/ui typecheck: Done`, `packages/tokens build: wrote 5 files`, `✔ Building registry.`,
`└  Storybook build completed successfully`, and **`Test Files 33 passed (33)` / `Tests 578 passed
(578)`**.

`git status --short` was EMPTY before the gate and after it, and the gate runs `build:registry`
itself, so the committed `packages/ui/r` is byte-for-byte what these sources produce.

That is **+1 file / +8 tests** on the base's 32 / 570: the new `textarea-drawing.test.tsx` (five
arms), the `textarea` story suite (its "has stories" arm and `textarea/Default`), and the registry
arm that derives each item's dependencies. The paragraph you are reading landed in one more
docs-only commit after this run; the stream's report quotes a re-run at that final head.

No push, no tag, no `npm publish`, no PR: the freeze holds, and `packages/ui/package.json`'s version
line is still `0.1.3`. `Textarea` is the 0.1.4 bump's, and reaches thepile only through a
LIB-VENDOR-0.1.4 slice.

## DESIGN-LIB-d-meter-toggle: `Input`'s merge arm, the `Progress` measurement, and the `Toggle` measurement (2026-09-23)

Batch DL20, stream s2, on the library's `next` at `9dbb43c2` (**33 files / 578 tests**, re-measured at
this base by `pnpm build && pnpm test` before anything moved: `Test Files 33 passed (33)`, `Tests 578
passed (578)`, which is DL19's record). thepile is read-only throughout, at `0592d9af` (`next`, the DL19
STATUS head plus its capture record, docs only), by `git -C … show 0592d9af:<path>`. Under the push
freeze: LOCAL commits on `s/design-lib-d-meter-toggle`, no tag, no publish, and
`packages/ui/package.json`'s version line is not this stream's (s1 moves it to `0.1.4` on its own
branch and packs from `9dbb43c2` plus that line, so anything that ships here rides a later bump).

Every Radix measurement below ran in a scratch package OUTSIDE this repository
(`$BATCH_SCRATCH/s2/radix-probe/`: `@radix-ui/react-progress` 1.1.16, `@radix-ui/react-toggle`
1.1.18, `react`/`react-dom` 19.3.0, `jsdom` 30.0.1), so neither dependency ever entered this
package's manifest. Every reddening run ran in a DETACHED worktree of a committed head
(`../marquee-ui-s2-mut`, `pnpm install --frozen-lockfile` + the tokens build, each mutation's diff
confirmed before the run, the registry rebuilt after every source mutation so the "is stale" byte
check cannot redden for the wrong reason, `git checkout -- .` after). Logs under `$BATCH_SCRATCH/s2/`.

### 1. X1: `Input`'s own `className` merge, now observed

DL19's layer 1 (r6, X1; decision 10 of the d-disclosure block) replaced `cn(inputClass, className)`
with `cn(inputClass)` in `packages/ui/src/input.tsx` and the suite stayed green. **Re-measured here
before writing anything**, at the base in the detached worktree with the registry rebuilt: `Test
Files 33 passed (33)`, `Tests 578 passed (578)` (`mut-X1-base.log`). Every test that renders an
`Input` renders it bare (`fidelity.test.tsx:224,341`, `form-wiring.test.tsx` fifteen times, the
Form and Label stories), so a caller's class could be dropped, or could replace the field's string,
and nothing said so.

`packages/ui/test/input-merge.test.tsx` is the twin of `textarea-drawing.test.tsx`'s arm 5: an
`<Input aria-label="Email" type="email" className="probe-caller">`, found by
`getByRole("textbox", { name: "Email" })`, is an `INPUT` with `data-slot="input"`, its LAST class is
the caller's, every class before it is `inputClass` in order, and `type` was spread. `input.tsx` does
not move: the code was right and untested. A new file rather than a sixth arm in the textarea file,
because the claim is `Input`'s and a reader looking for it opens `input-*`.

Reddened in the detached worktree at the arm's commit `d099be10` (`mut-X1*.log`):

| id  | mutation in `input.tsx`                         | red / GREEN                                       | the assertion that reddened                                                                                                                                                                                  |
| --- | ----------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| X1a | `cn(inputClass)` (r6's X1, the caller dropped)  | **red**, 1 failed / 578 passed, the new arm alone | `the caller's class, last: expected 'focus:outline-none' to be 'probe-caller'`                                                                                                                               |
| X1b | `cn(className)` (the caller REPLACES the field) | **red**, 9 failed                                 | the new arm's `the field's own string, intact: expected [] to deeply equal [ 'w-full', 'min-h-hit', …(10) ]`, beside `fidelity.test.tsx`'s two `input.field` arms and the 44px floor sweep (already guarded) |
| X1c | `cn(className, inputClass)` (the order swapped) | **red**, 1 failed / 578 passed, the new arm alone | `the caller's class, last: expected 'focus:outline-none' to be 'probe-caller'`                                                                                                                               |
| X1d | `data-slot="field"`                             | **red**, 6 failed                                 | the new arm's `expected 'field' to be 'input'`, beside `fidelity.test.tsx` and `label/Default` (already guarded)                                                                                             |

X1a and X1c are the two the suite could not see before this file, and each reddens it and nothing
else. The file is one test, so the suite at this commit is **34 files / 579 tests**.

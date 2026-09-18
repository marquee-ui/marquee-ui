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
nothing else was needed. `pnpm test` goes from 267 tests in 18 files to **283 in
19** (+9 for the drawing suite, +7 story renders).

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

**4. `:has()` is not supported by jsdom 30's cascade.** Measured directly: a rule
`:is(:where(.group):has(:checked) *)` applies in NEITHER state, and
`element.matches()` on the same selector returns false, while the identical rule
written against `[aria-checked="true"]` follows the attribute exactly.
`input.matches(":checked")` is true from the property, but the STYLE path needs
the attribute. **So the native host's on-state is proved from the stylesheet (the
selector it compiles to, and the declarations it carries, asserted equal to the
button host's) and never in a rendered DOM.** Both hosts' behaviour is proved -
the checkbox toggles from a click on the row, and its value reaches a `FormData` -
but the drawing's response to it is not, in this repo, at this jsdom.

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
reverted with `git checkout --`, `git status --short` empty after each.

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
9. **The stated part count was updated where the package DESCRIBES itself**
   (`AGENTS.md`, `README.md`, `packages/ui/package.json`), and deliberately NOT in
   `label.tsx`'s "rather than as an eleventh part (D10)", which records a2's decision
   at the time it was taken - and whose bytes are frozen by the consuming repo's
   drift test, so a comment edit there is a re-sync that buys nothing.

### thepile inputs

What the consumption half needs when `0.1.1` publishes, in one list:

- `switch` goes into `CONSUMED` in `scripts/marquee-drift.test.ts`, and
  `components/ui/switch.tsx` arrives by `shadcn add` like the other six.
- **`ContentSettings.tsx`**: the row becomes `<Switch>` itself - it is already a
  `button[role="switch"]` with `aria-checked`, `disabled` and an `aria-label`, so
  the row's own classes (`w-full justify-between rounded-md border-2 …`) pass
  through `className` and the drawing becomes `<SwitchTrack><SwitchThumb/></SwitchTrack>`.
  Keep `data-testid="switch-track"` / `"switch-thumb"` on those two parts: they
  spread props, and `e2e/mobile-390.spec.ts` resolves both from inside the clicked
  switch by exactly those ids. `min-h-hit`, `group` and the disabled treatment come
  from the part now and should be deleted from the row's own string; the `hover:`
  and the box are the page's and stay.
- **`PushSettings.tsx`**: `<Switch asChild><label …>` with `<SwitchInput>` in place
  of the bare `<input className={`peer ${SWITCH_TRACK_CHECKED}`}>`, and the same
  `<SwitchTrack><SwitchThumb/></SwitchTrack>` after it. The wrapping
  `<span className="relative shrink-0">` goes: the thumb is inside the track now,
  which is what makes the two rows the same drawing (UNVERIFIED 5 - they are 2px
  apart today).
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
- `e2e/mobile-390.spec.ts`'s thumb-move arm stays TRUE and unchanged: same 44x24
  track, same 20px of travel, same `aria-checked` under it. It is also now the only
  instrument in either repo that can see the thumb move, so it should not be
  weakened.
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

⚠️ A blind spot worth carrying: scan 3's stem arm looks for `./<stem>"` and
`../<stem>"` and so does NOT see `import * as x from "../stories/switch.stories.js"`,
which is how `stories.test.tsx` and `tailwind-compile.test.tsx` reach a new story
file. Both were found by reading the suite rather than by the scan, and the
declared-list arm (scan 4) is what actually covers them here.

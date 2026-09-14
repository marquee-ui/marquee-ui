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
$ git -C <consuming repo> grep -l 'marquee-ui' ffb71a66 -- apps packages
(no hits)
$ git -C <consuming repo> grep -l 'marquee-ui' ffb71a66
ffb71a66:STATUS.md
ffb71a66:docs/slices/DESIGN-LIB.md
ffb71a66:docs/slices/MOBILE-1.md
```

Three planning documents and no code reference anywhere. Nothing outside this
repository consumes anything in it; the consume step is a3's.

**Run 2, at the commit point.** 76 exported names added or changed:

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
inputClass labelVariants sourceFiles storyFiles
```

39 of them are STORY names (`Primary`, `Disabled`, `AlertDialog`, `WithMarker`…),
which are exports only because CSF makes them so; their sole consumer is
`test/stories.test.tsx` and `test/tailwind-compile.test.tsx`, which compose every
module. `grep -rln` was run for every one of the 76 over `packages`, `.storybook`
and `registry.json`: **every name has at least one consumer inside this repository,
and none has a consumer outside it.**

The two that touch a sibling's surface, both inside the tokens package and both
this stream's own to change per the brief:

- `sourceFiles` gained a sibling, `storyFiles`, and its return type is now the
  named `ScannedFile[]` (the same shape it always returned). Consumers:
  `brand-guard.test.ts`, `literal-guard.test.ts`, `source-coverage.test.ts`. The
  brand guard now scans source AND stories; the literal guard deliberately still
  scans source only, because a story may legitimately paint a swatch.
- `--shadow-band` was ADDED to the emitted token contract, which the brief permits
  (adding an emitted name; never renaming or removing one). Consumers of the
  contract: `emitted-surface.test.ts`'s list, `packages/tokens/README.md`, and
  `ribbon.tsx`.

**0 CROSS. 0 NEW between the two runs (run 1 had no names to miss). 0 UNOWNED.**

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

Also: `packages/ui/stories` (39 stories), `packages/ui/test` (6 suites),
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

| upstream                                        | Marquee                                                                                                               | note                                                                                                                    |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `<Button href="/x">`                            | `<Button asChild><Link href="/x">…</Link></Button>`                                                                   | the library owns no router. The "no `type` on the link form" behaviour survives: the `asChild` branch never writes one. |
| `<Button rounded>`                              | `<Button variant="primaryRounded">`                                                                                   | a boolean that is a no-op on three of four variants is a variant, not a flag.                                           |
| `<Sheet title=… hideTitle childScrolls role=…>` | `<SheetContent>` with `<SheetTitle className="sr-only">`, with or without `<SheetBody>`, `role` passed to the content | the `role: undefined` bug the monolith had cannot recur: a part only spreads what the caller wrote.                     |
| `<Toast toast={{message, action}} onDismiss>`   | `<Toast open onDismiss><ToastMessage/><ToastAction/></Toast>`                                                         | replacing the message while open needs a changing `key`, because the timer is an effect.                                |
| `data-testid="sheet-handle"` / `"sheet-body"`   | `data-slot="sheet-handle"` / `"sheet-body"`                                                                           | shadcn's convention. 3 and 5 hits respectively in the consuming repo at the read commit.                                |
| `.pile-marquee`                                 | `.mq-marquee`, from `components/ui/ribbon.css`                                                                        | 13 hits in 5 files upstream.                                                                                            |
| `<label className={microLabelClass}>` on a span | `<Label tone="micro" asChild><span>…</span></Label>`                                                                  | or keep the class: `labelVariants({ tone: "micro" })` is exported.                                                      |

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
10. **`#toast-stack` keeps its id.** It is generic, it is not product vocabulary,
    and six references upstream cost nothing to keep working.

### A3 inputs

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

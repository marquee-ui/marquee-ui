# @marquee-ui/tokens

One typed role contract, two presets, and two generated artefacts: `dist/tokens.css`
(primitives, roles, and the Tailwind mapping) and `dist/tokens.json` (W3C DTCG, for
Figma). The three faces ship with them, because a preset that names a family it does
not load renders as a fallback.

```sh
pnpm build     # measures the faces, runs every check, writes dist/
```

## Three tiers

1. **primitives** - `--mq-olive-950: #0a0b07`. The only colour literals in the
   package, and only `src/presets/**` may write one.
2. **roles** - `--background: var(--mq-olive-950)`. What the system talks in. A role
   can only name a primitive the preset declares; a typo is a type error.
3. **the Tailwind mapping** - emitted, never authored. `@theme inline` for colours,
   a bare `@theme` for names that are not also `:root` tokens, and `@theme inline
reference` for the names that are BOTH (`--shadow-*`, `--ease-*`), where a plain
   inline entry would emit `--shadow-lift: var(--shadow-lift)` into the theme layer.

## Build checks (a preset that fails does not publish)

| check                                               | floor                   | where                        |
| --------------------------------------------------- | ----------------------- | ---------------------------- |
| ink on ground, and ink on its own fill              | WCAG AA, 4.5:1          | `src/checks/contrast.ts`     |
| `primary` against `destructive`                     | CIE ΔE2000 25           | `src/checks/distinctness.ts` |
| display pads                                        | measured from the woff2 | `src/font-metrics.ts`        |
| `tokens.css` and `tokens.json` name the same tokens | exact                   | `src/build.ts`               |

A preset may record a contrast EXCEPTION: the pair, the measured ratio and a reason.
It is not an escape hatch - the check fails if the pair now passes (stale) or if it
has slipped below the recorded ratio (rotting), so an exception dies with its fix.
Arcade ships exactly one (`muted` on `overlay`, 4.36:1); `light` ships none.

### The display pads

`cap-safe` and `descender-safe` exist because a clip box (`truncate`, `line-clamp-*`,
a bare `overflow-hidden`) clips at the padding edge of the line box, and a display
face whose ink leaves that box gets sliced. The pads are generated, never typed:

```
pad = ceil0.05( inkOverflow + ROUNDING_ALLOWANCE_PX / SMALLEST_TEXT_PX )
```

The overflow is measured against a `line-height: 1` line box (the worst case) over a
declared coverage set, printable ASCII by default. The allowance is the one number a
font file cannot supply: a browser rounds ascent, descent and the ink box to whole
pixels INDEPENDENTLY, so the real cut runs up to ~1px past the geometry, and that
error is absolute - in `em` it grows as the text shrinks.

Boldonse, measured 2026-09-14 (`pnpm build` prints it):

|                            | printable ASCII                            | Latin alnum only     |
| -------------------------- | ------------------------------------------ | -------------------- |
| highest ink                | 1.299em (`$`)                              | 1.200em (`C`)        |
| deepest ink                | 0.300em (`g`)                              | 0.300em (`g`)        |
| line box at `leading-none` | 1.060em above / 0.060em ABOVE the baseline | same                 |
| cap overflow → pad         | 0.239em → **0.40em**                       | 0.140em → **0.30em** |
| descender overflow → pad   | 0.360em → **0.55em**                       | 0.240em → 0.40em     |

## Consuming from thepile

thepile's values are reproduced exactly; the NAMES move to the D8 role names. Read
at commit `a60d6801` (`design/tokens.css` + `apps/web/src/app/globals.css`).

| thepile                                                         | Marquee                                             | note                                                                                                                                     |
| --------------------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `--bg`                                                          | `--background`                                      | shadcn name                                                                                                                              |
| `--surface` `--raised` `--overlay` `--sunken`                   | same                                                |                                                                                                                                          |
| `--line` / `--line-strong`                                      | `--border` / `--border-strong`                      |                                                                                                                                          |
| `--text`                                                        | `--foreground`                                      |                                                                                                                                          |
| `--text-secondary`                                              | `--foreground-2`                                    |                                                                                                                                          |
| `--text-muted`                                                  | `--muted`                                           |                                                                                                                                          |
| `--text-faint`                                                  | `--foreground-faint`                                | disabled tier; WCAG 1.4.3 exempts inactive components, so it is not in the 4.5:1 set                                                     |
| `--text-inverse`                                                | `--foreground-inverse`                              |                                                                                                                                          |
| `--accent`                                                      | `--brand` **and** `--primary`                       | identity split from action; the same yellow in Arcade                                                                                    |
| `--accent-ink`                                                  | `--brand-ink` **and** `--primary-ink`               |                                                                                                                                          |
| `--on-accent`                                                   | `--brand-foreground` **and** `--primary-foreground` |                                                                                                                                          |
| `--accent-hover` / `--accent-muted`                             | `--primary-hover` / `--primary-muted`               |                                                                                                                                          |
| `--accent-2`                                                    | `--categorical-2`                                   | `--info` now carries the teal value directly instead of aliasing                                                                         |
| `--danger` / `--danger-muted`                                   | `--destructive` / `--destructive-muted`             | shadcn name                                                                                                                              |
| `--success` `--success-muted` `--warning` `--info`              | same                                                |                                                                                                                                          |
| `--score-0` … `--score-5`                                       | `--scale-0` … `--scale-5`                           | product word out (D7)                                                                                                                    |
| `--score-track`                                                 | `--scale-track`                                     |                                                                                                                                          |
| `--star-ghost`                                                  | `--scale-empty`                                     | product word out (D7)                                                                                                                    |
| `--scrim`                                                       | same                                                |                                                                                                                                          |
| `--shadow-hard`                                                 | `--shadow-lift`                                     |                                                                                                                                          |
| `--shadow-sm` `--shadow-md` `--shadow-lg`                       | same                                                |                                                                                                                                          |
| `--focus-ring`                                                  | `--shadow-focus-ring`                               | already its Tailwind name upstream                                                                                                       |
| `--border-w`                                                    | `--border-width`                                    |                                                                                                                                          |
| `--font-sans`                                                   | `--font-body`                                       | plus `--default-font-family: var(--font-body)`, which is what Tailwind preflight reads, so body text still arrives without a second name |
| `--font-display` / `--font-mono`                                | same                                                | `--font-mono` quotes `"Menlo"`; the upstream sheet writes it bare. Both select Menlo, and a quoted family name is the safer spelling     |
| `--text-*` `--tracking-*` `--radius-*` `--space-*` `--weight-*` | same                                                |                                                                                                                                          |
| `--hit-min` `--content-max` `--page-max`                        | same                                                | mapped to `--spacing-hit`, `--container-content`, `--container-page`                                                                     |
| `--dur-*` `--ease-*`                                            | same                                                |                                                                                                                                          |
| `cap-safe` 0.3em / `descender-safe` 0.5em                       | `--display-cap-pad` / `--display-descender-pad`     | **generated: 0.4em / 0.55em.** The utilities read the tokens instead of hardcoding one face's metrics                                    |
| `--marquee-dur`                                                 | not carried                                         | a component token, and the two upstream files disagree (`design/tokens.css` 16s, `globals.css` 44s)                                      |

### Two things a consumer has to look at

1. **The pads differ from the hardcoded pair** (0.4em/0.55em vs 0.3em/0.5em), so the
   consume step has to check the pixels rather than assume them. The cap pad grew
   because the coverage set is printable ASCII, where `$` reaches 1.299em against a
   capital's 1.200em. The descender pad grew because 0.5em was derived from the
   font's full bbox (`yMin` -458), and no printable-ASCII glyph reaches it - the
   deepest is `g` at -300. Both utilities cancel their padding with a negative
   margin, so layout does not move; anything painted on the box does.
2. **`--font-sans` is not overridden.** `font-sans` stays Tailwind's default stack
   and the role utility is `font-body`.

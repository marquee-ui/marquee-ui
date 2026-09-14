# Marquee UI, for agents

Read this before generating or editing anything in this repo.

## The two rules that decide most questions

**1. Compose, do not configure.** Every component is a set of PARTS
(`Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`) with
`asChild` / render-prop slots. `cva` is for VISUAL axes only - size, tone. Structure
comes from composition. "An accordion of cards" is achieved by putting a `Card`
inside an item, with no library change; it is never a `variant="cards"` prop. If you
find yourself adding a prop that changes what is INSIDE a component, add a slot
instead.

**2. Nothing is a literal.** Colours, font families, shadows and the display pads
exist only as ROLES, and only a preset assigns them. A hex, an `rgb()`, a family
name or a shadow offset written anywhere but `packages/tokens/src/presets/**` fails
`test/literal-guard.test.ts`. Reach for `var(--foreground)`, `bg-surface`,
`shadow-lift` - never `#f2f5e8`.

## The role contract

Defined in `packages/tokens/src/roles.ts`; shadcn's names wherever the two overlap,
so a component copied out of the registry reads the same here as there.

- **ground**: `background`, `surface`, `raised`, `overlay`, `sunken`
- **line**: `border`, `border-strong`
- **ink**: `foreground`, `foreground-2`, `muted`, `foreground-faint` (disabled tier),
  `foreground-inverse`
- **identity, split from action**: `brand` / `brand-foreground` / `brand-ink` for the
  wordmark, headings and key figures; `primary` / `primary-foreground` /
  `primary-ink` / `primary-hover` / `primary-muted` for buttons and links. The split
  exists because an accent that passes as a FILL can fail as INK - the light preset
  is exactly that case.
- **status**: `destructive`, `destructive-muted`, `success`, `success-muted`,
  `warning`, `info`
- **data**: `scale-0` … `scale-5` (a single-hue luminance ramp; value reads by
  luminance, never by hue-morality), `scale-track`, `scale-empty`, `categorical-1`,
  `categorical-2`
- **type**: `font-display`, `font-body`, `font-mono`, plus `display-cap-pad` and
  `display-descender-pad`, which are MEASURED from the woff2 at build time
- **depth**: `shadow-lift` (the hard offset block) and `border-width` are one house
  decision; `shadow-sm` / `md` / `lg` are the elevation ramp; `shadow-focus-ring`
- **skeleton** (no preset may move these): the type scale, the 4px spacing grid, the
  radii, the motion durations, `hit-min` 44px, `content-max`, `page-max`

## No product vocabulary

The library carries no product's nouns. A pattern that is general gets a general
name (`scale-empty`, not the name of the glyph one app draws with it). The consuming
product's brand strings are scanned for and redden `pnpm test` (and so `pnpm
verify`); `pnpm build` never loads the guard, so it is the SUITE that stops them, not
the build (`test/brand-guard.test.ts`).

## Accessibility is a build check, not a review note

Every ink-on-ground pair is 4.5:1 or the preset does not publish. Tap targets are
`hit-min` (44px). A preset may RECORD a pair it knowingly ships short, with a reason
and the measured ratio - and the check then fails if that pair ever passes, so the
excuse dies with the fix.

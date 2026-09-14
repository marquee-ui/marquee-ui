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

## Where things are

- `packages/tokens` - the role contract, the two presets, the emitters, the build
  checks. Colour, type and depth are decided here and nowhere else.
- `packages/ui` - the ten part families, one file each, in shadcn's lowercase
  spelling (`button.tsx`). They import `cn` from `@/lib/utils`, which is the alias
  the registry ships them under; the CLI rewrites it to the consumer's own.
- `packages/ui/stories` - one story per part and per variant. **Stories are the
  tests** (D4): `packages/ui/test/stories.test.tsx` composes every one of them and
  runs every `play`, so a story that stops working reddens `pnpm test`.
- `registry.json` at the root, built into `packages/ui/r/` by `pnpm build`. That
  directory is COMMITTED build output: it needs a raw GitHub URL, and it needs to
  sit inside the package's `files` so a consumer with no network can install from
  `node_modules`. One copy serves both, so the two cannot drift.

## Adding a part

1. `packages/ui/src/<name>.tsx`, parts with `asChild`, `cva` for visual axes only.
2. A story per variant in `packages/ui/stories/<name>.stories.tsx`.
3. Add both paths to the lists in `packages/tokens/test/helpers/source-files.ts`.
   The walk those guards stand on is CHECKED against those lists, so a new file
   reddens the suite until it is declared - that edit is the review.
4. Add the item to `registry.json` with an explicit `target`
   (`components/ui/<name>.tsx`), then `pnpm build:registry`, then commit `r/`.
5. `pnpm verify`.

## Two things that are measured, not assumed

**`cn` carries a theme list.** tailwind-merge groups a utility by its knowledge of
Tailwind's DEFAULT scales, so every name this system adds - `min-h-hit`,
`text-3xs`, `shadow-lift`, `tracking-label` - falls outside every size-ish group
and silently stops merging. `packages/ui/src/lib/utils.ts` extends it, and
`test/merge-theme.test.ts` reads the names back out of the emitted stylesheet.

**A stylesheet in the registry must not open with a comment.** `shadcn add` strips
a leading comment block from a css file as a banner, so the consumer's copy would
differ from the registry's content forever and a `shadcn diff` drift check would
report it as drift. Every other comment in the file survives.

**A test can conjure the thing it is testing.** `test/fixtures/compile.css` opens
`@import "tailwindcss" source(none)` and names its sources explicitly. With
Tailwind's automatic detection on it scans the whole repository, which includes the
test files - so an assertion about a utility was enough to make that utility
compile. If you add a probe there, add it to a source directory, not to a string in
a test.

**Interactive means 44px, measured.** `tailwind-compile.test.tsx` renders every
story, takes every `button` / `a[href]` / `input` / `[role=button]`, looks its
classes up in the COMPILED stylesheet and resolves the height in pixels. A part that
is not a control (a `Badge`) carries no floor, so the moment `asChild` makes one a
control the CALLER owes it `min-h-hit` - and the story is what gets copied.

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

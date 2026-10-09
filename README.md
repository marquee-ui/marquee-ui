# Marquee UI

A marquee is the lit sign on top of an arcade cabinet, the part that announces the
game. Marquee UI is the design language behind that look, packaged so other people
can build with it: one opinionated skeleton (layout, density, spacing, component
structure) wearing a swappable skin, for software with a personality - trackers,
media apps, indie SaaS, marketing sites. It is deliberately not a neutral kit and
deliberately not an enterprise one; its value is its opinions.

Two halves, following the shadcn split: **tokens, fonts and base CSS ship as one npm
package** (`@marquee-ui/tokens`, this repo's `packages/tokens`) so the visual system
has a single origin, and **components ship through a shadcn custom registry**,
copy-in, so consumers own their copies. The registry doubles as the agent surface:
it is what an MCP-connected coding agent reads to install a component with the right
parts and props instead of inventing one.

## Status

Twenty-one component families and two token presets are published on npm.
The [quickstart](docs/getting-started.md) includes a standalone React 19 + Tailwind 4
starter; [supported stack](docs/supported-stack.md) records its scope and limitations.
The documentation site is available for local review. Its planned publication URL is
[marquee-ui.github.io/marquee-ui](https://marquee-ui.github.io/marquee-ui/).
The site has separate Get started, Components, Themes and Guides pages; nested
guide URLs are built as static documents so direct links and refreshes work.
[Tide PNGs for GitHub](brand/README.md) reuse the website's `m.` mark for the
organization avatar and repository social preview.

- **`packages/tokens`**: the typed role contract, two presets (`arcade`, the dark
  default, and `light`), the generated stylesheet and W3C DTCG JSON, the three
  faces with their licences, and the build checks that stop a preset publishing.
- **`packages/ui`**: thirty-five part families - `Button`, `Toggle`, `Input`, `Textarea`, `Label`, `Card`,
  `Badge`, `Separator`, `Accordion`, `Sheet`, `Switch`, `Checkbox`, `RadioGroup`, `Toast`,
  `Ribbon`, `Breadcrumb`, `Pagination`, `Alert`, `Form`, `DescriptionList`, `Avatar`, `Select`, `Tabs`, `DataTable`, `Chart`, `DatePicker`, `Table`, `Calendar`, `Combobox`, `Slider`, `DropdownMenu`, `Tooltip`, `Popover`, `AlertDialog`, `Dialog` - as composed parts with supported `asChild` or primitive replacement
  slots, `cva` for visual axes only, Radix where a primitive exists. Eight of them were
  moved out of a real product through the role rename table, and
  `packages/ui/test/fidelity.test.tsx` is what says the move changed no pixel.
- **The registry**: `registry.json`, built into `packages/ui/r/`. Committed, so it
  has a raw GitHub URL, and included in the published UI package, so consumers
  can serve a version-pinned registry from their installed npm copy. The CLI and
  component dependencies may still need network access.
- **Storybook**: the workbench and story corpus used by the tests. Vitest composes
  stories through `composeStories`; focused tests and browser journeys supplement
  their plays. The [finite runner limits](docs/component-parity.md#finite-deferred-validation-limits)
  record where that evidence does not establish behavior.

## Installing a component

Follow [getting started](docs/getting-started.md) to configure fonts, token CSS,
Tailwind source scanning, TypeScript/Vite aliases and `components.json`. Then:

```sh
npx shadcn@4.21.4 add @marquee/button
```

The `@marquee` registry mapping resolves each component's `@marquee/utils`
dependency into your own app. Components import local copies; the token package
supplies the shared visual roles. The quickstart distinguishes the moving GitHub
registry from the pinned npm registry and includes a cold consumer proof.

## Licence

MIT (see `LICENSE`). That covers the code, the tokens and the presets. It does not cover, and
this repository does not contain, the name "thepile", its wordmark or any product string of the
application that is its reference consumer; `NOTICE` says so and a guard test enforces it. The
bundled fonts are SIL OFL 1.1. Both packages have been public on npm since `0.1.0` (2026-09-15);
only the repository root stays `"private": true`.

## Working in this repo

```sh
pnpm install --frozen-lockfile
pnpm --filter @marquee-ui/docs exec playwright install chromium
pnpm verify        # lint + typecheck + build + unit + responsive browser tests
pnpm --filter @marquee-ui/docs dev   # docs preview, on :4176/marquee-ui/
pnpm storybook     # the workbench, on :6006
```

`build` comes before `test` on purpose: the component tests read the EMITTED token
stylesheet and the BUILT registry, so those artefacts have to exist, and be
current, before the tests can judge them.

For the assembled docs and nested Storybook, run `pnpm build`, then
`pnpm --filter @marquee-ui/docs preview` and open `/marquee-ui/` on port 4176.
Stop the dev server before using the same preview port. Browser tests also need
Chromium's system libraries; CI installs those before running the gate.

Node 22.12+ within Node 22, pnpm 10.24.0, TypeScript strict with no `any`. `AGENTS.md` is the short
version for a coding agent.

The [component-parity program](docs/component-parity.md) records the finite approved
scope and deferred backlog. Read the [original family contracts](docs/common-name-api.md)
and [candidate contracts](docs/recipe-contracts.md) before adapting shadcn examples:
matching names do not imply drop-in APIs. Fourteen newer families remain unreleased;
publication stays held as recorded in [STATUS.md](STATUS.md).
The [UI 0.2.0 release proposal](docs/releases/0.2.0.md) records the prepared package,
release notes and installation steps; published UI remains 0.1.10 until release.

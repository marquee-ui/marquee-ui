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

Tokens and the first ten parts. No docs site yet, and nothing published.

- **`packages/tokens`**: the typed role contract, two presets (`arcade`, the dark
  default, and `light`), the generated stylesheet and W3C DTCG JSON, the three
  faces with their licences, and the build checks that stop a preset publishing.
- **`packages/ui`**: ten part families - `Button`, `Input`, `Label`, `Card`,
  `Badge`, `Separator`, `Accordion`, `Sheet`, `Toast`, `Ribbon` - as parts with
  `asChild` slots, `cva` for visual axes only, Radix where a primitive exists. Six
  of them were moved out of a real product through the role rename table, and
  `packages/ui/test/fidelity.test.tsx` is what says the move changed no pixel.
- **The registry**: `registry.json`, built into `packages/ui/r/`. Committed, so it
  has a raw URL, and inside the package's `files`, so a consumer can install from
  `node_modules` with no network at all.
- **Storybook**: the workbench, and the test suite. Every story runs under vitest
  through `composeStories`, so a story that stops working reddens `pnpm test`.

## Installing a component

```sh
# over the network
npx shadcn@latest add https://raw.githubusercontent.com/marquee-ui/marquee-ui/main/packages/ui/r/button.json

# or with no network at all, from an installed copy of the package
npx shadcn@latest add ./node_modules/@marquee-ui/ui/r/button.json
```

Every item depends on `@marquee/utils` (the `cn` helper), so point your
`components.json` at the same registry to let that resolve:

```json
{ "registries": { "@marquee": "./node_modules/@marquee-ui/ui/r/{name}.json" } }
```

The components speak only in role utilities, so the consuming app has to import
`@marquee-ui/tokens/tokens.css` for any of them to paint.

## Licence

MIT (see `LICENSE`). That covers the code, the tokens and the presets. It does not cover, and
this repository does not contain, the name "thepile", its wordmark or any product string of the
application that is its reference consumer; `NOTICE` says so and a guard test enforces it. The
bundled fonts are SIL OFL 1.1. Packages stay `"private": true` until their first publish.

## Working in this repo

```sh
pnpm install
pnpm verify        # lint + typecheck + build + test
pnpm storybook     # the workbench, on :6006
```

`build` comes before `test` on purpose: the component tests read the EMITTED token
stylesheet and the BUILT registry, so those artefacts have to exist, and be
current, before the tests can judge them.

Node 22, pnpm 10.24.0, TypeScript strict with no `any`. `AGENTS.md` is the short
version for a coding agent.

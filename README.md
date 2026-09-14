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

Foundation only. `packages/tokens` is built: the typed role contract, two presets
(`arcade`, the dark default, and `light`), the generated stylesheet and W3C DTCG
JSON, the three faces with their licences, and the build checks that stop a preset
publishing. No components, no registry, no Storybook, no docs site yet.

## Licence

**Pending.** No `LICENSE` file exists yet and nothing here is published. The
recommendation on the table is MIT for code and tokens, CC BY 4.0 for the Figma kit,
OFL for the fonts (they already are - see `packages/tokens/fonts/*.OFL.txt`), plus a
notice that the consuming product's name, wordmark and brand strings are not
licensed. Until that is decided, every package is `"private": true`.

## Working in this repo

```sh
pnpm install
pnpm verify        # lint + typecheck + test + build
```

Node 22, pnpm 10.24.0, TypeScript strict with no `any`. `AGENTS.md` is the short
version for a coding agent.

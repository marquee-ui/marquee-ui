# DOCS-1 — hosted documentation and live component examples

Own `apps/docs/**`, root package/workspace/lock/config wiring,
`.github/workflows/**`, and this document. Do not edit README, consumer fixture,
consumer script, the other slice doc, STATUS or batch record. Any library change is
a request supported by a demonstrated blocker.

Build a maintainable static documentation site using real Marquee tokens and component
parts, with Arcade default, mobile-first layout, clear getting started, copyable working
composition examples and live component previews. Include a discoverable component index,
links to the full Storybook workbench, supported stack and honest limitations. Reuse or link
the consumer stream's canonical installation contract instead of inventing a competing one.
Adapt existing workspace checks so docs source gets typechecked and built in `pnpm verify`.
Keep role-only colors/fonts/shadows. Use real browser checks at 390, 768 and 1280px, keyboard
navigation, representative interactive controls and screenshots. Tests first for logic.

Prepare GitHub Pages deployment of docs and Storybook on the default public URL
`https://marquee-ui.github.io/marquee-ui/`, handling its subpath and static assets.
CI should build/test on PRs and deploy only approved main (or explicit manual dispatch).
No paid resource, CNAME, domain purchase, npm release or secret copying. The orchestrator
owns hosting API mutations and verifies the final deployment effect.

Commit before independent detached layer-1 review; record findings and mutation table
here, close findings, run full Marquee `pnpm verify`, and push `s/docs-1`.

## Consumers

Baseline `git diff f0f5f6e...HEAD` returned no implementation symbols, routes,
role changes or classes; this worktree started at the composition commit.
The existing source scan found the registry `@/lib/utils` contract and the
Storybook font-descriptor/absolute-path test. The orchestrator explicitly extended
the fence to `.storybook/**` and `packages/ui/test/storybook-preview.test.ts`.

Canonical installation prose is owned by CONSUMER-1. The site imports
`docs/getting-started.md` and `docs/supported-stack.md` as raw Markdown; links
between these guides resolve to site anchors. Consumer document commits
eb2378a and 2ef29bd were cherry-picked without editing their prose.
Root `test:consumer` wiring is requested by that sibling and will use its exact
test script after integration. No library source or registry contract changes.

Final committed consumer scan pending the implementation commit.

## As built

- Vite/React static site with Arcade default, actual component parts, all 21
  families, source-backed copyable previews, a Card/Accordion composition,
  canonical installation/support guides, token-role swatches and full Storybook.
- Site dependency additions: React Markdown and remark-gfm for canonical prose,
  Playwright for browser verification; React/testing/types use workspace ranges.
  Direct workspace source consumption preserves both registry component import
  aliases and the library's own `@/lib/utils` alias.
- Local development URL `http://localhost:4176/marquee-ui/`; production browser
  checks reserve 4177, reviewer 4180. Public deployment remains on HOLD after the
  user requested localhost review. No Pages setting, public deploy or merge done.
- Production URL contract prepared: `/marquee-ui/`, nested Storybook at
  `/marquee-ui/storybook/`. GitHub Actions checks PRs and prepares Pages deploy
  only from main. No domain, CNAME, secrets, npm release or paid resource.
- Storybook now links the generated font sheet from preview-head instead of
  copying its declarations. Both font sheet and Light preset resolve from the
  iframe's directory. Assembly preserves the OFL notices with both font copies.
- Initial browser rendering exposed a duplicated Vite base in the font URL and
  an unlayered anchor reset overriding primary ink. Corrected the link through
  Vite's asset rewriting and scoped the reset away from slotted components.
  Browser checks now observe loaded FontFace entries, contrast, overflow and focus.
- Tests authored before their behavior implementation: clipboard success/denial,
  explorer selection/state, canonical Markdown links and code copying, Storybook
  subpath contracts. Focused production run found and fixed a code/live-preview
  locator ambiguity; clipboard proof grants real Chromium permissions and checks
  the exact resulting clipboard bytes. Product denial fallback remains tested.
- Before review: lint and every workspace typecheck passed; docs unit 3 files /
  6 tests passed; Storybook URL guard 1 file / 2 tests passed; targeted keyboard,
  dialog/disclosure/copy browser journey passed all three widths (3.2 s).
  Font/contrast, all-family story links and nested preset checks previously passed
  all three widths; the final full gate will rebuild everything after review.

## Layer 1

Pending detached review of the committed implementation, before the full gate.

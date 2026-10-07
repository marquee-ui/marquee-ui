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

Final scan, 2026-10-08, `git diff f0f5f6e...HEAD -- apps packages` followed by
scoped `rg` across docs sources/tests:

```text
export names: App, catalog, CopyCode, ComponentExplorer, MarkdownGuide
symbol consumers: apps/docs/src/{main,app,explorer,markdown-guide}.tsx
tests: apps/docs/test/{copy-code,explorer,markdown}.test.tsx
Path/Href names: fileURLToPath, lightHref, outputPath
deployment routes: /marquee-ui/, /marquee-ui/storybook/
guide anchors: #getting-started, #supported-stack
role consumers: docs tests/browser only (status, switch, dialog, button)
changed shared test: packages/ui/test/storybook-preview.test.ts
library source/registry changes: none
CROSS: canonical Markdown guides and scripts/verify-consumer.test.mjs (CONSUMER-1)
UNOWNED: none
```

No external consumer reads the five new docs exports. The only existing
source-byte consumer changed is the explicitly assigned Storybook guard.
The role/style scan found no raw palette, font-family or shadow assignment;
the site's font-family declarations use `var(--font-*)`.

## As built

- Vite/React static site with Arcade default, actual component parts, all 21
  families, source-backed copyable previews, a Card/Accordion composition,
  canonical installation/support guides, token-role swatches and full Storybook.
- Site dependency additions: React Markdown and remark-gfm for canonical prose,
  Playwright for browser verification; React/testing/types use workspace ranges.
  Direct workspace source consumption preserves both registry component import
  aliases and the library's own `@/lib/utils` alias.
- Root Node engine now requires `>=22.12.0 <23`, matching the consumer's inspected
  Vite 8 engine. The `.nvmrc` selects Node 22 for CI; this run uses 22.18.0.
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

## Layer 1 (reviewer, detached worktree of 807c7af98f3d3b9f47c6070d124ba41c134de3c8, slot r6)

<!-- prettier-ignore -->
| file | test | mutation applied | red / GREEN | what it asserts now |
| --- | --- | --- | --- | --- |
| apps/docs/test/copy-code.test.tsx | copies the exact usable composition and announces success | In CopyCode replace navigator.clipboard.writeText(code) with Promise.resolve(), leaving success announcement intact | red | Exact clipboard write is required; expected one write with source, received zero calls. |
| apps/docs/test/copy-code.test.tsx | keeps the code selectable and announces a denied clipboard | Same no-op clipboard write | red | Denied write must announce failure; expected "Could not copy. Select the code below.", received "Copied to clipboard". |
| apps/docs/test/explorer.test.tsx | selects a family, renders its real preview and exposes its composition | Replace every live Preview with the constant text "Preview unavailable" | red | Switch preview must contain the actual interactive switch; missing role switch named Email updates. |
| apps/docs/test/explorer.test.tsx | keeps every family discoverable and resets preview state when switching | Same constant-preview collapse | red | Initial Button preview must expose its functional control; missing button named Try the button. |
| apps/docs/test/markdown.test.tsx | keeps canonical guide links on the docs site and external citations intact | Collapse every guide href to #collapsed | red | Limits must retain the mapped #supported-stack target; received #collapsed. |
| apps/docs/test/markdown.test.tsx | copies the canonical fenced command without Markdown syntax | Collapse fenced source passed to CopyCode to an empty string | red | Clipboard must receive npm ci + newline + npm run dev; received empty string. |
| packages/ui/test/storybook-preview.test.ts | links the generated font sheet without copying preset descriptors | Drop deployment base by changing ./tokens/fonts.css to /tokens/fonts.css | red | Font URL resolves beneath /marquee-ui/storybook/; received /tokens/fonts.css. |
| packages/ui/test/storybook-preview.test.ts | loads the light preset inside the same workbench path | Drop deployment base by changing lightHref from ./tokens/light.css to /tokens/light.css | red | Light URL resolves beneath /marquee-ui/storybook/; received /tokens/light.css. |
| apps/docs/browser/site.spec.ts | loads real fonts, readable primary actions and a page that fits the viewport [mobile, tablet, desktop] | Delete the documentation font-sheet link in index.html, rebuild docs and assemble site | red (3/3) | Actually loaded face list is required; expected Boldonse, Space Grotesk, Space Mono, received []. |
| apps/docs/browser/site.spec.ts | navigates on mobile and operates real examples with a keyboard [mobile, tablet, desktop] | Replace clipboard write with Promise.resolve(), preserving success UI; rebuild docs and assemble site | red (3/3) | Browser reads real clipboard contents and compares exact displayed composition; received empty string despite success status. |
| apps/docs/browser/site.spec.ts | renders every family and sends each workbench link to a real story [mobile, tablet, desktop], original 807c7af | Replace every live Preview with the constant text "Preview unavailable"; rebuild docs and assemble site | GREEN (3/3) | Original not.toBeEmpty only required text, so no actual family rendering was pinned. Action: require independently listed component parts and meaningful portalled Sheet/Toast rendering. Author fixed this in e0d5c5e; see closure row below. |
| apps/docs/browser/site.spec.ts | serves Storybook fonts and both presets beneath the deployment subpath [mobile, tablet, desktop] | Set light stylesheet link.disabled=true, retaining correct href and link; rebuild Storybook and assemble site | red (3/3) | Actual applied Light values must change computed --background; dark #0a0b07 remained, violating not.toBe(darkGround). |
| apps/docs/browser/site.spec.ts | renders every family and sends each workbench link to a real story [mobile, tablet, desktop], closure e0d5c5e | Reapply exact every-live-Preview to "Preview unavailable" collapse against committed test closure, rebuild docs and assemble site | red (3/3) | Independently listed actual part required: "Button must render its actual parts", absent button[data-slot=button] in family canvas. |

One MEDIUM finding closed in e0d5c5e. The original browser placeholder collapse
stayed green at all three widths; the test now requires an independent list of
actual family parts, named dialogs and notifications, and rejects the same
mutation at all three widths. This is the concrete response to the GREEN row.
The reviewer inspected the Node-engine follow-up 8d3ae92. No finding remains.

Review measurement, 2026-10-08: docs unit 3 files / 6 tests, Storybook guard
1 file / 2 tests, final Chromium 12 passed (9.5 s), all runner exit 0.
20 red mutated cases and the original 3 GREEN cases are recorded above.
Canonical consumer final 11f4330 was merged without editing its owned files.
The full stream gate follows this committed review record.

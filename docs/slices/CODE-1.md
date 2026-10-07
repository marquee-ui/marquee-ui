# CODE-1 — theme-aware syntax highlighting and code/prose presentation

Own the code/prose surface listed in RELEASE-1-UX. Reproduce the plain current code with
browser evidence and meaningful failing checks, then add maintained language-aware
safe tokenization for TSX/TS/JS, CSS, shell, JSON and canonical fence aliases. Use React
text/token nodes, no unsafe HTML interpolation or naive regex replacement. Unsupported
languages retain readable source. Copy preserves the original code bytes exactly.

Map semantic token classes to existing contrast-safe roles so mode/palette changes
repaint code immediately. Improve code headers/language labels, inline code, readable
prose headings/list/table and local horizontal scrolling within the existing design.
No color/font/shadow literals outside presets; coordinate shared roles with THEME-1.
Source and browser assertions must see actual rendered token colors and source fidelity,
not merely class presence. Bound independent review to these behaviors, then one full gate.

## Consumers

Initial scan, 2026-10-08, before implementation (`git grep -n -E
'CopyCode|MarkdownGuide|ComponentExplorer|code-block|code-heading|canonical-guide'
-- apps/docs packages/tokens/test`):

```text
CopyCode: src/app.tsx (composition; CROSS THEME-1), src/explorer.tsx,
src/markdown-guide.tsx, test/copy-code.test.tsx.
MarkdownGuide: src/app.tsx (canonical guide imports; CROSS THEME-1), test/markdown.test.tsx.
ComponentExplorer: src/app.tsx, test/explorer.test.tsx.
CSS: existing src/styles.css (CROSS THEME-1), browser/site.spec.ts selectors.
No URL/route, role, ARIA or published library contract changes.
```

Commit-point scan (`git diff 037bd22 -- apps/docs/src`, followed by `git grep` for
the three exported names, touched paths, roles and distinctive class fragments):

```text
CopyCode and MarkdownGuide consumers unchanged; notified THEME-1 of optional language seam.
SyntaxCode: only src/copy-code.tsx. New internal helper, no cross-stream consumer.
code-block/canonical-guide selector consumers retain those classes; presentation classes added.
Touched tests: test/copy-code.test.tsx, test/markdown.test.tsx; browser/site.spec.ts
still reads composition code/source/copy and layout; new browser/syntax.spec.ts.
No route helpers/URL changes, no role/ARIA changes, no exact class-string pins.
3 exported names scanned, 2 CROSS paths, 0 unexpected consumers, 0 UNOWNED.
```

The shared existing stylesheet remains owned by THEME-1. New presentation selectors
start with `.code-block.code-presentation` or `.canonical-guide.guide-presentation`,
which outrank its existing code/prose rules even when that stylesheet loads later.

## As built

Refractor 5's maintained AST API, checked against its [primary documentation](https://github.com/wooorm/refractor)
on 2026-10-08. Register only TSX (and its JSX/JS/TS/markup dependencies), CSS, Bash
(including sh/shell aliases) and JSON. React receives text and spans, never source
HTML, tag names or attributes. Unsupported or empty languages retain plain source.
`CopyCode` defaults to TSX; missing Markdown fence languages explicitly use text.
Markdown removes exactly one closing renderer newline, preserving intentional blank
lines. Original strings supply clipboard writes; highlighted source never supplies them.

Syntax roles: keyword/tag/selector → primary-ink; function/class/builtin → brand-ink;
property/attribute/operator → info; string/attribute-value → success; number/boolean
→ warning; comments/punctuation → foreground-2; other text → foreground.
Theme owns assignments. No literal color, font or shadow is added outside presets.

Presentation adds language badges, a surface header, border hierarchy, code/prose
spacing, inline code backgrounds, list markers and table header/row hierarchy.
Long lines remain in keyboard-focusable local scrollers. Empty copy status retains
its live region while occupying no padding.

Measured 2026-10-08 with Node 22.18.0. Scratch directory:
`/home/ankit/.marquee-scratch/RELEASE-1-UX/s2/`.

- Baseline production build and `baseline.mjs`: one painted code color at 390px,
  pre client width 346 / scroll width 481 / document width 390. Artifacts
  `baseline.json`, `plain-code-390.png`.
- Optional-language test red on missing CSS label (`interface-red.log`), then
  interface commit `38df40cb6f3bc33d1b36ef9f288f4d76276543bc`, docs 7/7 green.
- `pnpm --filter @marquee-ui/docs test`: syntax red 11 failed / 10 passed,
  then 21 passed (`syntax-unit-red.log`). Grammar semantics, safe HTML-shaped text,
  exact CRLF/tabs/Unicode/trailing blanks, plain fallbacks and denied copies.
- Build then `DOCS_PORT=4205 pnpm --filter @marquee-ui/docs exec playwright test
browser/syntax.spec.ts`: baseline red 6/6 at 390/768/1280, with predicted failures
  “keyword, string and number must paint distinct colors” (3 expected / 1 actual)
  and “sh fence 0 needs painted syntax” (>1 expected / 1 actual), recorded in
  `syntax-browser-red.log`. No missing-selector failure counted as the color proof.
- Targeted browser suite now measures actual painted text, all canonical source
  and clipboard bytes, role repaint, emitted dark/light token fixtures, ≥4.5 text
  contrast, local overflow, keyboard focus and prose/table/list hierarchy.
  The first focus check used programmatic focus after mouse clicks; corrected the
  instrument to Tab from the preceding copy control so it measures keyboard focus.
  `syntax-browser-green.log` and `green-browser/` hold results/screenshots.

The emitted dark/light fixtures are scoped to code blocks to exercise this stream's
role contract independently. Actual studio controls × all four palettes × both
modes are an integration seam, verified by the reconciler on the merged tree.

Targeted syntax browser result: **12 passed (8.9s), exit 0**. The only full
`DOCS_PORT=4205 pnpm verify` ran on committed
`1e498e562b00f7d037f712dd70d22e590652c4b7`, source-identical to the independently
reviewed implementation. Runner sentinel **exit 0**, **39s wall**:

```text
Library: Test Files 36 passed (36); Tests 643 passed (643).
Docs: Test Files 3 passed (3); Tests 21 passed (21).
Consumer harness units: tests 5; pass 5; fail 0.
Docs browser: 24 passed (17.1s), mobile/tablet/desktop.
```

Gate includes lint, all workspace typechecks, token/docs/registry/Storybook/site
builds and all suites, in repository order. Evidence: `verify.sha`, `verify.log`,
`verify.exit`, `verify.start`, `verify.end`, `full-gate-browser/` under the scratch
directory above. Registry build leaves no tracked diff; library/package versions
unchanged. Final recording edit changes only this document, checked by format lint.
Production preview 4204 remains available for integration; no public action occurred.

## Layer 1 (reviewer, detached worktree of 11ea72a1669b31d0f7d49b49bd42893575cf9b1b, slot 6)

| file                              | test                                                                                                | mutation applied                                                                                                                 | red/GREEN                         | what it asserts now                                                                                                                                                                                                                                                                  |
| --------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| apps/docs/test/copy-code.test.tsx | copies the exact usable composition and announces success                                           | Delete clipboard write; replace with `await Promise.resolve()` in copy-code.tsx:18                                               | red, PROVED                       | Exact clipboard argument/call count fails: `Number of calls: 0`. Success-status assertion follows the failure and is not reached.                                                                                                                                                    |
| apps/docs/test/copy-code.test.tsx | keeps the code selectable and announces a denied clipboard                                          | Same clipboard no-op                                                                                                             | red, PROVED                       | Denied feedback fails: expected `Could not copy. Select the code below.`, received `Copied to clipboard`. Source/visibility assertions follow the failure and are not reached.                                                                                                       |
| apps/docs/test/copy-code.test.tsx | identifies an explicit language while preserving every source byte                                  | Same clipboard no-op                                                                                                             | red, PROVED                       | CSS label and exact rendered CRLF/tab/Unicode/source bytes survive; clipboard assertion fails with 0 calls.                                                                                                                                                                          |
| apps/docs/test/copy-code.test.tsx | renders source-shaped HTML as selectable text, never active elements                                | Same clipboard no-op                                                                                                             | GREEN, PROVED                     | Exact text, absence of img/script elements, and highlighted img tag survive; this test claims rendering safety, not clipboard behavior.                                                                                                                                              |
| apps/docs/test/copy-code.test.tsx | uses the tsx grammar without rewriting source                                                       | Same clipboard no-op                                                                                                             | GREEN, PROVED                     | Exact rendered source and a const keyword token survive; no clipboard claim.                                                                                                                                                                                                         |
| apps/docs/test/copy-code.test.tsx | uses the ts grammar without rewriting source                                                        | Same clipboard no-op                                                                                                             | GREEN, PROVED                     | Exact rendered source and a const keyword token survive; no clipboard claim.                                                                                                                                                                                                         |
| apps/docs/test/copy-code.test.tsx | uses the js grammar without rewriting source                                                        | Same clipboard no-op                                                                                                             | GREEN, PROVED                     | Exact rendered source and a number token survive; no clipboard claim.                                                                                                                                                                                                                |
| apps/docs/test/copy-code.test.tsx | uses the jsx grammar without rewriting source                                                       | Same clipboard no-op                                                                                                             | GREEN, PROVED                     | Exact rendered source and a Button tag token survive; no clipboard claim.                                                                                                                                                                                                            |
| apps/docs/test/copy-code.test.tsx | uses the css grammar without rewriting source                                                       | Same clipboard no-op                                                                                                             | GREEN, PROVED                     | Exact rendered source and a color property token survive; no clipboard claim.                                                                                                                                                                                                        |
| apps/docs/test/copy-code.test.tsx | uses the sh grammar without rewriting source                                                        | Same clipboard no-op                                                                                                             | GREEN, PROVED                     | Exact rendered source and a quoted package string token survive; no clipboard claim.                                                                                                                                                                                                 |
| apps/docs/test/copy-code.test.tsx | uses the shell grammar without rewriting source                                                     | Same clipboard no-op                                                                                                             | GREEN, PROVED                     | Exact rendered source and a quoted hello string token survive; no clipboard claim.                                                                                                                                                                                                   |
| apps/docs/test/copy-code.test.tsx | uses the json grammar without rewriting source                                                      | Same clipboard no-op                                                                                                             | GREEN, PROVED                     | Exact rendered source and a true boolean token survive; no clipboard claim.                                                                                                                                                                                                          |
| apps/docs/test/copy-code.test.tsx | keeps made-up-language source readable and exactly copyable                                         | Same clipboard no-op                                                                                                             | red, PROVED                       | Exact rendered bytes and absence of token spans survive; clipboard assertion fails with 0 calls.                                                                                                                                                                                     |
| apps/docs/test/copy-code.test.tsx | keeps text source readable and exactly copyable                                                     | Same clipboard no-op                                                                                                             | red, PROVED                       | Exact rendered bytes and absence of token spans survive; clipboard assertion fails with 0 calls.                                                                                                                                                                                     |
| apps/docs/test/copy-code.test.tsx | keeps [empty language] source readable and exactly copyable                                         | Same clipboard no-op                                                                                                             | red, PROVED                       | Exact rendered bytes and absence of token spans survive; clipboard assertion fails with 0 calls.                                                                                                                                                                                     |
| apps/docs/test/markdown.test.tsx  | keeps canonical guide links on the docs site and external citations intact                          | Force `language="tsx"` in markdown-guide.tsx:34                                                                                  | GREEN, PROVED                     | Heading level/suppression and local/external link destinations survive; no fence-language claim.                                                                                                                                                                                     |
| apps/docs/test/markdown.test.tsx  | copies the canonical fenced command without Markdown syntax                                         | Same forced TSX grammar                                                                                                          | GREEN, PROVED                     | Copies exact SH command bytes; it makes no token/grammar assertion. Label remains SH because only the passed grammar changed.                                                                                                                                                        |
| apps/docs/test/markdown.test.tsx  | passes the fence grammar and removes only the renderer's closing newline                            | Same forced TSX grammar                                                                                                          | red, PROVED                       | Exact source/newline assertion survives; CSS property assertion fails: expected `color`, received undefined. Clipboard assertion follows the failure and is not reached.                                                                                                             |
| apps/docs/test/markdown.test.tsx  | keeps an unspecified fence plain and leaves inline code in prose                                    | Same forced TSX grammar                                                                                                          | red, PROVED                       | Inline and fenced source text assertions survive; expected no token spans fails with 4 spans. TEXT badge assertion follows the failure and is not reached.                                                                                                                           |
| apps/docs/browser/syntax.spec.ts  | paints TSX semantics, repaints from roles and copies the original example [mobile, tablet, desktop] | Replace all six syntax-token color declarations in code-presentation.css:48-80 with `color: var(--foreground)`; rebuild own docs | red in all three projects, PROVED | Exact displayed source survives; `keyword, string and number must paint distinct colors` fails: Expected 3 / Received 1. Contrast, role repaint, second source assertion, clipboard and status assertions follow the failure and are not reached. No selected browser test survives. |

All three mutations landed and were inspected before their runs. Unit mutations ran one test file at a time. Each source mutation was restored from this detached checkout's committed HEAD before the next control. The browser mutation was built in this checkout before its selected test, then restored and rebuilt. Nine copy-file and two Markdown-file tests remain GREEN under their respective controls; each survivor's asserted behavior is preserved by that control. None is an integrity finding against a clipboard or fence-language claim it does not make. The three other browser tests were deliberately not selected under the color control, per the bounded brief.

No changes were needed for the GREEN rows: the clipboard collapse preserved their rendering
claims, and the grammar override preserved link/copy-only claims. All selected tests
that claim the collapsed behavior failed at the predicted assertion. Review findings:
0 HIGH / 0 MEDIUM / 0 LOW; 3 controls; 0 relevant selected GREEN survivors.

Restored reviewer units: 3 files / 21 tests passed. Restored browser: 12 passed
(9.2s). Durable full report: `/home/ankit/.marquee-scratch/RELEASE-1-UX/r6/report.md`.

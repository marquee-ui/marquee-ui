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

Full gate and independent review are recorded below after completion.

## Layer 1

Pending.

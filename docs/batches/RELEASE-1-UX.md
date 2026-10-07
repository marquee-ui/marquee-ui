# RELEASE-1-UX — make the design controls and examples real

This continues draft PR #2 after localhost review of RELEASE-1. The user reported that
“Make it expressive” does nothing beyond its switch, expected different colors and
light/dark mode, and requested accent-aware syntax highlighting and richer code/text.
No merge, public deployment, Pages activation, domain purchase or npm publication.

## Ownership

Base: `77b09ee734fe8bafc20688058e2606d9b35acbdd`. Integration owner works on `next`.
Two streams in separate worktrees; independent named reviewers on detached commits and
one merged layer-2 pass. Orchestrator depth 1, streams 2, reviewers 3; ceiling 4.
All actors preserve other agents' work. The older 4174/4176 previews stay available.

| Stream      | Owns                                                                                                                                                                                                                                                          | Runtime                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| THEME-1     | `app.tsx`, `main.tsx`, existing `styles.css`, new `theme*` source/CSS modules, new theme unit/browser tests, docs-specific palettes under `packages/tokens/src/presets/`, their exact source-list/guard updates, `docs/theme-customization.md`, own slice doc | worktree `../marquee-theme-1`, branch `s/theme-1`, preview 4194, production gate 4195, reviewer 4196 |
| CODE-1      | `copy-code.tsx`, `markdown-guide.tsx`, new tokenizer/presentation source/CSS, `explorer.tsx` only to pass TSX language, its existing copy/markdown tests and new syntax tests/browser spec, docs package dependencies and root lockfile, own slice doc        | worktree `../marquee-code-1`, branch `s/code-1`, preview 4204, production gate 4205, reviewer 4206   |
| Integration | STATUS, batch/review record, root coordination and explicit cross-stream seams                                                                                                                                                                                | final gate 4182, final preview 4174                                                                  |

Use Node 22.18.0/pnpm 10.24.0 at `/home/ankit/.nvm/versions/node/v22.18.0/bin`.
Scratch: `/home/ankit/.marquee-scratch/RELEASE-1-UX/`, with separate s1/s2/r5/r6 directories.

## Shared contracts

- Theme changes actual root roles and all live previews immediately. Separate mode from
  curated accent/identity combinations. Valid choices persist; storage failure/invalid data
  falls back safely. Studio remains reachable from deep documentation at all three widths.
- The expressive switch changes the live composition's visible depth/brand emphasis and
  explains its effect. No library API or skeleton redesign, gratuitous motion or reload.
- New palette literals exist only under the token preset directory. They are local demo
  recipes, not already published npm presets; preserve package versions and export contract.
- CODE-1 maps semantic syntax classes to existing readable roles: primary-ink/brand-ink,
  info/success/warning, foreground tiers. No literal syntax palette in CSS. THEME-1 owns
  contrast-safe assignments for both modes. Layer 2 checks the integrated result.
- CopyCode accepts an optional language, defaults to TSX for existing executable examples,
  keeps code bytes untouched, and passes semantic fence language from Markdown. Theme recipe
  calls it with `language="css"`; THEME-1 can use a temporary local typing seam until CODE-1
  merges, or merge that small interface commit after agreement.
- No shared stylesheet races: THEME-1 owns existing styles.css. CODE-1 uses new scoped
  presentation CSS imported by its components; coordinate selector precedence explicitly.
- One full gate per reviewed stream, then a merged gate. Targeted real-browser tests first,
  with bounded independent negative controls for visible effect, persistence and highlighting.

## Completion

Show an early useful theme preview, integrate reviewed source, run the changed-tree gate,
then replace 4174 with the verified build. Capture dark/light/palette/code views and update
PR #2; read hosted CI at its final head. Retain the publication hold and stop this revision.

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

## Design and regression evidence

The studio separates dark/light mode from four combinations: Arcade acid, Electric
(violet/cyan), Clementine (coral/peach), and Tide (mint/blue). The expressive control
changes the live composition's brand emphasis and depth. The customization recipe
describes the active local choice, without changing the published preset exports.

At the composition base, the theme stream's browser regression fails specifically
because the card shadow is identical before and after the expressive switch, and the
theme studio is missing. The code stream measured all code in one computed color;
its new language-label test fails before implementation. Evidence lives under
`/home/ankit/.marquee-scratch/RELEASE-1-UX/{s1,s2}/`.

The final gate will run in a detached integration worktree on port 4182. The existing
4174 server and its dist directory remain untouched until the replacement build is
verified. This avoids changing the user's review surface during compilation.

## As built and verified

Both streams completed independent reviews, meaningful negative controls and one full
gate each. CODE-1 passed in 39 seconds; THEME-1 passed in 42 seconds. The early shared
CopyCode interface was copied into THEME-1, causing two integration conflicts; both were
resolved to CODE-1's final reviewed component and tests. All 35 merged docs unit tests
passed before the merge commit. The later theme report merge changes its slice record only.

On 2026-10-08, `DOCS_PORT=4182 pnpm verify` at
`5df4a7980b2b25d9d06f7f954844eb3b032f78eb` exited **0** in **51 seconds**:
37 library files / 652 tests, 4 docs files / 35 tests, 5 consumer checks and 51 browser
cases at 390/768/1280. The generated registry is unchanged. The earlier cold npm consumer
proof remains valid; this revision changes no published version or registry component.

[One merged cross-review](RELEASE-1-UX-review.md) found **0 HIGH / 0 MEDIUM / 0 LOW**.
Its 24 actual palette/mode/viewport states passed; minimum painted syntax contrast was
5.07:1. Selected recipe declarations match the root, exact source copying is preserved,
and preferences, real fonts, focus and local scrolling remain sound.

The verified immutable build now serves **http://localhost:4174/marquee-ui/** from
`/home/ankit/Code/marquee-integration-ux/apps/docs/dist`, node PID 810813. The served index
matches the gated file byte-for-byte. Ordinary viewport captures were refreshed against
that URL, avoiding the sticky-toolbar artifact in the early element screenshot:

- [Arcade / dark](RELEASE-1-UX-evidence/desktop-arcade-dark.png)
- [Electric / light](RELEASE-1-UX-evidence/desktop-electric-light.png)
- [Studio, live button and highlighted source](RELEASE-1-UX-evidence/desktop-electric-code.png)
- [Mobile Clementine controls and source](RELEASE-1-UX-evidence/mobile-clementine-code.png)

The draft PR remains the review surface. Final pushed-head CI and serving details are
recorded in `/home/ankit/.marquee-scratch/RELEASE-1-UX/integration/final-handoff.md`.
No merge, public deployment, Pages activation, domain operation or npm publication ran.

## Bounded retro

The first candidate verified switch state without demanding a visible composition change.
This revision requires computed page/card/code effects and proves those checks fail when
painting, persistence, syntax or expressive behavior is disabled. Review distinguishes
complementary assertions from missing behavior: contrast-only units need not reject an
otherwise accessible duplicate palette when the browser distinctly rejects that collapse.
An unchanged legacy guard-loop survivor is documented in THEME-1 without expanding scope.

Retain the integration preview worktree and existing review previews while localhost review
continues. Next is user direction on this candidate; publication remains held.

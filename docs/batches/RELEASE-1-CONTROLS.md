# RELEASE-1-CONTROLS — intentional mode, palette and accent controls

The user requested space and stronger house styling for Dark/Light, a visual palette
picker instead of the native select, and more choice through independent accents.
This is a focused continuation of draft PR #2. Public release remains held.

Base: `1701d86d0f05bb125c25c3fdfc1be8e5f2ccbf64`. One implementation stream owns the
coupled UI/state/token surface, with a fresh reviewer and one bounded integration review.
The root handles the shadcn comparison separately; no parity components are added here.

| Owner       | Files / responsibility                                                                                                                                                                                 | Runtime                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| CONTROLS-1  | Theme studio, theme state/CSS, app recipe copy, affected docs styles; local preset/contrast/source-list files; directly affected/new theme unit/browser tests; theme-customization guide and own slice | `../marquee-controls-1`, `s/controls-1`; preview 4214, gate 4215, reviewer 4216 |
| Integration | `next`, STATUS and batch/review records, final source integration, PR and held release                                                                                                                 | fresh detached integration worktree; gate 4182, preview 4183 then stable 4174   |

Depth: orchestrator 1, stream 2, reviewer 3; ceiling 4. Other agents share the filesystem.
Preserve retained worktrees and the existing 4174 build until its replacement passes.
Use Node 22.18.0/pnpm 10.24.0 via `/home/ankit/.nvm/versions/node/v22.18.0/bin`.
Evidence: `/home/ankit/.marquee-scratch/RELEASE-1-CONTROLS/{s1,r5,integration,layer2}/`.

## Contract

- Compact two-position mode control with explicit labels, sun/moon visuals, breathing room,
  clear active state, house borders/depth/focus and 44px targets. Use honest button/radio semantics.
- A visual palette/customization panel using existing primitives where practical. Keep the
  sticky mobile toolbar compact; keyboard open/choose/close returns focus correctly.
- Automatic accent plus 6–8 curated action accent families, independent of four base palettes
  and Dark/Light. Accents repaint actions, links, focus and relevant syntax roles; base palette
  retains surfaces/identity. Color literals belong only in the preset directory.
- Preserve before-paint preferences, valid old settings, malformed/blocked storage fallback,
  expressive styling, source fidelity and exact selected CSS/root correspondence.
- All combinations receive data-driven role contrast checks, plus representative actual browser
  checks for accent independence, syntax, focus, copy and layout at 390/768/1280.
- Reproduce the actual touching-controls/native-picker baseline, then behavior-first changes.
  Show an early useful UI preview before review records or full gates. Commit before bounded
  independent negative controls; one reviewed stream full gate and one merged full gate.

No new package exports/version, merge, deployment, Pages activation, domain or npm operation.
Finish with stable localhost, concise records, updated draft PR and final-head hosted CI.

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

## Result — 2026-10-08

The baseline browser measured a 0px mode-button gap and one native select. The replacement
has a 74px mobile toolbar, inset sun/moon controls and a composed Sheet with visual base
palettes and Automatic/Lime/Mint/Cyan/Blue/Violet/Pink/Amber action choices. All 64
base × mode × accent combinations pass the data-driven role checks. Old preferences upgrade
to Automatic without losing palette, mode or expressive state; CSS copying stays exact.

Independent review closed two concrete defects before the single stream gate: a Light-mode
row focus outline measured 1.125:1 and now uses readable action ink (7.626:1); a selector
regression briefly painted unselected ticks and is now proved selected-only. No findings
remain. [Stream evidence and negative controls](../slices/CONTROLS-1.md).

Stream gate: exit 0 in 81s at `1debecb3a16cf6fe0808a8128af2c58f1ebf4307`.
Merged `DOCS_PORT=4182 pnpm verify`: exit 0 in 80s at
`f020c59b31e7c7d5691ee7c772e2ac4a314ce53a`: **708 library tests, 39 docs unit tests,
5 consumer checks and 63 browser cases** across 390/768/1280. Registry unchanged.
Later commits contain records only. [Focused integration review](RELEASE-1-CONTROLS-review.md)
found zero HIGH/MEDIUM/LOW issues across eight representative combinations covering every
base, mode and accent setting; actual syntax, action roles, recipe/root/clipboard agreement,
storage and short-phone keyboard behavior passed.

The gated build serves **http://localhost:4174/marquee-ui/** from
`/home/ankit/Code/marquee-integration-controls/apps/docs/dist`, detached node PID 902665.
Served index SHA256 matches the built file:
`91b535599ad2cb94cdb2adf0edfbffd40f757ddf9e3c706426f1d0b4113976af`.

- [Light visual picker](RELEASE-1-CONTROLS-evidence/desktop-light-picker.png)
- [Independent accent, live component and highlighted source](RELEASE-1-CONTROLS-evidence/desktop-light-accent-code.png)
- [Mobile controls](RELEASE-1-CONTROLS-evidence/mobile-controls.png) and [highlighted source](RELEASE-1-CONTROLS-evidence/mobile-accent-code.png)
- [Final option selected and focused through Tab/ArrowRight](RELEASE-1-CONTROLS-evidence/mobile-last-accent-focus.png), fully above Done at 390×664

Final-head hosted CI and process details are recorded in
`/home/ankit/.marquee-scratch/RELEASE-1-CONTROLS/integration/final-handoff.md`.
Draft PR #2 stays unmerged. No package release, Pages activation, deployment or domain action.
The root's shadcn comparison was read-only; this revision adds no parity components.

Retro: narrow selector changes need actual selected/unselected rendering checks, and keyboard
focus evidence must use keyboard modality. Those assertions now run in the normal browser gate.
Next is localhost review and user direction, with publication held and preview trees retained.

# Marquee release status

CURSOR: RELEASE-1-CONTROLS — requested visual controls and independent accents; public release held

The user authorized a bounded release-readiness batch, then requested localhost review
before publication and a focused theme/code revision. Do not activate Pages, merge the
release PR, deploy publicly, purchase a domain or publish npm packages until directed onward.

- [x] [CONSUMER-1](docs/slices/CONSUMER-1.md): clean published-package consumer, canonical
      installation guide, supported stack, independent review and full gate.
- [x] [DOCS-1](docs/slices/DOCS-1.md): live documentation and all 21 component families.
- [x] [THEME-1](docs/slices/THEME-1.md): four palettes, separate dark/light controls,
      persistent preferences, visible expressive styling and selected CSS recipes.
- [x] [CODE-1](docs/slices/CODE-1.md): safe language-aware highlighting, exact source
      copying and richer code/prose presentation.
- [x] Independent stream reviews and merged verification: 652 library tests, 35 docs
      unit tests, 5 consumer checks and 51 browser cases across 390/768/1280.
- [ ] User direction after reviewing localhost, then approved public release operations.

Built preview: **http://localhost:4174/marquee-ui/**. The immutable source is
`5df4a7980b2b25d9d06f7f954844eb3b032f78eb`; later commits record review evidence only.
The server runs from `/home/ankit/Code/marquee-integration-ux/apps/docs/dist`.
The combined studio and source are easy to inspect at `#components`; selected CSS is
at `#theme-recipe`. [Screenshots and batch record](docs/batches/RELEASE-1-UX.md).

Current revision: [RELEASE-1-CONTROLS](docs/batches/RELEASE-1-CONTROLS.md) replaces touching
mode buttons and the native picker, and adds independent curated action accents. Preserve
the current 4174 candidate until its verified replacement is ready.

- [ ] CONTROLS-1 implementation, independent review and full gate.
- [ ] Focused integration review, merged gate, refreshed localhost and final-head CI.

Next: show the revised controls on localhost. Draft
[PR #2](https://github.com/marquee-ui/marquee-ui/pull/2) remains open and unmerged.
`marquee-ui.dev` is not owned; the prepared default Pages destination needs no domain.
Electric, Clementine and Tide are local demo customizations, not npm 0.1.0 preset exports.

## Cold resume

Inspect Git status/worktrees, this file, the two current slice records and the batch review.
Final local evidence is `/home/ankit/.marquee-scratch/RELEASE-1-UX/integration/`:
`verify.exit` is 0; `source-sha` identifies the exact built source; `final-handoff.md`
records the serving process and final pushed-head CI conclusions. Earlier clean npm proof
remains under `/home/ankit/.marquee-scratch/RELEASE-1/`. No library version changed.
The main-only Pages workflow stays held by leaving the PR unmerged. No product backlog advanced.

## Session log

| Date       | Batch        | Result                                                                   |
| ---------- | ------------ | ------------------------------------------------------------------------ |
| 2026-10-08 | RELEASE-1    | Local release candidate verified; publication held for user review.      |
| 2026-10-08 | RELEASE-1-UX | Requested live themes and highlighted source verified; publication held. |

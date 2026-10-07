# Marquee release status

CURSOR: RELEASE-1-UX — requested theme and code-presentation revision; public release held

The user authorized a bounded release-readiness batch and then asked to see localhost
before publication. The first candidate is verified; the user requested the focused revision below. Do not activate Pages,
merge the release PR, deploy publicly, or purchase a domain until the user directs onward.

- [x] [CONSUMER-1](docs/slices/CONSUMER-1.md): clean published-package consumer, canonical
      installation guide, supported stack, independent review and full gate.
- [x] [DOCS-1](docs/slices/DOCS-1.md): live documentation, all 21 component families, exact
      copyable examples, nested Storybook, independent review and full gate.
- [x] Merged verification: 643 library tests, 6 docs unit tests, 5 consumer-script tests,
      and 12 responsive browser journeys; fresh published consumer adds 2 browser cases.
- [ ] User direction after reviewing localhost, then approved public release operations.

Local production preview: **http://localhost:4174/marquee-ui/**. It was built from
`3d8d7b2b1423f93e6834af224b850010f7907001`; later integration commits record evidence only.
The server runs from this checkout's `apps/docs/dist`. Development preview 4176 remains
available in the DOCS-1 worktree. [Screenshots and batch record](docs/batches/RELEASE-1.md).

## Requested revision

The user found that “Make it expressive” only moves its own switch, expected palette and
light/dark choices, and requested theme-aware syntax highlighting and richer code/prose.
[RELEASE-1-UX](docs/batches/RELEASE-1-UX.md) is a bounded continuation on the same draft
PR #2. Preserve the existing 4174 preview until its verified replacement is ready.

- [ ] THEME-1: persistent, accessible mode/palette controls and real expressive styling.
- [ ] CODE-1: language-aware highlighted code and stronger prose/code presentation.
- [ ] Independent reviews, merged behavioral checks, final CI and refreshed localhost.

Next: show an early interactive theme preview, finish these two slices and update draft
[PR #2](https://github.com/marquee-ui/marquee-ui/pull/2). Publication remains held. `marquee-ui.dev` is not owned; no custom domain is configured or required for that URL.

## Cold resume

Inspect Git status/worktrees, this file and the two slice records. The durable run evidence
is `/home/ankit/.marquee-scratch/RELEASE-1/`; `integration/final-verify.exit` is 0 and the
captured source SHA is `integration/final-source-sha`. The prepared Pages workflow runs only
on main, so keep this release unmerged until the hold is lifted. No product backlog advanced.

## Session log

| Date       | Batch     | Result                                                                     |
| ---------- | --------- | -------------------------------------------------------------------------- |
| 2026-10-08 | RELEASE-1 | Local release candidate verified; public publication held for user review. |

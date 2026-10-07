# RELEASE-1 — prove the public install and publish the docs

Authorized scope: a clean published-package install and working browser build, accurate
public quickstart and limitations, live component examples, hosted docs, and green CI.
The existing Arcade visual language is the design direction. No paid provisioning,
domain purchase, npm release, or changes to the consuming product are included.

## Ownership and runtime

Integration owner: orchestrator, depth 1, `/home/ankit/Code/marquee-ui` on `next`.
Streams are depth 2, their reviewers depth 3; maximum helper depth is 4.
All agents share the filesystem and must preserve other agents' work. Source and mutation
work use separate worktrees. No database or external product stack is involved.

| Slice       | Branch / worktree                       | Owns                                                                                                                                                            | Consumes                                                         |
| ----------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| CONSUMER-1  | `s/consumer-1`, `../marquee-consumer-1` | README, `docs/getting-started.md`, `docs/supported-stack.md`, `examples/consumer/**`, `scripts/verify-consumer.mjs`, own slice doc                              | published UI 0.1.10 and tokens 0.1.0, registry, documented stack |
| DOCS-1      | `s/docs-1`, `../marquee-docs-1`         | `apps/docs/**`, root package/workspace/lock/config wiring, `.github/workflows/**`, `.storybook/**`, `packages/ui/test/storybook-preview.test.ts`, own slice doc | current Marquee source/tokens; consumer quickstart contract      |
| Integration | `next`                                  | STATUS, batch record, cross-stream repairs by agreement, hosting settings and PR                                                                                | both reviewed streams                                            |

Use `PATH=/home/ankit/.nvm/versions/node/v22.18.0/bin:$PATH` for Node 22.18.0
and pnpm 10.24.0. Durable scratch: `/home/ankit/.marquee-scratch/RELEASE-1/`,
with `s1/`, `s2/`, `r5/`, `r6/`, `layer2/`, and `integration/` subdirectories.
Web ports: consumer 4175, docs 4176, review 4179/4180, integration 4174.

## Gates and shipping

Each stream commits, obtains independent layer-1 review in a detached worktree, closes
findings, then runs Marquee's full `pnpm verify` and pushes its branch. Reviewers report
mutation evidence for every touched test file; all probes stay in their own trees.
The orchestrator merges streams, commissions one read-only layer-2 cross-review, runs
`pnpm verify`, checks committed registry stability, repeats the clean published consumer
proof and verifies the site in Chromium at 390, 768 and 1280px with keyboard and interactive
checks. Capture responsive screenshots at the reviewed head. No Pile-specific gate applies.

One PR from `next` to `main`, with layer 2's DECISIONS, one section per stream, validation,
and exact proposed Prod ops. **User hold: localhost review before publication.** Prepare
the PR and green CI, but do not merge or activate hosting until the user directs onward.
When released, preserve persistent `next`, verify the deployed effect, merge main back
into next, and clean only this batch's safe worktrees.

Hosting investigation on 2026-10-08: GitHub API reports admin permission, public repository,
`has_pages: false`; Pages GET returns 404. The available default destination is
`https://marquee-ui.github.io/marquee-ui/`. The user confirmed on 2026-10-08 that `marquee-ui.dev` is not yet owned and asked
to see localhost first. No public publication, Pages activation, production deployment,
or PR merge occurs until the user reviews localhost and directs onward. Prepare the
reviewable site and PR independently; do not buy or register a domain.

## Cold resume

Read STATUS and these two small slice docs, inspect worktrees/branches, then the run
sentinels and logs in durable scratch. Never infer a gate result from filtered output.
Baseline source: `e6533179dffb34827d0cf0967935c4da38b9a31b`.

## Contracts and measured baseline

- The site renders the consumer-owned getting-started and supported-stack Markdown via
  Vite raw imports. Installation prose has one canonical owner.
- Consumer script tests use Node's test runner (`scripts/verify-consumer.test.mjs`) and
  join the root test chain. Cold npm/browser proof stays an explicit command because it
  installs public dependencies and should not be implicit in every package gate.
- Storybook currently hardcodes root `/tokens/` URLs in its fonts and light-preset link.
  DOCS-1 owns their subpath correction and the one existing test asserting the old URL;
  actual browser font/preset requests must confirm the prepared hosted bundle.
- Baseline `pnpm verify` at `e6533179dffb34827d0cf0967935c4da38b9a31b` exited 0:
  36 test files and 645 tests passed. Runner log and exit sentinel are in `baseline/`.

## Reviews, verification, decisions and retro

Pending implementation.

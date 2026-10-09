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

## Reviews and final verification

Both streams are complete. CONSUMER-1's initial reviewer closed two MEDIUM test gaps
and one LOW Node version discrepancy; DOCS-1's reviewer closed one MEDIUM preview-test
gap. The verbatim mutation tables and exact runner results are in their slice documents.
The batch-wide review is preserved in [RELEASE-1-review.md](RELEASE-1-review.md).

The final integrated product source is `3d8d7b2b1423f93e6834af224b850010f7907001`.
On 2026-10-08 IST, `DOCS_PORT=4182 pnpm verify` ran 02:01:30–02:02:02 and exited 0:
**36 library files / 643 tests, 3 docs files / 6 tests, 5 Node consumer tests, and
12 browser journeys at 390/768/1280px**. `git diff --exit-code -- packages/ui/r` also
exited 0. The 645-to-643 library delta replaces four copied-font parser/declaration
checks with two generated-sheet/subpath guards; the real font behavior has browser coverage.
Logs and sentinels are under `integration/final-verify.*`.

The merged-tree command
`CONSUMER_PORT=4181 CONSUMER_REGISTRY_PORT=4191 node scripts/verify-consumer.mjs <new external directory>`
also exited 0: a fresh npm cache, published UI 0.1.10 and tokens 0.1.0, exact registry
source and provenance checks, production build, and 2 Chromium tests passed (3.8s).
Evidence is under `integration/cold-consumer/proof/`. Earlier independent runs also
proved the simpler GitHub namespace recipe. No package source, version, or registry changed.

The initial cross-review found one MEDIUM skip-link contrast defect. A high-specificity
anchor reset overrode its intended foreground. The owner lowered only the reset specificity,
added first-Tab focus/visibility/contrast/navigation assertions, and an independent reviewer
reapplied the exact old selector: three failures at 1.018:1; restored source passed at
17.54:1 on all three widths. The subsequent full gates are green; the original finding
and final independent closure remain in the review record.

## Local review artifacts

The stable production preview is **http://localhost:4174/marquee-ui/**, serving the final
source above. Its detached server log/PID record is `integration/preview.{log,pid}`;
the listening Node process was PID 627091 when verified. The earlier development preview
on 4176 remains available. No Page, deployment, CNAME or domain purchase was activated.

Captured from the final built preview after the contrast correction:

- [Desktop hero](RELEASE-1-evidence/hero-desktop.png)
- [Mobile hero](RELEASE-1-evidence/hero-mobile.png)
- [Live Card and its copyable source](RELEASE-1-evidence/component-desktop.png)

The durable scratch also includes tablet screenshots, component screenshots at all three
widths, and browser evidence: HTTP 200, all three font faces loaded, document width equal
to the viewport, and the focused skip link using dark ink over the primary fill.

## Proposed production operations — held

Only after the user directs onward:

1. Enable this repository's GitHub Pages with GitHub Actions as the build source, using
   the free default `https://marquee-ui.github.io/marquee-ui/` URL; no custom domain.
2. With the reviewed PR's CI green, merge it without deleting persistent `next`.
3. Watch the main-only documentation workflow build, verify and deploy its Pages artifact.
4. Verify the public page, fonts, all component/Storybook paths and the Light preset by
   their served effect; record the deployed SHA and URL. Merge main back into next.

The present task has performed none of these operations. No npm release is necessary.

## Retro

- An initial font-availability check could pass while the stylesheet URL returned HTML.
  Real FontFace loading and font response checks now guard the built site; the duplicated
  base-path issue was corrected before release.
- A generic anchor reset overrode role colors on primary links, then escaped the first
  repair through the skip link. Rendered contrast/focus checks now cover both paths, and
  the reset has zero specificity instead of overriding component styling.
- The original live-preview browser assertion accepted placeholder content. Independent
  review forced per-family evidence and actual Sheet/Toast interaction checks.
- Consumer tests originally checked only a registry filename parser and only an accordion's
  open state. Real HTTP responses and both closed/open transitions now reject the exact
  collapse mutations that exposed those omissions.
- Two initial browser reds were instrument errors: live text also appeared in a code block,
  and the headless context lacked clipboard permission. The checks now scope to the live
  preview and read back exact clipboard contents; product failure feedback remains tested.

These fixes are local and mechanical. No new standing process rules or unrelated audits
were added, and public deployment remains deliberately pending the user's local review.

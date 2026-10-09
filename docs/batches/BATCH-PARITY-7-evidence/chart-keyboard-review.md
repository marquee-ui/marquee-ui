# Chart merged-review native scroll and modal closure

Verdict: CLOSED at exact committed `b4d16db96ea4884f7e1a22632c7945c3a42b2d3e`, 2026-10-08. All requested source controls are proved at the expected assertions, the two newly found key-exclusion gaps are closed, and the owned detached reviewer tree is clean. Ready for the stream record and its authorized full gate. This reviewer ran focused checks and browser builds only; no full gate, source-stream edit, commit, push or public operation.

Owned checkout: `/home/ankit/.marquee-scratch/BATCH-PARITY-7/r6/worktree`. Runtime: Node 22.18.0 at `/home/ankit/.nvm/versions/node/v22.18.0/bin`, pnpm 10.24.0. Frozen install exit 0. Evidence stays in this r6 directory; all previous reports and mutation evidence remain unchanged. Initial arrow review at `f485d810ff2f64019d67e24471416d066d0649b2` is recorded separately in `scroll-unit-review.md`. Its pending explicit-ref recipe plan is historical: the landed final recipe uses native Tab and caller-owned Line/tooltip composition.

## Source and evidence assessment

`packages/ui/src/chart.tsx:38-56` calls caller `onKeyDown` first, and cancels only an uncanceled Left/Right event whose direct target is the actually focused `svg.recharts-surface[role="application"]`, owned by the nearest ChartContainer matching currentTarget. It does not stop propagation. The functional handler did not change between the initial eight-control review and the final key/recipe commit. Its comments now document native scroll suppression and the modal tooltip lifetime option; generated `r/chart` was refreshed at the final head. The default measurable height, native props/refs and direct real Recharts Tooltip/Legend aliases remain intact.

`packages/ui/test/chart.test.tsx:91` uses a real fixed-size Recharts renderer and actual cancelable events, checks both directions and concise point data, and records caller/ancestor event order. Boundary fixtures isolate Slot ordering, cancellation, direct target, focus and nested ownership. They do not pretend jsdom measures scrolling or paint. The only event spy verifies native preventDefault is not repeated after caller cancellation.

The initial nonnavigation table omitted Tab/Escape. Independently adding either key to library interception survived all 13 tests at f485. The stream retained both cases at `packages/ui/test/chart.test.tsx:203`; identical expansion controls now fail the named Tab/Escape cases at the final head. This gap is closed, while the original green survivor logs remain preserved.

`packages/ui/stories/chart.stories.tsx:346` composes the existing Dialog and a wider native TableContainer/Table. It supplies Line primitives with `activeDot={false}` and an explicit tooltip content slot. The existing helper keeps `cursor={false}` at line 74. The modal render function at line 367 always returns one ChartTooltipContent host with one nonempty template-string Text child; Recharts hides inactive content. There is no Tab handler, Dialog change, scripted focus or scripted scroll repair in the caller recipe.

`apps/docs/browser/chart.spec.ts:344` uses real region arrows to bring the whole SVG into view before native Tab, six point steps with unchanged ancestor scroll and fully visible SVG/ring, then forward/reverse Tab, another point sequence, a native Tab cycle, Close Enter, reopen and Escape with trigger focus recovery. The test waits after native scrolling and after Tab so the assertions observe settled behavior. It checks inactive live status is hidden and the active point content is a single Text node. These are real renderer and CSS assertions.

All three new modal screenshots from `scroll-browser-baseline/.../chart-dialog-native-scroll.png` were inspected at 390, 768 and 1280. The SVG and ring fit the scrolled table region; both series are visually distinct; concise point content, labeled legend, complete native data table and Close control are visible. The adjacent table cells intentionally remain horizontally clipped by the native overflow region. Native navigation assertions run against real CSS. This review does not claim universal compatibility of arbitrary Recharts modal compositions, other renderer types or non-Chromium engines, and does not claim a complete DOM-removal count from these browser assertions.

## Commands and mutation discipline

Focused unit command:

```
PATH=/home/ankit/.nvm/versions/node/v22.18.0/bin:$PATH pnpm exec vitest run --project ui packages/ui/test/chart.test.tsx
```

Final browser build sequence, fresh for the baseline and for each mutated/restored source:

```
pnpm --filter @marquee-ui/tokens build
pnpm --filter @marquee-ui/docs build
pnpm build:storybook
pnpm build:site
```

Tokens were built once before browser work (unchanged throughout); docs, Storybook and site assembly were rebuilt separately before every mutated and every restored browser run. Every build exit was 0. `DOCS_PORT=4196`; Playwright starts its own production preview with reuse disabled. `DOCS_BROWSER_OUTPUT` was a separate named scratch directory for every observation.

Committed browser red command, all three configured widths:

```
pnpm --filter @marquee-ui/docs test:browser chart.spec.ts -g 'Chart keyboard tooltip'
```

Each restored browser command executes the complete five-case Chart spec over all three widths:

```
pnpm --filter @marquee-ui/docs test:browser chart.spec.ts
```

Each mutation's prediction was written before mutation. The actual landed diff was saved and read. Runner exits, summaries and named assertion messages were read. Source was restored from the exact committed head, verified byte-for-byte, rebuilt, and rerun green. No assertions in the committed proof were edited. Drivers are `run-scroll-unit-mutations.py`, `run-scroll-key-closures.py` and `run-scroll-browser-closures.py`, all exit 0.

## Final key and browser controls

Each prefix has `.prediction.txt`, `.landed.diff`, runner `.log/.exit` files. Browser prefixes also have independent `.build-red-*` / `.build-restored-*` logs/exits and red/restored screenshot/trace directories.

| Control prefix                                          | Landed subject mutation                                                                                              | Predicted and actual failure                                                                                                                                                                       | Runner red                   | Restored                                   |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------ |
| `scroll-u11-tab-closure`                                | Add Tab to Left/Right interception predicate                                                                         | `keeps Tab defaults on the accessible chart`, `chart.test.tsx:216`: expected defaultPrevented false, received true                                                                                 | exit 1, 1 failed / 14 passed | exit 0, all 15 passed                      |
| `scroll-u12-escape-closure`                             | Add Escape to interception predicate                                                                                 | `keeps Escape defaults on the accessible chart`, same assertion: expected false, received true                                                                                                     | exit 1, 1 failed / 14 passed | exit 0, all 15 passed                      |
| `scroll-b01-old-policy`                                 | Replace library handler with `onKeyDown={onKeyDown}`, preserving caller forwarding                                   | `ArrowRight navigates points without scrolling the native ancestor`, `chart.spec.ts:417`: +40px drift at every width, mobile 320→360, tablet/desktop 160→200                                       | exit 1, all 3 failed         | fresh build exit 0, all 15 passed, 33.3s   |
| `scroll-b02-active-dots`                                | Remove both modal activeDot=false props; other recipe properties retained                                            | `forward Tab leaves the chart for the real Close control`, `chart.spec.ts:444`: expected Close focused, received inactive at each width; six point steps and scroll assertions reached first       | exit 1, all 3 failed         | fresh build exit 0, all 15 passed, 33.7s   |
| `scroll-b03-cursor`                                     | Change helper cursor=false to cursor=true; active dots/content properties retained                                   | Same named native Close transition assertion and actual inactive Close at each width                                                                                                               | exit 1, all 3 failed         | fresh build exit 0, all 15 passed, 33.3s   |
| `scroll-b04-conditional-host`                           | Return content only for active point, preserving the single template-string Text child and other renderer properties | Committed test first rejects `modal tooltip content remains mounted when inactive`, `chart.spec.ts:357`: expected count 1, received 0 at each width                                                | exit 1, all 3 failed         | fresh build exit 0, all 15 passed, 33.4s   |
| Same `scroll-b04` mutation, independent Tab observation | Same source mutation, unchanged after preceding committed red                                                        | Copied real-keyboard modal case, omitting only initial host-count assertion, rejects exact `forward Tab leaves the chart for the real Close control`, probe line 232: Close inactive at each width | probe exit 1, all 3 failed   | restored probe exit 0, all 3 passed, 18.2s |

The conditional-host early property red is not presented as a Tab-transition red. The separate real-keyboard probe proves that effect. Its saved source is `scroll-modal-tab-probe.spec.ts`; `scroll-modal-tab-probe.delta.diff` shows only the test title rename and removal of the initial host-count precondition relative to the committed modal case. It retains inactive visibility/status, geometry, all actual key presses and point assertions, scroll/clipping/focus assertions, single active Text node, Close transition and dismissal checks. The probe was copied into only the reviewer tree for its runs, then removed. The committed `chart.spec.ts` stayed byte-identical. One mutated source case is counted once, despite these two observations.

## Counts, survivors and final state

This supplement contains 16 landed subject-mutation executions: ten at f485 (eight expected reds and two honest Tab/Escape survivors), two key closures at b4, and four browser controls at b4. The two new survivors are now closed by exact named reds. All six final-head controls failed at their predicted property, and every restoration was green. The eight initial requested controls remain documented individually in `scroll-unit-review.md` with their predicted/actual assertions and all-13 restoration counts.

Adding these 16 executions to the previously reported 29 gives 45 landed subject-mutation executions in this reviewer evidence collection. The marker t06 regression-input probe remains separately counted. The copied modal Tab case is an additional observation of b04, not an extra source mutation or a newly committed test surface. Prior runner ceilings remain as recorded in `review-final.md`; this closure does not erase them or claim that a focused run is the full gate.

Fresh final-head browser baseline: exit 0, all 15 passed, 33.6s. Final unit verification after all browser restorations: `scroll-unit-final-restored.log/.exit`, exit 0, all 15 passed at 22:58:49 IST, duration 882ms. Final driver exit 0. Final `git rev-parse HEAD`: `b4d16db96ea4884f7e1a22632c7945c3a42b2d3e`; final `git status --porcelain`: empty. No open finding remains in this bounded native-scroll/modal closure.

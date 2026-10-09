# BATCH-PARITY-5 merged review

## DECISIONS

1. Ship Combobox as a composed cmdk/Radix single-select searchable popup. [V]
   Why: this preserves the existing overlay stack and keeps active navigation separate from caller-owned committed values; editable input, chips/multiple selection, object collections, virtualization and current-shadcn Base UI API parity remain deferred.
2. Expose the supported primitive hosts and cmdk label associations, with `asChild` omitted from Command, List and Group. [V]
   Why: cmdk 1.1.1's native container replacement path was measured to crash; supported input/item/empty/separator and Popover hosts remain available, while `Command.label` and `List.label` preserve the primitive's own accessible IDs.
3. Preserve DayPicker 10's typed single/multiple/range contracts and replaceable parts, including its measured selection-bound behavior. [V]
   Why: reimplementing maximum/minimum handling would change the primitive contract; callers retain selection, month, labels, formatting, announcements and reset ownership. Popup DatePicker, time selection, alternate calendars and exhaustive locale/timezone proof remain deferred.
4. Preserve Calendar's intrinsic minimum and require callers to allocate at least 328px for its default seven 44px columns, padding and border. [V]
   Why: shrinking the painted root hid grid overflow. The docs grant sufficient mobile space; the measured 390px overlay compositions use `DialogContent` with `p-3` and `PopoverContent` with `w-auto p-2`. Week numbers and replacement parts can require more width.
5. Use role-based muted Calendar selection fill, framed endpoints and a forced-colors underline. [V]
   Why: selection remains distinguishable while focused dates retain contrasting exterior paint beside selected neighbors; the forced-colors indication survives removal of the normal fill.
6. Keep native form transport explicit in callers, and exempt only real `input[type=hidden]` transports from the shared 44px control check. [V]
   Why: cmdk active navigation is not committed form state, Calendar supplies no implicit date input, and a native hidden transport has no interactive target to measure.

## Verdict

**PASS on final product source `4123edc5db43e891e207369ad2d52db753bb8b25`.**
No new HIGH, MEDIUM or LOW product/integration finding remains. No REASONED blocker is being presented as a proved defect.

The independent runtime runner exited **0: 12 passed / 0 failed**. A bounded follow-up prompted by visual inspection exited **0: 3 passed / 0 failed**, proving access to the Calendar Popover's below-fold Close control. The known Calendar geometry defect and its closure were already owned by the coordinator and Calendar stream; this review independently verified the corrected composition and does not claim that discovery.

## Review scope and provenance

- Date: 2026-10-08. Requested base: `b0ec909400aef7891adde096cc5ff415e2634ffb`; original combined snapshot: `5929d9325d571d6afc42b27d9a9671621af7b9e5`; corrected snapshot: `4123edc5db43e891e207369ad2d52db753bb8b25`.
- Read the shared layer-2 role and native-tool guidance, then the detached Marquee checkout's own `AGENTS.md`. The checkout remained clean. No source writes, fixes, build, gate, database, Steam, shots, publication or sidebar task was performed by this review.
- Read the union of `## Consumers` in `COMBOBOX-1.md` and `CALENDAR-1.md`, the product source/examples/stories, the existing Dialog/Popover/Sheet and explorer consumers, and the changed shared guards. Per-stream tests were not subjected to another wholesale layer-1 review.
- The final correction adds the intrinsic minimum, width documentation/example note and bounded geometry assertions. Combobox, the dependency graph, token presets and ThemeStudio implementation are unchanged from the source pass. The pre-existing 64-combination theme proof remains part of the coordinator's full gate; the independent browser sample below does not claim to replace that proof.
- Runtime targets: immutable docs `http://127.0.0.1:4188/marquee-ui/`; packed external consumer `http://127.0.0.1:4198/`, rooted at `/home/ankit/.marquee-scratch/BATCH-PARITY-5/consumer-final`. The coordinator verified all 112 served docs files against the gate build and immutable snapshot.
- The external installed token/UI packages are real directories, not workspace symlinks. Independently compared both new package-registry sources and both copied consumer sources with the reviewed checkout: all four match byte for byte. Calendar SHA-256: `df4404caf6aa26a6c6028232d0f2a8832b88a0074ef6543caf005075e2435521`; Combobox: `08f0f84628b18e7931010babfbd1eaccdef45693cc2188b6178ee69b66c428ea`.
- The installed consumer lock resolves one copy each of Dialog 1.2.0, Popover 1.2.0, DismissableLayer 1.1.20 and FocusScope 1.2.0, alongside cmdk 1.1.1 and DayPicker 10.0.2. Their composed runtime was exercised, not inferred solely from compatible ranges.

## Computed shared surface and consumer reconciliation

Computed the stream intersection from Git, rather than accepting a supplied list. Their common composition base is `be5a16344c9a178a40183c9ed57250a1b8cc914e`. Sixteen paths overlap after that base:

```text
AGENTS.md
README.md
apps/docs/browser/site.spec.ts
apps/docs/src/catalog.ts
apps/docs/test/explorer.test.tsx
docs/batches/BATCH-PARITY-5.md
packages/tokens/test/helpers/source-files.ts
packages/ui/package.json
packages/ui/r/registry.json
packages/ui/src/index.ts
packages/ui/test/focus-outline.test.tsx
packages/ui/test/helpers/story-suites.ts
packages/ui/test/registry.test.ts
packages/ui/test/stories.test.tsx
pnpm-lock.yaml
registry.json
```

The requested earlier base additionally includes inherited composition/session records; session-log contents were not opened. The relevant union is the package entry point, dependency/registry metadata, copied sources, source/story inventories, story counts, docs catalog/examples/copy/workbench links, shared tap/focus guards, and the existing overlay stack. No second slice owns an unclaimed part of either new family contract.

The root and generated registry index agree at **32 items / 31 families**. The new source bytes and dependency lists agree with their generated items. The live immutable Storybook index independently reports **196 stories**, including all **10 Combobox** and **5 Calendar** entries. Shared source declarations account for **166 plays**. There is no missing export, duplicate family, missing new story route, registry/source drift or duplicate overlay context in the reviewed surface.

## Independent runtime evidence — PROVED

Command, using Node 22.18.0 and the existing Playwright toolchain:

```sh
/home/ankit/.nvm/versions/node/v22.18.0/bin/node /home/ankit/.marquee-scratch/BATCH-PARITY-5/layer2/independent-browser.mjs http://127.0.0.1:4198/ http://127.0.0.1:4188/marquee-ui/ 4123edc5db43e891e207369ad2d52db753bb8b25
```

Runner output: `Independent review: 12 passed / 0 failed; 12 matrix cases.` Exit **0**.

The matrix crosses **390×844, 768×1024 and 1280×900** with dark Arcade, light Clementine, dark Electric/violet and forced-colors light Tide/blue. Role declarations were read from the running docs theme implementation and applied to the independently packed consumer; docs CSS was not imported into the consumer.

Every case exercised:

- Resolved Dialog description, command search name, result-list name and Calendar grid/day names.
- Combobox search and active-descendant movement without changing the caller's committed hidden value; Escape cancellation; fresh search on reopen; disabled-option refusal; keyboard commit; explicit form submission and reset.
- Calendar and Combobox together inside the actual modal Dialog. Day keyboard movement and selection, physical Saturday selection and independent date/form state all survived nested popup open/close.
- Both root/grid/content containment and absence of horizontal scroll, rather than merely viewport bounds. The mobile Dialog grants **330px** and its Calendar root measures **330px**. Saturday measures **44×44px** with all **nine** edge/center/corner hit samples successful.
- The actual Calendar Popover, including next/previous-month keyboard operation, selection, Escape and focus return. A direct transition from an open Calendar Popover to the combined Dialog, then into and out of its Combobox, leaves no stale layer.
- Parent preservation, reopen state, focus restoration, complete body scroll-lock release, zero remaining Radix focus guards, restored background click behavior and no page errors.
- Solid outlines of at least **2px**, effective ancestor visibility/opacity, viewport and clipping bounds, and alpha-composited text/exterior contrast. Across the measured controls, the minimum text ratio is **12.0209:1** and minimum exterior outline ratio **7.0665:1**. Forced-colors outline alpha **0.8** is composited, not incorrectly treated as opaque.

Full-page canvases and bounded overlay frames were captured for every case. Opened representative complete mobile/desktop canvases and mobile dark/light/accent/forced-color plus tablet/desktop frames. Calendar grids, day numbers, selected/focus paint and the Dialog's bottom action are visible and contained.

Visual inspection showed that the bounded Calendar Popover can put its Close control below its initial scroll viewport. A specific follow-up scrolled to that control, measured its real **44px height** and five exposed hit points, clicked it and verified focus return and zero guards at all three widths. Output: `Below-fold close: 3 passed / 0 failed.` Exit **0**. Opened the resulting mobile bottom-of-panel capture; the control is fully visible and reachable.

## Retained failed review attempt

The first independent matrix stopped at the unchanged Dialog trigger in all 12 cases. Its helper sampled square-box corners 2px from each edge, outside the trigger's actual **10px rounded shape**. Same-build inspection identified the surrounding section at those rounded-off pixels and the trigger at every edge midpoint. This was an instrument defect, not a product failure.

The corrected helper samples the four edge midpoints and center for rounded controls, retaining all four near-corner samples for square Calendar controls. The complete matrix then passed without a product, fixture or served-build change. Original log, JSON and failure canvases are retained under `run-1-corner-instrument/`; they were not discarded or presented as product regression evidence.

## Other evidence and limits

The coordinator reports its merged gate exit **0**, with **916 library / 39 docs / 5 consumer / 258 browser** tests, and the external strict consumer build plus **63/63** browser cases green. Its packed provenance records source `4123edc5`, 18 copied-file comparisons, zero unexpected/skipped/flaky cases and no workspace links. Those are coordinator-owned checks; this review did not rerun or claim ownership of them.

The existing LOW limitation in the shared focus inventory remains: it aggregates by file and cannot alone prove every host's ring. The new families' per-host browser checks complement it; no claim is made that the shared guard became more granular. This is an acknowledged inherited limit, not a new finding or a substitute for the live paint evidence above.

Runtime proof is React 19 / Tailwind 4 / Chromium at the stated widths. The bounded scope decisions above remain real limits. Draft PR2's publication hold is unchanged; this review authorizes no merge, deploy or npm publication.

Durable evidence beside this report: `source-review.json`, `served-story-inventory.json`, `independent-browser.mjs`, `independent-browser.log`, `independent-browser.json`, `below-fold-close.mjs`, `below-fold-close.log`, `below-fold-close.json`, all captures, and the retained original attempt.

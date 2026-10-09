# BATCH-PARITY-7 independent merged review — original head

Reviewed `9dc572f510afcb9580efa71aed07b5358314bdaf` against `eea61a33792c2991b8da4358323e48e6ef2b109f`, 2026-10-08. **HOLD: two independently reproduced P2 composition findings remain open at this head.** Source stayed read-only in `/home/ankit/Code/marquee-merged-review-7`; fixtures and evidence belong only to `/home/ankit/.marquee-scratch/BATCH-PARITY-7/merged-review`. No full gate, commit, push, publication or Pile operation ran.

## DECISIONS

1. Keep DataTable as typed presentation over the caller's TanStack v9 instance and Chart as explicit Recharts v3 composition. Native slots, controlled sorting/filtering and independently plotted row data remain intact. **Verified:** source review, strict typecheck, affected corpus and nine-arm external browser composition.
2. Preserve the two-family shared registration union and all pre-existing registry contracts. **Verified independently:** 35 families, 36 items, 37 source bodies byte-compared, 41 edges, 35 story files, 215 exported stories and 185 explicit plays; all 34 old registry items equal the base. Both new npm dependency sets match actual imports and package ranges. `inventory.mjs` derives these facts from this detached head, not the coordinator's inventory.
3. Retain finite Recharts client classification and exact descendant-marker exceptions. Chart needs its directive; static DataTable does not. Nested caller roots still require utilities, and `recharts-surface` retains its compiled focus selectors. **Verified:** merged seven-suite run; read original and corrected r5/r6 reports, including nested-root correction and independent landed controls. No broader parser project is implied.
4. Require native chart keyboard input to preserve the scrolling boundary when the SVG owns focus. **Finding F1 proved:** current renderer navigation also triggers browser horizontal scrolling. A narrow family surface policy may cancel that native default while preserving renderer dispatch, caller handlers, ordinary inputs and the region's own arrows. Coordinator/stream own implementation and closure.
5. Treat SVG-to-Close focus as an explicit modal composition contract. **Finding F2 proved:** Recharts blur removals and Radix's mutation recovery interrupt the native Tab transition. Do not change the general Dialog or introduce global tabbable scanning based on this review. A synchronous explicit Close-ref Tab adapter was tested and fails. **Bounded alternative verified:** modal active dots off, cursor off, and persistent single-text-node live host preserve real announcements and natural forward/reverse Tab. Coordinator owns adoption and exact-head closure.
6. Leave the documented central story-play no-op limit deferred. **Limit retained:** affected tests passing is not evidence that the global play invocation can reject a no-op. Browser geometry and actual keyboard journeys supplement the host-only focus inventory. No Next certification, shadcn drop-in parity or additional supported stack is claimed.

## Findings

**F1 — P2: focused inline Chart arrows scroll and clip its enclosing DataTable.**

In the independent production fixture at 390px, natural Tab reaches the fully visible Cedar Bar SVG: x 51.25–339.25 inside the TableContainer's x 24–366; scrollLeft is 340. Three paced Right presses correctly announce Feb/Mar/Apr, but also move scrollLeft 380 → 420 → 458. The still-focused SVG ends at x −66.75–221.25: 90.75px of chart and focus boundary are clipped. No helper focuses or scrolls the chart. Installed Recharts' wrapper dispatches `keyDownAction(e.key)` without canceling the browser default; current `ChartContainer` forwards events without a default policy. The screenshot visibly loses Jan, the left plot boundary and part of the legend.

Reproduction: `node scroll-diagnostic.mjs` retains the exact script originally executed as a heredoc; measured output `scroll-diagnostic.json`, diagnostic command exit 0. Capture inspected: `screenshots/390-natural-arrow-diagnostic.png`. The main nine-arm browser matrix records native region arrows before any helper, natural SVG focus, and subsequent scrolling as observations; it does not call those movements green.

**F2 — P2: forward Tab from a Dialog chart misses its visible Close action.**

The row Dialog initially focuses Close; Shift+Tab naturally reaches its measured Line SVG. Forward Tab from that SVG focuses `DialogContent`; the next Tab returns to SVG instead of completing the two-control loop. This occurs in all nine width/theme arms, with Close visible and inside the scope. Escape still dismisses and restores the correct row trigger, including after sorting.

Finite cause proof: capture-phase SVG focusout identifies relatedTarget `dialog-close` while activeElement is temporarily BODY. Recharts removes active-dot groups on blur and, for the normal tooltip callback, the status host. An instrumented native focus call records `MutationObserver.handleMutations` calling focus(DialogContent) before the intended Close focus completes. Tooltip portal ancestry is inside the Dialog. Close at 390px occupies x 42–348, y 860.03–904.03, so the symptom is not an offscreen control or unsettled layout.

`dialog-cause.mjs` runs six combinations twice (12 cases), exit 0:

| Caller active dots | Tooltip content            | Removed nodes | Forward Tab target         |
| ------------------ | -------------------------- | ------------- | -------------------------- |
| on                 | normal / absent / retained | 3 / 2 / 2     | DialogContent in all cases |
| off                | normal                     | 1 status host | DialogContent              |
| off                | absent / retained          | 0 / 0         | Close, naturally           |

The earlier nine tooltip-only controls disprove the initial tooltip-only hypothesis: active dots alone suffice. Their evidence remains `dialog-cause-tooltip.*`; first incorrect prediction remains `dialog-cause-first.*`. Final causal events, removal HTML and focus stacks are in `dialog-cause.json`.

Requested explicit caller control: `tab=adapter` passes `onKeyDown` to ChartContainer, checks the actual focused accessible SVG and plain Tab, cancels default, then calls the explicit adjacent Close ref's `focus()` synchronously. **Actual result: exit 1 at expected Close, received inactive.** `dialog-adapter.mjs` and `.log/.exit` retain this counterexample; it is not an adopted fix.

Requested stable-content control: `tooltip=stable&dots=off` uses modal Line `activeDot={false}`, Tooltip `cursor={false}`, and always returns the same ChartTooltipContent with one nonempty template-string Text child, including an inactive placeholder. Recharts owns the inactive wrapper's `visibility:hidden`; hidden status disappears from accessibility-role queries. **Actual result: all nine width/theme arms pass, exit 0.** Jan 18/12 → Feb 24/20 → Mar 28/16 → Apr 32/24 remains dynamic and exact; native forward Tab, reverse Shift+Tab and looping remain stable after 350ms; Close Enter and Escape both restore the row trigger. The observer records zero removed nodes throughout those readings/focus transitions. `dialog-lifetime.mjs/.json/.log/.exit` and strict typecheck/build exits retain the proof. This external control supports a bounded recipe correction; it does not close the unmodified original source finding.

## Independent validation

Pinned PATH: `/home/ankit/.nvm/versions/node/v22.18.0/bin`; Node 22.18.0 / pnpm 10.24.0. Production fixture imports this detached source directly with `@` alias, emitted tokens, separately emitted self-hosted fonts, React 19, Tailwind 4 and Vite; it has no docs CSS. Port 4197 is exclusive to the review.

- `pnpm install --frozen-lockfile`: exit 0; frozen resolution, 789 packages reused.
- `pnpm --filter @marquee-ui/tokens build`: exit 0; emitted both presets and fonts. `tokens-build.log/.exit`.
- `pnpm typecheck`: exit 0 across root, tokens, UI and docs. `typecheck.log/.exit`.
- `pnpm exec vitest run --project ui packages/ui/test/chart.test.tsx packages/ui/test/data-table.test.tsx packages/ui/test/registry.test.ts packages/ui/test/stories.test.tsx packages/ui/test/focus-outline.test.tsx packages/ui/test/tailwind-compile.test.tsx packages/ui/test/client-boundary.test.ts`: **372 passed, seven files**, exit 0, 7.82s. `merged-ui.log/.exit`.
- `pnpm exec vitest run --project tokens packages/tokens/test/source-coverage.test.ts packages/tokens/test/literal-guard.test.ts packages/tokens/test/brand-guard.test.ts`: **12 passed, three files**, exit 0. `shared-token-guards.log/.exit`.
- `node inventory.mjs`: exit 0; actual AST-export/story and per-source registry/dependency walk. `inventory.json/.log/.exit`.
- Fixture `tsc --noEmit`, Vite production builds: exit 0 after instrument correction. Final controls strict typecheck `fixture-typecheck-controls.log/.exit`; production outputs include the three font assets. Vite's optional devtools resolution and large-chunk notices are recorded build warnings, not runner failures.
- `node browser-proof.mjs`: **nine remaining-contract arms passed**, exit 0. Widths 390/768/1280 × arcade/light/light forced colors. Measures real Bar ratios and both Line series positions for Cedar and Aster, all four live announcements and complete native table values, inset SVG rings and exact month labels, 87×44 action target with inside-edge hit samples and full ring, native region scrolling before helpers, sorting with correct row/plot/Dialog identity, empty colspan 4, and Escape/trigger recovery. `browser-proof.json/.log/.exit`; 27 captures. F1/F2 are explicitly excluded from its remaining-contract verdict.

Screenshots actually inspected: the F1 diagnostic; `390-light-normal-inline`, `768-arcade-normal-inline`, `1280-light-forced-inline`; `390-light-forced-dialog`, `768-light-normal-dialog`, `1280-arcade-normal-dialog`; `390-light-forced-empty` (all under `screenshots/`, `.png`). These show named solid/dashed marks, complete Dialog labels/native values and distinct paint. The mobile inline capture also exposes the retained scroll clipping. The deliberately wide empty table retains its horizontal scroll position; its capture proves the field/semantic state, not fully visible empty text.

Stable-lifetime captures additionally inspected: `390-light-forced-lifetime-focused`, `768-light-normal-lifetime-focused`, `1280-arcade-normal-lifetime-focused`. Actual Apr 32/24 tooltip, focus ring, labels, series and every native value are visible with the proved caller policy.

Instrument corrections retained rather than relabeled as product findings: the first external fixture used a nonexistent v9 `cell.renderCell` and strict typecheck rejected it; changed to `table.FlexRender`. First accessible-name query omitted the rendered whitespace before comma; corrected from observed accessibility snapshot. One-pixel rounded-corner hit samples were outside the rounded control; corrected to eight-pixel inside-edge samples. `browser-proof-first` through `fourth` retain stopped assertions; a short preview outage was resolved by restarting the review's own port. No source edits were used for any correction or causal control.

Primary contract references were read: current shadcn [Data Table](https://ui.shadcn.com/docs/components/data-table), [Chart](https://ui.shadcn.com/docs/components/chart), Recharts [accessibility source](https://raw.githubusercontent.com/recharts/recharts/main/storybook/stories/API/Accessibility.mdx), installed Recharts 3.10.1 wrapper/middleware/Tooltip and Radix FocusScope source. Live TanStack state-page retrieval failed; retained batch reference and installed v9 typings/real rendering support the bounded table contract.

## Limits and next review

This is an independent exact-head merged review, not the merged full gate or fresh packed consumer. No new mutation of repository source was made: r5/r6's retained independent mutation evidence was reviewed; causal controls modify only the disposable fixture. Chromium and the supported Vite stack were exercised. Screen-reader delivery is inferred from DOM live semantics and real keyboard updates, not an actual assistive-technology session. Hold this original head until both composition findings receive separate exact-head closure evidence, then run the coordinator-owned merged gate and packed consumer.

Original review cleanup: verified port 4197's PID 3958748 command and `/proc/.../cwd` both identify this external fixture's Vite preview, then stopped that PID only. Port is clear; detached source remains clean at the reviewed head. Fixture, build outputs and evidence remain for the same reviewer's corrected-head continuation.

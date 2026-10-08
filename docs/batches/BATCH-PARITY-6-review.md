# BATCH-PARITY-6 merged review

## DECISIONS

1. Ship DatePicker as explicit namespaced Calendar/Popover parts; keep selection, formatting, closing and form transport in the caller. [V]
   Why: this preserves the existing primitive contracts and typed selection modes without inventing a DatePicker configuration API or claiming drop-in parity.
2. Keep Table a bare native table, with a separately composed, meaningfully named TableContainer for scrolling. [V]
   Why: native table semantics, refs and caller controls stay intact; `asChild` keeps the corresponding semantic host, and sorting/filtering/data state remain outside this batch.
3. Require the nested DatePicker recipe to choose its initial roving day through `onOpenAutoFocus` when appropriate. [V]
   Why: a parent modal can intercept Calendar's earlier focus effect; the callback runs after the child focus scope registers. The aliases alone do not promise selected-day focus in every overlay.
4. Preserve the Calendar's complete minimum frame and 44px day controls while allowing the popup to scroll vertically. [V]
   Why: a 390px viewport can fit the standard horizontal frame, while available vertical space depends on the trigger and parent layout; real wheel scrolling must expose the final Saturday and Close.

5. Give DatePickerContent its own inset focus outline, preserving caller overrides. [V]
   Why: the naturally focused panel can extend beyond a parent Dialog; drawing the indicator against its opaque panel ground avoids the light-preset scrim contrast failure proved in this review. Other Popover consumers keep their current styles.

FINAL REVIEW VERDICT: no unresolved findings. One MEDIUM PROVED finding was closed by the bounded DatePickerContent repair at integrated 78ef78e3573961418866c2cfd95a5197effdb25f; no HIGH or LOW findings. Reviewed merged b0591423490a74d1bd3376b271edebc50f912c56 against a4be556758fd82807177ddc014a7260227182fc8. Repository was read-only; fixture and reports live only in this scratch directory. No full gate, shots, publication or node_modules mutation ran here.

MEDIUM M1 — PROVED, CLOSED — original packages/ui/src/date-picker.tsx:58, consuming packages/ui/src/popover.tsx:46
Originally, DatePickerContent inherited an outward primary-ink focus outline whose light-preset contrast drops below 3:1 where a popup opened from a table cell extends beyond its parent Dialog onto the scrim.

Concrete failing case: at 390×844, 768×1024 and 1280×900, use the light preset; open a Dialog containing a named, horizontally overflowing TableContainer; reach its final DatePicker trigger using native ArrowRight then Tab; compose Calendar with disabled={true}, hideNavigation and no Close; press Enter. With no enabled focus candidate, Radix naturally focuses the popup panel. The reproduction does not call focus() on the panel and uses the normal fallback contract. Escape still dismisses the inner popup and then the parent.

The panel is the active element, matches :focus-visible, paints solid 2px rgb(74,90,0) at alpha 1, and every ancestor is visible/opaque. Screenshot pixels confirm that exact ink on all four ring sides. Right/bottom exterior samples over the real scrim are only 1.23–1.59:1: 390 right pixel (105,108,96), ratio 1.422; 768 bottom (96,98,86), ratio 1.227; 1280 right (112,116,104), ratio 1.593. The earlier computed unblurred exterior was 1.779:1; the screenshot proof includes actual shadows/backdrop effects. Bright sides over the parent panel exceed 6:1. The problem is the perimeter segment outside the parent, not an absent focus indicator everywhere.

Predicted repair surface: DatePickerContent's own focus offset or a compound ring that does not rely on the scrim color; a local inset outline can use its opaque overlay background. This review did not edit the source.

Original evidence, retained:

- focus-reachability.mjs / .json / .log: natural keyboard-only fallback focus, all three widths, same build.
- captures/*-light-natural-panel.png: actual focused popup screenshots.
- supplement.json: actual ring pixels rgb(74,90,0,255) on each side, independently read back from the screenshots.
- probe.mjs / probe-results.json / probe.log: original complete combined probe. Three dark cases pass; three light cases stop at the predicted panel exterior assertion after the earlier interaction checks pass.
- diagnostic.mjs / .json: first independent simultaneous geometry samples, including native scroll before any locator can reveal the trigger.

Cross-stream surface
Computed from the two final stream heads, whose common ancestor is 07c3f18d3782ab9aea3d45ea986ca356e87632a0. Exactly 13 files overlap after that ancestor: AGENTS.md, README.md, apps/docs/browser/site.spec.ts, apps/docs/src/catalog.ts, apps/docs/test/explorer.test.tsx, packages/tokens/test/helpers/source-files.ts, packages/ui/package.json, packages/ui/r/registry.json, packages/ui/src/index.ts, packages/ui/test/helpers/story-suites.ts, packages/ui/test/registry.test.ts, packages/ui/test/stories.test.tsx, registry.json. Comparing from the batch base adds the three common briefing files. Both Consumers sections, product sources, stories/examples, guide, catalog, exports and shared registration diffs were read together. No disappearing family or registry edge was found.

Independent registry check: root registry equals committed generated registry; all 35 generated file bodies and targets equal their sources; 34 items contain 37 registry-dependency edges. DatePicker directly installs Calendar, Popover and utils; Table installs utils and declares its already-existing Slot range. The DatePicker+Table+Dialog transitive registry closure is calendar, date-picker, dialog, popover, table, utils. No new npm dependency/lockfile change exists. Both families are exported and registered together; story additions are 4+5 stories/plays, giving 205 stories and 175 plays over 33 families.

Independent browser verification and limits
Built a small production Vite consumer on port4197 from the exact merged sources, isolated from docs CSS, before browser work. Only role/tailwind styles and a body role background are present; HTML remains transparent, so exterior probes account for the body's propagated viewport background. Browser: local Chromium only.

Across dark/light at 390/768/1280:

- Native keyboard scroll reached exactly 654px on mobile and 500px on tablet/desktop while focus remained on the named section. This assertion preceded all helpers that could reveal an offscreen trigger. No horizontal page overflow.
- Table remains TABLE/THEAD/TBODY/TFOOT/TR/TH/TD/CAPTION; the slotted scroll host is SECTION and meaningful caption/header associations remain present. Genuine controls stay inside cells.
- The documented caller autofocus callback reaches October12 inside Dialog; ArrowRight moves to13 and then15, skipping disabled14. Real corner hit tests and mouse clicks select Saturday17 and Saturday31 with 44×44 boxes.
- Atomic panel/root/grid measurements settle without running animations and stay horizontally contained. Calendar root widths were338/440/440px in this composition (all >=328); seven-day grids were308px. The portal escapes the table scroll host.
- Actual wheel scrolling exposes the final Saturday and Close: popup maximum scroll76px on mobile and38px on desktop; tablet needs0. Close is hit-tested and clicked using the real pointer.
- Hidden FormData changes to2026-10-31; Save submits that exact local day; Reset empties it. Choosing/closing alone does not submit. Separate pointer outside-dismiss and explicit Close paths preserve the parent until requested and leave the page counter usable.
- Dark cases pass all14 measured focus hosts. Light cases pass all9 Table hosts, date trigger, day, nav and Close; only the popup panel's exterior fails. supplement.mjs independently closes the light navigation/Close paint and nested Escape/focus-return/pointer-cleanup checks that the original fail-fast run had not reached.
- No JavaScript page errors in completed main cases. Complete example canvases and popup-bottom captures were inspected, including the offscreen date controls and wide table actions reached by scrolling.

The parent's packed consumer originally compared rectangles from different moving frames. This review's simultaneous independent measurements did not reproduce a real containment failure. The parent separately demonstrated atomic containment during motion and corrected its proof instrument; that packed 78-case result is parent-owned evidence, not counted as this review's independent browser run.

Limits: sampled local Chromium/presets/viewports and documented composition contracts. No claim about every locale, multiple months, every possible caller CSS override, alternate calendars, timezones or screen-reader output. Existing per-stream test mutation reviews and the full merged gate are owned by their runners; they were not rerun here.

Repair closure — 2026-10-08
Integrated source: 78ef78e3573961418866c2cfd95a5197effdb25f; product repair cf6677a. The only product delta adds `focus-visible:-outline-offset-4` and a rationale to DatePickerContent. Caller className remains later in `cn`, so overrides remain explicit. Shared Popover source is untouched. Generated DatePicker registry content was independently compared to the repaired source and is byte-identical.

After a fresh production fixture build (repaired/build.log), the unchanged combined probe passed all six width/theme cases, with all14 focus hosts per case (84 measurements) and all prior native scroll, geometry, actual17/31 hit points, vertical wheel/Close, forms and separate pointer/Escape checks intact. No JavaScript page errors occurred. Logs and structured measurements are repaired/probe.log and repaired/probe-results.json.

The exact natural fallback reproduction passes at all three widths. Screenshot pixels beside the repaired inset indicator are (255,255,255); actual indicator pixels on all four sides are (74,90,0,255), yielding7.626:1. This is a pixel-to-pixel contrast result including real paint, not a token-only calculation. Evidence: repaired/focus-reachability.{mjs,json,log}, repaired/ring-pixels.{mjs,json}, repaired/captures/*-light-natural-panel.png. Repaired screenshots were visually inspected. The independent exact semantic probe also passed TABLE parent SECTION/region naming, CAPTION/THEAD/TBODY/TFOOT order, five column scopes, row scope/id, final-cell headers association, footer colspan5, enclosing native form and type=button trigger (semantics.mjs/.json).

Original failing outputs, screenshots and original-dist remain intact; report-original.md preserves the initial verdict. The initial semantics attempt met ERR_CONNECTION_REFUSED because the prior preview process had ended (exit143); restarting only the assigned4197 server resolved the instrument issue. It is not a product finding. No other unresolved concern or owed cross-stream probe remains. The full gate, packed installer/consumer sweep, CI and publishing remain the coordinator's responsibility.

The owned4197 preview process was stopped by its verified PID after closure; all scratch sources, builds and evidence remain available.

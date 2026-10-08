# BATCH-PARITY-4 merged review

Reviewed corrected source: `f7a9e5e326ea9dec887a4a876102dab559526e0d`.

## DECISIONS

1. Expose 16 DropdownMenu parts and four Slider parts, with caller-composed anatomy. [V]
   Why: portals, indicators, arrows, submenu glyphs and thumbs remain explicit; DropdownMenu retains Radix’s default modality.

2. Keep 44×44px rectangular Slider targets with 20px circular markers. [V]
   Why: the whole target accepts pointer input while the visible track stays narrow.

3. Preserve Radix 1.5 form behavior and document its limits. [V]
   Why: controlled callers must accept reset changes; a disabled fieldset excludes named disabled values without adding a wrapper form API.

4. Clamp menus to available viewport width and enable wrapper focus outlines while preserving caller styles. [V]
   Why: nested menus must remain bounded and visibly keyboard-focusable.

## Findings and evidence

No open findings remain.

**MEDIUM — PROVED, CLOSED:** `packages/ui/src/slider.tsx:50`. The coordinator-discovered vertical paint defect was independently reproduced: at value 40, a 192px track painted a 192px range instead of 76.8px, extending 115.1875px below its track. Inverted 40 painted the whole track; `[20,80]` also overflowed. Hit-testing confirmed the overflow was real paint.

All nine normal/inverted/range cases failed the predicted assertion at `6e5402c3`. At corrected merged head `f7a9e5e326ea9dec887a4a876102dab559526e0d`, **9/9 passed in 3.7s**, including bounds and 0/100 endpoints. Measured heights are now 76.8125px and 115.21875px. The product-source correction is solely `data-[orientation=vertical]:h-auto`; registry content matches.

Independent evidence:

- **12 successful composition, paint and lifecycle cases** at `6e5402c3`, across 390/768/1280: Sheet → Dialog → Popover → DropdownMenu/submenu; checkbox/radio selection; Slider values, portal form association and reset; Select and AlertDialog; Tooltip lifecycle; dismissal, focus return, reopening and lock cleanup.
- Outside docs CSS, verified real focus, solid 2px outlines, contrast, ancestor opacity, 44px targets, thumb corner hits, marker paint and arrows in dark/light/forced-colors modes.
- Consumer dependencies resolve to one dismissable-layer 1.1.20 instance and one focus-scope 1.2.0 instance without overrides.
- Strict TypeScript/build passed. All nine copied component sources match the corrected merged head.

Evidence directory: `/home/ankit/.marquee-scratch/BATCH-PARITY-4/layer2/`.
The probe is `tests/composition.spec.ts`; predicted failures are in `browser-3.log`,
closure in `browser-closure.log` and `vertical-closure-measurements.json`.

Limits: Chromium keyboard/pointer evidence only; packed-install proof and the merged full gate remain coordinator-owned. Initial probe errors are retained in `browser-1/2.log`; corrected instruments verify outside-hit coordinates and composite forced-color alpha. Earlier submenu-disappearance timing remains cause-unproved. Port 4197 is released.

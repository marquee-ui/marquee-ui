# CHART-1 — composed responsive charts

Batch: BATCH-PARITY-7. Status: planned. Stream port 4192; reviewer 4196.

## Supported contract

Use maintained Recharts 3.10.1. Callers compose chart primitives and own data/series,
axes/labels/formatting and chart state. Supply bounded presentation container, tooltip
and legend parts with explicit children/render slots, refs/events/host composition
where meaningful, token roles only, measured responsive sizing and visible focus.
Do not generate a theme stylesheet from arbitrary config colors. Bar/line examples
prove keyboard point access via Recharts accessibility layer, concise live tooltip
data, and a readable native-table alternative independent of color or hover.

Use existing categorical roles for two distinct series with explicit labels; tokens
can repeat after their documented range. Check actual paint in light/dark/forced
colors and avoid reliance on color-only distinctions. Defer additional chart types,
brush/zoom, animation controls, export and automatic data/schema inference. No drop-in
shadcn API parity claim. Follow the batch's official primary references.

## Ownership and execution

Own `packages/ui/src/chart.tsx`, `packages/ui/stories/chart.stories.tsx`,
`packages/ui/test/chart*.test.tsx`, `apps/docs/src/examples/chart.tsx`,
`apps/docs/browser/chart.spec.ts` and this record. Coordinator owns dependency
manifests/lockfile, exports/maps/counters/registry/generated output/catalog/guide/status.
You are not alone in the codebase; do not revert others' edits. Ask for wiring once
exports stabilize; send exact stories/plays/dependency edges.

Tests first, meaningful plays and responsive Chromium390/768/1280 browser interactions.
Consumer scans before/after. Inspect screenshots including complete examples, isolate
focus/tooltip/legend paint from docs CSS, and exercise keyboard/mouse plus nested
existing overlay composition where relevant. Check actual geometry and data readings.

Commit before one fresh independent detached reviewer runs landed collapse/no-op
mutations over every touched test file, predicted assertion reds and git restoration.
Close findings before one full `DOCS_PORT=4192 pnpm verify`; request launch clearance.
Scratch `/home/ankit/.marquee-scratch/BATCH-PARITY-7/s2/`; Node22.18.0/pnpm10.24.0.
No public operations, version bump or Pile work. Fresh review browser builds authorized.
Build before tests; root Vitest is the runner.

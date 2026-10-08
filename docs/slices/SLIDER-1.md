# SLIDER-1 — composed Slider

Batch: BATCH-PARITY-4. Status: active; unreleased. Stream port 4192; reviewer 4196.

## Scope

Expose Root, Track, Range and Thumb as explicit parts. Caller composes each
thumb and names it; no implicit thumbs from a configuration array. Prove controlled
and uncontrolled single/range values, keyboard Home/End/arrows/page/shift stepping,
min/max/step/minStepsBetweenThumbs, pointer dragging and commit callbacks, disabled,
orientation and direction semantics. Exercise native form serialization and reset
behavior; document any primitive limit truthfully rather than promising native reset
without observing it. Prove real 44px thumb targets without enlarging the visible
track into an unrelated control. Name both range thumbs independently and show
accessible value text where it adds meaning. Do not implement unrelated form APIs.

Sources checked 2026-10-08: [Radix](https://www.radix-ui.com/primitives/docs/components/slider)
and [shadcn](https://ui.shadcn.com/docs/components/radix/slider). Dependency: `@radix-ui/react-slider@^1.5.0`.
DropdownMenu's Menu 2.1.25 resolves dismissable-layer 1.1.20 and focus-scope 1.2.0,
the current overlay generation. Installed artifacts must prove compatibility too.

## Execution and ownership

Test first, implement, commit, obtain a fresh detached layer-1 review, then one full
stream `pnpm verify` after findings close. Use Node 22.18.0 and pnpm 10.24.0.
The orchestrator owns exports, dependencies/lockfile, registry, source/story/focus
inventories, counts, catalog, guide and STATUS. Request wiring as soon as the
source, stories and example stabilize; report exact exports and story/play counts.
You are not alone: preserve other agents' edits and do not revert their files.
No Pile database, Steam, screenshots pipeline or public operations. Publication held.

Retain strict types, role-only styles, supported primitive props/refs and asChild.
44px real interactive targets, dark/light/accent and forced-colors behavior must be
measured in Chromium at 390/768/1280. Focus checks observe actual style, width and
contrast outside docs CSS; arrow checks observe actual visible paint. Use live nodes
and actual focus/listener/animation/hit readiness, not fixed sleeps. Stories have
meaningful plays; examples are highlighted, exact-copy and use registry aliases.

Run meaningful negative controls only from committed detached copies; verify the
mutation landed and the named assertion is the predicted red, then restore from git.
The independent reviewer runs collapse/no-op controls across every touched test file,
reports surviving green assertions and writes its report to durable scratch. Paste
its mutation table and closure evidence here. Do not broaden into unrelated audits.
The orchestrator handles the merged review, packed consumer and stable preview.

Own only `packages/ui/src/slider.tsx`, `packages/ui/stories/slider.stories.tsx`,
`packages/ui/test/slider*.test.tsx`, `apps/docs/src/examples/slider.tsx`,
`apps/docs/browser/slider.spec.ts` and this slice record.

## Evidence

Test-first on 2026-10-08: `pnpm exec vitest run --project ui
packages/ui/test/slider.test.tsx` first failed resolving the not-yet-created
Slider source. After implementation, the runner reports 16 passed. The focused
Slider plus story suite reports 217 passed, and `pnpm typecheck` exits 0.

The installed `@radix-ui/react-slider@1.5.0` restores initial mount values on
form reset. Uncontrolled and external-form resets are observed in the component
tests; controlled reset calls the owner and cannot override an unchanged `value`.
Changing `defaultValue` after mount does not change the reset baseline. Keyboard
Home targets the first range thumb and End the last; direction/inversion and
`preserveThumbOrder` retain their primitive behavior.

The disabled state blocks interaction but its hidden named inputs remain
successful form controls. A native disabled fieldset excludes those values;
both facts are tested. The docs example composes that fieldset, and its copy
states the limitation rather than promising native-disabled parity.

The targeted browser runner (`DOCS_PORT=4192 pnpm --filter @marquee-ui/docs exec
playwright test browser/slider.spec.ts`, after `pnpm build`, 2026-10-08) reports
15 passed in 18.0s across 390/768/1280. It observes the native disabled-input
limitation by temporarily lifting only the native fieldset and reading FormData,
then restoring the fieldset. It also measures dark/light/Violet focus style,
width and contrast outside docs CSS; selected-range contrast and nonempty paint;
forced-colors movement; orientation, direction and inversion movement; real
pointer drag/commit; keyboard values; native reset; and highlighted exact copying.

The first browser run found a real target defect: a 44px thumb with a circular
host had corners whose `elementFromPoint` was Radix's wrapper, while its center
was the thumb. Removing the host's rounding fixes all three measured points;
the decorative 20px marker remains round. Browser iteration also corrected
instrument assumptions: embedded stories do not auto-run plays, and a disabled
control must be clicked with the real mouse rather than Locator's enabled wait.
The focused source/focus/registry/compiled-floor runner reports 96 passed.

## Consumers

Before implementation, `rg -n 'Slider|slider.tsx|slider.stories' packages apps
registry.json` produced no matches. No routes or pre-existing Slider roles
changed. Planned exports: `Slider`, `SliderTrack`, `SliderRange`, `SliderThumb`.

At the commit point, `rg -l '\b(Slider|SliderTrack|SliderRange|SliderThumb)\b'
packages apps --glob '*.ts' --glob '*.tsx' --glob '*.json'` names:

```text
apps/docs/src/examples/slider.tsx
apps/docs/browser/site.spec.ts
apps/docs/src/catalog.ts
apps/docs/browser/slider.spec.ts
packages/ui/r/registry.json
packages/ui/src/slider.tsx
packages/ui/r/slider.json
packages/ui/src/index.ts
packages/ui/test/tailwind-compile.test.tsx
packages/ui/test/slider.test.tsx
packages/ui/stories/slider.stories.tsx
```

The path/basename scan additionally names the source inventory, story suites,
registry tests and focus-outline inventory. The literal-class and ARIA scans
name the new family tests and compiled-floor test. Shared consumers are CROSS
to the orchestrator: catalog, site/explorer checks, package exports, source/story
inventories, story counts, registry and focus/floor guards. Wiring requests were
fulfilled in `77139aed` and the source-comment registry refresh in `da9029d1`.
No other stream's behavior is consumed or changed; no unowned contract moved.

## Decisions

1. Expose four explicit parts and never synthesize thumbs from `value`.
2. Use a 44px draggable host with a 20px decorative marker; keep the track narrow.
3. Delegate reset and disabled behavior to Radix and state its observed limits.
4. Demonstrate disabled-value exclusion through a native disabled fieldset.
5. Keep publication held; no PR, release, merge or deployment from this stream.

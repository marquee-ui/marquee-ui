# BATCH-PARITY-3 — Popover and Tooltip

Date: 2026-10-08. Base: `3bc6ba0efe0895896c88da025757f268ee14e1a0`.
Source/gated/preview: `7e4e636f8ed8487cb90abc2ef429bc7c5721a7d1`.
Later completion commits change records/images only. Public operations remain held.

## Scope and ownership

[POPOVER-1](../slices/POPOVER-1.md) adds ten parts for nonmodal/modal anchored panels,
caller-wired labels, explicit Portal/Arrow/Close and bounded scrolling.
[TOOLTIP-1](../slices/TOOLTIP-1.md) adds six parts for short supplemental descriptions,
explicit Provider/Portal/Arrow, configurable timing and keyboard/hover behavior.
The orchestrator owns shared exports/maps, registry, counts, guide and combined proof.

The measured inventory is **27 families / 28 registry items / 161 stories / 131 plays**.
Popover `^1.2.0` and Tooltip `^1.3.0` share the existing overlay generation; copied
registry dependencies work without workspace overrides. New families are unreleased.

## Verification

All commands use Node 22.18.0 and pnpm 10.24.0 on 2026-10-08. Scratch root:
`/home/ankit/.marquee-scratch/BATCH-PARITY-3/`.

- Baseline `DOCS_PORT=4182 pnpm verify`: exit 0, 142s; 776 library / 39 docs /
  5 consumer / 123 browser cases. This belongs to the starting tree.
- Independent stream reviews: Popover one MEDIUM Arrow-opacity assertion gap closed;
  Tooltip one MEDIUM and two LOW findings closed (single pointer-session hover,
  cumulative Arrow opacity, contrast against the actual surrounding body). Every
  correction has its named predicted red and restored green in the slice records.
- Popover full gate: exit 0, 163s, 801 library / 39 docs / 5 consumer / 150 browser.
- Tooltip first full gate: exit 1, 166s; 796 / 39 / 5 green, 146 browser passed and
  one inherited tablet `Dialog inside Sheet` case failed because the parent was absent
  after Escape. The exact same build passed that test three times; the unchanged full
  gate repeated green in 159s, 796 / 39 / 5 / 147. **Cause remains unproved; no fix is
  claimed.** Original failure, trace and discriminators are retained.
- Merged `DOCS_PORT=4182 pnpm verify`: **exit 0**, 184s (06:45:48–06:48:52 IST),
  **821 library tests in 48 files / 39 docs / 5 consumer / 174 Chromium browser cases**
  at 390/768/1280. `integration/verify.*` holds source, runner and exit sentinel.
- Fresh packed consumer: new npm cache, real UI/tokens tarballs, no workspace links,
  fourteen registry-copied files byte-identical, strict TS/Vite build green and
  **27 browser cases passed, 22.9s**. Includes both new families, prior overlays,
  separate Escape layers, selection, focus restoration, cleanup, fonts, actual targets
  and dark/light/forced-colors focus/readability outside docs CSS.
  [Artifact provenance](BATCH-PARITY-3-evidence/consumer-provenance.json).
  Its initial 21-pass/6-fail run sent Enter before Select's scheduled next-option
  focus. Awaiting that actual focus resolved the two probe paths at all widths;
  package source stayed unchanged. Original runner output remains retained.
- [Merged review](BATCH-PARITY-3-review.md): **zero findings**, independent simultaneous
  six-family lifecycle/outside-dismissal proof passed six cases at all three widths.

Consumer reproduction: `node ~/.marquee-scratch/BATCH-PARITY-3/candidate-proof.mjs
/home/ankit/Code/marquee-ui ~/.marquee-scratch/BATCH-PARITY-3/consumer-new
~/.marquee-scratch/BATCH-PARITY-3/candidate.spec.ts`. Target must be fresh.

Six responsive images plus the packed light-mode overlay image were opened and inspected:
readable text, visible arrows/focus, contained panels and usable controls.

| Width | Popover dark                                        | Tooltip light                                       |
| ----- | --------------------------------------------------- | --------------------------------------------------- |
| 390   | [Popover](BATCH-PARITY-3-evidence/popover-390.png)  | [Tooltip](BATCH-PARITY-3-evidence/tooltip-390.png)  |
| 768   | [Popover](BATCH-PARITY-3-evidence/popover-768.png)  | [Tooltip](BATCH-PARITY-3-evidence/tooltip-768.png)  |
| 1280  | [Popover](BATCH-PARITY-3-evidence/popover-1280.png) | [Tooltip](BATCH-PARITY-3-evidence/tooltip-1280.png) |

## Local delivery and publication

Stable **http://localhost:4174/marquee-ui/** serves the reviewed source from
`/home/ankit/Code/marquee-integration-parity-3/apps/docs/dist`, PID 1499623.
All 100 serving files equal the gate build byte for byte. Served index SHA256:
`893f9b98dc549d4756195acf5251b304d7f428f694d3153ee120ca456bd0fca0`.
The actual served Popover save/Select and Tooltip description/action flows passed
without page errors; `integration/preview-4174.json` records the proof.

No main merge, public deployment, Pages activation, npm publication, version bump or
domain operation. UI 0.1.10/main registry do not contain the new families. Draft PR #2
stays unmerged; its final-head CI and cleanup are recorded in `integration/final-handoff.md`.
Next: BATCH-PARITY-4 — DropdownMenu and Slider.

## Retro

The Arrow clipping concern was a hypothesis, disproved by actual paint/position evidence;
absolute Radix Arrow positioning escaped the static Content's clipping box. In contrast,
zero opacity really survived hit testing, so both paint checks now observe opacity too.
Tooltip's hover story needed one persistent pointer session to dispatch a real leave.

Coordinator probe corrections: await the selected option's actual focus before Enter;
limit status queries to the family canvas; capture visible tooltip content after scroll
settles (scroll legitimately dismisses it). Initial failures remain in scratch. One
composition STATUS formatting omission was corrected before stream gates. The inherited
Dialog failure has no established cause and must not be reported as fixed.

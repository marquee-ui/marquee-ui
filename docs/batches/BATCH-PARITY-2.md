# BATCH-PARITY-2 — Dialog and AlertDialog

Date: 2026-10-08. Base: `f8c92828791ccf74937e653d74e41d497a226e25`.
Source: `11c0dcf5ebdef812a054962d85d320a68e630c57`. Later completion commits change records only.
Public operations remain held; draft PR #2 accumulates the reviewed candidate.

## Scope and ownership

[DIALOG-1](../slices/DIALOG-1.md) adds ten explicit parts for centered modal/non-modal
content. [ALERT-DIALOG-1](../slices/ALERT-DIALOG-1.md) adds eleven parts with Cancel
initial focus, blocked outside dismissal and caller-controlled completion. Neither
injects actions or structural controls. Both retain Radix props, refs and asChild.
The orchestrator owns shared exports/maps, registry, counts, guide and integration.

The inventory is **25 families / 26 registry items / 146 stories / 116 plays**.
AlertDialog `^1.1.24` uses Dialog `1.2.0`, matching the existing Sheet/Select stack;
these ranges ship through the copied-source registry, without workspace overrides.

## Verification

All commands use Node 22.18.0 and pnpm 10.24.0 on 2026-10-08. Scratch root:
`/home/ankit/.marquee-scratch/BATCH-PARITY-2/`.

- Baseline `DOCS_PORT=4180 pnpm verify`: exit 0, 104s; 733 library / 39 docs /
  5 consumer / 84 browser tests. This belongs to the starting tree.
- Independent detached reviews: Dialog 0 findings, 17 bounded negative-control runs;
  AlertDialog 1 MEDIUM and 1 LOW, both closed. The destructive variant collapse now
  fails its intended role assertion. Exact review evidence is in the slice records.
- Stream gates: Dialog exit 0, 124s, 757 library / 39 docs / 5 consumer / 108 browser;
  AlertDialog corrected gate exit 0, 123s, 752 / 39 / 5 / 99. Its first gate stopped
  at one missing shared focus-inventory entry (751 passed / 1 failed); that omission
  was corrected and the whole gate repeated. Both original verdicts are retained.
- Merged `DOCS_PORT=4182 pnpm verify`: **exit 0**, 145s (05:42:21–05:44:46 IST),
  **776 library tests in 44 files / 39 docs / 5 consumer / 123 Chromium browser cases**
  at 390/768/1280. `integration/verify.*` holds source, runner log and exit sentinel.
- Fresh external consumer: local candidate tarballs, fresh npm cache, no symlinks or
  workspace imports, twelve registry-copied files byte-identical, strict TS/Vite
  build green, **15 browser cases passed in 13.4s**. Covers independent overlay
  dismissals, cancel/action/async state, nested Sheet/Dialog/AlertDialog/Select,
  focus restoration, pointer cleanup, dark/light/forced-colors, actual outline
  style/width/offset/contrast, target geometry and fonts.
  [Artifact provenance](BATCH-PARITY-2-evidence/consumer-provenance.json).
- Packed proof command: `node ~/.marquee-scratch/BATCH-PARITY-2/candidate-proof.mjs
/home/ankit/Code/marquee-ui ~/.marquee-scratch/BATCH-PARITY-2/consumer-final
~/.marquee-scratch/BATCH-PARITY-2/candidate.spec.ts`. The external target must be fresh.
- [Merged review](BATCH-PARITY-2-review.md): 0 findings; independent simultaneous four-layer lifecycle probe passed at all three widths..

Six screenshots were inspected: bounded panels, readable content/actions and responsive
footers; an additional packed light-mode focus image was inspected without docs CSS.

| Width | Dialog in dark mode                               | AlertDialog in light mode                                    |
| ----- | ------------------------------------------------- | ------------------------------------------------------------ |
| 390   | [Dialog](BATCH-PARITY-2-evidence/dialog-390.png)  | [AlertDialog](BATCH-PARITY-2-evidence/alert-dialog-390.png)  |
| 768   | [Dialog](BATCH-PARITY-2-evidence/dialog-768.png)  | [AlertDialog](BATCH-PARITY-2-evidence/alert-dialog-768.png)  |
| 1280  | [Dialog](BATCH-PARITY-2-evidence/dialog-1280.png) | [AlertDialog](BATCH-PARITY-2-evidence/alert-dialog-1280.png) |

## Local delivery and publication

P0 findings; independent simultaneous four-layer lifecycle probe passed at all three widths.

New families are unreleased candidates; npm UI 0.1.10 and the main registry do not
contain them. The guide uses next/reviewed-SHA source installation. No version bump,
main merge, Pages activation, public deployment, npm publication or domain operation.
Final-head CI and cleanup are recorded in `integration/final-handoff.md` and draft PR #2.
Next: BATCH-PARITY-3, Popover and Tooltip.

## Retro

The shared focus-site inventory was missed during initial wiring and cost one stopped
stream gate. The existing guard found it; both new sites now participate in that strict
inventory. Future family wiring must inspect derived focus inventories alongside the
source/story/registry maps.

Browser probes must observe settled CSS animations and registered overlay layers before
measuring contrast or dispatching outside clicks. Waiting for actual animations, parent
pointer state and hit targets replaced premature assertions; no fixed sleeps were added.
Modal background status is intentionally hidden while open, and focus-visible proof uses
keyboard input. These were instrument corrections, not changes to primitive semantics.

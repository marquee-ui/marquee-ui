# BATCH-PARITY-3 merged review

Reviewed source: `7e4e636f8ed8487cb90abc2ef429bc7c5721a7d1`.

## DECISIONS

1. Expose ten Popover parts and six Tooltip parts, with explicit Portal and Arrow composition. [V]
   Why: callers retain control of structure; Popover presentation slots require caller-wired accessible labels.
2. Keep Popover nonmodal by default, with optional modality; keep Tooltip supplemental and noninteractive. [V]
   Why: editable panels and descriptive hints require different focus and dismissal behavior.
3. Preserve Radix positioning defaults for Popover; give Tooltip 8px offset and collision padding. [V]
   Why: both retain configurable primitive placement with bounded content.

## Findings and evidence

**0 HIGH / 0 MEDIUM / 0 LOW.** No PROVED or REASONED defect identified.

Computed intersection: 15 files, comprising 14 reviewed registration/documentation files
and excluded STATUS.md. Read both Consumers sections and the merged product diff.
Independently confirmed 27 families / 28 registry items / 161 stories / 131 plays.
Generated Popover/Tooltip payloads match source exactly; shared exports and inventories agree.
Installed Dialog, AlertDialog, Popover, Tooltip and Select resolve one dismissable-layer module.

Independent production consumer: **6/6 Chromium cases passed**, two at each of
390/768/1280. Sheet → Dialog → AlertDialog → Popover remained mounted while Tooltip
and Select were exercised in turn. Verified independent dismissal, selection, focus
restoration, outside-click confirmation preservation, reopening, listener/scroll/pointer
cleanup and background interaction.

Commands on 2026-10-08: `npm run build`; `npm run proof -- --project=phone`
(2 passed, 4.7s); `npm run proof -- --project=tablet --project=desktop`
(4 passed, 9.7s). Evidence:
`/home/ankit/.marquee-scratch/BATCH-PARITY-3/layer2-consumer/proof/`.
Port 4197 is free. Reviewed source remained unchanged; no mutations or full gate performed.
The earlier inherited Dialog-in-Sheet failure remains cause-unproved.

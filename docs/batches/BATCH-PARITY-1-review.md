# BATCH-PARITY-1 integration review

Independent review of merged 85967ec285dd160b0a1025528ac9b58408b3ec22,
with bounded closure at 0ae5662c8d06372a24ffad6ce5d740fa346690e4 on 2026-10-08.
Read the 15 shared registration/dependency surfaces and both consumer contracts.

One HIGH was reproduced: old Sheet Dialog and new Select carried separate Radix
focus/dismissal stacks. Nested keyboard selection failed; Escape closed both layers
and could strand body pointer events. The original browser probe recorded twelve
intended failures and six passing controls at 390/768/1280. After the public Dialog
minimum and shipped registry moved to ^1.2.0, the unchanged probe passed all 18
assertions. Both primitives now resolve the same physical focus/dismiss modules.
The guide tells existing copied-Sheet consumers to upgrade. No findings remain.

The independent probe checks the first Escape and original stranded-page condition;
the stream and fresh packed proof additionally check final close, both focus returns
and restored outside pointer input. Those separate results belong to the
[batch record](BATCH-PARITY-1.md), not to an invented reviewer rerun.
Full report and red/green logs: `/home/ankit/.marquee-scratch/BATCH-PARITY-1/layer2/`.

DECISIONS

1. Expose Select as 16 explicit Radix slots, preserving single selection and item-aligned default positioning. [V]
   Portal, viewport, text, indicators and scroll controls remain caller compositions under Marquee's existing contract.
2. Expose four Tabs parts with default/line styling and native controlled state, orientation, direction, activation and mounting props. [V]
   Callers own content, long-label overflow, responsive orientation and forced-content visibility.
3. Register both families through the existing exports, shared utils, registry and copyable live examples. [V]
   The corrected inventory is 23 families / 24 registry items, **131 stories / 101 plays**, including the nested Sheet regression.
4. Keep new families unreleased without a version bump; document next/reviewed-SHA source installation separately from UI 0.1.10. [V]
   The published starter remains an existing-release baseline and public operations remain held.
5. Require isolated component focus/selection evidence alongside themed docs, including explicit outline style as well as width and contrast. [V]
   Docs CSS can mask missing or unreadable library declarations; the reusable source must carry its own indicator.
6. Raise the Sheet Dialog minimum to ^1.2.0 in package and registry metadata, with an explicit upgrade note for existing consumers. [V]
   Sharing compatible focus/dismissal modules with Select restores nested keyboard behavior without changing Sheet markup/API or relying on workspace-only overrides.

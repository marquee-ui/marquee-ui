# BATCH-PARITY-2 integration review

Source: `11c0dcf5ebdef812a054962d85d320a68e630c57`. Date: 2026-10-08.

## DECISIONS

1. Expose ten Dialog parts and eleven AlertDialog parts, with explicit Portal, Overlay and closing controls. [V]
   Why: callers retain structural composition and supported Radix props, refs and `asChild`.
2. Use centered, viewport-bounded scrolling panels with optional Header/Footer slots; AlertDialogAction offers primary/destructive styling. [V]
   Why: presentation remains role-based while applications own content and layout.
3. Preserve distinct interaction contracts: Dialog supports nonmodal use; AlertDialog supplies Cancel focus and blocked outside dismissal. Async completion remains caller-controlled. [V]
   Why: confirmation behavior requires the actual AlertDialog primitive.
4. Declare compatible primitive dependencies in copied registry items without workspace overrides. [V]
   Why: Sheet, Dialog, AlertDialog and Select must share focus and dismissal infrastructure outside this repository.
5. Keep these additions explicitly unreleased, with publication held. [V]
   Why: candidate source and packed proof do not change the published release.

## Verdict

**0 findings.** Reviewed both Consumers sections, the computed **14 shared paths**,
product changes, dependency declarations and generated registry bytes.

Independent packed-consumer probe passed at **390/768/1280** with all four layers open
simultaneously: outside blocking, keyboard/pointer selection, Escape and explicit closing,
reopening, focus restoration, and pointer/scroll/focus-guard cleanup.

Initial outside-click failures occurred before listener readiness. Observing all four
registered pointer listeners resolved them without source changes or arbitrary delays.
Initial failures, diagnostics, successful results and the executable probe remain in
`/home/ankit/.marquee-scratch/BATCH-PARITY-2/layer2/`.

Read-only review completed; no gate or screenshots run. Owned port 4197 server cleaned up.

# NESTED-ESCAPE-1 — protect a nested modal's parent

The user authorized this repair and a fresh 0.2.0 candidate installation after
PR #3 merged. npm publication remains held.

## Cause and behavior

Radix DismissableLayer 1.1.20 retains the previous top layer's document Escape
listener briefly after a nested modal has registered and received focus. The
stale listener can close the parent, unmounting both layers. This reproduces in
the browser without a simulated clock and matches
[upstream issue 4143](https://github.com/radix-ui/primitives/issues/4143).

Sheet, Dialog and AlertDialog Content now read their live hidden boundary before
handling Escape. A hidden background modal prevents the event and does not call
its caller's dismissal handler. Escape during that registration window is ignored;
after registration it closes the child normally, with focus returning one layer
at a time. Radix still owns state, focus, outside clicks and the layer stack.
The guard ships in the existing registry utility and uses composed refs so caller
refs and custom hosts survive. Registry dependencies include the imported helper.

The custom-host check also reproduced SheetContent's existing `asChild` error:
the built-in handle and caller host were two unmarked slot children. Marking the
caller host with `Slottable` preserves the handle and allows the host/ref to work.

## Evidence — 2026-10-09

Scratch: `/home/ankit/.marquee-scratch/NESTED-ESCAPE-1`.

- `probe.json` / `probe.log`: unmodified browser failure on the first attempt.
  The parent Escape listener ran while the child had focus; the child listener
  was attached only afterward. No simulated clock was installed.
- `red-confirmed.log`: all three parent types dismissed on the deterministic
  registration key. The injection count and live hidden boundary were asserted.
- `red-browser.log`: the same injected Escape closed the parent in the previous
  immutable build. The failure names the parent-preservation assertion.
- `final-unit-2.log`: 42 selected component and registry checks passed, including
  six new tests for registration, normal dismissal, caller cancellation and refs.
- `focused.log`: 45 repeated browser cases passed across 390/768/1280 before the
  additional Sheet slot correction. The full gate below covers the final source.
- Full gate and fresh installed-package evidence: pending in this working slice.

The guard is scoped to Sheet/Dialog/AlertDialog modal content. It is not a fork of
Radix and does not claim to repair every possible third-party overlay composition.

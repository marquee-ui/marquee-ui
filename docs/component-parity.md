# Component parity program

Checked 2026-10-08 against the [official shadcn component catalog](https://ui.shadcn.com/docs/components).
This is a finite approved program, not a promise to copy every future catalog entry.
Registry/source compatibility, named-family coverage and API/behavior parity are distinct.
The catalog mixes primitives and recipes, so a percentage based on its entry count is misleading.

## Ordered batches

| Batch          | Independent streams                              | Dependencies                                   | State    |
| -------------- | ------------------------------------------------ | ---------------------------------------------- | -------- |
| BATCH-PARITY-1 | Select; Tabs                                     | Existing tokens/composition                    | Complete |
| BATCH-PARITY-2 | Dialog; AlertDialog                              | Existing Radix approach                        | Complete |
| BATCH-PARITY-3 | Popover; Tooltip                                 | Overlay conventions from batch 2               | Complete |
| BATCH-PARITY-4 | DropdownMenu; Slider                             | Overlay conventions from batches 2–3           | Planned  |
| BATCH-PARITY-5 | Combobox; Calendar                               | Popover; choose maintained calendar primitive  | Planned  |
| BATCH-PARITY-6 | DatePicker; Table                                | Calendar + Popover; semantic table foundation  | Planned  |
| BATCH-PARITY-7 | DataTable; Chart                                 | Table; choose maintained data/chart primitives | Planned  |
| BATCH-PARITY-8 | Existing common-name API audit and documentation | New families complete                          | Planned  |

Each stream owns a bounded family and its tests, live example, copyable source and install
contract. Expand slice records only for the active batch. DataTable/Chart are bounded
composed recipes with documented limits; their slice briefs must select supported behavior
before implementation. Batch 8 measures common-name differences and records any remaining
implementation as deferred work rather than silently changing existing APIs.

## Current matrix

Existing source/registry families: Accordion, Alert, Avatar, Badge, Breadcrumb, Button,
Card, Checkbox, DescriptionList, Form, Input, Label, Pagination, RadioGroup, Ribbon,
Separator, Sheet, Switch, Textarea, Toast and Toggle. The shared `utils` item is a library
helper rather than a component family. Newly completed families are recorded by the batch rows and their evidence below.

| Area                           | Current contract or planned proof                                                                                                                                                                                 |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Select, Tabs                   | [Batch 1 complete](batches/BATCH-PARITY-1.md): maintained Radix behavior, composition, keyboard/state tests, docs and fresh packed-consumer install.                                                              |
| Dialog, AlertDialog            | [Batch 2 complete](batches/BATCH-PARITY-2.md): explicit composed overlays, true confirmation semantics, compatible nested focus stack and fresh packed-consumer proof.                                            |
| Popover, Tooltip               | [Batch 3 complete](batches/BATCH-PARITY-3.md): explicit anchored panels and supplemental descriptions, shared overlay lifecycle and fresh packed-consumer proof.                                                  |
| Overlays and everyday controls | Batches 4–5: DropdownMenu, Slider and Combobox.                                                                                                                                                                   |
| Dates and data                 | Batches 5–7: Calendar, DatePicker, Table, DataTable and Chart.                                                                                                                                                    |
| Form                           | Accessibility wiring; caller owns controller, validation and submission.                                                                                                                                          |
| Toast                          | Controlled open/onDismiss/duration portal; no manager, queue or promise API.                                                                                                                                      |
| Sheet                          | Radix Dialog with mobile-bottom/desktop-center presentation; no four-side or drag API.                                                                                                                            |
| Checkbox / RadioGroup / Toggle | Native checkbox without an indeterminate visual API; named native radios with per-input state; caller-controlled aria-pressed toggle.                                                                             |
| Common-name audit              | Batch 8 verifies these differences against source and contemporary official docs; matching names do not establish parity.                                                                                         |
| Install evidence               | Published baseline proves React 19, Tailwind 4, Vite, strict TypeScript and Chromium for seven selected families. Unreleased additions require a fresh packed-artifact consumer; other stacks remain unvalidated. |
| Deferred catalog gaps          | Remaining catalog primitives/recipes, additional behaviors and future catalog entries are unplanned pending a new scope decision.                                                                                 |

Primary references for batch 1: shadcn [Select](https://ui.shadcn.com/docs/components/radix/select)
and [Tabs](https://ui.shadcn.com/docs/components/radix/tabs), and Radix
[Select](https://www.radix-ui.com/primitives/docs/components/select) and
[Tabs](https://www.radix-ui.com/primitives/docs/components/tabs). Use primary maintained
primitive documentation at each batch; stay with the library's existing Radix/composition
approach rather than replatforming. A deliberate difference belongs in that family's slice
and live docs. All components retain token roles, 44px targets and dark/light/accent legibility.

## Execution and publication

Two isolated streams, one independent reviewer per stream, one merged review and a merged
`pnpm verify` gate per batch. The orchestrator owns shared registration surfaces, status,
reconciliation, packed-consumer proof and the stable 4174 preview. Browser checks cover
390, 768 and 1280px in Chromium; screenshots are inspected, not merely captured.
Check each new family's focus and selected-state paint in isolation from docs CSS as well
as in the live demo. The docs page's unlayered focus rule can mask a component's missing
outline style/width or low-contrast role: batch 1 reproduced both shapes. Use isolated Storybook and
fresh packed registry copies for the component contract, including dark/light and
forced-colors where relevant. Check painted style, width and contrast together; a color
measurement alone cannot prove that an outline is visible. Exercise new overlays nested
with existing overlay parts and align compatible primitive dependencies in both the
workspace and shipped registry; workspace-only overrides do not protect copied components.
Require the predicted assertion to redden under mutation.

Public operations stay held as recorded in [STATUS.md](../STATUS.md). Green implementation
advances to the next batch while the accumulated release PR remains draft and unmerged.

# Component parity program

Checked 2026-10-09 against the [official shadcn component catalog](https://ui.shadcn.com/docs/components).
This is a finite approved program, not a promise to copy every future catalog entry.
Registry/source compatibility, named-family coverage and API/behavior parity are distinct.
The catalog mixes primitives and recipes, so a percentage based on its entry count is misleading.

## Ordered batches

| Batch          | Independent streams                              | Dependencies                                  | State    |
| -------------- | ------------------------------------------------ | --------------------------------------------- | -------- |
| BATCH-PARITY-1 | Select; Tabs                                     | Existing tokens/composition                   | Complete |
| BATCH-PARITY-2 | Dialog; AlertDialog                              | Existing Radix approach                       | Complete |
| BATCH-PARITY-3 | Popover; Tooltip                                 | Overlay conventions from batch 2              | Complete |
| BATCH-PARITY-4 | DropdownMenu; Slider                             | Overlay conventions from batches 2–3          | Complete |
| BATCH-PARITY-5 | Combobox; Calendar                               | Popover; maintained DayPicker 10              | Complete |
| BATCH-PARITY-6 | DatePicker; Table                                | Calendar + Popover; semantic table foundation | Complete |
| BATCH-PARITY-7 | DataTable; Chart                                 | Table; TanStack React Table 9 / Recharts 3    | Complete |
| BATCH-PARITY-8 | Existing common-name API audit and documentation | New families complete                         | Active   |

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

| Area                           | Current contract or planned proof                                                                                                                                                                                                                                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Select, Tabs                   | [Batch 1 complete](batches/BATCH-PARITY-1.md): maintained Radix behavior, composition, keyboard/state tests, docs and fresh packed-consumer install.                                                                                                                                                               |
| Dialog, AlertDialog            | [Batch 2 complete](batches/BATCH-PARITY-2.md): explicit composed overlays, true confirmation semantics, compatible nested focus stack and fresh packed-consumer proof.                                                                                                                                             |
| Popover, Tooltip               | [Batch 3 complete](batches/BATCH-PARITY-3.md): explicit anchored panels and supplemental descriptions, shared overlay lifecycle and fresh packed-consumer proof.                                                                                                                                                   |
| DropdownMenu, Slider           | [Batch 4 complete](batches/BATCH-PARITY-4.md): composed menus/submenus, overlay lifecycle, proportional numeric ranges and fresh packed install verified. Slider controlled reset requires accepting the change. Radix 1.5 disabled named Slider still serializes; verified disabled fieldset excludes its value.  |
| Combobox                       | [Batch 5 complete](batches/BATCH-PARITY-5.md): bounded cmdk/Radix single-select searchable popup; editable inline input, chips/multiselect, object collections and virtualization remain deferred. Current-shadcn Base UI API parity is not claimed.                                                               |
| Calendar                       | [Batch 5 complete](batches/BATCH-PARITY-5.md): typed single/multiple/range selection, caller state and replaceable DayPicker 10 slots. Default seven-day anatomy requires 328px host width; custom slots/week numbers may need more. Time and alternate calendars remain deferred.                                 |
| DatePicker                     | [Batch 6 complete](batches/BATCH-PARITY-6.md): explicit Calendar/Popover composition; caller owns date state, formatting, forms/reset and closing. Nested selected-day autofocus uses the documented caller callback. Standard Calendar needs 328px; text parsing/time inputs are deferred.                        |
| Table                          | [Batch 6 complete](batches/BATCH-PARITY-6.md): native semantic parts and a named keyboard-scroll container; caller owns data operations and cell controls. Sorting/filtering/pagination/virtualization are outside this family.                                                                                    |
| Data recipes                   | [Batch 7 complete](batches/BATCH-PARITY-7.md): composed TanStack Table 9 client sorting/filter/page and Recharts 3 bar/line keyboard data with explicit rendering, token series and native table alternatives. Server/virtual grids, advanced grid operations and additional chart types/controls remain deferred. |
| Form                           | Accessibility wiring; caller owns controller, validation and submission.                                                                                                                                                                                                                                           |
| Toast                          | Controlled open/onDismiss/duration portal; no manager, queue or promise API.                                                                                                                                                                                                                                       |
| Sheet                          | Radix Dialog with mobile-bottom/desktop-center presentation; no four-side or drag API.                                                                                                                                                                                                                             |
| Checkbox / RadioGroup / Toggle | Native checkbox without an indeterminate visual API; named native radios with per-input state; caller-controlled aria-pressed toggle.                                                                                                                                                                              |
| Common-name audit              | [Original family contracts](common-name-api.md) and [candidate contracts](recipe-contracts.md) audit all 35 families against source and contemporary official primary docs. Matching names do not establish drop-in parity.                                                                                        |
| Install evidence               | Published baseline covers seven selected families. [Batch 7 packed candidate](batches/BATCH-PARITY-7.md) proves React 19/Tailwind 4/Vite/strict TypeScript and Chromium at 390/768/1280 for 21 selected families, 22 copied files and 99 cases. Additions remain unreleased; other stacks remain unvalidated.      |
| Deferred catalog gaps          | The finite deferred backlog below records names absent from this registry and broader API/validation limits. Further work needs a new scope decision; completing this program does not establish full catalog or API parity.                                                                                       |

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

## Deferred backlog after the finite program

The 2026-10-09 catalog check used `web.run` to open the official component catalog
above; the local inventory used `registry.json`'s `registry:ui` item names. These
are scope observations, not a compatibility percentage or a promise to follow
future catalog growth. The registry has 35 families and one shared `utils` item.
DescriptionList, Ribbon and the legacy Form wiring are Marquee contracts; a
matching current catalog entry is not claimed for them.

Current catalog names with no Marquee registry family: Aspect Ratio, Attachment,
Bubble, Button Group, Carousel, Collapsible, Command, Context Menu, Direction,
Drawer, Empty, Field, Hover Card, Input Group, Input OTP, Item, Kbd, Marker,
Menubar, Message, Message Scroller, Native Select, Navigation Menu, Progress,
Questionnaire, Resizable, Scroll Area, Sidebar, Skeleton, Spinner, Toggle Group
and Typography. An underlying dependency (such as cmdk inside Combobox), a native
HTML host or an example composition does not supply a separate family contract.

Existing-family extensions remain deferred: controller-bound Form integration,
tri-state Checkbox presentation, group-managed RadioGroup/Toggle APIs,
four-side or draggable Sheet, toast queues/promise management, automatic Avatar
fallback and additional form transports. The contract guides describe the current
caller responsibilities; their absence is not silently implemented by this audit.

New-family extensions remain bounded by the candidate guide: editable/multiple
Combobox modes; date parsing/time/alternate calendars; server/virtual grids,
editing and advanced table operations; additional chart types, brush/zoom and
export. Broad SSR/RSC/framework and cross-browser proof, exhaustive locale/timezone
coverage and the finite runner limitations below remain outside the measured
consumer evidence. No further batch is queued.

Finite validation limits for DataTable/Chart are recorded in [Batch 7](batches/BATCH-PARITY-7.md#finite-deferred-validation-limits), including the existing global story-play no-op survivor. Changing that runner is a separate scoped decision.

Chart in a wide table follows the [native-scroll boundary contract](slices/CHART-1.md#native-scroll-boundary): reveal the whole SVG through the named scroll region before chart traversal. Natural Tab alone does not promise whole-box reveal. The independent [contract supplement](batches/BATCH-PARITY-7-contract-review.md) retains the actual focused-clipping counterexample.

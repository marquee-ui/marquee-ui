# RECIPE-INSTALL-AUDIT-1 — recipe and install contract audit

Batch: BATCH-PARITY-8. Date: 2026-10-09. Status: draft; independent review pending.
Base: `6cd97f2`. Product source remains the Batch 7 source at `15c266e`.

## Scope and ownership

Docs-only audit of fourteen unreleased families: Select, Tabs, Dialog, AlertDialog,
Popover, Tooltip, DropdownMenu, Slider, Combobox, Calendar, DatePicker, Table,
DataTable and Chart. Own `docs/recipe-contracts.md`, `docs/getting-started.md`,
`docs/supported-stack.md` and this record. Other stream/shared files remain
coordinator-owned. Scratch: `/home/ankit/.marquee-scratch/BATCH-PARITY-8/s2/`.
No UI source, dependencies, registry, version, feature, test guard or public operation
changes. No Pile build/database/screenshot work.

## Audit method and decisions

Read `AGENTS.md`, the parity matrix, Batch 7 completion/contract supplement and
family slice records, all fourteen family sources and `packages/ui/src/index.ts`,
the UI manifest, starter manifest/lock and retained consumer provenance.
Checked contemporary official shadcn Radix docs and wrapper source, Radix primitive
docs, default shadcn Base UI Combobox, cmdk, DayPicker 10, TanStack React state and
Recharts sizing/accessibility references with web tools on 2026-10-09. Links live
beside their claims in the public recipe guide. API forwarding claims come from
source; they do not assert independent measurement of every primitive prop/mode.

The public guide records exports, default hosts, explicit structure, caller
ownership, important shadcn differences and deferred behaviors per family. It
preserves Calendar's 328px minimum inner host width; nested DatePicker's caller
roving-day autofocus; Radix 1.5 disabled Slider submission and disabled-fieldset
workaround; cmdk/Radix single-select Combobox rather than Base UI editable/object/
multiselect API; native Table hosts and explicit named scroll container;
caller-created reactive TanStack 9 instance/header/row/control composition;
explicit Recharts 3 composition, scoped focused-SVG point arrows, whole-SVG region
reveal before Tab, and the persistent modal tooltip host with one nonempty Text
child, disabled active dots and cursor.

Getting started retains setup, release/candidate registry distinction and the
existing Sheet Dialog dependency upgrade, while moving family prose to the guide.
Supported stack owns the published/candidate inventory and finite evidence table.
No generic Markdown heading IDs are assumed: guide links use exact supported
relative guide targets; source/slice/evidence links use full GitHub `next` URLs.

## Inventory and reused evidence

On 2026-10-09, Python's JSON reader counted item names in the retained installed
published `@marquee-ui/ui@0.1.10/r/registry.json` at
`/home/ankit/.marquee-scratch/RELEASE-1/s1/cold-final/node_modules/@marquee-ui/ui/`
and the candidate `packages/ui/r/registry.json`. Result: published **21 families /
22 items** and candidate **35 families / 36 items**, each including one `utils`
item. Both manifests still say UI 0.1.10; their contents are distinct.

Published proof from CONSUMER-1 measured seven selected families/eight copied
files/two Chromium cases (390/1280), not all 21 families. Batch 7's committed
provenance identifies product source
`15c266e3a47be44ad40c26db4d961ca31cd09a9f`, strict build passed, 22 copied files,
99 expected / zero skipped / zero unexpected / zero flaky, no workspace links,
and its 2026-10-08 measurement. The selected install inventory is 21 families,
not all 35. This stream reuses that proof and does not run a fresh cold consumer
or certify public npm additions.

## Proportional validation

At the committed draft, 2026-10-09:

- `/home/ankit/.marquee-scratch/BATCH-PARITY-8/s2/check-docs.py`: exit 0, all
  fourteen source export sets documented/publicly exported, 74 guide/source links
  checked, 21/35-family inventory and reused 99-case provenance checked. JSON is
  `s2/doc-check.json`. The exact `./common-name-api.md` target is pending sibling
  stream integration and explicitly recorded; no local heading fragments are used.
- Changed-file `prettier --check` under Node 22.18.0: exit 0, all four Markdown
  files formatted. Prettier comes from the main clone's installed dependencies.
- `git diff --check`: exit 0.
- `git diff --quiet 15c266e -- packages/ui/src packages/ui/package.json
registry.json packages/ui/r examples/consumer`: exit 0; product, registry and
  starter contents equal the retained proof source.

A fresh independent reviewer audits the committed draft in its own detached tree
before closure. The coordinator owns the full merged gate and rendered-site
validation. No product build or fresh consumer/browser run is claimed by this stream.

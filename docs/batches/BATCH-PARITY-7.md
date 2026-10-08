# BATCH-PARITY-7 — DataTable and Chart

Date: 2026-10-08. Base: `eea61a33792c2991b8da4358323e48e6ef2b109f`.
Status: active. Public operations remain held.

## Scope and decisions

[DATA-TABLE-1](../slices/DATA-TABLE-1.md) supplies a bounded composed recipe over
the existing native Table and maintained TanStack React Table 9. The caller creates
the table instance and owns columns, data, sorting/filter/pagination state and
updates. Rendering and controls remain explicit parts or render slots, rather than
a configuration prop that silently creates a toolbar. The example proves client
sorting, text filtering, pagination, empty results and cell actions.

[CHART-1](../slices/CHART-1.md) supplies bounded presentation parts over maintained
Recharts 3. Callers compose chart primitives, series, axes, labels, tooltip and
legend content using token roles. Bar/line examples prove measured responsive
sizing, keyboard data access and a readable native-table alternative. No generated
theme stylesheet or arbitrary color configuration is introduced.

Primary sources checked 2026-10-08: shadcn [Data Table](https://ui.shadcn.com/docs/components/data-table)
and [Chart](https://ui.shadcn.com/docs/components/chart), TanStack
[table instances](https://tanstack.com/table/latest/docs/guide/tables) and
[React state](https://tanstack.com/table/latest/docs/framework/react/guide/table-state),
Recharts [accessibility](https://github.com/recharts/recharts/blob/main/storybook/stories/API/Accessibility.mdx).
`pnpm view <package> version dist-tags --json` under Node 22.18.0 / pnpm 10.24.0
returned `@tanstack/react-table` 9.2.6 and `recharts` 3.10.1. These generations are
selected before implementation; registry dependencies must match source imports.

Virtualized/server grids, row editing, selection managers, column resizing/reordering,
aggregation/export, chart brush/zoom, animation controls and additional chart types
remain deferred. Matching names do not promise a drop-in shadcn API.

## Ownership and execution

Two isolated streams own their family source, stories, focused tests, live example,
browser tests and slice record. Each has one fresh independent reviewer in a detached
worktree. The coordinator owns dependency manifests/lockfile, shared exports/maps,
guards/counts, catalog/registry/generated output, batch/status records, reconciliation,
packed consumer and the stable preview. Preserve others' work and retained worktrees.

Tests first, commit before reviewer mutations, confirm each mutation landed and failed
at the predicted assertion, restore from git, then one full stream gate after closure.
An independent merged review precedes the merged `pnpm verify` and a fresh external
packed consumer proof. Inspect screenshots at 390/768/1280 and isolated dark/light/
forced-colors paint; exercise keyboard and meaningful cross-family composition.

Scratch: `/home/ankit/.marquee-scratch/BATCH-PARITY-7/`. Baseline and merged gate port
4182; stream ports 4191/4192; reviewers 4195/4196; merged review 4197.
Node 22.18.0 / pnpm 10.24.0. Source UI version remains 0.1.10 (unreleased additions).
Draft PR #2 accumulates reviewed commits. No main merge, Pages, public deploy, npm
publication, domain operation or Pile backlog/database/shots work is authorized.

## Verification

Baseline at base `eea61a3`: `DOCS_PORT=4182 pnpm verify`, exit 0, 360s,
945 library / 39 docs / 5 consumer / 285 Chromium browser cases. Runner summaries
and exit sentinel: `integration/baseline.*`. Further evidence pending.

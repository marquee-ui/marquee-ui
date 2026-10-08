# BATCH-PARITY-6 — DatePicker and Table

Date: 2026-10-08. Base: `a4be556758fd82807177ddc014a7260227182fc8`.
Status: active. Publication remains held; draft PR #2 accumulates this batch.

## Ownership

| Stream | Slice                                       | Worktree/branch                         | Browser/reviewer port |
| ------ | ------------------------------------------- | --------------------------------------- | --------------------- |
| s1     | [DATE-PICKER-1](../slices/DATE-PICKER-1.md) | marquee-date-picker-1 / s/date-picker-1 | 4191 / 4195           |
| s2     | [TABLE-1](../slices/TABLE-1.md)             | marquee-table-1 / s/table-1             | 4192 / 4196           |

Streams own family source, stories, focused tests, live/copyable example and slice
record. The coordinator owns shared registration, counts, dependency declarations,
generated registry, guides, status, merged review/gate, fresh packed-consumer proof,
responsive inspection and stable localhost refresh. No Pile infrastructure applies.
Two independent streams may develop together; stagger heavy builds and gates.

DatePicker consumes the existing Calendar/Popover contracts and preserves the
standard Calendar's 328px minimum. Table is a semantic foundation, with DataTable
behavior explicitly left for Batch 7. Both are unreleased, role-styled compositions.
Current-shadcn common names do not imply interchangeable APIs.

## Evidence

Baseline `DOCS_PORT=4182 pnpm verify` at `a4be556758fd82807177ddc014a7260227182fc8`
passed on 2026-10-08: exit 0, 316s, 916 library / 39 docs / 5 consumer /
258 browser cases. This proves the starting tree only.

Scratch: `/home/ankit/.marquee-scratch/BATCH-PARITY-6/`.
Preserve the verified Batch 5 snapshot on localhost:4174 until replacement proof.

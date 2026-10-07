# Marquee release status

CURSOR: RELEASE-1 — public newcomer experience and documentation

The user authorized one bounded release batch: prove the published packages in a clean
consumer, ship a useful documentation/demo site, and restore green CI. No library version
bump or product work is planned. [Batch plan](docs/batches/RELEASE-1.md).

| Slice                                   | Owner           | State    |
| --------------------------------------- | --------------- | -------- |
| [CONSUMER-1](docs/slices/CONSUMER-1.md) | consumer stream | admitted |
| [DOCS-1](docs/slices/DOCS-1.md)         | docs stream     | admitted |

MID-SLICE: Baseline gate passed (36 files / 645 tests). The in-progress docs preview
is running at `http://localhost:4176/marquee-ui/` from the DOCS-1 worktree. Next steps:
complete the clean consumer proof and live docs, independent reviews, and merged verification. User requested local review before publication: hold public hosting, merge
and deploy until instructed onward.

Next: finish and verify the localhost preview already shown to the user. The user does not own the proposed domain yet;
no domain purchase or public deployment is authorized after the latest steering.

## Session log

| Date       | Batch     | Result                                |
| ---------- | --------- | ------------------------------------- |
| 2026-10-08 | RELEASE-1 | Composed; implementation in progress. |

# COMMON-API-AUDIT-1 — original-family contract audit

Batch: BATCH-PARITY-8. Stream: s1, `s/parity8-common-api`.
Audit date: 2026-10-09.
Candidate source: `6cd97f2196a7cee15e01fea373c353043b6d72b0`.
Public release remains held; this stream does not publish or alter component behavior.

## Scope and result

Own only `docs/common-name-api.md` and this slice record. Audit the original 21 families:
Accordion, Alert, Avatar, Badge, Breadcrumb, Button, Card, Checkbox, DescriptionList,
Form, Input, Label, Pagination, RadioGroup, Ribbon, Separator, Sheet, Switch, Textarea,
Toast and Toggle. The guide records exported UI parts, native/primitive hosts, state and
form ownership, migration differences, source evidence and finite validation limits.

Read the package entry point, each family source, its story module, relevant dedicated
tests, component parity program and supported stack. Checked current official shadcn
Radix pages and selected Base UI pages/primitive documentation through the web tool on
2026-10-09. Links and the comparison date are in the public guide, where they support
the individual contracts rather than implying a universal shadcn API.

Material distinctions: no Form root/controller, native choice inputs, caller-managed
button Switch/Toggle, native-image Avatar, responsive Dialog-based Sheet with an internal
portal/overlay, and controlled Toast without a manager. DOM live-region roles are
identified without claiming automatic audible announcements. DescriptionList and Ribbon
are Marquee additions; the guide claims no shadcn catalog counterparts for them.

## Validation and review

Owner checks on 2026-10-09, repeated after the review corrections:

- Prettier 3.9.6 writes and checks both owned Markdown files successfully. Invoked the
  existing formatter at `/home/ankit/Code/marquee-ui/node_modules/.bin/prettier` with
  Node 22.18.0 on PATH; this cold docs-only worktree has no node_modules installation.
- `python /home/ankit/.marquee-scratch/BATCH-PARITY-8/s1/check-audit.py` exits 0:
  21 inventory families, 70 component exports matched to source/entry point, 37
  source assertion snippets, 43 distinct local targets, and 38 official URLs returning
  HTTP 200. Source targets are checked locally because the candidate is not pushed.
  The sibling recipe-contracts guide is explicitly pending reconciliation.
- `git diff --check` exits 0.

Runner report: `/home/ankit/.marquee-scratch/BATCH-PARITY-8/s1/audit-link-source-check.json`.
Saved official web-tool excerpts:
`/home/ankit/.marquee-scratch/BATCH-PARITY-8/s1/official-web-evidence.txt`.

Independent fresh-context review completed on 2026-10-09 in detached worktree
`/home/ankit/Code/marquee-parity8-common-review`, starting at the committed first draft
`eed0b2c125f2997b40976e4848a9f642b8a5ec61`. The reviewer read all 21 implementations,
their exports/stories, the specific cited test assertions and official primary docs.
Independent formatting and committed-diff checks exit 0; its own link/export checker
exits 0 with 21 families, 70 component exports and 38/38 official URLs returning HTTP 200.

No P0, P1 or P2 finding. Two P3 precision findings are closed and independently verified:

- Button width full/auto applies to primary, primaryRounded, secondary and danger.
  Ghost keeps its inline-flex drawing and ignores width; inventory and migration prose
  now say so.
- RadioGroup's naming guard checks non-empty ARIA strings or a direct fieldset legend,
  without resolving aria-labelledby or reading legend text. The guide now names these
  structural limits and keeps a meaningful accessible name with the caller.

No finding remains open in the corrected guide. Review report and independent check
artifacts: `/home/ankit/.marquee-scratch/BATCH-PARITY-8/s1/review/report.md` and its directory.

This is a prose-only audit: no source mutation tests, new guard suite or product-browser
run belongs to this stream. The coordinator owns the merged gate and rendered-guide
validation. The sibling stream owns `docs/recipe-contracts.md`, linked by the guide and
to be checked after reconciliation.

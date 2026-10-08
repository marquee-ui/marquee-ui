# COMMON-API-AUDIT-1 — original-family contract audit

Batch: BATCH-PARITY-8. Stream: s1, `s/parity8-common-api`.
Audit date: 2026-10-09. Candidate source: `6cd97f2`.
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

Initial draft checks on 2026-10-09:

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

Independent fresh-context review: pending after the first draft commit, in detached
worktree `/home/ankit/Code/marquee-parity8-common-review`.
Review artifacts: `/home/ankit/.marquee-scratch/BATCH-PARITY-8/s1/review`.

This is a prose-only audit: no source mutation tests, new guard suite or product-browser
run belongs to this stream. The coordinator owns the merged gate and rendered-guide
validation. The sibling stream owns `docs/recipe-contracts.md`, linked by the guide and
to be checked after reconciliation.

# BATCH-PARITY-8 independent review closure

Date: 2026-10-09. Final reviewed audit/site source:
`87f25c556a80536471476ff1911bd23155f1a684`.
**GREEN within the finite documentation/API-audit scope; no open findings.**
The full corrected gate, rendered preview and CI remain separate coordinator
measurements in [the batch record](BATCH-PARITY-8.md).

## Independent stream reviews

The common-name reviewer independently read all 21 original source families,
70 component exports, stories and focused evidence, and checked contemporary
primary references. Two P3 draft wording findings closed at `52f28ee`:
Button's full/auto width axis excludes ghost, and RadioGroup's naming guard is
structural rather than proof of a meaningful accessible name. Source reading,
link/export/inventory checks and formatting support this prose verdict; no new
component behavior or consumer/browser proof is claimed.

The recipe/install reviewer independently read the 14 candidate implementations,
131 exports and 74 documentation links, current official shadcn/Radix/Base UI,
TanStack, DayPicker and Recharts references, and original install provenance.
One P3 introduction ambiguity closed at `a30f7df`: state-only roots/Providers
lack DOM hosts; Tabs/Slider roots expose their documented hosts. Published
21-family/22-item contents and the candidate's 35-family/36-item contents remain
distinct despite the unchanged source version 0.1.10. The Batch 7 packed proof
is reused evidence for selected compositions, not a fresh Batch 8 install.

Each reviewer used a separate detached worktree. Their original reports and
closure checks are retained under
`/home/ankit/.marquee-scratch/BATCH-PARITY-8/{s1,s2}/review/report.md`.

## Merged review and narrow correction closure

A fresh merged reviewer independently checked the union, all 35 contracts,
all 14 availability labels, all 264 unchanged product/install input hashes,
current primary-reference samples and actual MarkdownGuide rendering. Four
canonical guides, 16 fences, tables and local links rendered successfully;
the four focused MarkdownGuide tests passed. No API/ownership/evidence finding
remained in the union.

The coordinator's first full gate at `f19714c` exited 1: 995 library,
39 docs and five consumer checks passed; browser verdict was 286 passed,
26 failed. New prose caused mobile page overflow and exposed whole-page family
heading ambiguity plus a single-table assumption in three existing specs.
Original failures remain retained; they are not relabeled as a green gate.

The reviewer closed the one-line `overflow-wrap: anywhere` correction at
`2157efb` using the same built site: mobile page width 408 → 390px; tablet and
desktop page geometry and code geometry stayed unchanged. Named table regions
kept their native horizontal scrolling. The first scratch comparator incorrectly
required unchanged table width; its exit-1 result is retained as an instrument
error, separate from the corrected causal proof.

At `203cf1e`, three existing browser cases now scope the actual focused family
heading, require Tabs focus, and check/capture each of the two supported-stack
tables. Collection remains 312 cases in 17 files. Independent evidence:
**9/9 targeted cases green before controls and 9/9 after restoration** at
390/768/1280. Three mutations were confirmed landed and each failed at the
intended assertion: wrong Chart heading focus, wrong Tabs heading focus and
second-table header/body paint equality. All mutations were restored from git;
review checkout and formatter checks are clean. This focused run is not the
full corrected gate.

The reviewer statically closed the final `d25539d` paragraph repair: component
behavior/evidence limits remain separate from documentation rendering/navigation
validation. Site/CSS/test bytes are identical to the independently browser-tested
`203cf1e`; the coordinator subsequently builds the final source for its gate.

The full d25539d runner exposed one missed sibling selector in the Tabs
forced-colors test: 309 browser passed / three failed on the same strict
heading ambiguity. Final 87f25c5 scopes that focus to the family workbench,
retains every paint assertion and leaves site/product bytes unchanged.
The independent reviewer closed that exact one-line diff and an AST/manual
census of all seven browser heading-role calls. No remaining candidate-name
collision remains; actual Button count is one, Tabs count two but scoped family
Tabs count one/focused, site h1 one and guide h1 zero. The complete Tabs file
passes **six cases at all three widths, exit 0, 11.4s**, against restored staging
using the retained d25539d build (identical build inputs). Its first attempt
failed before assertions with connection refusal after the staging listener was
lost; that environment log remains separate. No unrelated earlier controls were
rerun. The final full gate remains coordinator-owned.
Full independent report and DECISIONS:
`/home/ankit/.marquee-scratch/BATCH-PARITY-8/merged-review/report.md`.

## CI time-budget closure

The two exact `d9f6204` CI jobs reached the 15-minute limit. Official annotations
and full cancelled logs are retained in `integration/ci-*-timeout.*`; neither
cancelled job is counted as a successful gate. The push runner reported 312
browser passes before cancellation and the PR reached case 299, with preceding
995/39/5 checks green in both. A one-line workflow correction changes only
`timeout-minutes: 15` to `20`; runner commands, assertions, corpus and product/site
inputs remain unchanged. Bounded independent review and exact-new-head CI close
this configuration change before final handoff; no duplicate local product gate
or packed install is required for an unchanged product.

## DECISIONS

1. Accept useful public-facing contract guides for the original 21 and candidate
   14 families; matching names do not promise drop-in APIs. Preserve caller
   state, rendering, semantic hosts, forms and explicit composition duties.
2. Keep published baseline, moving candidate source and reused packed evidence
   visibly distinct at installation/copy choices. No version bump or public
   contents change is implied.
3. Retain DataTable's caller-created/reactive TanStack 9 instance and Chart's
   caller-composed Recharts 3 primitives. Whole-SVG native reveal precedes Tab;
   natural Tab alone has no full-box guarantee. Modal Line/Tooltip node lifetime
   remains an explicit caller recipe, not a general focus-manager promise.
4. Accept the narrow prose wrapping and stronger family-focus/two-table browser
   checks, with independent causal controls. Keep the full 312-case gate intact.
5. Preserve the finite deferred catalog/API/framework/assistive-tech limits and
   existing global story-play no-op survivor/host-only focus inventory. No broad
   runner project or remaining-family implementation is authorized by this audit.
6. Finish this finite eight-batch queue after the coordinator's required closure;
   do not invent a ninth batch. Draft PR #2 and all public release operations
   remain held.

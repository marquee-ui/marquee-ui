# Independent Tailwind marker supplement: closed

Final reviewed head: `1eb82b81ceddc19ccca0b527aae3bff5ac4fcfa7`. Original marker guard head: `c79a84108cc5d0f8f43d81e8955e7d02c0ac458f`. Owned detached reviewer tree `/home/ankit/.marquee-scratch/BATCH-PARITY-7/r6/worktree`; Node 22.18.0 / pnpm 10.24.0. Earlier Chart and client-boundary evidence remains intact. The family implementation, stories and browser behavior are unchanged by these shared-guard corrections.

Outcome: **no remaining actionable findings; ready for the authorized corrected full gate**. The independently discovered nested caller-root gap is closed by the explicit root exclusion at `packages/ui/test/tailwind-compile.test.tsx:182`, with the strengthened nested-root fixture at line 205. Removing only that exclusion from the committed correction fails the exact retained assertion; git restoration passes **all 48 tests**, exit 0. Focused ESLint also exits 0. Reviewer tree is clean.

The guard exempts exactly 42 observed non-utility renderer markers inside chart descendants. Known utilities, unknown marker-like names, ordinary outside elements, and caller chart-container roots retain utility checks. The actual collected marker set must equal the declared set, so an unused exception fails. `recharts-surface` remains checked because the library owns its compiled focus selector; a broad prefix exception incorrectly skips it and is caught.

## Counterexample evidence

Every source mutation was made on a committed detached head, predicted in writing before launch, confirmed by an exact `.landed.diff`, run with full log and actual exit/summary inspection, restored with `git restore --source=HEAD --worktree`, and followed by a complete restored 48-test run. No assertions were removed. The t06 regression-input probe is identified separately from source-collapse coverage.

| Case / committed head                                             | Actual named red, exit 1                                                                                                                                                                                                                                                        | Restoration                                 |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| t01 classifier collapse / c79a841                                 | Three genuine-marker fixtures expected false, actual true; marker set empty versus 42; `compiles every one of them` lists the 42 renderer markers. **5 failed / 43 passed**                                                                                                     | 48 passed, exit 0                           |
| t02 arbitrary recharts- prefix / c79a841                          | `requires a utility for recharts-not-a-marker with chart ancestry true: true`, expected true / actual false; exact collected-set assertion also rejects newly exempted `recharts-surface`. **2 failed / 46 passed**                                                             | 48 passed, exit 0                           |
| t03 remove ancestry/root constraint / c79a841                     | Outside-marker and caller-root fixtures expected true / actual false. **2 failed / 46 passed**                                                                                                                                                                                  | 48 passed, exit 0                           |
| t04 add never-rendered exception / c79a841                        | `collected a real candidate set` names `recharts-review-never-rendered`, declared 43 versus actual 42. **1 failed / 47 passed**                                                                                                                                                 | 48 passed, exit 0                           |
| t05 missing owned utility beside actual renderer marker / c79a841 | Caller `className="bg-review-missing-utility"` on the real North Bar joins `recharts-bar` in the fixed Chart Keyboard renderer. `compiles every one of them` names that missing utility despite chart ancestry. **1 failed / 47 passed**                                        | 48 passed, exit 0                           |
| t06 nested caller-root regression input / c79a841                 | Existing caller-root fixture attached beneath an outer chart, expected true / actual false at `requires a utility on the caller's chart container itself`. **1 failed / 47 passed**. This exposes a current scope defect, rather than removing the classifier or its assertions | Restore input: 48 passed, exit 0            |
| t07 remove only explicit root protection / 1eb82b8                | Committed strengthened nested-root fixture fails at the same named caller-root assertion, expected true / actual false. **1 failed / 47 passed**; other 47 tests pass                                                                                                           | Restore final correction: 48 passed, exit 0 |

Actual Recharts Bar source joins `recharts-bar` with caller className (`packages/ui/node_modules/recharts/es6/cartesian/Bar.js:474`), so t05 uses the real renderer and exercises the guard's handling of caller utilities on that rendered element. It does not merely synthesize a test DOM node with a known marker.

## Validation and limits

The clean original baseline is `tailwind-marker-clean-baseline.log/.exit`, 48 passed / exit 0. The initial baseline and mutation launches briefly overlapped; that initial log is retained but not relied on. Tokens were already built by the reviewer's earlier builds of unchanged token/product sources. Each root Vitest run compiles the real stylesheet from current source/story directories with automatic source detection disabled.

Final validation is `t07-root-protection-closure.restored.log/.exit`: **48 passed / exit 0**, 2.52 seconds on 2026-10-08; final focused lint is `tailwind-marker-final-eslint.log/.exit`, exit 0. Full product gate evidence belongs to the stream; this reviewer ran no full gate.

Cumulative reviewed evidence: **29 committed-subject mutations plus one regression-input probe across twelve touched test-bearing surfaces**. The marker supplement contributes six subject mutations (t01–t05 and t07) and the one input probe (t06); earlier Chart work contributes eighteen subject mutations and the client-boundary supplement contributes five.

Honest survivors: none among the five requested source controls or final root-protection removal. The t06 current-code regression became the retained fixture and is closed by t07. This guard checks CSS class existence and marker ownership bounds for the actual story DOM it collects; it does not measure painted chart geometry. Earlier independent browser geometry/focus evidence and its documented instrument ceilings remain in `review-final.md`; client classification evidence remains in `client-boundary-supplement.md`.

## Commands and retained evidence

Runner for every baseline, red and restored run:

`PATH=/home/ankit/.nvm/versions/node/v22.18.0/bin:$PATH pnpm exec vitest run --project ui packages/ui/test/tailwind-compile.test.tsx`

Final lint:

`PATH=/home/ankit/.nvm/versions/node/v22.18.0/bin:$PATH pnpm exec eslint packages/ui/test/tailwind-compile.test.tsx`

All evidence remains under `/home/ankit/.marquee-scratch/BATCH-PARITY-7/r6/`: `run-tailwind-marker-mutations.py`, `run-tailwind-nested-root-probe.py`, `run-tailwind-root-closure.py`, matching driver logs, and t01–t07 `.prediction.txt`, `.landed.diff`, `.red.log/.exit`, `.restored.log/.exit`. The initial finding record is `tailwind-marker-initial.md`. No stream source edits, commits, pushes or public operations were performed by the reviewer.

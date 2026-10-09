# Independent client-boundary review supplement

Exact reviewed head: `91f6a146b92c40ac28f12b0c619c59c0693170b5`. Owned detached reviewer worktree `/home/ankit/.marquee-scratch/BATCH-PARITY-7/r6/worktree`; Node 22.18.0 / pnpm 10.24.0. Existing Chart evidence and review reports remain intact. The change is confined to `packages/ui/test/client-boundary.test.ts`; prior Chart product source is unchanged.

Outcome: no actionable findings. Baseline **22 passed**, exit 0; focused ESLint exit 0. Each requested counterexample landed on committed source, with prediction written before launch, exact diff retained, complete runner log and actual exit read, then git restoration from this head and a complete **22 passed**, exit 0 rerun. No assertion body was gutted.

| Mutation and exact source                                                          | Named red and actual summary                                                                                                                                                                               | Restored result   |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| b01: remove opening directive from `packages/ui/src/chart.tsx:1`                   | `opens every file importing client-only hooks or libraries with "use client"`; offenders includes `packages/ui/src/chart.tsx (imports recharts)`. Exit 1, **1 failed / 21 passed**                         | 22 passed, exit 0 |
| b02: configured runtime library set at `client-boundary.test.ts:111` becomes empty | All five runtime fixtures fail expected `[recharts]`, actual `[]`; `does not spend the boundary on a file that is entitled to none` also fails with actual `chart.tsx`. Exit 1, **6 failed / 16 passed**   | 22 passed, exit 0 |
| b03: remove whole-type exclusion at line 127                                       | `requires a boundary only for runtime client-library imports in "import type { TooltipProps } from recharts"`; expected `[]`, actual `[recharts]`. Exit 1, **1 failed / 21 passed**                        | 22 passed, exit 0 |
| b04: inline-all-type exclusion at line 134 becomes false                           | Same named fixture family for `import { type TooltipProps }`; expected `[]`, actual `[recharts]`. Exit 1, **1 failed / 21 passed**                                                                         | 22 passed, exit 0 |
| b05: remove nonempty binding requirement at line 133                               | Exact `import {} from recharts` fixture; expected `[recharts]`, actual `[]`. Exit 1, **1 failed / 21 passed**. The side-effect import fixture stays green, so the vacuous `every` control is distinguished | 22 passed, exit 0 |

The TypeScript AST parser recognizes actual import declarations and excludes comment/string lookalikes. The whole-type clause exclusion and inline-all-type exclusion remain separate. A nonempty named binding requirement prevents `import {}` from being classified by vacuous `every`; a runtime default binding keeps the all-type exclusion from applying. Both real-source guards use `needsBoundary` (lines 268 and 276), so classification collapse is caught by both fixtures and the real Chart wasteful-boundary verdict.

Installed dependency inspection confirms Legend imports `useLayoutEffect` / `createPortal`, Tooltip imports `useEffect` / `createPortal`, and the root ESM entry does not open with a client directive. The existing local Chart directive is therefore justified within this finite guard. Its boundary treatment follows the official guidance to mark library entry points wrapping components that rely on client features. [Next.js third-party components](https://nextjs.org/docs/app/getting-started/server-and-client-components#third-party-components).

Honest survivors: none among these five requested mutations. This remains a finite import guard covering React hooks and configured client-only libraries, with Recharts the new classified library. It does not inspect arbitrary unclassified third-party imports. No Next integration build or full product gate was run; the source guard's successful result is not a framework support certification. Earlier documented Chart review instrument ceilings remain recorded in `review-final.md`.

Exact runner command for baseline, every red and every restored rerun:

`PATH=/home/ankit/.nvm/versions/node/v22.18.0/bin:$PATH pnpm exec vitest run --project ui packages/ui/test/client-boundary.test.ts`

Focused lint:

`PATH=/home/ankit/.nvm/versions/node/v22.18.0/bin:$PATH pnpm exec eslint packages/ui/test/client-boundary.test.ts`

Evidence: `run-client-boundary-mutations.py`, `client-boundary-mutation-driver.log`, baseline `.log/.exit`, ESLint `.log/.exit`, and each `b01`–`b05` `.prediction.txt`, `.landed.diff`, `.red.log/.exit`, `.restored.log/.exit` under `/home/ankit/.marquee-scratch/BATCH-PARITY-7/r6/`.

Readiness: supplemental review passes at the exact head. Detached worktree is clean. Proceed to the stream's authorized full gate.

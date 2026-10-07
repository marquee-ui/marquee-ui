# CONSUMER-1 — clean published consumer and accurate onboarding

Own the README, `docs/getting-started.md`, `docs/supported-stack.md`,
`examples/consumer/**`, `scripts/verify-consumer.mjs`, and this document.
Do not edit another stream's files, root configuration, workflows or STATUS.

Prove a completely fresh consumer using published `@marquee-ui/ui@0.1.10` and
`@marquee-ui/tokens@0.1.0`, installed from npm without workspace/link substitution.
Exercise the actual shadcn registry dependency resolution and render representative
components in a working React 19 + Tailwind 4 build. The example must be reproducible
outside this monorepo; record exact commands, runner exits and browser evidence.
Correct the README publication contradiction, provide a concise quickstart covering
fonts, token imports, Tailwind scanning, aliases and registry mappings, and state the
supported stack and genuine limitations. Avoid claiming a fully offline CLI install
unless every dependency is available offline. No npm release or library changes without
reporting a demonstrated blocker first.

Use tests first for any script logic. Commit before detached layer-1 review/mutations;
record that review here, then run `pnpm verify` and push `s/consumer-1`.

## Consumers

Before implementation, `git diff f0f5f6e...HEAD --name-only` returned no files.
The path scan of `packages` and `.storybook` found no consumers of
`docs/getting-started.md`, `docs/supported-stack.md`, `scripts/verify-consumer.mjs`
or `examples/consumer`. No existing library contract changes.

At the commit point, the exported-symbol scan (`rg -n '^export (async function|function)'`
over `scripts` and `examples/consumer`) named `verifyLock`, `assertExternalTarget`,
`registryItemPath`, `createRegistryServer` and the starter's `App`. Their consumers:

- `scripts/verify-consumer.test.mjs`: artifact provenance, external-target isolation,
  registry item path checks.
- `scripts/verify-consumer.mjs`: registry server and the two provenance guards.
- `examples/consumer/registry.mjs`: local registry server entrypoint.
- `examples/consumer/src/main.tsx`: `App`.
- CROSS: root test/verify wiring, owned by DOCS-1. Requested a `test:consumer` command
  running the node:test file; DOCS-1 accepted the integration seam.
- CROSS: DOCS-1 renders canonical Markdown via `?raw`. Sent docs-only commits
  `eb2378a19f487269533ffda701cbdc5c22716135` and
  `2ef29bd450033257eb53fc896a3090baa5993929` for its localhost preview.

No package exports, routes or library class strings changed. The browser's roles
are consumed only by the standalone test. New source lives outside the pnpm
workspace; no Pile paths, database or workers are involved. Five names scanned,
two CROSS seams, no UNOWNED behaviour.

## As built

Measured 2026-10-08 IST, with Node 22.18.0 and npm 11.6.4. The root project uses
pnpm 10.24.0. Evidence directory:
`/home/ankit/.marquee-scratch/RELEASE-1/s1/`.

### Tests first and corrected assumptions

- `node --test scripts/verify-consumer.test.mjs` first exited 1 because the subject
  module did not exist. Implemented explicit rejection of absent lock entries,
  local/file links, substituted registry hosts, wrong versions and integrity
  metadata, existing targets and symlinked paths back into the checkout. The
  completed runner reports five tests passed after review closure, none skipped, exit 0.
- Actual shadcn 4.21.4 run against the README's relative namespace mapping exited
  1: `The item at https://ui.shadcn.com/r/./node_modules/@marquee-ui/ui/r/button.json
was not found.` Corrected the guide; an HTTP namespace mapping resolves the
  dependency. No npm release or library API change was needed.
- Initial browser run exited 1 on expected token background `rgb(10, 11, 7)` versus
  transparent document paint. Tokens define roles; the app must apply its page
  roles. Added body background/foreground utilities and an explicit root HTML
  source. The existing-app guide documents both.
- Local registry bind 4176 was occupied by a sibling's preview. Preserved it and
  used 4186. The consumer production preview uses 4175.

### Published-artifact proof

`node scripts/verify-consumer.mjs /home/ankit/.marquee-scratch/RELEASE-1/s1/cold-reviewed`
exited 0. Its source-copy allowlist excludes dependencies, caches and generated
components. The destination was new and outside the workspace; npm used a fresh
cache inside it. `npm ci` fetched the published packages, and the harness compared
their exact npm tarball URLs, versions and integrity metadata to live `npm view`
before and after install. Both installed package directories are physical,
consumer-local directories. The npm lock and `proof/provenance.json` retain the
tarball identities.

The harness served `node_modules/@marquee-ui/ui/r` on 127.0.0.1:4186, ran the actual
shadcn CLI's namespaced installation, and compared the normalized contents of all eight copied files to the
installed package's registry content. `@marquee/utils` became `src/lib/utils.ts`;
the seven families are Button, Accordion, Sheet, Switch, Input, Label and Card.
No components were copied from this checkout's library source.

`npm run build` exited 0, building React 19.3.0 / Tailwind 4.3.3 / Vite 8.3.3.
`npm run proof` reports **2 passed (2.9s)**, exit 0, Chromium at 390×844 and
1280×800, one worker, no retries. Each browser checks three loaded FontFace
entries, three HTTP 200 `font/woff2` responses with `wOF2` bytes, resolved body and
display font roles, token paint, button height/shadow, typed input, click state,
keyboard switch state with 20px thumb movement, accordion disclosure, and sheet
Escape dismissal with focus restored. Browser observations are attached in
`proof/results.json`; `proof/consumer-phone.png` and `proof/consumer-desktop.png`
are real captures, and the phone capture was visually inspected.

### Network registry proof

In the separate external `cold-consumer` directory, the raw GitHub `main`
`@marquee` mapping followed by `npm run add:components` exited 0 and created the
same eight target paths. The source is deliberately described as moving with
`main`, independently of npm package pins. Its build exited 0; the browser runner reports **2 passed (2.8s)**, exit 0.
Evidence is `network-proof.log` and `network-proof.exit`.

### Decisions

1. Primary onboarding uses the simple GitHub namespace URL; the standalone
   template's config matches it. The cold harness overrides to a local HTTP
   namespace for release-pinned npm artifact proof.
2. Document font loading, preset choice, explicit Tailwind sources, both alias
   layers and full `components.json` in one canonical quickstart. The README
   links to it and corrects the publication/offline claims.
3. Cold network/browser verification remains an explicit harness command.
   Fast provenance/unit checks are offered to DOCS-1 for root gate wiring.
4. Browser proof covers Chromium phone/desktop; other frameworks, React 18,
   Tailwind 3 and other browser engines are recorded as unvalidated.
5. Public site activation remains held for the user's localhost review. The
   canonical URL is GitHub Pages; domain ownership is not assumed.

## Layer 1 (reviewer, detached worktree of 00e47e97bcb73a7cd90a59500747784ef3847b62, slot 5)

<!-- prettier-ignore -->
| file | test | mutation applied | red / GREEN | what it asserts now |
| --- | --- | --- | --- | --- |
| scripts/verify-consumer.test.mjs | installed registry serves named JSON items and rejects traversal or unrelated files | 00e47e9: verifyLock returns published without checking artifacts | GREEN | The filename parser only; it does not exercise HTTP serving. |
| scripts/verify-consumer.test.mjs | accepts the exact registry tarballs and their live integrity metadata | 00e47e9: verifyLock returns published without checking artifacts | GREEN | Positive acceptance and the returned metadata value; rejection belongs to the next test. |
| scripts/verify-consumer.test.mjs | rejects missing, substituted, linked, wrong-version and wrong-integrity packages | 00e47e9: verifyLock returns published without checking artifacts | red | Reject test fails at its missing-entry arm: Missing expected exception. |
| scripts/verify-consumer.test.mjs | requires a new target outside the checkout, including through symlinked parents | 00e47e9: verifyLock returns published without checking artifacts | GREEN | External, absent target and symlink-parent containment. |
| scripts/verify-consumer.test.mjs | installed registry serves named JSON items and rejects traversal or unrelated files | 00e47e9: registryItemPath accepts every pathname via pathname.slice(1) | red | Parser rejects ../package.json rather than returning it. |
| scripts/verify-consumer.test.mjs | accepts the exact registry tarballs and their live integrity metadata | 00e47e9: registryItemPath accepts every pathname via pathname.slice(1) | GREEN | Positive acceptance and the returned metadata value; rejection belongs to the next test. |
| scripts/verify-consumer.test.mjs | rejects missing, substituted, linked, wrong-version and wrong-integrity packages | 00e47e9: registryItemPath accepts every pathname via pathname.slice(1) | GREEN | Rejection of missing entries and each substituted artifact field for both packages. |
| scripts/verify-consumer.test.mjs | requires a new target outside the checkout, including through symlinked parents | 00e47e9: registryItemPath accepts every pathname via pathname.slice(1) | GREEN | External, absent target and symlink-parent containment. |
| scripts/verify-consumer.test.mjs | installed registry serves named JSON items and rejects traversal or unrelated files | 00e47e9: assertExternalTarget returns resolve(requested) without checks | GREEN | The filename parser only; it does not exercise HTTP serving. |
| scripts/verify-consumer.test.mjs | accepts the exact registry tarballs and their live integrity metadata | 00e47e9: assertExternalTarget returns resolve(requested) without checks | GREEN | Positive acceptance and the returned metadata value; rejection belongs to the next test. |
| scripts/verify-consumer.test.mjs | rejects missing, substituted, linked, wrong-version and wrong-integrity packages | 00e47e9: assertExternalTarget returns resolve(requested) without checks | GREEN | Rejection of missing entries and each substituted artifact field for both packages. |
| scripts/verify-consumer.test.mjs | requires a new target outside the checkout, including through symlinked parents | 00e47e9: assertExternalTarget returns resolve(requested) without checks | red | Containment rejection fails: Missing expected rejection. |
| scripts/verify-consumer.test.mjs | installed registry serves named JSON items and rejects traversal or unrelated files | 00e47e9: createRegistryServer always returns HTTP 404 | GREEN | No assertion observes the HTTP server; the named serve behavior can disappear. |
| scripts/verify-consumer.test.mjs | accepts the exact registry tarballs and their live integrity metadata | 00e47e9: createRegistryServer always returns HTTP 404 | GREEN | Positive acceptance and the returned metadata value; rejection belongs to the next test. |
| scripts/verify-consumer.test.mjs | rejects missing, substituted, linked, wrong-version and wrong-integrity packages | 00e47e9: createRegistryServer always returns HTTP 404 | GREEN | Rejection of missing entries and each substituted artifact field for both packages. |
| scripts/verify-consumer.test.mjs | requires a new target outside the checkout, including through symlinked parents | 00e47e9: createRegistryServer always returns HTTP 404 | GREEN | External, absent target and symlink-parent containment. |
| scripts/verify-consumer.test.mjs | registry item paths reject traversal and unrelated files | Closure 4ee5524: createRegistryServer always returns HTTP 404 | GREEN | Filename parser remains independently intact. |
| scripts/verify-consumer.test.mjs | installed registry serves exact JSON over HTTP and rejects missing, traversal and POST requests | Closure 4ee5524: createRegistryServer always returns HTTP 404 | red | Exact HTTP status 200, application/json, and fixture bytes; mutant returns 404, no MIME, constant body. |
| scripts/verify-consumer.test.mjs | accepts the exact registry tarballs and their live integrity metadata | Closure 4ee5524: createRegistryServer always returns HTTP 404 | GREEN | Positive acceptance and the returned metadata value; rejection belongs to the next test. |
| scripts/verify-consumer.test.mjs | rejects missing, substituted, linked, wrong-version and wrong-integrity packages | Closure 4ee5524: createRegistryServer always returns HTTP 404 | GREEN | Rejection of missing entries and each substituted artifact field for both packages. |
| scripts/verify-consumer.test.mjs | requires a new target outside the checkout, including through symlinked parents | Closure 4ee5524: createRegistryServer always returns HTTP 404 | GREEN | External, absent target and symlink-parent containment. |
| examples/consumer/tests/consumer.spec.ts | published registry components paint, load fonts and respond to pointer and keyboard [phone] | 00e47e9 external copy: Add one onClick replaced with no-op | red | Count must become 1; mutant remains Count: 0. |
| examples/consumer/tests/consumer.spec.ts | published registry components paint, load fonts and respond to pointer and keyboard [desktop] | 00e47e9 external copy: Add one onClick replaced with no-op | red | Count must become 1; mutant remains Count: 0. |
| examples/consumer/tests/consumer.spec.ts | published registry components paint, load fonts and respond to pointer and keyboard [phone] | 00e47e9 external copy: remove bundled fonts.css import | red | Three loaded FontFace entries; mutant has zero. |
| examples/consumer/tests/consumer.spec.ts | published registry components paint, load fonts and respond to pointer and keyboard [desktop] | 00e47e9 external copy: remove bundled fonts.css import | red | Three loaded FontFace entries; mutant has zero. |
| examples/consumer/tests/consumer.spec.ts | published registry components paint, load fonts and respond to pointer and keyboard [phone] | 00e47e9 external copy: AccordionContent collapsed to permanently visible div | GREEN | Only post-click visibility; the test cannot observe initial hidden or closing behavior. |
| examples/consumer/tests/consumer.spec.ts | published registry components paint, load fonts and respond to pointer and keyboard [desktop] | 00e47e9 external copy: AccordionContent collapsed to permanently visible div | GREEN | Only post-click visibility; the test cannot observe initial hidden or closing behavior. |
| examples/consumer/tests/consumer.spec.ts | published registry components paint, load fonts and respond to pointer and keyboard [phone] | Closure 326029d external copy: AccordionContent collapsed to permanently visible div | red | Initial closed state must hide content; Expected hidden / Received visible at line 101. |
| examples/consumer/tests/consumer.spec.ts | published registry components paint, load fonts and respond to pointer and keyboard [desktop] | Closure 326029d external copy: AccordionContent collapsed to permanently visible div | red | Initial closed state must hide content; Expected hidden / Received visible at line 101. |

Two MEDIUM findings are closed. The original HTTP-serving GREEN rows prompted
`4ee55243d4ab311a91a666cccc090db202f1c77f`: the parser test is now named for its
actual property, and a separate real HTTP roundtrip checks exact JSON, MIME,
status, missing items, traversal and method rejection. The same always-404
mutation now fails the expected HTTP assertion. Original accordion GREEN rows
prompted `326029d65fdade7f30a813c3b2f9a77ddc53b2f7`: the browser checks initial
closed state and both open/close transitions. The same always-visible mutation
now fails the expected hidden-content assertion at both widths.

GREEN rows for mutations of a different helper retain their independent
assertions; no unrelated tests were changed. The positive artifact-acceptance
case remains a valid positive control, with rejection proved by its separate
negative test. Both whole-surface GREEN omissions above were fixed and re-probed.

One LOW metadata discrepancy is also fixed in
`3f72f4a77ab05d3b2aeba8e48b0a43e61c407129`: Vite and its React plugin require
Node 22.12+ within Node 22, and the starter's engine/lock and canonical docs now
state that minimum. Installed dependency metadata confirms it; an older Node
runtime was not exercised.

The reviewer ran nine subject mutations and preserved every GREEN row. Restored
runs report five node tests passed, zero failed, exit 0, and two browser tests
passed (2.9s), exit 0. The independent cold npm harness also exited 0, with two
browser tests passed (2.8s). No unresolved HIGH or MEDIUM remains. Full reviewer
report and logs: `/home/ankit/.marquee-scratch/RELEASE-1/r5/report.md`. The clean
detached reviewer worktree was removed; evidence remains in `r5`.

## Full gate

The single root `pnpm verify` after independent review exited 0 at
`426c7ef3c0b490d9833d0285ed806cf07171a62a`, measured 2026-10-08 IST. The runner
reports **Test Files 36 passed (36)** and **Tests 645 passed (645)**, unit duration
4.17s. Lint, typecheck, token/registry/Storybook builds and the full root suite
completed. Gate log creation to exit-sentinel creation was 17 seconds, measured
with `stat -c '%W'` over `s1/verify.log` and `s1/verify.exit`.

Root gate wiring for fast consumer tests is owned by DOCS-1; this isolated stream
separately ran `node --test scripts/verify-consumer.test.mjs` with five passed and
no skips. The final fresh-cache consumer command at `326029d` exited 0 and its
browser runner reports two passed (2.9s), no retries or skips. That production
consumer is at `s1/cold-reviewed`; root `pnpm verify` does not run this network
browser proof. No gate was skipped or substituted with a filtered test result.

After this measured gate, only this result paragraph was added and formatted.
No library, generated registry or consumer implementation changed.

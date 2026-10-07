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
  completed runner reports four tests passed, none skipped, exit 0.
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

`node scripts/verify-consumer.mjs /home/ankit/.marquee-scratch/RELEASE-1/s1/cold-final`
exited 0. Its source-copy allowlist excludes dependencies, caches and generated
components. The destination was new and outside the workspace; npm used a fresh
cache inside it. `npm ci` fetched the published packages, and the harness compared
their exact npm tarball URLs, versions and integrity metadata to live `npm view`
before and after install. Both installed package directories are physical,
consumer-local directories. The npm lock and `proof/provenance.json` retain the
tarball identities.

The harness served `node_modules/@marquee-ui/ui/r` on 127.0.0.1:4186, ran the actual
shadcn CLI's namespaced installation, and compared all eight copied files to the
installed package's registry content. `@marquee/utils` became `src/lib/utils.ts`;
the seven families are Button, Accordion, Sheet, Switch, Input, Label and Card.
No components were copied from this checkout's library source.

`npm run build` exited 0, building React 19.3.0 / Tailwind 4.3.3 / Vite 8.3.3.
`npm run proof` reports **2 passed (2.7s)**, exit 0, Chromium at 390×844 and
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
`main`, independently of npm package pins. Its build exited 0. Browser runner
evidence is `network-proof.log` and `network-proof.exit`.

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

## Layer 1

Pending.

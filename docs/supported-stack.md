# Supported stack

Marquee targets React 19 and Tailwind CSS 4. The published baseline is
`@marquee-ui/ui@0.1.10` and `@marquee-ui/tokens@0.1.0`; the standalone
consumer in `examples/consumer` pins those packages with an npm lockfile.
The unreleased `next` candidate prepares UI `0.2.0` with the existing published
tokens `0.1.0`. A version in this checkout does not establish public npm availability.
See the [release proposal](https://github.com/marquee-ui/marquee-ui/blob/next/docs/releases/0.2.0.md)
for the artifact installation path and held publication steps.

| Layer             | Consumer configuration                                          |
| ----------------- | --------------------------------------------------------------- |
| Runtime           | Node 22.12+ within Node 22; verified on 22.18.0 with npm 11.6.4 |
| UI                | React and React DOM 19.3.0; UI package peers are `^19`          |
| Styling           | Tailwind CSS and `@tailwindcss/vite` 4.3.3                      |
| Build             | Vite 8.3.3, `@vitejs/plugin-react` 6.1.1, TypeScript 5.9.3      |
| Component install | shadcn CLI 4.21.4; namespaced `@marquee` registry               |
| Consumer shape    | Vite client app, strict TypeScript, `@/*` mapped to `src/*`     |
| Fonts             | Three bundled woff2 faces, served by the app; SIL OFL 1.1       |
| Presets           | `arcade` through `tokens.css`, or `light` through `light.css`   |

The npm packages distribute token stylesheets and registry source. Import your
copied components from the app, such as `@/components/ui/button`; the registry
also installs Marquee's token-aware class-merging helper. Adding components is
the supported onboarding path. The UI package's TypeScript source export is
not a precompiled, drop-in JavaScript bundle.

## Published baseline and candidate evidence

Checked 2026-10-09 against the retained installed published registry, the starter
manifest/lock, current source/registry and the records linked below:

| Evidence                                                                                         | Scope                                                                                                                                                        | What it establishes                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Published UI 0.1.10                                                                              | Original 21 families; 22 registry items including `utils`                                                                                                    | Release-pinned source in the installed npm package; the fourteen parity additions are absent.                                                                                                                                                          |
| Published consumer proof, measured 2026-10-08                                                    | Seven selected families: Button, Accordion, Sheet, Switch, Input, Label and Card; eight copied files including `utils`; two Chromium cases at 390 and 1280px | A cold npm install, strict TypeScript/Vite build, source-byte comparison and those consumer journeys. It does not exercise all 21 published families.                                                                                                  |
| Unreleased `next` candidate                                                                      | 35 families; 36 registry items including `utils`                                                                                                             | The source/registry inventory after batches 1–7. The fourteen additions are Select, Tabs, Dialog, AlertDialog, Popover, Tooltip, DropdownMenu, Slider, Combobox, Calendar, DatePicker, Table, DataTable and Chart.                                     |
| Batch 7 packed candidate, source `15c266e3a47be44ad40c26db4d961ca31cd09a9f`, measured 2026-10-08 | 21 selected families; 22 copied files including `utils`; 99 Chromium cases at 390, 768 and 1280px                                                            | Fresh external packed-artifact install, strict TypeScript/Vite build and the recorded bounded compositions. This is reused Batch 7 evidence, not a fresh Batch 8 consumer run or public npm proof, and it does not exercise all 35 candidate families. |

Commands and provenance are retained in
[CONSUMER-1](https://github.com/marquee-ui/marquee-ui/blob/next/docs/slices/CONSUMER-1.md),
[Batch 7](https://github.com/marquee-ui/marquee-ui/blob/next/docs/batches/BATCH-PARITY-7.md)
and its
[packed provenance](https://github.com/marquee-ui/marquee-ui/blob/next/docs/batches/BATCH-PARITY-7-evidence/consumer-provenance.json).
The [Batch 8 audit record](https://github.com/marquee-ui/marquee-ui/blob/next/docs/slices/RECIPE-INSTALL-AUDIT-1.md)
records the inventory check. [Recipe contracts](./recipe-contracts.md) define caller
responsibilities and deferred behaviors; [common-name APIs](./common-name-api.md)
cover deliberate differences in the original families. A named family or a passing
journey does not establish full shadcn catalog/API parity.

The [release-readiness batch](https://github.com/marquee-ui/marquee-ui/blob/next/docs/batches/RELEASE-READINESS-1.md)
closes the two runner gaps recorded in Batch 7. Each story play must increase the
Storybook assertion count; omitted calls and a no-op play were proved to fail.
The focus suite now follows compiled selectors to the actual Chart SVG and fails
when its descendant rules or width disappear while the host outline remains.
These checks supplement the isolated browser paint journeys. They do not certify
every possible assertion, SVG descendant or caller composition.

## Boundaries

- React 18, Tailwind 3, alternative bundlers, SSR and React Server Components
  have not been validated by this consumer proof. Interactive Radix parts need
  a client boundary in an SSR framework.
- Tailwind 4 requires modern browser CSS support. Follow its
  [compatibility requirements](https://tailwindcss.com/docs/compatibility);
  the retained consumer proofs exercise Chromium at the widths above. Safari,
  Firefox and other browser/viewport consumer runs remain unvalidated.
- GitHub registry URLs follow their named branch independently of npm versions.
  `main` serves the published-era registry; `next` serves the moving unreleased
  candidate. Use a reviewed commit SHA for repeatable candidate source or the
  installed-package registry server for a pinned published release.
- Registry files are bundled for local serving. A cold CLI install still needs
  npm, the CLI, component dependencies and, for browser verification, a browser
  download. Local registry files alone do not make the process offline.
- Copy-in updates are your responsibility: review diffs when reinstalling a
  component. Fonts and tokens update through the npm package; copied components
  do not update automatically.
- The presets and component tests enforce token contracts and accessible parts.
  Your composition still owns labels, focus order, responsive layout and any
  control made interactive with `asChild`.

The canonical installation commands and published proof harness are in
[getting started](./getting-started.md). Source-supported primitive APIs, client
directives and library tests do not validate an SSR/RSC framework integration.
Other bundlers, React 18, Tailwind 3 and browsers outside the retained proof remain
unvalidated; this audit adds documentation without extending that evidence.

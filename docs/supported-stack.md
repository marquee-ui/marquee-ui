# Supported stack

Marquee's components target React 19 and Tailwind CSS 4. The published packages
are `@marquee-ui/ui@0.1.10` and `@marquee-ui/tokens@0.1.0`; the standalone
consumer in `examples/consumer` pins its dependencies with an npm lockfile.

| Layer             | Consumer configuration                                        |
| ----------------- | ------------------------------------------------------------- |
| Runtime           | Node 22; npm for the standalone starter                       |
| UI                | React and React DOM 19.3.0; UI package peers are `^19`        |
| Styling           | Tailwind CSS and `@tailwindcss/vite` 4.3.3                    |
| Build             | Vite 8.3.3, `@vitejs/plugin-react` 6.1.1, TypeScript 5.9.3    |
| Component install | shadcn CLI 4.21.4; namespaced `@marquee` registry             |
| Consumer shape    | Vite client app, strict TypeScript, `@/*` mapped to `src/*`   |
| Fonts             | Three bundled woff2 faces, served by the app; SIL OFL 1.1     |
| Presets           | `arcade` through `tokens.css`, or `light` through `light.css` |

The npm packages distribute a token stylesheet and registry source. Import your
copied components from the app, such as `@/components/ui/button`; the registry
also installs Marquee's token-aware class-merging helper. Adding components is
the supported onboarding path. The UI package's TypeScript source export is
not a precompiled, drop-in JavaScript bundle.

## Boundaries

- React 18, Tailwind 3, alternative bundlers, SSR and React Server Components
  have not been validated by this consumer proof. Interactive Radix parts need
  a client boundary in an SSR framework.
- Tailwind 4 requires modern browser CSS support. Follow its
  [compatibility requirements](https://tailwindcss.com/docs/compatibility);
  this release's consumer proof exercises Chromium. Safari and Firefox consumer
  runs are not part of that proof.
- The GitHub `main` registry follows current source. It is independent of npm's
  installed version. Use the installed-package registry server when component
  version reproducibility matters.
- Registry files are bundled for local serving. A cold CLI install still needs
  npm, the CLI, component dependencies and, for browser verification, a browser
  download. Local registry files alone do not make the process offline.
- Copy-in updates are your responsibility: review diffs when reinstalling a
  component. Fonts and tokens update through the npm package; copied components
  do not update automatically.
- The presets and component tests enforce token contracts and accessible parts.
  Your composition still owns labels, focus order, responsive layout and any
  control made interactive with `asChild`.

The canonical installation commands and reproducible proof are in
[getting started](./getting-started.md). The release slice records the measured
commands, runner exits and browser evidence rather than treating this table as
a claim that every framework or browser has been tested.

# Getting started

Marquee pairs a published token package with components you copy into your React app.
You own the copied components. Their colours, type, spacing and depth come from roles
in `@marquee-ui/tokens`.

## Run the starter

Use Node 22.12 or newer within Node 22. Copy the starter outside this repository's pnpm workspace, then install
with npm:

```sh
git clone https://github.com/marquee-ui/marquee-ui.git
cp -R marquee-ui/examples/consumer my-marquee-app
cd my-marquee-app
npm ci
npm run add:components
npm run dev
```

Open the localhost URL Vite prints. The starter uses React 19, TypeScript, Vite and
Tailwind 4. Its package lock pins `@marquee-ui/ui@0.1.10` and
`@marquee-ui/tokens@0.1.0`. The default component registry reads GitHub's `main`
branch, which can change independently of those npm versions.

## Unreleased preview components

The local review site also includes Select and Tabs from the component-parity program.
They are not in published UI 0.1.10 or the main-branch registry yet. The starter above
continues to demonstrate that published release.

To try the candidate source after setting up the app below, change only the registry
mapping's branch from `main` to `next`, then run:

```sh
npx shadcn@4.21.4 add @marquee/select @marquee/tabs
```

The `next` registry is an unreleased, moving review branch. Pin its path to a reviewed
commit SHA for repeatable source installs. It uses the same token roles and alias setup;
its declared primitive dependencies are installed by the CLI. The
[parity program](https://github.com/marquee-ui/marquee-ui/blob/next/docs/component-parity.md)
records scope and limits. Local packed-artifact proof for these additions is recorded in
[BATCH-PARITY-1](https://github.com/marquee-ui/marquee-ui/blob/next/docs/batches/BATCH-PARITY-1.md).

## Add Marquee to an existing app

Start with a React 19 + Vite + TypeScript app. Install the tokens and Tailwind's
Vite integration:

```sh
npm install --save-exact @marquee-ui/tokens@0.1.0
npm install --save-dev --save-exact tailwindcss@4.3.3 @tailwindcss/vite@4.3.3
```

Configure both Vite's runtime alias and TypeScript's typechecking alias. Keep your
other TypeScript options; add these to `compilerOptions`:

```json
{
  "baseUrl": ".",
  "paths": { "@/*": ["src/*"] }
}
```

In `vite.config.ts`:

```ts
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
```

Create `src/index.css`, with imports in this order, and import it once from your
React entrypoint:

```css
@import "tailwindcss" source(none);
@import "@marquee-ui/tokens/fonts.css";
@import "@marquee-ui/tokens/tokens.css";
@source "./";
@source "../index.html";
```

Tailwind comes first so Marquee's role definitions take precedence. `fonts.css`
loads the three bundled, self-hosted woff2 faces; the token stylesheet assigns
them to display, body and mono roles. `@source "./"` scans `src`, including your
copied components. Paths in `@source` are relative to the stylesheet. Explicit
scanning keeps tests and unrelated repository files out of the generated CSS.
The second source includes Vite's root HTML. Give the page its roles, for example
`<body class="bg-background text-foreground">` in `index.html`; importing tokens
defines the roles without applying an application background.
See [Tailwind's source detection documentation](https://tailwindcss.com/docs/detecting-classes-in-source-files).

For the light preset, replace the `tokens.css` import with
`@marquee-ui/tokens/light.css`; keep the font import. Import one preset per page.

Create `components.json` at the app root:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "registries": {
    "@marquee": "https://raw.githubusercontent.com/marquee-ui/marquee-ui/main/packages/ui/r/{name}.json"
  }
}
```

Then install a component:

```sh
npx shadcn@4.21.4 add @marquee/button
```

The registry mapping also resolves `@marquee/utils`, the shared `cn` helper,
into `src/lib/utils.ts`. The CLI installs the component's declared dependencies.
No Tailwind 3 config file is needed. `new-york` and `neutral` are CLI settings;
Marquee's token preset supplies the actual appearance.

Use your local copy:

```tsx
import { Button } from "@/components/ui/button";

export function Example() {
  return <Button width="auto">Make it yours</Button>;
}
```

## Reproduce the pinned npm registry

For component source tied to a release, use the registry shipped inside the
published UI package. In the starter, `npm ci` already installs it. In another
app, install `@marquee-ui/ui@0.1.10` with `--save-exact` first.

The shadcn CLI's namespaced mapping does not resolve a relative
`./node_modules/.../{name}.json` template as a local registry. Serve those JSON
files over localhost instead. The starter includes a small server:

```sh
npm run registry
```

Keep it running, and change the starter's `components.json` registry mapping to:

```json
{
  "registries": {
    "@marquee": "http://127.0.0.1:4186/{name}.json"
  }
}
```

In a second terminal, run `npm run add:components`, then `npm run build`. You can
stop the registry server once the files have been copied. Registry JSON comes
from the installed package; npm dependencies and the shadcn CLI may still need
network access. This is a version-pinned registry source, not a promise of a
fully offline installation.

## Run the cold consumer proof

From the Marquee repository, supply a new directory outside the checkout whose
parent already exists:

```sh
node scripts/verify-consumer.mjs /tmp/marquee-cold-consumer
```

The harness uses a fresh npm cache, verifies npm tarball URLs and integrity
metadata, rejects linked packages, resolves registry dependencies from the
installed package, builds the app, and runs Chromium against the production
build. Browser results, a screenshot and provenance are written to the new
consumer's `proof/` directory. Network access and Playwright's Chromium system
dependencies are required. `CONSUMER_PORT` and `CONSUMER_REGISTRY_PORT` override
the default proof ports, 4175 and 4186.

See [supported stack and limitations](./supported-stack.md) before adopting the kit.

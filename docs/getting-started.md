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

The local review site also includes Select, Tabs, Dialog, AlertDialog, Popover, Tooltip, DropdownMenu, Slider, Combobox and Calendar from the component-parity program.
They are not in published UI 0.1.10 or the main-branch registry yet. The starter above
continues to demonstrate that published release.

To try the candidate source after setting up the app below, change only the registry
mapping's branch from `main` to `next`, then run:

```sh
npx shadcn@4.21.4 add @marquee/select @marquee/tabs @marquee/dialog @marquee/alert-dialog @marquee/popover @marquee/tooltip @marquee/dropdown-menu @marquee/slider @marquee/combobox @marquee/calendar
```

If the app already uses a Sheet from an earlier Marquee release, update its Dialog
primitive before combining it with the new overlays or Select. Older Dialog versions and newer overlay primitives
maintain separate focus stacks, which can break nested keyboard selection
and leave pointer input blocked after closing:

```sh
npm install '@radix-ui/react-dialog@^1.2.0'
```

The candidate Sheet registry declares this minimum automatically. Existing copied Sheet
source keeps its API; it needs the compatible dependency rather than a markup rewrite.

The `next` registry is an unreleased, moving review branch. Pin its path to a reviewed
commit SHA for repeatable source installs. It uses the same token roles and alias setup;
its declared primitive dependencies are installed by the CLI. The
[parity program](https://github.com/marquee-ui/marquee-ui/blob/next/docs/component-parity.md)
records scope and limits. Local packed-artifact proof for these additions is recorded in
[BATCH-PARITY-1](https://github.com/marquee-ui/marquee-ui/blob/next/docs/batches/BATCH-PARITY-1.md)
[BATCH-PARITY-2](https://github.com/marquee-ui/marquee-ui/blob/next/docs/batches/BATCH-PARITY-2.md)
[BATCH-PARITY-3](https://github.com/marquee-ui/marquee-ui/blob/next/docs/batches/BATCH-PARITY-3.md)
[BATCH-PARITY-4](https://github.com/marquee-ui/marquee-ui/blob/next/docs/batches/BATCH-PARITY-4.md)
and [BATCH-PARITY-5](https://github.com/marquee-ui/marquee-ui/blob/next/docs/batches/BATCH-PARITY-5.md).

Combobox is a composed **single-select searchable popup** using cmdk and Radix Popover.
It is not a drop-in copy of the current shadcn Base UI Combobox API. Editable inline
inputs, chips/multiple selection, object collections and virtualization remain outside
this contract. The caller owns the committed value, its displayed label and form transport;
search navigation is separate from selection. Label the search with `ComboboxCommand`'s
`label` and the results with `ComboboxList`'s `label`, which wire cmdk's own ARIA IDs.
Popover parts and the supported input/item/empty/separator hosts retain `asChild`;
cmdk 1.1.1's root/list/group native `asChild` path is unsupported and omitted from those
wrapper types. Their children remain caller-composed. Its live example shows the supported parts.

Calendar uses DayPicker 10 selection and replaceable component slots, with role-based
styles and full-size day/navigation targets. Single, multiple and range selection are
supported; caller-owned selection, labels, locale and formatting stay explicit. DatePicker
popup/input composition is the next batch. Time selection, alternate calendars and exhaustive
timezone/locale validation are not included in the current proof.

The default Calendar needs **at least 328px of inner host width** for seven 44px day
columns, padding and borders. Week numbers and custom slots may need more. Keep this
space available instead of clipping the grid or shrinking day targets. For the default
390px mobile overlay examples, `DialogContent className="p-3"` provides 330px inside
its frame; `PopoverContent className="w-auto p-2"` sizes to the calendar. Calendar's
intrinsic minimum stays in force even when its caller is narrower.

DropdownMenu composes action items, checkbox/radio choices and directional submenus.
Portals, indicators, arrows and chevrons are explicit parts. Selection closes by default;
prevent its default to keep a settings menu open. It is modal by default and supports
non-modal composition. Use Select for a form value rather than menu actions.

Slider composes Root, Track, Range and each named Thumb explicitly. Values, range
separation, keyboard/pointer input, orientation, direction and reset follow Radix.
A controlled caller must accept reset changes. **Disabled Slider alone still submits
named values in Radix 1.5.0.** Wrap it in a native disabled fieldset to exclude its form
value, as the verified example does; this is not native-disabled submission parity.
No wrapper form controller or implicit thumb factory is included.

Dialog and AlertDialog expose explicit Portal, Overlay and Content parts. Compose their
titles, descriptions and actions inside Content; no close icon or confirmation controls
are inserted for you. Dialog supports modal and non-modal interactions. AlertDialog is
always a confirmation modal: Cancel receives initial focus, outside interaction cannot
dismiss it, and Action/Cancel remain separate parts. Prevent Action's click default and
use controlled open state when completion should wait for an asynchronous operation.
Giving Sheet `role="alertdialog"` alone does not supply these confirmation semantics.

Popover defaults to non-modal behavior and supports an explicit modal option. Compose
Portal, Content, Arrow and Close separately; use accessible labels on Content. Its
Header, Title and Description are optional presentation slots, so wire IDs and
`aria-labelledby` / `aria-describedby` yourself when using them as the label.

Tooltip has an explicit Provider, Portal and Arrow. Keep its text short; it supplements an already
named control; it must not contain interactive actions or carry essential instructions
that touch users cannot otherwise reach. Provider delay and hover behavior remain
configurable. Use Popover when the content needs interaction.

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

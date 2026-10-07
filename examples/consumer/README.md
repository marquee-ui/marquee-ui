# Published Marquee consumer

A standalone React + Vite app for the published Marquee packages. It is excluded
from the repository's pnpm workspace. Copy this directory outside the checkout
before using npm; `src/components/ui` and `src/lib/utils.ts` are created by shadcn,
not copied from monorepo source.

Follow the repository's [getting started guide](https://github.com/marquee-ui/marquee-ui/blob/main/docs/getting-started.md)
for installation, CSS ordering, aliases and the two registry choices.
`components.json` defaults to GitHub's `main` registry. `registry.mjs` can serve
the registry inside the installed npm UI package when you need release-pinned
component source.

`npm run build` typechecks and builds. `npm run proof` runs real Chromium against
that production build at phone and desktop widths. It checks font responses and
loaded faces, token paint, component dimensions, pointer input, keyboard switch
operation, disclosure and dialog focus restoration. Results and screenshots go
to `proof/`. Install Chromium with `npm exec -- playwright install chromium` first;
the operating system must supply Playwright's browser dependencies.

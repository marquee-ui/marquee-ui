# Theme studio and local CSS recipes

The documentation site has independent **Dark / Light** controls and four curated
palettes. Arcade acid uses the existing Arcade and Light presets. Electric pairs
violet identity with cyan actions, Clementine pairs coral identity with peach
actions, and Tide pairs mint identity with blue actions. The additional palettes
are local demo customizations: they are **not preset exports in npm 0.1.0**.
The package versions and published entrypoints are unchanged.

The compact studio stays at the top of the viewport while you read the guides.
“Try the theme studio” in getting-started returns to it. Mode and palette change
the canonical roles on the document root, so the page, component explorer and
composed examples repaint together. The three self-hosted font faces remain the
same. Valid preferences persist across refresh. Malformed or unavailable storage
falls back to dark Arcade; blocked writes still allow the current selection.

“Make it expressive” changes the composed demo card: display type, an identity
frame and a hard shadow when enabled; body type, a quiet frame and soft depth
when disabled. This is caller composition and styling, with no new library API.

## Use the selected recipe

1. Choose a mode and palette in the studio.
2. Find **Your palette, as CSS** under **The design language** and copy the
   selected theme recipe. At wider widths, **Get the CSS** jumps to it.
3. Place the recipe in your application stylesheet after its Tailwind import. If
   you already import the token stylesheet, keep one import and place the recipe’s
   `:root` override afterward. Keep the optional fonts import only if your
   framework does not load the faces itself.

The copyable recipe contains all selected color roles and depth values, along
with `color-scheme`. It does not depend on an unavailable palette package export.
It changes the skin; the shared spacing, type scale, radii and motion skeleton
stay intact. The expressive card treatment belongs to this demo and is not part
of the palette recipe.

Use `brand` / `brand-foreground` for identity fills, `brand-ink` for identity text,
`primary` / `primary-foreground` for action fills and `primary-ink` for links and
focus. The light palettes deliberately separate ink from fill. Syntax uses the
same readable roles: action and identity ink, status ink, and foreground tiers.

The local assignments live in `packages/tokens/src/presets/docs-themes.ts`; color,
font and shadow literals belong in the preset directory. The theme tests check
all eight choices against the canonical role matrix and real browser rendering
at 390, 768 and 1280 pixels, including focus, fills, persistence and keyboard
operation with reduced motion.

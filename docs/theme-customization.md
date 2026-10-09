# Theme studio and local CSS recipes

The compact theme studio stays at the top while you read. Its sun/moon buttons
choose **Dark / Light**. The swatch and palette name open a visual settings panel:
choose a **Base palette** and an independent **Action accent**, then press **Done**.
Escape also closes the panel and returns focus to the trigger. On phones, the
choices scroll above Done; every option remains reachable by keyboard.

The four bases set surfaces and identity. Arcade acid uses the existing Arcade
and Light presets; Electric pairs violet identity with cyan actions, Clementine
pairs coral identity with peach actions, and Tide pairs mint identity with blue
actions. **Automatic** keeps each base's action color. Lime, Mint, Cyan, Blue,
Violet, Pink and Amber override buttons, links, focus and action-colored syntax
without changing the base's surfaces or headings. Dark and Light work with every
combination. The three self-hosted font faces remain the same.

Valid choices persist across refresh. Older saved mode/palette/expressive settings
load with Automatic accent. Malformed settings or unavailable storage fall back
to dark Arcade with Automatic; blocked writes still allow live selection. Stored
roles are applied before the first React composition paints.

“Make it expressive” changes the composed demo card: display type, an identity
frame and a hard shadow when enabled; body type, a quiet frame and soft depth
when disabled. This is caller composition and styling, with no new library API.

## Use the selected recipe

1. Choose a mode, base palette and action accent in the studio.
2. Find **Your palette, as CSS** under **The design language** and copy the
   selected theme recipe. At wider widths, **Get the CSS** jumps to it.
3. Place the recipe in your application stylesheet after its Tailwind import. If
   you already import the token stylesheet, keep one import and place the recipe's
   `:root` override afterward. Keep the optional fonts import only if your
   framework does not load the faces itself.

The recipe matches the active combination, including every color role, depth
value and `color-scheme`. These are **local customizations, not preset exports in
npm 0.1.0**. Package versions and published entrypoints are unchanged. The shared
spacing, type scale, radii and motion skeleton stay intact. The expressive card
composition is separate from the recipe.

Use `brand` / `brand-foreground` for identity fills, `brand-ink` for identity text,
`primary` / `primary-foreground` for action fills and `primary-ink` for links and
focus. Light recipes separate ink from fill so bright accents remain readable.
Syntax uses action and identity ink, status ink, and foreground tiers.

Local assignments live in `packages/tokens/src/presets/docs-themes.ts`; color,
font and shadow literals belong in the preset directory. The data-driven tests
check all 64 base/mode/accent combinations against the complete role checks.
Browser tests exercise visible effects, contrast, copied CSS, persistence,
keyboard focus and responsive geometry at 390, 768 and 1280 pixels, including the
last accent above Done at a 390×664 viewport.

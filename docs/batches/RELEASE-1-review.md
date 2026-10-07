# RELEASE-1 independent cross-review

Original report at `8f142360`; the narrow closure is recorded below.

DECISIONS

1. Use GitHub’s `main` registry for simple onboarding and localhost serving of the installed npm registry for version-pinned installs. [V]
   Why: both paths work; the guides clearly distinguish their version guarantees.

2. Keep UI `0.1.10` and tokens `0.1.0`, with the npm consumer outside the pnpm workspace. [V]
   Why: the clean consumer proves published artifacts without requiring a library release.

3. Render consumer-owned Markdown and copy examples directly from their executable source. [V]
   Why: installation guidance stays canonical, and displayed compositions match live previews.

4. Assemble Vite documentation and Storybook under `/marquee-ui/`, using generated font stylesheets and local assets. [V]
   Why: the prepared default GitHub Pages destination works without a custom domain.

5. Include docs, three-width browser checks, and fast consumer checks in `pnpm verify`; keep cold npm/browser proof explicit. Require Node `22.12+` within Node 22. [V]
   Why: routine verification covers the integrated site while published-artifact verification remains a separate network-dependent operation.

6. Keep publication, Pages activation, merging, and deployment held pending the user’s direction after localhost review. [V]
   Why: the user explicitly requested local review first.

HIGH: None.

MEDIUM — PROVED, awaiting owner closure

- `apps/docs/src/styles.css:21` overrides the intended skip-link foreground at line 566. `a:not([data-slot])` has greater specificity than `.skip-link`, so keyboard users see nearly invisible text when the first Tab reveals “Skip to content.”
- Concrete case: open `http://localhost:4174/marquee-ui/` at 390, 768, or 1280px and press Tab. Chromium reports `"color": "rgb(242, 245, 232)"` over `"background": "rgb(228, 255, 58)"`: **1.018:1 contrast**, instead of the intended dark `--primary-foreground`.
- The skip action itself works. Correct the foreground specificity and verify the focused link’s rendered contrast.

LOW: None.

Review evidence at `8f142360`:

- Computed 20 overlapping paths; all are borrowed consumer changes, with identical final contents across both streams.
- All 23 registry JSON files match the installed published package byte for byte. Every example’s component imports exist there.
- At all three widths: three loaded font families, no document overflow, failed requests, or page errors; canonical guide links resolve correctly.
- Nested Storybook serves its font stylesheet and font with HTTP 200; selecting Light loads the nested preset and changes the rendered background correctly.

No additional findings. Ready to verify the narrow skip-link correction on the updated preview.

## Final closure

Closure — **PROVED** on the rebuilt 4174 preview from `3d8d7b2`.

At 390, 768, and 1280px, first Tab reveals and focuses “Skip to content” with `rgb(10, 11, 7)` text on `rgb(228, 255, 58)`: **17.544:1 contrast**. Enter navigates to `#main`; subsequent Tab reaches “Start building.” All assertions passed, exit 0.

README reconciliation `547db49` is coherent with setup, runtime requirements, preview commands, and the publication hold.

**No open HIGH, MEDIUM, or LOW findings. Existing DECISIONS remain unchanged.**

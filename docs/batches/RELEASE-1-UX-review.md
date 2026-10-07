DECISIONS

1. Offer Arcade acid, Electric, Clementine and Tide independently of Dark / Light. [V]
   Why: separate identity/action choices and mode now repaint the whole page and live previews immediately.
2. Make the expressive switch change the demo card's type, frame and depth. [V]
   Why: the control now has a visible, described composition effect without adding a component API.
3. Map language-aware syntax to existing readable theme roles and scope its presentation selectors. [V]
   Why: code follows the selected skin, retains contrast, and wins over the shared stylesheet's generic code rules.
4. Copy the selected color/depth CSS recipe and label additional palettes as local customizations. [V]
   Why: the recipe reproduces the active skin while published package versions and preset exports remain unchanged; expressive composition is explicitly separate.

Findings: **0 HIGH / 0 MEDIUM / 0 LOW**. No deviations from the two slice contracts found.

Reviewed merged `5df4a7980b2b25d9d06f7f954844eb3b032f78eb` against `77b09ee734fe8bafc20688058e2606d9b35acbdd`, using production preview `http://localhost:4183/marquee-ui/` on 2026-10-08. Read-only; no tree edits, build, gate, capture or publication action.

Computed overlap from both stream diffs: `apps/docs/src/copy-code.tsx`, `apps/docs/test/copy-code.test.tsx`, the batch doc, both slice docs and `STATUS.md` (excluded per role). CopyCode and its unit file match final CODE contents exactly. Read the union of Consumers and product diff; no unowned cross-stream consumer identified.

PROVED browser evidence: all 24 combinations (four palettes × two modes × 390/768/1280) pass. Per viewport, eight distinct page/preview grounds and keyword inks; at least four painted syntax colors; minimum observed syntax contrast **5.0696:1**. Actual primary/brand fills, heading/prose ink and selected controls pass 4.5:1. CSS recipe grammar is active, every copied recipe byte matches displayed source, and every recipe declaration matches the selected root assignment. Existing code strings stay identical. Changes neither reload nor overflow the document. Sticky controls meet 44px, receive hit-testing, and retain keyboard focus; the long recipe scroller's focused top remains below the toolbar. Stored Tide/light returns on refresh; no page exceptions.

Evidence: `browser-seams.json`, `probe.mjs`, `probe.log` in this directory; final probe runner exit 0. An initial instrument used exact label-text lookup, which includes the native select's option text; the accessible role snapshot correctly names it Palette. Replacing that lookup with its real combobox role completed the same probe. No product failure inferred from the locator timeout.

Bounds: existing per-stream negative controls and family-suite results remain their owners' evidence. No renewed broad test audit, consumer/deployment audit or WebKit claim. This closure covers the merged source; the forthcoming theme gate-record commit is documented as source-identical.

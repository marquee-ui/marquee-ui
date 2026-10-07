Evidence paths in this preserved report refer to `/home/ankit/.marquee-scratch/RELEASE-1-CONTROLS/layer2/`.

DECISIONS

1. Compose the visual picker from the existing Sheet and native-radio parts; keep explicit pressed Dark/Light buttons with icons. [V]
   WHY: This fits the approved compact design and retains existing modal focus, keyboard selection and scroll behavior without expanding the library API.
2. Offer Automatic plus seven local action accents; override the five primary roles while retaining base identity and grounds. [V]
   WHY: Existing actions, links, focus and syntax already consume these roles, so independent accents propagate without repainting the brand.
3. Retain the v1 preferences key, upgrade valid three-field settings to Automatic, and default malformed or invalid values safely. [V]
   WHY: Existing choices survive the added accent field, while unavailable storage cannot prevent live customization.
4. Keep the picker focus correction local and tie each visible tick to its own checked input. [V]
   WHY: Bright Light-mode fills need readable action ink for the outline; the composed picker can supply it without changing public RadioGroup behavior.

Findings: HIGH 0 / MEDIUM 0 / LOW 0. No blocking seam or slice-contract deviation found.

Scope: clean frozen `f020c59b31e7c7d5691ee7c772e2ac4a314ce53a`, compared with `1701d86d0f05bb125c25c3fdfc1be8e5f2ccbf64`.
One implementation stream; the set of files touched by multiple streams is empty.
Read CONTROLS-1 Consumers, the product diff and unchanged startup, CopyCode, syntax/CSS, Sheet and RadioGroup consumers.
No tracked writes, build, gate, screenshot suite, source mutations, publication or parity audit performed.

PROVED — production Chromium at `http://localhost:4183/marquee-ui/`, 2026-10-08:

| Base       | Mode  | Accent    | Viewport | Action text | Action syntax | Focus outline |
| ---------- | ----- | --------- | -------- | ----------- | ------------- | ------------- |
| Arcade     | Dark  | Automatic | 390×844  | 17.544:1    | 17.956:1      | 13.722:1      |
| Arcade     | Light | Lime      | 1280×900 | 16.783:1    | 7.168:1       | 8.801:1       |
| Electric   | Dark  | Mint      | 768×1024 | 13.113:1    | 13.541:1      | 10.347:1      |
| Electric   | Light | Cyan      | 390×844  | 13.288:1    | 6.707:1       | 8.215:1       |
| Clementine | Dark  | Blue      | 1280×900 | 9.782:1     | 10.134:1      | 7.646:1       |
| Clementine | Light | Violet    | 768×1024 | 8.956:1     | 6.538:1       | 8.318:1       |
| Tide       | Dark  | Pink      | 390×844  | 10.248:1    | 10.552:1      | 7.744:1       |
| Tide       | Light | Amber     | 1280×720 | 14.202:1    | 6.116:1       | 7.601:1       |

- Each representative preserved every root declaration outside the five action roles and retained the actual preview card ground/heading; all had no page overflow.
- Action fill/on-fill ink, links, 98 relevant syntax tokens per state and focused choice outlines matched the selected roles. Ratios above use computed paint; syntax shows the minimum against its actual pre background, focus against the panel overlay.
- All 12 visible ticks matched their input checked state in every representative, exactly one selection per group; all choice rows met 44×44.
- The real clipboard exactly matched displayed selected CSS; all 44 copied custom properties and color-scheme exactly matched the root in each representative. Unchanged highlighted composition text exactly matched its source file.
- All eight legacy three-field settings upgraded to Automatic, selected accents persisted through reload, and restrained expressive state survived reload in the Violet case.
- At 390×664, keyboard Enter opened the picker; Tab/arrow keys selected Electric then Amber. Amber was focused and center-hit-testable, row 527.98–584.20 inside scroll region 221.91–590, with Done beginning at 602. Escape and keyboard Done both returned focus to the trigger.
- Invalid accent, malformed JSON and a throwing localStorage getter each rendered safe defaults and still allowed Light/Pink selection. No page errors.

REASONED — source seam assessment:

- `apps/docs/src/main.tsx:7` reads and applies preferences before createRoot; `apps/docs/src/app.tsx:93` reapplies/saves the same settings on updates.
- `apps/docs/src/theme.ts:83` is the shared declaration resolver for root paint and copied CSS; unchanged CopyCode copies the string rather than tokenized markup.
- `packages/tokens/src/presets/docs-themes.ts:124` changes only action mappings. New literals stay in the preset directory; public exports, package versions and registry are unchanged.
- `apps/docs/src/theme.css:139` uses primary ink for the composed row outline; line 148 scopes tick opacity to the checked row's descendant.

Evidence: `seams.mjs`, `seams.log`, `browser-evidence.json` beside this report. Command: `/home/ankit/.nvm/versions/node/v22.18.0/bin/node /home/ankit/.marquee-scratch/RELEASE-1-CONTROLS/layer2/seams.mjs`; final runner exit 0, verdict PASS.
The preliminary scratch probe incorrectly expected Cyan to differ from Electric/Automatic; its oracle was corrected because those intentionally share the same fill. This was no product failure.
The exhaustive 64-case role matrix and full gates remain stream/integration evidence; they were not repeated here.

# CODE-1 — theme-aware syntax highlighting and code/prose presentation

Own the code/prose surface listed in RELEASE-1-UX. Reproduce the plain current code with
browser evidence and meaningful failing checks, then add maintained language-aware
safe tokenization for TSX/TS/JS, CSS, shell, JSON and canonical fence aliases. Use React
text/token nodes, no unsafe HTML interpolation or naive regex replacement. Unsupported
languages retain readable source. Copy preserves the original code bytes exactly.

Map semantic token classes to existing contrast-safe roles so mode/palette changes
repaint code immediately. Improve code headers/language labels, inline code, readable
prose headings/list/table and local horizontal scrolling within the existing design.
No color/font/shadow literals outside presets; coordinate shared roles with THEME-1.
Source and browser assertions must see actual rendered token colors and source fidelity,
not merely class presence. Bound independent review to these behaviors, then one full gate.

## Consumers

Pending discovery.

## As built

Pending.

## Layer 1

Pending.

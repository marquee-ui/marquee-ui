/**
 * Reads declarations back out of an emitted stylesheet, so a test can assert what a
 * block CONTAINS rather than that some substring appears somewhere in the file.
 *
 * The blocks that matter here are the ones `declaredCssVars` deliberately skips - the
 * Tailwind mapping and the reduced-motion override - which is exactly where an
 * emitter can drop something with nothing noticing.
 */
export function blocksNamed(css: string, prelude: string): Record<string, string>[] {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const blocks: Record<string, string>[] = [];
  const lines = stripped.split("\n");

  for (let i = 0; i < lines.length; i++) {
    if (!lines[i]!.trim().startsWith(prelude)) continue;
    const declarations: Record<string, string> = {};
    let depth = 0;
    for (let j = i; j < lines.length; j++) {
      const line = lines[j]!;
      depth += (line.match(/\{/g) ?? []).length - (line.match(/\}/g) ?? []).length;
      const match = /^\s*([-A-Za-z][-A-Za-z0-9_]*)\s*:\s*(.+);\s*$/.exec(line);
      if (match?.[1] && match[2]) declarations[match[1]] = match[2];
      if (j > i && depth <= 0) break;
    }
    blocks.push(declarations);
  }
  return blocks;
}

import { useMemo, type ReactNode } from "react";
import { refractor } from "refractor/core";
import bash from "refractor/bash";
import css from "refractor/css";
import json from "refractor/json";
import tsx from "refractor/tsx";

// TSX registers its JSX, JavaScript, TypeScript and markup dependencies.
for (const grammar of [tsx, css, bash, json]) refractor.register(grammar);

type TokenNode = ReturnType<typeof refractor.highlight>["children"][number];

function renderTokens(nodes: TokenNode[], path = "token"): ReactNode {
  return nodes.map((node, index) => {
    if (node.type === "text") return node.value;
    if (node.type !== "element") return null;
    const key = `${path}-${index}`;
    const classes = node.properties.className;
    // Only text and spans reach React: no tag, HTML or attribute from source can execute.
    return (
      <span key={key} className={Array.isArray(classes) ? classes.join(" ") : undefined}>
        {renderTokens(node.children, key)}
      </span>
    );
  });
}

export function SyntaxCode({ code, language }: { code: string; language: string }) {
  const tokens = useMemo(() => {
    const grammar = language.trim().toLowerCase();
    return refractor.registered(grammar)
      ? renderTokens(refractor.highlight(code, grammar).children)
      : code;
  }, [code, language]);
  return <code className="syntax-code">{tokens}</code>;
}

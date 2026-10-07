import { useState } from "react";
import { Button } from "@marquee-ui/ui";
import { SyntaxCode } from "./syntax-code";
import "./code-presentation.css";

export function CopyCode({
  code,
  label,
  language = "tsx",
}: {
  code: string;
  label: string;
  language?: string;
}) {
  const [message, setMessage] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setMessage("Copied to clipboard");
    } catch {
      setMessage("Could not copy. Select the code below.");
    }
  }
  return (
    <div className="code-block code-presentation">
      <div className="code-heading">
        <div className="code-caption">
          <span className="code-language">{language.trim().toUpperCase() || "TEXT"}</span>
          <span>{label}</span>
        </div>
        <Button variant="ghost" width="auto" onClick={copy} aria-label={`Copy ${label}`}>
          Copy <span aria-hidden="true">↗</span>
        </Button>
      </div>
      <pre tabIndex={0}>
        <SyntaxCode code={code} language={language} />
      </pre>
      <span role="status" className="copy-status">
        {message}
      </span>
    </div>
  );
}

import { useState } from "react";
import { Button } from "@marquee-ui/ui";

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
    <div className="code-block">
      <div className="code-heading">
        <span>{label}</span>
        <span className="code-language">{language.toUpperCase() || "TEXT"}</span>
        <Button variant="ghost" width="auto" onClick={copy} aria-label={`Copy ${label}`}>
          Copy <span aria-hidden="true">↗</span>
        </Button>
      </div>
      <pre tabIndex={0}>
        <code>{code}</code>
      </pre>
      <span role="status" className="copy-status">
        {message}
      </span>
    </div>
  );
}

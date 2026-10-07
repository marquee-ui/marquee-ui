import { isValidElement } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CopyCode } from "./copy-code";

export function MarkdownGuide({ source }: { source: string }) {
  return (
    <div className="canonical-guide">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: () => null,
          h2: ({ children }) => <h3>{children}</h3>,
          h3: ({ children }) => <h4>{children}</h4>,
          a: ({ href, children }) => (
            <a
              href={
                href === "./supported-stack.md"
                  ? "#supported-stack"
                  : href === "./getting-started.md"
                    ? "#getting-started"
                    : href
              }
            >
              {children}
            </a>
          ),
          pre: ({ children }) => {
            if (!isValidElement<{ children: string; className?: string }>(children))
              return <pre>{children}</pre>;
            const language =
              children.props.className?.replace("language-", "").toUpperCase() ?? "Code";
            return (
              <CopyCode
                label={`${language} example`}
                code={children.props.children.replace(/\n$/, "")}
              />
            );
          },
          table: ({ children }) => (
            <div
              className="table-scroll"
              tabIndex={0}
              role="region"
              aria-label="Supported stack details"
            >
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {source}
      </Markdown>
    </div>
  );
}

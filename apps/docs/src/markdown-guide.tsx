import { isValidElement } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CopyCode } from "./copy-code";
import { pageUrl } from "./routes";

const guideLinks: Record<string, string> = {
  "./supported-stack.md": pageUrl("supported-stack"),
  "./getting-started.md": pageUrl("getting-started"),
  "./common-name-api.md": pageUrl("common-name-api"),
  "./recipe-contracts.md": pageUrl("recipe-contracts"),
};

export function MarkdownGuide({
  source,
  tableLabel = "Supported stack details",
}: {
  source: string;
  tableLabel?: string;
}) {
  return (
    <div className="canonical-guide guide-presentation">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: () => null,
          a: ({ href, children }) => <a href={guideLinks[href ?? ""] ?? href}>{children}</a>,
          pre: ({ children }) => {
            if (!isValidElement<{ children: string; className?: string }>(children))
              return <pre>{children}</pre>;
            const language = children.props.className?.replace("language-", "") ?? "text";
            return (
              <CopyCode
                language={language}
                label={`${language === "text" ? "Code" : language.toUpperCase()} example`}
                code={children.props.children.replace(/\n$/, "")}
              />
            );
          },
          table: ({ children }) => (
            <div className="table-scroll" tabIndex={0} role="region" aria-label={tableLabel}>
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

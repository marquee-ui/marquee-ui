import { useRef, useState } from "react";
import { catalog } from "./catalog";
import { CopyCode } from "./copy-code";

export function ComponentExplorer({
  baseUrl = import.meta.env.BASE_URL,
}: { baseUrl?: string } = {}) {
  const [selected, setSelected] = useState<string>("button");
  const heading = useRef<HTMLHeadingElement>(null);
  const family = catalog.find((item) => item.id === selected)!;
  const Preview = family.Preview;
  return (
    <div className="explorer">
      <div className="component-index" aria-label="Component families">
        {catalog.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-label={`Preview ${item.name}`}
            aria-pressed={selected === item.id}
            aria-controls="family-detail"
            onClick={() => {
              setSelected(item.id);
              heading.current?.focus();
            }}
          >
            <span className="component-number">{String(index + 1).padStart(2, "0")}</span>
            <span>{item.name}</span>
            <span aria-hidden="true">{selected === item.id ? "−" : "+"}</span>
          </button>
        ))}
      </div>
      <div id="family-detail" className="family-detail" aria-labelledby="family-title">
        <div className="family-heading">
          <div>
            <h3 id="family-title" ref={heading} tabIndex={-1}>
              {family.name}
            </h3>
            <p>{family.description}</p>
          </div>
          <a
            href={`${baseUrl}storybook/?path=/story/parts-${family.id.replaceAll("-", "")}--${family.story}`}
          >
            All {family.name} stories <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="family-layout">
          <div className="family-preview">
            <p className="eyebrow">LIVE PREVIEW</p>
            <div className="family-canvas">
              <Preview key={family.id} />
            </div>
          </div>
          <CopyCode key={family.id} label={`${family.name} composition`} code={family.code} />
        </div>
      </div>
    </div>
  );
}

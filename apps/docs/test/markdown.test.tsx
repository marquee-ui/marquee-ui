import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { MarkdownGuide } from "../src/markdown-guide";

beforeEach(() => vi.restoreAllMocks());

it("keeps canonical guide links on the docs site and external citations intact", () => {
  render(
    <MarkdownGuide
      source={
        "# Getting started\n\n## Setup\n\n[Limits](./supported-stack.md) and [install](./getting-started.md). [Reference](https://example.test/reference)."
      }
    />,
  );
  expect(screen.queryByRole("heading", { name: "Getting started" })).not.toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Setup", level: 3 })).toBeVisible();
  expect(screen.getByRole("link", { name: "Limits" })).toHaveAttribute("href", "#supported-stack");
  expect(screen.getByRole("link", { name: "install" })).toHaveAttribute("href", "#getting-started");
  expect(screen.getByRole("link", { name: "Reference" })).toHaveAttribute(
    "href",
    "https://example.test/reference",
  );
});

it("copies the canonical fenced command without Markdown syntax", async () => {
  const user = userEvent.setup();
  const write = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
  render(<MarkdownGuide source={"```sh\nnpm ci\nnpm run dev\n```"} />);
  await user.click(screen.getByRole("button", { name: "Copy SH example" }));
  expect(write).toHaveBeenCalledExactlyOnceWith("npm ci\nnpm run dev");
});

it("passes the fence grammar and removes only the renderer's closing newline", async () => {
  const user = userEvent.setup();
  const write = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
  const { container } = render(
    <MarkdownGuide source={"```css\n:root { color: var(--foreground); }\n\n```"} />,
  );
  const source = ":root { color: var(--foreground); }\n";
  expect(container.querySelector("pre code")?.textContent).toBe(source);
  expect(container.querySelector(".token.property")?.textContent).toBe("color");
  await user.click(screen.getByRole("button", { name: "Copy CSS example" }));
  expect(write).toHaveBeenCalledExactlyOnceWith(source);
});

it("keeps an unspecified fence plain and leaves inline code in prose", () => {
  const { container } = render(
    <MarkdownGuide source={"Use `count` here.\n\n```\nconst count = 2;\n```"} />,
  );
  expect(container.querySelector("p code")?.textContent).toBe("count");
  expect(container.querySelector("pre code")?.textContent).toBe("const count = 2;");
  expect(container.querySelectorAll("pre code span")).toHaveLength(0);
  expect(screen.getByText("TEXT", { exact: true })).toBeVisible();
});

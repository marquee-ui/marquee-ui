import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { CopyCode } from "../src/copy-code";

beforeEach(() => vi.restoreAllMocks());

it("copies the exact usable composition and announces success", async () => {
  const user = userEvent.setup();
  const write = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
  const source = "<Card>\n  <CardTitle>Hello</CardTitle>\n</Card>";
  render(<CopyCode label="Card composition" code={source} />);
  await user.click(screen.getByRole("button", { name: "Copy Card composition" }));
  expect(write).toHaveBeenCalledExactlyOnceWith(source);
  expect(screen.getByRole("status")).toHaveTextContent("Copied to clipboard");
});

it("keeps the code selectable and announces a denied clipboard", async () => {
  const user = userEvent.setup();
  vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("denied"));
  const { container } = render(<CopyCode label="Example" code="<Button>Continue</Button>" />);
  await user.click(screen.getByRole("button", { name: "Copy Example" }));
  expect(screen.getByRole("status")).toHaveTextContent("Could not copy. Select the code below.");
  expect(container.querySelector("pre code")?.textContent).toBe("<Button>Continue</Button>");
  expect(container.querySelector("pre")).toBeVisible();
});

it("identifies an explicit language while preserving every source byte", async () => {
  const user = userEvent.setup();
  const write = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
  const source = ':root {\r\n\t--name: "café <>& 😀";\r\n}\n\n';
  const { container } = render(<CopyCode label="Theme recipe" language="css" code={source} />);
  expect(screen.getByText("CSS", { exact: true })).toBeVisible();
  expect(container.querySelector("pre code")?.textContent).toBe(source);
  await user.click(screen.getByRole("button", { name: "Copy Theme recipe" }));
  expect(write).toHaveBeenCalledExactlyOnceWith(source);
});

it("renders source-shaped HTML as selectable text, never active elements", () => {
  const source = '<img src="bad" onerror="alert(1)"><script>alert("😀")</script>';
  const { container } = render(<CopyCode label="Untrusted example" code={source} />);
  const code = container.querySelector("pre code")!;
  expect(code.textContent).toBe(source);
  expect(code.querySelectorAll("img, script")).toHaveLength(0);
  expect(code.querySelector(".token.tag")?.textContent).toContain("img");
});

it.each([
  ["tsx", 'const node = <Button label="hello" />;', "keyword", "const"],
  ["ts", "const count: number = 2;", "keyword", "const"],
  ["js", "const count = 2;", "number", "2"],
  ["jsx", "const node = <Button />;", "tag", "Button"],
  ["css", ":root { color: var(--foreground); }", "property", "color"],
  ["sh", "npm install --save-exact 'package'", "string", "'package'"],
  ["shell", "echo 'hello'", "string", "'hello'"],
  ["json", '{"enabled": true}', "boolean", "true"],
])("uses the %s grammar without rewriting source", (language, source, token, text) => {
  const { container } = render(
    <CopyCode label="Grammar example" language={language} code={source} />,
  );
  expect(container.querySelector("pre code")?.textContent).toBe(source);
  const tokens = [...container.querySelectorAll(`.token.${token}`)].map((node) => node.textContent);
  expect(tokens.some((value) => value?.includes(text))).toBe(true);
});

it.each(["made-up-language", "text", ""])(
  "keeps %s source readable and exactly copyable",
  async (language) => {
    const user = userEvent.setup();
    const write = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    const source = "\t<unknown> café & 😀\r\n\n";
    const { container } = render(
      <CopyCode label="Plain source" language={language} code={source} />,
    );
    expect(container.querySelector("pre code")?.textContent).toBe(source);
    expect(container.querySelectorAll("pre code span")).toHaveLength(0);
    await user.click(screen.getByRole("button", { name: "Copy Plain source" }));
    expect(write).toHaveBeenCalledExactlyOnceWith(source);
  },
);

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

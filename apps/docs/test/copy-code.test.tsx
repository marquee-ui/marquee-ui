import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { CopyCode } from "../src/copy-code";

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
  render(<CopyCode label="Example" code="<Button>Continue</Button>" />);
  await user.click(screen.getByRole("button", { name: "Copy Example" }));
  expect(screen.getByRole("status")).toHaveTextContent("Could not copy. Select the code below.");
  expect(screen.getByText("<Button>Continue</Button>")).toBeVisible();
});

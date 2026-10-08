import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { ComponentExplorer } from "../src/explorer";

it("selects a family, renders its real preview and exposes its composition", async () => {
  const user = userEvent.setup();
  render(<ComponentExplorer baseUrl="/marquee-ui/" />);
  expect(screen.getByRole("heading", { name: "Button", level: 3 })).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Preview Switch" }));
  expect(screen.getByRole("heading", { name: "Switch", level: 3 })).toBeVisible();
  expect(screen.getByRole("heading", { name: "Switch", level: 3 })).toHaveFocus();
  const control = screen.getByRole("switch", { name: "Email updates" });
  expect(control).toHaveAttribute("aria-checked", "false");
  await user.click(control);
  expect(control).toHaveAttribute("aria-checked", "true");
  expect(screen.getByRole("button", { name: "Copy Switch composition" })).toBeVisible();
  expect(screen.getByRole("link", { name: "All Switch stories" })).toHaveAttribute(
    "href",
    "/marquee-ui/storybook/?path=/story/parts-switch--off",
  );
});

it("keeps every family discoverable and resets preview state when switching", async () => {
  const user = userEvent.setup();
  render(<ComponentExplorer />);
  expect(screen.getAllByRole("button", { name: /^Preview / })).toHaveLength(32);
  await user.click(screen.getByRole("button", { name: "Try the button" }));
  expect(screen.getByRole("status", { name: "Button result" })).toHaveTextContent("Pressed 1 time");
  await user.click(screen.getByRole("button", { name: "Preview Card" }));
  await user.click(screen.getByRole("button", { name: "Preview Button" }));
  expect(screen.getByRole("status", { name: "Button result" })).toHaveTextContent(
    "Pressed 0 times",
  );
});

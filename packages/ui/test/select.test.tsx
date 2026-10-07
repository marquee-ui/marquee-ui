import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, expect, it, vi } from "vitest";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectPortal,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from "../src/select";

afterEach(cleanup);

function Parts() {
  return (
    <>
      <SelectTrigger aria-label="Choice">
        <SelectValue placeholder="Choose one" />
      </SelectTrigger>
      <SelectPortal>
        <SelectContent position="popper">
          <SelectViewport>
            <SelectItem value="alpha">
              <SelectItemText>Alpha</SelectItemText>
            </SelectItem>
            <SelectItem value="beta">
              <SelectItemText>Beta</SelectItemText>
            </SelectItem>
          </SelectViewport>
        </SelectContent>
      </SelectPortal>
    </>
  );
}

it("preserves disabled and required native form props and excludes disabled values", () => {
  const { container } = render(
    <form>
      <Select name="choice" required disabled defaultValue="alpha">
        <Parts />
      </Select>
    </form>,
  );
  expect(screen.getByRole("combobox", { name: "Choice" })).toBeDisabled();
  const native = container.querySelector('select[name="choice"]');
  expect(native).toBeRequired();
  expect(native).toBeDisabled();
  expect(native).toHaveValue("alpha");
  expect(new FormData(container.querySelector("form")!).has("choice")).toBe(false);
});

it("reports a controlled change while leaving the caller's value in charge", async () => {
  const change = vi.fn();
  render(
    <Select value="alpha" onValueChange={change}>
      <Parts />
    </Select>,
  );
  const trigger = screen.getByRole("combobox", { name: "Choice" });
  await userEvent.click(trigger);
  await userEvent.click(await screen.findByRole("option", { name: "Beta" }));
  expect(change).toHaveBeenCalledExactlyOnceWith("beta");
  expect(trigger).toHaveTextContent("Alpha");
  expect(screen.queryByRole("listbox")).toBeNull();
});

it("forwards refs and asChild to the actual hosts without injecting wrappers", async () => {
  const triggerRef = createRef<HTMLButtonElement>();
  const viewportRef = createRef<HTMLDivElement>();
  const itemRef = createRef<HTMLDivElement>();
  const { container } = render(
    <Select defaultValue="alpha">
      <SelectTrigger asChild ref={triggerRef}>
        <button aria-label="Custom choice" data-custom="trigger">
          <SelectValue />
        </button>
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectViewport asChild ref={viewportRef}>
          <section data-testid="viewport-host">
            <SelectItem asChild value="alpha" ref={itemRef}>
              <article data-testid="item-host">
                <SelectItemText asChild>
                  <span>Alpha</span>
                </SelectItemText>
              </article>
            </SelectItem>
          </section>
        </SelectViewport>
      </SelectContent>
    </Select>,
  );
  const trigger = screen.getByRole("combobox", { name: "Custom choice" });
  expect(triggerRef.current).toBe(trigger);
  expect(trigger).toHaveAttribute("data-custom", "trigger");
  await userEvent.click(trigger);
  const list = await screen.findByRole("listbox");
  expect(container).toContainElement(list);
  expect(viewportRef.current).toBe(screen.getByTestId("viewport-host"));
  expect(viewportRef.current?.tagName).toBe("SECTION");
  expect(itemRef.current).toBe(screen.getByRole("option", { name: "Alpha" }));
  expect(itemRef.current?.tagName).toBe("ARTICLE");
  expect(itemRef.current?.querySelector('[data-slot="select-item-indicator"]')).toBeNull();
});

it("preserves the primitive escape callback and its preventDefault contract", async () => {
  const escape = vi.fn((event: KeyboardEvent) => event.preventDefault());
  render(
    <Select defaultOpen defaultValue="alpha">
      <SelectTrigger aria-label="Choice">
        <SelectValue />
      </SelectTrigger>
      <SelectPortal>
        <SelectContent position="popper" onEscapeKeyDown={escape}>
          <SelectViewport>
            <SelectItem value="alpha">
              <SelectItemText>Alpha</SelectItemText>
            </SelectItem>
          </SelectViewport>
        </SelectContent>
      </SelectPortal>
    </Select>,
  );
  const list = await screen.findByRole("listbox");
  await waitFor(() => expect(screen.getByRole("option", { name: "Alpha" })).toHaveFocus());
  fireEvent.keyDown(screen.getByRole("option", { name: "Alpha" }), { key: "Escape" });
  expect(escape).toHaveBeenCalledOnce();
  expect(list).toBeInTheDocument();
  expect(screen.getByRole("combobox", { hidden: true })).toHaveAttribute("aria-expanded", "true");
});

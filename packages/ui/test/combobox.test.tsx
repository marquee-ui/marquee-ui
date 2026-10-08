import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState, type ComponentProps } from "react";
import { afterEach, expect, expectTypeOf, it, vi } from "vitest";
import {
  Combobox,
  ComboboxTrigger,
  ComboboxPortal,
  ComboboxContent,
  ComboboxCommand,
  ComboboxInput,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxGroup,
} from "../src/combobox";

afterEach(cleanup);

function Parts({ onSelect = (_value: string) => {}, trigger = "Choose fruit" }) {
  return (
    <>
      <ComboboxTrigger aria-label="Fruit">{trigger}</ComboboxTrigger>
      <ComboboxPortal>
        <ComboboxContent aria-label="Search fruit">
          <ComboboxCommand label="Search fruit">
            <ComboboxInput aria-label="Search fruit" />
            <ComboboxList label="Fruit results">
              <ComboboxEmpty>No fruit found.</ComboboxEmpty>
              <ComboboxGroup heading="Available">
                <ComboboxItem value="apple" onSelect={onSelect}>
                  Apple
                </ComboboxItem>
                <ComboboxItem value="banana" disabled onSelect={onSelect}>
                  Banana
                </ComboboxItem>
                <ComboboxItem value="cherry" onSelect={onSelect}>
                  Cherry
                </ComboboxItem>
              </ComboboxGroup>
            </ComboboxList>
          </ComboboxCommand>
        </ComboboxContent>
      </ComboboxPortal>
    </>
  );
}

it("filters, shows empty results and never commits a disabled item", async () => {
  const user = userEvent.setup();
  const selected = vi.fn();
  render(
    <Combobox>
      <Parts onSelect={selected} />
    </Combobox>,
  );
  await user.click(screen.getByRole("button", { name: "Fruit" }));
  const search = await screen.findByRole("combobox", { name: "Search fruit" });
  await waitFor(() => expect(search).toHaveFocus());
  await user.type(search, "banana");
  expect(screen.getByRole("option", { name: "Banana" })).toHaveAttribute("aria-disabled", "true");
  await user.keyboard("{Enter}");
  expect(selected).not.toHaveBeenCalled();
  await user.clear(search);
  await user.type(search, "unavailable");
  expect(screen.queryAllByRole("option")).toHaveLength(0);
  expect(screen.getByText("No fruit found.")).toBeVisible();
  await user.clear(search);
  await user.type(search, "cherry");
  expect(screen.getAllByRole("option")).toHaveLength(1);
  await user.keyboard("{Enter}");
  expect(selected).toHaveBeenCalledExactlyOnceWith("cherry");
});

it("keeps active navigation separate from caller-controlled committed choice", async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  function Controlled() {
    const [open, setOpen] = useState(false);
    return (
      <Combobox open={open} onOpenChange={setOpen}>
        <Parts
          trigger="Apple"
          onSelect={(value) => {
            change(value);
            setOpen(false);
          }}
        />
      </Combobox>
    );
  }
  render(<Controlled />);
  const trigger = screen.getByRole("button", { name: "Fruit" });
  await user.click(trigger);
  const search = await screen.findByRole("combobox", { name: "Search fruit" });
  await user.keyboard("{End}");
  await waitFor(() =>
    expect(screen.getByRole("option", { name: "Cherry" })).toHaveAttribute("aria-selected", "true"),
  );
  expect(search).toHaveFocus();
  expect(trigger).toHaveTextContent("Apple");
  expect(change).not.toHaveBeenCalled();
  await user.keyboard("{Home}{ArrowDown}{Enter}");
  expect(change).toHaveBeenCalledExactlyOnceWith("cherry");
  await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  expect(trigger).toHaveTextContent("Apple");
  expect(trigger).toHaveFocus();
});

it("supports uncontrolled dismissal and leaves outside focus at the clicked control", async () => {
  const user = userEvent.setup();
  render(
    <>
      <Combobox>
        <Parts />
      </Combobox>
      <button>Outside</button>
    </>,
  );
  const trigger = screen.getByRole("button", { name: "Fruit" });
  await user.click(trigger);
  await screen.findByRole("listbox");
  await user.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  expect(trigger).toHaveFocus();
  await user.click(trigger);
  await screen.findByRole("listbox");
  await user.click(screen.getByRole("button", { name: "Outside" }));
  expect(screen.queryByRole("listbox")).toBeNull();
  expect(screen.getByRole("button", { name: "Outside" })).toHaveFocus();
});

it("passes actual hosts, refs and cancelable Escape through without an imposed portal", async () => {
  const user = userEvent.setup();
  const triggerRef = createRef<HTMLButtonElement>();
  const commandRef = createRef<HTMLDivElement>();
  const inputRef = createRef<HTMLInputElement>();
  const itemRef = createRef<HTMLDivElement>();
  const escape = vi.fn((event: KeyboardEvent) => event.preventDefault());
  const click = vi.fn();
  const { container } = render(
    <Combobox>
      <ComboboxTrigger asChild ref={triggerRef}>
        <button onClick={click}>Custom fruit</button>
      </ComboboxTrigger>
      <ComboboxContent aria-label="Custom popup" onEscapeKeyDown={escape}>
        <ComboboxCommand ref={commandRef} label="Custom search" data-testid="command-host">
          <ComboboxInput asChild ref={inputRef}>
            <input data-custom="search" />
          </ComboboxInput>
          <ComboboxList>
            <ComboboxItem asChild ref={itemRef} value="apple">
              <article>Apple</article>
            </ComboboxItem>
          </ComboboxList>
        </ComboboxCommand>
      </ComboboxContent>
    </Combobox>,
  );
  const trigger = screen.getByRole("button", { name: "Custom fruit" });
  expect(triggerRef.current).toBe(trigger);
  await user.click(trigger);
  expect(click).toHaveBeenCalledOnce();
  const search = await screen.findByRole("combobox", { name: "Custom search" });
  expect(inputRef.current).toBe(search);
  expect(search).toHaveAttribute("data-custom", "search");
  expect(commandRef.current).toBe(screen.getByTestId("command-host"));
  expect(commandRef.current?.tagName).toBe("DIV");
  expect(itemRef.current).toBe(screen.getByRole("option", { name: "Apple" }));
  expect(itemRef.current?.tagName).toBe("ARTICLE");
  expect(container).toContainElement(search);
  fireEvent.keyDown(search, { key: "Escape" });
  expect(escape).toHaveBeenCalledOnce();
  expect(screen.getByRole("dialog", { name: "Custom popup" })).toBeInTheDocument();
});

it("a disabled trigger cannot open", async () => {
  const user = userEvent.setup();
  render(
    <Combobox>
      <ComboboxTrigger disabled>Disabled fruit</ComboboxTrigger>
      <Parts />
    </Combobox>,
  );
  await user.click(screen.getByRole("button", { name: "Disabled fruit" }));
  expect(screen.queryByRole("listbox")).toBeNull();
});

it("leaves controlled open state in charge and reports requests to its caller", async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(
    <Combobox open={false} onOpenChange={change}>
      <Parts />
    </Combobox>,
  );
  await user.click(screen.getByRole("button", { name: "Fruit" }));
  expect(change).toHaveBeenCalledExactlyOnceWith(true);
  expect(screen.queryByRole("listbox")).toBeNull();
});

it("preserves the command keyboard preventDefault contract", async () => {
  const user = userEvent.setup();
  const key = vi.fn((event: React.KeyboardEvent) => event.preventDefault());
  const selected = vi.fn();
  render(
    <Combobox defaultOpen>
      <ComboboxContent aria-label="Protected search">
        <ComboboxCommand label="Protected search" onKeyDown={key}>
          <ComboboxInput />
          <ComboboxList label="Protected results">
            <ComboboxItem value="apple" onSelect={selected}>
              Apple
            </ComboboxItem>
            <ComboboxItem value="cherry" onSelect={selected}>
              Cherry
            </ComboboxItem>
          </ComboboxList>
        </ComboboxCommand>
      </ComboboxContent>
    </Combobox>,
  );
  await waitFor(() =>
    expect(screen.getByRole("combobox", { name: "Protected search" })).toHaveFocus(),
  );
  await user.keyboard("{End}{Enter}");
  expect(key).toHaveBeenCalledTimes(2);
  expect(screen.getByRole("option", { name: "Apple" })).toHaveAttribute("aria-selected", "true");
  expect(selected).not.toHaveBeenCalled();
});

it("omits unsupported native cmdk container slots and generates no popup recipe", () => {
  expectTypeOf<
    "asChild" extends keyof ComponentProps<typeof ComboboxCommand> ? true : false
  >().toEqualTypeOf<false>();
  expectTypeOf<
    "asChild" extends keyof ComponentProps<typeof ComboboxList> ? true : false
  >().toEqualTypeOf<false>();
  expectTypeOf<
    "asChild" extends keyof ComponentProps<typeof ComboboxGroup> ? true : false
  >().toEqualTypeOf<false>();
  const { container } = render(<Combobox />);
  expect(container).toBeEmptyDOMElement();
});

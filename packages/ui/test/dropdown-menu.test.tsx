import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { afterEach, expect, it, vi } from "vitest";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuItemIndicator,
  DropdownMenuSeparator,
  DropdownMenuArrow,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "../src/dropdown-menu";

afterEach(cleanup);

function Actions() {
  return (
    <>
      <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent aria-labelledby="" aria-label="Project actions">
          <DropdownMenuItem>Archive</DropdownMenuItem>
          <DropdownMenuItem disabled>Delete</DropdownMenuItem>
          <DropdownMenuItem>Rename</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </>
  );
}

it("opens an uncontrolled portal menu, skips disabled actions and restores focus after selection", async () => {
  const user = userEvent.setup();
  const { container } = render(
    <DropdownMenu>
      <Actions />
    </DropdownMenu>,
  );
  const trigger = screen.getByRole("button", { name: "Actions" });
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  trigger.focus();
  await user.keyboard("{Enter}");
  const menu = await screen.findByRole("menu", { name: "Project actions" });
  expect(container).not.toContainElement(menu);
  expect(trigger).toHaveAttribute("aria-expanded", "true");
  await waitFor(() => expect(screen.getByRole("menuitem", { name: "Archive" })).toHaveFocus());
  await user.keyboard("{ArrowDown}");
  expect(screen.getByRole("menuitem", { name: "Rename" })).toHaveFocus();
  expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveAttribute("aria-disabled", "true");
  await user.keyboard("{Enter}");
  await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  expect(trigger).toHaveFocus();
});

it("reports controlled open changes without replacing caller state", async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const { rerender } = render(
    <DropdownMenu open={false} onOpenChange={change}>
      <Actions />
    </DropdownMenu>,
  );
  await user.click(screen.getByRole("button", { name: "Actions" }));
  expect(change).toHaveBeenCalledExactlyOnceWith(true);
  expect(screen.queryByRole("menu")).toBeNull();
  rerender(
    <DropdownMenu open onOpenChange={change}>
      <Actions />
    </DropdownMenu>,
  );
  await user.click(await screen.findByRole("menuitem", { name: "Archive" }));
  expect(change.mock.calls).toEqual([[true], [false]]);
  expect(screen.getByRole("menu", { name: "Project actions" })).toBeInTheDocument();
});

it("preserves disabled triggers and cancelable action selection", async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const select = vi.fn((event: Event) => event.preventDefault());
  const { rerender } = render(
    <DropdownMenu onOpenChange={change}>
      <DropdownMenuTrigger disabled>Open</DropdownMenuTrigger>
    </DropdownMenu>,
  );
  await user.click(screen.getByRole("button", { name: "Open" }));
  expect(change).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "Open" })).toBeDisabled();
  rerender(
    <DropdownMenu key="protected" defaultOpen>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <DropdownMenuContent aria-labelledby="" aria-label="Protected">
        <DropdownMenuItem onSelect={select}>Keep open</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
  await user.click(await screen.findByRole("menuitem", { name: "Keep open" }));
  expect(select).toHaveBeenCalledOnce();
  expect(screen.getByRole("menu", { name: "Protected" })).toBeInTheDocument();
});

it("checkbox indeterminate state and controlled radio choices notify once and show explicit indicators", async () => {
  const user = userEvent.setup();
  const checked = vi.fn();
  const choice = vi.fn();
  function Checks() {
    const [enabled, setEnabled] = useState<boolean | "indeterminate">("indeterminate");
    const [value, setValue] = useState("compact");
    return (
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Settings</DropdownMenuTrigger>
        <DropdownMenuContent aria-labelledby="" aria-label="Settings">
          <DropdownMenuCheckboxItem
            checked={enabled}
            onCheckedChange={(next) => {
              checked(next);
              setEnabled(next);
            }}
            onSelect={(event) => event.preventDefault()}
          >
            Notifications<DropdownMenuItemIndicator>check mark</DropdownMenuItemIndicator>
          </DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup
            value={value}
            onValueChange={(next) => {
              choice(next);
              setValue(next);
            }}
          >
            <DropdownMenuRadioItem value="compact" onSelect={(event) => event.preventDefault()}>
              Compact<DropdownMenuItemIndicator>compact mark</DropdownMenuItemIndicator>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="comfortable" onSelect={(event) => event.preventDefault()}>
              Comfortable<DropdownMenuItemIndicator>comfortable mark</DropdownMenuItemIndicator>
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  render(<Checks />);
  const checkbox = await screen.findByRole("menuitemcheckbox", { name: /Notifications/ });
  expect(checkbox).toHaveAttribute("aria-checked", "mixed");
  await user.click(checkbox);
  expect(checked).toHaveBeenCalledExactlyOnceWith(true);
  expect(checkbox).toHaveAttribute("aria-checked", "true");
  await user.click(checkbox);
  expect(checked.mock.calls).toEqual([[true], [false]]);
  expect(checkbox).toHaveAttribute("aria-checked", "false");
  expect(within(checkbox).queryByText("check mark")).toBeNull();
  await user.click(screen.getByRole("menuitemradio", { name: "Comfortable" }));
  expect(choice).toHaveBeenCalledExactlyOnceWith("comfortable");
  expect(screen.getByRole("menuitemradio", { name: /Comfortable/ })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  expect(screen.getByRole("menuitemradio", { name: "Compact" })).toHaveAttribute(
    "aria-checked",
    "false",
  );
  expect(screen.queryByText("compact mark")).toBeNull();
  expect(screen.getByText("comfortable mark")).toBeInTheDocument();
});

it("uses Home, End, arrows and typeahead over enabled items", async () => {
  const user = userEvent.setup();
  render(
    <DropdownMenu modal={false}>
      <Actions />
    </DropdownMenu>,
  );
  screen.getByRole("button", { name: "Actions" }).focus();
  await user.keyboard("{ArrowDown}");
  await waitFor(() => expect(screen.getByRole("menuitem", { name: "Archive" })).toHaveFocus());
  await user.keyboard("{End}");
  expect(screen.getByRole("menuitem", { name: "Rename" })).toHaveFocus();
  await user.keyboard("{Home}");
  expect(screen.getByRole("menuitem", { name: "Archive" })).toHaveFocus();
  await user.keyboard("r");
  await waitFor(() => expect(screen.getByRole("menuitem", { name: "Rename" })).toHaveFocus());
  await user.keyboard("{ArrowUp}");
  expect(screen.getByRole("menuitem", { name: "Archive" })).toHaveFocus();
});

it.each(["ltr", "rtl"] as const)(
  "opens and returns from a %s submenu with directional keys",
  async (dir) => {
    const user = userEvent.setup();
    render(
      <DropdownMenu dir={dir}>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent aria-labelledby="" aria-label="Main">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent aria-labelledby="" aria-label="Share destinations">
                <DropdownMenuItem>Copy link</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    screen.getByRole("button", { name: "Actions" }).focus();
    await user.keyboard("{Enter}");
    const subTrigger = await screen.findByRole("menuitem", { name: "Share" });
    await waitFor(() => expect(subTrigger).toHaveFocus());
    await user.keyboard(dir === "ltr" ? "{ArrowRight}" : "{ArrowLeft}");
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Copy link" })).toHaveFocus());
    expect(screen.getByRole("menu", { name: "Share destinations" })).toBeInTheDocument();
    await user.keyboard(dir === "ltr" ? "{ArrowLeft}" : "{ArrowRight}");
    await waitFor(() =>
      expect(screen.queryByRole("menu", { name: "Share destinations" })).toBeNull(),
    );
    expect(subTrigger).toHaveFocus();
    expect(screen.getByRole("menu", { name: "Main" })).toBeInTheDocument();
  },
);

it("forwards refs, custom hosts and portal container with explicit part anatomy", async () => {
  const user = userEvent.setup();
  const triggerRef = createRef<HTMLButtonElement>();
  const contentRef = createRef<HTMLDivElement>();
  const itemRef = createRef<HTMLDivElement>();
  const arrowRef = createRef<SVGSVGElement>();
  const target = document.createElement("aside");
  document.body.append(target);
  try {
    const { container } = render(
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild ref={triggerRef}>
          <button>Custom actions</button>
        </DropdownMenuTrigger>
        <DropdownMenuPortal container={target}>
          <DropdownMenuContent
            aria-labelledby=""
            asChild
            ref={contentRef}
            side="right"
            align="end"
            avoidCollisions={false}
            aria-label="Custom menu"
          >
            <section>
              <DropdownMenuGroup asChild>
                <div data-testid="group">
                  <DropdownMenuLabel asChild>
                    <h2>Actions label</h2>
                  </DropdownMenuLabel>
                  <DropdownMenuItem asChild ref={itemRef}>
                    <a href="#archive">Archive</a>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuGroup>
              <DropdownMenuSeparator asChild>
                <hr />
              </DropdownMenuSeparator>
              <DropdownMenuArrow ref={arrowRef} width={16} height={8} />
            </section>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>,
    );
    expect(triggerRef.current).toBe(screen.getByRole("button", { name: "Custom actions" }));
    await user.click(triggerRef.current!);
    const menu = await screen.findByRole("menu", { name: "Custom menu" });
    expect(menu.tagName).toBe("SECTION");
    expect(contentRef.current).toBe(menu);
    expect(target).toContainElement(menu);
    expect(container).not.toContainElement(menu);
    expect(itemRef.current).toBe(screen.getByRole("menuitem", { name: "Archive" }));
    expect(itemRef.current).toHaveAttribute("href", "#archive");
    expect(screen.getByRole("group")).toBe(screen.getByTestId("group"));
    expect(screen.getByRole("heading", { name: "Actions label" })).toHaveAttribute(
      "data-slot",
      "dropdown-menu-label",
    );
    expect(screen.getByRole("separator").tagName).toBe("HR");
    expect(arrowRef.current).toHaveAttribute("width", "16");
    expect(arrowRef.current).toHaveAttribute("height", "8");
    await waitFor(() => expect(menu).toHaveAttribute("data-side", "right"));
    expect(menu).toHaveAttribute("data-align", "end");
  } finally {
    cleanup();
    target.remove();
  }
});

it("injects no portal, indicator, arrow or submenu glyph", async () => {
  const { container } = render(
    <DropdownMenu defaultOpen modal={false}>
      <DropdownMenuContent aria-labelledby="" aria-label="Plain">
        <DropdownMenuCheckboxItem checked>Checked</DropdownMenuCheckboxItem>
        <DropdownMenuRadioGroup value="one">
          <DropdownMenuRadioItem value="one">One</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>Sub text</DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
  const menu = await screen.findByRole("menu", { name: "Plain" });
  expect(container).toContainElement(menu);
  expect(menu.querySelectorAll("svg, [data-slot='dropdown-menu-item-indicator']")).toHaveLength(0);
  expect(screen.getByRole("menuitem", { name: "More" }).textContent).toBe("More");
});

it("preserves cancelable Escape, outside interactions and close autofocus", async () => {
  const escape = vi.fn((event: KeyboardEvent) => event.preventDefault());
  const outside = vi.fn((event: Event) => event.preventDefault());
  const closeFocus = vi.fn((event: Event) => event.preventDefault());
  render(
    <>
      <DropdownMenu defaultOpen modal={false}>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent
          aria-labelledby=""
          aria-label="Protected"
          onEscapeKeyDown={escape}
          onInteractOutside={outside}
          onCloseAutoFocus={closeFocus}
        >
          <DropdownMenuItem>Finish</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <button>Outside</button>
    </>,
  );
  const menu = await screen.findByRole("menu", { name: "Protected" });
  fireEvent.keyDown(menu, { key: "Escape" });
  expect(escape).toHaveBeenCalledOnce();
  expect(menu).toBeInTheDocument();
  const button = screen.getByRole("button", { name: "Outside" });
  button.focus();
  await waitFor(() => expect(outside).toHaveBeenCalledOnce());
  expect(menu).toBeInTheDocument();
  await userEvent.setup().click(screen.getByRole("menuitem", { name: "Finish" }));
  await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  expect(closeFocus).toHaveBeenCalledOnce();
  expect(screen.getByRole("button", { name: "Open" })).not.toHaveFocus();
});

it("forwards checked, group and submenu refs with caller styles and custom hosts", async () => {
  const group = createRef<HTMLDivElement>();
  const label = createRef<HTMLDivElement>();
  const checkbox = createRef<HTMLDivElement>();
  const radioGroup = createRef<HTMLDivElement>();
  const radio = createRef<HTMLDivElement>();
  const indicator = createRef<HTMLSpanElement>();
  const separator = createRef<HTMLDivElement>();
  const subTrigger = createRef<HTMLDivElement>();
  const subContent = createRef<HTMLDivElement>();
  render(
    <DropdownMenu defaultOpen modal={false}>
      <DropdownMenuTrigger>Settings</DropdownMenuTrigger>
      <DropdownMenuContent style={{ outline: "solid", padding: "12px" }}>
        <DropdownMenuGroup asChild ref={group}>
          <section data-testid="group">
            <DropdownMenuLabel asChild ref={label}>
              <h2>Settings label</h2>
            </DropdownMenuLabel>
          </section>
        </DropdownMenuGroup>
        <DropdownMenuCheckboxItem asChild ref={checkbox} checked>
          <div data-testid="checkbox">
            Notifications
            <DropdownMenuItemIndicator asChild ref={indicator}>
              <strong data-testid="indicator">Check</strong>
            </DropdownMenuItemIndicator>
          </div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuRadioGroup asChild ref={radioGroup} value="compact">
          <section data-testid="radios">
            <DropdownMenuRadioItem asChild ref={radio} value="compact">
              <div>Compact</div>
            </DropdownMenuRadioItem>
          </section>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator asChild ref={separator}>
          <hr />
        </DropdownMenuSeparator>
        <DropdownMenuSub defaultOpen>
          <DropdownMenuSubTrigger asChild ref={subTrigger}>
            <div>Share</div>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent asChild forceMount ref={subContent} style={{ outline: "solid" }}>
            <section data-testid="sub-content">
              <DropdownMenuItem>Copy</DropdownMenuItem>
            </section>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
  await screen.findByRole("menu", { name: "Settings" });
  expect(group.current).toBe(screen.getByTestId("group"));
  expect(label.current).toBe(screen.getByRole("heading", { name: "Settings label" }));
  expect(checkbox.current).toBe(screen.getByTestId("checkbox"));
  expect(radioGroup.current).toBe(screen.getByTestId("radios"));
  expect(radio.current).toBe(screen.getByRole("menuitemradio", { name: "Compact" }));
  expect(indicator.current).toBe(screen.getByTestId("indicator"));
  expect(separator.current).toBe(screen.getByRole("separator"));
  expect(subTrigger.current).toBe(screen.getByRole("menuitem", { name: "Share" }));
  expect(subContent.current).toBe(screen.getByTestId("sub-content"));
  expect(subContent.current?.style.outline).toBe("solid");
  const menu = screen.getByRole("menu", { name: "Settings" });
  expect(menu.style.outline).toBe("solid");
  expect(menu.style.padding).toBe("12px");
});

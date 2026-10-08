import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, expect, it, vi } from "vitest";
import {
  Popover,
  PopoverAnchor,
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverPortal,
  PopoverTitle,
  PopoverTrigger,
} from "../src/popover";

afterEach(cleanup);

function Parts() {
  return (
    <>
      <PopoverTrigger>Open details</PopoverTrigger>
      <PopoverPortal>
        <PopoverContent aria-labelledby="details-title" aria-describedby="details-description">
          <PopoverHeader>
            <PopoverTitle id="details-title">Project details</PopoverTitle>
            <PopoverDescription id="details-description">Choose your next step.</PopoverDescription>
          </PopoverHeader>
          <input aria-label="Project name" />
          <PopoverClose>Done</PopoverClose>
        </PopoverContent>
      </PopoverPortal>
    </>
  );
}

it("opens nonmodal by default with caller-owned naming, then closes and restores focus", async () => {
  const { container } = render(
    <Popover>
      <Parts />
    </Popover>,
  );
  const trigger = screen.getByRole("button", { name: "Open details" });
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  await userEvent.click(trigger);
  const panel = await screen.findByRole("dialog", { name: "Project details" });
  expect(panel).toHaveAccessibleDescription("Choose your next step.");
  expect(container).not.toContainElement(panel);
  expect(trigger).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("textbox", { name: "Project name" })).toHaveFocus();
  expect(document.body.style.pointerEvents).not.toBe("none");
  await userEvent.click(screen.getByRole("button", { name: "Done" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(trigger).toHaveFocus();
});

it("reports controlled changes without replacing the caller's open state", async () => {
  const change = vi.fn();
  const { rerender } = render(
    <Popover open={false} onOpenChange={change}>
      <Parts />
    </Popover>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Open details" }));
  expect(change).toHaveBeenCalledExactlyOnceWith(true);
  expect(screen.queryByRole("dialog")).toBeNull();
  rerender(
    <Popover open onOpenChange={change}>
      <Parts />
    </Popover>,
  );
  await userEvent.click(await screen.findByRole("button", { name: "Done" }));
  expect(change.mock.calls).toEqual([[true], [false]]);
  expect(screen.getByRole("dialog", { name: "Project details" })).toBeInTheDocument();
});

it("preserves disabled triggers and canceled clicks", async () => {
  const change = vi.fn();
  const { rerender } = render(
    <Popover onOpenChange={change}>
      <PopoverTrigger disabled>Open</PopoverTrigger>
    </Popover>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Open" }));
  expect(screen.getByRole("button", { name: "Open" })).toBeDisabled();
  expect(change).not.toHaveBeenCalled();
  rerender(
    <Popover onOpenChange={change}>
      <PopoverTrigger onClick={(event) => event.preventDefault()}>Open</PopoverTrigger>
    </Popover>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Open" }));
  expect(change).not.toHaveBeenCalled();
});

it("forwards refs and custom hosts without injecting portal, arrow, Close or labels", async () => {
  const trigger = createRef<HTMLButtonElement>();
  const anchor = createRef<HTMLDivElement>();
  const content = createRef<HTMLDivElement>();
  const header = createRef<HTMLDivElement>();
  const title = createRef<HTMLHeadingElement>();
  const description = createRef<HTMLParagraphElement>();
  const close = createRef<HTMLButtonElement>();
  const arrow = createRef<SVGSVGElement>();
  const { container } = render(
    <Popover>
      <PopoverAnchor asChild ref={anchor}>
        <div data-testid="anchor">
          <PopoverTrigger asChild ref={trigger}>
            <button>Custom open</button>
          </PopoverTrigger>
        </div>
      </PopoverAnchor>
      <PopoverContent
        asChild
        ref={content}
        aria-labelledby="custom-title"
        aria-describedby="custom-description"
      >
        <section>
          <PopoverHeader asChild ref={header}>
            <header data-testid="header">
              <PopoverTitle asChild ref={title} id="custom-title">
                <h2>Custom title</h2>
              </PopoverTitle>
              <PopoverDescription asChild ref={description} id="custom-description">
                <p>Custom description</p>
              </PopoverDescription>
            </header>
          </PopoverHeader>
          <PopoverClose asChild ref={close}>
            <button>Custom close</button>
          </PopoverClose>
          <PopoverArrow asChild ref={arrow}>
            <svg data-testid="arrow" />
          </PopoverArrow>
        </section>
      </PopoverContent>
    </Popover>,
  );
  expect(anchor.current).toBe(screen.getByTestId("anchor"));
  expect(trigger.current).toBe(screen.getByRole("button", { name: "Custom open" }));
  await userEvent.click(trigger.current!);
  const panel = await screen.findByRole("dialog", { name: "Custom title" });
  expect(content.current).toBe(panel);
  expect(panel.tagName).toBe("SECTION");
  expect(container).toContainElement(panel);
  expect(header.current).toBe(screen.getByTestId("header"));
  expect(title.current).toBe(screen.getByRole("heading", { name: "Custom title", level: 2 }));
  expect(description.current).toBe(screen.getByText("Custom description"));
  expect(close.current).toBe(screen.getByRole("button", { name: "Custom close" }));
  expect(arrow.current).toBe(screen.getByTestId("arrow"));
  expect(panel.querySelectorAll("button")).toHaveLength(1);
  expect(panel.querySelectorAll("svg")).toHaveLength(1);
  expect(panel).toHaveAccessibleDescription("Custom description");
});

it("Content alone keeps its caller label and injects no presentation or controls", async () => {
  const { container } = render(
    <Popover defaultOpen>
      <PopoverContent aria-label="Plain">Only text</PopoverContent>
    </Popover>,
  );
  const panel = await screen.findByRole("dialog", { name: "Plain" });
  expect(container).toContainElement(panel);
  expect(panel).toHaveTextContent("Only text");
  expect(panel.querySelectorAll("button, svg, h1, h2, h3, p")).toHaveLength(0);
  expect(panel).not.toHaveAttribute("aria-labelledby");
  expect(panel).not.toHaveAttribute("aria-describedby");
});

it("respects a custom portal container and primitive positioning props", async () => {
  const target = document.createElement("aside");
  document.body.append(target);
  try {
    const { container } = render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverPortal container={target}>
          <PopoverContent
            aria-label="Elsewhere"
            side="right"
            align="end"
            sideOffset={12}
            alignOffset={8}
            avoidCollisions={false}
            collisionPadding={16}
          >
            <PopoverArrow width={16} height={8} />
          </PopoverContent>
        </PopoverPortal>
      </Popover>,
    );
    const panel = await screen.findByRole("dialog", { name: "Elsewhere" });
    expect(target).toContainElement(panel);
    expect(container).not.toContainElement(panel);
    await waitFor(() => expect(panel).toHaveAttribute("data-side", "right"));
    expect(panel).toHaveAttribute("data-align", "end");
    expect(panel.querySelector("svg")).toHaveAttribute("width", "16");
    expect(panel.querySelector("svg")).toHaveAttribute("height", "8");
  } finally {
    cleanup();
    target.remove();
  }
});

it.each([false, true])("Close is form-safe with asChild=%s", async (asChild) => {
  const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
  render(
    <Popover defaultOpen>
      <PopoverContent aria-label="Form">
        <form onSubmit={submit}>
          <PopoverClose asChild={asChild}>
            {asChild ? <button>Cancel</button> : "Cancel"}
          </PopoverClose>
        </form>
      </PopoverContent>
    </Popover>,
  );
  const close = screen.getByRole("button", { name: "Cancel" });
  expect(close).toHaveAttribute("type", "button");
  await userEvent.click(close);
  expect(submit).not.toHaveBeenCalled();
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
});

it("preserves cancelable Escape, pointer interaction and autofocus callbacks", async () => {
  const escape = vi.fn((event: KeyboardEvent) => event.preventDefault());
  const pointer = vi.fn((event: Event) => event.preventDefault());
  const interact = vi.fn((event: Event) => event.preventDefault());
  const openFocus = vi.fn((event: Event) => event.preventDefault());
  const closeFocus = vi.fn((event: Event) => event.preventDefault());
  render(
    <>
      <button>Outside</button>
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent
          aria-label="Protected"
          onEscapeKeyDown={escape}
          onPointerDownOutside={pointer}
          onInteractOutside={interact}
          onOpenAutoFocus={openFocus}
          onCloseAutoFocus={closeFocus}
        >
          <PopoverClose>Done</PopoverClose>
        </PopoverContent>
      </Popover>
    </>,
  );
  const panel = await screen.findByRole("dialog", { name: "Protected" });
  expect(openFocus).toHaveBeenCalledOnce();
  expect(screen.getByRole("button", { name: "Done" })).not.toHaveFocus();
  fireEvent.keyDown(panel, { key: "Escape" });
  expect(escape).toHaveBeenCalledOnce();
  expect(panel).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Outside" }));
  expect(pointer).toHaveBeenCalledOnce();
  expect(interact).toHaveBeenCalled();
  expect(panel).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Done" }));
  await waitFor(() => expect(closeFocus).toHaveBeenCalledOnce());
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.getByRole("button", { name: "Open" })).not.toHaveFocus();
});

it("allows prevented focus-outside to keep a nonmodal popover open", async () => {
  const focus = vi.fn((event: Event) => event.preventDefault());
  render(
    <>
      <button>Outside</button>
      <Popover defaultOpen>
        <PopoverContent aria-label="Stay open" onFocusOutside={focus}>
          <PopoverClose>Done</PopoverClose>
        </PopoverContent>
      </Popover>
    </>,
  );
  await screen.findByRole("dialog", { name: "Stay open" });
  screen.getByRole("button", { name: "Outside" }).focus();
  expect(focus).toHaveBeenCalledOnce();
  expect(screen.getByRole("dialog", { name: "Stay open" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Outside" })).toHaveFocus();
});

it("outside focus dismisses nonmodal content without stealing the outside focus", async () => {
  render(
    <>
      <button>Outside</button>
      <Popover defaultOpen>
        <Parts />
      </Popover>
    </>,
  );
  await screen.findByRole("dialog", { name: "Project details" });
  screen.getByRole("button", { name: "Outside" }).focus();
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(screen.getByRole("button", { name: "Outside" })).toHaveFocus();
});

it("modal content traps Tab, hides outside content and releases locks on Close", async () => {
  render(
    <>
      <button>Outside</button>
      <Popover modal>
        <Parts />
      </Popover>
    </>,
  );
  const trigger = screen.getByRole("button", { name: "Open details" });
  await userEvent.click(trigger);
  await screen.findByRole("dialog", { name: "Project details" });
  expect(screen.queryByRole("button", { name: "Outside" })).toBeNull();
  expect(document.body.style.pointerEvents).toBe("none");
  await userEvent.tab({ shift: true });
  expect(screen.getByRole("button", { name: "Done" })).toHaveFocus();
  await userEvent.tab();
  expect(screen.getByRole("textbox", { name: "Project name" })).toHaveFocus();
  await userEvent.click(screen.getByRole("button", { name: "Done" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(screen.getByRole("button", { name: "Outside" })).toBeInTheDocument();
  expect(document.body.style.pointerEvents).not.toBe("none");
  expect(trigger).toHaveFocus();
});

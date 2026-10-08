import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, expect, it, vi } from "vitest";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "../src/tooltip";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function Parts({ label = "Save", text = "Save the current document." }) {
  return (
    <>
      <TooltipTrigger>{label}</TooltipTrigger>
      <TooltipPortal>
        <TooltipContent>{text}</TooltipContent>
      </TooltipPortal>
    </>
  );
}

it("opens on keyboard focus with a supplemental description, closes on blur without trapping focus", async () => {
  render(
    <TooltipProvider>
      <Tooltip>
        <Parts />
      </Tooltip>
      <button>Next action</button>
    </TooltipProvider>,
  );
  await userEvent.tab();
  const trigger = screen.getByRole("button", { name: "Save" });
  expect(trigger).toHaveFocus();
  expect(await screen.findByRole("tooltip")).toHaveTextContent("Save the current document.");
  expect(trigger).toHaveAccessibleDescription("Save the current document.");
  expect(trigger).toHaveAccessibleName("Save");
  await userEvent.tab();
  expect(screen.getByRole("button", { name: "Next action" })).toHaveFocus();
  expect(screen.queryByRole("tooltip")).toBeNull();
  expect(trigger).not.toHaveAttribute("aria-describedby");
});

it("Escape closes without moving focus and activating the named trigger still runs its action", async () => {
  const action = vi.fn();
  render(
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger onClick={action}>Save</TooltipTrigger>
        <TooltipContent>Save the current document.</TooltipContent>
      </Tooltip>
    </TooltipProvider>,
  );
  await userEvent.tab();
  await screen.findByRole("tooltip");
  await userEvent.keyboard("{Escape}");
  expect(screen.queryByRole("tooltip")).toBeNull();
  expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  expect(action).toHaveBeenCalledOnce();
  expect(screen.queryByRole("tooltip")).toBeNull();
});

it("reports controlled requests without changing the caller's state", async () => {
  const change = vi.fn();
  const { rerender } = render(
    <TooltipProvider>
      <Tooltip open={false} onOpenChange={change}>
        <Parts />
      </Tooltip>
    </TooltipProvider>,
  );
  await userEvent.tab();
  expect(change).toHaveBeenCalledExactlyOnceWith(true);
  expect(screen.queryByRole("tooltip")).toBeNull();
  rerender(
    <TooltipProvider>
      <Tooltip open onOpenChange={change}>
        <Parts />
      </Tooltip>
    </TooltipProvider>,
  );
  await screen.findByRole("tooltip");
  await userEvent.keyboard("{Escape}");
  expect(change.mock.calls).toEqual([[true], [false]]);
  expect(screen.getByRole("tooltip")).toHaveTextContent("Save the current document.");
});

it("uses provider delay and skip delay across roots, and resumes delay after the skip window", () => {
  vi.useFakeTimers();
  render(
    <TooltipProvider delayDuration={200} skipDelayDuration={500} disableHoverableContent>
      <Tooltip>
        <Parts label="First" text="First hint" />
      </Tooltip>
      <Tooltip>
        <Parts label="Second" text="Second hint" />
      </Tooltip>
    </TooltipProvider>,
  );
  const first = screen.getByRole("button", { name: "First" });
  const second = screen.getByRole("button", { name: "Second" });
  fireEvent.pointerMove(first, { pointerType: "mouse" });
  act(() => vi.advanceTimersByTime(199));
  expect(screen.queryByRole("tooltip"), "provider delay holds the first hint closed").toBeNull();
  act(() => vi.advanceTimersByTime(1));
  expect(screen.getByRole("tooltip")).toHaveTextContent("First hint");
  expect(first).toHaveAttribute("data-state", "delayed-open");
  fireEvent.pointerLeave(first, { pointerType: "mouse" });
  expect(screen.queryByRole("tooltip")).toBeNull();
  fireEvent.pointerMove(second, { pointerType: "mouse" });
  expect(
    screen.getByRole("tooltip"),
    "skip window opens the next hint immediately",
  ).toHaveTextContent("Second hint");
  expect(second).toHaveAttribute("data-state", "instant-open");
  fireEvent.pointerLeave(second, { pointerType: "mouse" });
  act(() => vi.advanceTimersByTime(501));
  fireEvent.pointerMove(first, { pointerType: "mouse" });
  act(() => vi.advanceTimersByTime(199));
  expect(screen.queryByRole("tooltip"), "the delay resumes after the skip window").toBeNull();
  act(() => vi.advanceTimersByTime(1));
  expect(screen.getByRole("tooltip")).toHaveTextContent("First hint");
});

it("lets a root override provider timing and hoverable-content behavior", async () => {
  render(
    <TooltipProvider delayDuration={500}>
      <Tooltip delayDuration={0} disableHoverableContent>
        <Parts />
      </Tooltip>
    </TooltipProvider>,
  );
  const trigger = screen.getByRole("button", { name: "Save" });
  fireEvent.pointerMove(trigger, { pointerType: "mouse" });
  expect(await screen.findByRole("tooltip")).toHaveTextContent("Save the current document.");
  fireEvent.pointerLeave(trigger, { pointerType: "mouse" });
  expect(screen.queryByRole("tooltip")).toBeNull();
});

it("ignores touch hover and keeps a touch action independently understandable", () => {
  const action = vi.fn();
  render(
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger onClick={action}>Save document</TooltipTrigger>
        <TooltipContent>Keyboard shortcut: Control S.</TooltipContent>
      </Tooltip>
    </TooltipProvider>,
  );
  const trigger = screen.getByRole("button", { name: "Save document" });
  fireEvent.pointerMove(trigger, { pointerType: "touch" });
  expect(screen.queryByRole("tooltip")).toBeNull();
  fireEvent.pointerDown(trigger, { pointerType: "touch" });
  fireEvent.focus(trigger);
  fireEvent.click(trigger);
  expect(action).toHaveBeenCalledOnce();
  expect(trigger).toHaveAccessibleName("Save document");
  expect(screen.queryByRole("tooltip")).toBeNull();
});

it("forwards refs, asChild, caller styles, content positioning and an explicit arrow", async () => {
  const trigger = createRef<HTMLButtonElement>();
  const content = createRef<HTMLDivElement>();
  const arrow = createRef<SVGSVGElement>();
  const { container } = render(
    <TooltipProvider>
      <Tooltip defaultOpen>
        <TooltipTrigger asChild ref={trigger} className="px-6">
          <button>Custom host</button>
        </TooltipTrigger>
        <TooltipContent
          asChild
          ref={content}
          side="bottom"
          align="start"
          sideOffset={12}
          collisionPadding={16}
          className="max-w-sm"
          style={{ zIndex: 70 }}
          aria-label="Custom description"
        >
          <section>
            Visible supplemental text
            <TooltipArrow asChild ref={arrow} width={12} height={6}>
              <svg data-testid="custom-arrow" />
            </TooltipArrow>
          </section>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>,
  );
  expect(trigger.current).toBe(screen.getByRole("button", { name: "Custom host" }));
  expect(container.querySelectorAll("button")).toHaveLength(1);
  expect(content.current?.tagName).toBe("SECTION");
  expect(container).toContainElement(content.current);
  expect(content.current).toHaveStyle({ zIndex: 70 });
  expect(content.current).toHaveAttribute("data-align", "start");
  await waitFor(() => expect(content.current).toHaveAttribute("data-side", "bottom"));
  expect(arrow.current).toBe(screen.getByTestId("custom-arrow"));
  expect(arrow.current).toHaveAttribute("width", "12");
  expect(arrow.current).toHaveAttribute("height", "6");
  expect(screen.getByRole("tooltip")).toHaveTextContent("Custom description");
  expect(trigger.current).toHaveAccessibleDescription("Custom description");
});

it("does not inject a portal or arrow and respects an explicit custom portal container", async () => {
  const target = document.createElement("aside");
  document.body.append(target);
  try {
    const { container, rerender } = render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger>Inline</TooltipTrigger>
          <TooltipContent>Inline hint</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(container).toContainElement(screen.getByRole("tooltip"));
    expect(container.querySelector('[data-slot="tooltip-arrow"]')).toBeNull();
    rerender(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger>Portaled</TooltipTrigger>
          <TooltipPortal container={target}>
            <TooltipContent>Portaled hint</TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>,
    );
    const hint = await screen.findByRole("tooltip");
    expect(target).toContainElement(hint);
    expect(container).not.toContainElement(hint);
  } finally {
    cleanup();
    target.remove();
  }
});

it("forwards cancelable Escape and outside-pointer callbacks", async () => {
  const escape = vi.fn((event: KeyboardEvent) => event.preventDefault());
  const outside = vi.fn((event: Event) => event.preventDefault());
  render(
    <TooltipProvider>
      <Tooltip defaultOpen>
        <TooltipTrigger>Protected hint</TooltipTrigger>
        <TooltipContent onEscapeKeyDown={escape} onPointerDownOutside={outside}>
          Supplemental text
        </TooltipContent>
      </Tooltip>
      <button>Outside</button>
    </TooltipProvider>,
  );
  await userEvent.keyboard("{Escape}");
  expect(escape).toHaveBeenCalledOnce();
  expect(screen.getByRole("tooltip")).toHaveTextContent("Supplemental text");
  await userEvent.click(screen.getByRole("button", { name: "Outside" }));
  expect(outside).toHaveBeenCalledOnce();
  expect(screen.getByRole("tooltip")).toHaveTextContent("Supplemental text");
});

it("passes disabled and prevented focus behavior to its trigger", async () => {
  const change = vi.fn();
  const { rerender } = render(
    <TooltipProvider>
      <Tooltip onOpenChange={change}>
        <TooltipTrigger disabled>Unavailable</TooltipTrigger>
      </Tooltip>
    </TooltipProvider>,
  );
  expect(screen.getByRole("button", { name: "Unavailable" })).toBeDisabled();
  await userEvent.tab();
  expect(change).not.toHaveBeenCalled();
  rerender(
    <TooltipProvider>
      <Tooltip onOpenChange={change}>
        <TooltipTrigger onFocus={(event) => event.preventDefault()}>Protected</TooltipTrigger>
      </Tooltip>
    </TooltipProvider>,
  );
  await userEvent.tab();
  expect(screen.getByRole("button", { name: "Protected" })).toHaveFocus();
  expect(change).not.toHaveBeenCalled();
});

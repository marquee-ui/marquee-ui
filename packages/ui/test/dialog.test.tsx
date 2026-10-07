import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, expect, it, vi } from "vitest";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "../src/dialog";

afterEach(cleanup);

function Parts() {
  return (
    <>
      <DialogTrigger>Open details</DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Project details</DialogTitle>
            <DialogDescription>Choose your next step.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>Done</DialogClose>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </>
  );
}

it("opens uncontrolled with associated title and description, closes and restores trigger focus", async () => {
  render(
    <Dialog>
      <Parts />
    </Dialog>,
  );
  const trigger = screen.getByRole("button", { name: "Open details" });
  await userEvent.click(trigger);
  const panel = await screen.findByRole("dialog", { name: "Project details" });
  expect(panel).toHaveAccessibleDescription("Choose your next step.");
  expect(panel).toContainElement(screen.getByRole("button", { name: "Done" }));
  await userEvent.click(screen.getByRole("button", { name: "Done" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  await waitFor(() => expect(trigger).toHaveFocus());
});

it("reports controlled state changes while leaving the caller in charge", async () => {
  const change = vi.fn();
  const { rerender } = render(
    <Dialog open={false} onOpenChange={change}>
      <Parts />
    </Dialog>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Open details" }));
  expect(change).toHaveBeenCalledExactlyOnceWith(true);
  expect(screen.queryByRole("dialog")).toBeNull();
  rerender(
    <Dialog open onOpenChange={change}>
      <Parts />
    </Dialog>,
  );
  await userEvent.click(await screen.findByRole("button", { name: "Done" }));
  expect(change.mock.calls).toEqual([[true], [false]]);
  expect(screen.getByRole("dialog", { name: "Project details" })).toBeInTheDocument();
});

it("preserves disabled trigger and cancelable trigger clicks", async () => {
  const change = vi.fn();
  const { rerender } = render(
    <Dialog onOpenChange={change}>
      <DialogTrigger disabled>Open</DialogTrigger>
    </Dialog>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Open" }));
  expect(screen.getByRole("button", { name: "Open" })).toBeDisabled();
  expect(change).not.toHaveBeenCalled();
  rerender(
    <Dialog onOpenChange={change}>
      <DialogTrigger onClick={(event) => event.preventDefault()}>Open</DialogTrigger>
    </Dialog>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Open" }));
  expect(change).not.toHaveBeenCalled();
});

it("forwards refs and asChild to each supplied host without injecting portal, overlay or controls", async () => {
  const trigger = createRef<HTMLButtonElement>();
  const content = createRef<HTMLDivElement>();
  const title = createRef<HTMLHeadingElement>();
  const description = createRef<HTMLParagraphElement>();
  const header = createRef<HTMLDivElement>();
  const footer = createRef<HTMLDivElement>();
  const close = createRef<HTMLButtonElement>();
  const { container } = render(
    <Dialog>
      <DialogTrigger asChild ref={trigger}>
        <button>Custom open</button>
      </DialogTrigger>
      <DialogContent asChild ref={content}>
        <section data-testid="panel">
          <DialogHeader asChild ref={header}>
            <header data-testid="header">
              <DialogTitle asChild ref={title}>
                <h3>Custom title</h3>
              </DialogTitle>
              <DialogDescription asChild ref={description}>
                <p>Custom description</p>
              </DialogDescription>
            </header>
          </DialogHeader>
          <DialogFooter asChild ref={footer}>
            <footer data-testid="footer">
              <DialogClose asChild ref={close}>
                <button>Custom close</button>
              </DialogClose>
            </footer>
          </DialogFooter>
        </section>
      </DialogContent>
    </Dialog>,
  );
  expect(trigger.current).toBe(screen.getByRole("button", { name: "Custom open" }));
  await userEvent.click(trigger.current!);
  const panel = await screen.findByRole("dialog", { name: "Custom title" });
  expect(content.current).toBe(panel);
  expect(panel.tagName).toBe("SECTION");
  expect(container).toContainElement(panel);
  expect(title.current).toBe(screen.getByRole("heading", { level: 3, name: "Custom title" }));
  expect(description.current).toBe(screen.getByText("Custom description"));
  expect(header.current).toBe(screen.getByTestId("header"));
  expect(footer.current).toBe(screen.getByTestId("footer"));
  expect(close.current).toBe(screen.getByRole("button", { name: "Custom close" }));
  expect(panel.querySelectorAll("button")).toHaveLength(1);
  expect(document.querySelector('[data-slot="dialog-overlay"]')).toBeNull();
});

it("respects custom portal containers and forwards overlay refs/asChild", async () => {
  const target = document.createElement("aside");
  document.body.append(target);
  const overlayRef = createRef<HTMLDivElement>();
  try {
    const { container } = render(
      <Dialog defaultOpen>
        <DialogPortal container={target}>
          <DialogOverlay asChild ref={overlayRef}>
            <div data-testid="custom-overlay" />
          </DialogOverlay>
          <DialogContent>
            <DialogTitle>Portaled</DialogTitle>
            <DialogDescription>Elsewhere.</DialogDescription>
          </DialogContent>
        </DialogPortal>
      </Dialog>,
    );
    const panel = await screen.findByRole("dialog", { name: "Portaled" });
    expect(target).toContainElement(panel);
    expect(container).not.toContainElement(panel);
    expect(overlayRef.current).toBe(screen.getByTestId("custom-overlay"));
    expect(target).toContainElement(overlayRef.current);
  } finally {
    cleanup();
    target.remove();
  }
});

it.each([false, true])("Close is form-safe with asChild=%s", async (asChild) => {
  const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
  render(
    <Dialog defaultOpen>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle>Form</DialogTitle>
        <form onSubmit={submit}>
          <DialogClose asChild={asChild}>
            {asChild ? <button>Cancel</button> : "Cancel"}
          </DialogClose>
        </form>
      </DialogContent>
    </Dialog>,
  );
  const close = screen.getByRole("button", { name: "Cancel" });
  expect(close).toHaveAttribute("type", "button");
  await userEvent.click(close);
  expect(submit).not.toHaveBeenCalled();
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
});

it("preserves preventDefault on Escape, outside interaction and autofocus callbacks", async () => {
  const escape = vi.fn((event: KeyboardEvent) => event.preventDefault());
  const outside = vi.fn((event: Event) => event.preventDefault());
  const openFocus = vi.fn((event: Event) => event.preventDefault());
  const closeFocus = vi.fn((event: Event) => event.preventDefault());
  render(
    <Dialog defaultOpen>
      <DialogTrigger>Open</DialogTrigger>
      <DialogPortal>
        <DialogOverlay data-testid="overlay" />
        <DialogContent
          onEscapeKeyDown={escape}
          onPointerDownOutside={outside}
          onInteractOutside={outside}
          onOpenAutoFocus={openFocus}
          onCloseAutoFocus={closeFocus}
        >
          <DialogTitle>Protected</DialogTitle>
          <DialogDescription>Stay open.</DialogDescription>
          <DialogClose>Done</DialogClose>
        </DialogContent>
      </DialogPortal>
    </Dialog>,
  );
  const panel = await screen.findByRole("dialog", { name: "Protected" });
  expect(openFocus).toHaveBeenCalledOnce();
  expect(screen.getByRole("button", { name: "Done" })).not.toHaveFocus();
  fireEvent.keyDown(panel, { key: "Escape" });
  expect(escape).toHaveBeenCalledOnce();
  expect(panel).toBeInTheDocument();
  await userEvent.click(screen.getByTestId("overlay"));
  expect(outside).toHaveBeenCalledTimes(2);
  expect(panel).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Done" }));
  await waitFor(() => expect(closeFocus).toHaveBeenCalledOnce());
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.getByRole("button", { name: "Open" })).not.toHaveFocus();
});

it("allows a nonmodal outside control to receive focus and dismiss", async () => {
  const action = vi.fn();
  render(
    <>
      <button onClick={action}>Outside</button>
      <Dialog modal={false} defaultOpen>
        <Parts />
      </Dialog>
    </>,
  );
  const panel = await screen.findByRole("dialog", { name: "Project details" });
  expect(panel).toBeInTheDocument();
  expect(document.querySelector('[data-slot="dialog-overlay"]')).toBeNull();
  await userEvent.click(screen.getByRole("button", { name: "Outside" }));
  expect(action).toHaveBeenCalledOnce();
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(screen.getByRole("button", { name: "Outside" })).toHaveFocus();
});

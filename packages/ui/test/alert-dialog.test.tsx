import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, expect, it, vi } from "vitest";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../src/alert-dialog";

afterEach(cleanup);

function Parts() {
  return (
    <>
      <AlertDialogTrigger>Open confirmation</AlertDialogTrigger>
      <AlertDialogPortal>
        <AlertDialogOverlay data-testid="scrim" />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove draft?</AlertDialogTitle>
            <AlertDialogDescription>This removes your unsaved draft.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep draft</AlertDialogCancel>
            <AlertDialogAction>Remove draft</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </>
  );
}

it("opens a named and described portal, focuses Cancel and restores the trigger on Escape", async () => {
  const { container } = render(
    <AlertDialog>
      <Parts />
    </AlertDialog>,
  );
  const trigger = screen.getByRole("button", { name: "Open confirmation" });
  trigger.focus();
  await userEvent.keyboard("{Enter}");
  const alert = await screen.findByRole("alertdialog", { name: "Remove draft?" });
  expect(alert).toHaveAccessibleDescription("This removes your unsaved draft.");
  expect(container).not.toContainElement(alert);
  await waitFor(() =>
    expect(within(alert).getByRole("button", { name: "Keep draft" })).toHaveFocus(),
  );
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  expect(trigger).toHaveFocus();
});

it("outside pointer interaction cannot dismiss and tab focus stays in the confirmation", async () => {
  const changed = vi.fn();
  render(
    <AlertDialog defaultOpen onOpenChange={changed}>
      <Parts />
    </AlertDialog>,
  );
  const alert = await screen.findByRole("alertdialog");
  const cancel = within(alert).getByRole("button", { name: "Keep draft" });
  const action = within(alert).getByRole("button", { name: "Remove draft" });
  await waitFor(() => expect(cancel).toHaveFocus());
  await userEvent.tab();
  expect(action).toHaveFocus();
  await userEvent.tab();
  expect(cancel).toHaveFocus();
  await userEvent.tab({ shift: true });
  expect(action).toHaveFocus();
  fireEvent.pointerDown(screen.getByTestId("scrim"), { button: 0 });
  fireEvent.click(screen.getByTestId("scrim"));
  expect(alert).toBeInTheDocument();
  expect(changed).not.toHaveBeenCalled();
});

it.each(["Keep draft", "Remove draft"])("%s closes uncontrolled state", async (label) => {
  const changed = vi.fn();
  render(
    <AlertDialog defaultOpen onOpenChange={changed}>
      <Parts />
    </AlertDialog>,
  );
  await userEvent.click(await screen.findByRole("button", { name: label }));
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  expect(changed).toHaveBeenCalledExactlyOnceWith(false);
});

it("controlled state reports closing without overriding the caller", async () => {
  const changed = vi.fn();
  const { rerender } = render(
    <AlertDialog open onOpenChange={changed}>
      <Parts />
    </AlertDialog>,
  );
  await userEvent.click(await screen.findByRole("button", { name: "Keep draft" }));
  expect(changed).toHaveBeenCalledExactlyOnceWith(false);
  expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  rerender(
    <AlertDialog open={false} onOpenChange={changed}>
      <Parts />
    </AlertDialog>,
  );
  expect(screen.queryByRole("alertdialog")).toBeNull();
});

it("prevented Action and Escape preserve open state for caller-owned asynchronous work", async () => {
  const changed = vi.fn();
  const action = vi.fn((event: React.MouseEvent<HTMLButtonElement>) => event.preventDefault());
  const escape = vi.fn((event: KeyboardEvent) => event.preventDefault());
  render(
    <AlertDialog defaultOpen onOpenChange={changed}>
      <AlertDialogContent onEscapeKeyDown={escape}>
        <AlertDialogTitle>Save draft?</AlertDialogTitle>
        <AlertDialogDescription>Wait for the save to complete.</AlertDialogDescription>
        <AlertDialogCancel>Cancel save</AlertDialogCancel>
        <AlertDialogAction onClick={action}>Save draft</AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>,
  );
  await userEvent.click(await screen.findByRole("button", { name: "Save draft" }));
  expect(action).toHaveBeenCalledOnce();
  await userEvent.keyboard("{Escape}");
  expect(escape).toHaveBeenCalledOnce();
  expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  expect(changed).not.toHaveBeenCalled();
});

it("passes asChild, refs, native props and custom portal containers to caller hosts", async () => {
  const triggerRef = createRef<HTMLButtonElement>();
  const contentRef = createRef<HTMLDivElement>();
  const cancelRef = createRef<HTMLButtonElement>();
  const actionRef = createRef<HTMLButtonElement>();
  const headerRef = createRef<HTMLDivElement>();
  const footerRef = createRef<HTMLDivElement>();
  const portal = document.createElement("div");
  document.body.append(portal);
  try {
    render(
      <AlertDialog>
        <AlertDialogTrigger asChild ref={triggerRef}>
          <button data-custom="trigger">Custom confirm</button>
        </AlertDialogTrigger>
        <AlertDialogPortal container={portal}>
          <AlertDialogContent asChild ref={contentRef}>
            <section data-testid="content-host">
              <AlertDialogHeader asChild ref={headerRef}>
                <header data-testid="header-host">
                  <AlertDialogTitle asChild>
                    <h3>Custom title</h3>
                  </AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <p>Custom description</p>
                  </AlertDialogDescription>
                </header>
              </AlertDialogHeader>
              <AlertDialogFooter asChild ref={footerRef}>
                <footer data-testid="footer-host">
                  <AlertDialogCancel asChild ref={cancelRef}>
                    <button data-custom="cancel">Custom cancel</button>
                  </AlertDialogCancel>
                  <AlertDialogAction asChild ref={actionRef} disabled>
                    <button>Custom action</button>
                  </AlertDialogAction>
                </footer>
              </AlertDialogFooter>
            </section>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>,
    );
    const trigger = screen.getByRole("button", { name: "Custom confirm" });
    expect(triggerRef.current).toBe(trigger);
    expect(trigger).toHaveAttribute("data-custom", "trigger");
    await userEvent.click(trigger);
    const alert = await screen.findByRole("alertdialog", { name: "Custom title" });
    expect(portal).toContainElement(alert);
    expect(contentRef.current).toBe(alert);
    expect(alert.tagName).toBe("SECTION");
    expect(alert).toHaveAccessibleDescription("Custom description");
    expect(headerRef.current).toBe(screen.getByTestId("header-host"));
    expect(footerRef.current).toBe(screen.getByTestId("footer-host"));
    expect(cancelRef.current).toBe(screen.getByRole("button", { name: "Custom cancel" }));
    expect(cancelRef.current).toHaveAttribute("data-custom", "cancel");
    expect(actionRef.current).toBe(screen.getByRole("button", { name: "Custom action" }));
    expect(actionRef.current).toBeDisabled();
    expect(alert.querySelector('[data-slot="alert-dialog-overlay"]')).toBeNull();
    expect(within(alert).getAllByRole("button")).toHaveLength(2);
  } finally {
    cleanup();
    portal.remove();
  }
});

it("Content renders inline without injecting a portal, overlay, title or controls", async () => {
  const { container } = render(
    <AlertDialog defaultOpen>
      <AlertDialogContent aria-label="Caller panel" aria-describedby={undefined}>
        <AlertDialogTitle className="sr-only">Caller panel</AlertDialogTitle>
        <AlertDialogDescription className="sr-only">Caller description</AlertDialogDescription>
        <p>Caller content</p>
      </AlertDialogContent>
    </AlertDialog>,
  );
  const alert = await screen.findByRole("alertdialog", { name: "Caller panel" });
  expect(container).toContainElement(alert);
  expect(within(alert).queryAllByRole("button")).toEqual([]);
  expect(document.querySelector('[data-slot="alert-dialog-overlay"]')).toBeNull();
});

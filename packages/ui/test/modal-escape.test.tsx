import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, expect, it, vi } from "vitest";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "../src/alert-dialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "../src/dialog";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "../src/sheet";

afterEach(cleanup);

const parents = [
  {
    name: "Sheet",
    Root: Sheet,
    Content: SheetContent,
    Title: SheetTitle,
    Description: SheetDescription,
  },
  {
    name: "Dialog",
    Root: Dialog,
    Content: DialogContent,
    Title: DialogTitle,
    Description: DialogDescription,
  },
  {
    name: "AlertDialog",
    Root: AlertDialog,
    Content: AlertDialogContent,
    Title: AlertDialogTitle,
    Description: AlertDialogDescription,
  },
];

it.each(parents)(
  "$name preserves a custom host ref and caller-canceled Escape",
  async ({ Root, Content, Title, Description }) => {
    const ref = createRef<HTMLDivElement>();
    const onEscape = vi.fn((event: KeyboardEvent) => event.preventDefault());
    const onChange = vi.fn();
    const view = render(
      <Root defaultOpen onOpenChange={onChange}>
        <Content asChild ref={ref} onEscapeKeyDown={onEscape}>
          <div data-testid="host">
            <Title>Custom modal</Title>
            <Description>Caller controls dismissal.</Description>
            <button>Keep working</button>
          </div>
        </Content>
      </Root>,
    );
    expect(ref.current).toBe(screen.getByTestId("host"));
    await userEvent.keyboard("{Escape}");
    expect(onEscape).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByTestId("host")).toBeVisible();
    view.unmount();
    expect(ref.current).toBeNull();
  },
);

it.each(parents)(
  "$name survives Escape during a child layer's registration and still closes normally",
  async ({ Root, Content, Title, Description }) => {
    const parentChange = vi.fn();
    const parentEscape = vi.fn();
    render(
      <Root defaultOpen onOpenChange={parentChange}>
        <Content data-testid="parent" onEscapeKeyDown={parentEscape}>
          <Title>Parent</Title>
          <Description>Keep editing after confirmation.</Description>
          <Dialog>
            <DialogTrigger>Open child</DialogTrigger>
            <DialogPortal>
              <DialogContent id="registration-child">
                <DialogTitle>Child</DialogTitle>
                <DialogDescription>Nested details.</DialogDescription>
                <DialogClose>Done</DialogClose>
              </DialogContent>
            </DialogPortal>
          </Dialog>
        </Content>
      </Root>,
    );
    let injected = 0;
    let hiddenAtEscape: string | null = null;
    const duringRegistration = () => {
      const child = document.getElementById("registration-child");
      if (!child || injected) return;
      injected++;
      hiddenAtEscape =
        screen.getByTestId("parent").closest('[aria-hidden="true"]')?.getAttribute("aria-hidden") ??
        null;
      child.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
      );
    };
    document.addEventListener("dismissableLayer.update", duringRegistration);
    try {
      fireEvent.click(screen.getByRole("button", { name: "Open child" }));
    } finally {
      document.removeEventListener("dismissableLayer.update", duringRegistration);
    }
    expect(injected, "the key must land inside the registration window").toBe(1);
    expect(hiddenAtEscape).toBe("true");
    expect(
      parentChange,
      "a background modal must never dismiss on the child's Escape",
    ).not.toHaveBeenCalled();
    expect(parentEscape).not.toHaveBeenCalled();
    expect(screen.getByTestId("parent")).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Child" })).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Child" })).toBeNull());
    await waitFor(() => expect(screen.getByRole("button", { name: "Open child" })).toHaveFocus());
    expect(parentChange).not.toHaveBeenCalled();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByTestId("parent")).toBeNull());
    expect(parentChange).toHaveBeenCalledExactlyOnceWith(false);
    expect(parentEscape).toHaveBeenCalledTimes(1);
  },
);

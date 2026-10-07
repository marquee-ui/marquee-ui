import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/tabs";

afterEach(cleanup);

it("forwards primitive props, composed hosts and refs without taking controlled state", async () => {
  const root = createRef<HTMLDivElement>();
  const list = createRef<HTMLDivElement>();
  const trigger = createRef<HTMLButtonElement>();
  const panel = createRef<HTMLDivElement>();
  const change = vi.fn();
  render(
    <Tabs
      value="one"
      onValueChange={change}
      activationMode="manual"
      ref={root}
      asChild
      id="owned-tabs"
      dir="rtl"
    >
      <section>
        <TabsList ref={list} asChild aria-label="Owned sections" loop={false}>
          <div>
            <TabsTrigger value="one" ref={trigger} asChild>
              <button type="button" data-caller="kept">
                One
              </button>
            </TabsTrigger>
            <TabsTrigger value="two">Two</TabsTrigger>
          </div>
        </TabsList>
        <TabsContent value="one" ref={panel} asChild>
          <article>One content</article>
        </TabsContent>
        <TabsContent value="two" forceMount data-testid="mounted-panel">
          Two content
        </TabsContent>
      </section>
    </Tabs>,
  );
  expect(root.current).toBe(document.getElementById("owned-tabs"));
  expect(root.current?.tagName).toBe("SECTION");
  expect(root.current).toHaveAttribute("dir", "rtl");
  expect(list.current).toBe(screen.getByRole("tablist", { name: "Owned sections" }));
  expect(trigger.current).toBe(screen.getByRole("tab", { name: "One" }));
  expect(trigger.current).toHaveAttribute("data-caller", "kept");
  expect(panel.current).toBe(screen.getByRole("tabpanel", { name: "One" }));
  expect(panel.current?.tagName).toBe("ARTICLE");
  expect(screen.getByTestId("mounted-panel")).toHaveTextContent("Two content");
  await userEvent.click(screen.getByRole("tab", { name: "Two" }));
  expect(change).toHaveBeenCalledExactlyOnceWith("two");
  expect(trigger.current).toHaveAttribute("aria-selected", "true");
  expect(screen.getByRole("tab", { name: "Two" })).toHaveAttribute("aria-selected", "false");
});

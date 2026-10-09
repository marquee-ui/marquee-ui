import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/tabs";

const meta = { title: "Parts/Tabs", component: Tabs } satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;

function Triggers() {
  return (
    <>
      <TabsTrigger value="overview">Overview</TabsTrigger>
      <TabsTrigger value="reports" disabled>
        Reports
      </TabsTrigger>
      <TabsTrigger value="activity">Activity</TabsTrigger>
    </>
  );
}

function Panels() {
  return (
    <>
      <TabsContent value="overview">Overview content</TabsContent>
      <TabsContent value="reports">Reports content</TabsContent>
      <TabsContent value="activity">Activity content</TabsContent>
    </>
  );
}

async function selected(canvasElement: HTMLElement, name: string, content: string) {
  const canvas = within(canvasElement);
  const trigger = canvas.getByRole("tab", { name });
  const panel = canvas.getByRole("tabpanel", { name });
  await expect(trigger).toHaveAttribute("aria-selected", "true");
  await expect(panel).toHaveTextContent(content);
  await expect(panel).toHaveAttribute("aria-labelledby", trigger.id);
  await expect(trigger).toHaveAttribute("aria-controls", panel.id);
  await expect(canvas.getAllByRole("tabpanel")).toHaveLength(1);
}

export const Default: Story = {
  args: {
    defaultValue: "overview",
    children: (
      <>
        <TabsList aria-label="Sections">
          <Triggers />
        </TabsList>
        <Panels />
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await selected(canvasElement, "Overview", "Overview content");
    const first = canvas.getByRole("tab", { name: "Overview" });
    const last = canvas.getByRole("tab", { name: "Activity" });
    await expect(canvas.getByRole("tab", { name: "Reports" })).toBeDisabled();
    first.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(last).toHaveFocus();
    await selected(canvasElement, "Activity", "Activity content");
    await expect(first).toHaveAttribute("aria-selected", "false");
    await userEvent.keyboard("{ArrowRight}");
    await expect(first).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect(last).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await expect(first).toHaveFocus();
    await selected(canvasElement, "Overview", "Overview content");
    await userEvent.tab();
    await expect(canvas.getByRole("tabpanel", { name: "Overview" })).toHaveFocus();
  },
};

export const Line: Story = {
  args: {
    defaultValue: "overview",
    children: (
      <>
        <TabsList variant="line" aria-label="Sections">
          <Triggers />
        </TabsList>
        <Panels />
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await selected(canvasElement, "Overview", "Overview content");
    await userEvent.click(canvas.getByRole("tab", { name: "Activity" }));
    await selected(canvasElement, "Activity", "Activity content");
    await expect(canvas.getByRole("tab", { name: "Overview" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  },
};

export const Manual: Story = {
  args: {
    defaultValue: "overview",
    activationMode: "manual",
    children: (
      <>
        <TabsList aria-label="Sections" loop={false}>
          <Triggers />
        </TabsList>
        <Panels />
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole("tab", { name: "Overview" });
    const last = canvas.getByRole("tab", { name: "Activity" });
    first.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(last).toHaveFocus();
    await selected(canvasElement, "Overview", "Overview content");
    await expect(last).toHaveAttribute("aria-selected", "false");
    await userEvent.keyboard("{ArrowRight}");
    await expect(last).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await selected(canvasElement, "Activity", "Activity content");
    await userEvent.keyboard("{Home}");
    await expect(first).toHaveFocus();
    await selected(canvasElement, "Activity", "Activity content");
    await userEvent.keyboard(" ");
    await selected(canvasElement, "Overview", "Overview content");
  },
};

export const Vertical: Story = {
  args: {
    defaultValue: "overview",
    orientation: "vertical",
    children: (
      <>
        <TabsList variant="line" aria-label="Sections">
          <Triggers />
        </TabsList>
        <Panels />
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole("tab", { name: "Overview" });
    const last = canvas.getByRole("tab", { name: "Activity" });
    await expect(canvas.getByRole("tablist")).toHaveAttribute("aria-orientation", "vertical");
    first.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(first).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(last).toHaveFocus();
    await selected(canvasElement, "Activity", "Activity content");
    await userEvent.keyboard("{ArrowUp}");
    await expect(first).toHaveFocus();
    await selected(canvasElement, "Overview", "Overview content");
  },
};

function ControlledExample() {
  const [value, setValue] = useState("overview");
  return (
    <>
      <button className="min-h-hit px-3" onClick={() => setValue("overview")}>
        Reset selection
      </button>
      <p role="status">Selected: {value}</p>
      <Tabs value={value} onValueChange={setValue} dir="rtl">
        <TabsList aria-label="Sections">
          <Triggers />
        </TabsList>
        <Panels />
      </Tabs>
    </>
  );
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole("tab", { name: "Overview" });
    first.focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(canvas.getByRole("tab", { name: "Activity" })).toHaveFocus();
    await expect(canvas.getByRole("status")).toHaveTextContent("Selected: activity");
    await selected(canvasElement, "Activity", "Activity content");
    await userEvent.click(canvas.getByRole("button", { name: "Reset selection" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Selected: overview");
    await selected(canvasElement, "Overview", "Overview content");
  },
};

const composedClick = fn();
export const Composition: Story = {
  args: {
    defaultValue: "overview",
    asChild: true,
    children: (
      <section aria-label="Composed tabs">
        <TabsList asChild aria-label="Sections">
          <div>
            <TabsTrigger value="overview" asChild>
              <button type="button" onClick={composedClick}>
                <span>Overview</span>
              </button>
            </TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </div>
        </TabsList>
        <TabsContent value="overview" asChild>
          <article>Composed overview content</article>
        </TabsContent>
        <TabsContent value="activity">Activity content</TabsContent>
      </section>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("region", { name: "Composed tabs" }).tagName).toBe("SECTION");
    await expect(canvas.getByRole("tabpanel", { name: "Overview" }).tagName).toBe("ARTICLE");
    await userEvent.click(canvas.getByRole("tab", { name: "Activity" }));
    await selected(canvasElement, "Activity", "Activity content");
    await expect(canvas.getByRole("tab", { name: "Overview" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
    const before = composedClick.mock.calls.length;
    await userEvent.click(canvas.getByRole("tab", { name: "Overview" }));
    await expect(composedClick.mock.calls.length).toBe(before + 1);
    await selected(canvasElement, "Overview", "Composed overview content");
    await expect(canvas.getAllByRole("tab")).toHaveLength(2);
  },
};

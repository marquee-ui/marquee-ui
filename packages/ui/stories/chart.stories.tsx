import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "@/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/dialog";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line as RechartsLine,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartLegendItem,
  ChartTooltip,
  ChartTooltipContent,
} from "@/chart";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/table";

const data = [
  { month: "Jan", north: 18, south: 12 },
  { month: "Feb", north: 24, south: 20 },
  { month: "Mar", north: 28, south: 16 },
  { month: "Apr", north: 32, south: 24 },
];

function MonthlyPlot({ kind, fixed = false }: { kind: "bars" | "lines"; fixed?: boolean }) {
  const parts = (
    <>
      <CartesianGrid vertical={false} stroke="var(--border)" />
      <XAxis
        dataKey="month"
        tickLine={false}
        axisLine={false}
        tick={{ fill: "var(--foreground-2)" }}
      />
      <YAxis width={32} tickLine={false} axisLine={false} tick={{ fill: "var(--foreground-2)" }} />
      <ChartTooltip
        isAnimationActive={false}
        cursor={false}
        content={({ active, label }) => {
          const point = data.find((row) => row.month === label);
          return active && point ? (
            <ChartTooltipContent>
              {point.month}. North {point.north}. South {point.south}.
            </ChartTooltipContent>
          ) : null;
        }}
      />
      <ChartLegend
        content={
          <ChartLegendContent aria-label="Volume series">
            <ChartLegendItem>
              <span
                aria-hidden="true"
                className="h-3 w-3 border-2 border-foreground bg-categorical-1"
              />
              North (solid)
            </ChartLegendItem>
            <ChartLegendItem>
              <span
                aria-hidden="true"
                className="h-3 w-3 border-2 border-dashed border-foreground bg-categorical-2"
              />
              South (dashed)
            </ChartLegendItem>
          </ChartLegendContent>
        }
      />
    </>
  );
  return (
    <ChartContainer>
      <ResponsiveContainer width={fixed ? 320 : "100%"} height={256}>
        {kind === "bars" ? (
          <BarChart
            data={data}
            accessibilityLayer
            aria-label="Monthly volume bars"
            margin={{ top: 12, right: 12, bottom: 8, left: 0 }}
          >
            {parts}
            <Bar
              dataKey="north"
              name="North"
              fill="var(--categorical-1)"
              stroke="var(--foreground)"
              strokeWidth={2}
              isAnimationActive={false}
            />
            <Bar
              dataKey="south"
              name="South"
              fill="var(--categorical-2)"
              stroke="var(--foreground)"
              strokeWidth={2}
              strokeDasharray="4 3"
              isAnimationActive={false}
            />
          </BarChart>
        ) : (
          <LineChart
            data={data}
            accessibilityLayer
            aria-label="Monthly volume lines"
            margin={{ top: 12, right: 12, bottom: 8, left: 0 }}
          >
            {parts}
            <RechartsLine
              dataKey="north"
              name="North"
              stroke="var(--categorical-1)"
              strokeWidth={3}
              isAnimationActive={false}
            />
            <RechartsLine
              dataKey="south"
              name="South"
              stroke="var(--categorical-2)"
              strokeWidth={3}
              strokeDasharray="4 3"
              isAnimationActive={false}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </ChartContainer>
  );
}

const meta = { title: "Parts/Chart", component: ChartContainer } satisfies Meta<
  typeof ChartContainer
>;
export default meta;
type Story = StoryObj<typeof meta>;

function NativeData() {
  return (
    <Table>
      <TableCaption>Monthly volume data</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Month</TableHead>
          <TableHead scope="col">North</TableHead>
          <TableHead scope="col">South</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.month}>
            <TableHead scope="row">{row.month}</TableHead>
            <TableCell>{row.north}</TableCell>
            <TableCell>{row.south}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function MonthlyDemo({
  kind = "bars",
  fixed = false,
}: {
  kind?: "bars" | "lines";
  fixed?: boolean;
}) {
  return (
    <div className="w-full min-w-0 space-y-4">
      <p className="text-sm text-foreground-2">
        Monthly volume. Focus the chart and use Left/Right arrows. Values also appear in the native
        table.
      </p>
      <MonthlyPlot kind={kind} fixed={fixed} />
      <NativeData />
    </div>
  );
}

export const Default: Story = {
  render: () => <MonthlyDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = canvas.getByRole("table", { name: "Monthly volume data" });
    await expect(table.tagName).toBe("TABLE");
    await expect(
      within(table)
        .getAllByRole("columnheader")
        .map((el) => el.textContent),
    ).toEqual(["Month", "North", "South"]);
    await expect(
      within(table)
        .getAllByRole("row")
        .map((el) => el.textContent),
    ).toEqual(["MonthNorthSouth", "Jan1812", "Feb2420", "Mar2816", "Apr3224"]);
    await expect(canvas.getByRole("rowheader", { name: "Apr" })).toHaveAttribute("scope", "row");
  },
};

export const Line: Story = {
  render: () => <MonthlyDemo kind="lines" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = canvas.getByRole("table", { name: "Monthly volume data" });
    await expect(within(table).getByRole("row", { name: "Feb 24 20" })).toBeInTheDocument();
    await expect(within(table).getByRole("row", { name: "Mar 28 16" })).toBeInTheDocument();
    await expect(within(table).getAllByRole("row")).toHaveLength(5);
  },
};

/** Fixed dimensions exercise real Recharts keyboard handlers in jsdom; browser tests prove responsiveness. */
export const Keyboard: Story = {
  render: () => <MonthlyDemo fixed />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const chart = canvas.getByRole("application", { name: "Monthly volume bars" });
    chart.focus();
    await expect(chart).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(await canvas.findByRole("status")).toHaveTextContent("Feb. North 24. South 20.");
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await expect(await canvas.findByRole("status")).toHaveTextContent("Apr. North 32. South 24.");
    await userEvent.keyboard("{ArrowLeft}");
    await expect(await canvas.findByRole("status")).toHaveTextContent("Mar. North 28. South 16.");
    await expect(canvas.getByRole("list", { name: "Volume series" }).tagName).toBe("UL");
  },
};

function ComposedHosts() {
  const [visible, setVisible] = useState(true);
  return (
    <div className="w-full space-y-4">
      <ChartContainer asChild className="h-auto" aria-label="Composed chart">
        <section>
          <ChartTooltipContent asChild>
            <aside aria-label="Caller point">Jan. North 18. South 12.</aside>
          </ChartTooltipContent>
          <ChartLegendContent asChild aria-label="Caller series">
            <ul>
              <ChartLegendItem asChild>
                <li>
                  <Button
                    width="auto"
                    variant="secondary"
                    onClick={() => setVisible((value) => !value)}
                  >
                    Toggle North
                  </Button>
                </li>
              </ChartLegendItem>
            </ul>
          </ChartLegendContent>
        </section>
      </ChartContainer>
      <output aria-label="Caller visibility">North {visible ? "visible" : "hidden"}</output>
    </div>
  );
}

export const Composed: Story = {
  render: () => <ComposedHosts />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("Composed chart").tagName).toBe("SECTION");
    await expect(canvas.getByRole("status", { name: "Caller point" }).tagName).toBe("ASIDE");
    await expect(canvas.getByRole("list", { name: "Caller series" }).tagName).toBe("UL");
    await expect(canvas.getByRole("listitem").tagName).toBe("LI");
    await userEvent.click(canvas.getByRole("button", { name: "Toggle North" }));
    await expect(canvas.getByLabelText("Caller visibility")).toHaveTextContent("North hidden");
  },
};

export const FocusableParts: Story = {
  render: () => (
    <ChartContainer tabIndex={0} className="h-auto space-y-4" aria-label="Focusable chart parts">
      <ChartTooltipContent tabIndex={0}>Jan. North 18.</ChartTooltipContent>
      <ChartLegendContent tabIndex={0} aria-label="Focusable series">
        <ChartLegendItem tabIndex={0}>North</ChartLegendItem>
      </ChartLegendContent>
    </ChartContainer>
  ),
  play: async ({ canvasElement }) => {
    for (const slot of [
      "chart-container",
      "chart-tooltip-content",
      "chart-legend-content",
      "chart-legend-item",
    ]) {
      const host = canvasElement.querySelector<HTMLElement>(`[data-slot="${slot}"]`)!;
      await expect(host).toBeInTheDocument();
      host.focus();
      await expect(host).toHaveFocus();
    }
    await expect(within(canvasElement).getByRole("status")).toHaveAttribute(
      "aria-live",
      "assertive",
    );
  },
};

export const InDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger>Inspect monthly chart</DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent>
          <DialogTitle>Monthly chart details</DialogTitle>
          <DialogDescription>
            Use the chart or read its native table without leaving this dialog.
          </DialogDescription>
          <MonthlyDemo />
          <DialogClose>Done inspecting</DialogClose>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Inspect monthly chart" });
    await userEvent.click(trigger);
    const body = within(document.body);
    const dialog = await body.findByRole("dialog", { name: "Monthly chart details" });
    await expect(
      within(dialog).getByRole("table", { name: "Monthly volume data" }),
    ).toBeInTheDocument();
    await expect(dialog).toHaveAccessibleDescription(
      "Use the chart or read its native table without leaving this dialog.",
    );
    await userEvent.keyboard("{Escape}");
    await waitFor(async () => {
      await expect(body.queryByRole("dialog")).toBeNull();
    });
    await expect(trigger).toHaveFocus();
  },
};

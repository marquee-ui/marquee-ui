import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { createRef } from "react";
import { Bar, BarChart, Legend, Tooltip, XAxis } from "recharts";
import { afterEach, expect, it, vi } from "vitest";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartLegendItem,
  ChartTooltip,
  ChartTooltipContent,
} from "@/chart";

afterEach(cleanup);

it("composes a measured host without injecting chart, tooltip, legend or data", () => {
  const ref = createRef<HTMLDivElement>();
  const onClick = vi.fn();
  render(
    <ChartContainer ref={ref} aria-label="Caller chart" onClick={onClick} className="h-80">
      <p>Caller contents</p>
    </ChartContainer>,
  );
  const host = screen.getByLabelText("Caller chart");
  expect(ref.current).toBe(host);
  expect(host).toHaveClass("h-80");
  expect(host).not.toHaveClass("h-64");
  expect(host.children).toHaveLength(1);
  expect(host.firstElementChild).toHaveTextContent("Caller contents");
  expect(host.querySelector("svg, style, [role=status], ul")).toBeNull();
  fireEvent.click(host);
  expect(onClick).toHaveBeenCalledTimes(1);
});

it("slotted container and live tooltip preserve host refs, names, attributes and events", () => {
  const container = createRef<HTMLDivElement>();
  const tooltip = createRef<HTMLDivElement>();
  const onKeyDown = vi.fn();
  render(
    <ChartContainer asChild ref={container} aria-label="Composed chart" data-caller="container">
      <section>
        <ChartTooltipContent asChild ref={tooltip} onKeyDown={onKeyDown} tabIndex={0}>
          <aside aria-label="Current point">Jan. North 18. South 12.</aside>
        </ChartTooltipContent>
      </section>
    </ChartContainer>,
  );
  const host = screen.getByLabelText("Composed chart");
  const live = screen.getByRole("status", { name: "Current point" });
  expect(host.tagName).toBe("SECTION");
  expect(host).toHaveAttribute("data-caller", "container");
  expect(container.current).toBe(host);
  expect(live.tagName).toBe("ASIDE");
  expect(tooltip.current).toBe(live);
  expect(live).toHaveAttribute("aria-live", "assertive");
  expect(live).toHaveAttribute("aria-atomic", "true");
  expect(live).toHaveTextContent("Jan. North 18. South 12.");
  fireEvent.keyDown(live, { key: "ArrowRight" });
  expect(onKeyDown).toHaveBeenCalledTimes(1);
});

it("legend parts keep native list semantics and explicit children on slotted ul/li hosts", () => {
  const legend = createRef<HTMLUListElement>();
  const item = createRef<HTMLLIElement>();
  const onClick = vi.fn();
  render(
    <ChartLegendContent asChild ref={legend} aria-label="Regions">
      <ul data-caller="legend">
        <ChartLegendItem asChild ref={item} onClick={onClick} data-series="north">
          <li>
            <span aria-hidden="true">—</span>North
          </li>
        </ChartLegendItem>
        <ChartLegendItem>South</ChartLegendItem>
      </ul>
    </ChartLegendContent>,
  );
  const list = screen.getByRole("list", { name: "Regions" });
  const items = within(list).getAllByRole("listitem");
  expect(list.tagName).toBe("UL");
  expect(list).toHaveAttribute("data-caller", "legend");
  expect(legend.current).toBe(list);
  expect(items.map((node) => node.tagName)).toEqual(["LI", "LI"]);
  expect(items.map((node) => node.textContent)).toEqual(["—North", "South"]);
  expect(item.current).toBe(items[0]);
  expect(items[0]).toHaveAttribute("data-series", "north");
  fireEvent.click(items[0]!);
  expect(onClick).toHaveBeenCalledTimes(1);
});

it("uses the real Recharts tooltip and legend while keyboard navigation updates concise point data", async () => {
  expect(ChartTooltip).toBe(Tooltip);
  expect(ChartLegend).toBe(Legend);
  const data = [
    { month: "Jan", north: 18, south: 12 },
    { month: "Feb", north: 24, south: 20 },
  ];
  render(
    <ChartContainer>
      <BarChart width={320} height={256} data={data} accessibilityLayer aria-label="Monthly volume">
        <XAxis dataKey="month" />
        <Bar dataKey="north" name="North" isAnimationActive={false} />
        <Bar dataKey="south" name="South" isAnimationActive={false} />
        <ChartTooltip
          isAnimationActive={false}
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
              <ChartLegendItem>North</ChartLegendItem>
              <ChartLegendItem>South</ChartLegendItem>
            </ChartLegendContent>
          }
        />
      </BarChart>
    </ChartContainer>,
  );
  const chart = screen.getByRole("application", { name: "Monthly volume" });
  expect(chart.tagName.toLowerCase()).toBe("svg");
  expect(chart).toHaveAttribute("tabindex", "0");
  expect(screen.getByRole("list", { name: "Volume series" })).toBeInTheDocument();
  fireEvent.focus(chart);
  fireEvent.keyDown(chart, { key: "ArrowRight" });
  expect(await screen.findByRole("status")).toHaveTextContent("Feb. North 24. South 20.");
  fireEvent.keyDown(chart, { key: "ArrowLeft" });
  expect(await screen.findByRole("status")).toHaveTextContent("Jan. North 18. South 12.");
});

import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
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
  const observed: string[] = [];
  render(
    <div onKeyDown={(event) => observed.push(`ancestor:${event.defaultPrevented}`)}>
      <ChartContainer onKeyDown={(event) => observed.push(`caller:${event.defaultPrevented}`)}>
        <BarChart
          width={320}
          height={256}
          data={data}
          accessibilityLayer
          aria-label="Monthly volume"
        >
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
      </ChartContainer>
    </div>,
  );
  const chart = screen.getByRole("application", { name: "Monthly volume" });
  expect(chart.tagName.toLowerCase()).toBe("svg");
  expect(chart).toHaveAttribute("tabindex", "0");
  expect(screen.getByRole("list", { name: "Volume series" })).toBeInTheDocument();
  act(() => chart.focus());
  expect(chart).toHaveFocus();
  const right = new KeyboardEvent("keydown", {
    key: "ArrowRight",
    bubbles: true,
    cancelable: true,
  });
  fireEvent(chart, right);
  expect(right.defaultPrevented, "point arrows cancel ancestor browser scrolling").toBe(true);
  expect(observed).toEqual(["caller:false", "ancestor:true"]);
  expect(await screen.findByRole("status")).toHaveTextContent("Feb. North 24. South 20.");
  const left = new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true });
  fireEvent(chart, left);
  expect(left.defaultPrevented).toBe(true);
  expect(observed).toEqual(["caller:false", "ancestor:true", "caller:false", "ancestor:true"]);
  expect(await screen.findByRole("status")).toHaveTextContent("Jan. North 18. South 12.");
});

it.each([false, true])(
  "slotted keyboard hosts preserve caller order and cancellation %s",
  (cancel) => {
    const observed: string[] = [];
    const ref = createRef<HTMLDivElement>();
    render(
      <div onKeyDown={(event) => observed.push(`ancestor:${event.defaultPrevented}`)}>
        <ChartContainer
          asChild
          ref={ref}
          onKeyDown={(event) => observed.push(`caller:${event.defaultPrevented}`)}
        >
          <section
            onKeyDown={(event) => {
              observed.push(`child:${event.defaultPrevented}`);
              if (cancel) event.preventDefault();
            }}
          >
            <svg
              role="application"
              className="recharts-surface"
              tabIndex={0}
              aria-label="Slotted plot"
            />
          </section>
        </ChartContainer>
      </div>,
    );
    const chart = screen.getByRole("application", { name: "Slotted plot" });
    act(() => chart.focus());
    const event = new KeyboardEvent("keydown", {
      key: "ArrowRight",
      bubbles: true,
      cancelable: true,
    });
    const preventDefault = vi.spyOn(event, "preventDefault");
    fireEvent(chart, event);
    expect(ref.current?.tagName).toBe("SECTION");
    expect(event.defaultPrevented).toBe(true);
    expect(preventDefault, "caller cancellation is not repeated by the host").toHaveBeenCalledTimes(
      1,
    );
    expect(observed).toEqual(["child:false", `caller:${cancel}`, "ancestor:true"]);
  },
);

it.each(["ArrowUp", "ArrowDown", "Home", "End", "Enter"])(
  "keeps %s defaults on the accessible chart",
  (key) => {
    const caller = vi.fn();
    render(
      <ChartContainer onKeyDown={caller}>
        <svg role="application" className="recharts-surface" tabIndex={0} aria-label="Other keys" />
      </ChartContainer>,
    );
    const chart = screen.getByRole("application", { name: "Other keys" });
    act(() => chart.focus());
    const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
    fireEvent(chart, event);
    expect(event.defaultPrevented).toBe(false);
    expect(caller).toHaveBeenCalledTimes(1);
  },
);

it("leaves host, input descendants, unfocused SVGs and non-application surfaces to their callers", () => {
  const caller = vi.fn();
  render(
    <ChartContainer tabIndex={0} aria-label="Keyboard host" onKeyDown={caller}>
      <svg role="application" className="recharts-surface" tabIndex={0} aria-label="Unfocused plot">
        <foreignObject>
          <input aria-label="Custom chart input" />
        </foreignObject>
      </svg>
      <svg className="recharts-surface" tabIndex={0} aria-label="Presentation surface" />
      <svg role="application" tabIndex={0} aria-label="Other application" />
    </ChartContainer>,
  );
  const host = screen.getByLabelText("Keyboard host");
  const input = screen.getByRole("textbox", { name: "Custom chart input" });
  const unfocused = screen.getByRole("application", { name: "Unfocused plot" });
  for (const target of [
    host,
    input,
    screen.getByLabelText("Presentation surface"),
    screen.getByRole("application", { name: "Other application" }),
  ]) {
    act(() => target.focus());
    const event = new KeyboardEvent("keydown", {
      key: "ArrowRight",
      bubbles: true,
      cancelable: true,
    });
    fireEvent(target, event);
    expect(
      event.defaultPrevented,
      `${target.getAttribute("aria-label")} owns its arrow default`,
    ).toBe(false);
  }
  act(() => host.focus());
  const event = new KeyboardEvent("keydown", {
    key: "ArrowRight",
    bubbles: true,
    cancelable: true,
  });
  fireEvent(unfocused, event);
  expect(event.defaultPrevented, "only the actual focused SVG owns point arrows").toBe(false);
  expect(caller).toHaveBeenCalledTimes(5);
});

it("respects nearest nested chart ownership while preserving outer caller events", () => {
  const observed: string[] = [];
  render(
    <ChartContainer onKeyDown={(event) => observed.push(`outer:${event.defaultPrevented}`)}>
      <section data-slot="chart-container">
        <svg
          role="application"
          className="recharts-surface"
          tabIndex={0}
          aria-label="Separately owned plot"
        />
      </section>
      <ChartContainer onKeyDown={(event) => observed.push(`inner:${event.defaultPrevented}`)}>
        <svg
          role="application"
          className="recharts-surface"
          tabIndex={0}
          aria-label="Nested plot"
        />
      </ChartContainer>
    </ChartContainer>,
  );
  const separate = screen.getByRole("application", { name: "Separately owned plot" });
  act(() => separate.focus());
  const separateEvent = new KeyboardEvent("keydown", {
    key: "ArrowRight",
    bubbles: true,
    cancelable: true,
  });
  fireEvent(separate, separateEvent);
  expect(separateEvent.defaultPrevented, "outer host does not take a nested owner's default").toBe(
    false,
  );
  expect(observed).toEqual(["outer:false"]);
  const nested = screen.getByRole("application", { name: "Nested plot" });
  act(() => nested.focus());
  const nestedEvent = new KeyboardEvent("keydown", {
    key: "ArrowRight",
    bubbles: true,
    cancelable: true,
  });
  fireEvent(nested, nestedEvent);
  expect(nestedEvent.defaultPrevented).toBe(true);
  expect(observed).toEqual(["outer:false", "inner:false", "outer:true"]);
});

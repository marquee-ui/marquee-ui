import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef, useState } from "react";
import { DirectionProvider } from "@radix-ui/react-direction";
import { afterEach, expect, it, vi } from "vitest";
import { Slider, SliderRange, SliderThumb, SliderTrack } from "../src/slider";

afterEach(cleanup);

function Parts({ range = false }: { range?: boolean }) {
  return (
    <>
      <SliderTrack>
        <SliderRange />
      </SliderTrack>
      <SliderThumb aria-label={range ? "Minimum" : "Volume"} />
      {range && <SliderThumb aria-label="Maximum" />}
    </>
  );
}

it("renders only caller-composed parts and names both range thumbs", () => {
  const { container } = render(
    <Slider defaultValue={[20, 80]}>
      <Parts range />
    </Slider>,
  );
  expect(screen.getAllByRole("slider")).toHaveLength(2);
  expect(screen.getByRole("slider", { name: "Minimum" })).toHaveAttribute("aria-valuenow", "20");
  expect(screen.getByRole("slider", { name: "Maximum" })).toHaveAttribute("aria-valuenow", "80");
  expect(container.querySelector('[data-slot="slider-track"]')).toContainElement(
    container.querySelector('[data-slot="slider-range"]') as HTMLElement,
  );
  cleanup();
  const empty = render(<Slider defaultValue={[20, 80]} />);
  expect(empty.container.querySelectorAll('[data-slot="slider-thumb"]')).toHaveLength(0);
  expect(empty.container.querySelector('[data-slot="slider-track"]')).toBeNull();
});

it("forwards all part refs, asChild hosts, styles and caller handlers", () => {
  const root = createRef<HTMLSpanElement>();
  const track = createRef<HTMLSpanElement>();
  const range = createRef<HTMLSpanElement>();
  const thumb = createRef<HTMLSpanElement>();
  const key = vi.fn((event: React.KeyboardEvent<HTMLSpanElement>) => event.preventDefault());
  render(
    <Slider asChild ref={root} defaultValue={[35]}>
      <section data-testid="root">
        <SliderTrack asChild ref={track}>
          <div data-testid="track">
            <SliderRange asChild ref={range}>
              <i data-testid="range" />
            </SliderRange>
          </div>
        </SliderTrack>
        <SliderThumb
          asChild
          ref={thumb}
          onKeyDown={key}
          aria-label="Volume"
          aria-valuetext="Quiet"
          style={{ touchAction: "none" }}
        >
          <span data-testid="thumb" />
        </SliderThumb>
      </section>
    </Slider>,
  );
  expect(root.current).toBe(screen.getByTestId("root"));
  expect(track.current).toBe(screen.getByTestId("track"));
  expect(range.current).toBe(screen.getByTestId("range"));
  expect(thumb.current).toBe(screen.getByRole("slider", { name: "Volume" }));
  expect(thumb.current).toHaveAttribute("aria-valuetext", "Quiet");
  expect(thumb.current).toHaveStyle({ touchAction: "none" });
  fireEvent.keyDown(thumb.current!, { key: "ArrowRight" });
  expect(key).toHaveBeenCalledOnce();
  expect(thumb.current).toHaveAttribute("aria-valuenow", "35");
});

it("steps by min/max/step, page and shift keys and commits each changed keyboard value", () => {
  const change = vi.fn(),
    commit = vi.fn();
  render(
    <Slider
      min={5}
      max={65}
      step={3}
      defaultValue={[23]}
      onValueChange={change}
      onValueCommit={commit}
    >
      <Parts />
    </Slider>,
  );
  const thumb = screen.getByRole("slider", { name: "Volume" });
  thumb.focus();
  for (const [key, shiftKey, value] of [
    ["ArrowRight", false, "26"],
    ["ArrowUp", false, "29"],
    ["ArrowLeft", false, "26"],
    ["ArrowDown", false, "23"],
    ["PageUp", false, "53"],
    ["PageDown", false, "23"],
    ["ArrowRight", true, "53"],
    ["ArrowLeft", true, "23"],
    ["End", false, "65"],
    ["Home", false, "5"],
  ] as const) {
    fireEvent.keyDown(thumb, { key, shiftKey });
    expect(thumb, `${key} value`).toHaveAttribute("aria-valuenow", value);
    expect(commit).toHaveBeenLastCalledWith([Number(value)]);
    expect(change).toHaveBeenLastCalledWith([Number(value)]);
  }
  fireEvent.keyDown(thumb, { key: "ArrowLeft" });
  expect(thumb).toHaveAttribute("aria-valuemin", "5");
  expect(thumb).toHaveAttribute("aria-valuemax", "65");
  expect(commit).toHaveBeenCalledTimes(10);
});

it("reports controlled single changes and commits while the caller retains the value", () => {
  const change = vi.fn(),
    commit = vi.fn();
  render(
    <Slider value={[40]} onValueChange={change} onValueCommit={commit}>
      <Parts />
    </Slider>,
  );
  const thumb = screen.getByRole("slider", { name: "Volume" });
  thumb.focus();
  fireEvent.keyDown(thumb, { key: "ArrowRight" });
  expect(change).toHaveBeenCalledExactlyOnceWith([41]);
  expect(commit).toHaveBeenCalledExactlyOnceWith([41]);
  expect(thumb).toHaveAttribute("aria-valuenow", "40");
});

it("keeps controlled range thumbs separate and preserves their order when requested", () => {
  function Controlled() {
    const [values, setValues] = useState([20, 40]);
    return (
      <Slider
        value={values}
        onValueChange={setValues}
        step={5}
        minStepsBetweenThumbs={2}
        preserveThumbOrder
      >
        <Parts range />
      </Slider>
    );
  }
  render(<Controlled />);
  const low = screen.getByRole("slider", { name: "Minimum" });
  const high = screen.getByRole("slider", { name: "Maximum" });
  low.focus();
  fireEvent.keyDown(low, { key: "ArrowRight", shiftKey: true });
  expect(low).toHaveAttribute("aria-valuenow", "30");
  expect(high).toHaveAttribute("aria-valuenow", "40");
  high.focus();
  fireEvent.keyDown(high, { key: "ArrowLeft", shiftKey: true });
  expect(high).toHaveAttribute("aria-valuenow", "40");
  fireEvent.keyDown(high, { key: "ArrowRight" });
  expect(high).toHaveAttribute("aria-valuenow", "45");
});

it("rejects a range move that violates minStepsBetweenThumbs without committing", () => {
  const commit = vi.fn();
  render(
    <Slider defaultValue={[20, 40]} step={5} minStepsBetweenThumbs={2} onValueCommit={commit}>
      <Parts range />
    </Slider>,
  );
  const low = screen.getByRole("slider", { name: "Minimum" });
  low.focus();
  fireEvent.keyDown(low, { key: "ArrowRight" });
  fireEvent.keyDown(low, { key: "ArrowRight" });
  fireEvent.keyDown(low, { key: "ArrowRight" });
  expect(low).toHaveAttribute("aria-valuenow", "30");
  expect(screen.getByRole("slider", { name: "Maximum" })).toHaveAttribute("aria-valuenow", "40");
  expect(commit).toHaveBeenCalledTimes(2);
  expect(commit).toHaveBeenLastCalledWith([30, 40]);
});

it.each([
  ["horizontal", "rtl", false, "ArrowRight", 49],
  ["horizontal", "rtl", true, "ArrowRight", 51],
  ["vertical", "ltr", false, "ArrowUp", 51],
  ["vertical", "ltr", true, "ArrowUp", 49],
] as const)(
  "honors %s %s inverted=%s keyboard direction",
  (orientation, dir, inverted, key, value) => {
    render(
      <Slider orientation={orientation} dir={dir} inverted={inverted} defaultValue={[50]}>
        <Parts />
      </Slider>,
    );
    const thumb = screen.getByRole("slider", { name: "Volume" });
    expect(thumb).toHaveAttribute("aria-orientation", orientation);
    thumb.focus();
    fireEvent.keyDown(thumb, { key });
    expect(thumb).toHaveAttribute("aria-valuenow", String(value));
  },
);

it.each([
  ["horizontal", false, "50% 0", "-50% 0"],
  ["horizontal", true, "-50% 0", "50% 0"],
  ["vertical", false, "0 50%", "0 -50%"],
  ["vertical", true, "0 -50%", "0 50%"],
] as const)(
  "aligns %s inverted=%s endpoints with inherited RTL and a nonzero minimum",
  (orientation, inverted, atMin, atMax) => {
    render(
      <DirectionProvider dir="rtl">
        <Slider orientation={orientation} inverted={inverted} min={10} max={90} defaultValue={[50]}>
          <Parts />
        </Slider>
      </DirectionProvider>,
    );
    const thumb = screen.getByRole("slider", { name: "Volume" });
    expect(thumb).toHaveStyle({ translate: orientation === "vertical" ? "0 0%" : "0% 0" });
    thumb.focus();
    fireEvent.keyDown(thumb, { key: "Home" });
    expect(thumb).toHaveAttribute("aria-valuenow", "10");
    expect(thumb).toHaveStyle({ translate: atMin });
    fireEvent.keyDown(thumb, { key: "End" });
    expect(thumb).toHaveAttribute("aria-valuenow", "90");
    expect(thumb).toHaveStyle({ translate: atMax });
  },
);

it("disables pointer and keyboard changes and removes thumbs from the tab order", () => {
  const change = vi.fn(),
    commit = vi.fn();
  render(
    <Slider disabled defaultValue={[40]} onValueChange={change} onValueCommit={commit}>
      <Parts />
    </Slider>,
  );
  const thumb = screen.getByRole("slider", { name: "Volume" });
  expect(thumb).toHaveAttribute("data-disabled");
  expect(thumb).not.toHaveAttribute("tabindex");
  fireEvent.keyDown(thumb, { key: "End" });
  fireEvent.pointerDown(thumb, { button: 0, pointerId: 1, clientX: 90 });
  expect(thumb).toHaveAttribute("aria-valuenow", "40");
  expect(change).not.toHaveBeenCalled();
  expect(commit).not.toHaveBeenCalled();
});

it("serializes single, range and per-thumb names through the primitive's native inputs", () => {
  const { container } = render(
    <form>
      <Slider name="volume" defaultValue={[30]}>
        <Parts />
      </Slider>
      <Slider name="window" defaultValue={[20, 80]}>
        <Parts range />
      </Slider>
      <Slider defaultValue={[10, 90]}>
        <SliderTrack>
          <SliderRange />
        </SliderTrack>
        <SliderThumb name="from" aria-label="From" />
        <SliderThumb name="to" aria-label="To" />
      </Slider>
    </form>,
  );
  const form = container.querySelector("form")!;
  expect([...new FormData(form).entries()]).toEqual([
    ["volume", "30"],
    ["window[]", "20"],
    ["window[]", "80"],
    ["from", "10"],
    ["to", "90"],
  ]);
  const thumb = screen.getByRole("slider", { name: "Volume" });
  thumb.focus();
  fireEvent.keyDown(thumb, { key: "ArrowRight" });
  expect(new FormData(form).get("volume")).toBe("31");
});

it("resets uncontrolled values to their initial value, including an external form association", async () => {
  const change = vi.fn();
  const { container, rerender } = render(
    <>
      <form id="settings" />
      <Slider form="settings" name="volume" defaultValue={[30]} onValueChange={change}>
        <Parts />
      </Slider>
    </>,
  );
  const thumb = screen.getByRole("slider", { name: "Volume" });
  thumb.focus();
  fireEvent.keyDown(thumb, { key: "End" });
  expect(thumb).toHaveAttribute("aria-valuenow", "100");
  rerender(
    <>
      <form id="settings" />
      <Slider form="settings" name="volume" defaultValue={[60]} onValueChange={change}>
        <Parts />
      </Slider>
    </>,
  );
  fireEvent.reset(container.querySelector("form")!);
  await waitFor(() => expect(thumb).toHaveAttribute("aria-valuenow", "30"));
  expect(new FormData(container.querySelector("form")!).get("volume")).toBe("30");
  expect(change).toHaveBeenLastCalledWith([30]);
});

it("asks the controlled owner to reset and cannot override a value it keeps", () => {
  const change = vi.fn();
  const { container, rerender } = render(
    <form>
      <Slider value={[30]} onValueChange={change}>
        <Parts />
      </Slider>
    </form>,
  );
  rerender(
    <form>
      <Slider value={[60]} onValueChange={change}>
        <Parts />
      </Slider>
    </form>,
  );
  fireEvent.reset(container.querySelector("form")!);
  expect(change).toHaveBeenCalledExactlyOnceWith([30]);
  expect(screen.getByRole("slider", { name: "Volume" })).toHaveAttribute("aria-valuenow", "60");
});

it("records the primitive limit: disabled named sliders still serialize their hidden input", () => {
  const { container } = render(
    <form>
      <Slider disabled name="volume" defaultValue={[30]}>
        <Parts />
      </Slider>
    </form>,
  );
  const input = container.querySelector('input[name="volume"]')!;
  expect(input).toHaveStyle({ display: "none" });
  expect(input).not.toBeDisabled();
  expect(new FormData(container.querySelector("form")!).get("volume")).toBe("30");
});

it("excludes disabled Slider form values with a native disabled fieldset", () => {
  const { container } = render(
    <form>
      <fieldset disabled>
        <Slider disabled name="volume" defaultValue={[30]}>
          <Parts />
        </Slider>
      </fieldset>
    </form>,
  );
  expect(container.querySelector('input[name="volume"]')).toBeDisabled();
  expect([...new FormData(container.querySelector("form")!).entries()]).toEqual([]);
});

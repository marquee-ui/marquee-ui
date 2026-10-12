import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState, type ComponentProps } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Slider, SliderRange, SliderThumb, SliderTrack } from "../src/slider";

const captures = new Map<number, HTMLElement>();
beforeEach(() => {
  captures.clear();
  vi.spyOn(HTMLElement.prototype, "setPointerCapture").mockImplementation(function (id) {
    captures.set(id, this);
  });
  vi.spyOn(HTMLElement.prototype, "hasPointerCapture").mockImplementation(function (id) {
    return captures.get(id) === this;
  });
  vi.spyOn(HTMLElement.prototype, "releasePointerCapture").mockImplementation(function (id) {
    if (captures.get(id) === this) captures.delete(id);
  });
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: 100,
    bottom: 44,
    width: 100,
    height: 44,
    toJSON: () => ({}),
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function Fixture({
  controlled,
  ...props
}: ComponentProps<typeof Slider> & { controlled?: boolean }) {
  const [value, setValue] = useState([40]);
  return (
    <Slider
      defaultValue={[40]}
      {...(controlled ? { value, onValueChange: setValue } : {})}
      {...props}
    >
      <SliderTrack data-testid="track">
        <SliderRange />
      </SliderTrack>
      <SliderThumb aria-label="Volume" />
    </Slider>
  );
}
const pointer = { pointerId: 2, pointerType: "touch", clientX: 80, button: 0 };

for (const controlled of [false, true]) {
  it(`commits a retargeted touch release once (${controlled ? "controlled" : "uncontrolled"})`, () => {
    const commit = vi.fn();
    render(<Fixture controlled={controlled} onValueCommit={commit} />);
    const track = screen.getByTestId("track"),
      thumb = screen.getByRole("slider");
    fireEvent.pointerDown(track, pointer);
    expect(thumb).toHaveAttribute("aria-valuenow", "80");
    expect(commit).not.toHaveBeenCalled();
    expect(track.hasPointerCapture(2)).toBe(true);
    // WebKit releases over the moved thumb while the original track retains capture.
    fireEvent.pointerUp(thumb, pointer);
    expect(commit).toHaveBeenCalledExactlyOnceWith([80]);
    expect(track.hasPointerCapture(2)).toBe(false);
    fireEvent.pointerUp(thumb, pointer);
    expect(commit).toHaveBeenCalledTimes(1);
  });
}

it("leaves the normal captured release to Radix without a duplicate commit", () => {
  const commit = vi.fn();
  render(<Fixture onValueCommit={commit} />);
  const track = screen.getByTestId("track");
  fireEvent.pointerDown(track, pointer);
  fireEvent.pointerUp(track, pointer);
  expect(commit).toHaveBeenCalledExactlyOnceWith([80]);
  expect(track.hasPointerCapture(2)).toBe(false);
});

it("respects a caller-canceled release on a composed root", () => {
  const commit = vi.fn(),
    up = vi.fn((event: React.PointerEvent) => event.preventDefault());
  render(
    <Slider asChild defaultValue={[40]} onValueCommit={commit} onPointerUp={up}>
      <section>
        <SliderTrack data-testid="track">
          <SliderRange />
        </SliderTrack>
        <SliderThumb aria-label="Volume" />
      </section>
    </Slider>,
  );
  fireEvent.pointerDown(screen.getByTestId("track"), pointer);
  fireEvent.pointerUp(screen.getByRole("slider"), pointer);
  expect(up).toHaveBeenCalledOnce();
  expect(commit).not.toHaveBeenCalled();
  expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "80");
});

it("does not commit a canceled gesture or a release belonging to another pointer", () => {
  const commit = vi.fn(),
    cancel = vi.fn();
  render(<Fixture onValueCommit={commit} onPointerCancel={cancel} />);
  const track = screen.getByTestId("track"),
    thumb = screen.getByRole("slider");
  fireEvent.pointerDown(track, pointer);
  fireEvent.pointerUp(thumb, { ...pointer, pointerId: 3 });
  expect(commit).not.toHaveBeenCalled();
  fireEvent.pointerCancel(track, pointer);
  fireEvent.pointerUp(thumb, pointer);
  expect(cancel).toHaveBeenCalledOnce();
  expect(commit).not.toHaveBeenCalled();
});

for (const mode of ["unchanged", "rejected", "disabled", "prevented"] as const) {
  it(`does not add a commit when the value is ${mode}`, () => {
    const commit = vi.fn(),
      change = vi.fn();
    render(
      <Fixture
        onValueCommit={commit}
        onValueChange={change}
        {...(mode === "rejected" ? { value: [40] } : {})}
        disabled={mode === "disabled"}
        onPointerDown={mode === "prevented" ? (event) => event.preventDefault() : undefined}
      />,
    );
    fireEvent.pointerDown(screen.getByTestId("track"), {
      ...pointer,
      clientX: mode === "unchanged" ? 40 : 80,
    });
    fireEvent.pointerUp(screen.getByRole("slider"), pointer);
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "40");
    expect(commit).not.toHaveBeenCalled();
    if (mode === "rejected") expect(change).toHaveBeenCalledExactlyOnceWith([80]);
    else expect(change).not.toHaveBeenCalled();
  });
}

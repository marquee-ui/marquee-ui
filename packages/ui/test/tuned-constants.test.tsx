import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Ribbon } from "@/ribbon";
import { Toast, ToastMessage } from "@/toast";

/**
 * The numbers that were TUNED, rather than derived.
 *
 * Each of these is a free variable: nothing about the code says what it should be,
 * the docblocks explain them at length, and every one of them could be changed
 * without a single test noticing. Measured: `CHARS_PER_SECOND` 4.5 -> 45,
 * `MIN_HALF_CHARS` 600 -> 6, the em-space separator -> a plain space, the trailing
 * separator dropped, the whole inline `animationDuration` deleted, and
 * `DEFAULT_DURATION_MS` 6000 -> 60000 all left the suite green.
 *
 * They are asserted through BEHAVIOUR, not by reading the constants back: the pace
 * is measured as seconds-per-character across two different copies, which is the
 * invariant the number exists to hold and which a changed pace constant breaks.
 */

afterEach(cleanup);

const track = () => document.querySelector<HTMLElement>('[data-slot="ribbon-track"]')!;
const halves = () => Array.from(track().querySelectorAll("span")).map((s) => s.textContent ?? "");

/** Seconds per character of one half, for a given set of claims. */
function pace(items: string[]): { seconds: number; chars: number } {
  render(<Ribbon items={items} />);
  const seconds = Number.parseFloat(track().style.animationDuration);
  const chars = halves()[0]!.length;
  cleanup();
  expect(Number.isFinite(seconds), "no inline animation-duration on the track").toBe(true);
  expect(seconds).toBeGreaterThan(0);
  expect(chars).toBeGreaterThan(0);
  return { seconds, chars };
}

describe("the ribbon's pace", () => {
  it("sets the duration inline, per instance, in whole seconds", () => {
    render(<Ribbon items={["Free forever"]} />);
    // NOT the stylesheet's fallback: a fixed duration makes a longer band scroll
    // faster, which is the one thing the whole two-halves recipe exists to avoid.
    expect(track().style.animationDuration).toMatch(/^\d+s$/);
  });

  it("holds one pace whatever the copy is, rather than merely taking longer", () => {
    const short = pace(["Free forever"]);
    const long = pace(["Free forever", "No critics, ever", "Player scores only, ever and ever"]);
    const shortPace = short.seconds / short.chars;
    const longPace = long.seconds / long.chars;
    // The duration is rounded to whole seconds, so over a ~600-character half the
    // pace can differ by up to 0.5/600 = 0.0008 s/char from rounding alone. A
    // tolerance of 0.005 clears that and is ~20x tighter than any real drift:
    // multiplying the pace constant by ten moves this by 0.2.
    expect(longPace).toBeCloseTo(shortPace, 2);
    // …and the pace itself, which is what the tuned constant sets.
    expect(shortPace).toBeCloseTo(1 / 4.5, 2);
  });

  it("repeats the half well past the widest viewport before the reset", () => {
    // A short half runs out of text before the -50% translate and the band shows a
    // gap. 600 characters is the floor the component was tuned to.
    const { chars } = pace(["Free forever"]);
    expect(chars).toBeGreaterThanOrEqual(600);
  });

  it("runs two IDENTICAL halves, which is what makes the loop seamless", () => {
    render(<Ribbon items={["one", "two"]} />);
    const [first, second] = halves();
    expect(first).toBeTruthy();
    expect(second).toBe(first);
  });

  it("ends each token with the separator, so the seam matches the interior", () => {
    render(<Ribbon items={["one", "two"]} separator="|" />);
    // Without the trailing separator the loop closes on "…twoone…" with no gap.
    expect(halves()[0]!).toContain("two|one");
  });

  it("separates with em-spaces, which do not collapse the way ASCII spaces do", () => {
    render(<Ribbon items={["one", "two"]} />);
    expect(halves()[0]!).toContain(" ✦ ");
    expect(halves()[0]!).not.toContain("  ");
  });
});

describe("the toast's dwell", () => {
  it("dismisses itself after six seconds by default, and not before", () => {
    vi.useFakeTimers();
    try {
      const onDismiss = vi.fn();
      render(
        <Toast open onDismiss={onDismiss}>
          <ToastMessage>Removed from your shelf</ToastMessage>
        </Toast>,
      );
      expect(screen.getByRole("status")).toBeInTheDocument();
      vi.advanceTimersByTime(5999);
      expect(onDismiss).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      expect(onDismiss).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("lets the owner shorten it", () => {
    vi.useFakeTimers();
    try {
      const onDismiss = vi.fn();
      render(
        <Toast open duration={150} onDismiss={onDismiss}>
          <ToastMessage>Saved</ToastMessage>
        </Toast>,
      );
      vi.advanceTimersByTime(150);
      expect(onDismiss).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
});

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Input, inputClass } from "@/input";

/**
 * `Input`'s own `className` merge, which nothing observed.
 *
 * DL19's layer 1 (r6, X1) replaced `cn(inputClass, className)` with
 * `cn(inputClass)` in `input.tsx` and the whole suite stayed green: every test
 * that renders an `Input` renders it bare, so a caller's class could be dropped,
 * or could REPLACE the field's string, and no arm would say so. Products pass
 * extras through it (a margin, a width), and `Textarea` is built on the same
 * string, so this is the `Input` twin of `textarea-drawing.test.tsx`'s arm 5.
 */
afterEach(cleanup);

describe("Input: the caller's class", () => {
  it("carries its slot, and appends the caller's class after the field's rather than replacing it", () => {
    render(<Input aria-label="Email" type="email" className="probe-caller" />);
    const field = screen.getByRole("textbox", { name: "Email" });
    expect(field.tagName).toBe("INPUT");
    expect(field.getAttribute("data-slot")).toBe("input");
    const classes = (field.getAttribute("class") ?? "").split(/\s+/);
    expect(classes.at(-1), "the caller's class, last").toBe("probe-caller");
    expect(classes.slice(0, -1), "the field's own string, intact").toEqual(inputClass.split(/\s+/));
    expect(field).toHaveAttribute("type", "email");
  });
});

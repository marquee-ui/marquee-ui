import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeAll, expect, it } from "vitest";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../src/table";
import { loadCompiledSheet, type CompiledSheet } from "./helpers/compiled-sheet.js";

let sheet: CompiledSheet;
beforeAll(async () => {
  sheet = await loadCompiledSheet();
}, 60_000);
afterEach(cleanup);

it("each optionally focusable native host owns compiled focus independently of docs CSS", () => {
  const { container } = render(
    <TableContainer aria-label="Focus table">
      <Table>
        <TableCaption>Focus table</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Footer</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>,
  );
  for (const slot of [
    "table-container",
    "table",
    "table-caption",
    "table-header",
    "table-body",
    "table-footer",
    "table-row",
    "table-head",
    "table-cell",
  ]) {
    const host = container.querySelector(`[data-slot="${slot}"]`)!;
    expect(host, `${slot} exists`).not.toBeNull();
    const focus = host.className.split(/\s+/).filter((token) => token.startsWith("focus-visible:"));
    expect(sheet.declaredValues(focus, "outline-style"), `${slot} paints solid focus`).toContain(
      "solid",
    );
    expect(sheet.declared(focus, "outline-width"), `${slot} focus width`).toBe(2);
    expect(sheet.declaredValues(focus, "outline-color"), `${slot} focus ink`).toEqual([
      "var(--primary-ink)",
    ]);
  }
});

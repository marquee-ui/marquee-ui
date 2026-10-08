import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, expect, it, vi } from "vitest";
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

afterEach(cleanup);

it("renders a native named table without an implicit wrapper, preserving scopes, spans and footer", () => {
  const { container } = render(
    <Table id="ledger">
      <TableCaption>Quarterly invoices</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead id="invoice" scope="col" rowSpan={2}>
            Invoice
          </TableHead>
          <TableHead id="amount" scope="colgroup" colSpan={2}>
            Amount
          </TableHead>
        </TableRow>
        <TableRow>
          <TableHead scope="col">Net</TableHead>
          <TableHead scope="col">Tax</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow data-state="selected">
          <TableHead id="first" scope="row">
            INV-101
          </TableHead>
          <TableCell headers="first amount" colSpan={2}>
            120
          </TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableHead scope="row">Total</TableHead>
          <TableCell colSpan={2}>120</TableCell>
        </TableRow>
      </TableFooter>
    </Table>,
  );
  const table = screen.getByRole("table", { name: "Quarterly invoices" });
  expect(container.firstElementChild).toBe(table);
  expect(table.tagName).toBe("TABLE");
  expect([...table.children].map((child) => child.tagName)).toEqual([
    "CAPTION",
    "THEAD",
    "TBODY",
    "TFOOT",
  ]);
  expect(screen.getByRole("columnheader", { name: "Invoice" })).toHaveAttribute("rowspan", "2");
  expect(screen.getByRole("columnheader", { name: "Amount" })).toHaveAttribute("scope", "colgroup");
  expect(screen.getByRole("rowheader", { name: "INV-101" })).toHaveAttribute("scope", "row");
  expect(table.querySelector("tbody td")).toHaveAttribute("headers", "first amount");
  expect(table.querySelector("tbody td")).toHaveAttribute("colspan", "2");
  expect(table.querySelector("tbody tr")).toHaveAttribute("data-state", "selected");
  expect(table.querySelector("tbody tr")).not.toHaveAttribute("tabindex");
  expect(table.querySelector("tfoot th")).toHaveTextContent("Total");
});

it("empty content is a real caller-owned cell spanning the columns", () => {
  render(
    <Table>
      <TableCaption>Empty invoices</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Invoice</TableHead>
          <TableHead scope="col">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell colSpan={2}>No invoices yet.</TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  );
  const cell = screen.getByRole("cell", { name: "No invoices yet." });
  expect(cell.tagName).toBe("TD");
  expect(cell).toHaveAttribute("colspan", "2");
  expect(cell.parentElement?.tagName).toBe("TR");
  expect(cell.parentElement?.parentElement?.tagName).toBe("TBODY");
});

it("the explicit scroll container keeps a caption-linked name, keyboard entry, native props and ref", () => {
  const ref = createRef<HTMLDivElement>();
  const key = vi.fn();
  render(
    <TableContainer
      ref={ref}
      aria-labelledby="caption"
      onKeyDown={key}
      dir="rtl"
      data-caller="scroll"
    >
      <Table>
        <TableCaption id="caption">Scrollable invoices</TableCaption>
        <TableBody>
          <TableRow>
            <TableCell>120</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>,
  );
  const region = screen.getByRole("region", { name: "Scrollable invoices" });
  expect(ref.current).toBe(region);
  expect(region).toHaveAttribute("tabindex", "0");
  expect(region).toHaveAttribute("dir", "rtl");
  expect(region).toHaveAttribute("data-caller", "scroll");
  fireEvent.keyDown(region, { key: "ArrowRight" });
  expect(key).toHaveBeenCalledTimes(1);
});

it("every semantic part slots the caller's native host, merging refs, classes, attributes and events", () => {
  const names = [
    "table-container",
    "table",
    "table-caption",
    "table-header",
    "table-body",
    "table-footer",
    "table-row",
    "table-head",
    "table-cell",
  ] as const;
  const refs = names.map(() => createRef<HTMLElement>());
  const childRefs = names.map(() => createRef<HTMLElement>());
  const parent = vi.fn(),
    child = vi.fn();
  const props = (index: number) => ({
    ref: (node: HTMLElement | null) => {
      refs[index]!.current = node;
    },
    className: "relative",
    onClick: parent,
    "data-caller": names[index],
  });
  const childProps = (index: number) => ({
    ref: (node: HTMLElement | null) => {
      childRefs[index]!.current = node;
    },
    className: "isolate",
    onClick: child,
  });
  render(
    <TableContainer asChild aria-label="Composed invoices" {...props(0)}>
      <section {...childProps(0)}>
        <Table asChild {...props(1)}>
          <table {...childProps(1)}>
            <TableCaption asChild {...props(2)}>
              <caption {...childProps(2)}>Composed invoices</caption>
            </TableCaption>
            <TableHeader asChild {...props(3)}>
              <thead {...childProps(3)}>
                <TableRow asChild {...props(6)}>
                  <tr {...childProps(6)}>
                    <TableHead asChild scope="col" {...props(7)}>
                      <th {...childProps(7)}>Invoice</th>
                    </TableHead>
                  </tr>
                </TableRow>
              </thead>
            </TableHeader>
            <TableBody asChild {...props(4)}>
              <tbody {...childProps(4)}>
                <tr>
                  <TableCell asChild colSpan={2} {...props(8)}>
                    <td {...childProps(8)}>INV-101</td>
                  </TableCell>
                </tr>
              </tbody>
            </TableBody>
            <TableFooter asChild {...props(5)}>
              <tfoot {...childProps(5)}>
                <tr>
                  <td>Total</td>
                </tr>
              </tfoot>
            </TableFooter>
          </table>
        </Table>
      </section>
    </TableContainer>,
  );
  const tags = ["SECTION", "TABLE", "CAPTION", "THEAD", "TBODY", "TFOOT", "TR", "TH", "TD"];
  names.forEach((name, index) => {
    const host = document.querySelector(`[data-slot="${name}"]`)!;
    expect(host.tagName, name).toBe(tags[index]);
    expect(refs[index]!.current, `${name} parent ref`).toBe(host);
    expect(childRefs[index]!.current, `${name} child ref`).toBe(host);
    expect(host).toHaveClass("relative", "isolate");
    expect(host).toHaveAttribute("data-caller", name);
    parent.mockClear();
    child.mockClear();
    fireEvent.click(host);
    expect(parent, `${name} parent event`).toHaveBeenCalled();
    expect(child, `${name} child event`).toHaveBeenCalled();
  });
  expect(screen.getByRole("region", { name: "Composed invoices" }).children).toHaveLength(1);
  expect(screen.getByRole("columnheader", { name: "Invoice" })).toHaveAttribute("scope", "col");
  expect(screen.getByRole("cell", { name: "INV-101" })).toHaveAttribute("colspan", "2");
});

it("native refs and events reach the table host and row selection stays caller-owned", () => {
  const table = createRef<HTMLTableElement>(),
    row = createRef<HTMLTableRowElement>();
  const click = vi.fn();
  const { rerender } = render(
    <Table ref={table}>
      <TableBody>
        <TableRow ref={row} onClick={click} data-state="selected">
          <TableCell>INV-101</TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  );
  expect(table.current).toBe(screen.getByRole("table"));
  expect(row.current).toBe(screen.getByRole("row"));
  fireEvent.click(screen.getByRole("cell"));
  expect(click).toHaveBeenCalledTimes(1);
  expect(row.current).toHaveAttribute("data-state", "selected");
  rerender(
    <Table ref={table}>
      <TableBody>
        <TableRow ref={row} data-state="unselected">
          <TableCell>INV-101</TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  );
  expect(row.current).toHaveAttribute("data-state", "unselected");
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});

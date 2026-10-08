import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_basic,
  sortFn_text,
  tableFeatures,
  useTable,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { createRef, useState } from "react";
import { afterEach, expect, it, vi } from "vitest";
import {
  DataTable,
  DataTableBody,
  DataTableEmpty,
  DataTableHeader,
  DataTableSortButton,
} from "../src/data-table";
import { TableCaption, TableCell, TableHead, TableRow } from "../src/table";

afterEach(cleanup);

const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: { text: sortFn_text, basic: sortFn_basic },
});
type Entry = { name: string; amount: number };
const helper = createColumnHelper<typeof features, Entry>();
const columns = helper.columns([
  helper.accessor("name", { header: "Name", sortFn: "text", filterFn: "includesString" }),
  helper.accessor("amount", { header: "Amount", sortFn: "basic" }),
]);
const entries = [
  { name: "Cedar", amount: 80 },
  { name: "Aster", amount: 120 },
  { name: "Birch", amount: 40 },
  { name: "Dahlia", amount: 20 },
  { name: "Elm", amount: 100 },
];

function ClientTable({ data = entries, hidden = false }: { data?: Entry[]; hidden?: boolean }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 2 });
  const table = useTable({
    features,
    columns,
    data,
    enableMultiSort: false,
    state: { sorting, columnFilters, pagination, columnVisibility: { amount: !hidden } },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
  });
  return (
    <>
      <label>
        Filter name
        <input
          value={String(table.getColumn("name")?.getFilterValue() ?? "")}
          onChange={(event) => {
            table.getColumn("name")?.setFilterValue(event.target.value);
            table.setPageIndex(0);
          }}
        />
      </label>
      <DataTable>
        <TableCaption>Client entries</TableCaption>
        <DataTableHeader
          table={table}
          renderHeader={(header) => {
            const sorted = header.column.getIsSorted();
            return (
              <TableHead
                key={header.id}
                scope="col"
                colSpan={header.colSpan}
                aria-sort={
                  sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none"
                }
              >
                <DataTableSortButton
                  direction={sorted}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <table.FlexRender header={header} />
                </DataTableSortButton>
              </TableHead>
            );
          }}
        />
        <DataTableBody
          table={table}
          empty={
            <TableRow>
              <DataTableEmpty columnCount={table.getVisibleLeafColumns().length}>
                No matches.
              </DataTableEmpty>
            </TableRow>
          }
          renderRow={(row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) =>
                cell.column.id === "name" ? (
                  <TableHead key={cell.id} scope="row">
                    <table.FlexRender cell={cell} />
                  </TableHead>
                ) : (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ),
              )}
            </TableRow>
          )}
        />
      </DataTable>
      <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
        Previous
      </button>
      <output aria-label="Page">
        {pagination.pageIndex + 1} / {Math.max(1, table.getPageCount())}
      </output>
      <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
        Next
      </button>
    </>
  );
}

const names = () => screen.queryAllByRole("rowheader").map((node) => node.textContent);

it("renders caller-owned controlled text and numeric sorting, announcements, and finite pages", () => {
  render(<ClientTable />);
  expect(names()).toEqual(["Cedar", "Aster"]);
  expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: /^Name/ }));
  expect(names()).toEqual(["Aster", "Birch"]);
  expect(screen.getByRole("columnheader", { name: /^Name/ })).toHaveAttribute(
    "aria-sort",
    "ascending",
  );
  expect(screen.getByRole("button", { name: "Name, Sorted ascending" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /^Name/ }));
  expect(names()).toEqual(["Elm", "Dahlia"]);
  expect(screen.getByRole("columnheader", { name: /^Name/ })).toHaveAttribute(
    "aria-sort",
    "descending",
  );
  fireEvent.click(screen.getByRole("button", { name: /^Amount/ }));
  expect(names()).toEqual(["Aster", "Elm"]);
  expect(screen.getByRole("columnheader", { name: /^Amount/ })).toHaveAttribute(
    "aria-sort",
    "descending",
  );
  expect(screen.getByRole("columnheader", { name: /^Name/ })).toHaveAttribute("aria-sort", "none");
  fireEvent.click(screen.getByRole("button", { name: /^Amount/ }));
  expect(names()).toEqual(["Dahlia", "Birch"]);
  expect(screen.getByRole("columnheader", { name: /^Amount/ })).toHaveAttribute(
    "aria-sort",
    "ascending",
  );
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  expect(names()).toEqual(["Cedar", "Elm"]);
  expect(screen.getByLabelText("Page")).toHaveTextContent("2 / 3");
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  expect(names()).toEqual(["Aster"]);
  expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Previous" }));
  expect(names()).toEqual(["Cedar", "Elm"]);
});

it("filters reactively, resets a later page, renders the caller empty span, and recovers", () => {
  render(<ClientTable />);
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  fireEvent.change(screen.getByLabelText("Filter name"), { target: { value: "elm" } });
  expect(names()).toEqual(["Elm"]);
  expect(screen.getByLabelText("Page")).toHaveTextContent("1 / 1");
  expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Filter name"), { target: { value: "missing" } });
  expect(names()).toEqual([]);
  expect(screen.getByRole("cell", { name: "No matches." })).toHaveAttribute("colspan", "2");
  expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Filter name"), { target: { value: "" } });
  expect(names()).toEqual(["Cedar", "Aster"]);
  expect(screen.queryByText("No matches.")).not.toBeInTheDocument();
});

it("derives the empty span from visible leaf columns and clamps a zero-column cell to one", () => {
  const { rerender } = render(<ClientTable data={[]} hidden />);
  expect(screen.getByRole("cell", { name: "No matches." })).toHaveAttribute("colspan", "1");
  rerender(
    <DataTable>
      <tbody>
        <tr>
          <DataTableEmpty columnCount={0}>No columns.</DataTableEmpty>
        </tr>
      </tbody>
    </DataTable>,
  );
  expect(screen.getByRole("cell", { name: "No columns." })).toHaveAttribute("colspan", "1");
});

it("keeps a native root or caller table host, merging refs, events and arbitrary content", () => {
  const ref = createRef<HTMLTableElement>(),
    childRef = createRef<HTMLTableElement>();
  const parent = vi.fn(),
    child = vi.fn();
  const { container } = render(
    <DataTable asChild ref={ref} onClick={parent} className="relative" data-caller="table">
      <table ref={childRef} onClick={child} className="isolate">
        <caption>Custom ledger</caption>
        <tbody>
          <tr>
            <td>Caller cell</td>
          </tr>
        </tbody>
      </table>
    </DataTable>,
  );
  const table = screen.getByRole("table", { name: "Custom ledger" });
  expect(container.firstElementChild).toBe(table);
  expect(table.tagName).toBe("TABLE");
  expect(ref.current).toBe(table);
  expect(childRef.current).toBe(table);
  expect(table).toHaveClass("relative", "isolate");
  expect(table).toHaveAttribute("data-caller", "table");
  fireEvent.click(screen.getByRole("cell", { name: "Caller cell" }));
  expect(parent).toHaveBeenCalledTimes(1);
  expect(child).toHaveBeenCalledTimes(1);
});

it("preserves grouped and placeholder headers, native host refs/events, and custom row cells", () => {
  const headerRef = createRef<HTMLTableSectionElement>(),
    bodyRef = createRef<HTMLTableSectionElement>();
  const onHeader = vi.fn(),
    onBody = vi.fn(),
    onAction = vi.fn();
  const grouped = helper.columns([
    helper.accessor("name", { header: "Name" }),
    helper.group({
      id: "totals",
      header: "Totals",
      columns: helper.columns([helper.accessor("amount", { header: "Amount" })]),
    }),
  ]);
  function Groups() {
    const table = useTable({ features, columns: grouped, data: entries.slice(0, 1) });
    return (
      <DataTable>
        <TableCaption>Grouped entries</TableCaption>
        <DataTableHeader
          ref={headerRef}
          onClick={onHeader}
          data-caller="header"
          table={table}
          renderHeader={(header) => (
            <TableHead
              key={header.id}
              scope={header.subHeaders.length ? "colgroup" : "col"}
              colSpan={header.colSpan}
            >
              {header.isPlaceholder ? null : <table.FlexRender header={header} />}
            </TableHead>
          )}
        />
        <DataTableBody
          ref={bodyRef}
          onClick={onBody}
          data-caller="body"
          table={table}
          empty={null}
          renderRow={(row) => (
            <TableRow key={row.id} data-caller={row.original.name}>
              <TableHead scope="row">{row.original.name}</TableHead>
              <TableCell>
                <button onClick={onAction}>Open {row.original.name}</button>
              </TableCell>
            </TableRow>
          )}
        />
      </DataTable>
    );
  }
  render(<Groups />);
  const table = screen.getByRole("table", { name: "Grouped entries" });
  expect(headerRef.current).toBe(table.querySelector("thead"));
  expect(bodyRef.current).toBe(table.querySelector("tbody"));
  expect(headerRef.current).toHaveAttribute("data-caller", "header");
  expect(bodyRef.current).toHaveAttribute("data-caller", "body");
  expect(table.querySelectorAll("thead tr")).toHaveLength(2);
  expect(table.querySelectorAll("thead th")).toHaveLength(4);
  expect(screen.getByRole("columnheader", { name: "Totals" })).toHaveAttribute("scope", "colgroup");
  expect(within(table).getByRole("rowheader", { name: "Cedar" })).toHaveAttribute("scope", "row");
  fireEvent.click(screen.getByRole("columnheader", { name: "Amount" }));
  expect(onHeader).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button", { name: "Open Cedar" }));
  expect(onAction).toHaveBeenCalledTimes(1);
  expect(onBody).toHaveBeenCalledTimes(1);
});

it("sort controls preserve caller props/ref and slot child while announcing each direction", () => {
  const ref = createRef<HTMLButtonElement>(),
    click = vi.fn();
  const { rerender } = render(
    <DataTableSortButton ref={ref} direction={false} onClick={click} data-caller="sort">
      Amount
    </DataTableSortButton>,
  );
  const button = screen.getByRole("button", { name: "Amount, Not sorted" });
  expect(ref.current).toBe(button);
  expect(button).toHaveAttribute("type", "button");
  expect(button).toHaveAttribute("data-caller", "sort");
  fireEvent.click(button);
  expect(click).toHaveBeenCalledTimes(1);
  rerender(
    <DataTableSortButton direction="desc" disabled>
      Amount
    </DataTableSortButton>,
  );
  expect(screen.getByRole("button", { name: "Amount, Sorted descending" })).toBeDisabled();
  rerender(
    <DataTableSortButton direction="asc" asChild>
      <button aria-label="Custom ascending">Custom sort</button>
    </DataTableSortButton>,
  );
  expect(screen.getByRole("button", { name: "Custom ascending" })).toHaveAttribute(
    "data-slot",
    "data-table-sort-button",
  );
});

import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
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
import { useId, useMemo, useState } from "react";
import { Button } from "@/button";
import {
  DataTable,
  DataTableBody,
  DataTableEmpty,
  DataTableHeader,
  DataTableSortButton,
} from "@/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "@/dropdown-menu";
import { Input } from "@/input";
import { Label } from "@/label";
import { TableCaption, TableCell, TableContainer, TableHead, TableRow } from "@/table";

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
type Entry = { name: string; description: string; amount: number };
const helper = createColumnHelper<typeof features, Entry>();
const entries: Entry[] = [
  { name: "Cedar", description: "Monthly service", amount: 80 },
  { name: "Aster", description: "Additional seats", amount: 120 },
  { name: "Birch", description: "Annual support", amount: 40 },
  { name: "Dahlia", description: "Storage plan", amount: 20 },
  { name: "Elm", description: "Team subscription", amount: 100 },
];

function ClientEntries({ data = entries }: { data?: Entry[] }) {
  const caption = useId(),
    filterId = useId();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 2 });
  const [opened, setOpened] = useState("none");
  const columns = useMemo(
    () =>
      helper.columns([
        helper.accessor("name", { header: "Name", sortFn: "text", filterFn: "includesString" }),
        helper.accessor("description", { header: "Description", enableSorting: false }),
        helper.accessor("amount", { header: "Amount", sortFn: "basic" }),
        helper.display({
          id: "actions",
          header: "Action",
          cell: ({ row }) => (
            <DropdownMenu>
              {/* Reveal the entire cell action and its focus outline after native focus scrolling. */}
              <DropdownMenuTrigger
                className="scroll-mx-3"
                asChild
                onFocus={(event) =>
                  event.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest" })
                }
              >
                <Button
                  variant="secondary"
                  width="auto"
                  aria-label={`Actions for ${row.original.name}`}
                >
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuPortal>
                <DropdownMenuContent aria-label={`Actions for ${row.original.name}`} sideOffset={4}>
                  <DropdownMenuItem onSelect={() => setOpened(row.original.name)}>
                    Open {row.original.name}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenuPortal>
            </DropdownMenu>
          ),
        }),
      ]),
    [],
  );
  // The caller owns both state and feature registration. The default useTable
  // selector subscribes to all registered state so each control updates its rows.
  const table = useTable({
    features,
    columns,
    data,
    enableMultiSort: false,
    state: { sorting, columnFilters, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
  });
  const count = table.getFilteredRowModel().rows.length;
  return (
    <div className="w-full min-w-0 space-y-4">
      <div className="max-w-80 space-y-2">
        <Label htmlFor={filterId}>Filter name</Label>
        <Input
          id={filterId}
          value={String(table.getColumn("name")?.getFilterValue() ?? "")}
          onChange={(event) => {
            table.getColumn("name")?.setFilterValue(event.target.value);
            table.setPageIndex(0);
          }}
          placeholder="Search entries"
        />
      </div>
      <TableContainer aria-labelledby={caption}>
        <DataTable className="min-w-160">
          <TableCaption id={caption}>Client entries</TableCaption>
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
                    header.column.getCanSort()
                      ? sorted === "asc"
                        ? "ascending"
                        : sorted === "desc"
                          ? "descending"
                          : "none"
                      : undefined
                  }
                >
                  {header.isPlaceholder ? null : header.column.getCanSort() ? (
                    <DataTableSortButton
                      direction={sorted}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <table.FlexRender header={header} />
                    </DataTableSortButton>
                  ) : (
                    <table.FlexRender header={header} />
                  )}
                </TableHead>
              );
            }}
          />
          <DataTableBody
            table={table}
            empty={
              <TableRow>
                <DataTableEmpty columnCount={table.getVisibleLeafColumns().length}>
                  No matching entries.
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
      </TableContainer>
      <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Entry pages">
        <Button
          variant="secondary"
          width="auto"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <output aria-label="Entry page" aria-live="polite">
          Page {pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}. {count} results.
        </output>
        <Button
          variant="secondary"
          width="auto"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
      <output aria-label="Opened entry" aria-live="polite">
        Opened entry: {opened}
      </output>
    </div>
  );
}

const meta = { title: "Parts/DataTable", component: DataTable } satisfies Meta<typeof DataTable>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <ClientEntries />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      user = userEvent.setup();
    const names = () => canvas.getAllByRole("rowheader").map((node) => node.textContent);
    await expect(names()).toEqual(["Cedar", "Aster"]);
    await user.click(canvas.getByRole("button", { name: /^Name/ }));
    await expect(names()).toEqual(["Aster", "Birch"]);
    await expect(canvas.getByRole("columnheader", { name: /^Name/ })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
    await user.click(canvas.getByRole("button", { name: "Next" }));
    await expect(names()).toEqual(["Cedar", "Dahlia"]);
    await expect(canvas.getByLabelText("Entry page")).toHaveTextContent("Page 2 of 3. 5 results.");
    await user.type(canvas.getByLabelText("Filter name"), "elm");
    await expect(names()).toEqual(["Elm"]);
    await expect(canvas.getByLabelText("Entry page")).toHaveTextContent("Page 1 of 1. 1 results.");
    await user.click(canvas.getByRole("button", { name: "Actions for Elm" }));
    await user.click(
      within(canvasElement.ownerDocument.body).getByRole("menuitem", { name: "Open Elm" }),
    );
    await expect(canvas.getByLabelText("Opened entry")).toHaveTextContent("Opened entry: Elm");
    await user.clear(canvas.getByLabelText("Filter name"));
    await user.type(canvas.getByLabelText("Filter name"), "missing");
    await expect(canvas.getByRole("cell", { name: "No matching entries." })).toHaveAttribute(
      "colspan",
      "4",
    );
    await expect(canvas.getByRole("button", { name: "Next" })).toBeDisabled();
    await user.clear(canvas.getByLabelText("Filter name"));
    await expect(names()).toEqual(["Aster", "Birch"]);
  },
};

export const Empty: Story = {
  render: () => <ClientEntries data={[]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("table", { name: "Client entries" }).tagName).toBe("TABLE");
    const cell = canvas.getByRole("cell", { name: "No matching entries." });
    await expect(cell).toHaveAttribute("colspan", "4");
    await expect(cell.closest("tbody")).not.toBeNull();
    await expect(canvas.getByRole("button", { name: "Previous" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Next" })).toBeDisabled();
    await expect(canvas.getByLabelText("Entry page")).toHaveTextContent("Page 1 of 1. 0 results.");
  },
};

function GroupedEntries() {
  const columns = useMemo(
    () =>
      helper.columns([
        helper.accessor("name", { header: "Name" }),
        helper.group({
          id: "details",
          header: "Details",
          columns: helper.columns([
            helper.accessor("description", { header: "Description" }),
            helper.accessor("amount", { header: "Amount" }),
          ]),
        }),
      ]),
    [],
  );
  const table = useTable({ features, columns, data: entries.slice(0, 1) });
  return (
    <DataTable>
      <TableCaption>Grouped entries</TableCaption>
      <DataTableHeader
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
        table={table}
        empty={null}
        renderRow={(row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                <table.FlexRender cell={cell} />
              </TableCell>
            ))}
          </TableRow>
        )}
      />
    </DataTable>
  );
}

export const HeaderGroups: Story = {
  render: () => <GroupedEntries />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("columnheader", { name: "Details" })).toHaveAttribute(
      "scope",
      "colgroup",
    );
    await expect(canvas.getByRole("columnheader", { name: "Details" })).toHaveAttribute(
      "colspan",
      "2",
    );
    await expect(canvas.getByRole("cell", { name: "Cedar" })).toBeInTheDocument();
    await expect(canvas.getByRole("cell", { name: "80" })).toBeInTheDocument();
  },
};

function ComposedTable() {
  const [direction, setDirection] = useState<false | "asc" | "desc">(false);
  return (
    <DataTable asChild>
      <table data-custom-table>
        <caption>Composed entries</caption>
        <thead>
          <tr>
            <TableHead scope="col" aria-sort={direction === "asc" ? "ascending" : "none"}>
              <DataTableSortButton
                asChild
                direction={direction}
                onClick={() => setDirection("asc")}
              >
                <button>Caller sort</button>
              </DataTableSortButton>
            </TableHead>
          </tr>
        </thead>
        <tbody>
          <tr>
            <DataTableEmpty asChild columnCount={0}>
              <td data-custom-empty>No columns yet.</td>
            </DataTableEmpty>
          </tr>
        </tbody>
      </table>
    </DataTable>
  );
}

export const Composed: Story = {
  render: () => <ComposedTable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("table", { name: "Composed entries" })).toHaveAttribute(
      "data-custom-table",
    );
    await expect(canvas.getByRole("cell", { name: "No columns yet." })).toHaveAttribute(
      "data-custom-empty",
    );
    await expect(canvas.getByRole("cell", { name: "No columns yet." })).toHaveAttribute(
      "colspan",
      "1",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Caller sort" }));
    await expect(canvas.getByRole("columnheader", { name: "Caller sort" })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
    await expect(canvas.getByRole("button", { name: "Caller sort" })).toHaveAttribute(
      "aria-description",
      "Sorted ascending",
    );
  },
};

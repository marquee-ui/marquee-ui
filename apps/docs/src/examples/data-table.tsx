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
import { Button } from "@/components/ui/button";
import {
  DataTable,
  DataTableBody,
  DataTableEmpty,
  DataTableHeader,
  DataTableSortButton,
} from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TableCaption,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@/components/ui/table";

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

export default function DataTableExample() {
  const data = entries;
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
      <p className="text-sm text-foreground-2">
        Sort a column, filter by name, or move through the pages. Focus the named table region and
        use arrow keys to scroll to the cell actions.
      </p>
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

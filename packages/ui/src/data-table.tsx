import type {
  Header,
  Row,
  RowData,
  Table as TableInstance,
  TableFeatures,
} from "@tanstack/react-table";
import { Fragment, type ComponentProps, type ReactNode } from "react";
import { Button, type ButtonProps } from "./button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "./table";
import { cn } from "@/lib/utils";

/**
 * Presentation over a caller-created TanStack v9 instance. Compose a caption,
 * explicit TableContainer, headers, rows and controls; no toolbar or state is
 * created here. Keep useTable's reactive selector (or a table.Subscribe around
 * these parts) so changes to the caller's instance re-render its presentation.
 */
export function DataTable(props: ComponentProps<typeof Table>) {
  return <Table data-slot="data-table" {...props} />;
}

export type DataTableHeaderProps<TFeatures extends TableFeatures, TData extends RowData> = Omit<
  ComponentProps<typeof TableHeader>,
  "children" | "asChild"
> & {
  table: TableInstance<TFeatures, TData>;
  /** Return a native th; preserve header.colSpan and placeholders for grouped headers. */
  renderHeader: (header: Header<TFeatures, TData>) => ReactNode;
};

/** Caller header slots own scope, content, sorting buttons and aria-sort. */
export function DataTableHeader<TFeatures extends TableFeatures, TData extends RowData>({
  table,
  renderHeader,
  ...props
}: DataTableHeaderProps<TFeatures, TData>) {
  return (
    <TableHeader data-slot="data-table-header" {...props}>
      {table.getHeaderGroups().map((group) => (
        <TableRow key={group.id}>
          {group.headers.map((header) => (
            <Fragment key={header.id}>{renderHeader(header)}</Fragment>
          ))}
        </TableRow>
      ))}
    </TableHeader>
  );
}

export type DataTableBodyProps<TFeatures extends TableFeatures, TData extends RowData> = Omit<
  ComponentProps<typeof TableBody>,
  "children" | "asChild"
> & {
  table: TableInstance<TFeatures, TData>;
  /** Return a native tr with caller-owned cells, refs, events and cell actions. */
  renderRow: (row: Row<TFeatures, TData>) => ReactNode;
  /** Explicit native row/cell composition, shown when the current row model is empty. */
  empty: ReactNode;
};

export function DataTableBody<TFeatures extends TableFeatures, TData extends RowData>({
  table,
  renderRow,
  empty,
  ...props
}: DataTableBodyProps<TFeatures, TData>) {
  const rows = table.getRowModel().rows;
  return (
    <TableBody data-slot="data-table-body" {...props}>
      {rows.length ? rows.map((row) => <Fragment key={row.id}>{renderRow(row)}</Fragment>) : empty}
    </TableBody>
  );
}

/** Pass the visible leaf-column count, and place this native cell in an explicit row. */
export function DataTableEmpty({
  columnCount,
  className,
  ...props
}: Omit<ComponentProps<typeof TableCell>, "colSpan"> & { columnCount: number }) {
  return (
    <TableCell
      data-slot="data-table-empty"
      className={cn("py-8 text-center text-foreground-2", className)}
      {...props}
      colSpan={Math.max(1, columnCount)}
    />
  );
}

export type DataTableSortButtonProps = ButtonProps & { direction: false | "asc" | "desc" };

/** Explicit controlled sort action. Its enclosing native th owns aria-sort. */
export function DataTableSortButton({
  direction,
  children,
  className,
  asChild = false,
  variant = "ghost",
  width = "auto",
  ...props
}: DataTableSortButtonProps) {
  const announcement =
    direction === "asc"
      ? "Sorted ascending"
      : direction === "desc"
        ? "Sorted descending"
        : "Not sorted";
  const shared = {
    "data-slot": "data-table-sort-button",
    "data-sort": direction || "none",
    className: cn(
      "min-w-hit gap-2 focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-ink",
      className,
    ),
    variant,
    width,
  };
  if (asChild)
    return (
      <Button asChild aria-description={announcement} {...shared} {...props}>
        {children}
      </Button>
    );
  return (
    <Button {...shared} {...props}>
      {children}
      <span aria-hidden="true">{direction === "asc" ? "↑" : direction === "desc" ? "↓" : "↕"}</span>
      <span className="sr-only">{`, ${announcement}`}</span>
    </Button>
  );
}

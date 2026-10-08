import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/table";

export default function TableExample() {
  const caption = useId();
  const [selected, setSelected] = useState(true);
  const [opened, setOpened] = useState("none");
  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <p className="text-sm text-foreground-2">
        Focus the named region and use the arrow keys to scroll. Actions stay inside real cells.
      </p>
      <TableContainer aria-labelledby={caption}>
        <Table className="min-w-160">
          <TableCaption id={caption}>Recent invoices</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Invoice</TableHead>
              <TableHead scope="col">Description</TableHead>
              <TableHead scope="col">Amount</TableHead>
              <TableHead scope="col">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow data-state={selected ? "selected" : undefined}>
              <TableHead scope="row">INV-101</TableHead>
              <TableCell>Monthly subscription</TableCell>
              <TableCell>120.00</TableCell>
              <TableCell>
                <Button
                  variant="secondary"
                  width="auto"
                  aria-pressed={selected}
                  onClick={() => setSelected(!selected)}
                >
                  Select INV-101
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableHead scope="row">INV-102</TableHead>
              <TableCell>Additional seats</TableCell>
              <TableCell>80.00</TableCell>
              <TableCell>
                <Button variant="secondary" width="auto" onClick={() => setOpened("INV-102")}>
                  Open INV-102
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableHead scope="row" colSpan={2}>
                Total
              </TableHead>
              <TableCell colSpan={2}>200.00</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
      <output aria-label="Opened invoice" aria-live="polite">
        Opened invoice: {opened}
      </output>
      <Table>
        <TableCaption>Pending invoices</TableCaption>
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
      </Table>
    </div>
  );
}

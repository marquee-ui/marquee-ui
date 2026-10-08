import type { Meta, StoryObj } from "@storybook/react-vite";
import { useId, useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Button } from "@/button";
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
} from "@/table";

const meta = { title: "Parts/Table", component: Table } satisfies Meta<typeof Table>;
export default meta;
type Story = StoryObj<typeof meta>;

function Invoices() {
  const caption = useId();
  const [selected, setSelected] = useState(true);
  const [action, setAction] = useState("none");
  return (
    <div className="w-full min-w-0 space-y-4">
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
                <Button variant="secondary" width="auto" onClick={() => setAction("INV-102")}>
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
      <output aria-label="Last invoice action">{action}</output>
    </div>
  );
}

export const Default: Story = {
  render: () => <Invoices />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      user = userEvent.setup();
    const table = canvas.getByRole("table", { name: "Recent invoices" });
    await expect(table.tagName).toBe("TABLE");
    await expect(canvas.getByRole("region", { name: "Recent invoices" })).toHaveAttribute(
      "tabindex",
      "0",
    );
    await user.click(canvas.getByRole("button", { name: "Open INV-102" }));
    await expect(canvas.getByLabelText("Last invoice action")).toHaveTextContent("INV-102");
    const selection = canvas.getByRole("button", { name: "Select INV-101" });
    await user.click(selection);
    await expect(selection).toHaveAttribute("aria-pressed", "false");
    await expect(selection.closest("tr")).not.toHaveAttribute("data-state");
    await user.click(selection);
    await expect(selection.closest("tr")).toHaveAttribute("data-state", "selected");
  },
};

export const Empty: Story = {
  render: () => (
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
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("table", { name: "Pending invoices" })).toBeInTheDocument();
    const cell = canvas.getByRole("cell", { name: "No invoices yet." });
    await expect(cell).toHaveAttribute("colspan", "2");
    await expect(cell.parentElement?.parentElement?.tagName).toBe("TBODY");
  },
};

export const HeaderGroups: Story = {
  render: () => (
    <Table>
      <TableCaption>Quarterly totals</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead id="quarter" scope="col" rowSpan={2}>
            Quarter
          </TableHead>
          <TableHead id="revenue" scope="colgroup" colSpan={2}>
            Revenue
          </TableHead>
        </TableRow>
        <TableRow>
          <TableHead scope="col">Net</TableHead>
          <TableHead scope="col">Tax</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableHead id="q1" scope="row">
            Q1
          </TableHead>
          <TableCell headers="q1 revenue">120</TableCell>
          <TableCell headers="q1 revenue">24</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableHead scope="row">Total</TableHead>
          <TableCell colSpan={2}>144</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("columnheader", { name: "Quarter" })).toHaveAttribute(
      "rowspan",
      "2",
    );
    await expect(canvas.getByRole("columnheader", { name: "Revenue" })).toHaveAttribute(
      "scope",
      "colgroup",
    );
    await expect(canvas.getByRole("columnheader", { name: "Revenue" })).toHaveAttribute(
      "colspan",
      "2",
    );
    await expect(canvas.getByRole("rowheader", { name: "Q1" })).toHaveAttribute("scope", "row");
    await expect(canvas.getByRole("cell", { name: "120" })).toHaveAttribute(
      "headers",
      "q1 revenue",
    );
    await expect(canvas.getByRole("cell", { name: "144" }).closest("tfoot")).not.toBeNull();
  },
};

function SlottedTable() {
  const [clicked, setClicked] = useState(false);
  return (
    <div className="w-full space-y-4">
      <TableContainer asChild aria-label="Composed invoices">
        <section data-custom-container>
          <Table asChild>
            <table data-custom-table>
              <TableCaption asChild>
                <caption>Composed invoices</caption>
              </TableCaption>
              <TableHeader asChild>
                <thead>
                  <TableRow asChild>
                    <tr>
                      <TableHead asChild scope="col">
                        <th>Invoice</th>
                      </TableHead>
                    </tr>
                  </TableRow>
                </thead>
              </TableHeader>
              <TableBody asChild>
                <tbody>
                  <TableRow asChild>
                    <tr>
                      <TableCell asChild>
                        <td>
                          <Button width="auto" variant="secondary" onClick={() => setClicked(true)}>
                            Open composed invoice
                          </Button>
                        </td>
                      </TableCell>
                    </tr>
                  </TableRow>
                </tbody>
              </TableBody>
              <TableFooter asChild>
                <tfoot>
                  <TableRow>
                    <TableCell>One invoice</TableCell>
                  </TableRow>
                </tfoot>
              </TableFooter>
            </table>
          </Table>
        </section>
      </TableContainer>
      <output aria-label="Composed action">{clicked ? "opened" : "closed"}</output>
    </div>
  );
}

export const Composed: Story = {
  render: () => <SlottedTable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("region", { name: "Composed invoices" }).tagName).toBe("SECTION");
    await expect(canvas.getByRole("table", { name: "Composed invoices" })).toHaveAttribute(
      "data-custom-table",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Open composed invoice" }));
    await expect(canvas.getByLabelText("Composed action")).toHaveTextContent("opened");
  },
};

/** Diagnostic composition: callers can opt native hosts into focus without docs CSS. */
export const FocusableParts: Story = {
  render: () => (
    <TableContainer aria-label="Focusable table parts">
      <Table tabIndex={0}>
        <TableCaption tabIndex={0}>Focusable table parts</TableCaption>
        <TableHeader tabIndex={0}>
          <TableRow tabIndex={0}>
            <TableHead scope="col" tabIndex={0}>
              Header
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody tabIndex={0}>
          <tr>
            <TableCell tabIndex={0}>Cell</TableCell>
          </tr>
        </TableBody>
        <TableFooter tabIndex={0}>
          <tr>
            <td className="p-3">Footer</td>
          </tr>
        </TableFooter>
      </Table>
    </TableContainer>
  ),
  play: async ({ canvasElement }) => {
    for (const name of [
      "table-container",
      "table",
      "table-caption",
      "table-header",
      "table-row",
      "table-head",
      "table-body",
      "table-cell",
      "table-footer",
    ]) {
      const host = canvasElement.querySelector<HTMLElement>(`[data-slot="${name}"]`)!;
      await expect(host, `${name} is a connected focus host`).toBeInTheDocument();
      host.focus();
      await expect(host).toHaveFocus();
    }
  },
};

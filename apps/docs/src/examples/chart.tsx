import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartLegendItem,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const data = [
  { month: "Jan", north: 18, south: 12 },
  { month: "Feb", north: 24, south: 20 },
  { month: "Mar", north: 28, south: 16 },
  { month: "Apr", north: 32, south: 24 },
];

function MonthlyPlot({ kind }: { kind: "bars" | "lines" }) {
  const parts = (
    <>
      <CartesianGrid vertical={false} stroke="var(--border)" />
      <XAxis
        dataKey="month"
        tickLine={false}
        axisLine={false}
        tick={{ fill: "var(--foreground-2)" }}
      />
      <YAxis width={32} tickLine={false} axisLine={false} tick={{ fill: "var(--foreground-2)" }} />
      <ChartTooltip
        isAnimationActive={false}
        cursor={false}
        content={({ active, label }) => {
          const point = data.find((row) => row.month === label);
          return active && point ? (
            <ChartTooltipContent>
              {point.month}. North {point.north}. South {point.south}.
            </ChartTooltipContent>
          ) : null;
        }}
      />
      <ChartLegend
        content={
          <ChartLegendContent aria-label="Volume series">
            <ChartLegendItem>
              <span
                aria-hidden="true"
                className="h-3 w-3 border-2 border-foreground bg-categorical-1"
              />
              North (solid)
            </ChartLegendItem>
            <ChartLegendItem>
              <span
                aria-hidden="true"
                className="h-3 w-3 border-2 border-dashed border-foreground bg-categorical-2"
              />
              South (dashed)
            </ChartLegendItem>
          </ChartLegendContent>
        }
      />
    </>
  );
  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height="100%">
        {kind === "bars" ? (
          <BarChart
            data={data}
            accessibilityLayer
            aria-label="Monthly volume bars"
            margin={{ top: 12, right: 12, bottom: 8, left: 0 }}
          >
            {parts}
            <Bar
              dataKey="north"
              name="North"
              fill="var(--categorical-1)"
              stroke="var(--foreground)"
              strokeWidth={2}
              isAnimationActive={false}
            />
            <Bar
              dataKey="south"
              name="South"
              fill="var(--categorical-2)"
              stroke="var(--foreground)"
              strokeWidth={2}
              strokeDasharray="4 3"
              isAnimationActive={false}
            />
          </BarChart>
        ) : (
          <LineChart
            data={data}
            accessibilityLayer
            aria-label="Monthly volume lines"
            margin={{ top: 12, right: 16, bottom: 8, left: 0 }}
          >
            {parts}
            <Line
              dataKey="north"
              name="North"
              stroke="var(--categorical-1)"
              strokeWidth={3}
              isAnimationActive={false}
            />
            <Line
              dataKey="south"
              name="South"
              stroke="var(--categorical-2)"
              strokeWidth={3}
              strokeDasharray="4 3"
              isAnimationActive={false}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export default function ChartExample() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <p className="text-sm text-foreground-2">
        Focus either chart, then use Left and Right arrows to read each month. Named solid and
        dashed series also have a native data table below.
      </p>
      <h3 className="font-semibold">Monthly volume · bars</h3>
      <MonthlyPlot kind="bars" />
      <h3 className="font-semibold">Monthly volume · lines</h3>
      <MonthlyPlot kind="lines" />
      <Table>
        <TableCaption>Monthly volume data</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Month</TableHead>
            <TableHead scope="col">North</TableHead>
            <TableHead scope="col">South</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.month}>
              <TableHead scope="row">{row.month}</TableHead>
              <TableCell>{row.north}</TableCell>
              <TableCell>{row.south}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="text-sm text-muted">
        Caller-owned Recharts primitives, data, axes and state. Keep a measured height or aspect on
        the container. The two categorical token roles repeat beyond two series; always supply
        distinct labels and marks. Additional chart types, brush, zoom and export remain outside
        this recipe.
      </p>
    </div>
  );
}

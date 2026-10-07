import { Ribbon } from "@/components/ui/ribbon";
export default function RibbonExample() {
  return (
    <div className="relative h-48 w-full overflow-x-clip">
      <p>Good parts. Your arrangement.</p>
      <Ribbon items={["GOOD PARTS", "YOUR ARRANGEMENT"]} />
    </div>
  );
}

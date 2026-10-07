import { Separator } from "@/components/ui/separator";
export default function SeparatorExample() {
  return (
    <div className="flex w-full flex-col gap-4">
      <p>One section.</p>
      <Separator />
      <p>A fresh thought.</p>
    </div>
  );
}

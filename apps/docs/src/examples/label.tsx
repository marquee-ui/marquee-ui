import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
export default function LabelExample() {
  return (
    <div className="flex w-full flex-col gap-2">
      <Label htmlFor="preview-title">Title</Label>
      <Input id="preview-title" defaultValue="A fresh start" autoComplete="off" />
    </div>
  );
}

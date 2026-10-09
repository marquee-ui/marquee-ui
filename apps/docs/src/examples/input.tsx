import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export default function InputExample() {
  return (
    <div className="flex w-full flex-col gap-2">
      <Label htmlFor="preview-project">Project name</Label>
      <Input id="preview-project" placeholder="Something worth making" autoComplete="off" />
    </div>
  );
}

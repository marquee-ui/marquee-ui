import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
export default function TextareaExample() {
  return (
    <div className="flex w-full flex-col gap-2">
      <Label htmlFor="preview-notes">Project notes</Label>
      <Textarea id="preview-notes" rows={3} placeholder="Leave a note for your future self." />
    </div>
  );
}

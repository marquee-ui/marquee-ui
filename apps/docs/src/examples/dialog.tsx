import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectPortal,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from "@/components/ui/select";

export default function DialogExample() {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState("Nothing saved yet.");
  return (
    <div className="flex flex-col items-start gap-3">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>Edit project</DialogTrigger>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit project</DialogTitle>
              <DialogDescription>Save a name and priority for this project.</DialogDescription>
            </DialogHeader>
            <form
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                setSaved(`Saved ${data.get("projectName")} with ${data.get("priority")} priority.`);
                setOpen(false);
              }}
            >
              <div className="flex flex-col gap-1">
                <Label htmlFor="dialog-project-name">Project name</Label>
                <Input id="dialog-project-name" name="projectName" defaultValue="Studio" required />
              </div>
              <Select name="priority" defaultValue="normal">
                <SelectTrigger aria-label="Project priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectPortal>
                  <SelectContent position="popper">
                    <SelectViewport>
                      <SelectItem value="normal">
                        <SelectItemText>Normal</SelectItemText>
                      </SelectItem>
                      <SelectItem value="urgent">
                        <SelectItemText>Urgent</SelectItemText>
                      </SelectItem>
                    </SelectViewport>
                  </SelectContent>
                </SelectPortal>
              </Select>
              <DialogFooter>
                <DialogClose>Cancel editing</DialogClose>
                <Button type="submit" width="auto">
                  Save project
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </DialogPortal>
      </Dialog>
      <p role="status" className="text-sm text-foreground-2">
        {saved}
      </p>
      <p className="text-sm text-muted">
        Unreleased candidate. Compose Portal, Overlay and Close explicitly. Content scrolls as one
        panel; Header and Footer are optional layout slots. Radix owns modal focus and dismissal;
        use modal=false for a nonmodal dialog. Your app owns saving and validation.
      </p>
    </div>
  );
}

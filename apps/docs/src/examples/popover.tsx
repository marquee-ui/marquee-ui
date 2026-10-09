import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverPortal,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
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

export default function PopoverExample() {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState("Nothing saved yet.");
  return (
    <div data-popover-demo className="flex flex-col items-start gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>Edit details</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent
            aria-labelledby={`${id}-title`}
            aria-describedby={`${id}-description`}
            sideOffset={8}
            align="start"
            collisionPadding={16}
          >
            <PopoverHeader>
              <PopoverTitle id={`${id}-title`}>Edit details</PopoverTitle>
              <PopoverDescription id={`${id}-description`}>
                Save a name and priority for this project.
              </PopoverDescription>
            </PopoverHeader>
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
                <Label htmlFor={`${id}-name`}>Project name</Label>
                <Input id={`${id}-name`} name="projectName" defaultValue="Studio" required />
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
              <PopoverClose>Cancel editing</PopoverClose>
              <Button type="submit" width="auto">
                Save details
              </Button>
            </form>
            <PopoverArrow />
          </PopoverContent>
        </PopoverPortal>
      </Popover>
      <p role="status" className="text-sm text-foreground-2">
        {saved}
      </p>
      <p className="text-sm text-muted">
        Unreleased candidate. Compose Portal, Arrow and Close explicitly. Header, Title and
        Description are presentation slots; connect their IDs on Content. Nonmodal by default; modal
        enables focus trapping and outside pointer isolation. Your app owns saving and validation.
      </p>
    </div>
  );
}

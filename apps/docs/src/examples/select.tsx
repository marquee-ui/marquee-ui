import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectLabel,
  SelectPortal,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from "@/components/ui/select";

export default function SelectExample() {
  const [saved, setSaved] = useState("");
  return (
    <form
      className="flex w-full flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(String(new FormData(event.currentTarget).get("priority")));
      }}
    >
      <label htmlFor="project-priority" className="text-sm font-semibold">
        Project priority
      </label>
      <Select name="priority" required defaultValue="normal">
        <SelectTrigger id="project-priority" className="w-full">
          <SelectValue placeholder="Choose a priority" />
          <SelectIcon aria-hidden="true">⌄</SelectIcon>
        </SelectTrigger>
        <SelectPortal>
          <SelectContent position="popper" sideOffset={4}>
            <SelectViewport>
              <SelectGroup>
                <SelectLabel>Active priorities</SelectLabel>
                <SelectItem value="low">
                  <SelectItemText>Low</SelectItemText>
                  <SelectItemIndicator aria-hidden="true">✓</SelectItemIndicator>
                </SelectItem>
                <SelectItem value="normal">
                  <SelectItemText>Normal</SelectItemText>
                  <SelectItemIndicator aria-hidden="true">✓</SelectItemIndicator>
                </SelectItem>
                <SelectItem value="urgent">
                  <SelectItemText>Urgent</SelectItemText>
                  <SelectItemIndicator aria-hidden="true">✓</SelectItemIndicator>
                </SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Unavailable</SelectLabel>
                <SelectItem value="archived" disabled>
                  <SelectItemText>Archived</SelectItemText>
                </SelectItem>
              </SelectGroup>
            </SelectViewport>
          </SelectContent>
        </SelectPortal>
      </Select>
      <Button type="submit" width="auto">
        Save priority
      </Button>
      <p role="status">{saved ? `Saved priority: ${saved}.` : "Choose a priority, then save."}</p>
    </form>
  );
}

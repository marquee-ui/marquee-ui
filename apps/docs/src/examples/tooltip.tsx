import { useState } from "react";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function TooltipExample() {
  const [open, setOpen] = useState(false);
  const [saves, setSaves] = useState(0);
  return (
    <div className="flex flex-col items-start gap-3">
      <TooltipProvider delayDuration={300} skipDelayDuration={500}>
        <Tooltip open={open} onOpenChange={setOpen}>
          <TooltipTrigger onClick={() => setSaves((value) => value + 1)}>
            Save document
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent side="top">
              Keyboard shortcut: Control S.
              <TooltipArrow />
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
      <p role="status" className="text-sm text-foreground-2">
        Saved {saves} {saves === 1 ? "time" : "times"}.
      </p>
      <p className="text-sm text-muted">
        Unreleased candidate. Compose Provider, Portal and Arrow explicitly. Hover or keyboard focus
        shows short supplemental, noninteractive text. Keep the trigger's accessible name and
        essential instructions visible; touch actions must work without a tooltip. Use Popover for
        interactive content. Provider controls delay, skip delay and hoverability.
      </p>
    </div>
  );
}

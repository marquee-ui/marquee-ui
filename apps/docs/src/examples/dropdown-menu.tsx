import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuItemIndicator,
  DropdownMenuSeparator,
  DropdownMenuArrow,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

export default function DropdownMenuExample() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [density, setDensity] = useState("compact");
  const [action, setAction] = useState("No action yet.");
  return (
    <div data-dropdown-menu-demo className="flex flex-col items-start gap-3">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger>Project actions</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent sideOffset={8} align="start" collisionPadding={16}>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Project</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => setAction("Project archived.")}>
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem disabled>Delete</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={notifications}
              onCheckedChange={setNotifications}
              onSelect={(event) => event.preventDefault()}
            >
              Notifications
              <DropdownMenuItemIndicator>
                <span aria-hidden>✓</span>
              </DropdownMenuItemIndicator>
            </DropdownMenuCheckboxItem>
            <DropdownMenuLabel>Density</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={density} onValueChange={setDensity}>
              <DropdownMenuRadioItem value="compact" onSelect={(event) => event.preventDefault()}>
                Compact
                <DropdownMenuItemIndicator>
                  <span aria-hidden>●</span>
                </DropdownMenuItemIndicator>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="comfortable"
                onSelect={(event) => event.preventDefault()}
              >
                Comfortable
                <DropdownMenuItemIndicator>
                  <span aria-hidden>●</span>
                </DropdownMenuItemIndicator>
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                Share
                <span className="ml-auto" aria-hidden>
                  ›
                </span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent sideOffset={8} collisionPadding={16}>
                  <DropdownMenuItem onSelect={() => setAction("Link copied.")}>
                    Copy link
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setAction("Email shared.")}>
                    Email
                  </DropdownMenuItem>
                  <DropdownMenuArrow />
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuArrow width={16} height={8} />
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
      <p role="status" className="text-sm text-foreground-2">
        {action} Notifications {notifications ? "on" : "off"}; {density} density.
      </p>
      <p className="text-sm text-muted">
        Unreleased candidate. Compose Portal, indicators, Arrow and every submenu explicitly.
        Selection closes by default; preventDefault keeps settings open. Modal by default; use
        modal=false for outside interaction. Menu items perform actions; use Select for a form
        value.
      </p>
    </div>
  );
}

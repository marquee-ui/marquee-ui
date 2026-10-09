import { useState } from "react";
import { Toggle } from "@/components/ui/toggle";
export default function ToggleExample() {
  const [pinned, setPinned] = useState(false);
  return (
    <Toggle className="px-3" aria-pressed={pinned} onClick={() => setPinned(!pinned)}>
      Pin project
    </Toggle>
  );
}

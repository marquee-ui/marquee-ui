import { useState } from "react";
import { Switch, SwitchTrack, SwitchThumb } from "@/components/ui/switch";
export default function SwitchExample() {
  const [enabled, setEnabled] = useState(false);
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <span>Email updates</span>
      <Switch
        aria-label="Email updates"
        aria-checked={enabled}
        onClick={() => setEnabled(!enabled)}
      >
        <SwitchTrack>
          <SwitchThumb />
        </SwitchTrack>
      </Switch>
    </div>
  );
}

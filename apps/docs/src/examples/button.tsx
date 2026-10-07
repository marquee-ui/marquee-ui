import { useState } from "react";
import { Button } from "@/components/ui/button";
export default function ButtonExample() {
  const [count, setCount] = useState(0);
  return (
    <div className="flex flex-col gap-4">
      <Button width="auto" onClick={() => setCount(count + 1)}>
        Try the button
      </Button>
      <p role="status" aria-label="Button result">
        Pressed {count} {count === 1 ? "time" : "times"}
      </p>
    </div>
  );
}

import { useState } from "react";
import { Toast, ToastMessage, ToastAction } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
export default function ToastExample() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button width="auto" onClick={() => setOpen(true)}>
        Show notification
      </Button>
      <Toast open={open} onDismiss={() => setOpen(false)}>
        <ToastMessage>Project saved.</ToastMessage>
        <ToastAction onClick={() => setOpen(false)}>Dismiss</ToastAction>
      </Toast>
    </>
  );
}

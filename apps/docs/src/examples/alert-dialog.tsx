import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function DraftConfirmation({ onRemove }: { onRemove: () => void }) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove this draft?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the unsaved draft. Choose Keep draft to continue editing.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep draft</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onRemove}>
            Remove draft
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogPortal>
  );
}

export default function AlertDialogExample() {
  const [result, setResult] = useState("Your draft is safe.");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <AlertDialog>
        <AlertDialogTrigger>Review draft removal</AlertDialogTrigger>
        <DraftConfirmation onRemove={() => setResult("Draft removed.")} />
      </AlertDialog>
      <p role="status">{result}</p>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger>Save before closing</AlertDialogTrigger>
        <AlertDialogPortal>
          <AlertDialogOverlay />
          <AlertDialogContent
            onEscapeKeyDown={(event) => {
              if (saving) event.preventDefault();
            }}
          >
            <AlertDialogTitle>Save your changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Closing waits for this example's simulated save. Your app owns the operation and error
              handling.
            </AlertDialogDescription>
            <p role="status">{saving ? "Saving changes…" : "Ready to save."}</p>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={saving}>Cancel save</AlertDialogCancel>
              <AlertDialogAction
                disabled={saving}
                onClick={async (event) => {
                  event.preventDefault();
                  setSaving(true);
                  await new Promise((resolve) => setTimeout(resolve, 500));
                  setSaving(false);
                  setOpen(false);
                  setResult("Changes saved.");
                }}
              >
                Save changes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="secondary">Open draft editor</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetTitle>Draft editor</SheetTitle>
          <SheetDescription>A confirmation can open above this sheet.</SheetDescription>
          <SheetBody>
            <label htmlFor="confirmation-draft-name">Draft name</label>
            <Input id="confirmation-draft-name" defaultValue="Untitled draft" />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="secondary">Review removal in editor</Button>
              </AlertDialogTrigger>
              <DraftConfirmation onRemove={() => setResult("Draft removed from editor.")} />
            </AlertDialog>
            <SheetClose asChild>
              <Button variant="secondary">Close editor</Button>
            </SheetClose>
          </SheetBody>
        </SheetContent>
      </Sheet>
      <p className="text-sm text-muted">
        Compose Portal, Overlay and Content explicitly. Cancel receives initial focus; outside
        clicks cannot dismiss. Escape cancels by default. Action closes unless its event is
        prevented. Header and Footer are optional slots; media and custom layouts are caller
        content.
      </p>
    </div>
  );
}

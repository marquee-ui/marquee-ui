import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
export default function SheetExample() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button width="auto">Open project sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetTitle>Project details</SheetTitle>
        <SheetDescription>A little room for the next step.</SheetDescription>
        <SheetBody>
          <p>Your content belongs here. The body scrolls when it needs to.</p>
          <SheetClose asChild>
            <Button variant="secondary">Done</Button>
          </SheetClose>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}

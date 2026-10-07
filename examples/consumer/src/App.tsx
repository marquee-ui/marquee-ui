import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch, SwitchThumb, SwitchTrack } from "@/components/ui/switch";

export function App() {
  const [count, setCount] = useState(0);
  const [enabled, setEnabled] = useState(false);
  const [name, setName] = useState("");

  return (
    <main className="mx-auto flex max-w-content flex-col gap-6 p-6">
      <header className="flex flex-col gap-3">
        <p className="font-mono text-xs text-muted">NPM CONSUMER · UI 0.1.10 · TOKENS 0.1.0</p>
        <h1 className="font-display text-2xl text-brand">Make it yours.</h1>
        <p className="text-foreground-2">
          React 19, Tailwind 4, and components copied from the published Marquee registry.
        </p>
      </header>
      <Card>
        <CardContent className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Your first composition</h2>
          <Label htmlFor="name">Display name</Label>
          <Input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="nickname"
            placeholder="Your name"
          />
          <p aria-live="polite">Hello, {name || "builder"}.</p>
          <Button width="auto" onClick={() => setCount((value) => value + 1)}>
            Add one
          </Button>
          <p role="status">Count: {count}</p>
          <Switch aria-checked={enabled} onClick={() => setEnabled((value) => !value)}>
            <SwitchTrack>
              <SwitchThumb />
            </SwitchTrack>
            Enable reminders
          </Switch>
          <Accordion type="single" collapsible>
            <AccordionItem value="ownership">
              <AccordionTrigger>Who owns these components?</AccordionTrigger>
              <AccordionContent>
                You do. The registry copies source into your app; compose the parts for your needs.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary" width="auto">
                Open details
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetTitle>A composed sheet</SheetTitle>
              <SheetDescription>
                Focus, dismissal and the scroll region come with the parts.
              </SheetDescription>
              <SheetBody>
                <p>Put your own content here.</p>
                <SheetClose asChild>
                  <Button variant="secondary">Close details</Button>
                </SheetClose>
              </SheetBody>
            </SheetContent>
          </Sheet>
        </CardContent>
      </Card>
    </main>
  );
}

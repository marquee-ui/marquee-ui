import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function ProjectDetails() {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="project">
        <AccordionTrigger>
          Behind the build <span aria-hidden="true">+</span>
        </AccordionTrigger>
        <AccordionContent>
          <Card>
            <CardHeader>
              <CardTitle>Studio notes</CardTitle>
              <CardDescription>Good parts. Your arrangement.</CardDescription>
            </CardHeader>
            <CardContent>Put any content here. You own the structure.</CardContent>
          </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

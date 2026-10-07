import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
export default function AccordionExample() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="one">
        <AccordionTrigger>
          What can I put inside? <span aria-hidden="true">+</span>
        </AccordionTrigger>
        <AccordionContent>Text, a card, a form. The content is your composition.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="two">
        <AccordionTrigger>
          Who owns state? <span aria-hidden="true">+</span>
        </AccordionTrigger>
        <AccordionContent>
          You do. Pass value and onValueChange for a controlled accordion.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

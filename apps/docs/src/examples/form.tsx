import { useState } from "react";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
export default function FormExample() {
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const invalid = submitted && name.trim().length === 0;
  return (
    <form
      className="flex w-full flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <FormItem invalid={invalid}>
        <FormLabel>Project name</FormLabel>
        <FormControl>
          <Input
            autoComplete="off"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </FormControl>
        <FormDescription>Give your next idea a name.</FormDescription>
        {invalid && <FormMessage>Enter a project name.</FormMessage>}
      </FormItem>
      <Button type="submit" width="auto">
        Save project
      </Button>
      <p role="status">{submitted && !invalid ? `Saved ${name.trim()}.` : ""}</p>
    </form>
  );
}

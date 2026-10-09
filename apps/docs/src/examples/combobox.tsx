import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxCommand,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPortal,
  ComboboxTrigger,
} from "@/components/ui/combobox";

const languages = [
  { value: "english", label: "English" },
  { value: "french", label: "French" },
  { value: "german", label: "German" },
  { value: "italian", label: "Italian", disabled: true },
  { value: "spanish", label: "Spanish" },
];

export default function ComboboxExample() {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("english");
  const [saved, setSaved] = useState("");
  return (
    <form
      data-combobox-demo
      className="flex w-full flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(String(new FormData(event.currentTarget).get("language")));
      }}
    >
      <label htmlFor={id} className="text-sm font-semibold">
        Language
      </label>
      {/* Native form state belongs to this caller, separately from active navigation. */}
      <input type="hidden" name="language" value={value} />
      <Combobox open={open} onOpenChange={setOpen}>
        <ComboboxTrigger id={id} className="w-full">
          {languages.find((item) => item.value === value)?.label}
          <span aria-hidden="true">⌄</span>
        </ComboboxTrigger>
        <ComboboxPortal>
          <ComboboxContent aria-label="Choose language" sideOffset={8} collisionPadding={16}>
            <ComboboxCommand label="Search languages">
              <ComboboxInput placeholder="Search languages…" />
              <ComboboxList label="Language results">
                <ComboboxEmpty>No languages found.</ComboboxEmpty>
                <ComboboxGroup heading="Languages">
                  {languages.map((item) => (
                    <ComboboxItem
                      key={item.value}
                      value={item.value}
                      keywords={[item.label]}
                      disabled={item.disabled}
                      data-committed={value === item.value}
                      onSelect={(next) => {
                        setValue(next);
                        setOpen(false);
                      }}
                    >
                      {item.label}
                      <span aria-hidden="true">{value === item.value ? "✓" : ""}</span>
                    </ComboboxItem>
                  ))}
                </ComboboxGroup>
              </ComboboxList>
            </ComboboxCommand>
          </ComboboxContent>
        </ComboboxPortal>
      </Combobox>
      <Button type="submit" width="auto">
        Save language
      </Button>
      <p role="status">{saved ? `Saved language: ${saved}.` : "Choose a language, then save."}</p>
    </form>
  );
}

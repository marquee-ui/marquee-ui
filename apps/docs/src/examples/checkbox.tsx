import { Checkbox, CheckboxInput, CheckboxBox, CheckboxIndicator } from "@/components/ui/checkbox";
export default function CheckboxExample() {
  return (
    <Checkbox className="w-full justify-between">
      <span>Include a weekly summary</span>
      <CheckboxInput name="summary" />
      <CheckboxBox>
        <CheckboxIndicator />
      </CheckboxBox>
    </Checkbox>
  );
}

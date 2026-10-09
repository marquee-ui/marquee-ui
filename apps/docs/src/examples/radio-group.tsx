import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupInput,
  RadioGroupCircle,
  RadioGroupIndicator,
} from "@/components/ui/radio-group";
export default function RadioGroupExample() {
  return (
    <RadioGroup
      aria-label="Update frequency"
      name="frequency"
      className="flex w-full flex-col gap-2"
    >
      {["Weekly", "Monthly"].map((value, index) => (
        <RadioGroupItem key={value} className="w-full">
          <RadioGroupInput value={value} defaultChecked={index === 0} />
          <RadioGroupCircle>
            <RadioGroupIndicator />
          </RadioGroupCircle>
          <span>{value}</span>
        </RadioGroupItem>
      ))}
    </RadioGroup>
  );
}

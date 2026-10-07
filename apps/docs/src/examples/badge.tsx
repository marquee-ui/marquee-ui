import { Badge } from "@/components/ui/badge";
export default function BadgeExample() {
  return (
    <div className="flex flex-wrap gap-3">
      <Badge tone="primary">NEW</Badge>
      <Badge>IN PROGRESS</Badge>
    </div>
  );
}

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
export default function AlertExample() {
  return (
    <Alert tone="success">
      <AlertTitle>Looking good.</AlertTitle>
      <AlertDescription>Your composition has room to grow.</AlertDescription>
    </Alert>
  );
}

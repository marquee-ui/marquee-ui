import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
export default function CardExample() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle asChild>
          <h4>Studio notes</h4>
        </CardTitle>
        <CardDescription>A place for your next idea.</CardDescription>
      </CardHeader>
      <CardContent>Arrange content to fit your product.</CardContent>
      <CardFooter>
        <Button variant="secondary" width="auto" asChild>
          <a href="#composition">See a composition</a>
        </Button>
      </CardFooter>
    </Card>
  );
}

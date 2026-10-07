import {
  DescriptionList,
  DescriptionItem,
  DescriptionTerm,
  DescriptionDetails,
} from "@/components/ui/description-list";
export default function DescriptionListExample() {
  return (
    <DescriptionList className="w-full">
      <DescriptionItem>
        <DescriptionTerm>License</DescriptionTerm>
        <DescriptionDetails>MIT</DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem>
        <DescriptionTerm>State</DescriptionTerm>
        <DescriptionDetails>Owned by your app</DescriptionDetails>
      </DescriptionItem>
    </DescriptionList>
  );
}

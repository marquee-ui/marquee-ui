import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPageItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
export default function BreadcrumbExample() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href={`${import.meta.env.BASE_URL}getting-started/`}>
            Get started
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbPageItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>Components</BreadcrumbPage>
        </BreadcrumbPageItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

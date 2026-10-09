import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
export default function PaginationExample() {
  const [page, setPage] = useState(1);
  return (
    <div>
      <Pagination>
        <PaginationContent>
          {[1, 2, 3].map((value) => (
            <PaginationItem key={value}>
              <PaginationLink asChild isActive={page === value}>
                <button type="button" aria-label={`Page ${value}`} onClick={() => setPage(value)}>
                  {value}
                </button>
              </PaginationLink>
            </PaginationItem>
          ))}
        </PaginationContent>
      </Pagination>
      <p role="status">Showing page {page}</p>
    </div>
  );
}

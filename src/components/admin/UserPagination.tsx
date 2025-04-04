
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface UserPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const UserPagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: UserPaginationProps) => {
  const pageItems = [];
  
  // First page
  pageItems.push(
    <PaginationItem key="first">
      <PaginationLink 
        onClick={() => onPageChange(1)}
        isActive={currentPage === 1}
      >
        1
      </PaginationLink>
    </PaginationItem>
  );
  
  // Show ellipsis if needed
  if (currentPage > 3) {
    pageItems.push(
      <PaginationItem key="ellipsis-start">
        <PaginationEllipsis />
      </PaginationItem>
    );
  }
  
  // Middle pages
  const startPage = Math.max(2, currentPage - 1);
  const endPage = Math.min(totalPages - 1, currentPage + 1);
  
  for (let i = startPage; i <= endPage; i++) {
    if (i > 1 && i < totalPages) {
      pageItems.push(
        <PaginationItem key={i}>
          <PaginationLink 
            onClick={() => onPageChange(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
  }
  
  // Show ellipsis if needed
  if (currentPage < totalPages - 2) {
    pageItems.push(
      <PaginationItem key="ellipsis-end">
        <PaginationEllipsis />
      </PaginationItem>
    );
  }
  
  // Last page
  if (totalPages > 1) {
    pageItems.push(
      <PaginationItem key="last">
        <PaginationLink 
          onClick={() => onPageChange(totalPages)}
          isActive={currentPage === totalPages}
        >
          {totalPages}
        </PaginationLink>
      </PaginationItem>
    );
  }
  
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
        
        {pageItems}
        
        <PaginationItem>
          <PaginationNext 
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

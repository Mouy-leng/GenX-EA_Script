import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (page: number) => void;
}

function Pagination({ 
  currentPage, 
  totalPages, 
  hasNextPage, 
  hasPrevPage, 
  onPageChange 
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, ellipsis, current page range, ellipsis, last page
      if (currentPage <= 3) {
        // Show first 3 pages + ellipsis + last page
        pages.push(1, 2, 3, -1, totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show first page + ellipsis + last 3 pages
        pages.push(1, -1, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // Show first page + ellipsis + current range + ellipsis + last page
        pages.push(1, -1, currentPage - 1, currentPage, currentPage + 1, -1, totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-center mt-8">
      <nav className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
        </Button>
        
        {getPageNumbers().map((page, index) => (
          <div key={index}>
            {page === -1 ? (
              <span className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                ...
              </span>
            ) : (
              <Button
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
                className={
                  page === currentPage
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }
              >
                {page}
              </Button>
            )}
          </div>
        ))}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </Button>
      </nav>
    </div>
  );
}

export default Pagination;

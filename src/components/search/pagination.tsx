'use client';

import { Button } from '@/components/ui/button';
import { useFilterStore } from '@/stores/filter.store';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function Pagination({ pagination }: PaginationProps) {
  const { setPage } = useFilterStore();

  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  const { page, totalPages, total } = pagination;
  const currentPage = page + 1; // Convert 0-based to 1-based

  const handlePrevious = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages - 1) {
      setPage(page + 1);
    }
  };

  const handlePageClick = (pageNumber: number) => {
    setPage(pageNumber - 1); // Convert 1-based to 0-based
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPages = 7; // Maximum number of page buttons to show

    if (totalPages <= maxPages) {
      // Show all pages if total pages is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between mt-8">
      <p className="text-sm text-muted-foreground">
        Totaal <span className="font-medium">{total}</span> producten
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={page === 0}
          aria-label="Vorige pagina"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {getPageNumbers().map((pageNum, index) => {
          if (pageNum === '...') {
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: Ellipsis items are stable visual placeholders
              <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                ...
              </span>
            );
          }

          const isActive = pageNum === currentPage;
          return (
            <Button
              key={pageNum}
              variant={isActive ? 'default' : 'outline'}
              size="icon"
              onClick={() => handlePageClick(pageNum as number)}
              aria-label={`Pagina ${pageNum}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNum}
            </Button>
          );
        })}

        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={page >= totalPages - 1}
          aria-label="Volgende pagina"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

import React from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  isLoading?: boolean;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  isLoading = false,
  className = '',
}) => {
  if (totalCount === 0) {
    return null;
  }

  const startEntry = Math.min((currentPage - 1) * pageSize + 1, totalCount);
  const endEntry = Math.min(currentPage * pageSize, totalCount);

  // Generate page numbers to display with smart ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1; // Number of pages to show around current page

    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    pages.push(1);

    if (left > 2) {
      pages.push('...');
    }

    for (let i = left; i <= right; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    if (right < totalPages - 1) {
      pages.push('...');
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      aria-label="Pagination Navigation"
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-3.5 px-4 bg-card/60 border-t border-border/70 ${className}`}
    >
      {/* Entries range & Page size */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-sans">
        <div>
          Showing{' '}
          <span className="font-mono font-medium text-foreground tabular-nums">
            {startEntry.toLocaleString('en-IN')}
          </span>{' '}
          to{' '}
          <span className="font-mono font-medium text-foreground tabular-nums">
            {endEntry.toLocaleString('en-IN')}
          </span>{' '}
          of{' '}
          <span className="font-mono font-medium text-foreground tabular-nums">
            {totalCount.toLocaleString('en-IN')}
          </span>{' '}
          results
        </div>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-3 border-l border-border/60">
            <label htmlFor="pagination-page-size" className="text-muted-foreground whitespace-nowrap">
              Rows per page:
            </label>
            <select
              id="pagination-page-size"
              aria-label="Rows per page"
              value={pageSize}
              disabled={isLoading}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-background text-foreground border border-border/80 rounded-lg px-2 py-1 text-xs font-mono font-medium focus:ring-1 focus:ring-accent focus:border-accent outline-none cursor-pointer disabled:opacity-50"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Page Navigation Controls */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1 || isLoading}
          title="First page"
          aria-label="First page"
          className="min-h-[38px] min-w-[38px] sm:min-h-[34px] sm:min-w-[34px] inline-flex items-center justify-center rounded-lg border border-border/70 bg-background text-muted-foreground hover:text-foreground hover:bg-muted/70 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-background transition-colors duration-150"
        >
          <ChevronDoubleLeftIcon className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
          title="Previous page"
          aria-label="Previous page"
          className="min-h-[38px] min-w-[38px] sm:min-h-[34px] sm:min-w-[34px] inline-flex items-center justify-center rounded-lg border border-border/70 bg-background text-muted-foreground hover:text-foreground hover:bg-muted/70 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-background transition-colors duration-150"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1 mx-1">
          {pageNumbers.map((page, idx) => {
            if (typeof page === 'string') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="min-h-[38px] min-w-[34px] sm:min-h-[34px] inline-flex items-center justify-center text-xs font-mono text-muted-foreground/70"
                >
                  …
                </span>
              );
            }

            const isActive = page === currentPage;
            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                disabled={isLoading}
                aria-current={isActive ? 'page' : undefined}
                className={`min-h-[38px] min-w-[38px] sm:min-h-[34px] sm:min-w-[34px] px-2.5 rounded-lg text-xs font-mono font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-accent text-white shadow-2xs font-semibold'
                    : 'border border-border/70 bg-background text-foreground/80 hover:bg-muted/70 hover:text-foreground'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
          title="Next page"
          aria-label="Next page"
          className="min-h-[38px] min-w-[38px] sm:min-h-[34px] sm:min-w-[34px] inline-flex items-center justify-center rounded-lg border border-border/70 bg-background text-muted-foreground hover:text-foreground hover:bg-muted/70 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-background transition-colors duration-150"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages || isLoading}
          title="Last page"
          aria-label="Last page"
          className="min-h-[38px] min-w-[38px] sm:min-h-[34px] sm:min-w-[34px] inline-flex items-center justify-center rounded-lg border border-border/70 bg-background text-muted-foreground hover:text-foreground hover:bg-muted/70 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-background transition-colors duration-150"
        >
          <ChevronDoubleRightIcon className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
};

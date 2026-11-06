import React from 'react';
import { Button, Select } from '@fluentui/react-components';
import {
  ChevronLeft16Regular,
  ChevronRight16Regular,
  ChevronDoubleLeft16Regular,
  ChevronDoubleRight16Regular,
} from '@fluentui/react-icons';

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

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1;

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
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 bg-card border-t border-border ${className}`}
    >
      {/* Entries range & Page size */}
      <div className="flex flex-wrap items-center gap-3 text-caption1 text-muted-foreground">
        <div>
          Showing{' '}
          <span className="font-mono font-semibold text-foreground tabular">
            {startEntry.toLocaleString('en-IN')}
          </span>{' '}
          to{' '}
          <span className="font-mono font-semibold text-foreground tabular">
            {endEntry.toLocaleString('en-IN')}
          </span>{' '}
          of{' '}
          <span className="font-mono font-semibold text-foreground tabular">
            {totalCount.toLocaleString('en-IN')}
          </span>{' '}
          results
        </div>

        {onPageSizeChange && (
          <div className="flex items-center gap-2 pl-3 border-l border-border">
            <label htmlFor="pagination-page-size" className="text-muted-foreground whitespace-nowrap">
              Rows per page:
            </label>
            <Select
              id="pagination-page-size"
              aria-label="Rows per page"
              size="small"
              value={String(pageSize)}
              disabled={isLoading}
              onChange={(_, data) => onPageSizeChange(Number(data.value))}
              className="tabular"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      {/* Page Navigation Controls */}
      <div className="flex items-center gap-1">
        <Button
          appearance="secondary"
          size="small"
          icon={<ChevronDoubleLeft16Regular />}
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1 || isLoading}
          title="First page"
          aria-label="First page"
        />

        <Button
          appearance="secondary"
          size="small"
          icon={<ChevronLeft16Regular />}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
          title="Previous page"
          aria-label="Previous page"
        />

        <div className="flex items-center gap-1 mx-1">
          {pageNumbers.map((page, idx) => {
            if (typeof page === 'string') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="min-w-7 inline-flex items-center justify-center text-caption1 font-mono text-muted-foreground"
                >
                  …
                </span>
              );
            }

            const isActive = page === currentPage;
            return (
              <Button
                key={page}
                appearance={isActive ? 'primary' : 'secondary'}
                size="small"
                onClick={() => onPageChange(page)}
                disabled={isLoading}
                aria-current={isActive ? 'page' : undefined}
                className="tabular min-w-8"
              >
                {page}
              </Button>
            );
          })}
        </div>

        <Button
          appearance="secondary"
          size="small"
          icon={<ChevronRight16Regular />}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
          title="Next page"
          aria-label="Next page"
        />

        <Button
          appearance="secondary"
          size="small"
          icon={<ChevronDoubleRight16Regular />}
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages || isLoading}
          title="Last page"
          aria-label="Last page"
        />
      </div>
    </nav>
  );
};

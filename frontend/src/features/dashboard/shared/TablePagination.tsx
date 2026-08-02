'use client';

import React from 'react';
import { Icon } from '@/design-system';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  rowsPerPageOptions?: number[];
}

const DEFAULT_OPTIONS = [10, 20, 50, 100];

/**
 * STEP Enterprise TablePagination
 *
 * Compact, accessible pagination control for all enterprise tables.
 * Shows: rows per page selector | record range | page numbers | prev/next
 */
export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  totalRecords,
  rowsPerPage = 10,
  onPageChange,
}) => {
  const from = Math.min((currentPage - 1) * rowsPerPage + 1, totalRecords);
  const to = Math.min(currentPage * rowsPerPage, totalRecords);

  // Generate page numbers with ellipsis
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | 'ellipsis')[] = [1];
    if (currentPage > 3) pages.push('ellipsis');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('ellipsis');
    pages.push(totalPages);
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-wrap items-center justify-between gap-[var(--space-sm)] px-[var(--padding-card-compact)] py-2 bg-[var(--surface-1)] border-t border-[var(--border-default)]">
      {/* Record range */}
      <span className="text-[var(--type-body-md-size)] text-[var(--text-secondary)] font-medium">
        Showing <strong className="font-mono text-[var(--text-primary)]">{from.toLocaleString()}–{to.toLocaleString()}</strong> of <strong className="font-mono text-[var(--text-primary)]">{totalRecords.toLocaleString()}</strong>
      </span>

      {/* Page numbers */}
      <nav className="flex items-center gap-[var(--space-3xs)]" aria-label="Pagination">
        {/* Previous */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="w-7.5 h-7.5 flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)]
            text-[var(--text-secondary)] bg-[var(--surface-1)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]
            disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all duration-150 focus-ring-step cursor-pointer"
        >
          <Icon name="chevron-left" size="xs" />
        </button>

        {/* Page numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {pageNumbers.map((p, i) =>
            p === 'ellipsis' ? (
              <span key={`ellipsis-${i}`} className="w-7.5 h-7.5 flex items-center justify-center text-[var(--text-tertiary)] text-[11px] font-mono">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-label={`Page ${p}`}
                aria-current={p === currentPage ? 'page' : undefined}
                className={`w-7.5 h-7.5 flex items-center justify-center rounded-[var(--radius-md)] text-[12px] font-mono font-bold
                  transition-all duration-150 focus-ring-step cursor-pointer
                  ${p === currentPage
                    ? 'bg-[var(--accent-indigo)] text-white border border-[var(--accent-indigo)] shadow-xs'
                    : 'border border-[var(--border-default)] text-[var(--text-secondary)] bg-[var(--surface-1)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] hover:-translate-y-0.5'
                  }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        {/* Mobile: current / total */}
        <span className="sm:hidden text-[12px] font-mono font-semibold text-[var(--text-secondary)] px-2">
          {currentPage} / {totalPages}
        </span>

        {/* Next */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="w-7.5 h-7.5 flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)]
            text-[var(--text-secondary)] bg-[var(--surface-1)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]
            disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all duration-150 focus-ring-step cursor-pointer"
        >
          <Icon name="chevron-right" size="xs" />
        </button>
      </nav>
    </div>
  );
};

"use client";

import React from "react";
import { Icon } from "@/design-system";

export interface TablePaginationProps {
	currentPage: number;
	totalPages: number;
	totalRecords: number;
	rowsPerPage: number;
	onPageChange: (page: number) => void;
	onRowsPerPageChange: (rows: number) => void;
	rowsPerPageOptions?: number[];
}

/**
 * STEP Enterprise TablePagination
 *
 * Compact, accessible pagination control for all enterprise tables.
 * Shows: record range | page numbers | prev/next controls
 * Uses typography and button styling matching the core design system.
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
	const getPageNumbers = (): (number | "ellipsis")[] => {
		if (totalPages <= 7)
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		const pages: (number | "ellipsis")[] = [1];
		if (currentPage > 3) pages.push("ellipsis");
		for (
			let i = Math.max(2, currentPage - 1);
			i <= Math.min(totalPages - 1, currentPage + 1);
			i++
		) {
			pages.push(i);
		}
		if (currentPage < totalPages - 2) pages.push("ellipsis");
		pages.push(totalPages);
		return pages;
	};

	const pageNumbers = getPageNumbers();

	return (
		<div className='flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-2.5 bg-surface-1 border-t border-border-default'>
			{/* Record range */}
			<span className='text-xs sm:text-[12.5px] font-sans font-medium text-text-secondary'>
				Showing{" "}
				<strong className='font-bold text-text-primary'>
					{from.toLocaleString()}–{to.toLocaleString()}
				</strong>{" "}
				of{" "}
				<strong className='font-bold text-text-primary'>
					{totalRecords.toLocaleString()}
				</strong>
			</span>

			{/* Page numbers navigation */}
			<nav
				className='flex items-center gap-1.5'
				aria-label='Pagination'>
				{/* Previous button */}
				<button
					type='button'
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage === 1}
					aria-label='Previous page'
					className='size-8 flex items-center justify-center rounded-lg border border-border-default
            text-text-secondary bg-surface-1 hover:bg-surface-hover hover:text-text-primary
            disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer shadow-xs'>
					<Icon
						name='chevron-left'
						size='xs'
					/>
				</button>

				{/* Page numbers */}
				<div className='hidden sm:flex items-center gap-1'>
					{pageNumbers.map((p, i) =>
						p === "ellipsis" ?
							<span
								key={`ellipsis-${i}`}
								className='size-8 flex items-center justify-center text-text-tertiary text-xs font-medium font-sans'>
								…
							</span>
						:	<button
								key={p}
								type='button'
								onClick={() => onPageChange(p)}
								aria-label={`Page ${p}`}
								aria-current={p === currentPage ? "page" : undefined}
								className={`size-8 flex items-center justify-center rounded-lg text-xs font-bold font-sans
                  transition-all duration-150 cursor-pointer
                  ${
										p === currentPage ?
											"bg-accent-indigo text-white shadow-xs border border-accent-indigo"
										:	"border border-border-default text-text-secondary bg-surface-1 hover:bg-surface-hover hover:text-text-primary"
									}`}>
								{p}
							</button>,
					)}
				</div>

				{/* Mobile: current / total */}
				<span className='sm:hidden text-xs font-sans font-semibold text-text-secondary px-2'>
					{currentPage} / {totalPages}
				</span>

				{/* Next button */}
				<button
					type='button'
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					aria-label='Next page'
					className='size-8 flex items-center justify-center rounded-lg border border-border-default
            text-text-secondary bg-surface-1 hover:bg-surface-hover hover:text-text-primary
            disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer shadow-xs'>
					<Icon
						name='chevron-right'
						size='xs'
					/>
				</button>
			</nav>
		</div>
	);
};

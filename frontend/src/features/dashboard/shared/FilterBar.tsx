"use client";

import React from "react";
import { Icon, CustomDateRangePicker } from "@/design-system";
import { CustomSelect } from "@/features/shared/select/CustomSelect";

interface FilterOption {
	value: string;
	label: string;
}

export interface ActiveFilter {
	[filterId: string]: string;
}

interface FilterBarDef {
	id: string;
	label: string;
	placeholder: string;
	type: "select" | "date-range";
	options?: FilterOption[];
}

interface FilterBarProps {
	filters: FilterBarDef[];
	activeFilters: ActiveFilter;
	onFilterChange: (filterId: string, value: string) => void;
	onReset: () => void;
	resultCount?: number;
	totalCount?: number;
	inline?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
	filters,
	activeFilters,
	onFilterChange,
	onReset,
	resultCount,
	totalCount,
	inline = false,
}) => {
	const hasActiveFilters = Object.values(activeFilters).some((val) =>
		Boolean(val),
	);

	return (
		<div
			className={`flex items-center gap-2 overflow-x-auto scrollbar-none flex-nowrap shrink-0 w-full py-0.5 ${
				inline ? "" : (
					"p-2 sm:p-2.5 bg-surface-1 border border-border-default rounded-xl shadow-xs"
				)
			}`}>
			{filters.map((filter) => {
				const widthClass =
					inline ? "w-[112px] xl:w-[124px]" : "w-[145px] sm:w-[155px]";

				return (
					<div
						key={filter.id}
						className='relative shrink-0'>
						{filter.type === "select" ?
							<CustomSelect
								label={filter.label}
								placeholder={filter.placeholder}
								value={activeFilters[filter.id] || ""}
								options={filter.options || []}
								onChange={(val) => onFilterChange(filter.id, val)}
								widthClass={widthClass}
							/>
						:	<CustomDateRangePicker
								placeholder={filter.placeholder}
								value={activeFilters[filter.id] || ""}
								onChange={(val) => onFilterChange(filter.id, val)}
								className={widthClass}
							/>
						}
					</div>
				);
			})}

			{hasActiveFilters && (
				<button
					type='button'
					onClick={onReset}
					className='inline-flex items-center gap-1 h-8 px-2.5 rounded-full
            text-[11px] sm:text-[11.5px] font-semibold text-status-danger-text
            bg-status-danger-bg border border-status-danger-border
            hover:bg-status-danger hover:text-white hover:scale-[1.02] active:scale-95 transition-all duration-150 cursor-pointer shrink-0 whitespace-nowrap shadow-xs'
					aria-label='Reset all filters'>
					<Icon
						name='x'
						size='xs'
					/>
					<span>Reset Filters</span>
				</button>
			)}
		</div>
	);
};

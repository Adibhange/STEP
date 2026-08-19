'use client';

import React from 'react';
import { Icon, CustomCalendarPicker } from '@/design-system';
import { CustomSelect } from '@/features/shared/select/CustomSelect';

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
  type: 'select' | 'date-range';
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
  const hasActiveFilters = Object.values(activeFilters).some((val) => Boolean(val));

  return (
    <div
      className={`flex items-center gap-2 overflow-x-auto scrollbar-none flex-nowrap shrink-0 w-full py-0.5 ${
        inline ? '' : 'p-2 sm:p-2.5 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-xl shadow-2xs'
      }`}
    >
      {filters.map((filter) => {
        const widthClass = filter.type === 'select' ? 'w-[140px] sm:w-[150px]' : 'w-[150px] sm:w-[160px]';

        return (
          <div key={filter.id} className="relative shrink-0">
            {filter.type === 'select' ? (
              <CustomSelect
                label={filter.label}
                placeholder={filter.placeholder}
                value={activeFilters[filter.id] || ''}
                options={filter.options || []}
                onChange={(val) => onFilterChange(filter.id, val)}
                widthClass={widthClass}
              />
            ) : (
              <CustomCalendarPicker
                placeholder={filter.placeholder}
                value={activeFilters[filter.id] || ''}
                onChange={(val) => onFilterChange(filter.id, val)}
                className={widthClass}
              />
            )}
          </div>
        );
      })}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 h-8 px-2.5 rounded-full
            text-[11px] sm:text-[11.5px] font-semibold text-[var(--status-danger-text)]
            bg-[var(--status-danger-bg)] border border-[var(--status-danger-border)]
            hover:bg-[var(--status-danger-text)] hover:text-[var(--text-on-accent)] active:scale-95 transition-all duration-150 cursor-pointer shrink-0 whitespace-nowrap"
          aria-label="Reset all filters"
        >
          <Icon name="x" size="xs" />
          <span>Reset Filters</span>
        </button>
      )}
    </div>
  );
};

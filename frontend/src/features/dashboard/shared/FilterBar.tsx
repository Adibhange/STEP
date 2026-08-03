'use client';

import React, { useState, useEffect, useMemo } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Icon } from '@/design-system';
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

// ── Single-Line Compact Date Picker with Radix Popover Portal ────────────────────

interface CustomDatePickerProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  widthClass?: string;
}

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  label,
  placeholder,
  value,
  onChange,
  widthClass = 'w-auto',
}) => {
  const [open, setOpen] = useState(false);

  const selectedDate = useMemo(() => {
    if (!value) return new Date();
    const parts = value.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m, d);
      }
    }
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  }, [value]);

  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());

  useEffect(() => {
    if (open) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [open, selectedDate]);

  const monthName = new Date(viewYear, viewMonth, 1).toLocaleString('default', { month: 'long' });

  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

    const days: { day: number; isCurrentMonth: boolean; dateStr: string }[] = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({ day: dayNum, isCurrentMonth: false, dateStr });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ day: i, isCurrentMonth: true, dateStr });
    }

    const remaining = 35 - days.length > 0 ? 35 - days.length : 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ day: i, isCurrentMonth: false, dateStr });
    }

    return days;
  }, [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const formattedDisplayValue = useMemo(() => {
    if (!value) return placeholder;
    const parts = value.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m, d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      }
    }
    return placeholder;
  }, [value, placeholder]);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          aria-expanded={open}
          aria-label={label}
          className={`h-9 px-3 rounded-lg border flex items-center justify-between gap-2 ${widthClass} text-xs transition-all duration-150 ease-out cursor-pointer select-none focus-ring-step outline-none ${
            value
              ? 'bg-[var(--surface-1)] border-[var(--border-default)] text-[var(--text-primary)] font-medium hover:border-[var(--border-strong)]'
              : 'bg-[var(--surface-1)] border-[var(--border-default)] text-[var(--text-tertiary)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] font-normal'
          }`}
        >
          <span className="truncate">
            {formattedDisplayValue}
          </span>
          {value ? (
            <span
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onChange('');
              }}
              className="hover:text-[var(--text-primary)] text-[var(--text-tertiary)] cursor-pointer shrink-0 transition-colors"
              title="Clear date filter"
            >
              <Icon name="x" size="xs" />
            </span>
          ) : (
            <Icon
              name="chevron-down"
              size="xs"
              className={`shrink-0 transition-transform duration-150 ${
                value ? 'text-[var(--accent-indigo)]' : 'text-[var(--text-tertiary)]'
              } ${open ? 'rotate-180 text-[var(--accent-indigo)]' : ''}`}
            />
          )}
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={6}
          className="z-[9999] p-3 w-64 bg-[var(--surface-1)] border border-[var(--border-default)]
            rounded-[var(--radius-lg)] shadow-[0_16px_40px_-8px_rgba(15,23,42,0.22)] space-y-2.5
            select-none outline-none data-[state=open]:animate-zoom-in data-[state=closed]:animate-zoom-out"
        >
          <div className="flex items-center justify-between px-1">
            <span className="text-[13px] font-bold text-[var(--text-primary)] font-heading">
              {monthName} {viewYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="w-6.5 h-6.5 rounded-[var(--radius-sm)] border border-[var(--border-default)] hover:bg-[var(--surface-hover)] flex items-center justify-center text-[var(--text-secondary)] transition-colors duration-150 active:scale-95"
                aria-label="Previous month"
              >
                <Icon name="chevron-left" size="xs" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="w-6.5 h-6.5 rounded-[var(--radius-sm)] border border-[var(--border-default)] hover:bg-[var(--surface-hover)] flex items-center justify-center text-[var(--text-secondary)] transition-colors duration-150 active:scale-95"
                aria-label="Next month"
              >
                <Icon name="chevron-right" size="xs" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center">
            {DAYS_OF_WEEK.map((day) => (
              <span key={day} className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider font-mono">
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cell) => {
              const isSelected = value === cell.dateStr;
              const isToday = todayStr === cell.dateStr;

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  onClick={() => {
                    onChange(cell.dateStr);
                    setOpen(false);
                  }}
                  className={`h-7.5 w-full rounded-[var(--radius-sm)] text-[11.5px] font-mono transition-all duration-150 flex items-center justify-center cursor-pointer active:scale-95
                    ${isSelected
                      ? 'bg-[var(--accent-indigo)] text-[var(--text-on-accent)] font-bold'
                      : cell.isCurrentMonth
                      ? isToday
                        ? 'bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] font-bold border border-[var(--border-focus)]'
                        : 'text-[var(--text-primary)] hover:bg-[var(--surface-hover)] font-medium'
                      : 'text-[var(--text-disabled)] hover:bg-[var(--surface-hover)]'
                    }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-1 pt-2 border-t border-[var(--border-soft)]">
            {[
              { label: 'Today', days: 0 },
              { label: 'Past 7 Days', days: 7 },
              { label: 'Past 30 Days', days: 30 },
              { label: 'This Month', days: 1 },
            ].map((shortcut) => (
              <button
                key={shortcut.label}
                type="button"
                onClick={() => {
                  const d = new Date();
                  if (shortcut.days > 0 && shortcut.days !== 1) {
                    d.setDate(d.getDate() - shortcut.days);
                  }
                  const y = d.getFullYear();
                  const m = String(d.getMonth() + 1).padStart(2, '0');
                  const day = String(d.getDate()).padStart(2, '0');
                  onChange(`${y}-${m}-${day}`);
                  setOpen(false);
                }}
                className="px-2 py-1 rounded-[var(--radius-sm)] bg-[var(--surface-2)] hover:bg-[var(--accent-indigo-dim)] hover:text-[var(--accent-indigo)]
                  text-[10.5px] font-semibold text-[var(--text-secondary)] text-center transition-all duration-150 cursor-pointer active:scale-95"
              >
                {shortcut.label}
              </button>
            ))}
          </div>

          {value && (
            <div className="pt-1.5 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setOpen(false);
                }}
                className="text-[11px] font-semibold text-[var(--status-danger-text)] hover:underline transition-colors cursor-pointer"
              >
                Clear Selection
              </button>
            </div>
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};

// ── Single-Row Width Map ────────────────────────────────────────────────────────

const FILTER_WIDTH_MAP: Record<string, string> = {
  role: 'w-[130px] xl:w-[145px]',
  stage: 'w-[120px] xl:w-[130px]',
  hiringLocation: 'w-[115px] xl:w-[125px]',
  testLocation: 'w-[115px] xl:w-[125px]',
  status: 'w-[120px] xl:w-[130px]',
  appliedDate: 'w-[125px] xl:w-[135px]',
};

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  activeFilters,
  onFilterChange,
  onReset,
}) => {
  const hasActiveFilters = Object.values(activeFilters).some((v) => v !== '');

  return (
    <div className="flex items-center gap-2 shrink-0">
      {filters.map((filter) => {
        const widthClass = FILTER_WIDTH_MAP[filter.id] || 'w-[120px]';
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
              <CustomDatePicker
                label={filter.label}
                placeholder={filter.placeholder}
                value={activeFilters[filter.id] || ''}
                onChange={(val) => onFilterChange(filter.id, val)}
                widthClass={widthClass}
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
            text-[11.5px] font-semibold text-[var(--status-danger-text)]
            bg-[var(--status-danger-bg)] border border-[var(--status-danger-border)]
            hover:bg-[var(--status-danger-text)] hover:text-[var(--text-on-accent)] active:scale-95 transition-all duration-150 cursor-pointer shrink-0"
          aria-label="Reset all filters"
        >
          <Icon name="x" size="xs" />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
};

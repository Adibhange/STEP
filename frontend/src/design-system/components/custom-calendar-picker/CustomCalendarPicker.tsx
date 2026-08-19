'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '../../icon';

export interface CustomCalendarPickerProps {
  value?: string; // Format: YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minYear?: number;
  maxYear?: number;
  disabled?: boolean;
}

const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const CustomCalendarPicker: React.FC<CustomCalendarPickerProps> = ({
  value,
  onChange,
  placeholder = 'Select Date',
  className = '',
  minYear = 1960,
  maxYear = new Date().getFullYear() + 5,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

  const initialDate = useMemo(() => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date(2002, 4, 15);
  }, [value]);

  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth());

  // Keep view in sync when value changes or when opened
  useEffect(() => {
    if (open) {
      if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [y, m] = value.split('-').map(Number);
        setViewYear(y);
        setViewMonth(m - 1);
      }
      setMonthDropdownOpen(false);
      setYearDropdownOpen(false);
    }
  }, [open, value]);

  // Year options list for fast birth year jumping
  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let y = maxYear; y >= minYear; y--) {
      years.push(y);
    }
    return years;
  }, [minYear, maxYear]);

  // Calendar Day Grid Computation
  const days = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
    const list: { day: number; isCurrentMonth: boolean; dateStr: string }[] = [];

    // Preceding month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
      list.push({
        day: dayNum,
        isCurrentMonth: false,
        dateStr: `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      list.push({
        day: i,
        isCurrentMonth: true,
        dateStr: `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
      });
    }

    // Subsequent month filler days (fill up to 35 or 42 grid slots)
    const totalSlots = list.length > 35 ? 42 : 35;
    const remaining = totalSlots - list.length;
    for (let i = 1; i <= remaining; i++) {
      const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
      list.push({
        day: i,
        isCurrentMonth: false,
        dateStr: `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
      });
    }

    return list;
  }, [viewYear, viewMonth]);

  const formattedDisplay = useMemo(() => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [y, m, d] = value.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }, [value]);

  const handlePrevMonth = () => {
    setMonthDropdownOpen(false);
    setYearDropdownOpen(false);
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    setMonthDropdownOpen(false);
    setYearDropdownOpen(false);
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={`w-full h-10 px-3.5 rounded-xl border bg-[var(--surface-2)] text-xs flex items-center justify-between transition-all cursor-pointer select-none ${
            open
              ? 'border-[var(--accent-indigo)] ring-2 ring-[var(--accent-indigo)]/20'
              : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Icon name="calendar" size="xs" className="text-[var(--accent-indigo)] shrink-0" />
            <span className={`truncate font-medium ${formattedDisplay ? 'text-[var(--text-primary)] font-mono' : 'text-[var(--text-tertiary)]'}`}>
              {formattedDisplay || placeholder}
            </span>
          </div>
          <Icon
            name="chevron-down"
            size="xs"
            className={`text-[var(--text-tertiary)] shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-[var(--accent-indigo)]' : ''}`}
          />
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={6}
          className="z-[99999] w-[290px] bg-[var(--surface-1)] border border-[var(--border-default)] rounded-2xl shadow-[var(--shadow-xl)] p-3.5 backdrop-blur-md outline-none select-none animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header: Month & Year Custom Selectors with Prev/Next Buttons */}
          <div className="flex items-center justify-between gap-1 mb-2.5 pb-2 border-b border-[var(--border-soft)] relative">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-7 h-7 rounded-lg border border-[var(--border-default)] hover:border-[var(--border-strong)] bg-[var(--surface-2)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Previous Month"
            >
              <Icon name="chevron-left" size="xs" />
            </button>

            <div className="flex items-center gap-1.5 min-w-0">
              {/* Custom Month Dropdown Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setMonthDropdownOpen((prev) => !prev);
                    setYearDropdownOpen(false);
                  }}
                  className={`h-7 px-2.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    monthDropdownOpen
                      ? 'bg-[var(--accent-indigo-dim)] border-[var(--accent-indigo)] text-[var(--accent-indigo)]'
                      : 'bg-[var(--surface-2)] border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  <span>{MONTHS_SHORT[viewMonth]}</span>
                  <Icon name="chevron-down" size="xs" className={`text-[var(--text-tertiary)] transition-transform duration-150 ${monthDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {monthDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1 w-32 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-xl shadow-[var(--shadow-xl)] z-50 py-1 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
                    {MONTHS_FULL.map((name, idx) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => {
                          setViewMonth(idx);
                          setMonthDropdownOpen(false);
                        }}
                        className={`w-full px-2.5 py-1.5 text-left text-xs font-medium flex items-center justify-between hover:bg-[var(--surface-hover)] transition-colors cursor-pointer ${
                          viewMonth === idx ? 'bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] font-bold' : 'text-[var(--text-primary)]'
                        }`}
                      >
                        <span>{name}</span>
                        {viewMonth === idx && <Icon name="check" size="xs" className="text-[var(--accent-indigo)]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Year Dropdown Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setYearDropdownOpen((prev) => !prev);
                    setMonthDropdownOpen(false);
                  }}
                  className={`h-7 px-2.5 rounded-lg border text-xs font-bold font-mono flex items-center gap-1 transition-all cursor-pointer ${
                    yearDropdownOpen
                      ? 'bg-[var(--accent-indigo-dim)] border-[var(--accent-indigo)] text-[var(--accent-indigo)]'
                      : 'bg-[var(--surface-2)] border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  <span>{viewYear}</span>
                  <Icon name="chevron-down" size="xs" className={`text-[var(--text-tertiary)] transition-transform duration-150 ${yearDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {yearDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-28 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-xl shadow-[var(--shadow-xl)] z-50 py-1 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
                    {yearOptions.map((y) => (
                      <button
                        key={y}
                        type="button"
                        onClick={() => {
                          setViewYear(y);
                          setYearDropdownOpen(false);
                        }}
                        className={`w-full px-2.5 py-1.5 text-left text-xs font-mono font-medium flex items-center justify-between hover:bg-[var(--surface-hover)] transition-colors cursor-pointer ${
                          viewYear === y ? 'bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] font-bold' : 'text-[var(--text-primary)]'
                        }`}
                      >
                        <span>{y}</span>
                        {viewYear === y && <Icon name="check" size="xs" className="text-[var(--accent-indigo)]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="w-7 h-7 rounded-lg border border-[var(--border-default)] hover:border-[var(--border-strong)] bg-[var(--surface-2)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Next Month"
            >
              <Icon name="chevron-right" size="xs" />
            </button>
          </div>

          {/* Weekday Header */}
          <div className="grid grid-cols-7 gap-1 text-[10.5px] font-bold text-[var(--text-tertiary)] text-center mb-1 font-mono uppercase tracking-wider">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d} className="py-0.5">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Days Matrix */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((d, idx) => {
              const isSelected = d.dateStr === value;
              const isToday = d.dateStr === new Date().toISOString().split('T')[0];

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onChange(d.dateStr);
                    setOpen(false);
                  }}
                  className={`h-8 w-8 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer tabular-figures ${
                    isSelected
                      ? 'bg-[var(--accent-indigo)] text-white font-bold shadow-sm ring-2 ring-[var(--accent-indigo)]/30'
                      : isToday
                      ? 'bg-[var(--surface-3)] text-[var(--accent-indigo)] font-bold border border-[var(--accent-indigo)]/40'
                      : d.isCurrentMonth
                      ? 'text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                      : 'text-[var(--text-disabled)] opacity-35'
                  }`}
                >
                  {d.day}
                </button>
              );
            })}
          </div>

          {/* Quick Actions Footer */}
          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[var(--border-soft)] text-[11px]">
            <button
              type="button"
              onClick={() => {
                const todayStr = new Date().toISOString().split('T')[0];
                onChange(todayStr);
                setOpen(false);
              }}
              className="text-[var(--accent-indigo)] font-bold hover:underline cursor-pointer"
            >
              Today
            </button>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setOpen(false);
                }}
                className="text-[var(--status-danger-text)] font-semibold hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};

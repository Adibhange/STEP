'use client';

import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface Option {
  label: string;
  value: string;
}

export interface MultiSelectProps {
  options: Option[];
  value?: string[];
  onChange?: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value = [],
  onChange,
  placeholder = 'Select options...',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (val: string) => {
    const next = value.includes(val) ? value.filter((v) => v !== val) : [...value, val];
    if (onChange) onChange(next);
  };

  return (
    <div className="relative w-full">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 cursor-pointer flex items-center justify-between',
          className
        )}
      >
        <span className="truncate">
          {value.length === 0 ? placeholder : `${value.length} items selected`}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded shadow-lg z-30 max-h-48 overflow-y-auto p-1 space-y-0.5">
          {options.map((opt) => {
            const isSelected = value.includes(opt.value);
            return (
              <div
                key={opt.value}
                onClick={() => toggleOption(opt.value)}
                className={cn(
                  'px-2 py-1.5 text-xs rounded cursor-pointer flex items-center justify-between hover:bg-sky-50 dark:hover:bg-slate-800',
                  isSelected && 'font-semibold text-[#2563EB]'
                )}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#2563EB]" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

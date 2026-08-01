import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ label, className, ...props }) => {
  return (
    <div className="w-full space-y-1">
      {label && <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</label>}
      <div className="relative w-full">
        <input
          type="date"
          className={cn(
            'w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#2563EB]',
            className
          )}
          {...props}
        />
      </div>
    </div>
  );
};

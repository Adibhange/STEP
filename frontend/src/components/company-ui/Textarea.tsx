import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        {label && <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</label>}
        <textarea
          ref={ref}
          className={cn(
            'w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#2563EB] disabled:opacity-50',
            error && 'border-rose-500 focus:border-rose-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-[11px] text-rose-500">{error}</p>}
      </div>
    );
  }
);
TextArea.displayName = 'TextArea';

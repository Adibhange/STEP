import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label: React.FC<LabelProps> = ({ children, required, className, ...props }) => (
  <label className={cn('block text-xs font-semibold text-slate-700 dark:text-slate-300', className)} {...props}>
    {children}
    {required && <span className="text-rose-500 ml-0.5">*</span>}
  </label>
);

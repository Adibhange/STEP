import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => (
  <div className={cn('bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded shadow-2xs p-3', className)}>
    {children}
  </div>
);

export const CardHeader: React.FC<CardProps> = ({ children, className }) => (
  <div className={cn('border-b border-slate-100 dark:border-slate-800 pb-2 mb-2 flex items-center justify-between', className)}>
    {children}
  </div>
);

export const CardTitle: React.FC<CardProps> = ({ children, className }) => (
  <h3 className={cn('font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider', className)}>
    {children}
  </h3>
);

export const CardContent: React.FC<CardProps> = ({ children, className }) => (
  <div className={cn('text-xs text-slate-700 dark:text-slate-300', className)}>
    {children}
  </div>
);

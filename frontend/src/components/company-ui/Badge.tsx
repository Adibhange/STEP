import React from 'react';
import { cn } from '@/lib/utils/cn';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'muted';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'info',
  children,
  className,
}) => {
  const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-tight';

  const variants = {
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
    danger: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
    info: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800',
    muted: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
  };

  return (
    <span className={cn(base, variants[variant], className)}>
      {children}
    </span>
  );
};

export const StatusBadge = Badge;

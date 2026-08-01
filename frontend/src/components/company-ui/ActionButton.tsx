'use client';

import React from 'react';
import { Loader2, Plus, Pencil, Trash2, Save, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'success'
  | 'edit'
  | 'delete'
  | 'outline';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ElementType;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'sm',
  icon: Icon,
  iconPosition = 'left',
  isLoading = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white focus:ring-[#2563EB] shadow-xs',
    secondary: 'bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600',
    ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300',
    danger: 'bg-[#EF4444] hover:bg-red-600 text-white focus:ring-[#EF4444]',
    success: 'bg-[#22C55E] hover:bg-emerald-600 text-white focus:ring-[#22C55E]',
    edit: 'bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-500',
    delete: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-600',
    outline: 'border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200',
  };

  const sizes: Record<ButtonSize, string> = {
    xs: 'px-2 py-0.5 text-[11px] gap-1 h-6',
    sm: 'px-2.5 py-1 text-xs gap-1.5 h-7.5',
    md: 'px-3.5 py-1.5 text-xs gap-2 h-8.5',
    lg: 'px-4 py-2 text-sm gap-2 h-10',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        Icon && iconPosition === 'left' && <Icon className="w-3.5 h-3.5 shrink-0" />
      )}
      {children}
      {!isLoading && Icon && iconPosition === 'right' && <Icon className="w-3.5 h-3.5 shrink-0" />}
    </button>
  );
};

export const ActionButton = Button;

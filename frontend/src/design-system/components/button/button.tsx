import React from 'react';
import type { ButtonProps } from './button.types';
import { Icon } from '../../icon';

/**
 * STEP Enterprise Button Primitive
 * 
 * Production-ready action trigger component enforcing locked API standards:
 * Support for 5 variants, 3 heights, dual-ring focus outline, tactile active press,
 * loading state with width preservation, and left/right icon slots.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      leftSlot,
      rightSlot,
      fullWidth = false,
      children,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    // Base Styles
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-sm select-none transition-all duration-fast focus-ring-step cursor-pointer active:scale-[0.98] disabled:pointer-events-none disabled:opacity-disabled';

    // Variant Styles
    const variantStyles: Record<string, string> = {
      primary: 'bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] border border-transparent shadow-sm',
      secondary: 'bg-[var(--surface-subtle)] text-[var(--text-primary)] hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)]',
      ghost: 'bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] border border-transparent',
      outline: 'bg-transparent text-[var(--text-primary)] border border-[var(--border-strong)] hover:bg-[var(--surface-subtle)]',
      destructive: 'bg-[var(--status-danger)] text-white hover:opacity-90 border border-transparent shadow-sm',
    };

    // Height & Padding Styles
    const sizeStyles: Record<string, string> = {
      sm: 'h-[var(--button-height-sm)] px-xs text-[length:var(--type-label-size)] gap-3xs',
      md: 'h-[var(--button-height-md)] px-sm text-[length:var(--type-body-md-size)] gap-2xs',
      lg: 'h-[var(--button-height-lg)] px-md text-[length:var(--type-body-lg-size)] gap-xs',
    };

    const widthStyle = fullWidth ? 'w-full' : 'w-auto';

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
        {...props}
      >
        {loading ? (
          <Icon name="spinner" size={size === 'sm' ? 'xs' : 'sm'} className="animate-spin" />
        ) : (
          leftSlot
        )}
        {children && <span>{children}</span>}
        {!loading && rightSlot}
      </button>
    );
  }
);

Button.displayName = 'Button';

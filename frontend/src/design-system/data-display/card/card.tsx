import React from 'react';
import type { CardProps } from './card.types';

/**
 * Card Surface Primitive Component
 * 
 * Container surface supporting base, subtle, elevated, and glassmorphic variants
 * with optional hover tilt and glow interactions.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'base', interactive = false, children, className = '', ...props }, ref) => {
    const variantStyles: Record<string, string> = {
      base: 'bg-[var(--surface-base)] border border-[var(--border-subtle)] shadow-sm',
      subtle: 'bg-[var(--surface-subtle)] border border-[var(--border-subtle)]',
      elevated: 'bg-[var(--surface-elevated)] border border-[var(--border-strong)] shadow-md',
      glass: 'bg-[var(--surface-base)]/80 backdrop-blur-md border border-[var(--border-subtle)]/80 shadow-lg',
    };

    const interactiveStyles = interactive
      ? 'transition-all duration-standard hover:-translate-y-3xs hover:shadow-md hover:border-[var(--border-strong)] cursor-pointer'
      : '';

    return (
      <div
        ref={ref}
        className={`rounded-md p-md text-[var(--text-primary)] ${variantStyles[variant]} ${interactiveStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

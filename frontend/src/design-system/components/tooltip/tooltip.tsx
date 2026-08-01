'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type { TooltipProps as LegacyTooltipProps } from './tooltip.types';

const TooltipProvider = TooltipPrimitive.Provider;

const TooltipRoot = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className = '', sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={`z-[var(--z-tooltip)] overflow-hidden rounded-[var(--radius-sm)] bg-[var(--surface-2)] px-xs py-3xs text-[length:var(--type-caption-size)] font-medium text-[var(--text-primary)] border border-[var(--border-default)] shadow-[var(--shadow-md)] animate-fade-in ${className}`}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

/**
 * Tooltip Component
 * Supports both compound component usage AND backwards-compatible simple prop usage:
 * `<Tooltip content="Hint" position="top"><button>Hover</button></Tooltip>`
 */
export interface ExtendedTooltipProps extends Partial<LegacyTooltipProps> {
  children: React.ReactNode;
}

export const Tooltip: React.FC<ExtendedTooltipProps> = ({
  content,
  position = 'top',
  delayMs = 300,
  children,
  className = '',
}) => {
  // If content is provided, render backwards-compatible wrapper
  if (content !== undefined) {
    return (
      <TooltipProvider delayDuration={delayMs}>
        <TooltipRoot>
          <TooltipTrigger asChild>{children}</TooltipTrigger>
          <TooltipContent side={position} className={className}>
            {content}
          </TooltipContent>
        </TooltipRoot>
      </TooltipProvider>
    );
  }

  // Otherwise act as Root for compound usage
  return <TooltipRoot>{children}</TooltipRoot>;
};

export { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent };

import React from 'react';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  /** Tooltip text content */
  content: React.ReactNode;
  /** Spatial alignment position. Default: 'top' */
  position?: TooltipPosition;
  /** Hover entrance delay in ms. Default: 300ms */
  delayMs?: number;
  /** Target element wrapped by tooltip */
  children: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
}

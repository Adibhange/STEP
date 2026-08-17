import React from 'react';
import type { SkeletonProps } from './skeleton.types';

/**
 * Skeleton Primitive Component
 * 
 * Shimmer pulse placeholder loader for text lines, avatars, cards, and data table rows.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  style,
  ...props
}) => {
  const variantStyles: Record<string, string> = {
    text: 'h-[1rem] w-full rounded-md',
    circular: 'rounded-full shrink-0',
    rectangular: 'w-full h-[3rem] rounded-lg',
  };

  return (
    <div
      role="status"
      aria-label="Loading..."
      className={`animate-pulse bg-[var(--surface-3)] border border-[var(--border-default)]/60 ${variantStyles[variant]} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      {...props}
    />
  );
};

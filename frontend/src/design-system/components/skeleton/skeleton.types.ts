import React from 'react';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Skeleton geometry variant: 'text', 'circular', 'rectangular'. Default: 'text' */
  variant?: SkeletonVariant;
  /** Explicit width string or number */
  width?: string | number;
  /** Explicit height string or number */
  height?: string | number;
}

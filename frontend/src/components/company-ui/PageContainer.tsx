import React from 'react';
import { cn } from '@/lib/utils/cn';

export const PageContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('p-4 space-y-4 max-w-full overflow-x-hidden', className)}>
    {children}
  </div>
);

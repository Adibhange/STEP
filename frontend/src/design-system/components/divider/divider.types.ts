import React from 'react';

export type DividerOrientation = 'horizontal' | 'vertical';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Orientation of the divider line. Default: 'horizontal' */
  orientation?: DividerOrientation;
  /** Divider line intensity. Default: 'subtle' */
  variant?: 'subtle' | 'strong';
  /** Optional inline label for horizontal dividers */
  label?: string;
}

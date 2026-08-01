import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual surface variant. Default: 'base' */
  variant?: 'base' | 'subtle' | 'elevated' | 'glass';
  /** Hover glow tilt animation effect */
  interactive?: boolean;
}

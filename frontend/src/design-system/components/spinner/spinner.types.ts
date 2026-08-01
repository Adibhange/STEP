import React from 'react';
import type { IconSizeKey, IconColorToken } from '../../icon';

export interface SpinnerProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'size'> {
  /** Size token key: 'xs', 'sm', 'md', 'lg', 'xl'. Default: 'md' (18px) */
  size?: IconSizeKey;
  /** Semantic color token. Default: 'currentColor' */
  colorToken?: IconColorToken;
  /** Accessibility label. Default: 'Loading...' */
  ariaLabel?: string;
}

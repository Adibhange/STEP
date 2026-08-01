import React from 'react';
import type { SpinnerProps } from './spinner.types';
import { Icon } from '../../icon';

/**
 * Spinner Primitive Component
 * 
 * Inline SVG loading indicator using tokenized sizes and semantic colors.
 */
export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  colorToken = 'currentColor',
  ariaLabel = 'Loading...',
  className = '',
  ...props
}) => {
  return (
    <span className={`inline-flex items-center justify-center ${className}`} {...props}>
      <Icon
        name="spinner"
        size={size}
        colorToken={colorToken}
        ariaLabel={ariaLabel}
        decorative={false}
        className="animate-spin"
      />
    </span>
  );
};

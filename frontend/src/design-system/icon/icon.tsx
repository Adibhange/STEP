import React from 'react';
import { iconRegistry } from './icon-registry';
import { ICON_SIZES, ICON_STROKES, type IconProps } from './icon.types';

const COLOR_MAP: Record<string, string> = {
  currentColor: 'currentColor',
  primary: 'var(--brand-primary)',
  secondary: 'var(--text-secondary)',
  muted: 'var(--text-muted)',
  success: 'var(--status-success)',
  warning: 'var(--status-warning)',
  danger: 'var(--status-danger)',
  info: 'var(--status-info)',
};

/**
 * Universal Icon Component Primitive
 * 
 * Single point of icon rendering for STEP Enterprise Platform.
 * Uses tokenized size keys ('xs' to 'xl') and standardized stroke widths.
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 'lg',
  strokeWidth = 'default',
  colorToken = 'currentColor',
  decorative = true,
  ariaLabel,
  className = '',
  style,
  ...restProps
}) => {
  const IconComponent = iconRegistry[name];

  if (!IconComponent) {
    return null;
  }

  // Resolve numerical size from token key or number
  const numericSize = typeof size === 'number' ? size : ICON_SIZES[size] || 20;

  // Resolve numerical stroke width from token key or number
  const numericStroke = typeof strokeWidth === 'number' ? strokeWidth : ICON_STROKES[strokeWidth] || 1.75;

  // Resolve CSS color string from token
  const resolvedColor = COLOR_MAP[colorToken] || 'currentColor';

  const isDecorative = decorative && !ariaLabel;

  return (
    <IconComponent
      size={numericSize}
      strokeWidth={numericStroke}
      aria-label={ariaLabel}
      aria-hidden={isDecorative}
      role={ariaLabel ? 'img' : undefined}
      className={`inline-block shrink-0 align-middle transition-colors duration-fast ${className}`}
      style={{
        color: resolvedColor,
        width: `${numericSize}px`,
        height: `${numericSize}px`,
        ...style,
      }}
      {...restProps}
    />
  );
};

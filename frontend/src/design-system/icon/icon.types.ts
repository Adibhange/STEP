import React from 'react';
import type { IconName } from './icon-registry';

/** Tokenized Icon Size Scale */
export const ICON_SIZES = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 20,
  xl: 24,
} as const;

export type IconSizeKey = keyof typeof ICON_SIZES;

/** Standardized Stroke Width Token Scale */
export const ICON_STROKES = {
  dense: 1.5,
  default: 1.75,
  hero: 2.0,
} as const;

export type IconStrokeKey = keyof typeof ICON_STROKES;

/** Semantic Color Token Identifiers */
export type IconColorToken =
  | 'currentColor'
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export interface IconProps {
  /** Name of the icon registered in the Icon Registry */
  name: IconName;
  /** Tokenized icon size: 'xs' (14px), 'sm' (16px), 'md' (18px), 'lg' (20px), 'xl' (24px). Default: 'lg' (20px) */
  size?: IconSizeKey | number;
  /** Standardized stroke width: 'dense' (1.5), 'default' (1.75), 'hero' (2.0). Default: 'default' */
  strokeWidth?: IconStrokeKey | number;
  /** Semantic color token or 'currentColor' */
  colorToken?: IconColorToken;
  /** Marks icon as purely decorative (sets aria-hidden="true") */
  decorative?: boolean;
  /** Accessible label description when not decorative */
  ariaLabel?: string;
  /** Additional CSS class names */
  className?: string;
  /** Inline element styles */
  style?: React.CSSProperties;
  /** Mouse click event handler */
  onClick?: React.MouseEventHandler<SVGSVGElement>;
}

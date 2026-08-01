import React, { useState } from 'react';
import type { AvatarProps } from './avatar.types';

function getInitials(name?: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Avatar Primitive Component
 * 
 * User and entity graphic avatar with automatic initials fallback generator
 * and status dot indicator.
 */
export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  statusDot,
  className = '',
  ...props
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeStyles: Record<string, { box: string; font: string; dot: string }> = {
    sm: { box: 'w-[24px] h-[24px]', font: 'text-[length:var(--type-label-size)]', dot: 'w-[6px] h-[6px]' },
    md: { box: 'w-[32px] h-[32px]', font: 'text-[length:var(--type-caption-size)]', dot: 'w-[8px] h-[8px]' },
    lg: { box: 'w-[40px] h-[40px]', font: 'text-[length:var(--type-body-md-size)]', dot: 'w-[10px] h-[10px]' },
  };

  const statusColors: Record<string, string> = {
    success: 'bg-[var(--status-success)]',
    warning: 'bg-[var(--status-warning)]',
    danger: 'bg-[var(--status-danger)]',
    offline: 'bg-[var(--text-muted)]',
  };

  const activeSize = sizeStyles[size] || sizeStyles.md;
  const initials = getInitials(name);

  return (
    <div className={`relative inline-block shrink-0 select-none ${activeSize.box} ${className}`} {...props}>
      <div className={`w-full h-full rounded-full flex items-center justify-center font-semibold overflow-hidden bg-[var(--surface-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)] ${activeSize.font}`}>
        {src && !imageError ? (
          <img
            src={src}
            alt={name || 'Avatar'}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {statusDot && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-2 ring-[var(--surface-base)] ${activeSize.dot} ${statusColors[statusDot]}`}
        />
      )}
    </div>
  );
};

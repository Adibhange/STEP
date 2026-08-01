'use client';

import React, { useEffect } from 'react';
import { Icon } from '@/registry/icons';
import { Button } from '@/ui/button/Button';

export interface EntityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  width?: 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const EntityDrawer: React.FC<EntityDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  actions,
  children,
  width = 'xl',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-3xl',
    '2xl': 'max-w-5xl',
    full: 'max-w-full',
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-[var(--bg-overlay)] backdrop-blur-xs animate-fade-in"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div
        className={`relative w-full ${widthClasses[width]} bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xl flex flex-col z-10 animate-slide-in-right border-l border-[var(--border-subtle)]`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-hover)]">
          <div className="flex items-center gap-2.5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h2>
                {badge}
              </div>
              {subtitle && <p className="text-[11px] text-[var(--text-muted)]">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {actions}
            <Button variant="ghost" size="xs" onClick={onClose}>
              <Icon name="X" size={16} />
            </Button>
          </div>
        </div>

        {/* Drawer Body Content */}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
};

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/design-system';

export interface ActionMenuItem {
  id: string;
  label: string;
  icon: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
  dividerBefore?: boolean;
}

interface ActionMenuProps {
  primaryActions: {
    id: string;
    label: string;
    icon: string;
    onClick: () => void;
    variant?: 'default' | 'primary';
  }[];
  menuItems: ActionMenuItem[];
  ariaLabel?: string;
}

/**
 * STEP Enterprise ActionMenu
 *
 * Micro-interactions:
 * - Action buttons: 120ms opacity fade & scale on hover
 * - Dropdown popover: Framer motion fade (0 -> 1) + scale (98% -> 100%) (150ms easeOut)
 */
export const ActionMenu: React.FC<ActionMenuProps> = ({
  primaryActions,
  menuItems,
  ariaLabel = 'Row actions',
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  return (
    <div
      className="flex items-center gap-[var(--space-3xs)] justify-end"
      role="group"
      aria-label={ariaLabel}
    >
      {/* Primary action buttons — fade & scale on hover */}
      {primaryActions.map((action) => (
        <button
          key={action.id}
          type="button"
          onClick={action.onClick}
          aria-label={action.label}
          title={action.label}
          className={`w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-tertiary)]
            hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] hover:scale-105 active:scale-95
            transition-all duration-150 focus-ring-step cursor-pointer
            ${action.variant === 'primary' ? 'hover:text-[var(--accent-indigo)] hover:bg-[var(--accent-indigo-dim)]' : ''}`}
        >
          <Icon name={action.icon as any} size="xs" />
        </button>
      ))}

      {/* ⋯ More dropdown */}
      {menuItems.length > 0 && (
        <div className="relative" ref={menuRef} onKeyDown={handleKeyDown}>
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label="More actions"
            aria-expanded={open}
            aria-haspopup="menu"
            className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-tertiary)]
              hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] hover:scale-105 active:scale-95
              transition-all duration-150 focus-ring-step cursor-pointer"
          >
            <Icon name="more-horizontal" size="xs" />
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 4 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 bottom-full mb-1.5 w-44 bg-[var(--surface-1)] border border-[var(--border-default)]
                  rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] z-40 py-1 overflow-hidden origin-bottom-right"
                role="menu"
                aria-label="More actions"
              >
                {menuItems.map((item) => (
                  <React.Fragment key={item.id}>
                    {item.dividerBefore && (
                      <div className="my-1 border-t border-[var(--border-soft)]" role="separator" />
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => { item.onClick(); setOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left cursor-pointer
                        transition-colors duration-150 font-medium
                        ${item.variant === 'danger'
                          ? 'text-[var(--status-danger-text)] hover:bg-[var(--status-danger-bg)]'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                        }`}
                    >
                      <Icon name={item.icon as any} size="xs" />
                      {item.label}
                    </button>
                  </React.Fragment>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

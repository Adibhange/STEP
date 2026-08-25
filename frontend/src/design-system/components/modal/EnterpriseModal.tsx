'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon, type IconName } from '../../icon';
import {
  elasticDialogVariant,
  dialogBackdropVariant,
  dialogContentBlossomVariant,
} from '../../motion';

export type EnterpriseModalMaxWidth =
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | 'full';

const MAX_WIDTH_MAP: Record<EnterpriseModalMaxWidth, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-xl',
  xl: 'max-w-2xl',
  '2xl': 'max-w-3xl',
  '3xl': 'max-w-4xl',
  '4xl': 'max-w-5xl',
  '5xl': 'max-w-6xl',
  full: 'max-w-[95vw]',
};

export interface EnterpriseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: IconName;
  iconColorClass?: string;
  iconBgClass?: string;
  maxWidth?: EnterpriseModalMaxWidth;
  children: React.ReactNode;
  footer?: React.ReactNode;
  hideFooter?: boolean;
  submitText?: string;
  cancelText?: string;
  onSubmit?: (e: React.SyntheticEvent<HTMLFormElement>) => void;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
  isDestructive?: boolean;
  headerAction?: React.ReactNode;
  bodyClassName?: string;
  containerClassName?: string;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
}

export const EnterpriseModal: React.FC<EnterpriseModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  iconColorClass = 'text-[var(--accent-indigo)]',
  iconBgClass = 'bg-[var(--accent-indigo-dim)] border-[var(--accent-indigo)]/30',
  maxWidth = 'xl',
  children,
  footer,
  hideFooter = false,
  submitText,
  cancelText = 'Cancel',
  onSubmit,
  isSubmitting = false,
  submitDisabled = false,
  isDestructive = false,
  headerAction,
  bodyClassName = '',
  containerClassName = '',
  closeOnBackdropClick = true,
  closeOnEscape = true,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ESC key handler
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, closeOnEscape]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const widthClass = MAX_WIDTH_MAP[maxWidth] || MAX_WIDTH_MAP.xl;

  const content = (
    <>
      {/* Responsive Enterprise Header */}
      <motion.div
        variants={dialogContentBlossomVariant}
        initial="hidden"
        animate="show"
        className="flex items-center justify-between p-3.5 sm:px-6 sm:py-4 border-b border-[var(--border-default)] bg-[var(--surface-2)] shrink-0 gap-2"
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {icon && (
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center shadow-2xs shrink-0 ${iconBgClass} ${iconColorClass}`}
            >
              <Icon name={icon} size="sm" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h2 className="text-xs sm:text-base font-extrabold text-[var(--text-primary)] font-heading leading-tight truncate">
                {title}
              </h2>
            </div>
            {subtitle && (
              <p className="text-[10.5px] sm:text-xs text-[var(--text-tertiary)] mt-0.5 truncate sm:whitespace-normal">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {headerAction}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-all cursor-pointer shrink-0"
          >
            <Icon name="x" size="xs" />
          </button>
        </div>
      </motion.div>

      {/* Modal Body */}
      <div
        className={`p-3.5 sm:p-6 overflow-y-auto space-y-3.5 sm:space-y-4 text-[var(--text-primary)] flex-1 min-h-0 scrollbar-thin ${bodyClassName}`}
      >
        {children}
      </div>

      {/* Standardized Enterprise Footer */}
      {!hideFooter && (
        <div className="p-3.5 sm:px-6 sm:py-4 border-t border-[var(--border-default)] bg-[var(--surface-2)] flex items-center justify-end gap-2.5 sm:gap-3 shrink-0">
          {footer ? (
            footer
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="h-9 sm:h-10 px-4 sm:px-5 rounded-xl text-xs font-bold bg-[var(--surface-1)] text-[var(--text-secondary)] border border-[var(--border-default)] shadow-2xs hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-all cursor-pointer disabled:opacity-50 select-none"
              >
                {cancelText}
              </button>
              {submitText && (
                <button
                  type={onSubmit ? 'submit' : 'button'}
                  onClick={onSubmit ? (e) => onSubmit(e as any) : undefined}
                  disabled={submitDisabled || isSubmitting}
                  className={`h-9 sm:h-10 px-4 sm:px-5 rounded-xl text-xs font-bold shadow-[var(--shadow-xs)] flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none disabled:opacity-50 active:scale-95 ${
                    isDestructive
                      ? 'bg-[var(--accent-red)] hover:bg-[var(--accent-red-hover)] text-white'
                      : 'bg-[var(--accent-indigo)] hover:bg-[var(--accent-indigo-hover)] text-white'
                  }`}
                >
                  {isSubmitting && <Icon name="loader" size="xs" className="animate-spin" />}
                  <span>{submitText}</span>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </>
  );

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto">
          {/* Fullscreen Theme-Aware Backdrop */}
          <motion.div
            key="backdrop"
            variants={dialogBackdropVariant}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={closeOnBackdropClick ? onClose : undefined}
            className="fixed inset-0 bg-[var(--overlay)] backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Modal Window with Elastic Blooming Spring */}
          <motion.div
            key="modal"
            variants={elasticDialogVariant}
            initial="hidden"
            animate="show"
            exit="exit"
            style={{ transformOrigin: '50% 40%' }}
            className={`relative w-full ${widthClass} bg-[var(--surface-1)] border border-[var(--border-default)] rounded-2xl shadow-[var(--shadow-2xl)] overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] z-10 my-auto ${containerClassName}`}
            onClick={(e) => e.stopPropagation()}
          >
            {onSubmit ? (
              <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0">
                {content}
              </form>
            ) : (
              content
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

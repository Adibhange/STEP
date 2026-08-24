'use client';

import React from 'react';
import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner';
import { Icon } from '../../icon';
import type { ToastOptions, ToastContextType } from './toast.types';
import '@/styles/toast.css';

/**
 * Normalizes arguments to support both:
 * 1. toast.success('Title', 'Description')
 * 2. toast.success('Title', { description: 'Description', duration: 4000 })
 */
function normalizeArgs(
  descriptionOrOptions?: React.ReactNode | ToastOptions,
  options?: ToastOptions
): ToastOptions {
  if (
    descriptionOrOptions !== undefined &&
    (typeof descriptionOrOptions === 'string' ||
      React.isValidElement(descriptionOrOptions) ||
      typeof descriptionOrOptions === 'number')
  ) {
    return {
      description: descriptionOrOptions,
      ...options,
    };
  }
  return (descriptionOrOptions as ToastOptions) || options || {};
}

/**
 * STEP Toast API Surface
 *
 * Wraps Sonner as an internal implementation detail while exposing
 * a clean, stable STEP API surface.
 */
export const toast: ToastContextType = {
  success: (title, descriptionOrOptions, options) => {
    const opts = normalizeArgs(descriptionOrOptions, options);
    return sonnerToast.success(title as string, {
      icon: <Icon name="check-circle" size="sm" className="text-[var(--status-success)]" />,
      ...opts,
    });
  },

  error: (title, descriptionOrOptions, options) => {
    const opts = normalizeArgs(descriptionOrOptions, options);
    return sonnerToast.error(title as string, {
      icon: <Icon name="alert-triangle" size="sm" className="text-[var(--status-danger)]" />,
      ...opts,
    });
  },

  warning: (title, descriptionOrOptions, options) => {
    const opts = normalizeArgs(descriptionOrOptions, options);
    return sonnerToast.warning(title as string, {
      icon: <Icon name="alert-triangle" size="sm" className="text-[var(--status-warning)]" />,
      ...opts,
    });
  },

  info: (title, descriptionOrOptions, options) => {
    const opts = normalizeArgs(descriptionOrOptions, options);
    return sonnerToast.info(title as string, {
      icon: <Icon name="info" size="sm" className="text-[var(--status-info)]" />,
      ...opts,
    });
  },

  loading: (title, descriptionOrOptions, options) => {
    const opts = normalizeArgs(descriptionOrOptions, options);
    return sonnerToast.loading(title as string, {
      icon: <Icon name="loader" size="sm" className="animate-spin text-[var(--accent-indigo)]" />,
      ...opts,
    });
  },

  promise: sonnerToast.promise,

  dismiss: (id) => {
    sonnerToast.dismiss(id);
  },
};

/**
 * Hook for consuming the toast API inside React components.
 */
export const useToast = (): ToastContextType => {
  return toast;
};

/**
 * ToastProvider Component
 * Renders the Sonner Toaster restyled with STEP Design Tokens.
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <SonnerToaster
        position="top-right"
        expand={false}
        richColors={false}
        closeButton={true}
        duration={5000}
        visibleToasts={5}
        toastOptions={{
          style: {
            background: 'var(--surface-1, #0f1118)',
            border: '1px solid var(--border-default, rgba(255, 255, 255, 0.08))',
            borderRadius: 'var(--radius-lg, 10px)',
            color: 'var(--text-primary, rgba(255, 255, 255, 0.92))',
          },
        }}
      />
    </>
  );
};

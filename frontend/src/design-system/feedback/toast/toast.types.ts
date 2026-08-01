import React from 'react';
import type { ExternalToast, toast as sonnerToast } from 'sonner';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'loading';

export type ToastOptions = ExternalToast;

export interface ToastContextType {
  success: (title: React.ReactNode, descriptionOrOptions?: React.ReactNode | ToastOptions, options?: ToastOptions) => string | number;
  error: (title: React.ReactNode, descriptionOrOptions?: React.ReactNode | ToastOptions, options?: ToastOptions) => string | number;
  warning: (title: React.ReactNode, descriptionOrOptions?: React.ReactNode | ToastOptions, options?: ToastOptions) => string | number;
  info: (title: React.ReactNode, descriptionOrOptions?: React.ReactNode | ToastOptions, options?: ToastOptions) => string | number;
  loading: (title: React.ReactNode, descriptionOrOptions?: React.ReactNode | ToastOptions, options?: ToastOptions) => string | number;
  promise: typeof sonnerToast.promise;
  dismiss: (id?: string | number) => void;
}

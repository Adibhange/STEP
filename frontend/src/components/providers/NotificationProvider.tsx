'use client';

import React, { useEffect, useRef } from 'react';
import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  selectNotificationQueue,
  remove,
} from '@/store/ui/notificationSlice';
import type { NotificationItem } from '@/store/ui/notification.types';
import { Icon } from '@/design-system';
import '@/styles/toast.css';

/**
 * Global Notification Provider & Redux Listener
 *
 * Mounted ONCE in app/layout.tsx.
 * Listens to the Redux Notification Slice queue and delegates rendering to Sonner.
 * Sonner serves purely as the rendering engine — Redux owns all state.
 */
export const NotificationProvider: React.FC = () => {
  const dispatch = useAppDispatch();
  const queue = useAppSelector(selectNotificationQueue);
  const processedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!queue || queue.length === 0) return;

    // Process each item in the queue
    queue.forEach((item: NotificationItem) => {
      if (processedIds.current.has(item.id)) return;
      processedIds.current.add(item.id);

      // Icon determination based on STEP Icon abstraction
      let iconNode: React.ReactNode = null;
      if (item.variant === 'success') {
        iconNode = <Icon name="check-circle" size="sm" className="text-[var(--status-success)]" />;
      } else if (item.variant === 'error') {
        iconNode = <Icon name="alert-triangle" size="sm" className="text-[var(--status-danger)]" />;
      } else if (item.variant === 'warning') {
        iconNode = <Icon name="alert-triangle" size="sm" className="text-[var(--status-warning)]" />;
      } else if (item.variant === 'info') {
        iconNode = <Icon name="info" size="sm" className="text-[var(--status-info)]" />;
      } else if (item.variant === 'loading') {
        iconNode = <Icon name="loader" size="sm" className="animate-spin text-[var(--accent-indigo)]" />;
      }

      // Delegate rendering to Sonner
      const toastFn = sonnerToast[item.variant] || sonnerToast;
      toastFn(item.title, {
        id: item.id,
        description: item.description,
        duration: item.persistent ? Infinity : item.duration,
        icon: iconNode,
        action: item.action
          ? {
              label: item.action.label,
              onClick: () => item.action?.onClick?.(),
            }
          : undefined,
        cancel: item.undoAction
          ? {
              label: item.undoAction.label,
              onClick: () => item.undoAction?.onClick?.(),
            }
          : undefined,
        onDismiss: () => {
          processedIds.current.delete(item.id);
        },
        onAutoClose: () => {
          processedIds.current.delete(item.id);
        },
      });

      // Remove from Redux queue after handoff to Sonner renderer
      dispatch(remove(item.id));
    });
  }, [queue, dispatch]);

  return (
    <SonnerToaster
      position="top-right"
      expand={true}
      richColors={false}
      closeButton={true}
      duration={4000}
      visibleToasts={4}
    />
  );
};

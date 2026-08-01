import React from 'react';

/**
 * Supported notification variants
 */
export type NotificationVariant = 'success' | 'error' | 'warning' | 'info' | 'loading';

/**
 * Interactive button configuration on notifications (retry, undo, custom actions)
 */
export interface NotificationAction {
  label: React.ReactNode;
  actionType?: string;
  payload?: unknown;
  onClick?: () => void;
}

/**
 * Redux Notification Item
 */
export interface NotificationItem {
  id: string;
  variant: NotificationVariant;
  title: string;
  description?: string;
  duration?: number; // Duration in ms. 0 or undefined means persistent / auto-close disabled
  persistent?: boolean;
  action?: NotificationAction;
  undoAction?: NotificationAction;
  dismissed?: boolean;
  createdAt: number;
}

/**
 * Redux Notification State
 */
export interface NotificationState {
  queue: NotificationItem[];
  history: NotificationItem[];
  maxVisible: number;
  paused: boolean;
}

/**
 * Payload for enqueueing a notification
 */
export interface EnqueueNotificationPayload {
  id?: string;
  variant: NotificationVariant;
  title: string;
  description?: string;
  duration?: number;
  persistent?: boolean;
  action?: NotificationAction;
  undoAction?: NotificationAction;
}

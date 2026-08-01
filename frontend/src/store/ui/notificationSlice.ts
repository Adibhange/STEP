import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  NotificationState,
  NotificationItem,
  EnqueueNotificationPayload,
  NotificationVariant,
} from './notification.types';
import { DEFAULT_NOTIFICATION_DURATIONS } from './notification.constants';

const initialState: NotificationState = {
  queue: [],
  history: [],
  maxVisible: 5,
  paused: false,
};

let counter = 0;
function generateNotificationId(): string {
  counter += 1;
  return `notify-${Date.now()}-${counter}-${Math.random().toString(36).substring(2, 6)}`;
}

export const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    enqueue: (state, action: PayloadAction<EnqueueNotificationPayload>) => {
      const now = Date.now();
      const id = action.payload.id || generateNotificationId();

      // Deduplicate identical title + variant within 800ms
      const isDuplicate = state.queue.some(
        (item) =>
          item.title === action.payload.title &&
          item.variant === action.payload.variant &&
          now - item.createdAt < 800
      );

      if (isDuplicate) return;

      const duration =
        action.payload.duration !== undefined
          ? action.payload.duration
          : DEFAULT_NOTIFICATION_DURATIONS[action.payload.variant];

      const newItem: NotificationItem = {
        id,
        variant: action.payload.variant,
        title: action.payload.title,
        description: action.payload.description,
        duration,
        persistent: action.payload.persistent || duration === 0,
        action: action.payload.action,
        undoAction: action.payload.undoAction,
        createdAt: now,
      };

      state.queue.push(newItem);
      state.history.push(newItem);
      if (state.history.length > 50) {
        state.history.shift();
      }
    },

    remove: (state, action: PayloadAction<string>) => {
      state.queue = state.queue.filter((item) => item.id !== action.payload);
    },

    clear: (state) => {
      state.queue = [];
    },

    update: (
      state,
      action: PayloadAction<{ id: string; patch: Partial<Omit<NotificationItem, 'id'>> }>
    ) => {
      const item = state.queue.find((i) => i.id === action.payload.id);
      if (item) {
        Object.assign(item, action.payload.patch);
      }
    },

    setPaused: (state, action: PayloadAction<boolean>) => {
      state.paused = action.payload;
    },
  },
});

export const { enqueue, remove, clear, update, setPaused } = notificationSlice.actions;

// ── Action Creator Helper Wrappers ────────────────────────────────────────────

export const notifySuccess = (
  payload: Omit<EnqueueNotificationPayload, 'variant'> | string,
  description?: string
) => {
  if (typeof payload === 'string') {
    return enqueue({ variant: 'success', title: payload, description });
  }
  return enqueue({ variant: 'success', ...payload });
};

export const notifyError = (
  payload: Omit<EnqueueNotificationPayload, 'variant'> | string,
  description?: string
) => {
  if (typeof payload === 'string') {
    return enqueue({ variant: 'error', title: payload, description });
  }
  return enqueue({ variant: 'error', ...payload });
};

export const notifyWarning = (
  payload: Omit<EnqueueNotificationPayload, 'variant'> | string,
  description?: string
) => {
  if (typeof payload === 'string') {
    return enqueue({ variant: 'warning', title: payload, description });
  }
  return enqueue({ variant: 'warning', ...payload });
};

export const notifyInfo = (
  payload: Omit<EnqueueNotificationPayload, 'variant'> | string,
  description?: string
) => {
  if (typeof payload === 'string') {
    return enqueue({ variant: 'info', title: payload, description });
  }
  return enqueue({ variant: 'info', ...payload });
};

export const notifyLoading = (
  payload: Omit<EnqueueNotificationPayload, 'variant'> | string,
  description?: string
) => {
  if (typeof payload === 'string') {
    return enqueue({ variant: 'loading', title: payload, description, duration: 0 });
  }
  return enqueue({ variant: 'loading', duration: 0, ...payload });
};

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectNotificationQueue = (state: { notification: NotificationState }) =>
  state.notification.queue;

export const selectNotificationHistory = (state: { notification: NotificationState }) =>
  state.notification.history;

export default notificationSlice.reducer;

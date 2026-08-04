import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { baseApi } from './baseApi';
import { stepApi } from './services/api';
import notificationReducer from './ui/notificationSlice';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    [stepApi.reducerPath]: stepApi.reducer,
    notification: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore React components, functions, or RTK Query baseQueryMeta (Request/Response objects) in actions
        ignoredActionPaths: [
          'payload.action.label',
          'payload.action.onClick',
          'payload.undoAction.label',
          'payload.undoAction.onClick',
          'meta.baseQueryMeta.request',
          'meta.baseQueryMeta.response',
          'meta.baseQueryMeta',
        ],
        ignoredPaths: ['notification.queue', 'notification.history'],
      },
    }).concat(baseApi.middleware, stepApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export * from './ui/notificationSlice';
export * from './ui/notification.types';
export * from './ui/notification.constants';
export * from './ui/notification.utils';

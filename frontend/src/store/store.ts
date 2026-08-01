import { configureStore } from '@reduxjs/toolkit';
import { ermsApi } from './services/api';

export const store = configureStore({
  reducer: {
    [ermsApi.reducerPath]: ermsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(ermsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

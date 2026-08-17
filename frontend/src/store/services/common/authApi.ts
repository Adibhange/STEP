import { stepApi } from '../baseApi';
import type { ApiEnvelope, AuthResultData } from '../types';

export const authApi = stepApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ApiEnvelope<AuthResultData>, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    directorPinLogin: builder.mutation<ApiEnvelope<AuthResultData>, { pin: string }>({
      query: (data) => ({
        url: '/auth/director-pin-login',
        method: 'POST',
        body: data,
      }),
    }),
    refreshToken: builder.mutation<ApiEnvelope<AuthResultData>, { refreshToken: string }>({
      query: (data) => ({
        url: '/auth/refresh-token',
        method: 'POST',
        body: data,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useDirectorPinLoginMutation,
  useRefreshTokenMutation,
} = authApi;

import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { mockDbService } from '@/mock-data';
import type { ApiEnvelope, AuthResultData } from './types';

export const getApiBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  return envUrl.replace(/\/+$/, '');
};

export const isMockDataEnabled = (): boolean => {
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem('step_use_mock_data');
    if (override !== null) return override === 'true';
  }
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false';
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(),
  prepareHeaders: (headers) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('step_token') : null;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const executeRawQuery = (args: string | FetchArgs, api: any, extraOptions: any) => {
  if (typeof args === 'string') {
    if (args.startsWith('/v2/')) {
      const baseUrl = getApiBaseUrl().replace(/\/api\/v1$/, '/api');
      return fetchBaseQuery({
        baseUrl,
        prepareHeaders: (h) => {
          const token = typeof window !== 'undefined' ? localStorage.getItem('step_token') : null;
          if (token) h.set('authorization', `Bearer ${token}`);
          return h;
        },
      })(args, api, extraOptions);
    }
  } else if (typeof args === 'object' && args.url && args.url.startsWith('/v2/')) {
    const baseUrl = getApiBaseUrl().replace(/\/api\/v1$/, '/api');
    return fetchBaseQuery({
      baseUrl,
      prepareHeaders: (h) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('step_token') : null;
        if (token) h.set('authorization', `Bearer ${token}`);
        return h;
      },
    })(args, api, extraOptions);
  }
  return rawBaseQuery(args, api, extraOptions);
};

export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  // If Mock DB is enabled, dispatch directly to local mock DB
  if (isMockDataEnabled()) {
    const reqObj = typeof args === 'string' ? { url: args } : args;
    const mockRes = await mockDbService.handleRequest(reqObj);
    if (mockRes.error) {
      return { error: mockRes.error as FetchBaseQueryError };
    }
    return { data: mockRes.data };
  }

  let result = await executeRawQuery(args, api, extraOptions);

  // If real backend is unreachable (network error or timeout), gracefully fallback to Mock DB
  if (result.error && (result.error.status === 'FETCH_ERROR' || result.error.status === 'TIMEOUT_ERROR')) {
    console.warn('[STEP API] Backend unreachable, falling back to Local Mock Database.');
    const reqObj = typeof args === 'string' ? { url: args } : args;
    const mockRes = await mockDbService.handleRequest(reqObj);
    if (mockRes.error) {
      return { error: mockRes.error as FetchBaseQueryError };
    }
    return { data: mockRes.data };
  }

  if (result.error && result.error.status === 401) {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('step_refresh_token') : null;
    if (refreshToken) {
      const refreshResult = await rawBaseQuery(
        {
          url: '/auth/refresh-token',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      const responseEnvelope = refreshResult.data as ApiEnvelope<AuthResultData> | undefined;
      if (responseEnvelope && responseEnvelope.success && responseEnvelope.data?.accessToken) {
        const newData = responseEnvelope.data;
        localStorage.setItem('step_token', newData.accessToken);
        if (newData.refreshToken) {
          localStorage.setItem('step_refresh_token', newData.refreshToken);
        }
        if (newData.user) {
          localStorage.setItem('step_email', newData.user.email || '');
          localStorage.setItem('step_role', newData.user.role || '');
          localStorage.setItem('step_name', `${newData.user.firstName || ''} ${newData.user.lastName || ''}`.trim());
          localStorage.setItem('step_emp_code', newData.user.employeeCode || '');
          localStorage.setItem('step_user_id', newData.user.id ? String(newData.user.id) : '');
        }
        // Retry initial request with new token
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        localStorage.removeItem('step_token');
        localStorage.removeItem('step_refresh_token');
        if (
          typeof window !== 'undefined' &&
          window.location.pathname !== '/' &&
          !window.location.pathname.startsWith('/exam') &&
          !window.location.pathname.startsWith('/apply')
        ) {
          window.location.href = '/';
        }
      }
    } else {
      localStorage.removeItem('step_token');
      if (
        typeof window !== 'undefined' &&
        window.location.pathname !== '/' &&
        !window.location.pathname.startsWith('/exam') &&
        !window.location.pathname.startsWith('/apply')
      ) {
        window.location.href = '/';
      }
    }
  }

  return result;
};

export const stepApi = createApi({
  reducerPath: 'stepApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Vacancies',
    'Candidates',
    'Users',
    'MasterData',
    'Exams',
    'Interviews',
    'Offers',
    'Reports',
    'QRCodes',
    'QuestionPapers',
    'QuestionBank',
  ],
  endpoints: () => ({}),
});

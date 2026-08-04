import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * Matches STEP.Application.Common.Models.ApiResponse<T> exactly. ASP.NET Core's default
 * System.Text.Json policy serializes all property names as camelCase — every field here (and in
 * AuthResultData below) MUST be camelCase to match the real wire format, not the PascalCase C#
 * property names. Mismatched casing here fails silently (TS treats missing properties as
 * `undefined`, not a compile error) and previously broke login while still reporting success.
 */
export interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  errors: string[] | null;
  correlationId: string;
}

export interface AuthResultData {
  accessToken: string;
  expiresAtUtc: string;
  refreshToken: string;
  user: {
    id: number;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

export const stepApi = createApi({
  reducerPath: 'stepApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1',
    prepareHeaders: (headers) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('step_token') : null;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Vacancies', 'Candidates', 'Schedules', 'Reports'],
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
    getVacancies: builder.query({
      query: (params) => ({
        url: '/vacancies',
        params,
      }),
      providesTags: ['Vacancies'],
    }),
    createVacancy: builder.mutation({
      query: (data) => ({
        url: '/vacancies',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Vacancies'],
    }),
    getCandidates: builder.query({
      query: (params) => ({
        url: '/candidates',
        params,
      }),
      providesTags: ['Candidates'],
    }),
    registerWalkIn: builder.mutation({
      query: (data) => ({
        url: '/candidates/walkin',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Candidates'],
    }),
    verifyCandidate: builder.mutation({
      query: (id) => ({
        url: `/candidates/${id}/verify`,
        method: 'POST',
      }),
      invalidatesTags: ['Candidates'],
    }),
    getExamSession: builder.query({
      query: (token) => `/exams/session/${token}`,
    }),
    sendHeartbeat: builder.mutation({
      query: (data) => ({
        url: '/exams/heartbeat',
        method: 'POST',
        body: data,
      }),
    }),
    submitExam: builder.mutation({
      query: (data) => ({
        url: '/exams/submit',
        method: 'POST',
        body: data,
      }),
    }),
    getRecruitmentFunnel: builder.query({
      query: () => '/reports/recruitment-funnel',
      providesTags: ['Reports'],
    }),
  }),
});

export const {
  useLoginMutation,
  useDirectorPinLoginMutation,
  useGetVacanciesQuery,
  useCreateVacancyMutation,
  useGetCandidatesQuery,
  useRegisterWalkInMutation,
  useVerifyCandidateMutation,
  useGetExamSessionQuery,
  useSendHeartbeatMutation,
  useSubmitExamMutation,
  useGetRecruitmentFunnelQuery,
} = stepApi;

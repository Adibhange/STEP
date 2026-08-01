import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const ermsApi = createApi({
  reducerPath: 'ermsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api/v1', // default API port
    prepareHeaders: (headers) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('erms_token') : null;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Vacancies', 'Candidates', 'Schedules', 'Reports'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    directorPinLogin: builder.mutation({
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
} = ermsApi;

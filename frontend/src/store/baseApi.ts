import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5125/api/v1',
    prepareHeaders: (headers) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('step_token') : null;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Candidates', 'Vacancies', 'Questions'],
  endpoints: (builder) => ({
    getCandidates: builder.query<any, void>({
      query: () => '/candidates',
      transformResponse: (response: any) => response.data || [],
      providesTags: ['Candidates'],
    }),

    getVacancies: builder.query<any, void>({
      query: () => '/vacancies',
      transformResponse: (response: any) => response.data || [],
      providesTags: ['Vacancies'],
    }),

    getQuestions: builder.query<any, number | void>({
      query: (paperId) => (paperId ? `/questionpapers/${paperId}` : '/questionpapers/1'),
      transformResponse: (response: any) => response.data?.questions || [],
      providesTags: ['Questions'],
    }),
  }),
});

export const { useGetCandidatesQuery, useGetVacanciesQuery, useGetQuestionsQuery } = baseApi;

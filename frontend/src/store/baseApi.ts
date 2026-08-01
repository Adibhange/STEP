import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { mockCandidates } from '@/mock/candidate.mock';
import { mockVacancies } from '@/mock/vacancy.mock';
import { mockQuestions } from '@/mock/question.mock';

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Candidates', 'Vacancies', 'Questions'],
  endpoints: (builder) => ({
    getCandidates: builder.query<typeof mockCandidates, void>({
      async queryFn() {
        // Simulate network latency (150ms)
        await new Promise((res) => setTimeout(res, 150));
        return { data: mockCandidates };
      },
      providesTags: ['Candidates'],
    }),

    getVacancies: builder.query<typeof mockVacancies, void>({
      async queryFn() {
        await new Promise((res) => setTimeout(res, 150));
        return { data: mockVacancies };
      },
      providesTags: ['Vacancies'],
    }),

    getQuestions: builder.query<typeof mockQuestions, void>({
      async queryFn() {
        await new Promise((res) => setTimeout(res, 150));
        return { data: mockQuestions };
      },
      providesTags: ['Questions'],
    }),
  }),
});

export const { useGetCandidatesQuery, useGetVacanciesQuery, useGetQuestionsQuery } = baseApi;

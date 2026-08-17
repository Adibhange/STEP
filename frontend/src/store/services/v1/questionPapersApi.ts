import { stepApi } from '../baseApi';
import type { ApiEnvelope } from '../types';

export const questionPapersApi = stepApi.injectEndpoints({
  endpoints: (builder) => ({
    getQuestionPapers: builder.query<ApiEnvelope<any[]>, void>({
      query: () => '/questionpapers',
      providesTags: ['QuestionPapers'],
    }),
    getQuestionPaperById: builder.query<ApiEnvelope<any>, number>({
      query: (id) => `/questionpapers/${id}`,
      providesTags: (result, error, id) => [{ type: 'QuestionPapers', id }],
    }),
    createQuestionPaper: builder.mutation<ApiEnvelope<any>, Record<string, any>>({
      query: (data) => ({
        url: '/questionpapers',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['QuestionPapers'],
    }),
    publishQuestionPaper: builder.mutation<ApiEnvelope<any>, number>({
      query: (id) => ({
        url: `/questionpapers/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: ['QuestionPapers'],
    }),
    importQuestionPaperExcel: builder.mutation<ApiEnvelope<any>, { id: number; file: File }>({
      query: ({ id, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: `/questionpapers/${id}/import-excel`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'QuestionPapers', id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetQuestionPapersQuery,
  useGetQuestionPaperByIdQuery,
  useCreateQuestionPaperMutation,
  usePublishQuestionPaperMutation,
  useImportQuestionPaperExcelMutation,
} = questionPapersApi;

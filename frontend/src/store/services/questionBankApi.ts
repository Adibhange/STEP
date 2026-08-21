import { stepApi } from './baseApi';
import type { ApiEnvelope } from './types';

export const questionBankApi = stepApi.injectEndpoints({
  endpoints: (builder) => ({
    getQuestionBank: builder.query<
      ApiEnvelope<any[]>,
      { language?: string; sectionType?: string; difficulty?: string; questionType?: string; search?: string } | void
    >({
      query: (params) => ({
        url: '/question-bank',
        params: params || {},
      }),
      providesTags: ['QuestionBank'],
    }),
    createQuestionBank: builder.mutation<ApiEnvelope<any>, any>({
      query: (data) => ({
        url: '/question-bank',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['QuestionBank'],
    }),
    updateQuestionBank: builder.mutation<ApiEnvelope<any>, { id: number; data: any }>({
      query: ({ id, data }) => ({
        url: `/question-bank/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['QuestionBank'],
    }),
    deleteQuestionBank: builder.mutation<ApiEnvelope<any>, number>({
      query: (id) => ({
        url: `/question-bank/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['QuestionBank'],
    }),
    bulkDeleteQuestionBank: builder.mutation<ApiEnvelope<any>, { questionIds: number[] }>({
      query: (data) => ({
        url: '/question-bank/bulk-delete',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['QuestionBank'],
    }),
    bulkToggleQuestionBankStatus: builder.mutation<ApiEnvelope<any>, { questionIds: number[]; isActive: boolean }>({
      query: (data) => ({
        url: '/question-bank/bulk-status',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['QuestionBank'],
    }),
    bulkImportQuestionBank: builder.mutation<ApiEnvelope<any>, { questions: any[] }>({
      query: (data) => ({
        url: '/question-bank/bulk-import',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['QuestionBank'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetQuestionBankQuery,
  useCreateQuestionBankMutation,
  useUpdateQuestionBankMutation,
  useDeleteQuestionBankMutation,
  useBulkDeleteQuestionBankMutation,
  useBulkToggleQuestionBankStatusMutation,
  useBulkImportQuestionBankMutation,
} = questionBankApi;

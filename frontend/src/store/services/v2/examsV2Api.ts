import { stepApi } from '../baseApi';
import type { ApiEnvelope, BatchAnswerSyncData, PublishResultData } from '../types';

export const examsV2Api = stepApi.injectEndpoints({
  endpoints: (builder) => ({
    saveExamAnswerBatchV2: builder.mutation<ApiEnvelope<BatchAnswerSyncData>, { sessionToken: string; answers: any[] }>({
      query: (data) => ({
        url: '/v2/exams/batch-answers',
        method: 'POST',
        body: data,
      }),
    }),
    publishAssessmentResultV2: builder.mutation<ApiEnvelope<PublishResultData>, { sessionId: number; remarks?: string }>({
      query: ({ sessionId, remarks }) => ({
        url: `/v2/exams/${sessionId}/auto-grade-publish`,
        method: 'POST',
        body: { remarks },
      }),
      invalidatesTags: ['Exams', 'Candidates'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useSaveExamAnswerBatchV2Mutation,
  usePublishAssessmentResultV2Mutation,
} = examsV2Api;

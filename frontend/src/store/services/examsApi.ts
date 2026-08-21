import { stepApi } from './baseApi';
import type {
  ApiEnvelope,
  LiveExamWorkspaceData,
  SubmitExamResultData,
  ReportExamViolationResultData,
  ExamEvaluationViewData,
  PublishResultData,
  BatchAnswerSyncData,
} from './types';

export const examsApi = stepApi.injectEndpoints({
  endpoints: (builder) => ({
    startExamSession: builder.mutation<
      ApiEnvelope<LiveExamWorkspaceData>,
      { sessionToken?: string; candidateCode?: string; passcode?: string; testSource?: string; [key: string]: any }
    >({
      query: ({ sessionToken, ...body }) => ({
        url: sessionToken ? `/exams/${sessionToken}/start` : '/exams/start',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Exams'],
    }),
    resumeExamSession: builder.query<ApiEnvelope<LiveExamWorkspaceData>, string>({
      query: (sessionToken) => `/exams/${sessionToken}/resume`,
      providesTags: ['Exams'],
    }),
    saveExamAnswer: builder.mutation<
      ApiEnvelope<{ saved: boolean }>,
      {
        sessionToken: string;
        questionId?: number;
        candidateExamSessionQuestionId?: number;
        submittedAnswerText?: string | null;
        selectedOptionIds?: number[];
        [key: string]: any;
      }
    >({
      query: ({ sessionToken, ...body }) => ({
        url: `/exams/${sessionToken}/save-answer`,
        method: 'POST',
        body: {
          questionId: body.questionId || body.candidateExamSessionQuestionId,
          ...body,
        },
      }),
    }),
    saveExamAnswerBatchV2: builder.mutation<ApiEnvelope<BatchAnswerSyncData>, { sessionToken: string; answers: any[] }>({
      query: (data) => ({
        url: '/exams/batch-answers',
        method: 'POST',
        body: data,
      }),
    }),
    submitExam: builder.mutation<ApiEnvelope<SubmitExamResultData>, { sessionToken: string; reason?: string }>({
      query: ({ sessionToken, reason }) => ({
        url: `/exams/${sessionToken}/submit`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Exams', 'Candidates'],
    }),
    reportExamViolation: builder.mutation<
      ApiEnvelope<ReportExamViolationResultData>,
      { sessionToken: string; violationType: string; metadata?: string }
    >({
      query: ({ sessionToken, violationType, metadata }) => ({
        url: `/exams/${sessionToken}/violation`,
        method: 'POST',
        body: { violationType, metadata },
      }),
    }),
    getExamEvaluation: builder.query<ApiEnvelope<ExamEvaluationViewData>, number>({
      query: (sessionId) => `/exams/${sessionId}/evaluation`,
      providesTags: ['Exams'],
    }),
    evaluateAnswer: builder.mutation<
      ApiEnvelope<any>,
      { sessionId?: number; answerId?: number; candidateExamAnswerId?: number; marksObtained: number; evaluatorRemarks?: string }
    >({
      query: ({ sessionId, answerId, candidateExamAnswerId, marksObtained, evaluatorRemarks }) => ({
        url: `/exams/${sessionId || 1}/evaluation/answers/${answerId || candidateExamAnswerId}`,
        method: 'POST',
        body: { marksObtained, evaluatorRemarks },
      }),
      invalidatesTags: ['Exams'],
    }),
    publishAssessmentResult: builder.mutation<ApiEnvelope<PublishResultData>, { sessionId: number; remarks?: string }>({
      query: ({ sessionId, remarks }) => ({
        url: `/exams/${sessionId}/publish`,
        method: 'POST',
        body: { remarks },
      }),
      invalidatesTags: ['Exams', 'Candidates'],
    }),
    publishAssessmentResultV2: builder.mutation<ApiEnvelope<PublishResultData>, { sessionId: number; remarks?: string }>({
      query: ({ sessionId, remarks }) => ({
        url: `/exams/${sessionId}/auto-grade-publish`,
        method: 'POST',
        body: { remarks },
      }),
      invalidatesTags: ['Exams', 'Candidates'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useStartExamSessionMutation,
  useResumeExamSessionQuery,
  useSaveExamAnswerMutation,
  useSaveExamAnswerBatchV2Mutation,
  useSubmitExamMutation,
  useReportExamViolationMutation,
  useGetExamEvaluationQuery,
  useEvaluateAnswerMutation,
  usePublishAssessmentResultMutation,
  usePublishAssessmentResultV2Mutation,
} = examsApi;

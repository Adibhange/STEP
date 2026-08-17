import { stepApi } from '../baseApi';
import type {
  ApiEnvelope,
  InterviewData,
  ScheduleInterviewRequest,
  SubmitInterviewFeedbackRequest,
} from '../types';

export const interviewsApi = stepApi.injectEndpoints({
  endpoints: (builder) => ({
    getInterviewById: builder.query<ApiEnvelope<InterviewData>, number>({
      query: (id) => `/interviews/${id}`,
      providesTags: ['Interviews'],
    }),
    scheduleInterview: builder.mutation<ApiEnvelope<InterviewData>, ScheduleInterviewRequest>({
      query: (data) => ({
        url: '/interviews/schedule',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Interviews', 'Candidates'],
    }),
    submitInterviewFeedback: builder.mutation<ApiEnvelope<object>, SubmitInterviewFeedbackRequest>({
      query: (data) => ({
        url: '/interviews/feedback',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Interviews'],
    }),
    publishInterviewResult: builder.mutation<ApiEnvelope<any>, { id: number; passed: boolean; remarks?: string }>({
      query: ({ id, passed, remarks }) => ({
        url: `/interviews/${id}/publish`,
        method: 'POST',
        body: { passed, remarks },
      }),
      invalidatesTags: ['Interviews', 'Candidates'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetInterviewByIdQuery,
  useScheduleInterviewMutation,
  useSubmitInterviewFeedbackMutation,
  usePublishInterviewResultMutation,
} = interviewsApi;

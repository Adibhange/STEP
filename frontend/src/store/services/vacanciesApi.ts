import { stepApi } from './baseApi';
import type { ApiEnvelope, InstantDriveResultData, TempExamPassData } from './types';

export const vacanciesApi = stepApi.injectEndpoints({
  endpoints: (builder) => ({
    getVacancies: builder.query<
      ApiEnvelope<any[]>,
      { status?: string; search?: string; departmentId?: number; pageSize?: number; pageIndex?: number } | void
    >({
      query: (params) => ({
        url: '/vacancies',
        params: params || {},
      }),
      providesTags: ['Vacancies'],
    }),
    getVacancyById: builder.query<ApiEnvelope<any>, number>({
      query: (id) => `/vacancies/${id}`,
      providesTags: (result, error, id) => [{ type: 'Vacancies', id }],
    }),
    createVacancy: builder.mutation<ApiEnvelope<any>, Record<string, any>>({
      query: (data) => ({
        url: '/vacancies',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Vacancies'],
    }),
    updateVacancy: builder.mutation<ApiEnvelope<any>, { id: number; data: Record<string, any> }>({
      query: ({ id, data }) => ({
        url: `/vacancies/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ['Vacancies', { type: 'Vacancies', id }],
    }),
    createPipelineFlow: builder.mutation<ApiEnvelope<any>, Record<string, any>>({
      query: (data) => ({
        url: '/pipelineflows',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Vacancies'],
    }),
    updatePipelineFlow: builder.mutation<ApiEnvelope<any>, Record<string, any>>({
      query: (arg) => {
        const id = arg.id || arg.flowId;
        const body = arg.data || arg;
        return {
          url: `/pipelineflows/${id}`,
          method: 'PUT',
          body,
        };
      },
      invalidatesTags: ['Vacancies'],
    }),
    deletePipelineFlow: builder.mutation<ApiEnvelope<any>, number | { vacancyId?: number; flowId: number }>({
      query: (arg) => {
        const id = typeof arg === 'number' ? arg : arg.flowId;
        return {
          url: `/pipelineflows/${id}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['Vacancies'],
    }),
    assignQuestionPaperToRound: builder.mutation<ApiEnvelope<any>, { roundId: number; vacancyQuestionPaperId: number }>({
      query: ({ roundId, vacancyQuestionPaperId }) => ({
        url: `/pipelineflows/rounds/${roundId}/assign-question-paper`,
        method: 'POST',
        body: { vacancyQuestionPaperId },
      }),
      invalidatesTags: ['Vacancies'],
    }),
    createInstantDriveV2: builder.mutation<ApiEnvelope<InstantDriveResultData>, Record<string, any>>({
      query: (data) => ({
        url: '/vacancies/instant-drive',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Vacancies', 'QRCodes'],
    }),
    generateTempExamPassV2: builder.mutation<ApiEnvelope<TempExamPassData>, Record<string, any>>({
      query: (data) => ({
        url: '/exams/temp-pass',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Candidates'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetVacanciesQuery,
  useGetVacancyByIdQuery,
  useCreateVacancyMutation,
  useUpdateVacancyMutation,
  useCreatePipelineFlowMutation,
  useUpdatePipelineFlowMutation,
  useDeletePipelineFlowMutation,
  useAssignQuestionPaperToRoundMutation,
  useCreateInstantDriveV2Mutation,
  useGenerateTempExamPassV2Mutation,
} = vacanciesApi;

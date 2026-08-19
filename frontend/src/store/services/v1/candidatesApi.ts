import { stepApi } from '../baseApi';
import type { ApiEnvelope } from '../types';

export const candidatesApi = stepApi.injectEndpoints({
  endpoints: (builder) => ({
    getCandidates: builder.query<
      ApiEnvelope<any[]>,
      { vacancyId?: number; status?: string; search?: string; pageIndex?: number; pageSize?: number } | void
    >({
      query: (params) => ({
        url: '/candidates',
        params: params || {},
      }),
      providesTags: ['Candidates'],
    }),
    getCandidateById: builder.query<ApiEnvelope<any>, number>({
      query: (id) => `/candidates/${id}`,
      providesTags: (result, error, id) => [{ type: 'Candidates', id }],
    }),
    registerCandidate: builder.mutation<ApiEnvelope<any>, Record<string, any>>({
      query: (data) => ({
        url: '/candidates',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Candidates'],
    }),
    updateCandidate: builder.mutation<ApiEnvelope<any>, Record<string, any>>({
      query: (data) => {
        const id = data.id || data.candidateId;
        const body = data.data || data;
        return {
          url: `/candidates/${id}`,
          method: 'PUT',
          body,
        };
      },
      invalidatesTags: (result, error, arg) => {
        const id = arg.id || arg.candidateId;
        return ['Candidates', { type: 'Candidates', id }];
      },
    }),
    assignPipelineFlow: builder.mutation<
      ApiEnvelope<any>,
      { candidateId: number; flowTemplateId?: number; vacancyPipelineFlowId?: number }
    >({
      query: ({ candidateId, flowTemplateId, vacancyPipelineFlowId }) => ({
        url: `/candidates/${candidateId}/assign-flow`,
        method: 'POST',
        body: { flowTemplateId: flowTemplateId || vacancyPipelineFlowId },
      }),
      invalidatesTags: ['Candidates'],
    }),
    assignEvaluator: builder.mutation<
      ApiEnvelope<any>,
      { candidateId: number; roundNumber: number; evaluatorUserId: number }
    >({
      query: ({ candidateId, roundNumber, evaluatorUserId }) => ({
        url: `/candidates/${candidateId}/assign-evaluator`,
        method: 'POST',
        body: { roundNumber, evaluatorUserId },
      }),
      invalidatesTags: ['Candidates'],
    }),
    uploadCandidateDocument: builder.mutation<
      ApiEnvelope<any>,
      { candidateId: number; file: File; documentType?: string }
    >({
      query: ({ candidateId, file, documentType }) => {
        const formData = new FormData();
        formData.append('file', file);
        if (documentType) formData.append('documentType', documentType);
        return {
          url: `/candidates/${candidateId}/documents`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Candidates'],
    }),
    deleteCandidateDocument: builder.mutation<ApiEnvelope<any>, { candidateId: number; documentId: number }>({
      query: ({ candidateId, documentId }) => ({
        url: `/candidates/${candidateId}/documents/${documentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Candidates'],
    }),
    scheduleCandidateTest: builder.mutation<
      ApiEnvelope<any>,
      { candidateId: number; roundNumber?: number; testDate?: string; scheduledDate?: string; venueOrLink?: string; testMode?: string; [key: string]: any }
    >({
      query: ({ candidateId, ...body }) => ({
        url: `/candidates/${candidateId}/schedule-test`,
        method: 'POST',
        body: {
          testDate: body.testDate || body.scheduledDate,
          ...body,
        },
      }),
      invalidatesTags: ['Candidates'],
    }),
    evaluateCandidateStage: builder.mutation<ApiEnvelope<any>, { candidateId: number; roundNumber: number; passed: boolean; remarks?: string }>({
      query: ({ candidateId, roundNumber, passed, remarks }) => ({
        url: `/candidates/${candidateId}/evaluate-stage`,
        method: 'POST',
        body: { roundNumber, passed, remarks },
      }),
      invalidatesTags: ['Candidates', 'Interviews'],
    }),
    generateDirectorAccessLink: builder.mutation<
      ApiEnvelope<{
        token: string;
        accessUrl: string;
        expiresAt: string;
        candidateName: string;
        candidateCode: string;
        vacancyTitle: string;
        isExisting?: boolean;
      }>,
      { candidateId: number; regenerate?: boolean }
    >({
      query: ({ candidateId, regenerate }) => ({
        url: `/candidates/${candidateId}/director-access-link`,
        method: 'POST',
        body: { regenerate },
      }),
      invalidatesTags: ['Candidates'],
    }),
    getDirectorAccessGatewayInfo: builder.query<
      ApiEnvelope<{
        valid: boolean;
        token: string;
        candidateId: number;
        candidateName: string;
        candidateCode: string;
        vacancyTitle: string;
        currentStage?: string;
        createdAt: string;
        expiresAt: string;
        isExpired: boolean;
        remainingMinutes: number;
      }>,
      string
    >({
      query: (token) => `/candidates/director-access/${token}`,
    }),
    verifyDirectorGatewayPin: builder.mutation<
      ApiEnvelope<{
        accessToken: string;
        refreshToken: string;
        user: any;
        candidateId: number;
        redirectUrl: string;
      }>,
      { token: string; pin: string }
    >({
      query: ({ token, pin }) => ({
        url: '/candidates/director-access/verify-pin',
        method: 'POST',
        body: { token, pin },
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCandidatesQuery,
  useGetCandidateByIdQuery,
  useRegisterCandidateMutation,
  useUpdateCandidateMutation,
  useAssignPipelineFlowMutation,
  useAssignEvaluatorMutation,
  useUploadCandidateDocumentMutation,
  useDeleteCandidateDocumentMutation,
  useScheduleCandidateTestMutation,
  useEvaluateCandidateStageMutation,
  useGenerateDirectorAccessLinkMutation,
  useGetDirectorAccessGatewayInfoQuery,
  useVerifyDirectorGatewayPinMutation,
} = candidatesApi;


import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

export interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  errors: string[] | null;
  meta?: {
    pageIndex: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  } | null;
  correlationId: string;
}

export interface UserSummaryData {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface AuthResultData {
  accessToken: string;
  refreshToken: string;
  expiresAtUtc?: string;
  user: UserSummaryData;
}

export interface MasterRecord {
  // GetMasterDataQueryHandler deliberately serializes this as a string (`m.Id.ToString()`) —
  // convert with Number(...) before sending it to any endpoint expecting a real int id.
  id: string;
  category: string;
  code: string;
  name: string;
  description?: string;
  displayOrder?: number;
  isActive: boolean;
}

export interface UserItem {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  status: string;
}

const getApiBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5125/api/v1';
  const cleanUrl = envUrl.replace(/\/+$/, '');
  return cleanUrl.endsWith('/api/v1') ? cleanUrl : `${cleanUrl}/api/v1`;
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(),
  prepareHeaders: (headers) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('step_token') : null;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('step_refresh_token') : null;
    if (refreshToken) {
      const refreshResult = await rawBaseQuery(
        {
          url: '/auth/refresh-token',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      const responseEnvelope = refreshResult.data as ApiEnvelope<AuthResultData> | undefined;
      if (responseEnvelope && responseEnvelope.success && responseEnvelope.data?.accessToken) {
        const newData = responseEnvelope.data;
        localStorage.setItem('step_token', newData.accessToken);
        if (newData.refreshToken) {
          localStorage.setItem('step_refresh_token', newData.refreshToken);
        }
        if (newData.user) {
          localStorage.setItem('step_email', newData.user.email || '');
          localStorage.setItem('step_role', newData.user.role || '');
          localStorage.setItem('step_name', `${newData.user.firstName || ''} ${newData.user.lastName || ''}`.trim());
          localStorage.setItem('step_emp_code', newData.user.employeeCode || '');
        }
        // Retry initial request with new token
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        localStorage.removeItem('step_token');
        localStorage.removeItem('step_refresh_token');
        if (typeof window !== 'undefined' && window.location.pathname !== '/' && !window.location.pathname.startsWith('/exam') && !window.location.pathname.startsWith('/apply')) {
          window.location.href = '/';
        }
      }
    } else {
      localStorage.removeItem('step_token');
      if (typeof window !== 'undefined' && window.location.pathname !== '/' && !window.location.pathname.startsWith('/exam') && !window.location.pathname.startsWith('/apply')) {
        window.location.href = '/';
      }
    }
  }

  return result;
};

export const stepApi = createApi({
  reducerPath: 'stepApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Vacancies', 'Candidates', 'Users', 'MasterData', 'Exams', 'Interviews', 'Offers', 'Reports', 'QRCodes', 'QuestionPapers'],
  endpoints: (builder) => ({
    // --- Auth Endpoints ---
    login: builder.mutation<ApiEnvelope<AuthResultData>, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    directorPinLogin: builder.mutation<ApiEnvelope<AuthResultData>, { pin: string }>({
      query: (data) => ({
        url: '/auth/director-pin-login',
        method: 'POST',
        body: data,
      }),
    }),
    refreshToken: builder.mutation<ApiEnvelope<AuthResultData>, { refreshToken: string }>({
      query: (data) => ({
        url: '/auth/refresh-token',
        method: 'POST',
        body: data,
      }),
    }),

    // --- Master Data Endpoints ---
    getMasterDataByCategory: builder.query<ApiEnvelope<MasterRecord[]>, string>({
      query: (category) => `/masterdata/${category}`,
      providesTags: ['MasterData'],
    }),
    toggleMasterDataStatus: builder.mutation<ApiEnvelope<any>, { category: string; id: string | number }>({
      query: ({ category, id }) => ({
        url: `/masterdata/${category}/${id}/toggle-status`,
        method: 'PATCH',
      }),
      invalidatesTags: ['MasterData'],
    }),
    createMasterData: builder.mutation<ApiEnvelope<MasterRecord>, { category: string; name: string; code: string; description?: string; isActive?: boolean }>({
      query: ({ category, ...body }) => ({
        url: `/masterdata/${category}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MasterData'],
    }),
    updateMasterData: builder.mutation<ApiEnvelope<MasterRecord>, { category: string; id: string | number; name: string; code: string; description?: string; isActive: boolean }>({
      query: ({ category, id, ...body }) => ({
        url: `/masterdata/${category}/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['MasterData'],
    }),
    deleteMasterData: builder.mutation<ApiEnvelope<any>, { category: string; id: string | number }>({
      query: ({ category, id }) => ({
        url: `/masterdata/${category}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MasterData'],
    }),

    // --- Users Endpoints ---
    getUsers: builder.query<ApiEnvelope<UserItem[]>, void>({
      query: () => '/users',
      providesTags: ['Users'],
    }),
    createUser: builder.mutation<ApiEnvelope<UserItem>, Record<string, any>>({
      query: (userData) => ({
        url: '/users',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Users'],
    }),

    // --- Vacancies Endpoints ---
    getVacancies: builder.query<ApiEnvelope<any[]>, { pageIndex?: number; pageSize?: number; search?: string; status?: string } | void>({
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
    assignQuestionPaperToRound: builder.mutation<ApiEnvelope<any>, { roundId: number; vacancyQuestionPaperId: number }>({
      query: ({ roundId, vacancyQuestionPaperId }) => ({
        url: `/vacancies/pipeline-rounds/${roundId}/question-paper`,
        method: 'POST',
        body: { vacancyQuestionPaperId },
      }),
      invalidatesTags: ['Vacancies'],
    }),

    // --- Question Papers Endpoints ---
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

    // --- Candidates Endpoints ---
    getCandidates: builder.query<ApiEnvelope<any[]>, { pageIndex?: number; pageSize?: number; search?: string; status?: string; vacancyId?: number } | void>({
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
    assignPipelineFlow: builder.mutation<ApiEnvelope<any>, { candidateId: number; vacancyPipelineFlowId: number }>({
      query: ({ candidateId, vacancyPipelineFlowId }) => ({
        url: `/candidates/${candidateId}/assign-pipeline-flow`,
        method: 'POST',
        body: { vacancyPipelineFlowId },
      }),
      invalidatesTags: ['Candidates'],
    }),

    // --- Exam Portal Endpoints ---
    startExamSession: builder.mutation<ApiEnvelope<any>, { candidateCode: string; passcode: string; testSource?: string }>({
      query: (data) => ({
        url: '/exams/start',
        method: 'POST',
        body: data,
      }),
    }),
    resumeExamSession: builder.query<ApiEnvelope<any>, string>({
      query: (sessionToken) => `/exams/resume/${sessionToken}`,
      providesTags: ['Exams'],
    }),
    saveExamAnswer: builder.mutation<ApiEnvelope<any>, Record<string, any>>({
      query: (data) => ({
        url: '/exams/answers',
        method: 'POST',
        body: data,
      }),
    }),
    submitExam: builder.mutation<ApiEnvelope<any>, { sessionToken: string }>({
      query: (data) => ({
        url: '/exams/submit',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Exams'],
    }),
    getExamEvaluation: builder.query<ApiEnvelope<any>, number>({
      query: (sessionId) => `/exams/${sessionId}/evaluation`,
      providesTags: ['Exams'],
    }),
    evaluateAnswer: builder.mutation<ApiEnvelope<any>, { candidateExamAnswerId: number; marksObtained: number; evaluatorRemarks?: string }>({
      query: (data) => ({
        url: '/exams/evaluate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Exams'],
    }),
    publishAssessmentResult: builder.mutation<ApiEnvelope<any>, { sessionId: number; remarks?: string }>({
      query: ({ sessionId, remarks }) => ({
        url: `/exams/${sessionId}/publish`,
        method: 'POST',
        body: { remarks },
      }),
      invalidatesTags: ['Exams', 'Candidates'],
    }),

    // --- Interviews Endpoints ---
    getInterviewById: builder.query<ApiEnvelope<any>, number>({
      query: (id) => `/interviews/${id}`,
      providesTags: ['Interviews'],
    }),
    scheduleInterview: builder.mutation<ApiEnvelope<any>, Record<string, any>>({
      query: (data) => ({
        url: '/interviews/schedule',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Interviews', 'Candidates'],
    }),
    submitInterviewFeedback: builder.mutation<ApiEnvelope<any>, Record<string, any>>({
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

    // --- Offers Endpoints ---
    getOfferById: builder.query<ApiEnvelope<any>, number>({
      query: (id) => `/offers/${id}`,
      providesTags: ['Offers'],
    }),
    generateOfferLetter: builder.mutation<ApiEnvelope<any>, Record<string, any>>({
      query: (data) => ({
        url: '/offers',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Offers', 'Candidates'],
    }),
    approveOffer: builder.mutation<ApiEnvelope<any>, { id: number; directorPin: string }>({
      query: ({ id, directorPin }) => ({
        url: `/offers/${id}/approve`,
        method: 'POST',
        body: { directorPin },
      }),
      invalidatesTags: ['Offers', 'Candidates'],
    }),

    // --- QR Code & Walk-In Registration Endpoints ---
    generateQRCode: builder.mutation<ApiEnvelope<any>, Record<string, any>>({
      query: (data) => ({
        url: '/qrcodes',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['QRCodes'],
    }),
    getQRCodeAnalytics: builder.query<ApiEnvelope<any>, number>({
      query: (id) => `/qrcodes/${id}/analytics`,
      providesTags: ['QRCodes'],
    }),
    recordQRScan: builder.query<ApiEnvelope<any>, string>({
      query: (code) => `/publicregistration/${code}`,
    }),
    registerCandidateViaQR: builder.mutation<ApiEnvelope<any>, Record<string, any>>({
      query: (data) => ({
        url: '/publicregistration',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Candidates'],
    }),

    // --- Reports Endpoints ---
    getRecruitmentFunnel: builder.query<ApiEnvelope<any>, void>({
      query: () => '/reports/recruitment-funnel',
      providesTags: ['Reports'],
    }),
  }),
});

export const {
  useLoginMutation,
  useDirectorPinLoginMutation,
  useRefreshTokenMutation,
  useGetMasterDataByCategoryQuery,
  useToggleMasterDataStatusMutation,
  useCreateMasterDataMutation,
  useUpdateMasterDataMutation,
  useDeleteMasterDataMutation,
  useGetUsersQuery,
  useCreateUserMutation,
  useGetVacanciesQuery,
  useGetVacancyByIdQuery,
  useCreateVacancyMutation,
  useAssignQuestionPaperToRoundMutation,
  useGetQuestionPapersQuery,
  useGetQuestionPaperByIdQuery,
  useCreateQuestionPaperMutation,
  usePublishQuestionPaperMutation,
  useImportQuestionPaperExcelMutation,
  useGetCandidatesQuery,
  useGetCandidateByIdQuery,
  useRegisterCandidateMutation,
  useAssignPipelineFlowMutation,
  useStartExamSessionMutation,
  useResumeExamSessionQuery,
  useSaveExamAnswerMutation,
  useSubmitExamMutation,
  useGetExamEvaluationQuery,
  useEvaluateAnswerMutation,
  usePublishAssessmentResultMutation,
  useGetInterviewByIdQuery,
  useScheduleInterviewMutation,
  useSubmitInterviewFeedbackMutation,
  usePublishInterviewResultMutation,
  useGetOfferByIdQuery,
  useGenerateOfferLetterMutation,
  useApproveOfferMutation,
  useGenerateQRCodeMutation,
  useGetQRCodeAnalyticsQuery,
  useRecordQRScanQuery,
  useRegisterCandidateViaQRMutation,
  useGetRecruitmentFunnelQuery,
} = stepApi;

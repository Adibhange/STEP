import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { mockDbService } from '@/mock-data';

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

export interface ExamOptionData {
  id: number;
  label: string;
  text: string;
}

export interface ExamQuestionData {
  id: number;
  displayOrder: number;
  questionType: string;
  questionText: string;
  marks: number;
  timeAllowedMinutes: number | null;
  programmingLanguage: string | null;
  sqlSchema: string | null;
  maxWordCount: number | null;
  options: ExamOptionData[];
  submittedAnswerText: string | null;
  selectedOptionIds: number[];
}

export interface LiveExamWorkspaceData {
  sessionToken: string;
  candidateName: string;
  vacancyTitle: string;
  paperTitle: string;
  durationMinutes: number;
  totalTimeLeftSeconds: number;
  activeQuestionIndex: number;
  sessionStatus: string;
  questions: ExamQuestionData[];
}

export interface SubmitExamResultData {
  sessionStatus: string;
  totalScore: number;
  totalMarks: number;
  pendingManualEvaluationCount: number;
}

export interface ReportExamViolationResultData {
  tabSwitchWarnings: number;
  assessmentIntegrityScore: number;
  autoSubmitted: boolean;
  submitResult: SubmitExamResultData | null;
}

export interface EvaluationOptionData {
  id: number;
  label: string;
  text: string;
  isCorrect: boolean;
}

export interface ExamAnswerEvaluationData {
  candidateExamAnswerId: number;
  questionDisplayOrder: number;
  questionType: string;
  questionText: string;
  submittedAnswerText: string | null;
  marks: number;
  marksObtained: number;
  evaluationStatus: string;
  evaluationLocked: boolean;
  evaluatorRemarks: string | null;
  options: EvaluationOptionData[];
  selectedOptionIds: number[];
}

export interface ExamEvaluationViewData {
  candidateExamSessionId: number;
  candidateName: string;
  vacancyTitle: string;
  paperTitle: string;
  sessionStatus: string;
  evaluationStatus: string;
  totalMarks: number;
  totalScore: number;
  frozenTotalDurationMinutes: number;
  startedAt: string | null;
  submittedAt: string | null;
  tabSwitchWarnings: number;
  assessmentIntegrityScore: number;
  answers: ExamAnswerEvaluationData[];
}

export interface PublishResultData {
  candidateExamSessionId: number;
  resultStatus: string;
  totalScore: number;
  totalMarks: number;
  percentage: number;
  advancedToNextRound: boolean;
  nextRoundTitle: string | null;
  nextRoundExamPasscode: string | null;
  candidateStatus: string;
}

export interface QRCodeData {
  id: number;
  vacancyId: number;
  vacancyTitle: string;
  code: string;
  registrationUrl: string;
  venueName: string;
  venueAddress: string | null;
  driveDate: string;
  driveStartTime: string | null;
  driveEndTime: string | null;
  capacity: number | null;
  registrationDeadline: string | null;
  status: string;
}

export interface QRCodeAnalyticsData {
  qrCodeId: number;
  totalScans: number;
  successfulRegistrations: number;
  conversionRate: number;
}

export interface PipelineProgressData {
  id: number;
  roundNumber: number;
  roundTitle: string;
  roundType: string;
  status: string;
  scoreObtained: number | null;
  startedAt: string | null;
  completedAt: string | null;
  candidateExamSessionId: number | null;
  interviewId: number | null;
}

export interface InterviewRoundDetailData {
  id: number;
  panelistUserId: number;
  panelistName: string;
  technicalRating: number;
  communicationRating: number;
  problemSolvingRating: number;
  culturalFitRating: number;
  strengths: string | null;
  weaknesses: string | null;
  recommendation: string;
  comments: string | null;
  submittedAt: string;
}

export interface InterviewData {
  id: number;
  candidateId: number;
  candidateName: string;
  vacancyTitle: string;
  interviewerUserId: number | null;
  interviewerName: string | null;
  scheduledAt: string;
  durationMinutes: number;
  mode: string;
  meetingLinkOrLocation: string | null;
  status: string;
  roundDetails: InterviewRoundDetailData[];
}

export interface ScheduleInterviewRequest {
  candidateId: number;
  interviewerUserId: number;
  scheduledAt: string;
  durationMinutes: number;
  mode: 'Online' | 'Onsite' | 'Phone';
  meetingLinkOrLocation?: string;
}

export interface SubmitInterviewFeedbackRequest {
  interviewId: number;
  technicalRating: number;
  communicationRating: number;
  problemSolvingRating: number;
  culturalFitRating: number;
  strengths?: string;
  weaknesses?: string;
  recommendation: 'Hire' | 'Reject' | 'OnHold';
  comments?: string;
}

export interface OfferLetterData {
  id: number;
  candidateId: number;
  candidateName: string;
  vacancyId: number;
  vacancyTitle: string;
  offeredCTC: number;
  joiningDate: string;
  status: string;
  preparedByName: string;
  approvedByName: string | null;
  approvedAt: string | null;
  generatedPdfPath: string | null;
}

export interface GenerateOfferLetterRequest {
  candidateId: number;
  offeredCTC: number;
  joiningDate: string;
}

export interface QRScanResultData {
  qrCodeId: number;
  vacancyId: number;
  vacancyTitle: string;
  venueName: string;
  isOpenForRegistration: boolean;
  message: string | null;
}

export interface QRRegistrationEligibilityData {
  canApply: boolean;
  eligibleFrom: string | null;
  lastAppliedAt: string | null;
}

export interface RegisterCandidateViaQRRequest {
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  totalExperienceYears: number;
  currentCTC?: number;
  expectedCTC?: number;
  noticePeriodDays?: number;
  currentLocation?: string;
  highestQualification?: string;
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

export const getApiBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  return envUrl.replace(/\/+$/, '');
};

export const isMockDataEnabled = (): boolean => {
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem('step_use_mock_data');
    if (override !== null) return override === 'true';
  }
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false';
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
  // If Mock DB is enabled, dispatch directly to local mock DB
  if (isMockDataEnabled()) {
    const reqObj = typeof args === 'string' ? { url: args } : args;
    const mockRes = await mockDbService.handleRequest(reqObj);
    if (mockRes.error) {
      return { error: mockRes.error as FetchBaseQueryError };
    }
    return { data: mockRes.data };
  }

  let result = await rawBaseQuery(args, api, extraOptions);

  // If real backend is unreachable (network error or timeout), gracefully fallback to Mock DB
  if (result.error && (result.error.status === 'FETCH_ERROR' || result.error.status === 'TIMEOUT_ERROR')) {
    console.warn('[STEP API] Backend unreachable, falling back to Local Mock Database.');
    const reqObj = typeof args === 'string' ? { url: args } : args;
    const mockRes = await mockDbService.handleRequest(reqObj);
    if (mockRes.error) {
      return { error: mockRes.error as FetchBaseQueryError };
    }
    return { data: mockRes.data };
  }

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
          localStorage.setItem('step_user_id', newData.user.id ? String(newData.user.id) : '');
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
    updateUser: builder.mutation<ApiEnvelope<UserItem>, { id: number; firstName: string; lastName: string; email: string; roleId: number; departmentId?: number; isActive: boolean }>({
      query: ({ id, ...body }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body,
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
    updateVacancy: builder.mutation<ApiEnvelope<any>, { id: number; data: Record<string, any> }>({
      query: ({ id, data }) => ({
        url: `/vacancies/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Vacancies', id }, 'Vacancies'],
    }),
    createPipelineFlow: builder.mutation<ApiEnvelope<any>, { vacancyId: number; data: Record<string, any> }>({
      query: ({ vacancyId, data }) => ({
        url: `/vacancies/${vacancyId}/pipeline-flows`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { vacancyId }) => [{ type: 'Vacancies', id: vacancyId }, 'Vacancies'],
    }),
    updatePipelineFlow: builder.mutation<ApiEnvelope<any>, { vacancyId: number; flowId: number; data: Record<string, any> }>({
      query: ({ vacancyId, flowId, data }) => ({
        url: `/vacancies/${vacancyId}/pipeline-flows/${flowId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { vacancyId }) => [{ type: 'Vacancies', id: vacancyId }, 'Vacancies'],
    }),
    deletePipelineFlow: builder.mutation<ApiEnvelope<any>, { vacancyId: number; flowId: number }>({
      query: ({ vacancyId, flowId }) => ({
        url: `/vacancies/${vacancyId}/pipeline-flows/${flowId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { vacancyId }) => [{ type: 'Vacancies', id: vacancyId }, 'Vacancies'],
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

    assignEvaluator: builder.mutation<ApiEnvelope<any>, { candidateId: number; roundNumber: number; evaluatorUserId: number }>({
      query: ({ candidateId, ...body }) => ({
        url: `/candidates/${candidateId}/assign-evaluator`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Candidates'],
    }),

    uploadCandidateDocument: builder.mutation<ApiEnvelope<any>, { candidateId: number; documentType: string; file: File }>({
      query: ({ candidateId, documentType, file }) => {
        const formData = new FormData();
        formData.append('documentType', documentType);
        formData.append('file', file);
        return {
          url: `/candidates/${candidateId}/documents`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Candidates'],
    }),

    scheduleCandidateTest: builder.mutation<
      ApiEnvelope<any>,
      { candidateId: number; testMode: string; scheduledDate: string; startTime: string; endTime: string; passcode?: string }
    >({
      query: ({ candidateId, ...body }) => ({
        url: `/candidates/${candidateId}/schedule-test`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Candidates'],
    }),

    updateCandidate: builder.mutation<ApiEnvelope<any>, { candidateId: number; data: Record<string, any> }>({
      query: ({ candidateId, data }) => ({
        url: `/candidates/${candidateId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Candidates'],
    }),

    deleteCandidateDocument: builder.mutation<ApiEnvelope<any>, { candidateId: number; documentId: number }>({
      query: ({ candidateId, documentId }) => ({
        url: `/candidates/${candidateId}/documents/${documentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Candidates'],
    }),

    changePassword: builder.mutation<ApiEnvelope<any>, { currentPassword: string; newPassword: string }>({
      query: (data) => ({
        url: '/users/change-password',
        method: 'POST',
        body: data,
      }),
    }),

    changePin: builder.mutation<ApiEnvelope<any>, { currentPin: string; newPin: string }>({
      query: (data) => ({
        url: '/users/change-pin',
        method: 'POST',
        body: data,
      }),
    }),


    // --- Exam Portal Endpoints ---
    startExamSession: builder.mutation<ApiEnvelope<LiveExamWorkspaceData>, { candidateCode: string; passcode: string; testSource?: string }>({
      query: (data) => ({
        url: '/exams/start',
        method: 'POST',
        body: data,
      }),
    }),
    resumeExamSession: builder.query<ApiEnvelope<LiveExamWorkspaceData>, string>({
      query: (sessionToken) => `/exams/resume/${sessionToken}`,
      providesTags: ['Exams'],
    }),
    saveExamAnswer: builder.mutation<
      ApiEnvelope<boolean>,
      { sessionToken: string; candidateExamSessionQuestionId: number; submittedAnswerText?: string | null; selectedOptionIds: number[] }
    >({
      query: (data) => ({
        url: '/exams/answers',
        method: 'POST',
        body: data,
      }),
    }),
    submitExam: builder.mutation<ApiEnvelope<SubmitExamResultData>, { sessionToken: string }>({
      query: (data) => ({
        url: '/exams/submit',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Exams'],
    }),
    reportExamViolation: builder.mutation<ApiEnvelope<ReportExamViolationResultData>, { sessionToken: string; violationType: string }>({
      query: (data) => ({
        url: '/exams/violations',
        method: 'POST',
        body: data,
      }),
    }),
    getExamEvaluation: builder.query<ApiEnvelope<ExamEvaluationViewData>, number>({
      query: (sessionId) => `/exams/${sessionId}/evaluation`,
      providesTags: ['Exams'],
    }),
    evaluateAnswer: builder.mutation<ApiEnvelope<boolean>, { candidateExamAnswerId: number; marksObtained: number; evaluatorRemarks?: string }>({
      query: (data) => ({
        url: '/exams/evaluate',
        method: 'POST',
        body: data,
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

    // --- Interviews Endpoints ---
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

    // --- Offers Endpoints ---
    getOfferById: builder.query<ApiEnvelope<OfferLetterData>, number>({
      query: (id) => `/offers/${id}`,
      providesTags: ['Offers'],
    }),
    generateOfferLetter: builder.mutation<ApiEnvelope<OfferLetterData>, GenerateOfferLetterRequest>({
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
    generateQRCode: builder.mutation<ApiEnvelope<QRCodeData>, Record<string, any>>({
      query: (data) => ({
        url: '/qrcodes',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['QRCodes'],
    }),
    getQRCodeAnalytics: builder.query<ApiEnvelope<QRCodeAnalyticsData>, number>({
      query: (id) => `/qrcodes/${id}/analytics`,
      providesTags: ['QRCodes'],
    }),
    getQRCodeByVacancy: builder.query<ApiEnvelope<QRCodeData | null>, number>({
      query: (vacancyId) => `/qrcodes/vacancy/${vacancyId}`,
      providesTags: (result, error, vacancyId) => [{ type: 'QRCodes', id: vacancyId }],
    }),
    recordQRScan: builder.query<ApiEnvelope<QRScanResultData>, string>({
      query: (code) => `/publicregistration/${code}`,
    }),
    checkQRRegistrationEligibility: builder.query<ApiEnvelope<QRRegistrationEligibilityData>, { code: string; email?: string; phone?: string }>({
      query: ({ code, email, phone }) => ({
        url: `/publicregistration/${code}/eligibility`,
        params: { email, phone },
      }),
    }),
    registerCandidateViaQR: builder.mutation<ApiEnvelope<any>, RegisterCandidateViaQRRequest>({
      query: (data) => ({
        url: '/publicregistration',
        method: 'POST',
        body: data,
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
  useUpdateUserMutation,
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
  useAssignEvaluatorMutation,
  useUploadCandidateDocumentMutation,
  useStartExamSessionMutation,
  useResumeExamSessionQuery,
  useSaveExamAnswerMutation,
  useSubmitExamMutation,
  useReportExamViolationMutation,
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
  useGetQRCodeByVacancyQuery,
  useRecordQRScanQuery,
  useCheckQRRegistrationEligibilityQuery,
  useRegisterCandidateViaQRMutation,
  useEvaluateCandidateStageMutation,
  useScheduleCandidateTestMutation,
  useUpdateCandidateMutation,
  useDeleteCandidateDocumentMutation,
  useChangePasswordMutation,
  useChangePinMutation,
  useUpdateVacancyMutation,
  useCreatePipelineFlowMutation,
  useUpdatePipelineFlowMutation,
  useDeletePipelineFlowMutation,
  useGetRecruitmentFunnelQuery,
} = stepApi;

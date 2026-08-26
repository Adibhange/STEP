import { stepApi } from './baseApi';
import type {
  ApiEnvelope,
  QRCodeData,
  QRCodeAnalyticsData,
  QRScanResultData,
  QRRegistrationEligibilityData,
  RegisterCandidateViaQRRequest,
} from './types';

export const qrCodesApi = stepApi.injectEndpoints({
  endpoints: (builder) => ({
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
    getQRCodeByVacancy: builder.query<ApiEnvelope<QRCodeData>, number>({
      query: (vacancyId) => `/qrcodes/vacancy/${vacancyId}`,
      providesTags: ['QRCodes'],
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
  }),
  overrideExisting: false,
});

export const {
  useGenerateQRCodeMutation,
  useGetQRCodeAnalyticsQuery,
  useGetQRCodeByVacancyQuery,
  useRecordQRScanQuery,
  useCheckQRRegistrationEligibilityQuery,
  useRegisterCandidateViaQRMutation,
} = qrCodesApi;

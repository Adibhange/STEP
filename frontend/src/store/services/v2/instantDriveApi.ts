import { stepApi } from '../baseApi';
import type { ApiEnvelope, InstantDriveResultData, TempExamPassData } from '../types';

export const instantDriveApi = stepApi.injectEndpoints({
  endpoints: (builder) => ({
    createInstantDriveV2: builder.mutation<ApiEnvelope<InstantDriveResultData>, Record<string, any>>({
      query: (data) => ({
        url: '/v2/vacancies/instant-drive',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Vacancies', 'QRCodes'],
    }),
    generateTempExamPassV2: builder.mutation<ApiEnvelope<TempExamPassData>, Record<string, any>>({
      query: (data) => ({
        url: '/v2/exams/temp-pass',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Candidates'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateInstantDriveV2Mutation,
  useGenerateTempExamPassV2Mutation,
} = instantDriveApi;

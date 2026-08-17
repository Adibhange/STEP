import { stepApi } from '../baseApi';
import type { ApiEnvelope } from '../types';

export const reportsApi = stepApi.injectEndpoints({
  endpoints: (builder) => ({
    getRecruitmentFunnel: builder.query<ApiEnvelope<any>, void>({
      query: () => '/reports/recruitment-funnel',
      providesTags: ['Reports'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRecruitmentFunnelQuery,
} = reportsApi;

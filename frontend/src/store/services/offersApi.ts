import { stepApi } from './baseApi';
import type {
  ApiEnvelope,
  OfferLetterData,
  GenerateOfferLetterRequest,
} from './types';

export const offersApi = stepApi.injectEndpoints({
  endpoints: (builder) => ({
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
  }),
  overrideExisting: false,
});

export const {
  useGetOfferByIdQuery,
  useGenerateOfferLetterMutation,
  useApproveOfferMutation,
} = offersApi;

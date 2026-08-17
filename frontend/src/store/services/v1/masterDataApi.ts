import { stepApi } from '../baseApi';
import type { ApiEnvelope, MasterRecord } from '../types';

export const masterDataApi = stepApi.injectEndpoints({
  endpoints: (builder) => ({
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
    createMasterData: builder.mutation<
      ApiEnvelope<MasterRecord>,
      { category: string; name: string; code: string; description?: string; isActive?: boolean }
    >({
      query: ({ category, ...body }) => ({
        url: `/masterdata/${category}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MasterData'],
    }),
    updateMasterData: builder.mutation<
      ApiEnvelope<MasterRecord>,
      { category: string; id: string | number; name: string; code: string; description?: string; isActive: boolean }
    >({
      query: ({ category, id, ...body }) => ({
        url: `/masterdata/${category}/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['MasterData'],
    }),
    deleteMasterData: builder.mutation<ApiEnvelope<boolean>, { category: string; id: string | number }>({
      query: ({ category, id }) => ({
        url: `/masterdata/${category}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MasterData'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMasterDataByCategoryQuery,
  useToggleMasterDataStatusMutation,
  useCreateMasterDataMutation,
  useUpdateMasterDataMutation,
  useDeleteMasterDataMutation,
} = masterDataApi;

import { stepApi } from '../baseApi';
import type {
  ApiEnvelope,
  RoleHiringProfileData,
  AssessmentBlueprintData,
  RoleTierMatrixItemData,
} from '../types';

export const hiringProfilesApi = stepApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoleHiringProfilesV2: builder.query<ApiEnvelope<RoleHiringProfileData[]>, number>({
      query: (roleId) => `/v2/vacancies/roles/${roleId}/profiles`,
      providesTags: ['MasterData'],
    }),

    getBlueprintsV2: builder.query<ApiEnvelope<AssessmentBlueprintData[]>, void>({
      query: () => `/v2/hiring-blueprints`,
      providesTags: ['MasterData'],
    }),

    getRoleTierMatrixV2: builder.query<ApiEnvelope<RoleTierMatrixItemData[]>, void>({
      query: () => `/v2/role-tier-matrix`,
      providesTags: ['MasterData'],
    }),

    bulkAssignBlueprintV2: builder.mutation<
      ApiEnvelope<{ updatedCount: number }>,
      { matrixIds: number[]; blueprintId: number }
    >({
      query: (body) => ({
        url: `/v2/role-tier-matrix/bulk-assign`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MasterData'],
    }),

    updateRoleTierMatrixItemV2: builder.mutation<
      ApiEnvelope<RoleTierMatrixItemData>,
      Partial<RoleTierMatrixItemData> & { id: number }
    >({
      query: ({ id, ...body }) => ({
        url: `/v2/role-tier-matrix/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['MasterData'],
    }),

    saveBlueprintV2: builder.mutation<
      ApiEnvelope<AssessmentBlueprintData>,
      Partial<AssessmentBlueprintData>
    >({
      query: (body) => ({
        url: body.id ? `/v2/hiring-blueprints/${body.id}` : `/v2/hiring-blueprints`,
        method: body.id ? 'PUT' : 'POST',
        body,
      }),
      invalidatesTags: ['MasterData'],
    }),

    deleteBlueprintV2: builder.mutation<ApiEnvelope<boolean>, number>({
      query: (id) => ({
        url: `/v2/hiring-blueprints/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MasterData'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRoleHiringProfilesV2Query,
  useGetBlueprintsV2Query,
  useGetRoleTierMatrixV2Query,
  useBulkAssignBlueprintV2Mutation,
  useUpdateRoleTierMatrixItemV2Mutation,
  useSaveBlueprintV2Mutation,
  useDeleteBlueprintV2Mutation,
} = hiringProfilesApi;

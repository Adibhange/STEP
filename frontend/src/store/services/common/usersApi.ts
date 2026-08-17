import { stepApi } from '../baseApi';
import type { ApiEnvelope, UserItem } from '../types';

export const usersApi = stepApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<ApiEnvelope<UserItem[]>, void>({
      query: () => '/users',
      providesTags: ['Users'],
    }),
    createUser: builder.mutation<ApiEnvelope<UserItem>, Record<string, any>>({
      query: (data) => ({
        url: '/users',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Users'],
    }),
    updateUser: builder.mutation<ApiEnvelope<UserItem>, Record<string, any>>({
      query: (arg) => {
        const id = arg.id || arg.userId;
        const body = arg.data || arg;
        return {
          url: `/users/${id}`,
          method: 'PUT',
          body,
        };
      },
      invalidatesTags: ['Users'],
    }),
    changePassword: builder.mutation<ApiEnvelope<any>, Record<string, any>>({
      query: (data) => ({
        url: '/users/change-password',
        method: 'POST',
        body: data,
      }),
    }),
    changePin: builder.mutation<ApiEnvelope<any>, Record<string, any>>({
      query: (data) => ({
        url: '/users/change-pin',
        method: 'POST',
        body: data,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useChangePasswordMutation,
  useChangePinMutation,
} = usersApi;

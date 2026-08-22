import { langpalApi } from './emptyApi';
import type {
  ApiEnvelope,
  ApiUser,
  AuthSession,
  LoginRequest,
  RegisterRequest,
  ResendOtpRequest,
  UpdatePasswordRequest,
  UpdateProfileRequest,
  VerifyOtpRequest,
} from './types';

export const authApi = langpalApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<ApiEnvelope<unknown>, RegisterRequest>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
    }),

    verifyOtp: builder.mutation<AuthSession, VerifyOtpRequest>({
      query: (body) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiEnvelope<AuthSession>) => response.data,
      invalidatesTags: ['Auth'],
    }),

    resendOtp: builder.mutation<ApiEnvelope<unknown>, ResendOtpRequest>({
      query: (body) => ({
        url: '/auth/resend-otp',
        method: 'POST',
        body,
      }),
    }),

    login: builder.mutation<AuthSession, LoginRequest>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiEnvelope<AuthSession>) => response.data,
      invalidatesTags: ['Auth', 'Pals', 'MyPals', 'Chats'],
    }),

    getProfile: builder.query<ApiUser, void>({
      query: () => '/auth/profile',
      transformResponse: (response: ApiEnvelope<ApiUser>) => response.data,
      providesTags: ['Auth'],
    }),

    updateProfile: builder.mutation<ApiUser, UpdateProfileRequest>({
      query: (body) => ({
        url: '/auth/profile',
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiEnvelope<ApiUser>) => response.data,
      invalidatesTags: ['Auth'],
    }),

    updateProfileImage: builder.mutation<Pick<ApiUser, 'profileImage'>, File>({
      query: (file) => {
        const body = new FormData();
        body.append('profileImage', file, file.name);
        body.append('_method', 'PATCH');
        return {
          url: '/auth/profile/image',
          method: 'POST',
          body,
        };
      },
      transformResponse: (response: ApiEnvelope<Pick<ApiUser, 'profileImage'>>) =>
        response.data,
      invalidatesTags: ['Auth'],
    }),

    updatePassword: builder.mutation<ApiEnvelope<unknown>, UpdatePasswordRequest>({
      query: (body) => ({
        url: '/auth/profile/password',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useLoginMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpdateProfileImageMutation,
  useUpdatePasswordMutation,
} = authApi;

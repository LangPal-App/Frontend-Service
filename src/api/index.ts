import { langpalApi } from './emptyApi';
import { authApi } from './authApi';
import { palsApi } from './palsApi';
import { chatsApi } from './chatsApi';

export { langpalApi, authApi, palsApi, chatsApi };
export { API_BASE_URL } from './config';
export { resolveMediaUrl } from './media';
export { getErrorMessage, ApiError } from './errors';
export { streamChatMessage } from './chatStream';

export {
  useRegisterMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useLoginMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpdateProfileImageMutation,
  useUpdatePasswordMutation,
} from './authApi';

export {
  useGetPalsQuery,
  useGetMyPalsQuery,
  useUploadPalImageMutation,
  useCreatePalMutation,
  useUpdatePalMutation,
  useDeletePalMutation,
} from './palsApi';

export { useGetChatsQuery, useGetChatMessagesQuery, useLazyGetChatMessagesQuery } from './chatsApi';

export type {
  ApiEnvelope,
  ApiUser,
  AuthSession,
  ChatMessage,
  ChatMessagesData,
  ChatSummary,
  CreatePalRequest,
  LoginRequest,
  Pal,
  PalImageUpload,
  PaginationMeta,
  MessagesPagination,
  RegisterRequest,
  UpdatePasswordRequest,
  UpdatePalRequest,
  UpdateProfileRequest,
  VerifyOtpRequest,
} from './types';

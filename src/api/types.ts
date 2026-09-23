export interface ApiEnvelope<T> {
  message: string;
  data: T;
  errors: string[] | { [key: string]: string };
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T;
  meta?: PaginationMeta;
}

export interface ApiUser {
  id: string;
  name: string;
  username: string;
  email: string;
  profileImage: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthSession {
  token: string;
  user: ApiUser;
}

export interface RegisterRequest {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface UpdateProfileRequest {
  name: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface Pal {
  id: string;
  name: string;
  isPublic: boolean;
  createdById: string;
  createdByUsername: string;
  description: string;
  language: string;
  country: string;
  languageLevel: string;
  image: string | null;
  createdAt: string;
}

export interface CreatePalRequest {
  name: string;
  isPublic: boolean;
  description: string;
  language: string;
  country: string;
  languageLevel: string;
  image?: string;
}

export type UpdatePalRequest = CreatePalRequest;

export interface PalImageUpload {
  url: string;
}

export interface ChatSummary {
  id: string;
  palId: string;
  palName: string;
  palImage: string | null;
  palCountry: string;
  lastMessage?: string | null;
  updatedAt?: string;
}

export type MessageAuthorType = 'user' | 'pal';

export interface ChatMessage {
  id: string;
  message: string;
  authorType: MessageAuthorType;
  authorId: string;
  createdAt: string;
}

export interface ChatMessagesData {
  id: string;
  palId: string;
  palName: string;
  palImage: string | null;
  messages: ChatMessage[];
}

export interface MessagesPagination {
  page: number;
  totalPages: number;
}

export function unwrapList<T>(data: T[] | T | null | undefined): T[] {
  if (Array.isArray(data)) return data;
  if (data == null) return [];
  return [data];
}

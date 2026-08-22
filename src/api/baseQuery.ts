import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { AxiosRequestConfig } from 'axios';
import { isAxiosError } from 'axios';
import { logout } from '../features/auth/authSlice';
import { axiosClient } from './axiosClient';

const PUBLIC_AUTH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/verify-otp',
  '/auth/resend-otp',
];

type AxiosArgs =
  | string
  | {
      url: string;
      method?: AxiosRequestConfig['method'];
      body?: unknown;
      params?: AxiosRequestConfig['params'];
      headers?: AxiosRequestConfig['headers'];
    };

function requestUrl(args: AxiosArgs): string {
  return typeof args === 'string' ? args : args.url;
}

function toQueryError(error: unknown) {
  if (isAxiosError(error)) {
    if (error.code === 'ERR_CANCELED') {
      return { status: 'CUSTOM_ERROR' as const, error: 'Request aborted' };
    }
    if (error.response) {
      return { status: error.response.status, data: error.response.data };
    }
    return { status: 'FETCH_ERROR' as const, error: error.message };
  }
  return { status: 'FETCH_ERROR' as const, error: String(error) };
}

export const baseQuery: BaseQueryFn<AxiosArgs, unknown, unknown> = async (
  args,
  api
) => {
  const request = typeof args === 'string' ? { url: args } : args;
  const token = (api.getState() as { auth: { token: string | null } }).auth.token;

  try {
    const result = await axiosClient.request({
      url: request.url,
      method: request.method ?? 'GET',
      data: request.body,
      params: request.params,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...request.headers,
      },
      signal: api.signal,
    });
    return { data: result.data };
  } catch (error) {
    const queryError = toQueryError(error);
    if (
      typeof queryError.status === 'number' &&
      queryError.status === 401 &&
      !PUBLIC_AUTH_PATHS.some((path) => requestUrl(args).startsWith(path))
    ) {
      api.dispatch(logout());
    }
    return { error: queryError };
  }
};
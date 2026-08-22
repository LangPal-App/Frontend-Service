import type { ApiEnvelope } from './types';

export class ApiError extends Error {
  status: number;
  errors: string[];

  constructor(message: string, status: number, errors: string[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

function messageFromEnvelope(data: Partial<ApiEnvelope<unknown>> | undefined): string | null {
  if (!data) return null;
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.filter(Boolean).join('. ');
  }
  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message;
  }
  return null;
}

export async function toApiError(response: Response): Promise<ApiError> {
  const fallback = `Request failed (${response.status})`;
  try {
    const data = (await response.json()) as Partial<ApiEnvelope<unknown>>;
    return new ApiError(
      messageFromEnvelope(data) ?? fallback,
      response.status,
      Array.isArray(data.errors) ? data.errors : []
    );
  } catch {
    return new ApiError(fallback, response.status);
  }
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (error instanceof ApiError) return error.message;

  if (typeof error === 'object' && error !== null) {
    const maybeRtk = error as {
      data?: Partial<ApiEnvelope<unknown>> | string;
      error?: string;
      status?: number | string;
    };

    if (typeof maybeRtk.data === 'string' && maybeRtk.data.trim()) {
      return maybeRtk.data;
    }

    const fromEnvelope = messageFromEnvelope(
      typeof maybeRtk.data === 'object' ? maybeRtk.data : undefined
    );
    if (fromEnvelope) return fromEnvelope;

    if (typeof maybeRtk.error === 'string' && maybeRtk.error.trim()) {
      return maybeRtk.error;
    }
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

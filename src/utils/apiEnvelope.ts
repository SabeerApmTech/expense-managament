import axios from 'axios';

interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

/** Unwraps a `{success, message, data}` response envelope; falls back gracefully if the payload isn't wrapped. */
export function unwrap<T>(payload: unknown): { data: T; message?: string } {
  if (payload && typeof payload === 'object' && 'success' in payload) {
    const envelope = payload as ApiEnvelope<T>;
    return { data: envelope.data as T, message: envelope.message };
  }
  return { data: payload as T, message: undefined };
}

/** Extracts the backend's own error message from a failed request, falling back to a generic message. */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
  }
  return fallback;
}

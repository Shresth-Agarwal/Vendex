import axios from 'axios';

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8080';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete apiClient.defaults.headers.common.Authorization;
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false,
  timeout: 15000 // 15 seconds default timeout for all requests
});

export interface ApiError {
  message: string;
  status?: number;
  raw?: unknown;
}

export function toApiError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    return {
      message:
        (err.response?.data as { message?: string; error?: string; detail?: string })?.message ??
        (err.response?.data as { message?: string; error?: string; detail?: string })?.error ??
        (err.response?.data as { message?: string; error?: string; detail?: string })?.detail ??
        err.message,
      status: err.response?.status,
      raw: err.response?.data
    };
  }

  return {
    message: err instanceof Error ? err.message : 'Unexpected error',
    raw: err
  };
}

export function getStoredToken(): string | null {
  return authToken;
}



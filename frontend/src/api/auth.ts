import { apiClient, setAuthToken } from './client';

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  role?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken?: string;
  token?: string;
  [key: string]: unknown;
}

export interface RefreshTokenRequest {
  token: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  token: string;
}

export async function registerUser(payload: RegisterRequest): Promise<unknown> {
  const { data } = await apiClient.post('/register', payload);
  return data;
}

export async function loginUser(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/login', payload);

  const jwt = (data.accessToken ?? (data as { jwt?: string }).jwt) as string | undefined;
  if (jwt) {
    setAuthToken(jwt);
    window.localStorage.setItem('vendex_token', jwt);
  }

  return data;
}

export async function logoutUser(): Promise<void> {
  try {
    await apiClient.post('/logout');
  } catch {
    // ignore network / 401 errors on logout
  }
  setAuthToken(null);
  window.localStorage.removeItem('vendex_token');
}

export async function refreshToken(
  payload: RefreshTokenRequest
): Promise<RefreshTokenResponse> {
  const { data } = await apiClient.post<RefreshTokenResponse>('/refreshToken', payload);
  if (data.accessToken) {
    setAuthToken(data.accessToken);
    window.localStorage.setItem('vendex_token', data.accessToken);
  }
  return data;
}

export function bootstrapAuthFromStorage() {
  const stored = window.localStorage.getItem('vendex_token');
  if (stored) {
    setAuthToken(stored);
  }
}


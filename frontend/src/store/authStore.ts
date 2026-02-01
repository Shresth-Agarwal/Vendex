import { create } from 'zustand';
import Cookies from 'js-cookie';
import { authApi } from '@/lib/api';

interface User {
  id: number;
  email: string;
  username: string;
  role: 'CONSUMER' | 'STORE_OWNER' | 'MANUFACTURER' | 'STAFF' | 'ADMIN';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: { email: string; username: string; password: string; role: string }) => Promise<void>;
  loadUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return Cookies.get('auth_token') || localStorage.getItem('auth_token');
};

const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return Cookies.get('refresh_token') || localStorage.getItem('refresh_token');
};

const setTokenStorage = (token: string | null, refreshToken?: string | null) => {
  if (typeof window === 'undefined') return;
  if (token) {
    Cookies.set('auth_token', token, { expires: 7 });
    localStorage.setItem('auth_token', token);
  } else {
    Cookies.remove('auth_token');
    localStorage.removeItem('auth_token');
  }

  if (typeof refreshToken !== 'undefined') {
    if (refreshToken) {
      Cookies.set('refresh_token', refreshToken, { expires: 30 });
      localStorage.setItem('refresh_token', refreshToken);
    } else {
      Cookies.remove('refresh_token');
      localStorage.removeItem('refresh_token');
    }
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: getToken(),
  isAuthenticated: !!getToken(),
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await authApi.login(email, password);
      // Robust token extraction from various backend shapes
      // Prefer explicit JWT fields (accessToken/access_token/jwt) over generic `token` (which may be a refresh UUID)
      const tokenCandidates = [
        response?.accessToken,
        response?.access_token,
        response?.jwt,
        response?.data?.accessToken,
        response?.data?.access_token,
        response?.data?.jwt,
        response?.token,
        response?.data?.token,
      ];
      let token: any = null;
      for (const t of tokenCandidates) {
        if (t) { token = t; break; }
      }
      const refreshToken = response.refreshToken || response.refresh_token || response?.data?.refreshToken || response?.data?.refresh_token || null;

      // If token is an object (unexpected), try to pick a string inside
      if (token && typeof token === 'object') {
        token = token.accessToken || token.token || token.value || null;
      }

      // Validate token looks like a JWT (two dots)
      const isJwt = typeof token === 'string' && token.split('.').length === 3;
      if (!isJwt) {
        const msg = response?.message || response?.error || 'Received invalid token from server';
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('app-error', { detail: { message: msg } }));
        }
        console.error('Invalid token received from login response:', token);
        throw new Error(msg || 'Invalid token');
      }

      if (token) {
        setTokenStorage(token, refreshToken);
        set({ token, isAuthenticated: true });

        // Load user data
        await useAuthStore.getState().loadUser();
        // Broadcast success to UI
        try {
          const user = useAuthStore.getState().user;
          const name = user?.username || user?.email || '';
          const msg = name ? `Signed in as ${name}` : 'Signed in successfully';
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('app-success', { detail: { message: msg } }));
          }
        } catch (e) {}
      }
    } catch (error) {
      console.error('Login error:', error);
      try {
        const msg = (error as any)?.response?.data?.message || (error as any)?.message || 'Authentication failed';
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('app-error', { detail: { message: msg } }));
        }
      } catch (e) {}
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      await authApi.register(data);
      // Auto login after registration
      await useAuthStore.getState().login(data.email, data.password);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    setTokenStorage(null, null);
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const userData = await authApi.getCurrentUser();
      set({ user: userData, isAuthenticated: true });
    } catch (error) {
      console.error('Load user error:', error);
      setTokenStorage(null, null);
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  setUser: (user) => set({ user }),
  setToken: (token) => {
    setTokenStorage(token);
    set({ token, isAuthenticated: !!token });
  },
}));

// If a token exists on startup, attempt to load the user to keep session
const initialToken = getToken();
if (initialToken) {
  // delay to allow modules to initialize
  setTimeout(() => {
    useAuthStore.getState().loadUser().catch(() => {});
  }, 0);
}

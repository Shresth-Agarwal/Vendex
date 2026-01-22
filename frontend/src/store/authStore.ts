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

const setTokenStorage = (token: string | null) => {
  if (typeof window === 'undefined') return;
  if (token) {
    Cookies.set('auth_token', token, { expires: 7 });
    localStorage.setItem('auth_token', token);
  } else {
    Cookies.remove('auth_token');
    localStorage.removeItem('auth_token');
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
      const token = response.token || response.accessToken;
      
      if (token) {
        setTokenStorage(token);
        set({ token, isAuthenticated: true });
        
        // Load user data
        await useAuthStore.getState().loadUser();
      }
    } catch (error) {
      console.error('Login error:', error);
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
    setTokenStorage(null);
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const userData = await authApi.getCurrentUser();
      set({ user: userData, isAuthenticated: true });
    } catch (error) {
      console.error('Load user error:', error);
      setTokenStorage(null);
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  setUser: (user) => set({ user }),
  setToken: (token) => {
    setTokenStorage(token);
    set({ token, isAuthenticated: !!token });
  },
}));

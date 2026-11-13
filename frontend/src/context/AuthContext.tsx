import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userService } from '@/services/userService';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  provider?: string;
  providerId?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const profile = await userService.getProfile();
          setUser(profile);
          setIsAuthenticated(true);
          setError(null);
        } catch (err: any) {
          console.error('Failed to fetch user profile:', err);
          localStorage.removeItem('auth_token');
          setIsAuthenticated(false);
          setError('Session expired. Please log in again.');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshUser = async () => {
    try {
      const profile = await userService.getProfile();
      setUser(profile);
      setIsAuthenticated(true);
      setError(null);
    } catch (err: any) {
      console.error('Failed to refresh user:', err);
      logout();
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

'use client';

import { authService } from '@/lib/api/auth.service';
import { getClientAuthToken } from '@/lib/auth/cookies.client';
import { logger } from '@/lib/utils/logger';
import { useAuthStore } from '@/stores/auth.store';
import { createContext, useContext, useEffect, useRef } from 'react';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, setToken, clearToken } = useAuthStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Initialize auth on mount (only once)
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initAuth = async () => {
      // 1. Check store
      if (token) {
        const validation = await authService.validateToken(token);
        if (validation.isValid) return;
      }

      // 2. Check cookie
      const cookieToken = getClientAuthToken();
      if (cookieToken) {
        const validation = await authService.validateToken(cookieToken);
        if (validation.isValid) {
          setToken(cookieToken);
          return;
        }
      }

      // 3. Clear invalid token
      clearToken();
    };

    initAuth();
  }, [token, setToken, clearToken]);

  const login = (newToken: string) => {
    setToken(newToken);
    logger.info('User logged in', 'AuthContext');
  };

  const logout = () => {
    clearToken();
    logger.info('User logged out', 'AuthContext');
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        login,
        logout,
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

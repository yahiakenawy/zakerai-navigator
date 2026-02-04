import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import Cookies from 'js-cookie';
import { apiClient, User, UserRole } from '@/lib/api';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Parse JWT token to extract user info
const parseJWT = (token: string): User | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    return {
      user_id: payload.user_id,
      username: payload.username,
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
};

// Check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    accessToken: null,
  });

  // Refresh session using refresh token from cookies
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const refreshToken = Cookies.get('refresh_token');
      if (!refreshToken) {
        return false;
      }

      const response = await apiClient.post('/users/token/refresh/', {
        refresh: refreshToken,
      });
      const { access } = response.data;

      const user = parseJWT(access);
      if (!user) return false;

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        accessToken: access,
      });

      sessionStorage.setItem('access_token', access);
      return true;
    } catch {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        accessToken: null,
      });
      return false;
    }
  }, []);

  // Login with username and password
  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await apiClient.post('/users/token/login/', { username, password });
      const { access, refresh } = response.data;

      const user = parseJWT(access);
      if (!user) return false;

      // Store tokens
      sessionStorage.setItem('access_token', access);
      Cookies.set('refresh_token', refresh, { expires: 7, secure: true, sameSite: 'strict' });

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        accessToken: access,
      });

      return true;
    } catch {
      return false;
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    sessionStorage.removeItem('access_token');
    Cookies.remove('refresh_token');
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      accessToken: null,
    });
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const existingToken = sessionStorage.getItem('access_token');

      if (existingToken && !isTokenExpired(existingToken)) {
        const user = parseJWT(existingToken);
        if (user) {
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            accessToken: existingToken,
          });
          return;
        }
      }

      // Try to refresh using cookie
      const refreshed = await refreshSession();
      if (!refreshed) {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          accessToken: null,
        });
      }
    };

    initAuth();
  }, [refreshSession]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

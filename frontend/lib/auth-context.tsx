'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from './api';

export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'super_admin' | 'admin' | 'user';
  phone?: string;
  is_email_verified?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: any | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => Promise<any>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const storedToken = localStorage.getItem('auth_token');
      if (!storedToken) {
        setUser(null);
        setProfile(null);
        setToken(null);
        setIsLoading(false);
        return;
      }

      setToken(storedToken);
      const res = await api.get('/auth/me', storedToken);
      if (res.success && res.data) {
        setUser(res.data.user);
        setProfile(res.data.profile);
      } else {
        localStorage.removeItem('auth_token');
        setUser(null);
        setProfile(null);
        setToken(null);
      }
    } catch {
      localStorage.removeItem('auth_token');
      setUser(null);
      setProfile(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data) {
      localStorage.setItem('auth_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      await refreshUser();
      return res.data;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => {
    const res = await api.post('/auth/register', data);
    if (res.success && res.data) {
      localStorage.setItem('auth_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      await refreshUser();
      return res.data;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
    setProfile(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
        isSuperAdmin: user?.role === 'super_admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

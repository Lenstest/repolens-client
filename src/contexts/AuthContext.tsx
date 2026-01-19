import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { toast } from 'sonner';

interface User {
  github_id: number;
  email: string;
  name: string;
  avatar_url: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null; // Deprecated: kept for backward compatibility
  login: () => void;
  logout: () => void;
  isLoading: boolean;
  isDemoMode: boolean;
  enterDemoMode: () => void;
  exitDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const fetchCurrentUser = useCallback(async () => {
    try {
      // Backend will check httpOnly cookie automatically
      const data = await api.get<User>('/api/auth/me');
      setUser(data);

      // Auto-exit demo mode when user successfully authenticates
      const storedDemoMode = localStorage.getItem('demoMode');
      if (storedDemoMode === 'true') {
        localStorage.removeItem('demoMode');
        setIsDemoMode(false);
      }
    } catch (error) {
      // User not authenticated - this is normal, don't show error
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check demo mode first
    const storedDemoMode = localStorage.getItem('demoMode');
    if (storedDemoMode === 'true') {
      setIsDemoMode(true);
      setIsLoading(false);
      return;
    }

    // Try to fetch current user (auth via httpOnly cookie)
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Refetch user when navigating to dashboard (catches OAuth redirects)
  useEffect(() => {
    const checkAuthOnNavigation = () => {
      // If we're on dashboard and don't have a user yet, refetch
      if (window.location.pathname === '/dashboard' && !user && !isDemoMode) {
        fetchCurrentUser();
      }
    };

    // Check immediately on mount
    checkAuthOnNavigation();

    // Listen for navigation events (for OAuth redirects)
    const handlePopState = () => checkAuthOnNavigation();
    const handlePushState = () => checkAuthOnNavigation();

    window.addEventListener('popstate', handlePopState);

    // Intercept pushState and replaceState to detect navigation
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function(...args) {
      originalPushState.apply(this, args);
      handlePushState();
    };

    window.history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      handlePushState();
    };

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [user, isDemoMode, fetchCurrentUser]);

  const login = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    window.location.href = `${apiUrl}/api/auth/github`;
  };

  const logout = async () => {
    if (!user && !isDemoMode) return;

    try {
      // Call backend to blacklist token and clear cookies
      await api.post('/api/auth/logout');
      toast.success('Logged out successfully');
    } catch (error) {
      // Even if backend call fails, clear local state
      if (!import.meta.env.PROD) {
        console.error('Logout failed:', error);
      }
    }

    // Clear local state
    localStorage.removeItem('demoMode');
    setUser(null);
    setIsDemoMode(false);
  };

  const enterDemoMode = useCallback(() => {
    setIsDemoMode(true);
    localStorage.setItem('demoMode', 'true');
  }, []);

  const exitDemoMode = useCallback(() => {
    setIsDemoMode(false);
    localStorage.removeItem('demoMode');
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token: null, // Deprecated: tokens now managed via httpOnly cookies
      login,
      logout,
      isLoading,
      isDemoMode,
      enterDemoMode,
      exitDemoMode
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

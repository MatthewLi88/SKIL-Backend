import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, VolunteerProfile, LoginCredentials, RegisterData } from '../types';
import { isAuthenticated, clearTokens } from '../api/client';
import * as authApi from '../api/auth';

interface AuthContextType {
  user: User | null;
  profile: VolunteerProfile | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<VolunteerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    async function checkAuth() {
      if (isAuthenticated()) {
        try {
          const profileData = await authApi.getProfile();
          setProfile(profileData);
          setUser(profileData.user);
        } catch {
          // Token invalid, clear it
          clearTokens();
        }
      }
      setIsLoading(false);
    }
    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const userData = await authApi.login(credentials);
    setUser(userData);
    // Fetch full profile
    const profileData = await authApi.getProfile();
    setProfile(profileData);
  };

  const register = async (data: RegisterData) => {
    const userData = await authApi.register(data);
    setUser(userData);
    // Fetch full profile
    const profileData = await authApi.getProfile();
    setProfile(profileData);
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    const profileData = await authApi.getProfile();
    setProfile(profileData);
    setUser(profileData.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isLoggedIn: !!user,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

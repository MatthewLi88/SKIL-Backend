import { api, setTokens, clearTokens } from './client';
import type { User, AuthTokens, LoginCredentials, RegisterData, VolunteerProfile, UpdateUserData, ChangePasswordData } from '../types';

interface LoginResponse {
  access: string;
  refresh: string;
}

interface RegisterResponse {
  user: User;
  tokens: AuthTokens;
  message: string;
}

export async function login(credentials: LoginCredentials): Promise<User> {
  const response = await api.post<LoginResponse>('/auth/login/', credentials, { skipAuth: true });
  setTokens(response.access, response.refresh);

  // Fetch user profile after login
  const profile = await api.get<VolunteerProfile>('/profile/');
  return profile.user;
}

export async function register(data: RegisterData): Promise<User> {
  const response = await api.post<RegisterResponse>('/auth/register/', data, { skipAuth: true });
  setTokens(response.tokens.access, response.tokens.refresh);
  return response.user;
}

export function logout(): void {
  clearTokens();
}

export async function getProfile(): Promise<VolunteerProfile> {
  return api.get<VolunteerProfile>('/profile/');
}

export async function updateProfile(data: Partial<VolunteerProfile>): Promise<VolunteerProfile> {
  return api.patch<VolunteerProfile>('/profile/', data);
}

export async function updateUser(data: UpdateUserData): Promise<User> {
  return api.patch<User>('/profile/update-user/', data);
}

export async function changePassword(data: ChangePasswordData): Promise<{ message: string }> {
  return api.post<{ message: string }>('/profile/change-password/', data);
}

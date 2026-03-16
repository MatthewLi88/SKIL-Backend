// User types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

// Auth types
export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

// Profile types
export interface VolunteerProfile {
  id: number;
  user: User;
  phone_number: string;
  age?: number | null;
  areas_of_interest: string[];
  questionnaire_completed: boolean;
  total_hours: number;
  events_count: number;
  created_at: string;
  updated_at: string;
}

// Category type
export interface Category {
  key: string;
  label: string;
}

// Event types
export interface Event {
  id: number;
  name: string;
  description: string;
  category: string;
  date: string;
  end_time?: string;
  location: string;
  address?: string;
  max_volunteers: number;
  min_age?: number | null;
  organization_name: string;
  contact_email?: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  spots_remaining: number | null;
  is_full: boolean;
  is_signed_up?: boolean;
  signup_status?: string | null;
  created_at: string;
}

export interface EventListItem {
  id: number;
  name: string;
  category: string;
  date: string;
  location: string;
  organization_name: string;
  spots_remaining: number | null;
  is_full: boolean;
  status: string;
  min_age?: number | null;
}

// Signup types
export interface EventSignup {
  id: number;
  event: Event;
  status: 'signed_up' | 'attended' | 'completed' | 'no_show' | 'cancelled';
  hours_logged: number;
  signed_up_at: string;
  updated_at: string;
  notes: string;
}

// Stats type
export interface VolunteerStats {
  total_hours: number;
  events_attended: number;
  upcoming_events: number;
  events_signed_up: number;
}

// Profile update types
export interface UpdateUserData {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  new_password_confirm: string;
}

// API Response types
export interface ApiError {
  detail?: string;
  error?: string;
  [key: string]: unknown;
}

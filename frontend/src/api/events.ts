import { api } from './client';
import type { Event, EventListItem, EventSignup, Category, VolunteerStats, VolunteerProfile, Organization } from '../types';

// Categories
export async function getCategories(): Promise<Category[]> {
  return api.get<Category[]>('/categories/', { skipAuth: true });
}

// Events
export async function getEvents(category?: string): Promise<EventListItem[]> {
  const params = category ? `?category=${category}` : '';
  return api.get<EventListItem[]>(`/events/${params}`, { skipAuth: true });
}

export async function getEvent(id: number): Promise<Event> {
  return api.get<Event>(`/events/${id}/`);
}

export async function getRecommendedEvents(): Promise<EventListItem[]> {
  return api.get<EventListItem[]>('/events/recommended/');
}

// Signups
export async function getMySignups(): Promise<EventSignup[]> {
  return api.get<EventSignup[]>('/signups/');
}

export async function signUpForEvent(eventId: number): Promise<EventSignup> {
  return api.post<EventSignup>('/signups/', { event_id: eventId });
}

export async function cancelSignup(signupId: number): Promise<void> {
  return api.post<void>(`/signups/${signupId}/cancel/`);
}

// Stats
export async function getMyStats(): Promise<VolunteerStats> {
  return api.get<VolunteerStats>('/stats/');
}

// Questionnaire
interface QuestionnaireData {
  areas_of_interest: string[];
  phone_number?: string;
  age?: number | null;
}

interface QuestionnaireResponse {
  message: string;
  profile: VolunteerProfile;
  recommended_events: EventListItem[];
}

export async function submitQuestionnaire(data: QuestionnaireData): Promise<QuestionnaireResponse> {
  return api.post<QuestionnaireResponse>('/questionnaire/', data);
}

// Organization registration
interface OrgRegistrationData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  org_name: string;
  org_description?: string;
  org_website?: string;
  org_contact_email?: string;
  org_contact_phone?: string;
}

interface OrgRegistrationResponse {
  organization: Organization;
  tokens: { access: string; refresh: string };
  message: string;
}

export async function registerOrganization(data: OrgRegistrationData): Promise<OrgRegistrationResponse> {
  return api.post<OrgRegistrationResponse>('/auth/register/organization/', data, { skipAuth: true });
}

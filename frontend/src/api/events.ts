import { api } from './client';
import type { Event, EventListItem, EventSignup, Category, VolunteerStats, VolunteerProfile } from '../types';

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

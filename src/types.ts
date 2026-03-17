export interface User {
  id: string;
  name: string;
  dob: string;
  gender: string;
  language: string;
  trial_start_date: string;
  is_subscribed: boolean;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export type Language = 'pt' | 'en' | 'es' | 'fr' | 'it' | 'de';

export const LANGUAGES: Record<Language, string> = {
  pt: 'Português',
  en: 'English',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano',
  de: 'Deutsch'
};

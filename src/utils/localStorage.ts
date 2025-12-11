/**
 * localStorage utility functions for user preferences and contact submissions
 */

// Types
export interface UserPreference {
  theme: 'light' | 'dark';
  language: 'en' | 'ur';
  last_chapter_slug: string | null;
  bookmarks: string[];
  reading_progress: Record<string, number>;
  consent_analytics: boolean;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
  status: 'pending' | 'reviewed';
}

// Keys
const PREFERENCES_KEY = 'user_preferences';
const CONTACT_SUBMISSIONS_KEY = 'contact_submissions';

// User Preferences Functions
export function getUserPreferences(): UserPreference {
  if (typeof window === 'undefined') return getDefaultPreferences();

  const stored = localStorage.getItem(PREFERENCES_KEY);
  if (!stored) return getDefaultPreferences();

  try {
    return JSON.parse(stored);
  } catch {
    return getDefaultPreferences();
  }
}

export function saveUserPreferences(prefs: Partial<UserPreference>): void {
  if (typeof window === 'undefined') return;

  const current = getUserPreferences();
  const updated = { ...current, ...prefs };
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
}

export function getDefaultPreferences(): UserPreference {
  return {
    theme: 'light',
    language: 'en',
    last_chapter_slug: null,
    bookmarks: [],
    reading_progress: {},
    consent_analytics: false,
  };
}

// Contact Submissions Functions
export function getContactSubmissions(): ContactSubmission[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(CONTACT_SUBMISSIONS_KEY);
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function addContactSubmission(
  name: string,
  email: string,
  message: string
): ContactSubmission {
  if (typeof window === 'undefined') {
    throw new Error('localStorage not available');
  }

  const submission: ContactSubmission = {
    id: generateUUID(),
    name,
    email,
    message,
    timestamp: new Date().toISOString(),
    status: 'pending',
  };

  const submissions = getContactSubmissions();
  submissions.push(submission);
  localStorage.setItem(CONTACT_SUBMISSIONS_KEY, JSON.stringify(submissions));

  return submission;
}

export function updateReadingProgress(chapterSlug: string, percentage: number): void {
  const prefs = getUserPreferences();
  prefs.reading_progress[chapterSlug] = Math.min(100, Math.max(0, percentage));
  saveUserPreferences(prefs);
}

export function addBookmark(chapterSlug: string): void {
  const prefs = getUserPreferences();
  if (!prefs.bookmarks.includes(chapterSlug)) {
    prefs.bookmarks.push(chapterSlug);
    saveUserPreferences(prefs);
  }
}

export function removeBookmark(chapterSlug: string): void {
  const prefs = getUserPreferences();
  prefs.bookmarks = prefs.bookmarks.filter(slug => slug !== chapterSlug);
  saveUserPreferences(prefs);
}

// Helper: Generate UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

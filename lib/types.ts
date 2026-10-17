export type Path = 'Hindu' | 'Jain';
export type PracticeKind = 'jap' | 'meditation';

export interface UserPreferences {
  hasOnboarded: boolean;
  path: Path;
  focus: string;
  enabled: Record<PracticeKind, boolean>;
  reminderTime: string;
  language: 'English' | 'Hindi';
  notifications: boolean;
}

export interface DailyCompletion {
  date: string;
  completed: PracticeKind[];
}

export interface JapSession {
  mantra: string;
  currentCount: number;
  targetCount: number;
}

export interface MeditationSession {
  minutes: number;
  completedAt?: string;
}

export interface Streak {
  current: number;
  longest: number;
}

export const defaultPreferences: UserPreferences = {
  hasOnboarded: false,
  path: 'Hindu',
  focus: 'Ram',
  enabled: { jap: true, meditation: true },
  reminderTime: '07:00',
  language: 'English',
  notifications: false,
};
import { apiClient } from "@/lib/api/client";

export type CreateNaamJapSession = {
  targetRepetitions: number;
  completedRepetitions: number;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  completed: boolean;
  clientSessionId: string;
};
export type CreateMeditationSession = {
  presetId?: string;
  plannedMinutes: number;
  actualSeconds: number;
  startedAt: string;
  endedAt?: string;
  completed: boolean;
  completionReason?: "completed" | "interrupted" | "cancelled";
  clientSessionId: string;
};
export type ApiGoal = {
  practice: "naam_jap" | "meditation";
  target: string;
  progress: number;
  complete: boolean;
};
export type TodayGoals = {
  date: string;
  enabledPractices: Array<"naam_jap" | "meditation">;
  goals: ApiGoal[];
  allComplete: boolean;
};
export type TodayProgress = {
  date: string;
  completed: boolean;
  naam_jap: boolean;
  meditation: boolean;
  breakdown?: { naam_jap: boolean; meditation: boolean };
};
export type ProgressHistory = {
  month: string;
  items: Array<{ date: string; complete: boolean }>;
};
export type ApiStreak = { current: number; longest: number };

export const createNaamJapSession = (body: CreateNaamJapSession) =>
  apiClient.post<{ session: unknown; idempotent: boolean }>(
    "/naam-jap/sessions",
    body,
  );
export const createMeditationSession = (body: CreateMeditationSession) =>
  apiClient.post<{ session: unknown; idempotent: boolean }>(
    "/meditation/sessions",
    body,
  );
export const getTodayGoals = () =>
  apiClient.get<TodayGoals>("/daily-practice/goals/today");
export const getTodayProgress = () =>
  apiClient.get<TodayProgress>("/progress/today");
export const getProgressHistory = (month: string) =>
  apiClient.get<ProgressHistory>(
    `/progress/history?month=${encodeURIComponent(month)}`,
  );
export const getProgressStreak = () =>
  apiClient.get<ApiStreak>("/progress/streak");

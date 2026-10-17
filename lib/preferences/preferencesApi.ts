import { apiClient } from "@/lib/api/client";

export type ApiReminder = { enabled: boolean; localTime: string };
export type ApiPreferences = {
  userId: string;
  traditionId: string;
  primaryFocusId?: string;
  enabledPractices: Array<"naam_jap" | "meditation">;
  naamJapTarget?: number;
  meditationTargetMinutes?: number;
  reminder: ApiReminder;
};
export type UpdatePreferencesRequest = {
  traditionId: string;
  primaryFocusId?: string;
  enabledPractices: Array<"naam_jap" | "meditation">;
  naamJapTarget?: number;
  meditationTargetMinutes?: number;
  reminder: ApiReminder;
};
export type HomeToday = {
  greeting: string;
  dailyGoals: Array<{
    practice: "naam_jap" | "meditation";
    targetLabel: string;
    progress: number;
    complete: boolean;
  }>;
  meditationPreset: { id: string; key: string; durationMinutes: number } | null;
};

export const getPreferences = () => apiClient.get<ApiPreferences>("/preferences");
export const savePreferences = (body: UpdatePreferencesRequest) =>
  apiClient.put<ApiPreferences>("/preferences", body);
export const getHomeToday = () => apiClient.get<HomeToday>("/home");

import { apiClient } from "@/lib/api/client";

export type BootstrapConfig = {
  traditions: Array<{ id: string; key: string; name: string }>;
  focuses: Array<{ id: string; key: string; name: string; traditionIds: string[] }>;
  tags: Array<{ id: string; key: string; name: string; type: string }>;
  practices: Array<"naam_jap" | "meditation">;
  meditationPresets: Array<{ id: string; key: string; durationMinutes: number }>;
  languages: string[];
  reminderDefaults: { enabled: boolean; localTime: string };
};

export type FeatureFlag = { key: string; isActive: boolean };
export type FeaturesResponse = { features: FeatureFlag[] };

export async function fetchBootstrapConfig(): Promise<BootstrapConfig> {
  return apiClient.get<BootstrapConfig>("/bootstrap", { authenticated: false });
}

export async function fetchFeatureFlags(): Promise<FeaturesResponse> {
  return apiClient.get<FeaturesResponse>("/features");
}

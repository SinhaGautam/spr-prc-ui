import { apiClient } from "@/lib/api/client";
import { Platform } from "react-native";
import type { InstallationCredentials } from "./secureInstallation";

export type AuthSessionResponse = {
  session: { token: string; expiresAt: string };
  user: {
    id: string;
    username: string;
    displayName?: string;
    provider: string;
    status: "active" | "inactive" | "suspended";
    timezone: string;
    language: string;
  };
  installation: {
    installationId: string;
    platform: "android" | "ios";
    createdAt: string;
  };
};

export type AuthUser = AuthSessionResponse["user"];

function getTimezone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
  } catch {
    return undefined;
  }
}

export async function createInstallationSession(
  credentials: InstallationCredentials
): Promise<AuthSessionResponse> {
  if (Platform.OS !== "ios" && Platform.OS !== "android") {
    throw new Error("Bhak API authentication supports iOS and Android only.");
  }

  return apiClient.post<AuthSessionResponse>(
    "/auth/session",
    {
      installationId: credentials.installationId,
      installationSecret: credentials.installationSecret,
      platform: Platform.OS,
      language: "en",
      ...(getTimezone() ? { timezone: getTimezone() } : {}),
    },
    { authenticated: false }
  );
}

export async function revokeCurrentSession(): Promise<void> {
  await apiClient.delete<void>("/auth/session");
}

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ApiError, ApiConfigurationError, apiClient } from "@/lib/api/client";
import {
  createInstallationSession,
  revokeCurrentSession,
  type AuthUser,
} from "@/lib/auth/authApi";
import {
  clearAccessSession,
  loadOrCreateInstallationCredentials,
  readAccessSession,
  saveAccessSession,
} from "@/lib/auth/secureInstallation";

type AuthStatus = "loading" | "authenticated" | "error";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  error: string | null;
  retry: () => Promise<void>;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readableError(error: unknown): string {
  if (error instanceof ApiConfigurationError) return error.message;
  if (error instanceof ApiError) {
    if (error.status === 0) return error.message;
    if (error.status === 401 || error.status === 403)
      return "Authentication could not be established. Please retry.";
    return error.message;
  }
  return error instanceof Error
    ? error.message
    : "Authentication failed. Please try again.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    setStatus("loading");
    setError(null);
    apiClient.setAccessToken(null);
    try {
      const previousSession = await readAccessSession();
      if (previousSession) {
        const expiresAt = Date.parse(previousSession.expiresAt);
        if (Number.isFinite(expiresAt) && expiresAt > Date.now()) {
          apiClient.setAccessToken(previousSession.token);
          try {
            await revokeCurrentSession();
          } catch {
            /* Best-effort cleanup only. */
          }
        }
        await clearAccessSession();
      }
      const credentials = await loadOrCreateInstallationCredentials();
      const response = await createInstallationSession(credentials);
      await saveAccessSession(
        response.session.token,
        response.session.expiresAt,
      );
      apiClient.setAccessToken(response.session.token);
      setUser(response.user);
      setStatus("authenticated");
    } catch (cause) {
      apiClient.setAccessToken(null);
      setUser(null);
      setError(readableError(cause));
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    apiClient.setUnauthorizedHandler(refreshSession);
    void refreshSession();
    return () => apiClient.setUnauthorizedHandler(null);
  }, [refreshSession]);

  const retry = useCallback(async () => {
    await refreshSession();
  }, [refreshSession]);

  const signOut = useCallback(async () => {
    try {
      if (apiClient.getAccessToken()) await revokeCurrentSession();
    } finally {
      apiClient.setAccessToken(null);
      await clearAccessSession().catch(() => undefined);
      setUser(null);
      setError("Session ended. Retry to establish a new session.");
      setStatus("error");
      // Installation credentials are intentionally retained. Retrying resumes
      // the same installation-bound anonymous user.
    }
  }, []);

  const value = useMemo(
    () => ({ status, user, error, retry, refreshSession, signOut }),
    [status, user, error, retry, refreshSession, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}

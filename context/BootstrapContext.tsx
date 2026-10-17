import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { BootstrapConfig, FeatureFlag, fetchBootstrapConfig, fetchFeatureFlags } from "@/lib/bootstrap/bootstrapApi";
import { useAuth } from "@/context/AuthContext";

type BootstrapStatus = "loading" | "ready" | "error";
type PracticeKey = "naam_jap" | "meditation" | "reading";

type BootstrapContextValue = {
  status: BootstrapStatus;
  bootstrap: BootstrapConfig | null;
  features: FeatureFlag[];
  error: string | null;
  retry: () => Promise<void>;
  isFeatureEnabled: (key: string) => boolean;
  isPracticeAvailable: (practice: PracticeKey) => boolean;
};

const BootstrapContext = createContext<BootstrapContextValue | null>(null);

function messageFor(error: unknown): string {
  if (error instanceof ApiError && error.status === 401) {
    return "Your session could not be verified. Please retry.";
  }
  return error instanceof Error ? error.message : "App configuration could not be loaded. Please retry.";
}

export function BootstrapProvider({ children }: { children: ReactNode }) {
  const { status: authStatus } = useAuth();
  const [status, setStatus] = useState<BootstrapStatus>("loading");
  const [bootstrap, setBootstrap] = useState<BootstrapConfig | null>(null);
  const [features, setFeatures] = useState<FeatureFlag[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (authStatus !== "authenticated") return;
    setStatus("loading");
    setError(null);
    // Clear stale configuration before each attempt: stale flags must never
    // authorize a feature while a fresh server response is unavailable.
    setBootstrap(null);
    setFeatures([]);
    try {
      const [config, featureResponse] = await Promise.all([
        fetchBootstrapConfig(),
        fetchFeatureFlags(),
      ]);
      if (!config || !Array.isArray(config.practices) || !Array.isArray(featureResponse?.features)) {
        throw new Error("The server returned an invalid configuration response.");
      }
      setBootstrap(config);
      setFeatures(featureResponse.features.filter(
        (item): item is FeatureFlag => Boolean(item && typeof item.key === "string" && typeof item.isActive === "boolean")
      ));
      setStatus("ready");
    } catch (cause) {
      setBootstrap(null);
      setFeatures([]);
      setError(messageFor(cause));
      setStatus("error");
    }
  }, [authStatus]);

  useEffect(() => {
    if (authStatus === "authenticated") void load();
    else if (authStatus === "error") {
      setStatus("error");
      setError("Authentication is unavailable. Retry the connection before loading app configuration.");
    }
  }, [authStatus, load]);

  const isFeatureEnabled = useCallback((key: string) => {
    if (status !== "ready") return false;
    return features.some((feature) => feature.key === key && feature.isActive);
  }, [features, status]);

  const isPracticeAvailable = useCallback((practice: PracticeKey) => {
    if (status !== "ready" || !bootstrap) return false;
    // The bootstrap catalogue is authoritative. A flag alone cannot enable a
    // practice that this API version does not support.
    if (practice === "reading") return false;
    const flagKey = practice === "naam_jap" ? "spr-naam-jap-enabled" : "spr-meditation-enabled";
    return bootstrap.practices.includes(practice) && isFeatureEnabled(flagKey);
  }, [bootstrap, isFeatureEnabled, status]);

  const value = useMemo(() => ({
    status, bootstrap, features, error, retry: load, isFeatureEnabled, isPracticeAvailable,
  }), [status, bootstrap, features, error, load, isFeatureEnabled, isPracticeAvailable]);

  return <BootstrapContext.Provider value={value}>{children}</BootstrapContext.Provider>;
}

export function useBootstrap() {
  const value = useContext(BootstrapContext);
  if (!value) throw new Error("useBootstrap must be used inside BootstrapProvider");
  return value;
}

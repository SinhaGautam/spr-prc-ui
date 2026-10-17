import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { BootstrapConfig, FeatureFlag, fetchBootstrapConfig, fetchFeatureFlags } from "@/lib/bootstrap/bootstrapApi";
import { useAuth } from "@/context/AuthContext";

type PracticeKey = "naam_jap" | "meditation" | "reading";
type ContextValue = {
  status: "loading" | "ready" | "error";
  bootstrap: BootstrapConfig | null;
  features: FeatureFlag[];
  error: string | null;
  retry: () => Promise<void>;
  isPracticeAvailable: (practice: PracticeKey) => boolean;
};
const BootstrapContext = createContext<ContextValue | null>(null);

function errorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 401) return "Your session could not be verified. Please retry.";
  return error instanceof Error ? error.message : "App configuration could not be loaded. Please retry.";
}

export function BootstrapProvider({ children }: { children: ReactNode }) {
  const { status: authStatus } = useAuth();
  const [status, setStatus] = useState<ContextValue["status"]>("loading");
  const [bootstrap, setBootstrap] = useState<BootstrapConfig | null>(null);
  const [features, setFeatures] = useState<FeatureFlag[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (authStatus !== "authenticated") return;
    setStatus("loading");
    setError(null);
    setBootstrap(null);
    setFeatures([]);
    try {
      const [config, flags] = await Promise.all([fetchBootstrapConfig(), fetchFeatureFlags()]);
      if (!config || !Array.isArray(config.practices) || !Array.isArray(flags?.features)) {
        throw new Error("The server returned an invalid configuration response.");
      }
      setBootstrap(config);
      setFeatures(flags.features.filter((f): f is FeatureFlag =>
        Boolean(f && typeof f.key === "string" && typeof f.isActive === "boolean")
      ));
      setStatus("ready");
    } catch (cause) {
      setBootstrap(null);
      setFeatures([]);
      setError(errorMessage(cause));
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

  const isPracticeAvailable = useCallback((practice: PracticeKey) => {
    if (status !== "ready" || !bootstrap || practice === "reading") return false;
    const flagKey = practice === "naam_jap" ? "spr-naam-jap-enabled" : "spr-meditation-enabled";
    return bootstrap.practices.includes(practice) &&
      features.some((f) => f.key === flagKey && f.isActive === true);
  }, [status, bootstrap, features]);

  const value = useMemo(() => ({ status, bootstrap, features, error, retry: load, isPracticeAvailable }),
    [status, bootstrap, features, error, load, isPracticeAvailable]);
  return <BootstrapContext.Provider value={value}>{children}</BootstrapContext.Provider>;
}

export function useBootstrap() {
  const value = useContext(BootstrapContext);
  if (!value) throw new Error("useBootstrap must be used inside BootstrapProvider");
  return value;
}

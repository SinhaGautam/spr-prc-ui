import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AppState } from "react-native";
import * as Crypto from "expo-crypto";
import {
  defaultPreferences,
  DailyCompletion,
  PracticeKind,
  Streak,
  UserPreferences,
} from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { useBootstrap } from "@/context/BootstrapContext";
import { ApiError } from "@/lib/api/client";
import {
  ApiPreferences,
  HomeToday,
  getHomeToday,
  getPreferences,
  savePreferences,
} from "@/lib/preferences/preferencesApi";
import {
  ApiStreak,
  CreateMeditationSession,
  CreateNaamJapSession,
  getProgressHistory,
  getProgressStreak,
  getTodayGoals,
  getTodayProgress,
  TodayGoals,
} from "@/lib/practice/practiceApi";
import {
  enqueueMeditation,
  enqueueNaamJap,
  flushPracticeQueue,
  installPracticeQueueAutoSync,
} from "@/lib/practice/practiceQueue";
import { syncDailyReminder } from "@/lib/notifications/notificationService";

interface BhakContextValue {
  preferences: UserPreferences;
  history: DailyCompletion[];
  streak: Streak;
  home: HomeToday | null;
  goals: TodayGoals | null;
  todayProgress: {
    date: string;
    completed: boolean;
    naam_jap: boolean;
    meditation: boolean;
  } | null;
  loading: boolean;
  savingPreferences: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updatePreferences: (next: Partial<UserPreferences>) => Promise<void>;
  updateEnabled: (kind: PracticeKind, enabled: boolean) => Promise<void>;
  submitNaamJap: (
    input: Omit<CreateNaamJapSession, "clientSessionId">,
  ) => Promise<void>;
  submitMeditation: (
    input: Omit<CreateMeditationSession, "clientSessionId">,
  ) => Promise<void>;
  completePractice: (kind: PracticeKind) => void;
  resetData: () => void;
}
const BhakContext = createContext<BhakContextValue | null>(null);
function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
function fromApiPreferences(
  value: ApiPreferences,
  traditions: Array<{ id: string; key: string; name: string }>,
  focuses: Array<{
    id: string;
    key: string;
    name: string;
    traditionIds: string[];
  }>,
): UserPreferences {
  const tradition = traditions.find((item) => item.id === value.traditionId);
  const focus = focuses.find((item) => item.id === value.primaryFocusId);
  return {
    hasOnboarded: true,
    path: /jain/i.test(`${tradition?.key ?? ""} ${tradition?.name ?? ""}`)
      ? "Jain"
      : "Hindu",
    focus: focus?.name ?? focus?.key ?? defaultPreferences.focus,
    enabled: {
      jap: (value.enabledPractices ?? []).includes("naam_jap"),
      meditation: (value.enabledPractices ?? []).includes("meditation"),
    },
    reminderTime: value.reminder?.localTime ?? "07:00",
    notifications: value.reminder?.enabled ?? false,
    language: "English",
  };
}
function errorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : error instanceof Error
      ? error.message
      : "Could not load or save server data. Please try again.";
}
function mapHistory(
  items: Array<{ date: string; complete: boolean }>,
): DailyCompletion[] {
  return items
    .filter((item) => item.complete)
    .map((item) => ({
      date: item.date,
      completed: ["jap", "meditation"] as PracticeKind[],
    }));
}
function normalizeProgress(
  value: Awaited<ReturnType<typeof getTodayProgress>>,
) {
  return {
    date: value.date,
    completed: value.completed,
    naam_jap: value.naam_jap ?? value.breakdown?.naam_jap ?? false,
    meditation: value.meditation ?? value.breakdown?.meditation ?? false,
  };
}
export function BhakProvider({ children }: { children: ReactNode }) {
  const { status: authStatus } = useAuth();
  const { bootstrap, status: bootstrapStatus } = useBootstrap();
  const [preferences, setPreferences] =
    useState<UserPreferences>(defaultPreferences);
  const [history, setHistory] = useState<DailyCompletion[]>([]);
  const [home, setHome] = useState<HomeToday | null>(null);
  const [goals, setGoals] = useState<TodayGoals | null>(null);
  const [todayProgress, setTodayProgress] = useState<ReturnType<
    typeof normalizeProgress
  > | null>(null);
  const [streak, setStreak] = useState<Streak>({ current: 0, longest: 0 });
  const [loading, setLoading] = useState(true);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (
      authStatus !== "authenticated" ||
      bootstrapStatus !== "ready" ||
      !bootstrap
    )
      return;
    setLoading(true);
    setError(null);
    try {
      await flushPracticeQueue();
      const [
        prefs,
        homeToday,
        todayGoals,
        today,
        historyResponse,
        serverStreak,
      ] = await Promise.all([
        getPreferences(),
        getHomeToday(),
        getTodayGoals(),
        getTodayProgress(),
        getProgressHistory(monthKey()),
        getProgressStreak(),
      ]);
      setPreferences(
        fromApiPreferences(prefs, bootstrap.traditions, bootstrap.focuses),
      );
      void syncDailyReminder(
        prefs.reminder?.enabled ?? false,
        prefs.reminder?.localTime ?? "07:00",
      ).catch(() => undefined);
      setHome(homeToday);
      setGoals(todayGoals);
      setTodayProgress(normalizeProgress(today));
      setHistory(mapHistory(historyResponse.items));
      setStreak(serverStreak as ApiStreak);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, [authStatus, bootstrapStatus, bootstrap]);

  useEffect(() => {
    if (authStatus === "authenticated" && bootstrapStatus === "ready")
      void refresh();
  }, [authStatus, bootstrapStatus, refresh]);
  useEffect(() => installPracticeQueueAutoSync(), []);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && authStatus === "authenticated") void refresh();
    });
    return () => sub.remove();
  }, [authStatus, refresh]);

  const updatePreferences = useCallback(
    async (next: Partial<UserPreferences>) => {
      if (!bootstrap) throw new Error("Server configuration is not ready.");
      const merged = {
        ...preferences,
        ...next,
        enabled: { ...preferences.enabled, ...(next.enabled ?? {}) },
      };
      const tradition =
        bootstrap.traditions.find(
          (item) =>
            /jain/i.test(`${item.key} ${item.name}`) ===
            (merged.path === "Jain"),
        ) ?? bootstrap.traditions[0];
      const focus =
        bootstrap.focuses.find(
          (item) =>
            item.name.toLowerCase() === merged.focus.toLowerCase() ||
            item.key.toLowerCase() === merged.focus.toLowerCase(),
        ) ??
        bootstrap.focuses.find(
          (item) => tradition && item.traditionIds.includes(tradition.id),
        );
      if (!tradition)
        throw new Error(
          "No spiritual traditions are available in server configuration.",
        );
      const enabledPractices: Array<"naam_jap" | "meditation"> = [];
      if (merged.enabled.jap) enabledPractices.push("naam_jap");
      if (merged.enabled.meditation) enabledPractices.push("meditation");
      if (!enabledPractices.length)
        throw new Error("Enable at least one available practice.");
      setSavingPreferences(true);
      setError(null);
      try {
        const saved = await savePreferences({
          traditionId: tradition.id,
          ...(focus ? { primaryFocusId: focus.id } : {}),
          enabledPractices,
          reminder: {
            enabled: merged.notifications,
            localTime: merged.reminderTime,
          },
        });
        setPreferences(
          fromApiPreferences(saved, bootstrap.traditions, bootstrap.focuses),
        );
        await syncDailyReminder(merged.notifications, merged.reminderTime);
        await refresh();
      } catch (cause) {
        setError(errorMessage(cause));
        throw cause;
      } finally {
        setSavingPreferences(false);
      }
    },
    [bootstrap, preferences, refresh],
  );

  const updateEnabled = useCallback(
    (kind: PracticeKind, enabled: boolean) => {
      return updatePreferences({
        enabled: { ...preferences.enabled, [kind]: enabled },
      });
    },
    [preferences.enabled, updatePreferences],
  );

  const submitNaamJap = useCallback(
    async (input: Omit<CreateNaamJapSession, "clientSessionId">) => {
      if (!bootstrapStatus || !bootstrap)
        throw new Error("Server configuration is not ready.");
      if (!input.completedRepetitions || input.completedRepetitions < 1)
        throw new Error("Complete at least one repetition before saving.");
      await enqueueNaamJap({ ...input, clientSessionId: Crypto.randomUUID() });
      await refresh();
    },
    [bootstrap, bootstrapStatus, refresh],
  );
  const submitMeditation = useCallback(
    async (input: Omit<CreateMeditationSession, "clientSessionId">) => {
      if (!bootstrap) throw new Error("Server configuration is not ready.");
      if (input.actualSeconds < 1)
        throw new Error("Complete some meditation time before saving.");
      await enqueueMeditation({
        ...input,
        clientSessionId: Crypto.randomUUID(),
      });
      await refresh();
    },
    [bootstrap, refresh],
  );

  const completePractice = (kind: PracticeKind) => {
    void kind;
    void refresh();
  };
  const resetData = () => {
    void refresh();
  };
  const value = useMemo(
    () => ({
      preferences,
      history,
      streak,
      home,
      goals,
      todayProgress,
      loading,
      savingPreferences,
      error,
      refresh,
      updatePreferences,
      updateEnabled,
      submitNaamJap,
      submitMeditation,
      completePractice,
      resetData,
    }),
    [
      preferences,
      history,
      streak,
      home,
      goals,
      todayProgress,
      loading,
      savingPreferences,
      error,
      refresh,
      updatePreferences,
      updateEnabled,
      submitNaamJap,
      submitMeditation,
    ],
  );
  return <BhakContext.Provider value={value}>{children}</BhakContext.Provider>;
}
export function useBhak() {
  const value = useContext(BhakContext);
  if (!value) throw new Error("useBhak must be used inside BhakProvider");
  return value;
}

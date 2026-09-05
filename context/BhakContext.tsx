import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { defaultPreferences, DailyCompletion, PracticeKind, Streak, UserPreferences } from '@/lib/types';

const PREFS_KEY = '@bhak/preferences';
const HISTORY_KEY = '@bhak/history';

interface BhakContextValue {
  preferences: UserPreferences;
  history: DailyCompletion[];
  streak: Streak;
  loading: boolean;
  updatePreferences: (next: Partial<UserPreferences>) => void;
  updateEnabled: (kind: PracticeKind, enabled: boolean) => void;
  completePractice: (kind: PracticeKind) => void;
  resetData: () => void;
}

const BhakContext = createContext<BhakContextValue | null>(null);

function dateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calculateStreak(history: DailyCompletion[]): Streak {
  const active = new Set(history.filter((day) => day.completed.length > 0).map((day) => day.date));
  let current = 0;
  const cursor = new Date();
  while (active.has(dateKey(cursor))) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  let longest = 0;
  let run = 0;
  const sorted = [...active].sort();
  sorted.forEach((date, index) => {
    if (index > 0) {
      const previous = new Date(sorted[index - 1]);
      const currentDate = new Date(date);
      const days = Math.round((currentDate.getTime() - previous.getTime()) / 86400000);
      run = days === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
  });
  return { current, longest };
}

export function BhakProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [history, setHistory] = useState<DailyCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(PREFS_KEY), AsyncStorage.getItem(HISTORY_KEY)]).then(([prefs, savedHistory]) => {
      if (prefs) setPreferences({ ...defaultPreferences, ...JSON.parse(prefs) });
      if (savedHistory) setHistory(JSON.parse(savedHistory));
      setLoading(false);
    });
  }, []);

  const updatePreferences = (next: Partial<UserPreferences>) => {
    setPreferences((current) => {
      const updated = { ...current, ...next };
      void AsyncStorage.setItem(PREFS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const updateEnabled = (kind: PracticeKind, enabled: boolean) => {
    updatePreferences({ enabled: { ...preferences.enabled, [kind]: enabled } });
  };

  const completePractice = (kind: PracticeKind) => {
    setHistory((current) => {
      const today = dateKey();
      const existing = current.find((day) => day.date === today);
      const next = existing
        ? current.map((day) => day.date === today && !day.completed.includes(kind)
          ? { ...day, completed: [...day.completed, kind] } : day)
        : [...current, { date: today, completed: [kind] }];
      void AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  };

  const resetData = () => {
    setPreferences(defaultPreferences);
    setHistory([]);
    void AsyncStorage.multiRemove([PREFS_KEY, HISTORY_KEY]);
  };

  const value = useMemo(() => ({ preferences, history, streak: calculateStreak(history), loading, updatePreferences, updateEnabled, completePractice, resetData }), [preferences, history, loading]);
  return <BhakContext.Provider value={value}>{children}</BhakContext.Provider>;
}

export function useBhak() {
  const value = useContext(BhakContext);
  if (!value) throw new Error('useBhak must be used inside BhakProvider');
  return value;
}
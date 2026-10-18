import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { Screen, PracticeCard, BrandMark } from "@/components/Ui";
import { useBhak } from "@/context/BhakContext";
import { useColors } from "@/hooks/useColors";
import { useBootstrap } from "@/context/BootstrapContext";
import { usePracticeQueue } from "@/lib/practice/usePracticeQueue";
import { retryFailedPracticeQueue } from "@/lib/practice/practiceQueue";

export default function Home() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { preferences, home, goals, streak, loading, error, refresh } =
    useBhak();
  const queue = usePracticeQueue();
  const { isPracticeAvailable } = useBootstrap();
  const japAvailable =
    isPracticeAvailable("naam_jap") && preferences.enabled.jap;
  const meditationAvailable =
    isPracticeAvailable("meditation") && preferences.enabled.meditation;
  const dailyGoals = goals?.goals ?? [];
  const japGoal = dailyGoals.find((goal) => goal.practice === "naam_jap");
  const meditationGoal = dailyGoals.find(
    (goal) => goal.practice === "meditation",
  );
  const availableGoals = [
    japAvailable ? japGoal : null,
    meditationAvailable ? meditationGoal : null,
  ].filter(Boolean);
  const completedCount = availableGoals.filter((goal) => goal?.complete).length;
  const availableCount = availableGoals.length;
  const focus = preferences.focus;
  return (
    <Screen>
      <View style={[local.top, { paddingTop: insets.top + 18 }]}>
        <View>
          <Text style={[local.greeting, { color: colors.mutedForeground }]}>
            A quiet place to begin
          </Text>
          <Text style={[local.welcome, { color: colors.foreground }]}>
            {preferences.path === "Jain" ? "Jai Jinendra" : `Jai ${focus}`}
          </Text>
        </View>
        <BrandMark small />
      </View>
      <View style={[local.ritual, { backgroundColor: colors.secondary }]}>
        <View style={[local.ritualGlow, { backgroundColor: colors.card }]}>
          <Feather name="sun" size={16} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[local.ritualEyebrow, { color: colors.primary }]}>
            TODAY'S BHAKTI
          </Text>
          <Text style={[local.ritualText, { color: colors.foreground }]}>
            {home?.greeting ??
              "Return to what matters, one gentle practice at a time."}
          </Text>
        </View>
      </View>
      {loading ? (
        <View style={local.state}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[local.stateText, { color: colors.mutedForeground }]}>
            Loading your practice plan…
          </Text>
        </View>
      ) : error ? (
        <View style={[local.error, { borderColor: colors.border }]}>
          <Text style={[local.stateText, { color: colors.foreground }]}>
            {error}
          </Text>
          <Pressable onPress={() => void refresh()}>
            <Text style={[local.retry, { color: colors.primary }]}>
              Try again
            </Text>
          </Pressable>
        </View>
      ) : null}
      <Text style={[local.practiceLabel, { color: colors.mutedForeground }]}>
        Choose a practice
      </Text>
      {!loading && !error && japAvailable && japGoal ? (
        <PracticeCard
          icon="circle"
          title="Naam Jap"
          subtitle={`${focus} · ${japGoal.target}`}
          action="Start"
          done={japGoal.complete}
          onPress={() => router.push("/jap")}
        />
      ) : null}
      {!loading && !error && meditationAvailable && meditationGoal ? (
        <PracticeCard
          icon="wind"
          title="Meditation"
          subtitle={meditationGoal.target}
          action="Start"
          done={meditationGoal.complete}
          onPress={() => router.push("/meditate")}
        />
      ) : null}
      {!loading && !error && availableCount === 0 ? (
        <Text style={[local.stateText, { color: colors.mutedForeground }]}>
          No enabled practices are available. Update your preferences in
          Settings.
        </Text>
      ) : null}
      <View style={local.streakLine}>
        <Feather name="sunrise" size={16} color={colors.primary} />
        <Text style={[local.streakText, { color: colors.mutedForeground }]}>
          Your daily practice · {streak.current} day streak
        </Text>
        <Text style={[local.completionText, { color: colors.foreground }]}>
          {completedCount} of {availableCount} today
        </Text>
      </View>
      {queue.pending > 0 ? (
        <Pressable
          onPress={() => {
            void retryFailedPracticeQueue().then(refresh);
          }}
        >
          <Text style={[local.queueText, { color: colors.mutedForeground }]}>
            {queue.syncing
              ? "Syncing saved practices…"
              : `${queue.pending} saved practice(s) waiting to sync · Tap to retry`}
          </Text>
        </Pressable>
      ) : null}
      {queue.lastError ? (
        <Text style={[local.queueText, { color: colors.destructive }]}>
          {queue.lastError}
        </Text>
      ) : null}
      <Pressable onPress={() => router.push("/history")}>
        <Text style={[local.historyLink, { color: colors.primary }]}>
          View your days <Feather name="arrow-right" size={14} />
        </Text>
      </Pressable>
    </Screen>
  );
}
const local = StyleSheet.create({
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 34,
  },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular" },
  welcome: {
    fontSize: 29,
    letterSpacing: -0.6,
    fontFamily: "Inter_700Bold",
    marginTop: 7,
  },
  ritual: {
    padding: 19,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    marginBottom: 32,
  },
  ritualGlow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  ritualEyebrow: {
    fontSize: 10,
    letterSpacing: 1.3,
    fontFamily: "Inter_700Bold",
  },
  ritualText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Inter_500Medium",
    marginTop: 5,
  },
  practiceLabel: {
    fontSize: 13,
    letterSpacing: 0.2,
    fontFamily: "Inter_500Medium",
    marginBottom: 14,
  },
  streakLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 18,
    paddingHorizontal: 3,
  },
  streakText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  completionText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  historyLink: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
    marginTop: 25,
  },
  state: { alignItems: "center", padding: 18, gap: 10 },
  stateText: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },
  error: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 18,
  },
  retry: { fontSize: 14, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  queueText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 10,
    fontFamily: "Inter_400Regular",
  },
});

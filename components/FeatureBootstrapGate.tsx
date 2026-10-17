import React, { ReactNode, useEffect } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useSegments } from "expo-router";
import { useBootstrap } from "@/context/BootstrapContext";

export function FeatureBootstrapGate({ children }: { children: ReactNode }) {
  const { status, error, retry, isPracticeAvailable } = useBootstrap();
  const segments = useSegments();
  const route = segments[segments.length - 1];
  const requiredPractice = route === "read" ? "reading" : route === "jap" ? "naam_jap" : route === "meditate" ? "meditation" : null;
  const routeAllowed = !requiredPractice || isPracticeAvailable(requiredPractice);

  useEffect(() => {
    if (status === "ready" && requiredPractice && !routeAllowed) {
      router.replace("/");
    }
  }, [status, requiredPractice, routeAllowed]);

  if (status === "loading") {
    return <View style={styles.container}><ActivityIndicator size="large" color="#5d6d4a" /><Text style={styles.message}>Loading your practice options…</Text></View>;
  }

  if (status === "error") {
    return <View style={styles.container}>
      <Text style={styles.title}>Unable to load app configuration</Text>
      <Text style={styles.message}>{error ?? "Feature availability could not be verified."}</Text>
      <Pressable style={styles.button} onPress={() => void retry()} accessibilityRole="button"><Text style={styles.buttonText}>Try again</Text></Pressable>
    </View>;
  }

  if (!routeAllowed) return <View style={styles.container}><ActivityIndicator size="small" color="#5d6d4a" /><Text style={styles.message}>Returning to available practices…</Text></View>;
  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28, backgroundColor: "#fbf8f1" },
  title: { fontSize: 22, fontWeight: "700", color: "#252820", marginBottom: 8, textAlign: "center" },
  message: { fontSize: 15, lineHeight: 22, color: "#66685e", textAlign: "center", marginTop: 12 },
  button: { marginTop: 22, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, backgroundColor: "#5d6d4a" },
  buttonText: { color: "#fff", fontWeight: "600" },
});

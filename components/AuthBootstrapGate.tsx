import React, { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/context/AuthContext";

export function AuthBootstrapGate({ children }: { children: ReactNode }) {
  const { status, error, retry } = useAuth();

  if (status === "loading") {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#5d6d4a" />
        <Text style={styles.message}>Connecting securely…</Text>
      </View>
    );
  }

  if (status === "error") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Unable to connect</Text>
        <Text style={styles.message}>{error ?? "Authentication could not be established."}</Text>
        <Pressable style={styles.button} onPress={() => void retry()} accessibilityRole="button">
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28, backgroundColor: "#fbf8f1" },
  title: { fontSize: 22, fontWeight: "700", color: "#252820", marginBottom: 8 },
  message: { fontSize: 15, lineHeight: 22, color: "#66685e", textAlign: "center", marginTop: 12 },
  button: { marginTop: 22, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, backgroundColor: "#5d6d4a" },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});

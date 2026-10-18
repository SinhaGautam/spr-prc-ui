import React from "react";
import { Text, View } from "react-native";
import { BrandMark, styles as ui } from "@/components/Ui";
import { useColors } from "@/hooks/useColors";

export default function WelcomeStep() {
  const colors = useColors();
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}
    >
      <BrandMark />
      <Text
        style={{
          color: colors.foreground,
          fontSize: 18,
          fontFamily: "Inter_700Bold",
          letterSpacing: 1,
        }}
      >
        Bhak
      </Text>
      <Text
        style={[ui.title, { color: colors.foreground, textAlign: "center" }]}
      >
        Stay connected every day.
      </Text>
      <Text
        style={[
          ui.detail,
          { color: colors.mutedForeground, textAlign: "center" },
        ]}
      >
        A few peaceful minutes for prayer, remembrance and reflection.
      </Text>
    </View>
  );
}

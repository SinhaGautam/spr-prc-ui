import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { styles as ui } from "@/components/Ui";
import { useColors } from "@/hooks/useColors";
import type { Path } from "@/lib/types";

type Props = {
  value: Path;
  onChange: (path: Path) => void;
};

const PATHS: { value: Path; description: string }[] = [
  { value: "Hindu", description: "Prayer, devotion and remembrance" },
  { value: "Jain", description: "Jain prayers, mantras and mindful living" },
];

export default function SpiritualPathStep({ value, onChange }: Props) {
  const colors = useColors();

  return (
    <View>
      <Text style={[ui.eyebrow, { color: colors.primary }]}>YOUR PATH</Text>
      <Text style={[ui.title, { color: colors.foreground }]}>
        Choose your spiritual path
      </Text>
      <Text style={[ui.detail, { color: colors.mutedForeground }]}>
        Your space can adapt to the traditions and practices that matter to you.
      </Text>
      {PATHS.map((path) => {
        const selected = value === path.value;
        return (
          <Pressable
            key={path.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => onChange(path.value)}
            style={[
              local.option,
              {
                borderColor: selected ? colors.primary : colors.border,
                backgroundColor: selected ? colors.secondary : colors.card,
              },
            ]}
          >
            <View style={local.copy}>
              <Text style={[local.label, { color: colors.foreground }]}>
                {path.value}
              </Text>
              <Text
                style={[local.description, { color: colors.mutedForeground }]}
              >
                {path.description}
              </Text>
            </View>
            <View
              style={[
                local.radio,
                { borderColor: selected ? colors.primary : colors.border },
              ]}
            >
              {selected ? (
                <View
                  style={[local.dot, { backgroundColor: colors.primary }]}
                />
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const local = StyleSheet.create({
  option: {
    minHeight: 72,
    borderWidth: 1,
    borderRadius: 17,
    marginTop: 13,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  copy: { flex: 1, paddingRight: 12 },
  label: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  description: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Inter_400Regular",
    marginTop: 5,
  },
  radio: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
});

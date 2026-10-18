import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { styles as ui } from '@/components/Ui';
import { useColors } from '@/hooks/useColors';
import type { PracticeKind } from '@/lib/types';

type Props = {
  enabled: Record<PracticeKind, boolean>;
  onToggle: (kind: PracticeKind, enabled: boolean) => void;
};

const PRACTICES: { kind: PracticeKind; label: string; description: string }[] = [
  { kind: 'jap', label: 'Naam Jap', description: 'Repeat a name or mantra with gentle attention' },
  { kind: 'meditation', label: 'Meditation', description: 'Take a few quiet minutes to breathe and settle' },
];

export default function DailyPracticeStep({ enabled, onToggle }: Props) {
  const colors = useColors();

  return (
    <View>
      <Text style={[ui.eyebrow, { color: colors.primary }]}>YOUR RHYTHM</Text>
      <Text style={[ui.title, { color: colors.foreground }]}>Your daily practice</Text>
      <Text style={[ui.detail, { color: colors.mutedForeground }]}>Choose the practices you would like to keep in your daily routine. You can change these later.</Text>
      <View style={[local.group, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {PRACTICES.map((practice, index) => (
          <View key={practice.kind} style={[local.row, index < PRACTICES.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
            <View style={local.copy}>
              <Text style={[local.label, { color: colors.foreground }]}>{practice.label}</Text>
              <Text style={[local.description, { color: colors.mutedForeground }]}>{practice.description}</Text>
            </View>
            <Switch
              accessibilityLabel={practice.label}
              value={enabled[practice.kind]}
              onValueChange={(value) => onToggle(practice.kind, value)}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor={enabled[practice.kind] ? colors.primary : colors.mutedForeground}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const local = StyleSheet.create({
  group: { borderWidth: 1, borderRadius: 20, marginTop: 24, paddingHorizontal: 16, overflow: 'hidden' },
  row: { minHeight: 86, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  copy: { flex: 1 },
  label: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  description: { fontSize: 12, lineHeight: 17, fontFamily: 'Inter_400Regular', marginTop: 5 },
});

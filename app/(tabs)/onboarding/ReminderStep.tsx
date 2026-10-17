import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { styles as ui } from '@/components/Ui';
import { useColors } from '@/hooks/useColors';

type Props = { time: string; onChangeTime: () => void };

export default function ReminderStep({ time, onChangeTime }: Props) {
  const colors = useColors();
  return <View>
    <Text style={[ui.eyebrow, { color: colors.primary }]}>A GENTLE NUDGE</Text>
    <Text style={[ui.title, { color: colors.foreground }]}>Choose your daily reminder</Text>
    <Text style={[ui.detail, { color: colors.mutedForeground }]}>Pick a time that gives your practice room to become a part of your day.</Text>
    <View style={[local.timeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[local.time, { color: colors.foreground }]}>{time}</Text>
      <View style={{ alignItems: 'flex-end' }}>
        <Pressable onPress={onChangeTime}><Text style={[local.timeLink, { color: colors.primary }]}>Change time</Text></Pressable>
        <Text style={[local.detail, { color: colors.mutedForeground }]}>Local device time</Text>
      </View>
    </View>
  </View>;
}
const local = StyleSheet.create({
  timeCard: { borderWidth: 1, borderRadius: 20, padding: 22, marginTop: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  time: { fontSize: 44, fontFamily: 'Inter_700Bold', letterSpacing: -1 },
  timeLink: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  detail: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 5 },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandMark, PrimaryButton } from '@/components/Ui';
import { useBhak } from '@/context/BhakContext';
import { useColors } from '@/hooks/useColors';
import { PracticeKind } from '@/lib/types';

export default function Complete() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { completePractice, streak } = useBhak();
  const { kind } = useLocalSearchParams<{ kind: PracticeKind }>();
  const done = () => { completePractice(kind ?? 'reading'); router.replace('/(tabs)'); };
  return <View style={[local.wrap, { backgroundColor: colors.background, paddingTop: insets.top + 30, paddingBottom: insets.bottom + 22 }]}><View style={local.content}><BrandMark /><Text style={[local.eyebrow, { color: colors.primary }]}>A MOMENT KEPT</Text><Text style={[local.title, { color: colors.foreground }]}>Practice complete.</Text><Text style={[local.detail, { color: colors.mutedForeground }]}>May peace remain with you throughout the day.</Text><View style={[local.streak, { borderColor: colors.border }]}><Text style={[local.streakNumber, { color: colors.foreground }]}>{streak.current + 1}</Text><Text style={[local.streakLabel, { color: colors.mutedForeground }]}>days of returning</Text></View></View><View><PrimaryButton label="Done" onPress={done} icon="check" /></View></View>;
}
const local = StyleSheet.create({ wrap: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between' }, content: { alignItems: 'center', justifyContent: 'center', flex: 1 }, eyebrow: { fontSize: 11, letterSpacing: 1.4, fontFamily: 'Inter_700Bold', marginTop: 30 }, title: { fontSize: 32, letterSpacing: -0.7, fontFamily: 'Inter_700Bold', marginTop: 13, textAlign: 'center' }, detail: { fontSize: 16, lineHeight: 26, fontFamily: 'Inter_400Regular', textAlign: 'center', maxWidth: 285, marginTop: 14 }, streak: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 27, paddingVertical: 16, alignItems: 'center', marginTop: 36 }, streakNumber: { fontSize: 27, fontFamily: 'Inter_700Bold' }, streakLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 5 } });
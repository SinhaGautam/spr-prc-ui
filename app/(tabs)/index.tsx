import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Screen, PracticeCard, BrandMark } from '@/components/Ui';
import { useBhak } from '@/context/BhakContext';
import { useColors } from '@/hooks/useColors';

export default function Home() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { preferences, history, streak } = useBhak();
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const today = history.find((day) => day.date === todayKey)?.completed ?? [];
  const focus = preferences.path === 'Jain' ? preferences.focus : preferences.focus;
  const completedCount = today.filter((kind) => preferences.enabled[kind]).length;
  return <Screen><View style={[local.top, { paddingTop: insets.top + 18 }]}><View><Text style={[local.greeting, { color: colors.mutedForeground }]}>A quiet place to begin</Text><Text style={[local.welcome, { color: colors.foreground }]}>{preferences.path === 'Jain' ? 'Jai Jinendra' : `Jai ${focus}`}</Text></View><BrandMark small /></View>
    <View style={[local.ritual, { backgroundColor: colors.secondary }]}><View style={[local.ritualGlow, { backgroundColor: colors.card }]}><Feather name="sun" size={16} color={colors.primary} /></View><View style={{ flex: 1 }}><Text style={[local.ritualEyebrow, { color: colors.primary }]}>TODAY'S BHAKTI</Text><Text style={[local.ritualText, { color: colors.foreground }]}>Return to what matters, one gentle practice at a time.</Text></View></View>
    <Text style={[local.practiceLabel, { color: colors.mutedForeground }]}>Choose a practice</Text>
    {preferences.enabled.reading ? <PracticeCard icon="book-open" title="Reading" subtitle={preferences.path === 'Jain' ? preferences.focus : `${preferences.focus} reflection`} action="Begin" done={today.includes('reading')} onPress={() => router.push('/read')} /> : null}
    {preferences.enabled.jap ? <PracticeCard icon="circle" title="Naam Jap" subtitle={`${preferences.focus} · 0 / 108`} action="Start" done={today.includes('jap')} onPress={() => router.push('/jap')} /> : null}
    {preferences.enabled.meditation ? <PracticeCard icon="wind" title="Meditation" subtitle="5 quiet minutes" action="Start" done={today.includes('meditation')} onPress={() => router.push('/meditate')} /> : null}
    <View style={local.streakLine}><Feather name="sunrise" size={16} color={colors.primary} /><Text style={[local.streakText, { color: colors.mutedForeground }]}>{streak.current > 0 ? `${streak.current} days of returning` : 'Begin your first day of returning'}</Text><Text style={[local.completionText, { color: colors.foreground }]}>{completedCount} of {Object.values(preferences.enabled).filter(Boolean).length} today</Text></View>
    <Pressable onPress={() => router.push('/history')}><Text style={[local.historyLink, { color: colors.primary }]}>View your days <Feather name="arrow-right" size={14} /></Text></Pressable>
  </Screen>;
}

const local = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 34 },
  greeting: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  welcome: { fontSize: 29, letterSpacing: -0.6, fontFamily: 'Inter_700Bold', marginTop: 7 },
  ritual: { padding: 19, borderRadius: 22, flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 32 },
  ritualGlow: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  ritualEyebrow: { fontSize: 10, letterSpacing: 1.3, fontFamily: 'Inter_700Bold' },
  ritualText: { fontSize: 14, lineHeight: 20, fontFamily: 'Inter_500Medium', marginTop: 5 },
  practiceLabel: { fontSize: 13, letterSpacing: 0.2, fontFamily: 'Inter_500Medium', marginBottom: 14 },
  streakLine: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18, paddingHorizontal: 3 },
  streakText: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular' },
  completionText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  historyLink: { fontSize: 14, fontFamily: 'Inter_600SemiBold', textAlign: 'center', marginTop: 25 },
});
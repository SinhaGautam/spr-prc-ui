import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton, PrimaryButton, Screen } from '@/components/Ui';
import { useBhak } from '@/context/BhakContext';
import { useColors } from '@/hooks/useColors';

export default function Reading() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { preferences } = useBhak();
  const title = preferences.path === 'Jain' ? preferences.focus : `${preferences.focus} Reflection`;
  return <View style={[local.wrap, { backgroundColor: colors.background, paddingTop: insets.top }]}><View style={local.header}><BackButton onPress={() => router.back()} /><Text style={[local.headerTitle, { color: colors.foreground }]}>Reading</Text><View style={{ width: 42 }} /></View><Screen><Text style={[local.kicker, { color: colors.primary }]}>A QUIET READING</Text><Text style={[local.title, { color: colors.foreground }]}>{title}</Text><Text style={[local.sample, { color: colors.primary }]}>SAMPLE CONTENT</Text><Text style={[local.body, { color: colors.foreground }]}>This prototype uses a short reflective passage while the complete, verified reading is prepared.</Text><Text style={[local.body, { color: colors.foreground }]}>May this moment bring steadiness to the mind, warmth to the heart, and a little more presence to the day.</Text><Text style={[local.body, { color: colors.foreground }]}>Sit comfortably. Read slowly. Let the words become a gentle place to return to.</Text><View style={[local.progressTrack, { backgroundColor: colors.border }]}><View style={[local.progress, { backgroundColor: colors.primary }]} /></View><Text style={[local.progressText, { color: colors.mutedForeground }]}>A few minutes of reflection</Text><View style={local.bottom}><PrimaryButton label="Complete reading" onPress={() => router.push('/complete?kind=reading')} icon="check" /></View></Screen></View>;
}
const local = StyleSheet.create({ wrap: { flex: 1 }, header: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15 }, headerTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold' }, kicker: { fontSize: 11, letterSpacing: 1.4, fontFamily: 'Inter_700Bold', marginTop: 34 }, title: { fontSize: 31, lineHeight: 39, fontFamily: 'Inter_700Bold', marginTop: 10 }, sample: { fontSize: 10, letterSpacing: 1.2, fontFamily: 'Inter_700Bold', marginTop: 38 }, body: { fontSize: 21, lineHeight: 37, letterSpacing: 0.1, fontFamily: 'Inter_400Regular', marginTop: 19 }, progressTrack: { height: 3, borderRadius: 4, marginTop: 34 }, progress: { width: '42%', height: 3, borderRadius: 4 }, progressText: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 10 }, bottom: { marginTop: 30 } });
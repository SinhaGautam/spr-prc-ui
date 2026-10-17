import React, { useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { BackButton, PrimaryButton, Screen } from '@/components/Ui';
import { useBhak } from '@/context/BhakContext';
import { useColors } from '@/hooks/useColors';

export default function Jap() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { preferences, goals } = useBhak();
  const target = Number(goals?.goals.find((goal) => goal.practice === 'naam_jap')?.target.match(/\d+/)?.[0] ?? 108);
  const [count, setCount] = useState(0);
  const startedAt = useRef(new Date().toISOString());
  const scale = useRef(new Animated.Value(1)).current;
  const mantra = preferences.path === 'Jain' ? 'णमो अरिहंताणं' : preferences.focus;
  const beads = useMemo(() => Array.from({ length: 36 }, (_, index) => index), []);
  const tap = () => { if (count < target) { setCount((current) => current + 1); void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } };
  const animateIn = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 22, bounciness: 3 }).start();
  const animateOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 18, bounciness: 5 }).start();
  return <View style={[local.wrap, { backgroundColor: colors.background, paddingTop: insets.top }]}><View style={local.header}><BackButton onPress={() => router.back()} /><Text style={[local.headerTitle, { color: colors.foreground }]}>Naam Jap</Text><View style={{ width: 42 }} /></View><Screen scroll={false}><View style={local.content}><Text style={[local.kicker, { color: colors.primary }]}>ONE BREATH AT A TIME</Text><Text style={[local.mantra, { color: colors.foreground }]}>{mantra}</Text><Text style={[local.count, { color: colors.foreground }]}>{count}<Text style={[local.target, { color: colors.mutedForeground }]}> / {target}</Text></Text><View style={[local.mala, { borderColor: colors.border }]}>{beads.map((_, index) => { const angle = (index / beads.length) * Math.PI * 2 - Math.PI / 2; const radius = 105; const size = 8; return <View key={index} style={[local.bead, { left: 116 + Math.cos(angle) * radius - size / 2, top: 116 + Math.sin(angle) * radius - size / 2, backgroundColor: index < Math.ceil(count / Math.max(1, target / beads.length)) ? colors.primary : colors.border }]} />; })}<View style={[local.center, { backgroundColor: colors.secondary, borderColor: colors.accent }]}><Text style={[local.rounds, { color: colors.primary }]}>{Math.floor(count / target)}</Text></View></View><Animated.View style={{ transform: [{ scale }] }}><Pressable testID="button-jap-tap" onPress={tap} onPressIn={animateIn} onPressOut={animateOut} style={[local.tap, { backgroundColor: colors.card, borderColor: colors.accent }]}><Text style={[local.tapText, { color: colors.primary }]}>TAP</Text><Text style={[local.tapHint, { color: colors.mutedForeground }]}>with attention</Text></Pressable></Animated.View>{count >= target ? <PrimaryButton label="Complete naam jap" onPress={() => router.push({ pathname: '/complete', params: { kind: 'jap', count: String(count), targetRepetitions: String(target), startedAt: startedAt.current, durationSeconds: String(Math.max(0, Math.floor((Date.now() - new Date(startedAt.current).getTime()) / 1000))) } })} icon="check" /> : null}</View></Screen></View>;
}
const local = StyleSheet.create({ wrap: { flex: 1 }, header: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15 }, headerTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold' }, content: { alignItems: 'center', paddingTop: 33 }, kicker: { fontSize: 11, letterSpacing: 1.3, fontFamily: 'Inter_700Bold' }, mantra: { fontSize: 30, fontFamily: 'Inter_600SemiBold', marginTop: 18, textAlign: 'center' }, count: { fontSize: 48, fontFamily: 'Inter_700Bold', marginTop: 25 }, target: { fontSize: 18, fontFamily: 'Inter_400Regular' }, mala: { width: 240, height: 240, borderWidth: 1, borderRadius: 120, marginTop: 18, alignItems: 'center', justifyContent: 'center' }, bead: { position: 'absolute', width: 8, height: 8, borderRadius: 4 }, center: { width: 64, height: 64, borderRadius: 32, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, rounds: { fontSize: 17, fontFamily: 'Inter_600SemiBold' }, tap: { width: 166, height: 166, borderRadius: 83, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginTop: 18, marginBottom: 20 }, tapText: { fontSize: 27, fontFamily: 'Inter_700Bold', letterSpacing: 2 }, tapHint: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 7 } });
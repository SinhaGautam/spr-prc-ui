import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { BackButton, PrimaryButton, Screen } from '@/components/Ui';
import { useColors } from '@/hooks/useColors';

export default function Meditate() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(300);
  const [running, setRunning] = useState(false);
  useEffect(() => { if (!running) return; if (seconds <= 0) { setRunning(false); void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); router.push('/complete?kind=meditation'); return; } const timer = setInterval(() => setSeconds((current) => current - 1), 1000); return () => clearInterval(timer); }, [running, seconds]);
  const select = (value: number) => { setMinutes(value); setSeconds(value * 60); setRunning(false); };
  return <View style={[local.wrap, { backgroundColor: colors.background, paddingTop: insets.top }]}><View style={local.header}><BackButton onPress={() => router.back()} /><Text style={[local.headerTitle, { color: colors.foreground }]}>Meditation</Text><View style={{ width: 42 }} /></View><Screen scroll={false}><View style={local.content}><Text style={[local.kicker, { color: colors.primary }]}>MAKE SPACE</Text><Text style={[local.title, { color: colors.foreground }]}>Be here for a while.</Text><Text style={[local.timer, { color: colors.foreground }]}>{String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</Text><View style={local.options}>{[5, 10, 15, 20].map((value) => <Pressable key={value} onPress={() => select(value)} style={[local.option, { backgroundColor: minutes === value ? colors.secondary : colors.card, borderColor: minutes === value ? colors.primary : colors.border }]}><Text style={[local.optionText, { color: colors.foreground }]}>{value} min</Text></Pressable>)}</View><View style={local.action}>{running ? <Pressable onPress={() => setRunning(false)} style={[local.pause, { borderColor: colors.border }]}><Text style={[local.pauseText, { color: colors.foreground }]}>Pause</Text></Pressable> : <PrimaryButton label="Begin meditation" onPress={() => setRunning(true)} icon="play" />}</View></View></Screen></View>;
}
const local = StyleSheet.create({ wrap: { flex: 1 }, header: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15 }, headerTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold' }, content: { alignItems: 'center', paddingTop: 58 }, kicker: { fontSize: 11, letterSpacing: 1.3, fontFamily: 'Inter_700Bold' }, title: { fontSize: 26, letterSpacing: -0.4, fontFamily: 'Inter_700Bold', marginTop: 15 }, timer: { fontSize: 60, fontFamily: 'Inter_700Bold', letterSpacing: -2, marginTop: 55 }, options: { flexDirection: 'row', gap: 8, marginTop: 38 }, option: { borderWidth: 1, borderRadius: 15, paddingVertical: 12, paddingHorizontal: 13 }, optionText: { fontSize: 13, fontFamily: 'Inter_500Medium' }, action: { width: '100%', marginTop: 42 }, pause: { minHeight: 58, borderWidth: 1, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, pauseText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' } });
import React, { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, Pressable } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';
import { Screen, styles as ui } from '@/components/Ui';
import { useBhak } from '@/context/BhakContext';
import { useColors } from '@/hooks/useColors';

export default function History() {
  const colors = useColors();
  const { history, streak, loading, error, refresh } = useBhak();
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));
  const now = new Date();
  const month = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const days = Array.from({ length: new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() }, (_, i) => i + 1);
  const dayKey = (day: number) => `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return <Screen>{loading?<ActivityIndicator color={colors.primary}/>:null}{error?<Pressable onPress={()=>void refresh()}><Text style={{color:colors.destructive,marginTop:12}}>Could not refresh progress. Tap to retry: {error}</Text></Pressable>:null}<Text style={[ui.eyebrow, { color: colors.primary, marginTop: 32 }]}>YOUR JOURNEY</Text><Text style={[ui.title, { color: colors.foreground }]}>Practice history</Text><Text style={[ui.detail, { color: colors.mutedForeground }]}>A gentle record of the days you made space for yourself.</Text>
    <View style={[local.summary, { borderColor: colors.border }]}><View><Text style={[local.big, { color: colors.foreground }]}>{streak.current}</Text><Text style={[local.label, { color: colors.mutedForeground }]}>Current return</Text></View><View style={[local.rule, { backgroundColor: colors.border }]} /><View><Text style={[local.big, { color: colors.foreground }]}>{streak.longest}</Text><Text style={[local.label, { color: colors.mutedForeground }]}>Longest return</Text></View></View>
    <Text style={[local.month, { color: colors.foreground }]}>{month}</Text><View style={local.calendar}>{days.map((day) => { const active = history.find((item) => item.date === dayKey(day))?.completed.length; return <View key={day} style={local.day}><View style={[local.dot, { backgroundColor: active ? colors.primary : colors.border }]}>{active ? <Text style={local.tick}>✓</Text> : null}</View><Text style={[local.dayText, { color: colors.mutedForeground }]}>{day}</Text></View>; })}</View>
  </Screen>;
}
const local = StyleSheet.create({ summary: { marginTop: 30, paddingVertical: 18, borderTopWidth: 1, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }, big: { fontSize: 28, fontFamily: 'Inter_700Bold', textAlign: 'center' }, label: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 5 }, rule: { width: 1, height: 38 }, month: { fontSize: 18, fontFamily: 'Inter_600SemiBold', marginTop: 34, marginBottom: 18 }, calendar: { flexDirection: 'row', flexWrap: 'wrap', gap: 13 }, day: { width: 29, alignItems: 'center', gap: 5 }, dot: { width: 25, height: 25, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }, tick: { color: '#fffdf8', fontSize: 13, fontFamily: 'Inter_700Bold' }, dayText: { fontSize: 11, fontFamily: 'Inter_400Regular' } });
import React from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen, styles as ui } from '@/components/Ui';
import { useBhak } from '@/context/BhakContext';
import { useColors } from '@/hooks/useColors';

export default function Settings() {
  const colors = useColors();
  const { preferences, updatePreferences, resetData } = useBhak();
  const reset = () => Alert.alert('Reset local data?', 'Your preferences and history will be cleared from this device.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Reset', style: 'destructive', onPress: () => { resetData(); router.replace('/onboarding'); } }]);
  return <Screen><Text style={[ui.eyebrow, { color: colors.primary, marginTop: 32 }]}>YOUR SPACE</Text><Text style={[ui.title, { color: colors.foreground }]}>Settings</Text><Text style={[ui.detail, { color: colors.mutedForeground }]}>Keep Bhak shaped around your practice.</Text>
    <View style={[local.group, { backgroundColor: colors.card, borderColor: colors.border }]}><Row label="Spiritual path" value={preferences.path} /><Row label="Focus" value={preferences.focus} /><Row label="Reminder" value={preferences.reminderTime} /></View>
    <View style={[local.group, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={local.row}><View><Text style={[local.label, { color: colors.foreground }]}>Notifications</Text><Text style={[local.detail, { color: colors.mutedForeground }]}>A gentle daily reminder</Text></View><Switch value={preferences.notifications} onValueChange={(value) => updatePreferences({ notifications: value })} trackColor={{ false: colors.border, true: colors.accent }} thumbColor={preferences.notifications ? colors.primary : colors.mutedForeground} /></View><Row label="Language" value={preferences.language} /></View>
    <Pressable onPress={reset} style={[local.reset, { borderColor: colors.border }]}><Text style={[local.resetText, { color: colors.destructive }]}>Reset local data</Text></Pressable>
  </Screen>;
}
function Row({ label, value }: { label: string; value: string }) { const colors = useColors(); return <View style={[local.row, { borderBottomColor: colors.border }]}><Text style={[local.label, { color: colors.foreground }]}>{label}</Text><Text style={[local.detail, { color: colors.mutedForeground }]}>{value}</Text></View>; }
const local = StyleSheet.create({ group: { borderWidth: 1, borderRadius: 20, marginTop: 25, overflow: 'hidden' }, row: { minHeight: 58, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1 }, label: { fontSize: 15, fontFamily: 'Inter_500Medium' }, detail: { fontSize: 13, fontFamily: 'Inter_400Regular' }, reset: { minHeight: 52, marginTop: 28, borderWidth: 1, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }, resetText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' } });
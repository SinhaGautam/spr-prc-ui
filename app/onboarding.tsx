import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandMark, PrimaryButton, Screen, styles as ui } from '@/components/Ui';
import { useColors } from '@/hooks/useColors';
import { useBhak } from '@/context/BhakContext';
import { Path, PracticeKind } from '@/lib/types';

const focusOptions: Record<Path, string[]> = { Hindu: ['Hanuman', 'Ram', 'Krishna', 'Shiva', 'Ganesh', 'Durga'], Jain: ['Navkar Mantra', 'Jain Prayer', 'Meditation'] };
const steps = ['welcome', 'path', 'focus', 'practice', 'reminder'] as const;

export default function Onboarding() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { preferences, updatePreferences, updateEnabled } = useBhak();
  const [step, setStep] = useState(0);
  const [path, setPath] = useState<Path>(preferences.path);
  const [focus, setFocus] = useState(preferences.focus);
  const [time, setTime] = useState(preferences.reminderTime);
  const [enabled, setEnabled] = useState(preferences.enabled);
  const next = () => {
    if (step === 4) {
      updatePreferences({ hasOnboarded: true, path, focus, reminderTime: time, enabled });
      router.replace('/(tabs)');
    } else setStep((current) => current + 1);
  };
  const toggle = (kind: PracticeKind) => {
    const nextValue = { ...enabled, [kind]: !enabled[kind] };
    setEnabled(nextValue);
    updateEnabled(kind, nextValue[kind]);
  };
  return <View style={[local.container, { backgroundColor: colors.background, paddingTop: insets.top + 22, paddingBottom: insets.bottom + 18 }]}>
    <View style={local.progressRow}>{steps.map((item, index) => <View key={item} style={[local.progress, { backgroundColor: index <= step ? colors.primary : colors.border }]} />)}</View>
    <Screen scroll={false}><View style={local.inner}>
      {step === 0 ? <View style={local.welcome}><BrandMark /><Text style={[local.brand, { color: colors.foreground }]}>Bhak</Text><Text style={[ui.title, { color: colors.foreground, textAlign: 'center' }]}>Stay connected every day.</Text><Text style={[ui.detail, { color: colors.mutedForeground, textAlign: 'center' }]}>A few peaceful minutes for prayer, remembrance and reflection.</Text></View> : null}
      {step === 1 ? <><Text style={[ui.eyebrow, { color: colors.primary }]}>YOUR PATH</Text><Text style={[ui.title, { color: colors.foreground }]}>Choose your spiritual path</Text><Text style={[ui.detail, { color: colors.mutedForeground }]}>Your space will gently adapt to the practice that feels most like yours.</Text><Option label="Hindu" selected={path === 'Hindu'} onPress={() => { setPath('Hindu'); setFocus('Ram'); }} /><Option label="Jain" selected={path === 'Jain'} onPress={() => { setPath('Jain'); setFocus('Navkar Mantra'); }} /></> : null}
      {step === 2 ? <><Text style={[ui.eyebrow, { color: colors.primary }]}>{path === 'Hindu' ? 'YOUR FOCUS' : 'YOUR PRACTICE'}</Text><Text style={[ui.title, { color: colors.foreground }]}>{path === 'Hindu' ? 'Choose your focus' : 'Choose your practice'}</Text>{focusOptions[path].map((item) => <Option key={item} label={item} selected={focus === item} onPress={() => setFocus(item)} />)}</> : null}
      {step === 3 ? <><Text style={[ui.eyebrow, { color: colors.primary }]}>YOUR RHYTHM</Text><Text style={[ui.title, { color: colors.foreground }]}>Your daily practice</Text>{([['reading', 'Reading', 'A few quiet lines to begin'], ['jap', 'Naam Jap', 'Repeat with gentle attention'], ['meditation', 'Meditation', 'A little space to breathe']] as [PracticeKind, string, string][]).map(([kind, label, detail]) => <View key={kind} style={[local.toggleRow, { borderBottomColor: colors.border }]}><View><Text style={[local.optionText, { color: colors.foreground }]}>{label}</Text><Text style={[local.optionDetail, { color: colors.mutedForeground }]}>{detail}</Text></View><Switch value={enabled[kind]} onValueChange={() => toggle(kind)} trackColor={{ false: colors.border, true: colors.accent }} thumbColor={enabled[kind] ? colors.primary : colors.mutedForeground} /></View>)}</> : null}
      {step === 4 ? <><Text style={[ui.eyebrow, { color: colors.primary }]}>A GENTLE NUDGE</Text><Text style={[ui.title, { color: colors.foreground }]}>Choose your daily reminder</Text><Text style={[ui.detail, { color: colors.mutedForeground }]}>Pick a time that gives your practice room to become a part of your day.</Text><View style={[local.timeCard, { backgroundColor: colors.card, borderColor: colors.border }]}><Text style={[local.time, { color: colors.foreground }]}>{time}</Text><View style={local.timeActions}><Pressable onPress={() => setTime(time === '07:00' ? '12:00' : '07:00')}><Text style={[local.timeLink, { color: colors.primary }]}>Change time</Text></Pressable><Text style={[local.optionDetail, { color: colors.mutedForeground }]}>Local device time</Text></View></View></> : null}
    </View></Screen>
    <View style={local.footer}><PrimaryButton label={step === 0 ? 'Begin' : step === 4 ? 'Enter Bhak' : 'Continue'} onPress={next} icon="arrow-right" /></View>
  </View>;
}

function Option({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const colors = useColors();
  return <Pressable onPress={onPress} style={[local.option, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.secondary : colors.card }]}><Text style={[local.optionText, { color: colors.foreground }]}>{label}</Text><View style={[local.radio, { borderColor: selected ? colors.primary : colors.border }]}>{selected ? <View style={[local.radioDot, { backgroundColor: colors.primary }]} /> : null}</View></Pressable>;
}

const local = StyleSheet.create({
  container: { flex: 1 },
  progressRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 22 },
  progress: { height: 3, flex: 1, borderRadius: 3 },
  inner: { flex: 1, paddingTop: 45 },
  welcome: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  brand: { fontSize: 18, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  option: { minHeight: 64, borderWidth: 1, borderRadius: 17, marginTop: 13, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optionText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  optionDetail: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 5 },
  radio: { width: 22, height: 22, borderWidth: 1.5, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  toggleRow: { paddingVertical: 18, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timeCard: { borderWidth: 1, borderRadius: 20, padding: 22, marginTop: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  time: { fontSize: 44, fontFamily: 'Inter_700Bold', letterSpacing: -1 },
  timeActions: { alignItems: 'flex-end' },
  timeLink: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  footer: { paddingHorizontal: 22 },
});
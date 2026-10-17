import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton, Screen } from '@/components/Ui';
import { useColors } from '@/hooks/useColors';
import { useBhak } from '@/context/BhakContext';
import WelcomeStep from './(tabs)/onboarding/WelcomeStep';
import ReminderStep from './(tabs)/onboarding/ReminderStep';

export default function Onboarding() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { preferences, updatePreferences } = useBhak();
  const [step, setStep] = useState(0);
  const [time, setTime] = useState(preferences.reminderTime);
  const [reminderEnabled, setReminderEnabled] = useState(preferences.notifications);

  const [saving, setSaving] = useState(false);
  const next = async () => {
    if (step === 1) {
      setSaving(true);
      try {
        await updatePreferences({ hasOnboarded: true, reminderTime: time, notifications: reminderEnabled });
        router.replace('/(tabs)');
      } catch {
        // The shared preferences context exposes the server error for retry.
      } finally {
        setSaving(false);
      }
    } else {
      setStep(1);
    }
  };

  return (
    <View style={[local.container, { backgroundColor: colors.background, paddingTop: insets.top + 22, paddingBottom: insets.bottom + 18 }]}>
      <View style={local.progressRow}>
        {[0, 1].map((index) => (
          <View key={index} style={[local.progress, { backgroundColor: index <= step ? colors.primary : colors.border }]} />
        ))}
      </View>
      <Screen scroll={false}>
        <View style={local.inner}>
          {step === 0
            ? <WelcomeStep />
            : <ReminderStep
                time={time}
                enabled={reminderEnabled}
                onChangeTime={setTime}
                onToggleReminder={setReminderEnabled}
              />}
        </View>
      </Screen>
      <View style={local.footer}>
        <PrimaryButton label={saving ? 'Saving…' : step === 0 ? 'Begin' : 'Enter Bhak'} onPress={() => { void next(); }} icon="arrow-right" />
      </View>
    </View>
  );
}

const local = StyleSheet.create({
  container: { flex: 1 },
  progressRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 22 },
  progress: { height: 3, flex: 1, borderRadius: 3 },
  inner: { flex: 1, paddingTop: 45 },
  footer: { paddingHorizontal: 22 },
});

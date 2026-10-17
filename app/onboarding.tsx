import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandMark, PrimaryButton, Screen, styles as ui } from '@/components/Ui';
import { useColors } from '@/hooks/useColors';
import { useBhak } from '@/context/BhakContext';

const reminderTimes = ['06:00', '07:00', '08:00', '12:00', '18:00', '20:00'];

export default function Onboarding() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { preferences, updatePreferences } = useBhak();
  const [step, setStep] = useState(0);
  const [time, setTime] = useState(preferences.reminderTime);
  const [reminderEnabled, setReminderEnabled] = useState(preferences.notifications);
  const [showTimeOptions, setShowTimeOptions] = useState(false);

  const next = () => {
    if (step === 0) {
      setStep(1);
      return;
    }

    // Only update onboarding and reminder fields; keep existing user preferences intact.
    updatePreferences({
      hasOnboarded: true,
      reminderTime: time,
      notifications: reminderEnabled,
    });
    router.replace('/(tabs)');
  };

  return (
    <View style={[local.container, { backgroundColor: colors.background, paddingTop: insets.top + 22, paddingBottom: insets.bottom + 18 }]}>
      <View style={local.progressRow}>
        {[0, 1].map((item) => (
          <View key={item} style={[local.progress, { backgroundColor: item <= step ? colors.primary : colors.border }]} />
        ))}
      </View>

      <Screen scroll={false}>
        <View style={local.inner}>
          {step === 0 ? (
            <View style={local.welcome}>
              <BrandMark />
              <Text style={[local.brand, { color: colors.foreground }]}>Bhak</Text>
              <Text style={[ui.title, { color: colors.foreground, textAlign: 'center' }]}>Stay connected every day.</Text>
              <Text style={[ui.detail, { color: colors.mutedForeground, textAlign: 'center' }]}>
                A few peaceful minutes for prayer, remembrance and reflection.
              </Text>
            </View>
          ) : (
            <>
              <Text style={[ui.eyebrow, { color: colors.primary }]}>A GENTLE NUDGE</Text>
              <Text style={[ui.title, { color: colors.foreground }]}>Make a little space for Bhak</Text>
              <Text style={[ui.detail, { color: colors.mutedForeground }]}>
                Choose whether you’d like a daily reminder, and a time that feels right for you.
              </Text>

              <View style={[local.reminderToggleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={local.reminderCopy}>
                  <Text style={[local.optionText, { color: colors.foreground }]}>Daily reminder</Text>
                  <Text style={[local.optionDetail, { color: colors.mutedForeground }]}>
                    {reminderEnabled ? 'A gentle nudge to pause and reconnect.' : 'Reminders are turned off for now.'}
                  </Text>
                </View>
                <Switch
                  accessibilityLabel="Daily reminder"
                  value={reminderEnabled}
                  onValueChange={(value) => {
                    setReminderEnabled(value);
                    if (!value) setShowTimeOptions(false);
                  }}
                  trackColor={{ false: colors.border, true: colors.accent }}
                  thumbColor={reminderEnabled ? colors.primary : colors.mutedForeground}
                />
              </View>

              {reminderEnabled ? (
                <View style={[local.timeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[local.time, { color: colors.foreground }]}>{time}</Text>
                  <View style={local.timeActions}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Choose reminder time"
                      onPress={() => setShowTimeOptions((visible) => !visible)}
                    >
                      <Text style={[local.timeLink, { color: colors.primary }]}>{showTimeOptions ? 'Done' : 'Change time'}</Text>
                    </Pressable>
                    <Text style={[local.optionDetail, { color: colors.mutedForeground }]}>Local device time</Text>
                  </View>
                </View>
              ) : null}

              {reminderEnabled && showTimeOptions ? (
                <View style={local.timeOptions}>
                  {reminderTimes.map((option) => {
                    const selected = option === time;
                    return (
                      <Pressable
                        key={option}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        onPress={() => setTime(option)}
                        style={[
                          local.timeOption,
                          {
                            backgroundColor: selected ? colors.secondary : colors.card,
                            borderColor: selected ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <Text style={[local.timeOptionText, { color: colors.foreground }]}>{option}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </>
          )}
        </View>
      </Screen>

      <View style={local.footer}>
        <PrimaryButton label={step === 0 ? 'Begin' : 'Enter Bhak'} onPress={next} icon="arrow-right" />
      </View>
    </View>
  );
}

const local = StyleSheet.create({
  container: { flex: 1 },
  progressRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 22 },
  progress: { height: 3, flex: 1, borderRadius: 3 },
  inner: { flex: 1, paddingTop: 45 },
  welcome: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  brand: { fontSize: 18, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  optionText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  optionDetail: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 5 },
  reminderToggleCard: { borderWidth: 1, borderRadius: 20, padding: 20, marginTop: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  reminderCopy: { flex: 1, paddingRight: 8 },
  timeCard: { borderWidth: 1, borderRadius: 20, padding: 22, marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  time: { fontSize: 44, fontFamily: 'Inter_700Bold', letterSpacing: -1 },
  timeActions: { alignItems: 'flex-end' },
  timeLink: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  timeOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  timeOption: { minWidth: '29%', flexGrow: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  timeOptionText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  footer: { paddingHorizontal: 22 },
});

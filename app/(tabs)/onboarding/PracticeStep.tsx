import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { styles as ui } from '@/components/Ui';
import { useColors } from '@/hooks/useColors';
import type { Path } from '@/lib/types';

type Props = {
  path: Path;
  value: string;
  onChange: (focus: string) => void;
};

const FOCUS_OPTIONS: Record<Path, { label: string; description: string }[]> = {
  Hindu: [
    { label: 'Hanuman', description: 'Strength, devotion and courage' },
    { label: 'Ram', description: 'Compassion, duty and remembrance' },
    { label: 'Krishna', description: 'Wisdom, love and devotion' },
    { label: 'Shiva', description: 'Stillness, transformation and focus' },
    { label: 'Ganesh', description: 'New beginnings and guidance' },
    { label: 'Durga', description: 'Courage, protection and strength' },
  ],
  Jain: [
    { label: 'Navkar Mantra', description: 'A central Jain mantra of reverence' },
    { label: 'Jain Prayer', description: 'Make space for daily prayer' },
    { label: 'Meditation', description: 'Practice stillness and awareness' },
  ],
};

export default function PracticeStep({ path, value, onChange }: Props) {
  const colors = useColors();
  const options = FOCUS_OPTIONS[path];

  return (
    <View>
      <Text style={[ui.eyebrow, { color: colors.primary }]}>YOUR PRACTICE</Text>
      <Text style={[ui.title, { color: colors.foreground }]}>Choose your practice</Text>
      <Text style={[ui.detail, { color: colors.mutedForeground }]}>Select a focus to personalize your spiritual practice.</Text>
      {options.map((option) => {
        const selected = value === option.label;
        return (
          <Pressable
            key={option.label}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => onChange(option.label)}
            style={[local.option, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.secondary : colors.card }]}
          >
            <View style={local.copy}>
              <Text style={[local.label, { color: colors.foreground }]}>{option.label}</Text>
              <Text style={[local.description, { color: colors.mutedForeground }]}>{option.description}</Text>
            </View>
            <View style={[local.radio, { borderColor: selected ? colors.primary : colors.border }]}>
              {selected ? <View style={[local.dot, { backgroundColor: colors.primary }]} /> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const local = StyleSheet.create({
  option: { minHeight: 66, borderWidth: 1, borderRadius: 17, marginTop: 11, paddingHorizontal: 18, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  copy: { flex: 1, paddingRight: 12 },
  label: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  description: { fontSize: 12, lineHeight: 17, fontFamily: 'Inter_400Regular', marginTop: 4 },
  radio: { width: 22, height: 22, borderWidth: 1.5, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5 },
});

import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

export function BrandMark({ small = false }: { small?: boolean }) {
  const colors = useColors();
  return <View style={[styles.mark, { width: small ? 34 : 56, height: small ? 34 : 56, backgroundColor: colors.accent }]}>
    <Feather name="sun" size={small ? 16 : 24} color={colors.primary} />
  </View>;
}

export function PrimaryButton({ label, onPress, icon }: { label: string; onPress: () => void; icon?: keyof typeof Feather.glyphMap }) {
  const colors = useColors();
  return <Pressable testID={`button-${label}`} onPress={onPress} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] }]}>
    <Text style={styles.primaryText}>{label}</Text>
    {icon ? <Feather name={icon} size={18} color={colors.primaryForeground} /> : null}
  </Pressable>;
}

export function BackButton({ onPress }: { onPress: () => void }) {
  const colors = useColors();
  return <Pressable testID="button-back" onPress={onPress} style={styles.backButton}><Feather name="arrow-left" size={20} color={colors.foreground} /></Pressable>;
}

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  const colors = useColors();
  const Container = scroll ? require('react-native').ScrollView : View;
  return <Container style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={scroll ? styles.content : undefined} showsVerticalScrollIndicator={false}>{children}</Container>;
}

export function SectionTitle({ eyebrow, title, detail }: { eyebrow?: string; title: string; detail?: string }) {
  const colors = useColors();
  return <View style={styles.section}><Text style={[styles.eyebrow, { color: colors.primary }]}>{eyebrow?.toUpperCase()}</Text><Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>{detail ? <Text style={[styles.detail, { color: colors.mutedForeground }]}>{detail}</Text> : null}</View>;
}

export function PracticeCard({ icon, title, subtitle, action, onPress, done }: { icon: keyof typeof Feather.glyphMap; title: string; subtitle: string; action: string; onPress: () => void; done?: boolean }) {
  const colors = useColors();
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.practiceCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.82 : 1 }]}>
    <View style={[styles.iconBox, { backgroundColor: colors.secondary }]}><Feather name={done ? 'check' : icon} size={20} color={done ? colors.primary : colors.foreground} /></View>
    <View style={{ flex: 1 }}><Text style={[styles.cardTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>{subtitle}</Text></View>
    <Text style={[styles.cardAction, { color: colors.primary }]}>{done ? 'Complete' : action}</Text>
  </Pressable>;
}

export const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 24, paddingBottom: 110 },
  mark: { borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  primaryButton: { minHeight: 58, paddingHorizontal: 26, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10 },
  primaryText: { color: '#fffdf8', fontSize: 15, letterSpacing: 0.1, fontFamily: 'Inter_600SemiBold' },
  backButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  section: { marginTop: 30, marginBottom: 20 },
  eyebrow: { fontSize: 11, letterSpacing: 1.5, fontFamily: 'Inter_700Bold', marginBottom: 8 },
  title: { fontSize: 30, lineHeight: 37, fontFamily: 'Inter_700Bold', letterSpacing: -0.7 },
  detail: { fontSize: 15, lineHeight: 23, fontFamily: 'Inter_400Regular', marginTop: 8 },
  practiceCard: { borderWidth: 1, borderRadius: 22, paddingVertical: 19, paddingHorizontal: 18, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconBox: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, letterSpacing: -0.1, fontFamily: 'Inter_600SemiBold' },
  cardSubtitle: { fontSize: 13, lineHeight: 18, fontFamily: 'Inter_400Regular', marginTop: 4 },
  cardAction: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
});
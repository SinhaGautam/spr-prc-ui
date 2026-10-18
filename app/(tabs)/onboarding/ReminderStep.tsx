import React, { useMemo } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { styles as ui } from "@/components/Ui";
import { useColors } from "@/hooks/useColors";

type Props = {
  time: string;
  enabled: boolean;
  onChangeTime: (time: string) => void;
  onToggleReminder: (enabled: boolean) => void;
};

function parseTime(value: string) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  const hours = match ? Number(match[1]) : 7;
  const minutes = match ? Number(match[2]) : 0;
  return {
    hours: Number.isFinite(hours) ? Math.min(23, Math.max(0, hours)) : 7,
    minutes: Number.isFinite(minutes) ? Math.min(59, Math.max(0, minutes)) : 0,
  };
}

function formatTime(hours: number, minutes: number) {
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export default function ReminderStep({
  time,
  enabled,
  onChangeTime,
  onToggleReminder,
}: Props) {
  const colors = useColors();
  const parsed = useMemo(() => parseTime(time), [time]);
  const hour12 = parsed.hours % 12 || 12;
  const period = parsed.hours >= 12 ? "PM" : "AM";

  const updateTime = (
    nextHour12: number,
    nextMinutes: number,
    nextPeriod: "AM" | "PM",
  ) => {
    const normalizedHour = (nextHour12 % 12) + (nextPeriod === "PM" ? 12 : 0);
    onChangeTime(formatTime(normalizedHour, nextMinutes));
  };

  // Adjust the displayed 12-hour value only. AM/PM changes only when the
  // user explicitly taps the AM or PM control.
  const adjustHour = (amount: number) => {
    const nextHour12 = ((hour12 - 1 + amount + 12) % 12) + 1;
    updateTime(nextHour12, parsed.minutes, period);
  };

  const adjustMinute = (amount: number) => {
    const nextMinutes = (parsed.minutes + amount + 60) % 60;
    updateTime(hour12, nextMinutes, period);
  };

  return (
    <View>
      <Text style={[ui.eyebrow, { color: colors.primary }]}>
        MAKE IT A HABIT
      </Text>
      <Text style={[ui.title, { color: colors.foreground }]}>
        A little reminder, at your time
      </Text>
      <Text style={[ui.detail, { color: colors.mutedForeground }]}>
        Choose a time that feels right for your daily Naam Jap or meditation.
        You can change it whenever you need.
      </Text>

      <View
        style={[
          local.toggleCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={local.toggleCopy}>
          <Text style={[local.label, { color: colors.foreground }]}>
            Daily reminder
          </Text>
          <Text style={[local.detail, { color: colors.mutedForeground }]}>
            {enabled ? "A gentle nudge each day" : "Reminders are turned off"}
          </Text>
        </View>
        <Switch
          accessibilityLabel="Enable daily reminder"
          value={enabled}
          onValueChange={onToggleReminder}
          trackColor={{ false: colors.border, true: colors.accent }}
          thumbColor={enabled ? colors.primary : colors.mutedForeground}
        />
      </View>

      <View
        style={[
          local.picker,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            opacity: enabled ? 1 : 0.55,
          },
        ]}
      >
        <TimeColumn
          label="HOUR"
          value={hour12}
          disabled={!enabled}
          onIncrement={() => adjustHour(1)}
          onDecrement={() => adjustHour(-1)}
          colors={colors}
        />
        <Text style={[local.colon, { color: colors.foreground }]}>:</Text>
        <TimeColumn
          label="MIN"
          value={parsed.minutes}
          disabled={!enabled}
          formatValue={(value) => String(value).padStart(2, "0")}
          onIncrement={() => adjustMinute(1)}
          onDecrement={() => adjustMinute(-1)}
          colors={colors}
        />
        <View style={local.periodColumn}>
          <Text style={[local.columnLabel, { color: colors.mutedForeground }]}>
            PERIOD
          </Text>
          {(["AM", "PM"] as const).map((option) => (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{
                selected: period === option,
                disabled: !enabled,
              }}
              disabled={!enabled}
              onPress={() => updateTime(hour12, parsed.minutes, option)}
              style={[
                local.periodOption,
                { borderColor: colors.border },
                period === option && {
                  backgroundColor: colors.secondary,
                  borderColor: colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  local.periodText,
                  {
                    color:
                      period === option ? colors.primary : colors.foreground,
                  },
                ]}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      <Text style={[local.selectedTime, { color: colors.mutedForeground }]}>
        {enabled
          ? `Reminder time · ${hour12}:${String(parsed.minutes).padStart(2, "0")} ${period}`
          : "Turn on the reminder to edit its time"}
      </Text>
    </View>
  );
}

type PickerColors = ReturnType<typeof useColors>;

function TimeColumn({
  label,
  value,
  formatValue = (number: number) => String(number),
  onIncrement,
  onDecrement,
  disabled,
  colors,
}: {
  label: string;
  value: number;
  formatValue?: (value: number) => string;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled: boolean;
  colors: PickerColors;
}) {
  return (
    <View style={local.timeColumn}>
      <Text style={[local.columnLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Increase ${label.toLowerCase()}`}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onIncrement}
        hitSlop={8}
        style={local.stepper}
      >
        <Feather
          name="chevron-up"
          size={22}
          color={disabled ? colors.mutedForeground : colors.primary}
        />
      </Pressable>
      <Text style={[local.pickerValue, { color: colors.foreground }]}>
        {formatValue(value)}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Decrease ${label.toLowerCase()}`}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onDecrement}
        hitSlop={8}
        style={local.stepper}
      >
        <Feather
          name="chevron-down"
          size={22}
          color={disabled ? colors.mutedForeground : colors.primary}
        />
      </Pressable>
    </View>
  );
}

const local = StyleSheet.create({
  toggleCard: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginTop: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  toggleCopy: { flex: 1 },
  label: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  detail: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: "Inter_400Regular",
    marginTop: 5,
  },
  picker: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 7,
  },
  timeColumn: { flex: 1, alignItems: "center" },
  columnLabel: {
    fontSize: 10,
    letterSpacing: 1,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
  },
  stepper: {
    height: 34,
    minWidth: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  pickerValue: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: "Inter_700Bold",
    fontVariant: ["tabular-nums"],
  },
  colon: { fontSize: 24, fontFamily: "Inter_700Bold", paddingTop: 20 },
  periodColumn: { alignItems: "center", justifyContent: "center", gap: 6 },
  periodOption: {
    minWidth: 48,
    height: 34,
    borderWidth: 1,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  periodText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  selectedTime: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
    fontFamily: "Inter_400Regular",
  },
});

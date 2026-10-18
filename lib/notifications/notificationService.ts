import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { apiClient } from "@/lib/api/client";
import { loadOrCreateInstallationCredentials } from "@/lib/auth/secureInstallation";

const REMINDER_ID_KEY = "bhak.notifications.dailyReminderId";
const SERVER_DEVICE_ID_KEY = "bhak.notifications.serverDeviceId";
const REMINDER_STATE_KEY = "bhak.notifications.reminderState";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function parseTime(localTime: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(localTime);
  if (!match) throw new Error("Reminder time must use HH:mm format.");
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) throw new Error("Reminder time is invalid.");
  return { hour, minute };
}

async function registerDevice(): Promise<void> {
  if (Platform.OS !== "ios" && Platform.OS !== "android") return;
  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) return;
  const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID?.trim();
  const token = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
  const credentials = await loadOrCreateInstallationCredentials();
  const response = await apiClient.post<{ device?: { id?: string; deviceId?: string }; id?: string; deviceId?: string }>(
    "/devices",
    {
      deviceId: credentials.installationId,
      token: token.data,
      platform: Platform.OS,
    }
  );
  const serverDeviceId = response.device?.id ?? response.device?.deviceId ?? response.id ?? response.deviceId;
  if (serverDeviceId) await SecureStore.setItemAsync(SERVER_DEVICE_ID_KEY, serverDeviceId);
}

export async function requestDailyReminderPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("daily-reminders", {
      name: "Daily reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  const permission = current.granted ? current : await Notifications.requestPermissionsAsync();
  return permission.granted;
}

export async function syncDailyReminder(enabled: boolean, localTime: string, requestPermission = false): Promise<boolean> {
  const [existingId, stateRaw] = await Promise.all([
    SecureStore.getItemAsync(REMINDER_ID_KEY),
    SecureStore.getItemAsync(REMINDER_STATE_KEY),
  ]);
  let previous: { enabled: boolean; localTime: string } | null = null;
  try { previous = stateRaw ? JSON.parse(stateRaw) as { enabled: boolean; localTime: string } : null; } catch { previous = null; }
  if (previous?.enabled === enabled && previous.localTime === localTime && (!enabled || existingId)) {
    if (enabled) await registerDevice().catch(() => undefined);
    return true;
  }
  if (existingId) {
    await Notifications.cancelScheduledNotificationAsync(existingId).catch(() => undefined);
    await SecureStore.deleteItemAsync(REMINDER_ID_KEY);
  }

  if (!enabled) {
    await apiClient.put("/reminder", { enabled: false, localTime });
    await SecureStore.setItemAsync(REMINDER_STATE_KEY, JSON.stringify({ enabled, localTime }));
    return true;
  }

  const granted = requestPermission
    ? await requestDailyReminderPermission()
    : (await Notifications.getPermissionsAsync()).granted;
  if (!granted) return false;

  const { hour, minute } = parseTime(localTime);
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: "A moment for Bhakti",
      body: "Return to what matters, one gentle practice at a time.",
      sound: false,
      data: { screen: "home" },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, ...(Platform.OS === "android" ? { channelId: "daily-reminders" } : {}) },
  });
  await SecureStore.setItemAsync(REMINDER_ID_KEY, identifier);
  try {
    await apiClient.put("/reminder", { enabled: true, localTime });
    await SecureStore.setItemAsync(REMINDER_STATE_KEY, JSON.stringify({ enabled, localTime }));
  } catch (error) {
    await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => undefined);
    await SecureStore.deleteItemAsync(REMINDER_ID_KEY);
    throw error;
  }
  // Local reminders still work if push-token registration is temporarily unavailable.
  await registerDevice().catch(() => undefined);
  return true;
}

export async function unregisterCurrentDevice(): Promise<void> {
  const deviceId = await SecureStore.getItemAsync(SERVER_DEVICE_ID_KEY);
  if (!deviceId) return;
  await apiClient.delete<void>(`/devices/${encodeURIComponent(deviceId)}`);
  await SecureStore.deleteItemAsync(SERVER_DEVICE_ID_KEY);
}

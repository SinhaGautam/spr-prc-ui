import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import * as Device from "expo-device";
import { apiClient } from "@/lib/api/client";
import { loadOrCreateInstallationCredentials } from "@/lib/auth/secureInstallation";

const REMINDER_ID_KEY = "bhak.notifications.dailyReminderId";
const SERVER_DEVICE_ID_KEY = "bhak.notifications.serverDeviceId";

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
  const token = await Notifications.getExpoPushTokenAsync();
  const credentials = await loadOrCreateInstallationCredentials();
  const response = await apiClient.post<{ device?: { id?: string; deviceId?: string }; id?: string; deviceId?: string }>(
    "/devices",
    {
      deviceId: credentials.installationId,
      platform: Platform.OS,
      pushToken: token.data,
      expoPushToken: token.data,
      appVersion: "1.0.0",
      osVersion: Device.osVersion ?? undefined,
      deviceModel: Device.modelName ?? undefined,
      language: Intl.DateTimeFormat().resolvedOptions().locale ?? "en",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? undefined,
    }
  );
  const serverDeviceId = response.device?.id ?? response.device?.deviceId ?? response.id ?? response.deviceId;
  if (serverDeviceId) await SecureStore.setItemAsync(SERVER_DEVICE_ID_KEY, serverDeviceId);
}

export async function requestDailyReminderPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const current = await Notifications.getPermissionsAsync();
  const permission = current.granted ? current : await Notifications.requestPermissionsAsync();
  if (!permission.granted) return false;
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("daily-reminders", {
      name: "Daily reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  return true;
}

export async function syncDailyReminder(enabled: boolean, localTime: string, requestPermission = false): Promise<boolean> {
  const existingId = await SecureStore.getItemAsync(REMINDER_ID_KEY);
  if (existingId) {
    await Notifications.cancelScheduledNotificationAsync(existingId).catch(() => undefined);
    await SecureStore.deleteItemAsync(REMINDER_ID_KEY);
  }

  if (!enabled) {
    await apiClient.put("/reminder", { enabled: false, localTime });
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
    await registerDevice();
  } catch (error) {
    await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => undefined);
    await SecureStore.deleteItemAsync(REMINDER_ID_KEY);
    throw error;
  }
  return true;
}

export async function unregisterCurrentDevice(): Promise<void> {
  const deviceId = await SecureStore.getItemAsync(SERVER_DEVICE_ID_KEY);
  if (!deviceId) return;
  await apiClient.delete<void>(`/devices/${encodeURIComponent(deviceId)}`);
  await SecureStore.deleteItemAsync(SERVER_DEVICE_ID_KEY);
}

# Reminders and device registration

## Behavior

- Settings and onboarding request OS notification permission before enabling a reminder.
- A daily local notification is scheduled at the selected `HH:mm` time. Changing the time replaces the previous notification; disabling reminders cancels it.
- Reminder preferences are persisted through `PUT /api/v1/preferences` and `PUT /api/v1/reminder`.
- When permission is granted and reminders are enabled, the app obtains an Expo push token and registers the installation with `POST /api/v1/devices` using `{ deviceId, token, platform }`.
- The installation UUID is the stable device identifier. The server-issued device ID is stored in secure storage for future removal.
- Local reminders continue to work if push-token registration is temporarily unavailable. Server reminder API failures are surfaced to Settings.
- Android uses the `daily-reminders` notification channel.

## Native setup

`expo-notifications` is configured as an Expo config plugin. After installing dependencies, restart Expo and rebuild the native app/dev client so native notification configuration is applied. Push delivery requires valid Expo push credentials and a physical device; local notifications can be verified where supported.

## Verification checklist

- [ ] Install dependencies and regenerate `pnpm-lock.yaml` with the repository's pnpm version.
- [ ] On a physical iOS device, allow notifications, enable reminders, and confirm the selected daily time is scheduled.
- [ ] On Android 13+, verify the notification permission prompt and daily-reminders channel.
- [ ] Change reminder time and verify there is only one scheduled reminder.
- [ ] Disable reminders and verify the notification is cancelled and the API stores `enabled: false`.
- [ ] Verify `POST /api/v1/devices` sends `deviceId`, `token`, and the correct iOS/Android platform.
- [ ] Deny notification permission and verify Settings does not claim the reminder was enabled.
- [ ] Confirm Home, History, and Settings still load when push-token registration fails.

## Reading removal

The API currently exposes only Naam Jap and Meditation. The unsupported Reading screen and its navigation entry have been removed. The durable practice queue remains local by design because it stores unsent submissions until the API acknowledges them; server-owned preferences, goals, progress, history, and streaks are not sourced from local caches.

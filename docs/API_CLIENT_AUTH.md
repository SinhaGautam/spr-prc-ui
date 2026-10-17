# API client and authentication foundation

## Configuration

Set `EXPO_PUBLIC_API_BASE_URL` to the backend origin, without `/api/v1`. The shared client appends `/api/v1` to every path. See `.env.example`.

Do not commit environment-specific secrets or production endpoints into the repository. Expo public environment variables are bundled into the app, so this variable must contain only the API base URL, never credentials.

## Shared API client

- Import `apiClient` from `@/lib/api/client`.
- Use `apiClient.get/post/put/delete`; do not call `fetch` directly from screens.
- Authenticated requests are the default and attach the in-memory Bearer token.
- Set `authenticated: false` only for public endpoints such as session bootstrap and bootstrap catalog.
- Errors are normalized as `ApiError` with HTTP status, API error code, message, and optional request ID.
- A 401 on an authenticated request triggers one session recovery attempt and retries the original request once. A second 401 is surfaced to the caller.
- Network failures and missing/invalid API configuration are distinct errors.

## Authentication lifecycle

`AuthProvider` is mounted at the root. It loads or creates an installation UUID and 32-byte installation secret in platform secure storage, then calls `POST /api/v1/auth/session`. It persists the short-lived access token and expiry securely, and stores the token in memory for requests. On app launch, a previous unexpired token is revoked best-effort before a fresh session is issued for the same installation identity.

Installation credentials are retained when signing out because the backend associates the anonymous user with the installation. The session is revoked and access-token material is removed. Retry can re-establish a session for that same installation.

The backend only accepts `ios` and `android` as platform values; this implementation therefore shows a configuration/platform error on web rather than inventing a platform value. Secure credentials use `expo-secure-store`; random IDs/secrets use `expo-crypto`.

## Boundaries

This foundation intentionally does not wire feature flags, preferences, Home, goals, sessions, progress, history, streaks, reminders, or device registration. It also does not change the existing local-only BhakContext business-data behavior. Those are subsequent integration tasks and must not be treated as API-backed by this PR.

## Verification checklist

- [ ] Set `EXPO_PUBLIC_API_BASE_URL` for the target environment.
- [ ] Install dependencies with the repository's package manager so Expo secure storage and crypto are available.
- [ ] Run `npm run typecheck` and `npm run build`.
- [ ] On iOS and Android, verify first-install bootstrap, app restart, offline bootstrap failure/retry, expired/invalid token recovery, and logout.
- [ ] Verify the server URL resolves to `/api/v1/auth/session` and the session payload matches the backend Zod schema.

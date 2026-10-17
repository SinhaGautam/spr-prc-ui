# Bhakti UI ↔ API V1 Contract Map

Status: contract audit of the current default branches; this document records the verified contract and blockers before UI API wiring. It does not claim that end-to-end integration has been tested.

Repositories:
- API: `SinhaGautam/spr-prc-api-server`
- UI: `SinhaGautam/spr-prc-ui`

## Contract baseline

- The server mounts the router at `/api`, with V1 at `/api/v1`.
- The UI currently has no API service layer in the inspected entry/context files. `@tanstack/react-query` is installed, but the current `BhakContext` reads and writes `@bhak/preferences` and `@bhak/history` using AsyncStorage.
- API schemas are defined in backend Zod module schemas and described in `src/openapi/v1.ts`. Keep OpenAPI and Zod schemas synchronized.
- API errors use `{ error: { code, message, requestId } }` per the global error contract.
- Authenticated endpoints require `Authorization: Bearer <token>`. `POST /auth/session` and `GET /bootstrap` are public; `GET /features` requires authentication. Meditation presets are currently public.

## Endpoint mapping

| UI capability | Method and path (under `/api/v1`) | Auth | Contract / UI adapter |
|---|---|---:|---|
| Create/resume installation session | `POST /auth/session` | No | Send `installationId` UUID, secure `installationSecret`, `platform` (`ios`/`android`), and available device/app metadata. Response has `session.token`, `session.expiresAt`, `user`, and `installation`. Do not attach an old token to this request. |
| Revoke session | `DELETE /auth/session` | Yes | No response body (204). |
| Onboarding catalog | `GET /bootstrap` | No | Catalog arrays: `traditions`, `focuses`, `tags`, `practices`, `meditationPresets`, `languages`, `reminderDefaults`. Do not hardcode catalog choices. |
| Feature flags | `GET /features` | Yes | Response shape is `{ features: [{ key, isActive }] }`. Fail closed until loaded; on failure show retry. |
| Home | `GET /home` | Yes | `greeting`, `dailyGoals[]` (`practice`, `targetLabel`, `progress`, `complete`), `meditationPreset` (object or null). |
| User profile | `GET /user`, `PUT /user` | Yes | Profile uses `displayName`, `email`, `timezone`, `language`; update payload requires `timezone` and `language`. |
| Preferences | `GET /preferences`, `PUT /preferences` | Yes | `traditionId`, optional `primaryFocusId`, `enabledPractices`, optional targets, optional reminder. Enabled practice IDs are `naam_jap` and `meditation` only. |
| Naam Jap sessions | `POST /naam-jap/sessions`, `GET /naam-jap/sessions` | Yes | Create requires `targetRepetitions`, `completedRepetitions`, `startedAt`, `durationSeconds`, `completed`, `clientSessionId`; `endedAt` is optional. Stable client IDs support idempotent retries. |
| Meditation presets | `GET /meditation/presets` | No | Response is `{ items: [{ id, key, durationMinutes }] }`. Note this is a different envelope from bootstrap's `meditationPresets` array. |
| Meditation sessions | `POST /meditation/sessions`, `GET /meditation/sessions` | Yes | Create requires `plannedMinutes`, `actualSeconds`, `startedAt`, `completed`, `clientSessionId`; optional `presetId`, `endedAt`, `completionReason`. |
| Daily goals | `GET /daily-practice/goals/today` | Yes | `date`, `enabledPractices`, `goals[]` (`practice`, `target`, `progress`, `complete`), `allComplete`. |
| Today's progress | `GET /progress/today` | Yes | `date`, `completed`, `naam_jap`, `meditation`. |
| Monthly progress history | `GET /progress/history?month=YYYY-MM` | Yes | `{ month, items: [{ date, complete }] }`. Month is optional; use `YYYY-MM`. |
| Streak | `GET /progress/streak` | Yes | `{ current, longest }`. Do not calculate the authoritative streak in the UI. |
| Reminder | `PUT /reminder` | Yes | Send `enabled` and optional `localTime` (24-hour `HH:mm`). Response includes `userId`, `reminder`, `timezone`. |
| Register push device | `POST /devices` | Yes | Send `deviceId`, real provider `token`, `platform` (`ios`/`android`). Never send a placeholder token. |
| Deregister push device | `DELETE /devices/:deviceId` | Yes | No response body (204). |
| Health | `GET /health/live`, `GET /health/ready` | No | Operational checks only; not user business data. |

## UI-to-API domain adapters

The current UI domain model is not API-compatible and must be adapted at a single boundary rather than leaking backend naming throughout components.

| Current UI concept | API concept | Required action |
|---|---|---|
| `Path = 'Hindu' | 'Jain'` | `traditionId` | Load options from `bootstrap.traditions`; persist the selected catalog ID, not a display label. Confirm whether both values exist in backend catalog before mapping. |
| `focus: string` (e.g. `Ram`) | `primaryFocusId` | Load focus options from `bootstrap.focuses`, respect `traditionIds`, and persist the ID rather than the display name. |
| `'jap'` | `'naam_jap'` | Map through a typed adapter. |
| `'reading'` | No V1 practice | Remove from the V1 domain and routes; do not map it to any API practice. |
| Local `enabled[kind]` booleans | `enabledPractices[]` plus feature flags | Treat user preference and feature availability as separate gates. A practice is visible only when its feature flag is loaded and active AND the user's preference allows it. |
| `reminderTime` / `notifications` | `reminder.localTime` / `reminder.enabled` | Convert at the API boundary; do not equate OS notification permission with saved reminder preference. |
| Local `DailyCompletion[]` / calculated streak | Progress endpoints | Replace authoritative display reads with API data; pending queued sessions must be visibly pending and not counted as server-confirmed progress. |
| UI meditation minutes | `plannedMinutes`, `actualSeconds`, optional `presetId` | Record actual elapsed seconds separately from planned preset duration. |

## Feature flag policy

Known keys in the OpenAPI example:
- `spr-naamjaap-enabled`
- `spr-meditation-enabled`
- `spr-reading-enabled` (example is inactive)
- `spr-song-enabled` (example is inactive)

Only the server's returned `isActive` value is authoritative. Do not infer availability from the existence of a UI screen, a local preference, a stale cache, or a missing flag. Missing/unresolved flags mean unavailable. Reading must be absent from V1 UI when disabled.

## Contract blockers to resolve before wiring

1. **Progress persistence source mismatch (blocking):** Naam Jap and meditation services call `DailyPracticeService.record…Completion`, which writes through the daily-practice repository. The `/progress/today`, `/progress/history`, and `/progress/streak` routes use `MongoProgressRepository`, which reads the separate `daily_progress` collection. Verify whether a synchronization mechanism exists; if not, session writes and progress reads can diverge. Agree on one authoritative persistence model or add a tested projection before UI integration.
2. **Streak semantics mismatch (blocking):** `DailyPracticeService.getStreak` (not currently routed by the listed daily-practice routes) derives current-month data and sets `longest = current`; `/progress/streak` uses another implementation. Confirm the single intended endpoint/algorithm and timezone/date boundary semantics.
3. **Timezone semantics (blocking for date-sensitive acceptance):** `DailyPracticeService` currently derives dates with UTC `toISOString()`, while the user profile stores a timezone. Define and test user-local day boundaries for goals, session completion, progress, and streaks.
4. **Catalog identifiers (verify before UI adapters):** OpenAPI examples use different-looking IDs in different examples (for example, bootstrap tradition/focus IDs versus preferences examples). The UI must use IDs returned by the catalog; verify seed data and preferences validation accept those exact IDs.
5. **Response envelope difference (documented, not necessarily a bug):** Bootstrap returns `meditationPresets: []`, while `GET /meditation/presets` returns `{ items: [] }`. Keep the two response types separate or normalize both in the API layer.
6. **Feature flag failure behavior:** Backend feature lookup fails closed for practice operations, and `GET /features` is protected. The UI must authenticate before fetching flags and keep dependent UI hidden if the request fails.

## Implementation guardrails

- Keep raw HTTP and backend DTOs in an API/data layer; map them to UI view models in one typed adapter layer.
- Never use AsyncStorage preferences/history as authoritative server data. Secure installation credentials and the durable queue for unsynced sessions are separate permitted storage categories.
- Generate/maintain contract types from the OpenAPI contract where practical, but add tests that compare OpenAPI response shapes with actual route responses.
- Add API contract tests for feature flags, preferences, session payloads, progress payloads, and error envelopes before connecting screens.
- Do not silently default a missing API field to mock business data. Show explicit loading, empty, retry, or unavailable states.

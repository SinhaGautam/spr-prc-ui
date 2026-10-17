# Bootstrap and feature flag integration

- After installation authentication succeeds, the root loads public `GET /api/v1/bootstrap` and authenticated `GET /api/v1/features`.
- The UI stays behind a loading gate until both requests succeed. A failure clears configuration and flags and presents retry; no feature is assumed enabled.
- A practice is available only when it appears in the bootstrap `practices` catalogue and its matching feature flag is active.
- Reading is always unavailable in V1 because the server bootstrap catalogue only supports `naam_jap` and `meditation`. It is also blocked on direct route entry.
- Feature keys are matched exactly to `naam_jap` and `meditation`; missing, inactive, or unknown keys fail closed.
- Bootstrap is public; feature flags require the authenticated Bearer token.
- This change gates access but does not yet migrate local preferences, practice sessions, or progress to their API endpoints.

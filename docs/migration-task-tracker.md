# Othello Migration Task Tracker

Last updated: 2026-04-22

## TODO

- [ ] Wire the state bridge hook into ranked/unified multiplayer hooks.
- [ ] Finish extracting remaining session transitions (resign/chat abstractions) from websocket transport.
- [ ] Add server-focused tests for stale revision/game rejection, pass-turn emission, draw/rematch lifecycle, and restart invalidation.
- [ ] Add reducer tests for `matchSessionSlice` state transitions.
- [ ] Add brief architecture docs for `core/`, `network/`, `state/`, `ui/` boundaries and migration rules.

## Completed

- [x] Added pure core engine + state machine scaffolding in `core/othello`.
- [x] Moved move validation and deterministic turn/pass/game-over handling to server-authoritative transition flow.
- [x] Implemented robust restart flow with fresh game identity/revision and stale state handling.
- [x] Added session service abstraction for move/restart/disconnect transitions.
- [x] Centralized draw/rematch transition logic in session service and rewired websocket handlers.
- [x] Added `matchSessionSlice` + selectors and registered it in Redux store.
- [x] Added `useMatchSessionSync` hook for authoritative event-to-state bridging.
- [x] Wired `use-multiplayer-game` to `useMatchSessionSync` for live authoritative state bridge updates.
- [x] Added PWA baseline (`public/sw.js`, registration component, manifest/cache header updates).
- [x] Updated backend Docker/dev compose flow for multiplayer backend layering.

## Update Log

- 2026-04-22: Created tracker and captured current completed work + next queue.
- 2026-04-22: Connected `use-multiplayer-game` to state bridge (`useMatchSessionSync`) and removed unsafe cast.
- 2026-04-22: Resolved hook lint issues after bridge wiring (unused imports/values and callback dependencies).

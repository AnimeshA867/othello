# Othello Migration Task Tracker

Last updated: 2026-04-22

## TODO

- [ ] Shift friend screen end-of-game dialog winner/status copy to selector-backed state path.
- [ ] Add a selector-driven UI test for friend screen board + score rendering fallback behavior.

## Completed

- [x] Added pure core engine + state machine scaffolding in `core/othello`.
- [x] Moved move validation and deterministic turn/pass/game-over handling to server-authoritative transition flow.
- [x] Implemented robust restart flow with fresh game identity/revision and stale state handling.
- [x] Added session service abstraction for move/restart/disconnect transitions.
- [x] Centralized draw/rematch transition logic in session service and rewired websocket handlers.
- [x] Added `matchSessionSlice` + selectors and registered it in Redux store.
- [x] Added `useMatchSessionSync` hook for authoritative event-to-state bridging.
- [x] Wired `use-multiplayer-game` to `useMatchSessionSync` for live authoritative state bridge updates.
- [x] Wired ranked and unified multiplayer hooks to `useMatchSessionSync` for centralized authoritative session sync.
- [x] Extracted resign/chat session concerns into `sessionService` and removed direct websocket handler state mutations.
- [x] Added explicit layered boundary and migration conventions to architecture docs.
- [x] Added Vitest test harness (`vitest.config.ts`) and `npm` test scripts.
- [x] Added session service tests for stale state rejection, restart invalidation, draw lifecycle, and rematch lifecycle.
- [x] Added session service tests for resign and chat-context resolution paths.
- [x] Added reducer tests for `matchSessionSlice` transitions.
- [x] Replaced ad-hoc websocket unions with shared protocol types in `network/protocol/game-events.ts` and transport hooks/server.
- [x] Shifted one game screen (`friend/page.tsx`) to consume `matchSession` selector state for board/turn rendering.
- [x] Extended friend screen selector consumption to authoritative scores, valid moves, and last move with local fallback.
- [x] Added PWA baseline (`public/sw.js`, registration component, manifest/cache header updates).
- [x] Updated backend Docker/dev compose flow for multiplayer backend layering.

## Update Log

- 2026-04-22: Created tracker and captured current completed work + next queue.
- 2026-04-22: Connected `use-multiplayer-game` to state bridge (`useMatchSessionSync`) and removed unsafe cast.
- 2026-04-22: Resolved hook lint issues after bridge wiring (unused imports/values and callback dependencies).
- 2026-04-22: Connected ranked + unified multiplayer hooks to `useMatchSessionSync`; marked state-bridge wiring TODO complete.
- 2026-04-22: Delegated resign + chat context handling to `network/server/sessionService`; marked transport extraction TODO complete.
- 2026-04-22: Expanded `docs/architecture.md` with layered boundaries, migration rules, and current status; marked architecture-docs TODO complete.
- 2026-04-22: Added Vitest setup + core session/reducer tests; marked testing TODOs complete.
- 2026-04-22: Isolated Vitest from Next PostCSS config in `vitest.config.ts` and verified `bun run test` passes (2 files, 7 tests).
- 2026-04-22: Added resign/chat session-service tests and updated next-phase TODO queue.
- 2026-04-22: Integrated shared websocket protocol types across `use-websocket-game` and `enhancedWebSocketServer`; marked protocol-typing TODO complete.
- 2026-04-22: Normalized multiplayer snapshot typing after protocol integration and re-verified test suite (2 files, 9 tests passing).
- 2026-04-22: Migrated `app/(shared)/game/friend/page.tsx` board/turn rendering to `matchSession` selectors with safe hook-state fallback; marked final TODO complete.
- 2026-04-22: Re-ran regression tests after friend screen migration; suite remains green (2 files, 9 tests).
- 2026-04-22: Expanded `matchSession` model/selectors and moved friend screen score/validMove/lastMove rendering to selector-backed path.

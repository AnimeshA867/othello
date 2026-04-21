# State Layer

This folder is the bridge between network events and UI rendering.

Planned responsibilities:

- Normalize authoritative server snapshots/events.
- Keep ephemeral UI state separate from domain game state.
- Expose selectors for board, turn, and sync health.

Current implementation still uses existing Redux slices under lib/redux.

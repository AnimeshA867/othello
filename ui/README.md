# UI Layer

This folder is reserved for presentation-only hooks/components.

Rules:

- No game-rule evaluation here.
- No WebSocket protocol parsing here.
- Consume data from state selectors and dispatch intents only.

Current implementation still uses existing app/components/hooks folders while migration is in progress.

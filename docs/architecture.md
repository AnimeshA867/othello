# Othello Game Architecture

This document provides a comprehensive overview of the architecture and design decisions of the Othello game application.

## Table of Contents

- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Architecture Layers](#architecture-layers)
- [Data Flow](#data-flow)
- [Key Design Decisions](#key-design-decisions)

## System Architecture

### High-Level Overview

The application follows a client-server architecture with three main components:

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │         Next.js App (React + TypeScript)               │  │
│  │  • Server-Side Rendering (SSR)                         │  │
│  │  • Client-Side Routing                                 │  │
│  │  • React Components + Hooks                            │  │
│  │  • Redux for State Management                          │  │
│  │  • Tailwind CSS for Styling                            │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────┬───────────────────┬───────────────────┘
                       │                   │
                       ▼                   ▼
          ┌─────────────────────┐  ┌──────────────────┐
          │   REST API Layer    │  │  WebSocket Layer │
          │  (Next.js Routes)   │  │  (ws://port:3003)│
          │                     │  │                  │
          │  • /api/games/*     │  │  • Room mgmt     │
          │  • /api/friends/*   │  │  • Real-time     │
          │  • /api/profile/*   │  │    moves         │
          │  • /api/leaderboard │  │  • Chat          │
          └──────────┬──────────┘  └────────┬─────────┘
                     │                      │
                     └──────────┬───────────┘
                                ▼
                    ┌─────────────────────┐
                    │   DATABASE LAYER    │
                    │   PostgreSQL        │
                    │   (via Prisma ORM)  │
                    │                     │
                    │  • User data        │
                    │  • Game records     │
                    │  • Achievements     │
                    │  • Friendships      │
                    └─────────────────────┘
```

## Project Structure

### Directory Organization

```
othello-v2/v2/
│
├── app/                          # Next.js 15 App Router
│   ├── (shared)/                 # Shared layout group
│   │   └── game/                 # Game pages
│   │       ├── ai/               # AI game mode
│   │       ├── friend/           # Friend game mode
│   │       └── ranked/           # Ranked game mode
│   ├── api/                      # API route handlers
│   │   ├── achievements/         # Achievement endpoints
│   │   ├── friends/              # Friend system endpoints
│   │   ├── games/                # Game management endpoints
│   │   ├── leaderboard/          # Leaderboard endpoints
│   │   └── profile/              # User profile endpoints
│   ├── auth/                     # Authentication pages
│   │   ├── signin/
│   │   └── signup/
│   ├── handler/[...stack]/       # Stack Auth handler
│   ├── leaderboard/              # Leaderboard page
│   ├── profile/                  # Profile page
│   ├── settings/                 # Settings page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
│
├── components/                   # Reusable React components
│   ├── ui/                       # UI primitives (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── auth-provider.tsx         # Auth context provider
│   ├── chat-box.tsx              # In-game chat component
│   ├── game-info.tsx             # Game information display
│   ├── navbar.tsx                # Navigation bar
│   ├── othello-board.tsx         # Main game board component
│   └── ...
│
├── hooks/                        # Custom React hooks
│   ├── use-othello-game.ts       # Core game logic hook
│   ├── use-multiplayer-game.ts   # Multiplayer game hook
│   ├── use-ranked-multiplayer-game.ts  # Ranked game hook
│   ├── use-websocket-game.ts     # WebSocket connection hook
│   ├── use-user-sync.ts          # User data sync hook
│   └── use-toast.ts              # Toast notifications hook
│
├── lib/                          # Core libraries and utilities
│   ├── redux/                    # Redux store configuration
│   │   ├── store.ts              # Redux store setup
│   │   ├── hooks.ts              # Typed Redux hooks
│   │   ├── slices/               # Redux slices
│   │   └── StoreProvider.tsx     # Redux provider component
│   ├── othello-game.ts           # Game logic class
│   ├── prisma.ts                 # Prisma client singleton
│   ├── stack.ts                  # Stack Auth configuration
│   ├── config.ts                 # App configuration
│   └── utils.ts                  # Utility functions
│
├── server/                       # WebSocket server
│   ├── index.ts                  # Server entry point
│   ├── enhancedWebSocketServer.ts  # WebSocket server implementation
│   └── controllers/
│       └── roomController.ts     # Room management logic
│
├── shared/                       # Shared code (client/server)
│   └── gameLogic.ts              # Shared game logic
│
├── prisma/                       # Database schema and migrations
│   ├── schema.prisma             # Prisma schema definition
│   ├── seed-achievements.ts      # Achievement seeding script
│   └── migrations/               # Database migrations
│
├── public/                       # Static assets
│   ├── sounds/                   # Game sound effects
│   └── manifest.json             # PWA manifest
│
├── docs/                         # Documentation
│   ├── README.md                 # Documentation index
│   ├── architecture.md           # This file
│   ├── setup.md                  # Setup instructions
│   └── features.md               # Features documentation
│
└── Configuration files
    ├── next.config.mjs           # Next.js configuration
    ├── tailwind.config.ts        # Tailwind CSS configuration
    ├── tsconfig.json             # TypeScript configuration
    ├── docker-compose.yml        # Docker Compose setup
    └── Dockerfile                # Docker image definition
```

## Technology Stack

### Frontend Technologies

- **Next.js 15**: React framework with App Router, SSR, and API routes
- **React 19**: UI library with hooks and server components
- **TypeScript**: Static type checking for improved developer experience
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Redux Toolkit**: State management for complex application state
- **shadcn/ui**: High-quality, accessible UI components

### Backend Technologies

- **Node.js**: JavaScript runtime for server-side code
- **WebSocket (ws)**: Real-time bidirectional communication
- **Prisma ORM**: Type-safe database client and migration tool
- **Stack Auth**: Modern authentication solution
- **PostgreSQL**: Relational database for persistent storage

### Development & Deployment

- **Docker**: Containerization for consistent environments
- **Docker Compose**: Multi-container orchestration
- **ESLint**: Code linting and quality checks
- **Vercel**: Deployment platform (optional)

## Architecture Layers

### 1. Presentation Layer (Frontend)

**Responsibilities:**

- Render UI components
- Handle user interactions
- Manage client-side state
- Communicate with backend APIs

**Key Components:**

- React components in `/components`
- Pages in `/app`
- Custom hooks in `/hooks`
- Redux store in `/lib/redux`

### 2. API Layer (Backend Services)

**Responsibilities:**

- Handle HTTP requests
- Validate input data
- Authenticate users
- Perform business logic
- Return JSON responses

**Implementation:**

- Next.js API routes in `/app/api`
- Server-side validation
- Database operations via Prisma

### 3. Real-Time Layer (WebSocket Server)

**Responsibilities:**

- Manage WebSocket connections
- Handle real-time game moves
- Broadcast updates to connected clients
- Manage game rooms

**Implementation:**

- Standalone WebSocket server in `/server`
- Room-based architecture
- Event-driven communication

### 4. Data Layer (Database)

**Responsibilities:**

- Persist application data
- Maintain data integrity
- Support complex queries
- Handle transactions

**Implementation:**

- PostgreSQL database
- Prisma ORM for type-safe queries
- Migration-based schema management

## Data Flow

### Single Player Game Flow

```
User Action → Component Event → Hook (use-othello-game.ts) →
Game Logic (othello-game.ts) → State Update → UI Re-render
```

### Multiplayer Game Flow

```
User Action → Component Event → Hook (use-multiplayer-game.ts) →
WebSocket Message → Server (enhancedWebSocketServer.ts) →
Broadcast to Opponent → Opponent UI Update
```

### API Request Flow

```
Component → API Call (fetch) → API Route (/app/api/*) →
Prisma Query → Database → Response → UI Update
```

## Key Design Decisions

### 1. Separation of Game Logic

The core Othello game logic (`lib/othello-game.ts`) is completely decoupled from the UI, making it:

- Testable in isolation
- Reusable across different game modes
- Easy to maintain and extend

### 2. WebSocket Server Separation

The WebSocket server runs as a separate process to:

- Scale independently from the Next.js app
- Handle long-lived connections efficiently
- Avoid blocking the main application

### 3. Redux for Complex State

Redux is used for global state management to:

- Manage user authentication state
- Handle multiplayer game state
- Synchronize data across components

### 4. Prisma ORM

Prisma provides:

- Type-safe database queries
- Automatic migrations
- Great developer experience with auto-completion

### 5. Component-First Design

UI is built with reusable, composable components following:

- Single Responsibility Principle
- Props-based configuration
- Consistent styling with Tailwind

---

**Related Documentation:**

- [Setup Guide](./setup.md)
- [Features Overview](./features.md)
- [Database Schema](#) _(Coming Soon)_
- [API Reference](#) _(Coming Soon)_

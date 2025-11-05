# Othello Game Documentation

Welcome to the Othello Game documentation! This guide will help you understand, set up, and contribute to the project.

## 📑 Table of Contents

### Getting Started

- [Setup and Installation](./setup.md) - Get the project running locally
- [Quick Start Guide](#) - _Coming Soon_
- [Troubleshooting](#) - _Coming Soon_

### Architecture & Design

- [System Architecture](./architecture.md) - High-level overview of the project structure
- [Database Schema](#) - _Coming Soon_
- [WebSocket Architecture](#) - _Coming Soon_
- [State Management](#) - _Coming Soon_

### Features & Functionality

- [Features Overview](./features.md) - Complete list of features
- [Game Logic](#) - _Coming Soon_
- [Multiplayer System](#) - _Coming Soon_
- [AI Implementation](#) - _Coming Soon_

### API Reference

- [REST API Documentation](#) - _Coming Soon_
- [WebSocket Events](#) - _Coming Soon_
- [Database Models](#) - _Coming Soon_

### Components & Hooks

- [Component Library](#) - _Coming Soon_
- [Custom Hooks](#) - _Coming Soon_

### User Guides

- [User Journeys](#) - _Coming Soon_
- [Authentication Flow](#) - _Coming Soon_

### Development

- [Contributing Guidelines](#) - _Coming Soon_
- [Deployment Guide](#) - _Coming Soon_

## 🎯 Project Overview

This is a full-stack Othello (Reversi) game built with modern web technologies. The application features:

- **Single Player**: Play against AI with multiple difficulty levels
- **Multiplayer**: Real-time online matches via WebSocket
- **Ranked System**: Competitive ranked matches with ELO rating
- **Social Features**: Friends, chat, achievements, and leaderboards

## 🏗️ Quick Architecture Overview

```
┌─────────────────┐
│   Next.js App   │  ← Frontend (React, TypeScript, Tailwind)
│   (Port 3000)   │
└────────┬────────┘
         │
         ├─────────────────────────────────────┐
         │                                     │
         ▼                                     ▼
┌─────────────────┐                  ┌─────────────────┐
│  REST API       │                  │  WebSocket      │
│  (/app/api)     │                  │  Server         │
│                 │                  │  (Port 3003)    │
└────────┬────────┘                  └────────┬────────┘
         │                                     │
         └─────────────────┬───────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │   PostgreSQL    │
                  │   (via Prisma)  │
                  └─────────────────┘
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, WebSocket (ws)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Stack Auth
- **Deployment**: Docker, Docker Compose

## 📝 Documentation Status

This documentation is actively being developed. Items marked with "_Coming Soon_" are planned for future updates.

---

**Last Updated**: November 5, 2025

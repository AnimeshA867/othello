# Othello Game

A modern, beautifully designed Othello (Reversi) game built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **AI Gameplay**: Play against intelligent AI with three difficulty levels (Easy, Medium, Hard)
- **Modern UI**: Beautiful dark theme with smooth animations and glass morphism effects
- **3D Pieces**: Enhanced visual experience with 3D game pieces (when available)
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Smooth Animations**: Satisfying piece flip animations and visual feedback

## Upcoming Features

- **Multiplayer Mode**: Real-time peer-to-peer gameplay (coming soon)
- **Room System**: Create private rooms and invite friends
- **Spectator Mode**: Watch ongoing games
- **Chat System**: Communicate with opponents

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Game Rules

Othello is a strategy board game for two players, played on an 8×8 board with discs that are black on one side and white on the other.

1. Players take turns placing discs with their color facing up
2. Valid moves must outflank (surround) opponent's discs
3. Outflanked discs are flipped to the current player's color
4. The game ends when no valid moves remain
5. The player with the most discs wins

## Technology Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations
- **Three.js**: 3D graphics (for enhanced pieces)
- **Lucide React**: Beautiful icons

## Project Structure

```
├── app/                 # Next.js app directory
│   ├── game/           # Game pages
│   │   ├── ai/         # AI game mode
│   │   └── friend/     # Multiplayer mode (coming soon)
├── components/         # React components
│   ├── ui/            # Reusable UI components
│   └── ...            # Game-specific components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and game logic
└── server/            # WebSocket server (for future multiplayer)
```

## Development

To contribute to this project:

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) to see the result

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Tailwind CSS](https://tailwindcss.com/docs) - utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - animation library for React

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

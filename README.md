# Othello Game

This is a classic Othello (Reversi) game with a modern twist, built with Next.js, TypeScript, and a real-time multiplayer backend.

## Features

- **Single Player vs. Bot**: Play against an AI opponent with adjustable difficulty levels.
- **Multiplayer (Online)**: Challenge other players in real-time online matches.
- **Ranked Multiplayer**: Compete in ranked matches to climb the leaderboard.
- **User Authentication**: Secure sign-up and sign-in functionality.
- **User Profiles**: View user profiles with game statistics and achievements.
- **Leaderboard**: Global leaderboard to track top players.
- **In-game Chat**: Communicate with your opponent during a match.

For a full list of features, see the [features documentation](./docs/features.md).

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, WebSocket
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Deployment**: Docker, Vercel (or similar)

For more details, see the [architecture documentation](./docs/architecture.md).

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Docker and Docker Compose

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/your_username/othello-v2.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```
3.  Set up your environment variables by copying `.env.example` to `.env` and filling in the required values.
4.  Start the database with Docker
    ```sh
    docker-compose up -d
    ```
5.  Run database migrations
    ```sh
    npx prisma migrate dev
    ```
6.  Start the development server
    ```sh
    npm run dev
    ```

For more detailed setup instructions, see the [setup documentation](./docs/setup.md).

## Project Structure

The project follows a standard Next.js 13 `app` directory structure.

- `app/`: Contains all the routes, pages, and layouts.
- `components/`: Shared React components.
- `lib/`: Helper functions and core logic.
- `server/`: WebSocket server for real-time communication.
- `prisma/`: Database schema and migrations.

For a more detailed breakdown, see the [architecture documentation](./docs/architecture.md).

## License

Distributed under the MIT License. See `LICENSE` for more information.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

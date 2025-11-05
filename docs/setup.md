# Setup and Installation Guide

This guide will walk you through setting up the Othello game application on your local machine for development and testing.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation Steps](#installation-steps)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Docker Setup](#docker-setup)
- [Verification](#verification)
- [Common Issues](#common-issues)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

| Software            | Minimum Version | Purpose                       |
| ------------------- | --------------- | ----------------------------- |
| **Node.js**         | v18.0.0+        | JavaScript runtime            |
| **npm** or **yarn** | Latest          | Package manager               |
| **Docker**          | Latest          | Container runtime             |
| **Docker Compose**  | Latest          | Multi-container orchestration |
| **Git**             | Latest          | Version control               |

### Optional Software

- **PostgreSQL** (if not using Docker)
- **VS Code** (recommended IDE)
- **Postman** or **Thunder Client** (for API testing)

### System Requirements

- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **OS**: Windows 10+, macOS 10.15+, or Linux

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/AnimeshA867/othello.git
cd othello-v2/v2
```

Or if you're using SSH:

```bash
git clone git@github.com:AnimeshA867/othello.git
cd othello-v2/v2
```

### 2. Install Dependencies

Using npm:

```bash
npm install
```

Using yarn:

```bash
yarn install
```

This will install all required packages including:

- Next.js and React
- Prisma and database drivers
- TypeScript and type definitions
- UI libraries and utilities

**Expected time:** 2-5 minutes depending on your internet connection

## Environment Configuration

### 3. Set Up Environment Variables

Create a `.env` file in the root directory by copying the example:

```bash
# On Windows (PowerShell)
copy env.example .env

# On macOS/Linux
cp env.example .env
```

### 4. Configure Environment Variables

Open the `.env` file and configure the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# Stack Auth Configuration (Authentication)
NEXT_PUBLIC_STACK_PROJECT_ID="your_stack_project_id"
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="your_publishable_key"
STACK_SECRET_SERVER_KEY="your_secret_key"

# WebSocket Server Configuration
NEXT_PUBLIC_WS_URL="ws://localhost:3003"
PORT=3003

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Node Environment
NODE_ENV="development"
```

### Environment Variable Details

| Variable                                   | Description                           | Example                                                      |
| ------------------------------------------ | ------------------------------------- | ------------------------------------------------------------ |
| `DATABASE_URL`                             | PostgreSQL connection string          | `postgresql://postgres:password@localhost:5432/othello`      |
| `NEXT_PUBLIC_STACK_PROJECT_ID`             | Stack Auth project identifier         | Get from [Stack Auth Dashboard](https://app.stack-auth.com/) |
| `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` | Stack Auth public key                 | Get from Stack Auth Dashboard                                |
| `STACK_SECRET_SERVER_KEY`                  | Stack Auth secret key (keep private!) | Get from Stack Auth Dashboard                                |
| `NEXT_PUBLIC_WS_URL`                       | WebSocket server URL                  | `ws://localhost:3003` (dev)                                  |
| `PORT`                                     | WebSocket server port                 | `3003`                                                       |

## Database Setup

### Option 1: Using Docker (Recommended)

#### 5. Start PostgreSQL with Docker Compose

```bash
docker-compose up -d
```

This will:

- Pull the PostgreSQL Docker image
- Create a database container
- Expose PostgreSQL on port 5432
- Set up the database with credentials from `.env`

Verify the database is running:

```bash
docker ps
```

You should see a container with the PostgreSQL image.

#### 6. Run Database Migrations

Apply the database schema:

```bash
npx prisma migrate dev
```

This will:

- Create all necessary tables
- Set up relationships
- Apply any pending migrations
- Generate Prisma Client

#### 7. Seed the Database (Optional)

Populate the database with initial data:

```bash
npx prisma db seed
```

This will add:

- Default achievements
- Sample data for testing

### Option 2: Using Local PostgreSQL

If you have PostgreSQL installed locally:

1. Create a new database:

```sql
CREATE DATABASE othello;
```

2. Update `DATABASE_URL` in `.env` with your credentials

3. Run migrations:

```bash
npx prisma migrate dev
```

## Running the Application

### 8. Start the Development Server

You need to run **two** servers:

#### Terminal 1: Next.js Application

```bash
npm run dev
```

This starts the Next.js app on `http://localhost:3000`

#### Terminal 2: WebSocket Server

```bash
npm run server
```

Or:

```bash
node server/index.ts
```

This starts the WebSocket server on `ws://localhost:3003`

### Alternative: Using Separate Commands

In your `package.json`, you can add a script to run both:

```json
"scripts": {
  "dev": "next dev",
  "server": "node server/index.ts",
  "dev:all": "concurrently \"npm run dev\" \"npm run server\""
}
```

Then run:

```bash
npm run dev:all
```

## Docker Setup

### Running Everything with Docker

To run the entire application stack with Docker:

```bash
docker-compose up --build
```

This will:

- Build the Next.js application
- Start the WebSocket server
- Start PostgreSQL
- Set up networking between containers

Access the application at `http://localhost:3000`

### Stop Docker Containers

```bash
docker-compose down
```

To remove volumes (database data):

```bash
docker-compose down -v
```

## Verification

### Check if Everything is Running

1. **Next.js App**: Open `http://localhost:3000` in your browser
   - You should see the home page
2. **WebSocket Server**: Check the terminal
   - You should see: `WebSocket server attached to HTTP server`
3. **Database**: Run Prisma Studio
   ```bash
   npx prisma studio
   ```
   - Opens at `http://localhost:5555`
   - You should see your database tables

### Test Basic Functionality

1. **Sign Up**: Create a new account
2. **Play AI Game**: Start a game against the bot
3. **Check Profile**: View your user profile
4. **View Leaderboard**: Check the leaderboard page

## Common Issues

### Issue: Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**

```bash
# Find and kill the process using port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Issue: Database Connection Failed

**Error:** `Can't reach database server`

**Solution:**

1. Check if PostgreSQL is running: `docker ps`
2. Verify `DATABASE_URL` in `.env`
3. Ensure the database exists
4. Check firewall settings

### Issue: Prisma Client Not Generated

**Error:** `Cannot find module '@prisma/client'`

**Solution:**

```bash
npx prisma generate
```

### Issue: WebSocket Connection Failed

**Error:** `WebSocket connection to 'ws://localhost:3003' failed`

**Solution:**

1. Ensure WebSocket server is running
2. Check `NEXT_PUBLIC_WS_URL` in `.env`
3. Verify port 3003 is not blocked

### Issue: Missing Environment Variables

**Error:** Various errors about undefined variables

**Solution:**

1. Ensure `.env` file exists in the root directory
2. Verify all required variables are set
3. Restart the development server

### Issue: Stack Auth Configuration

**Error:** Authentication not working

**Solution:**

1. Create a project at [Stack Auth](https://app.stack-auth.com/)
2. Copy your project keys to `.env`
3. Configure allowed origins in Stack Auth dashboard

## Next Steps

After successful setup:

1. **Explore the Code**: Check out the [Architecture Documentation](./architecture.md)
2. **Learn Features**: Read the [Features Guide](./features.md)
3. **Start Developing**: Make your first code change
4. **Run Tests**: (if tests are available)
5. **Read API Docs**: Understand the API endpoints

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Stack Auth Documentation](https://docs.stack-auth.com/)
- [Docker Documentation](https://docs.docker.com/)

---

**Need Help?** Check the [Troubleshooting Guide](#) or open an issue on GitHub.

**Related Documentation:**

- [Architecture Overview](./architecture.md)
- [Features Guide](./features.md)
- [API Reference](#) _(Coming Soon)_

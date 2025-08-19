FROM node:20-alpine as builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build TypeScript files
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared

# Set environment variables
ENV NODE_ENV=production
ENV PORT=10000

# Expose the port the WebSocket server runs on
EXPOSE 10000

# Command to run the server
CMD ["npm", "run", "start:server"]

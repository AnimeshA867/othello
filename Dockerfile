FROM node:20-alpine AS base

WORKDIR /app
COPY package*.json ./

FROM base AS deps
RUN npm install

FROM deps AS backend-dev
COPY tsconfig.server.json ./
COPY server ./server
COPY shared ./shared
COPY core ./core
ENV NODE_ENV=development
ENV PORT=3003
EXPOSE 3003
CMD ["npm", "run", "start:server"]

FROM deps AS backend-build
COPY tsconfig.server.json ./
COPY server ./server
COPY shared ./shared
COPY core ./core
RUN npm run build:server

FROM node:20-alpine AS backend-prod
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=backend-build /app/dist ./dist
ENV NODE_ENV=production
ENV PORT=3003
EXPOSE 3003
CMD ["node", "dist/server/index.js"]

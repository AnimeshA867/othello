FROM oven/bun:slim as deps 
WORKDIR /app
COPY package*.json .
RUN bun install --frozen-lockfile


FROM deps as dev
COPY . . 
EXPOSE 3000
CMD ["bun", "run", "dev"]

FROM deps as prod
COPY . .
RUN bun run build
EXPOSE 3000
CMD ["bun", "run", "start"]
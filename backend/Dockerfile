FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies (cached layer)
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production

# Copy source code
COPY src/ ./src/
COPY tsconfig.json ./

# Railway sets PORT dynamically via env var
ENV NODE_ENV=production
EXPOSE ${PORT:-3002}

CMD ["bun", "run", "src/index.ts"]

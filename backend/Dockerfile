FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production

# Copy source code
COPY . .

# Railway sets PORT dynamically
EXPOSE 3002

CMD ["bun", "run", "src/index.ts"]

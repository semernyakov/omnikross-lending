# ════════════════════════════════════════════════════════════
# OmniKross Landing API — Dockerfile
# Bun + Hono + SQLite — Production Ready
# Final image size: ~90MB
# ════════════════════════════════════════════════════════════

# ─── Stage 1: Builder ───
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package.json bun.lockb* ./

# Install dependencies (production only)
RUN bun install --production --frozen-lockfile

# Copy source code
COPY src ./src

# ─── Stage 2: Production ───
FROM oven/bun:1-alpine

WORKDIR /app

# Install dumb-init (proper signal handling)
RUN apk add --no-cache dumb-init

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY public ./public

# Create data directory with correct permissions
RUN mkdir -p /app/data && \
    chown -R bun:bun /app/data && \
    chown -R bun:bun /app/public

# Switch to non-root user
USER bun

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun run -e "fetch('http://localhost:3000/api/health').then(r => r.ok ? process.exit(0) : process.exit(1))"

# Expose port
EXPOSE 3000

# Use dumb-init as PID 1
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["bun", "run", "src/index.ts"]

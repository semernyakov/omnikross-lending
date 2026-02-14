# ════════════════════════════════════════════════════════════
# OmniKross Landing API — Dockerfile
# Bun + Hono + SQLite — Production Ready
# Final image size: ~90MB
# ════════════════════════════════════════════════════════════

# ─── Stage 1: Base Image ───
FROM oven/bun:1-alpine

WORKDIR /app

# Copy application files
COPY package.json bun.lock ./
COPY src ./src
COPY public ./public

# Install dependencies in container
RUN bun install --frozen-lockfile

# Create and set ownership of data directory
RUN mkdir -p /app/data && \
    chown -R bun:bun /app/data && \
    chown -R bun:bun /app/public

# Switch to non-root user
USER bun

# Health check using Bun's built-in fetch
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD bun -e "fetch('http://localhost:3000/api/health').then(() => process.exit(0)).catch(() => process.exit(1))"

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV TZ=Europe/Moscow

# Start application with graceful shutdown support
CMD ["bun", "run", "src/index.ts"]

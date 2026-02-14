# ════════════════════════════════════════════════════════════
# OmniKross Landing API — Dockerfile
# Bun + Hono + SQLite — Production Ready
# Final image size: ~90MB
# ════════════════════════════════════════════════════════════

# ─── Stage 1: Base Image ───
FROM oven/bun:1-alpine

WORKDIR /app

# Install curl for health checks and debugging
RUN apk add --no-cache curl

# Copy application files
COPY package.json ./
COPY src ./src
COPY public ./public

# Copy local node_modules (optional - will fail gracefully if not present)
COPY --chown=bun:bun node_modules/ ./node_modules/

# Create and set ownership of data directory
RUN mkdir -p /app/data && \
    chown -R bun:bun /app/data && \
    chown -R bun:bun /app/public

# Switch to non-root user
USER bun

# Health check using curl (more reliable than fetch)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV TZ=Europe/Moscow

# Start application with graceful shutdown support
CMD ["bun", "run", "src/index.ts"]

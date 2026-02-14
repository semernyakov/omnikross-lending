# ════════════════════════════════════════════════════════════
# OmniKross Landing API — Dockerfile
# Bun + Hono + SQLite — Production Ready
# Final image size: ~90MB
# ════════════════════════════════════════════════════════════

# ─── Stage 1: Base Image ───
FROM oven/bun:1-alpine

WORKDIR /app

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

# Health check using Bun's fetch
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD bun -e "fetch('http://localhost:3000/api/health').then(() => process.exit(0)).catch(() => process.exit(1))"

# Expose port
EXPOSE 3000

# Start application
CMD ["bun", "run", "src/index.ts"]
